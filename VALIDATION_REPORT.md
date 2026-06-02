# Historical Feature Store Validation Report

Date prepared: 2026-06-02

Scope: top 20 teams from `data/worldcup/processed/historical_strength_top_30.csv`.

This is a report-only audit. No generated data was changed.

## Sources Used

- Generated feature store: `data/worldcup/processed/team_feature_store.csv`
- Generated top-30 ranking: `data/worldcup/processed/historical_strength_top_30.csv`
- FIFA World Cup records and statistics, overall team records: https://en.wikipedia.org/wiki/FIFA_World_Cup_records_and_statistics
- National team appearances and FIFA successor notes: https://en.wikipedia.org/wiki/National_team_appearances_in_the_FIFA_World_Cup
- FIFA article on highest-scoring teams: https://www.fifa.com/en/tournaments/mens/worldcup/articles/most-goals-highest-scoring-teams
- World Cup Brackets all-time standings/top-four placements: https://www.worldcupbrackets.info/stats/

The main benchmark is through the 2022 men's FIFA World Cup. The generated historical feature store
also uses completed men's World Cup tournaments through 2022.

## Executive Summary

Most historical feature-store columns validate cleanly:

- Appearances match for 20 of 20 top-20 teams.
- Titles match for 20 of 20.
- Finals appearances match for 20 of 20.
- Semi-final/top-four appearances match for 20 of 20.
- Goals scored and conceded match published 2022 all-time records for 19 of 20.

The main discrepancy is `win_rate`. For 14 of 20 teams, the generated win rate is higher than the
published all-time table convention because the current pipeline counts penalty-shootout advancement
as a win. Published all-time tables count matches decided by penalty shootout as draws.

This is a feature-engineering logic issue, not a source-data issue.

## Key Findings

### 1. Penalty shootout wins inflate generated win rates

The published convention used by the benchmark says extra-time results count as wins/losses, while
matches decided by penalty shootout count as draws. The current feature pipeline uses `home_team_win`
and `away_team_win` from the raw match table, which appears to count some penalty-shootout winners as
match winners.

Affected examples:

- Brazil: generated `69.30%`, expected `66.67%`
- Germany: generated `64.29%`, expected `60.71%`
- Argentina: generated `60.23%`, expected `53.41%`
- Croatia: generated `56.67%`, expected `43.33%`
- Russia: generated `44.44%`, expected `42.22%`

Classification: feature engineering logic.

Recommended fix after this report:

- When `penalty_shootout = 1`, count the match as a draw for win-rate purposes.
- Keep advancement/title/final/semi-final logic separate from match-result W/D/L logic.

### 2. Germany / West Germany normalization validates

Generated Germany values:

- Appearances: `20`
- Titles: `4`
- Finals: `8`
- Semi-finals/top-four: `13`
- Goals for/against: `232 / 130`

These match published all-time records. FIFA/Wikipedia successor notes state that FIFA attributes West
Germany results to Germany, while East Germany remains separate.

Classification: normalization rule validated.

### 3. Brazil validates except for win-rate convention

Generated Brazil values match benchmark records for appearances, titles, finals, semi-finals, goals
for, and goals against:

- Appearances: `22`
- Titles: `5`
- Finals: `7`
- Semi-finals/top-four: `11`
- Goals for/against: `237 / 108`

The generated win rate is inflated because Brazil has penalty-shootout advancements that the published
table treats as draws.

Classification: feature engineering logic.

### 4. Argentina validates except for win-rate convention

Argentina's appearances, titles, finals, semi-finals, goals scored, and goals conceded match the
benchmark. Its generated win rate is materially higher than the benchmark because penalty shootouts
are counted as wins in the generated feature store.

Classification: feature engineering logic.

### 5. Italy validates except for win-rate convention

Italy matches benchmark values for all non-win-rate metrics. The win-rate discrepancy is consistent
with the penalty-shootout convention issue.

Classification: feature engineering logic.

### 6. Uruguay validates except for win-rate convention

Uruguay's generated appearances, titles, finals, semi-finals/top-four count, goals for, and goals
against match benchmark values. The win-rate discrepancy is small and consistent with shootout/record
convention handling.

