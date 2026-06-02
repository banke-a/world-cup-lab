"use client";

import { useMemo, useState } from "react";
import { currentStrengthFormula, currentStrengthTeams } from "@/lib/current-strength";
import { historicalStrengthFormula, historicalStrengthTeams } from "@/lib/historical-strength";
import { trackEvent } from "@/lib/analytics";

type UserPrediction = {
  winner: string;
  finalist: string;
  semiFinalists: string[];
};

type ScatterTeam = {
  team_id: string;
  team_name: string;
  historical_strength_score: number;
  current_strength_score: number | null;
  recent_record: string;
};

const defaultPrediction: UserPrediction = {
  winner: "Brazil",
  finalist: "Germany",
  semiFinalists: ["Italy", "Argentina"],
};

const labeledScatterTeams = new Set([
  "Brazil",
  "Germany",
  "Argentina",
  "France",
  "Italy",
  "England",
  "Spain",
  "Netherlands",
]);

export function PredictionLab() {
  const combinedTeams = useMemo(() => {
    const currentByName = new Map(currentStrengthTeams.map((team) => [team.team_name, team]));

    return historicalStrengthTeams.map((historical) => {
      const current = currentByName.get(historical.team_name);
      return {
        ...historical,
        current_strength_score: current?.current_strength_score ?? null,
        current_rank: current?.rank ?? null,
        recent_form_score: current?.recent_form_score ?? null,
        recent_goal_difference_score: current?.recent_goal_difference_score ?? null,
        host_advantage_score: current?.host_advantage_score ?? 0,
        points_per_match: current?.points_per_match ?? null,
        recent_record: current ? `${current.wins}-${current.draws}-${current.losses}` : "n/a",
        average_goal_difference: current?.average_goal_difference ?? null,
        is_2026_host: current?.is_2026_host ?? 0,
      };
    });
  }, []);
  const rankedTeams = combinedTeams;
  const currentLeader = useMemo(() => currentStrengthTeams[0], []);
  const comparisonBuckets = useMemo(() => {
    const withCurrent = combinedTeams.filter((team) => team.current_strength_score !== null);
    const strongInBoth = withCurrent
      .filter((team) => team.historical_strength_score >= 55 && (team.current_strength_score ?? 0) >= 60)
      .sort((a, b) => (b.current_strength_score ?? 0) - (a.current_strength_score ?? 0))
      .slice(0, 4);
    const historicalStrongCurrentWeaker = withCurrent
      .filter((team) => team.historical_strength_score >= 35 && (team.current_strength_score ?? 0) < 55)
      .sort((a, b) => b.historical_strength_score - a.historical_strength_score)
      .slice(0, 4);
    const historicalWeakerCurrentStrong = withCurrent
      .filter((team) => team.historical_strength_score < 35 && (team.current_strength_score ?? 0) >= 60)
      .sort((a, b) => (b.current_strength_score ?? 0) - (a.current_strength_score ?? 0))
      .slice(0, 4);

    return {
      strongInBoth,
      historicalStrongCurrentWeaker,
      historicalWeakerCurrentStrong,
    };
  }, [combinedTeams]);
  const [prediction, setPrediction] = useState<UserPrediction>(defaultPrediction);
  const [savedPredictions, setSavedPredictions] = useState<UserPrediction[]>([]);
  const [activeScatterTeam, setActiveScatterTeam] = useState<string | null>(null);
  const [hasTrackedMethodologyExpanded, setHasTrackedMethodologyExpanded] = useState(false);
  const [showAllHistoricalTeams, setShowAllHistoricalTeams] = useState(false);
  const [showAllCurrentTeams, setShowAllCurrentTeams] = useState(false);

  const teamNames = rankedTeams.map((team) => team.team_name);
  const topTeam = rankedTeams[0];
  const scatterTeams = rankedTeams.filter((team) => team.current_strength_score !== null);
  const currentStrengthTableTeams = rankedTeams.slice(0, 20);
  const visibleHistoricalTeams = showAllHistoricalTeams ? rankedTeams : rankedTeams.slice(0, 10);
  const visibleCurrentTeams = showAllCurrentTeams
    ? currentStrengthTableTeams
    : currentStrengthTableTeams.slice(0, 10);
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  function updateSemiFinalist(index: number, value: string) {
    setPrediction((current) => {
      const semiFinalists = [...current.semiFinalists];
      semiFinalists[index] = value;
      return { ...current, semiFinalists };
    });
  }

  function savePrediction() {
    trackEvent("Tournament pick saved", {
      winner: prediction.winner,
      finalist: prediction.finalist,
      semi_finalists: prediction.semiFinalists,
    });
    setSavedPredictions((current) => [prediction, ...current].slice(0, 5));
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#151515]">
      <section className="border-b border-black/10 bg-[#174b3f] text-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-14">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d7ead1]">
              Historical index lab
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              2026 World Cup Lab
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
              A lightweight, explainable football history index derived from World Cup performance.
              It is a data preparation step, not a prediction model.
            </p>
            <div className="mt-7 flex flex-col gap-3 text-sm font-medium sm:flex-row sm:flex-wrap">
              <a
                href="#predictions"
                className="flex min-h-11 items-center justify-center rounded-md bg-[#f5c84b] px-4 py-2.5 text-[#151515] transition hover:bg-[#ffd968]"
              >
                View historical index
              </a>
              <a
                href="#make-pick"
                className="flex min-h-11 items-center justify-center rounded-md border border-white/35 px-4 py-2.5 text-white transition hover:bg-white/10"
              >
                Make your pick
              </a>
              {githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("GitHub link clicked", { url: githubUrl })}
                  className="flex min-h-11 items-center justify-center rounded-md border border-white/35 px-4 py-2.5 text-white transition hover:bg-white/10"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/18 bg-white/10 p-4 shadow-2xl shadow-black/15 backdrop-blur sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-white/72">Top historical strength score</p>
                <h2 className="mt-2 break-words text-3xl font-semibold">{topTeam.team_name}</h2>
              </div>
              <div className="rounded-md bg-white px-3 py-2 text-left text-[#174b3f] sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide">Score</p>
                <p className="text-2xl font-bold">{topTeam.historical_strength_score}</p>
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <Metric label="Appearances" value={topTeam.world_cup_appearances} />
              <Metric label="Titles" value={topTeam.titles} />
              <Metric label="Finals" value={topTeam.finals_appearances} />
              <Metric label="Semi-finals" value={topTeam.semi_final_appearances} />
              <Metric label="Win rate" value={`${topTeam.win_rate}%`} />
              <Metric label="Goals" value={topTeam.goals_scored} />
            </dl>
            <div className="mt-6 rounded-md bg-white/12 p-4">
              <p className="text-sm text-white/68">Current form leader</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-2xl font-semibold">{currentLeader.team_name}</p>
                  <p className="mt-1 text-sm text-white/70">
                    Recent record {currentLeader.wins}-{currentLeader.draws}-{currentLeader.losses}
                  </p>
                </div>
                <p className="text-2xl font-bold">{currentLeader.current_strength_score}</p>
              </div>
            </div>
            <p className="mt-6 rounded-md border border-[#f5c84b]/45 bg-[#f5c84b]/15 p-3 text-sm leading-6 text-[#fff4c9]">
              For fun and education only. This is a historical football strength index, not a
              machine-learning model, betting system, or win-probability forecast.
            </p>
          </div>
        </div>
      </section>

      <section id="predictions" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6d5f]">
              Historical Strength Score
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Top 30 nations</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-black/62">
            Scores combine normalized World Cup appearances, titles, finals, semi-finals, and match
            win rate. No current form, FIFA ranking, ELO, or prediction probability is used.
          </p>
        </div>
        <p className="mt-4 text-xs font-medium text-black/52 sm:hidden">
          Swipe sideways to see every column.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-white sm:mt-6">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-[#ece7d9] text-xs uppercase tracking-wide text-black/62">
                <tr>
                  <th className="px-3 py-3 sm:px-4">Rank</th>
                  <th className="px-3 py-3 sm:px-4">Team</th>
                  <th className="px-3 py-3 sm:px-4">Confed</th>
                  <th className="px-3 py-3 sm:px-4">Historical Strength Score</th>
                  <th className="px-3 py-3 sm:px-4">Appearances</th>
                  <th className="px-3 py-3 sm:px-4">Titles</th>
                  <th className="px-3 py-3 sm:px-4">Finals</th>
                  <th className="px-3 py-3 sm:px-4">Semis</th>
                  <th className="px-3 py-3 sm:px-4">Win rate</th>
                  <th className="px-3 py-3 sm:px-4">GF / GA</th>
                  <th className="px-3 py-3 sm:px-4">Avg finish est.</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistoricalTeams.map((team) => (
                  <tr key={team.team_id} className="border-t border-black/8">
                    <td className="px-3 py-4 font-semibold sm:px-4">{team.rank}</td>
                    <td className="px-3 py-4 sm:px-4">
                      <div className="font-semibold">{team.team_name}</div>
                      <div className="text-xs text-black/50">Best finish: {team.best_finish_label}</div>
                    </td>
                    <td className="px-3 py-4 text-black/62 sm:px-4">{team.confederation_code}</td>
                    <td className="px-3 py-4 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-[#2f6d5f]"
                            style={{ width: `${team.historical_strength_score}%` }}
                          />
                        </div>
                        <span className="font-semibold">{team.historical_strength_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 sm:px-4">{team.world_cup_appearances}</td>
                    <td className="px-3 py-4 sm:px-4">{team.titles}</td>
                    <td className="px-3 py-4 sm:px-4">{team.finals_appearances}</td>
                    <td className="px-3 py-4 sm:px-4">{team.semi_final_appearances}</td>
                    <td className="px-3 py-4 sm:px-4">{team.win_rate}%</td>
                    <td className="px-3 py-4 sm:px-4">{team.goals_scored} / {team.goals_conceded}</td>
                    <td className="px-3 py-4 sm:px-4">{team.average_finish_position_estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllHistoricalTeams((current) => !current)}
            className="min-h-11 rounded-md border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#174b3f] transition hover:border-[#2f6d5f] hover:bg-[#eef5ee]"
          >
            {showAllHistoricalTeams ? "Show fewer" : "Show all teams"}
          </button>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-4 py-8 sm:px-6 sm:py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6d5f]">
                Current Strength Index
              </p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">History meets recent form</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-black/62">
              Phase 1 uses each team&apos;s latest 20 completed matches, recent goal difference, and
              a small 2026 host flag. Still no FIFA ranking, Elo rating, ML, or probabilities.
            </p>
          </div>
          <p className="mt-4 text-xs font-medium text-black/52 sm:hidden">
            Swipe sideways to compare the full current-strength table.
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-[#fbfbf7] sm:mt-6">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="bg-[#ece7d9] text-xs uppercase tracking-wide text-black/62">
                  <tr>
                    <th className="px-3 py-3 sm:px-4">Team</th>
                    <th className="px-3 py-3 sm:px-4">Historical Strength Score</th>
                    <th className="px-3 py-3 sm:px-4">Current Strength Score</th>
                    <th className="px-3 py-3 sm:px-4">Recent form</th>
                    <th className="px-3 py-3 sm:px-4">Recent goal difference</th>
                    <th className="px-3 py-3 sm:px-4">Host advantage</th>
                    <th className="px-3 py-3 sm:px-4">Record</th>
                    <th className="px-3 py-3 sm:px-4">PPM</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCurrentTeams.map((team) => (
                    <tr key={team.team_id} className="border-t border-black/8">
                      <td className="px-3 py-4 sm:px-4">
                        <div className="font-semibold">{team.team_name}</div>
                        <div className="text-xs text-black/50">{team.confederation_code}</div>
                      </td>
                      <td className="px-3 py-4 font-semibold sm:px-4">{team.historical_strength_score}</td>
                      <td className="px-3 py-4 font-semibold sm:px-4">
                        {team.current_strength_score ?? "n/a"}
                      </td>
                      <td className="px-3 py-4 sm:px-4">{team.recent_form_score ?? "n/a"}</td>
                      <td className="px-3 py-4 sm:px-4">
                        {team.recent_goal_difference_score ?? "n/a"}
                        {team.average_goal_difference !== null
                          ? ` (${team.average_goal_difference > 0 ? "+" : ""}${team.average_goal_difference}/match)`
                          : ""}
                      </td>
                      <td className="px-3 py-4 sm:px-4">
                        {team.is_2026_host ? "Host boost" : "None"}
                      </td>
                      <td className="px-3 py-4 sm:px-4">{team.recent_record}</td>
                      <td className="px-3 py-4 sm:px-4">{team.points_per_match ?? "n/a"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllCurrentTeams((current) => !current)}
              className="min-h-11 rounded-md border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#174b3f] transition hover:border-[#2f6d5f] hover:bg-[#eef5ee]"
            >
              {showAllCurrentTeams ? "Show fewer" : "Show all teams"}
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-black/10 bg-[#fbfbf7] p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">History vs Current Form</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/62">
                  Where does your team sit: history, form, or both?
                </p>
                <p className="mt-2 text-xs leading-5 text-black/45 sm:hidden">
                  Tip: rotate your phone for a wider view of the chart.
                </p>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/45">
                Hover or tap points
              </p>
            </div>
            <ScatterPlot
              teams={scatterTeams}
              activeTeamId={activeScatterTeam}
              onActiveTeamChange={setActiveScatterTeam}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <ComparisonBucket
              title="Strong in both"
              description="Old trophy cabinet, current engine still warm."
              teams={comparisonBuckets.strongInBoth}
            />
            <ComparisonBucket
              title="Historically strong, currently quieter"
              description="Big legacy, softer recent-form signal."
              teams={comparisonBuckets.historicalStrongCurrentWeaker}
            />
            <ComparisonBucket
              title="Historically lighter, currently lively"
              description="Less World Cup legacy, very punchy recent results."
              teams={comparisonBuckets.historicalWeakerCurrentStrong}
            />
          </div>
        </div>
      </section>

      <section
        id="make-pick"
        className="border-y border-black/10 bg-[#e8efe8] px-4 py-8 sm:px-6 sm:py-10 md:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6d5f]">
              Make your prediction
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Choose your bracket picks</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-black/62">
              These picks are still stored in local React state only. They are intentionally separate
              from the historical index and do not affect the score.
            </p>
          </div>

          <div className="min-w-0 rounded-lg border border-black/10 bg-white p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Winner"
                value={prediction.winner}
                options={teamNames}
                onChange={(value) => setPrediction((current) => ({ ...current, winner: value }))}
              />
              <SelectField
                label="Finalist"
                value={prediction.finalist}
                options={teamNames}
                onChange={(value) => setPrediction((current) => ({ ...current, finalist: value }))}
              />
              <SelectField
                label="Semi-finalist 1"
                value={prediction.semiFinalists[0]}
                options={teamNames}
                onChange={(value) => updateSemiFinalist(0, value)}
              />
              <SelectField
                label="Semi-finalist 2"
                value={prediction.semiFinalists[1]}
                options={teamNames}
                onChange={(value) => updateSemiFinalist(1, value)}
              />
            </div>
            <button
              type="button"
              onClick={savePrediction}
              className="mt-5 min-h-11 w-full rounded-md bg-[#151515] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f6d5f] sm:w-auto"
            >
              Save my pick
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-black/10 bg-white p-4 sm:p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6d5f]">
            Tournament Picks
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Saved picks</h2>
          <div className="mt-5 space-y-3">
            {savedPredictions.length === 0 ? (
              <div className="rounded-md border border-black/10 p-4">
                <p className="text-sm leading-6 text-black/62">
                  No picks saved yet. Choose your winner, finalist and semi-finalists above.
                </p>
              </div>
            ) : (
              savedPredictions.map((item, index) => (
                <div key={`${item.winner}-${index}`} className="rounded-md border border-black/10 p-4">
                  <p className="font-semibold">
                    {index === 0 ? "Your latest pick" : `Your pick ${index + 1}`}
                  </p>
                  <p className="mt-2 break-words text-sm leading-6 text-black/62">
                    Winner: {item.winner} · Finalist: {item.finalist} · Semis:{" "}
                    {item.semiFinalists.join(", ")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-black/10 bg-white p-4 sm:p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6d5f]">
            Methodology
          </p>
          <h2 className="mt-2 text-2xl font-semibold">How to read the scores</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-black/66">
            <p>
              The historical score rewards teams that have repeatedly gone deep at World Cups:
              showing up often, winning titles, reaching finals and semi-finals, and winning matches.
            </p>
            <p>
              The current score is a lightweight snapshot of recent international results. It looks
              at the last 20 matches, recent goal difference, and whether a team is one of the 2026
              hosts.
            </p>
            <p>
              Germany includes West Germany under the documented normalization rules. Current
              Strength uses recent form only, with no machine learning, FIFA ranking, Elo rating, or
              win probability.
            </p>
          </div>
          <details
            onToggle={(event) => {
              if (event.currentTarget.open && !hasTrackedMethodologyExpanded) {
                trackEvent("Methodology expanded");
                setHasTrackedMethodologyExpanded(true);
              }
            }}
            className="mt-5 rounded-md bg-[#f7f7f2] p-4 text-sm leading-6 text-black/66"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#174b3f]">
              <span>View methodology details</span>
              <span aria-hidden="true" className="text-lg leading-none">+</span>
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-semibold text-black/76">Historical Strength Score</p>
                <p className="mt-1">
                  Count metrics are scaled from 0-100 against the strongest nation in the dataset.
                  Win rate is match wins divided by matches played, also represented on a 0-100 scale.
                </p>
                <code className="mt-2 block overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs leading-5 text-black/72">
                  {historicalStrengthFormula}
                </code>
              </div>
              <div>
                <p className="font-semibold text-black/76">Current Strength Index Phase 1</p>
                <p className="mt-1">
                  Recent-form and goal-difference metrics are scaled to 0-100, then combined with a
                  small host flag for USA, Mexico, and Canada.
                </p>
                <code className="mt-2 block overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs leading-5 text-black/72">
                  {currentStrengthFormula}
                </code>
              </div>
            </div>
          </details>
          <div className="mt-6 rounded-md bg-[#f7f7f2] p-4 text-sm leading-6 text-black/66">
            This is a historical football strength index derived from World Cup performance. It is
            useful context for an explainable lab, but it does not predict 2026 outcomes.
          </div>
        </div>
      </section>
    </main>
  );
}

function ScatterPlot({
  teams,
  activeTeamId,
  onActiveTeamChange,
}: {
  teams: ScatterTeam[];
  activeTeamId: string | null;
  onActiveTeamChange: (teamId: string | null) => void;
}) {
  const width = 760;
  const height = 420;
  const padding = {
    top: 28,
    right: 24,
    bottom: 58,
    left: 58,
  };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const ticks = [0, 25, 50, 75, 100];
  const activeTeam = teams.find((team) => team.team_id === activeTeamId) ?? null;
  const medianHistoricalScore = median(
    teams.map((team) => team.historical_strength_score),
  );
  const medianCurrentScore = median(
    teams.map((team) => team.current_strength_score ?? 0),
  );
  const guideX = x(medianHistoricalScore);
  const guideY = y(medianCurrentScore);
  const activeTeamCategory = activeTeam
    ? getTeamCategory(activeTeam, medianHistoricalScore, medianCurrentScore)
    : null;

  function x(score: number) {
    return padding.left + (score / 100) * plotWidth;
  }

  function y(score: number) {
    return padding.top + plotHeight - (score / 100) * plotHeight;
  }

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
      <div className="min-w-0 overflow-hidden rounded-md border border-black/10 bg-white p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Scatter plot of historical strength score against current strength score"
          className="h-auto w-full"
        >
          <rect x={0} y={0} width={width} height={height} rx={8} fill="#ffffff" />
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="#f7f7f2"
            opacity={0.38}
          />
          {ticks.map((tick) => (
            <g key={`grid-${tick}`}>
              <line
                x1={x(tick)}
                x2={x(tick)}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke="#151515"
                strokeOpacity={0.08}
              />
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="#151515"
                strokeOpacity={0.08}
              />
              <text
                x={x(tick)}
                y={height - padding.bottom + 22}
                textAnchor="middle"
                className="fill-black/50 text-[12px]"
              >
                {tick}
              </text>
              <text
                x={padding.left - 14}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-black/50 text-[12px]"
              >
                {tick}
              </text>
            </g>
          ))}
          <line
            x1={guideX}
            x2={guideX}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#174b3f"
            strokeDasharray="6 6"
            strokeOpacity={0.28}
            strokeWidth={1.5}
          />
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={guideY}
            y2={guideY}
            stroke="#174b3f"
            strokeDasharray="6 6"
            strokeOpacity={0.28}
            strokeWidth={1.5}
          />
          <text
            x={guideX + (width - padding.right - guideX) / 2}
            y={padding.top + 28}
            textAnchor="middle"
            className="fill-[#174b3f] text-[13px] font-bold"
          >
            Strong in both
          </text>
          <text
            x={guideX + (width - padding.right - guideX) / 2}
            y={height - padding.bottom - 16}
            textAnchor="middle"
            className="fill-[#174b3f] text-[13px] font-bold"
          >
            Historical heavyweights
          </text>
          <text
            x={padding.left + (guideX - padding.left) / 2}
            y={padding.top + 28}
            textAnchor="middle"
            className="fill-[#174b3f] text-[13px] font-bold"
          >
            Current risers
          </text>
          <text
            x={padding.left + (guideX - padding.left) / 2}
            y={height - padding.bottom - 16}
            textAnchor="middle"
            className="fill-[#174b3f] text-[13px] font-bold"
          >
            Outside the spotlight
          </text>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={height - padding.bottom}
            y2={height - padding.bottom}
            stroke="#151515"
            strokeOpacity={0.35}
          />
          <line
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#151515"
            strokeOpacity={0.35}
          />
          <text
            x={padding.left + plotWidth / 2}
            y={height - 16}
            textAnchor="middle"
            className="fill-black/62 text-[13px] font-semibold"
          >
            Historical Strength Score
          </text>
          <text
            x={18}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${padding.top + plotHeight / 2})`}
            className="fill-black/62 text-[13px] font-semibold"
          >
            Current Strength Score
          </text>

          {teams.map((team) => {
            const isActive = team.team_id === activeTeamId;
            const currentScore = team.current_strength_score ?? 0;
            const category = getTeamCategory(team, medianHistoricalScore, medianCurrentScore);

            return (
              <circle
                key={team.team_id}
                cx={x(team.historical_strength_score)}
                cy={y(currentScore)}
                r={isActive ? 7 : 5}
                fill={isActive ? "#f5c84b" : "#2f6d5f"}
                stroke={isActive ? "#151515" : "#ffffff"}
                strokeWidth={isActive ? 2 : 1.5}
                opacity={isActive || activeTeamId === null ? 0.92 : 0.42}
                className="cursor-pointer transition"
                tabIndex={0}
                role="button"
                aria-label={`${team.team_name}: ${category}, historical ${team.historical_strength_score}, current ${currentScore}, recent record ${team.recent_record}`}
                onMouseEnter={() => onActiveTeamChange(team.team_id)}
                onMouseLeave={() => onActiveTeamChange(null)}
                onFocus={() => onActiveTeamChange(team.team_id)}
                onBlur={() => onActiveTeamChange(null)}
                onClick={() => {
                  trackEvent("Scatter plot point clicked", {
                    team: team.team_name,
                    historical_score: team.historical_strength_score,
                    current_score: currentScore,
                    recent_record: team.recent_record,
                    category,
                  });
                  onActiveTeamChange(isActive ? null : team.team_id);
                }}
              >
                <title>
                  {`${team.team_name}: ${category}, historical ${team.historical_strength_score}, current ${currentScore}, recent record ${team.recent_record}`}
                </title>
              </circle>
            );
          })}
          {teams
            .filter((team) => labeledScatterTeams.has(team.team_name))
            .map((team) => {
              const currentScore = team.current_strength_score ?? 0;
              const labelX = x(team.historical_strength_score) + 8;
              const labelY = y(currentScore) - 8;

              return (
                <text
                  key={`label-${team.team_id}`}
                  x={labelX}
                  y={labelY}
                  className="pointer-events-none fill-black/70 text-[11px] font-semibold"
                >
                  {team.team_name}
                </text>
              );
            })}
        </svg>
      </div>

      <div className="rounded-md border border-black/10 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6d5f]">
          Team tooltip
        </p>
        {activeTeam ? (
          <div className="mt-3 space-y-2 text-sm leading-6 text-black/66">
            <p className="break-words text-lg font-semibold text-black">{activeTeam.team_name}</p>
            <p>Category: {activeTeamCategory}</p>
            <p>Historical score: {activeTeam.historical_strength_score}</p>
            <p>Current score: {activeTeam.current_strength_score ?? "n/a"}</p>
            <p>Recent record: {activeTeam.recent_record}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-black/58">
            Hover or tap a point to inspect a team.
          </p>
        )}
      </div>
    </div>
  );
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function getTeamCategory(
  team: ScatterTeam,
  medianHistoricalScore: number,
  medianCurrentScore: number,
) {
  const hasHighHistoricalScore = team.historical_strength_score >= medianHistoricalScore;
  const hasHighCurrentScore = (team.current_strength_score ?? 0) >= medianCurrentScore;

  if (hasHighHistoricalScore && hasHighCurrentScore) {
    return "Strong in both";
  }

  if (hasHighHistoricalScore) {
    return "Historical heavyweights";
  }

  if (hasHighCurrentScore) {
    return "Current risers";
  }

  return "Outside the spotlight";
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded-md bg-white/12 p-3">
      <dt className="text-xs text-white/64">{label}</dt>
      <dd className="mt-1 break-words text-xl font-semibold">{value}</dd>
    </div>
  );
}

function ComparisonBucket({
  title,
  description,
  teams,
}: {
  title: string;
  description: string;
  teams: Array<{
    team_id: string;
    team_name: string;
    historical_strength_score: number;
    current_strength_score: number | null;
    recent_record: string;
  }>;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-black/10 bg-white p-4 sm:p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-black/58">{description}</p>
      <div className="mt-4 space-y-3">
        {teams.map((team) => (
          <div key={`${title}-${team.team_id}`} className="rounded-md bg-[#f7f7f2] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 break-words font-semibold">{team.team_name}</p>
              <p className="text-sm font-semibold text-[#2f6d5f]">
                {team.current_strength_score ?? "n/a"}
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-black/58">
              Historical {team.historical_strength_score} · Recent {team.recent_record}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-black/72">
      {label}
      <select
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          trackEvent("Team selected", {
            team: nextValue,
            field: label,
          });
          onChange(nextValue);
        }}
        className="mt-2 min-h-11 w-full rounded-md border border-black/15 bg-white px-3 py-3 text-base text-black outline-none transition focus:border-[#2f6d5f] focus:ring-4 focus:ring-[#2f6d5f]/15 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
