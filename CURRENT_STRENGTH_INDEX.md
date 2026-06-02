# Current Strength Index

Phase 1 uses only open-access data with clear licensing.

## Source

- Dataset: `martj42/international_results`
- Results URL: https://raw.githubusercontent.com/martj42/international_results/master/results.csv
- Former names URL: https://raw.githubusercontent.com/martj42/international_results/master/former_names.csv
- License: CC0 1.0 Universal
- Date accessed: 2026-06-02

## Included Features

### Recent form

Uses each team's latest 20 completed matches.

- `wins`
- `draws`
- `losses`
- `points_per_match`
- `recent_form_score = points / (20 * 3) * 100`, adjusted for teams with fewer than 20 matches.

### Recent goal difference

Uses the same latest 20 completed matches.

- `goals_for`
- `goals_against`
- `goal_difference`
- `average_goal_difference`
- `recent_goal_difference_score`

Average goal difference is capped to `[-3, +3]` before scaling to `0-100`.

### Host advantage

2026 host teams receive `host_advantage_score = 100`:

- Canada
- Mexico
- United States

All other teams receive `0`.

## Phase 1 Scoring Formula

```text
Current Strength Score =
  0.65 * recent_form_score
+ 0.25 * recent_goal_difference_score
+ 0.10 * host_advantage_score
```

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
- Some teams may have fewer than 20 completed matches available.
- Phase 1 uses a conservative tournament allowlist rather than a formal FIFA-member registry.
- Phase 1 uses a World Cup-relevant team universe, not every team in the international results dataset.