Classification: feature engineering logic.

### 7. Russia / Soviet Union normalization validates except for win-rate convention

Generated Russia values:

- Appearances: `11`
- Titles: `0`
- Finals: `0`
- Semi-finals/top-four: `1`
- Goals for/against: `77 / 54`

These match the successor-combined benchmark. FIFA/Wikipedia successor notes state that FIFA considers
Russia the successor team of the Soviet Union.

Generated win rate is `44.44%`; benchmark is `42.22%`, consistent with counting Russia's 2018
penalty-shootout advancement as a win rather than a draw.

Classification: normalization rule validated; win-rate feature logic needs correction.

### 8. Serbia / Yugoslavia normalization validates

Generated Serbia values:

- Appearances: `13`
- Titles: `0`
- Finals: `0`
- Semi-finals/top-four: `2`
- Goals for/against: `71 / 71`
- Win rate: `36.73%`

These match the successor-combined benchmark. FIFA/Wikipedia successor notes state that Yugoslavia
and Serbia and Montenegro are considered predecessors of Serbia, while Croatia, Slovenia, Bosnia and
Herzegovina, North Macedonia, Montenegro, and Kosovo are distinct teams.

Classification: normalization rule validated.

### 9. Czechoslovakia requires a source-level audit

Generated Czechoslovakia values:

- Appearances: `8`
- Titles: `0`
- Finals: `2`
- Semi-finals/top-four: `2`
- Goals for/against: `44 / 45`
- Win rate: `36.67%`

The common separate Czechoslovakia benchmark used here lists:

- Goals for/against: `43 / 43`
- Win rate: `39.29%`

The generated table counts `30` matches for Czechoslovakia, while the benchmark row implies `28`
matches. This is not safe to classify as a bug yet. It may be caused by source differences around
replayed matches, successor-team scoping, or a mismatch between separate Czechoslovakia records and
successor-combined records.

Classification: source data or team-successor scope discrepancy.

Recommended follow-up:

- Audit Czechoslovakia match rows in `data/worldcup/raw/matches.csv`.
- Check replayed matches and 1938 Brazil/Czechoslovakia treatment.
- Decide whether Czechoslovakia should remain separate, or whether a successor policy should be
  reflected differently in validation only.

## Validation Summary

See `validation_summary.csv` for the row-level comparison.

Pass rows:

- Mexico
- Hungary
- Serbia
- Switzerland
- Poland
- United States

Rows needing review:

- Brazil
- Germany
- Italy
- Argentina
- France
- Uruguay
- England
- Spain
- Netherlands
- Sweden
- Belgium
- Czechoslovakia
- Russia
- Croatia

Most review rows are caused by the same penalty-shootout win-rate issue.

## Discrepancy Categories

### Feature engineering logic

The generated win-rate feature currently counts penalty-shootout advancements as wins. This should be
changed if the project wants alignment with published World Cup all-time table conventions.

### Normalization rules

Germany, Russia, Serbia, and DR Congo/Zaire normalization rules are directionally aligned with FIFA
successor notes. Germany, Russia, and Serbia validate against successor-combined published records in
the top-20 audit.

### Tournament format differences

The 1950 World Cup used a final-round format rather than a normal knockout final. Current finals and
semi-final features still align with the benchmark for the top-20 teams reviewed, but this remains a
known interpretation risk and should stay documented.

### Source data limitations

`tournament_standings.csv` provides top-four records, not a full final ranking for every qualified
team. That does not affect the core validation fields in this report, but it does affect
`average_finish_position_estimate`, which was not part of this audit request.

### Potential bugs

The win-rate convention mismatch is the only clear bug found in this audit.

The Czechoslovakia goals/matches discrepancy is a candidate for source-level review, not an immediate
bug.

## Recommended Next Steps

1. Update win-rate logic so penalty-shootout matches count as draws.
2. Regenerate `team_feature_store.csv` and `historical_strength_rankings.csv`.
3. Re-run this validation report.
4. Audit Czechoslovakia match rows before changing source or normalization behavior.
5. Add a lightweight automated validation script using this report's benchmark table as a regression
   fixture.
