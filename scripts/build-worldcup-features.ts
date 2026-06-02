import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CsvRow = Record<string, string>;

type ValidationResult = {
  file: string;
  sourceUrl: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  primaryKey: string[];
  primaryKeyUnique: boolean;
  missingRequiredColumns: string[];
  emptyRequiredValues: Record<string, number>;
  relationships: RelationshipValidation[];
  byteSize: number;
};

type RelationshipValidation = {
  name: string;
  field: string;
  references: string;
  missingReferenceCount: number;
};

type DatasetSpec = {
  file: string;
  sourceUrl: string;
  requiredColumns: string[];
  primaryKey: string[];
};

type NormalizedTeam = {
  normalized_team_id: string;
  normalized_team_name: string;
  normalized_team_code: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const rawDir = path.join(projectRoot, "data/worldcup/raw");
const processedDir = path.join(projectRoot, "data/worldcup/processed");

const accessedDate = "2026-06-02";

const datasetSpecs: DatasetSpec[] = [
  {
    file: "tournaments.csv",
    sourceUrl: "https://datahub.io/football/worldcup/_r/-/tournaments.csv",
    requiredColumns: ["tournament_id", "tournament_name", "year", "winner", "count_teams"],
    primaryKey: ["tournament_id"],
  },
  {
    file: "teams.csv",
    sourceUrl: "https://datahub.io/football/worldcup/_r/-/teams.csv",
    requiredColumns: ["team_id", "team_name", "team_code", "confederation_code"],
    primaryKey: ["team_id"],
  },
  {
    file: "matches.csv",
    sourceUrl: "https://datahub.io/football/worldcup/_r/-/matches.csv",
    requiredColumns: [
      "match_id",
      "tournament_id",
      "home_team_id",
      "away_team_id",
      "home_team_score",
      "away_team_score",
    ],
    primaryKey: ["match_id"],
  },
  {
    file: "tournament_standings.csv",
    sourceUrl: "https://datahub.io/football/worldcup/_r/-/tournament_standings.csv",
    requiredColumns: ["tournament_id", "position", "team_id", "team_name"],
    primaryKey: ["tournament_id", "position"],
  },
  {
    file: "qualified_teams.csv",
    sourceUrl: "https://datahub.io/football/worldcup/_r/-/qualified_teams.csv",
    requiredColumns: ["tournament_id", "team_id", "team_name", "count_matches", "performance"],
    primaryKey: ["tournament_id", "team_id"],
  },
];

const stageFinishEstimates: Record<string, number> = {
  final: 2,
  "third-place match": 4,
  "semi-finals": 4,
  "quarter-finals": 8,
  "round of 16": 16,
  "second group stage": 12,
  "final round": 6,
  "group stage": 24,
};

const teamNormalizationRules: Record<string, NormalizedTeam> = {
  "T-86": {
    normalized_team_id: "N-DEU",
    normalized_team_name: "Germany",
    normalized_team_code: "DEU",
  },
  "T-31": {
    normalized_team_id: "N-DEU",
    normalized_team_name: "Germany",
    normalized_team_code: "DEU",
  },
  "T-72": {
    normalized_team_id: "N-RUS",
    normalized_team_name: "Russia",
    normalized_team_code: "RUS",
  },
  "T-62": {
    normalized_team_id: "N-RUS",
    normalized_team_name: "Russia",
    normalized_team_code: "RUS",
  },
  "T-87": {
    normalized_team_id: "N-SRB",
    normalized_team_name: "Serbia",
    normalized_team_code: "SRB",
  },
  "T-67": {
    normalized_team_id: "N-SRB",
    normalized_team_name: "Serbia",
    normalized_team_code: "SRB",
  },
  "T-66": {
    normalized_team_id: "N-SRB",
    normalized_team_name: "Serbia",
    normalized_team_code: "SRB",
  },
  "T-88": {
    normalized_team_id: "N-COD",
    normalized_team_name: "DR Congo",
    normalized_team_code: "COD",
  },
};

function normalizeTeam(row: CsvRow): NormalizedTeam {
  return (
    teamNormalizationRules[row.team_id] ?? {
      normalized_team_id: `N-${row.team_code}`,
      normalized_team_name: row.team_name,
      normalized_team_code: row.team_code,
    }
  );
}

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentField += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentField);
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentField = "";
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  const [headers, ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])),
  );
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        const text = String(value);
        return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
      })
      .join(","),
  );

  return [headers.join(","), ...lines].join("\n") + "\n";
}

