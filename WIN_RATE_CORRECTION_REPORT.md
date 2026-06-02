# Win-Rate Correction Report

Date prepared: 2026-06-02

Change implemented: for historical win-rate calculations only, matches with `penalty_shootout = 1` are now treated as draws. Advancement logic, titles, finals, semi-finals, tournament results, and normalization rules were not changed.

## Regenerated Files

- `data/worldcup/processed/team_feature_store.csv`
- `data/worldcup/processed/historical_strength_rankings.csv`
- `data/worldcup/processed/historical_strength_top_30.csv`
- `src/lib/historical-strength.ts`

## Validation Result

- Top-20 teams passing win-rate benchmark after correction: 19 of 20
- Top-20 teams still needing review: 1 of 20

The remaining review row is Czechoslovakia, which was already flagged in `VALIDATION_REPORT.md` as a source-data/team-successor-scope audit item rather than the penalty-shootout bug.

## Teams Affected

The following teams changed win rate because at least one penalty-shootout match had previously been counted as a win:

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
- Russia
- Croatia

## Summary Table

See `win_rate_correction_summary.csv` for the row-level comparison of old win rate, new win rate, expected benchmark win rate, and validation status.
