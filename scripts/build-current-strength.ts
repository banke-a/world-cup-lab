import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CsvRow = Record<string, string>;

type MatchSide = {
  date: string;
  team: string;
  opponent: string;
  goalsFor: number;
  goalsAgainst: number;
  result: "win" | "draw" | "loss";
  points: number;
  tournament: string;
  country: string;
  neutral: string;
};

type CurrentStrengthFeature = {
  team_name: string;
  matches_used: number;
  latest_match_date: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  points_per_match: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  average_goal_difference: number;
  recent_form_score: number;
  recent_goal_difference_score: number;
  host_advantage_score: number;
  is_2026_host: 0 | 1;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const rawDir = path.join(projectRoot, "data/current/raw/international_results");
const processedDir = path.join(projectRoot, "data/current/processed");
const accessedDate = "2026-06-02";
const currentDate = "2026-06-02";
const recentMatchCount = 20;
const hostTeams2026 = new Set(["Canada", "Mexico", "United States"]);
const officialSeniorTournamentPrefixes = [
  "Friendly",
  "FIFA World Cup",
  "FIFA Series",
  "Confederations Cup",
  "AFC Asian Cup",
  "AFC Challenge Cup",
  "AFC Solidarity Cup",
  "African Cup of Nations",
  "Copa América",
  "CONCACAF Championship",
  "CONCACAF Nations League",
  "Gold Cup",
  "UEFA Euro",
  "UEFA Nations League",
  "Oceania Nations Cup",
  "Arab Cup",
  "WAFF Championship",
  "SAFF Cup",
  "AFF Championship",
  "ASEAN Championship",
  "EAFF Championship",
  "CAFA Nations Cup",
  "Gulf Cup",
  "CECAFA Cup",
  "COSAFA Cup",
  "CFU Caribbean Cup",
  "UNCAF Cup",
  "Baltic Cup",
  "British Home Championship",
  "CONMEBOL–UEFA Cup of Champions",
];

const sourceFiles = [
  {
    file: "results.csv",
    sourceUrl: "https://raw.githubusercontent.com/martj42/international_results/master/results.csv",
    requiredColumns: [
      "date",
      "home_team",
      "away_team",
      "home_score",
      "away_score",
      "tournament",
      "city",
      "country",
      "neutral",
    ],
  },
  {
    file: "former_names.csv",
    sourceUrl: "https://raw.githubusercontent.com/martj42/international_results/master/former_names.csv",
    requiredColumns: ["current", "former", "start_date", "end_date"],
  },
];

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

function numericScore(value: string): number | null {
  if (!/^-?\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeTeamName(teamName: string, formerNames: CsvRow[]): string {
  const match = formerNames.find((row) => row.former === teamName);
  return match?.current ?? teamName;
}

function isOfficialSeniorTournament(tournament: string): boolean {
  return officialSeniorTournamentPrefixes.some(
    (prefix) => tournament === prefix || tournament.startsWith(`${prefix} qualification`),
  );
}

function matchSide(
  row: CsvRow,
  team: string,
  opponent: string,
  goalsFor: number,
  goalsAgainst: number,
): MatchSide {
  const result = goalsFor > goalsAgainst ? "win" : goalsFor === goalsAgainst ? "draw" : "loss";
  return {
    date: row.date,
    team,
    opponent,
    goalsFor,
    goalsAgainst,
    result,
    points: result === "win" ? 3 : result === "draw" ? 1 : 0,
    tournament: row.tournament,
    country: row.country,
    neutral: row.neutral,
  };
}

function buildFeatures(results: CsvRow[], formerNames: CsvRow[]) {
  const worldCupRelevantTeams = new Set<string>();
  for (const row of results) {
    if (row.tournament === "FIFA World Cup") {
      worldCupRelevantTeams.add(normalizeTeamName(row.home_team, formerNames));
      worldCupRelevantTeams.add(normalizeTeamName(row.away_team, formerNames));
    }
  }
  for (const hostTeam of hostTeams2026) {
    worldCupRelevantTeams.add(hostTeam);
  }

  const completedMatches = results.filter((row) => {
    const homeScore = numericScore(row.home_score);
    const awayScore = numericScore(row.away_score);
    return (
      homeScore !== null &&
      awayScore !== null &&
      row.date <= currentDate &&
      isOfficialSeniorTournament(row.tournament)
    );
  });

  const teamMatches = new Map<string, MatchSide[]>();
  for (const row of completedMatches) {
    const homeScore = numericScore(row.home_score);
    const awayScore = numericScore(row.away_score);
    if (homeScore === null || awayScore === null) {
      continue;
    }

    const homeTeam = normalizeTeamName(row.home_team, formerNames);
    const awayTeam = normalizeTeamName(row.away_team, formerNames);
    const homeSide = matchSide(row, homeTeam, awayTeam, homeScore, awayScore);
    const awaySide = matchSide(row, awayTeam, homeTeam, awayScore, homeScore);

    if (worldCupRelevantTeams.has(homeTeam)) {
      teamMatches.set(homeTeam, [...(teamMatches.get(homeTeam) ?? []), homeSide]);
    }
    if (worldCupRelevantTeams.has(awayTeam)) {
      teamMatches.set(awayTeam, [...(teamMatches.get(awayTeam) ?? []), awaySide]);
    }
  }

  const features: CurrentStrengthFeature[] = [...teamMatches.entries()]
    .map(([teamName, matches]) => {
      const recentMatches = matches
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, recentMatchCount);
      const matchesUsed = recentMatches.length;
      const wins = recentMatches.filter((match) => match.result === "win").length;
      const draws = recentMatches.filter((match) => match.result === "draw").length;
      const losses = recentMatches.filter((match) => match.result === "loss").length;
      const points = recentMatches.reduce((sum, match) => sum + match.points, 0);
      const goalsFor = recentMatches.reduce((sum, match) => sum + match.goalsFor, 0);
      const goalsAgainst = recentMatches.reduce((sum, match) => sum + match.goalsAgainst, 0);
      const goalDifference = goalsFor - goalsAgainst;
      const averageGoalDifference = goalDifference / Math.max(matchesUsed, 1);
      const recentFormScore = (points / Math.max(matchesUsed * 3, 1)) * 100;
      const recentGoalDifferenceScore = ((clamp(averageGoalDifference, -3, 3) + 3) / 6) * 100;
      const hostAdvantageScore = hostTeams2026.has(teamName) ? 100 : 0;
      const isHost: 0 | 1 = hostAdvantageScore > 0 ? 1 : 0;

      return {
        team_name: teamName,
        matches_used: matchesUsed,
        latest_match_date: recentMatches[0]?.date ?? "",
        wins,
        draws,
        losses,
        points,
        points_per_match: Number((points / Math.max(matchesUsed, 1)).toFixed(2)),
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        goal_difference: goalDifference,
        average_goal_difference: Number(averageGoalDifference.toFixed(2)),
        recent_form_score: Number(recentFormScore.toFixed(2)),
        recent_goal_difference_score: Number(recentGoalDifferenceScore.toFixed(2)),
        host_advantage_score: hostAdvantageScore,
        is_2026_host: isHost,
      };
    })
    .filter((row) => row.matches_used > 0)
    .sort((a, b) => a.team_name.localeCompare(b.team_name));

  const index = features
    .map((row) => {
      const currentStrengthScore =
        row.recent_form_score * 0.65 +
        row.recent_goal_difference_score * 0.25 +
        row.host_advantage_score * 0.1;

      return {
        team_name: row.team_name,
        current_strength_score: Number(currentStrengthScore.toFixed(2)),
        recent_form_score: row.recent_form_score,
        recent_goal_difference_score: row.recent_goal_difference_score,
        host_advantage_score: row.host_advantage_score,
        matches_used: row.matches_used,
        points_per_match: row.points_per_match,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        goals_for: row.goals_for,
        goals_against: row.goals_against,
        average_goal_difference: row.average_goal_difference,
        latest_match_date: row.latest_match_date,
        is_2026_host: row.is_2026_host,
      };
    })
    .sort(
      (a, b) =>
        b.current_strength_score - a.current_strength_score ||
        b.points_per_match - a.points_per_match ||
        a.team_name.localeCompare(b.team_name),
    )
    .map((row, index) => ({
      rank: index + 1,
      ...row,
    }));

  return {
    completedMatches,
    features,
    index,
    worldCupRelevantTeamCount: worldCupRelevantTeams.size,
  };
}

function buildInventory(
  datasets: Record<string, { rows: CsvRow[]; byteSize: number }>,
  completedMatchCount: number,
) {
  return sourceFiles.map((source) => {
    const dataset = datasets[source.file];
    const columns = Object.keys(dataset.rows[0] ?? {});
    return {
      file: source.file,
      source_url: source.sourceUrl,
      row_count: dataset.rows.length,
      column_count: columns.length,
      byte_size: dataset.byteSize,
      required_columns_present: source.requiredColumns.every((column) => columns.includes(column)),
      missing_required_columns: source.requiredColumns.filter((column) => !columns.includes(column)).join("; "),
      completed_matches_used: source.file === "results.csv" ? completedMatchCount : "",
    };
  });
}

function inventoryMarkdown(inventory: ReturnType<typeof buildInventory>, featureCount: number) {
  const rows = inventory
    .map(
      (row) =>
        `| ${row.file} | ${row.row_count} | ${row.column_count} | ${row.required_columns_present ? "yes" : "no"} | ${row.missing_required_columns || "none"} | ${row.completed_matches_used || "-"} |`,
    )
    .join("\n");

  return `# Current Strength Data Validation

Generated by \`npm run build:current-strength\`.

Date accessed: ${accessedDate}

Current date cutoff: ${currentDate}

| File | Rows | Columns | Required columns present | Missing required columns | Completed matches used |
| --- | ---: | ---: | --- | --- | ---: |
${rows}

## Validation Rules

- Exclude future fixtures and rows with non-numeric scores such as \`NA\`.
- Use only completed matches from a conservative senior national-team tournament allowlist.
- Exclude alternative-association and sub-national events such as CONIFA, Viva World Cup, FIFI Wild Cup, and Island Games.
- Generate feature rows only for World Cup-relevant nations present in FIFA World Cup records/fixtures in the open results dataset, plus 2026 hosts.
- Normalize former names using \`former_names.csv\` where available.
- Compute each team from its latest ${recentMatchCount} completed matches, or fewer if the team has fewer available matches.

## Outputs

- \`current_strength_features.csv\`: recent form, recent goals, and host advantage feature columns.
- \`current_strength_index.csv\`: Phase 1 Current Strength Index scores.

Teams with generated feature rows: ${featureCount}
`;
}

function methodologyMarkdown() {
  return `# Current Strength Index

Phase 1 uses only open-access data with clear licensing.

## Source

- Dataset: \`martj42/international_results\`
- Results URL: https://raw.githubusercontent.com/martj42/international_results/master/results.csv
- Former names URL: https://raw.githubusercontent.com/martj42/international_results/master/former_names.csv
- License: CC0 1.0 Universal
- Date accessed: ${accessedDate}

## Included Features

### Recent form

Uses each team's latest ${recentMatchCount} completed matches.

- \`wins\`
- \`draws\`
- \`losses\`
- \`points_per_match\`
- \`recent_form_score = points / (${recentMatchCount} * 3) * 100\`, adjusted for teams with fewer than ${recentMatchCount} matches.

### Recent goal difference

Uses the same latest ${recentMatchCount} completed matches.

- \`goals_for\`
- \`goals_against\`
- \`goal_difference\`
- \`average_goal_difference\`
- \`recent_goal_difference_score\`

Average goal difference is capped to \`[-3, +3]\` before scaling to \`0-100\`.

### Host advantage

2026 host teams receive \`host_advantage_score = 100\`:

- Canada
- Mexico
- United States

All other teams receive \`0\`.

## Phase 1 Scoring Formula

\`\`\`text
Current Strength Score =
  0.65 * recent_form_score
+ 0.25 * recent_goal_difference_score
+ 0.10 * host_advantage_score
\`\`\`

## Explicit Exclusions

- No FIFA rankings yet.
- No Elo ratings yet.
- No prediction probabilities.
- No machine learning model.
- No changes to Historical Strength Score.

## Limitations

- Recent form does not yet adjust for opponent strength.
- Friendlies and competitive matches are weighted equally in Phase 1.
- The host advantage is a simple 2026 host flag, not a venue-by-venue travel model.
- Some teams may have fewer than ${recentMatchCount} completed matches available.
- Phase 1 uses a conservative tournament allowlist rather than a formal FIFA-member registry.
- Phase 1 uses a World Cup-relevant team universe, not every team in the international results dataset.
`;
}

function toCurrentStrengthModule(rows: Record<string, unknown>[]): string {
  return `export type CurrentStrengthTeam = {
  rank: number;
  team_name: string;
  current_strength_score: number;
  recent_form_score: number;
  recent_goal_difference_score: number;
  host_advantage_score: number;
  matches_used: number;
  points_per_match: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  average_goal_difference: number;
  latest_match_date: string;
  is_2026_host: 0 | 1;
};

export const currentStrengthFormula =
  "0.65 * recent_form_score + 0.25 * recent_goal_difference_score + 0.10 * host_advantage_score";

export const currentStrengthTeams = ${JSON.stringify(rows, null, 2)} satisfies CurrentStrengthTeam[];
`;
}

async function main() {
  await mkdir(processedDir, { recursive: true });

  const datasets = Object.fromEntries(
    await Promise.all(
      sourceFiles.map(async (source) => {
        const filePath = path.join(rawDir, source.file);
        const [content, stats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
        return [source.file, { rows: parseCsv(content), byteSize: stats.size }] as const;
      }),
    ),
  );

  const { completedMatches, features, index, worldCupRelevantTeamCount } = buildFeatures(
    datasets["results.csv"].rows,
    datasets["former_names.csv"].rows,
  );
  const inventory = buildInventory(datasets, completedMatches.length);

  await Promise.all([
    writeFile(path.join(processedDir, "current_strength_features.csv"), toCsv(features)),
    writeFile(path.join(processedDir, "current_strength_index.csv"), toCsv(index)),
    writeFile(path.join(processedDir, "current_strength_data_inventory.csv"), toCsv(inventory)),
    writeFile(
      path.join(processedDir, "current_strength_data_inventory.json"),
      JSON.stringify({ accessedDate, currentDate, inventory }, null, 2),
    ),
    writeFile(
      path.join(processedDir, "current_strength_validation.md"),
      inventoryMarkdown(inventory, features.length),
    ),
    writeFile(path.join(projectRoot, "CURRENT_STRENGTH_INDEX.md"), methodologyMarkdown()),
    writeFile(
      path.join(projectRoot, "src/lib/current-strength.ts"),
      toCurrentStrengthModule(index.slice(0, 100)),
    ),
  ]);

  const hasValidationFailure = inventory.some((row) => !row.required_columns_present);
  console.log(
    JSON.stringify(
      {
        status: hasValidationFailure ? "completed_with_validation_warnings" : "validated",
        completedMatchesUsed: completedMatches.length,
        worldCupRelevantTeamCount,
        teamsWithFeatures: features.length,
        outputRows: index.length,
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