function toInventoryMarkdown(inventory: ValidationResult[]): string {
  const rows = inventory
    .map((item) => {
      const relationshipFailures =
        item.relationships
          .filter((relationship) => relationship.missingReferenceCount > 0)
          .map((relationship) => `${relationship.name}: ${relationship.missingReferenceCount}`)
          .join("; ") || "none";
      const missingColumns = item.missingRequiredColumns.join("; ") || "none";

      return `| ${item.file} | ${item.rowCount} | ${item.columnCount} | ${item.primaryKey.join(" + ")} | ${item.primaryKeyUnique ? "yes" : "no"} | ${missingColumns} | ${relationshipFailures} |`;
    })
    .join("\n");

  return `# World Cup Data Inventory

Generated by \`npm run build:features\`.

Date accessed: ${accessedDate}

| File | Rows | Columns | Primary key | PK unique | Missing required columns | Relationship failures |
| --- | ---: | ---: | --- | --- | --- | --- |
${rows}

## Relationships checked

- \`matches.tournament_id\` -> \`tournaments.tournament_id\`
- \`matches.home_team_id\` -> \`teams.team_id\`
- \`matches.away_team_id\` -> \`teams.team_id\`
- \`tournament_standings.tournament_id\` -> \`tournaments.tournament_id\`
- \`tournament_standings.team_id\` -> \`teams.team_id\`
- \`qualified_teams.tournament_id\` -> \`tournaments.tournament_id\`
- \`qualified_teams.team_id\` -> \`teams.team_id\`
`;
}

function toHistoricalStrengthModule(rows: Record<string, unknown>[]): string {
  return `export type HistoricalStrengthTeam = {
  rank: number;
  team_id: string;
  team_name: string;
  team_code: string;
  confederation_code: string;
  historical_strength_score: number;
  world_cup_appearances: number;
  titles: number;
  finals_appearances: number;
  semi_final_appearances: number;
  win_rate: number;
  goals_scored: number;
  goals_conceded: number;
  best_finish_label: string;
  average_finish_position_estimate: number;
  appearances_score: number;
  titles_score: number;
  finals_score: number;
  semi_finals_score: number;
  win_rate_score: number;
};

export const historicalStrengthFormula =
  "0.30 * appearances_score + 0.25 * titles_score + 0.20 * finals_score + 0.15 * semi_finals_score + 0.10 * win_rate_score";

export const historicalStrengthTeams = ${JSON.stringify(rows, null, 2)} satisfies HistoricalStrengthTeam[];
`;
}

function numberValue(row: CsvRow, key: string): number {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function isWinForTeam(match: CsvRow, teamId: string): boolean {
  if (match.penalty_shootout === "1") {
    return false;
  }

  return (
    (match.home_team_id === teamId && match.home_team_win === "1") ||
    (match.away_team_id === teamId && match.away_team_win === "1")
  );
}

function scaleByMax(value: number, max: number): number {
  return max > 0 ? Number(((value / max) * 100).toFixed(2)) : 0;
}

function deriveTournamentGender(tournamentName: string): "men" | "women" {
  return tournamentName.includes("Women's") ? "women" : "men";
}

function primaryKeyValue(row: CsvRow, keys: string[]): string {
  return keys.map((key) => row[key]).join("::");
}

function validateRelationships(
  file: string,
  rows: CsvRow[],
  lookup: Record<string, Set<string>>,
): RelationshipValidation[] {
  const relationships: RelationshipValidation[] = [];

  function check(name: string, field: string, references: string) {
    const referenceValues = lookup[references];
    const missingReferenceCount = rows.filter((row) => !referenceValues.has(row[field])).length;
    relationships.push({ name, field, references, missingReferenceCount });
  }

  if (file !== "tournaments.csv" && "tournament_id" in (rows[0] ?? {})) {
    check(`${file}.tournament_id -> tournaments.tournament_id`, "tournament_id", "tournaments.tournament_id");
  }

  if (file === "matches.csv") {
    check("matches.home_team_id -> teams.team_id", "home_team_id", "teams.team_id");
    check("matches.away_team_id -> teams.team_id", "away_team_id", "teams.team_id");
  }

  if (file === "tournament_standings.csv" || file === "qualified_teams.csv") {
    check(`${file}.team_id -> teams.team_id`, "team_id", "teams.team_id");
  }

  return relationships;
}

async function loadRawDatasets() {
  const entries = await Promise.all(
    datasetSpecs.map(async (spec) => {
      const filePath = path.join(rawDir, spec.file);
      const [content, stats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
      return [spec.file, { rows: parseCsv(content), stats }] as const;
    }),
  );

  return Object.fromEntries(entries);
}

function buildFeatureTables(raw: Awaited<ReturnType<typeof loadRawDatasets>>) {
  const tournaments = raw["tournaments.csv"].rows;
  const teams = raw["teams.csv"].rows;
  const matches = raw["matches.csv"].rows;
  const standings = raw["tournament_standings.csv"].rows;
  const qualifiedTeams = raw["qualified_teams.csv"].rows;

  const tournamentById = new Map(tournaments.map((row) => [row.tournament_id, row]));
  const teamById = new Map(teams.map((row) => [row.team_id, row]));
  const identityFor = (teamId: string, normalized: boolean): NormalizedTeam => {
    const team = teamById.get(teamId);
    if (!team) {
      return {
        normalized_team_id: normalized ? `N-${teamId}` : teamId,
        normalized_team_name: teamId,
        normalized_team_code: teamId,
      };
    }
    return normalized
      ? normalizeTeam(team)
      : {
          normalized_team_id: team.team_id,
          normalized_team_name: team.team_name,
          normalized_team_code: team.team_code,
        };
  };

  function buildTeamTournamentFeatures(normalized: boolean) {
    const standingByTeamTournament = new Map<string, CsvRow>();
    for (const standing of standings) {
      const identity = identityFor(standing.team_id, normalized);
      standingByTeamTournament.set(`${standing.tournament_id}::${identity.normalized_team_id}`, standing);
    }

    const matchStatsByTeamTournament = new Map<
      string,
      { matches: number; goalsScored: number; goalsConceded: number; wins: number }
    >();

    for (const match of matches) {
      const homeIdentity = identityFor(match.home_team_id, normalized);
      const awayIdentity = identityFor(match.away_team_id, normalized);
      const homeKey = `${match.tournament_id}::${homeIdentity.normalized_team_id}`;
      const awayKey = `${match.tournament_id}::${awayIdentity.normalized_team_id}`;
      const home = matchStatsByTeamTournament.get(homeKey) ?? {
        matches: 0,
        goalsScored: 0,
        goalsConceded: 0,
        wins: 0,
      };
      const away = matchStatsByTeamTournament.get(awayKey) ?? {
        matches: 0,
        goalsScored: 0,
        goalsConceded: 0,
        wins: 0,
      };
      const homeScore = numberValue(match, "home_team_score");
      const awayScore = numberValue(match, "away_team_score");

      matchStatsByTeamTournament.set(homeKey, {
        matches: home.matches + 1,
        goalsScored: home.goalsScored + homeScore,
        goalsConceded: home.goalsConceded + awayScore,
        wins: home.wins + (isWinForTeam(match, match.home_team_id) ? 1 : 0),
      });
      matchStatsByTeamTournament.set(awayKey, {
        matches: away.matches + 1,
        goalsScored: away.goalsScored + awayScore,
        goalsConceded: away.goalsConceded + homeScore,
        wins: away.wins + (isWinForTeam(match, match.away_team_id) ? 1 : 0),
      });
    }

    return qualifiedTeams.map((qualified) => {
      const tournament = tournamentById.get(qualified.tournament_id);
      const team = teamById.get(qualified.team_id);
      const identity = identityFor(qualified.team_id, normalized);
      const standing = standingByTeamTournament.get(
        `${qualified.tournament_id}::${identity.normalized_team_id}`,
      );
      const matchStats = matchStatsByTeamTournament.get(
        `${qualified.tournament_id}::${identity.normalized_team_id}`,
      ) ?? {
        matches: numberValue(qualified, "count_matches"),
        goalsScored: 0,
        goalsConceded: 0,
        wins: 0,
      };
      const resultPosition = standing ? numberValue(standing, "position") : null;
      const fallbackEstimate =
        stageFinishEstimates[qualified.performance] ?? numberValue(tournament ?? {}, "count_teams");
      const finishPositionEstimate = resultPosition ?? fallbackEstimate;
      const matchesPlayed = matchStats.matches || numberValue(qualified, "count_matches");

      return {
        tournament_id: qualified.tournament_id,
        tournament_name: qualified.tournament_name,
        year: numberValue(tournament ?? {}, "year"),
        tournament_gender: deriveTournamentGender(qualified.tournament_name),
        original_team_id: qualified.team_id,
        original_team_name: qualified.team_name,
        original_team_code: qualified.team_code,
        team_id: identity.normalized_team_id,
        team_name: identity.normalized_team_name,
        team_code: identity.normalized_team_code,
        confederation_code: team?.confederation_code ?? "",
        matches_played: matchesPlayed,
        wins: matchStats.wins,
        goals_scored: matchStats.goalsScored,
        goals_conceded: matchStats.goalsConceded,
        goals_scored_per_match: Number((matchStats.goalsScored / Math.max(matchesPlayed, 1)).toFixed(3)),
        goals_conceded_per_match: Number((matchStats.goalsConceded / Math.max(matchesPlayed, 1)).toFixed(3)),
        result_position: resultPosition,
        performance: qualified.performance,
        finish_position_estimate: finishPositionEstimate,
        title: resultPosition === 1 ? 1 : 0,
        final_appearance: resultPosition === 1 || resultPosition === 2 || qualified.performance === "final" ? 1 : 0,
        semi_final_appearance:
          resultPosition !== null && resultPosition <= 4
            ? 1
            : ["final", "third-place match", "semi-finals"].includes(qualified.performance)
              ? 1
              : 0,
      };
    });
  }

  function aggregateFeatureStore(teamTournamentFeatures: ReturnType<typeof buildTeamTournamentFeatures>) {
    const rowsByTeamGender = Map.groupBy(
      teamTournamentFeatures,
      (row) => `${row.team_id}::${row.tournament_gender}`,
    );

    return [...rowsByTeamGender.values()]
      .map((rows) => {
      const sortedByFinish = [...rows].sort(
        (a, b) => a.finish_position_estimate - b.finish_position_estimate,
      );
      const totalMatches = rows.reduce((sum, row) => sum + row.matches_played, 0);
      const totalWins = rows.reduce((sum, row) => sum + row.wins, 0);
      const totalGoalsScored = rows.reduce((sum, row) => sum + row.goals_scored, 0);
      const totalGoalsConceded = rows.reduce((sum, row) => sum + row.goals_conceded, 0);
      const appearances = rows.length;
      const first = rows[0];

      return {
        team_id: first.team_id,
        team_name: first.team_name,
        team_code: first.team_code,
        confederation_code: first.confederation_code,
        tournament_gender: first.tournament_gender,
        world_cup_appearances: appearances,
        titles: rows.reduce((sum, row) => sum + row.title, 0),
        finals_appearances: rows.reduce((sum, row) => sum + row.final_appearance, 0),
        semi_final_appearances: rows.reduce((sum, row) => sum + row.semi_final_appearance, 0),
        best_finish_position: sortedByFinish[0].finish_position_estimate,
        best_finish_label: sortedByFinish[0].result_position
          ? `position ${sortedByFinish[0].result_position}`
          : sortedByFinish[0].performance,
        average_finish_position_estimate: Number(
          (
            rows.reduce((sum, row) => sum + row.finish_position_estimate, 0) / Math.max(appearances, 1)
          ).toFixed(2),
        ),
        total_matches_played: totalMatches,
        total_wins: totalWins,
        goals_scored: totalGoalsScored,
        goals_conceded: totalGoalsConceded,
        win_rate: Number(((totalWins / Math.max(totalMatches, 1)) * 100).toFixed(2)),
        goals_scored_per_tournament: Number((totalGoalsScored / Math.max(appearances, 1)).toFixed(2)),
        goals_conceded_per_tournament: Number(
          (totalGoalsConceded / Math.max(appearances, 1)).toFixed(2),
        ),
        goals_scored_per_match: Number((totalGoalsScored / Math.max(totalMatches, 1)).toFixed(3)),
        goals_conceded_per_match: Number((totalGoalsConceded / Math.max(totalMatches, 1)).toFixed(3)),
      };
    })
    .sort((a, b) => {
      if (a.tournament_gender !== b.tournament_gender) {
        return a.tournament_gender.localeCompare(b.tournament_gender);
      }
      return b.world_cup_appearances - a.world_cup_appearances || a.team_name.localeCompare(b.team_name);
    });
  }

  function addHistoricalStrengthScores<T extends ReturnType<typeof aggregateFeatureStore>[number]>(
    rows: T[],
  ) {
    const mensRows = rows.filter((row) => row.tournament_gender === "men");
    const maxAppearances = Math.max(...mensRows.map((row) => row.world_cup_appearances));
    const maxTitles = Math.max(...mensRows.map((row) => row.titles));
    const maxFinals = Math.max(...mensRows.map((row) => row.finals_appearances));
    const maxSemis = Math.max(...mensRows.map((row) => row.semi_final_appearances));

    return rows.map((row) => {
      const appearancesScore = scaleByMax(row.world_cup_appearances, maxAppearances);
      const titlesScore = scaleByMax(row.titles, maxTitles);
      const finalsScore = scaleByMax(row.finals_appearances, maxFinals);
      const semisScore = scaleByMax(row.semi_final_appearances, maxSemis);
      const winRateScore = row.win_rate;
      const historicalStrengthScore =
        appearancesScore * 0.3 +
        titlesScore * 0.25 +
        finalsScore * 0.2 +
        semisScore * 0.15 +
        winRateScore * 0.1;

      return {
        ...row,
        appearances_score: appearancesScore,
        titles_score: titlesScore,
        finals_score: finalsScore,
        semi_finals_score: semisScore,
        win_rate_score: winRateScore,
        historical_strength_score: Number(historicalStrengthScore.toFixed(2)),
      };
    });
  }

  const unnormalizedTeamTournamentFeatures = buildTeamTournamentFeatures(false);
  const normalizedTeamTournamentFeatures = buildTeamTournamentFeatures(true);
  const unnormalizedTeamFeatureStore = addHistoricalStrengthScores(
    aggregateFeatureStore(unnormalizedTeamTournamentFeatures),
  );
  const normalizedTeamFeatureStore = addHistoricalStrengthScores(
    aggregateFeatureStore(normalizedTeamTournamentFeatures),
  );

  const historicalStrengthRankings = normalizedTeamFeatureStore
    .filter((row) => row.tournament_gender === "men")
    .sort(
      (a, b) =>
        b.historical_strength_score - a.historical_strength_score ||
        b.titles - a.titles ||
        b.finals_appearances - a.finals_appearances ||
        a.team_name.localeCompare(b.team_name),
    )
    .map((row, index) => ({
      rank: index + 1,
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
      confederation_code: row.confederation_code,
      historical_strength_score: row.historical_strength_score,
      world_cup_appearances: row.world_cup_appearances,
      titles: row.titles,
      finals_appearances: row.finals_appearances,
      semi_final_appearances: row.semi_final_appearances,
      win_rate: row.win_rate,
      goals_scored: row.goals_scored,
      goals_conceded: row.goals_conceded,
      best_finish_label: row.best_finish_label,
      average_finish_position_estimate: row.average_finish_position_estimate,
      appearances_score: row.appearances_score,
      titles_score: row.titles_score,
      finals_score: row.finals_score,
      semi_finals_score: row.semi_finals_score,
      win_rate_score: row.win_rate_score,
    }));

  const unnormalizedRankByTeam = new Map(
    unnormalizedTeamFeatureStore
      .filter((row) => row.tournament_gender === "men")
      .sort((a, b) => b.world_cup_appearances - a.world_cup_appearances || a.team_name.localeCompare(b.team_name))
      .map((row, index) => [row.team_name, index + 1]),
  );

  const normalizationComparison = normalizedTeamFeatureStore
    .filter((row) => row.tournament_gender === "men")
    .sort((a, b) => b.world_cup_appearances - a.world_cup_appearances || a.team_name.localeCompare(b.team_name))
    .map((row, index) => ({
      normalized_appearances_rank: index + 1,
      team_name: row.team_name,
      normalized_appearances: row.world_cup_appearances,
      unnormalized_rank_by_same_name: unnormalizedRankByTeam.get(row.team_name) ?? "",
      titles: row.titles,
      finals_appearances: row.finals_appearances,
      semi_final_appearances: row.semi_final_appearances,
      historical_strength_score: row.historical_strength_score,
    }));

  return {
    cleanedTournaments: tournaments.map((row) => ({
      tournament_id: row.tournament_id,
      tournament_name: row.tournament_name,
      year: numberValue(row, "year"),
      tournament_gender: deriveTournamentGender(row.tournament_name),
      start_date: row.start_date,
      end_date: row.end_date,
      host_country: row.host_country,
      winner: row.winner,
      count_teams: numberValue(row, "count_teams"),
    })),
    cleanedTeams: teams.map((row) => ({
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
      mens_team: numberValue(row, "mens_team"),
      womens_team: numberValue(row, "womens_team"),
      region_name: row.region_name,
      confederation_id: row.confederation_id,
      confederation_name: row.confederation_name,
      confederation_code: row.confederation_code,
    })),
    cleanedMatches: matches.map((row) => ({
      match_id: row.match_id,
      tournament_id: row.tournament_id,
      tournament_name: row.tournament_name,
      tournament_gender: deriveTournamentGender(row.tournament_name),
      match_date: row.match_date,
      stage_name: row.stage_name,
      home_team_id: row.home_team_id,
      home_team_name: row.home_team_name,
      away_team_id: row.away_team_id,
      away_team_name: row.away_team_name,
      home_team_score: numberValue(row, "home_team_score"),
      away_team_score: numberValue(row, "away_team_score"),
      extra_time: numberValue(row, "extra_time"),
      penalty_shootout: numberValue(row, "penalty_shootout"),
      result: row.result,
    })),
    cleanedTournamentResults: standings.map((row) => ({
      tournament_id: row.tournament_id,
      tournament_name: row.tournament_name,
      tournament_gender: deriveTournamentGender(row.tournament_name),
      position: numberValue(row, "position"),
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
    })),
    teamTournamentFeatures: unnormalizedTeamTournamentFeatures,
    teamFeatureStore: unnormalizedTeamFeatureStore,
    normalizedTeamTournamentFeatures,
    normalizedTeamFeatureStore,
    historicalStrengthRankings,
    normalizationComparison,
  };
}

async function main() {
  await mkdir(processedDir, { recursive: true });
  const raw = await loadRawDatasets();
  const lookup = {
    "tournaments.tournament_id": new Set(raw["tournaments.csv"].rows.map((row) => row.tournament_id)),
    "teams.team_id": new Set(raw["teams.csv"].rows.map((row) => row.team_id)),
  };

  const inventory: ValidationResult[] = datasetSpecs.map((spec) => {
    const rows = raw[spec.file].rows;
    const columns = Object.keys(rows[0] ?? {});
    const primaryKeys = rows.map((row) => primaryKeyValue(row, spec.primaryKey));
    const emptyRequiredValues = Object.fromEntries(
      spec.requiredColumns.map((column) => [
        column,
        rows.filter((row) => !String(row[column] ?? "").trim()).length,
      ]),
    );

    return {
      file: spec.file,
      sourceUrl: spec.sourceUrl,
      rowCount: rows.length,
      columnCount: columns.length,
      columns,
      primaryKey: spec.primaryKey,
      primaryKeyUnique: new Set(primaryKeys).size === primaryKeys.length,
      missingRequiredColumns: spec.requiredColumns.filter((column) => !columns.includes(column)),
      emptyRequiredValues,
      relationships: validateRelationships(spec.file, rows, lookup),
      byteSize: raw[spec.file].stats.size,
    };
  });

  const features = buildFeatureTables(raw);

  await Promise.all([
    writeFile(path.join(processedDir, "cleaned_tournaments.csv"), toCsv(features.cleanedTournaments)),
    writeFile(path.join(processedDir, "cleaned_teams.csv"), toCsv(features.cleanedTeams)),
    writeFile(path.join(processedDir, "cleaned_matches.csv"), toCsv(features.cleanedMatches)),
    writeFile(
      path.join(processedDir, "cleaned_tournament_results.csv"),
      toCsv(features.cleanedTournamentResults),
    ),
    writeFile(
      path.join(processedDir, "team_tournament_features_unnormalized.csv"),
      toCsv(features.teamTournamentFeatures),
    ),
    writeFile(
      path.join(processedDir, "team_feature_store_unnormalized.csv"),
      toCsv(features.teamFeatureStore),
    ),
    writeFile(
      path.join(processedDir, "team_tournament_features.csv"),
      toCsv(features.normalizedTeamTournamentFeatures),
    ),
    writeFile(path.join(processedDir, "team_feature_store.csv"), toCsv(features.normalizedTeamFeatureStore)),
    writeFile(
      path.join(processedDir, "historical_strength_rankings.csv"),
      toCsv(features.historicalStrengthRankings),
    ),
    writeFile(
      path.join(processedDir, "historical_strength_top_30.csv"),
      toCsv(features.historicalStrengthRankings.slice(0, 30)),
    ),
    writeFile(
      path.join(processedDir, "normalization_comparison.csv"),
      toCsv(features.normalizationComparison),
    ),
    writeFile(
      path.join(projectRoot, "src/lib/historical-strength.ts"),
      toHistoricalStrengthModule(features.historicalStrengthRankings.slice(0, 30)),
    ),
    writeFile(path.join(processedDir, "data_inventory.json"), JSON.stringify({ accessedDate, inventory }, null, 2)),
    writeFile(path.join(processedDir, "data_inventory.md"), toInventoryMarkdown(inventory)),
    writeFile(
      path.join(processedDir, "data_inventory.csv"),
      toCsv(
        inventory.map((item) => ({
          file: item.file,
          row_count: item.rowCount,
          column_count: item.columnCount,
          byte_size: item.byteSize,
          primary_key: item.primaryKey.join(" + "),
          primary_key_unique: item.primaryKeyUnique,
          missing_required_columns: item.missingRequiredColumns.join("; "),
          relationship_failures: item.relationships
            .filter((relationship) => relationship.missingReferenceCount > 0)
            .map((relationship) => `${relationship.name}: ${relationship.missingReferenceCount}`)
            .join("; "),
        })),
      ),
    ),
  ]);

  const hasValidationFailure = inventory.some(
    (item) =>
      !item.primaryKeyUnique ||
      item.missingRequiredColumns.length > 0 ||
      item.relationships.some((relationship) => relationship.missingReferenceCount > 0),
  );

  console.log(
    JSON.stringify(
      {
        status: hasValidationFailure ? "completed_with_validation_warnings" : "validated",
        rawFiles: inventory.length,
        processedOutputs: 14,
        teamTournamentFeatureRows: features.normalizedTeamTournamentFeatures.length,
        teamFeatureStoreRows: features.normalizedTeamFeatureStore.length,
      },
      null,
      2,
    ),
  );

  if (hasValidationFailure) {
    process.exitCode = 1;
  }
}

await main();
