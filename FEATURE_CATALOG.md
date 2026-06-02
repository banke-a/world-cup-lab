# Feature Catalog

The first feature engineering pass prepares historical World Cup team features only. It does not train
or score a prediction model.

Generated command:

```bash
npm run build:features
```

## Raw entities

### `Tournament`

Primary key: `tournament_id`

Core fields: `tournament_name`, `year`, `start_date`, `end_date`, `host_country`, `winner`,
`count_teams`, and tournament-format flags.

### `Team`

Primary key: `team_id`

Core fields: `team_name`, `team_code`, `region_name`, `confederation_id`,
`confederation_name`, and `confederation_code`.

### `Match`

Primary key: `match_id`

Relationships:

- `tournament_id` references `Tournament.tournament_id`
- `home_team_id` references `Team.team_id`
- `away_team_id` references `Team.team_id`

Core fields: stage, match date, home/away teams, final score, extra-time flag, penalty-shootout
flag, and result.

### `TournamentStanding`

Primary key: `tournament_id + position`

Relationships:

- `tournament_id` references `Tournament.tournament_id`
- `team_id` references `Team.team_id`

Note: this table provides top-four results in the downloaded core data.

### `QualifiedTeam`

Primary key: `tournament_id + team_id`

Relationships:

- `tournament_id` references `Tournament.tournament_id`
- `team_id` references `Team.team_id`

Used to calculate appearances and per-tournament team features.

## Processed tables

### `cleaned_tournaments.csv`

Location: `data/worldcup/processed/cleaned_tournaments.csv`

Adds `tournament_gender` and keeps compact tournament metadata.

### `cleaned_teams.csv`

Location: `data/worldcup/processed/cleaned_teams.csv`

Keeps compact team and confederation metadata.

### `cleaned_matches.csv`

Location: `data/worldcup/processed/cleaned_matches.csv`

Keeps compact match-level results for feature engineering.

### `cleaned_tournament_results.csv`

Location: `data/worldcup/processed/cleaned_tournament_results.csv`

Keeps top-four tournament result records.

### `team_tournament_features.csv`

Location: `data/worldcup/processed/team_tournament_features.csv`

One row per team per tournament.

| Feature | Definition |
| --- | --- |
| `matches_played` | Matches played by the team in the tournament |
| `goals_scored` | Total goals scored by the team in match score fields |
| `goals_conceded` | Total goals conceded by the team in match score fields |
| `goals_scored_per_match` | `goals_scored / matches_played` |
| `goals_conceded_per_match` | `goals_conceded / matches_played` |
| `result_position` | Exact top-four placement when present in `tournament_standings.csv` |
| `performance` | Stage/performance label from `qualified_teams.csv` |
| `finish_position_estimate` | Exact top-four position when available, otherwise documented stage fallback |

Stage fallback used for `finish_position_estimate`:

| Performance | Estimate |
| --- | ---: |
| `final` | 2 |
| `third-place match` | 4 |
| `semi-finals` | 4 |
| `quarter-finals` | 8 |
| `round of 16` | 16 |
| `second group stage` | 12 |
| `final round` | 6 |
| `group stage` | 24 |

### `team_feature_store.csv`

Location: `data/worldcup/processed/team_feature_store.csv`

One row per normalized team and tournament gender. This is the initial feature store that can later be joined
with FIFA rankings, ELO ratings, and recent-form features.

| Feature | Definition |
| --- | --- |
| `world_cup_appearances` | Count of distinct tournament appearances from `qualified_teams.csv` |
| `titles` | Count of first-place tournament finishes from `tournament_standings.csv` |
| `finals_appearances` | Count of top-two finishes or `performance = final` rows |
| `semi_final_appearances` | Count of top-four finishes or semi-final-stage performance rows |
| `best_finish_position` | Minimum `finish_position_estimate` for the team |
| `best_finish_label` | Exact position label if available, otherwise best performance label |
| `average_finish_position_estimate` | Mean of `finish_position_estimate` across appearances |
| `total_matches_played` | Total World Cup matches played across appearances |
| `total_wins` | Match wins across appearances |
| `goals_scored` | Total World Cup goals scored |
| `goals_conceded` | Total World Cup goals conceded |
| `win_rate` | `total_wins / total_matches_played * 100` |
| `goals_scored_per_tournament` | Total goals scored divided by appearances |
| `goals_conceded_per_tournament` | Total goals conceded divided by appearances |
| `goals_scored_per_match` | Total goals scored divided by total matches played |
| `goals_conceded_per_match` | Total goals conceded divided by total matches played |

### `historical_strength_rankings.csv`

Location: `data/worldcup/processed/historical_strength_rankings.csv`

One row per normalized men's team, ranked by Historical Strength Score.

Scoring formula:

```text
Historical Strength Score =
  0.30 * appearances_score
+ 0.25 * titles_score
+ 0.20 * finals_score
+ 0.15 * semi_finals_score
+ 0.10 * win_rate_score
```

Scaling:

- `appearances_score`: team appearances scaled to 0-100 against the max appearances value.
- `titles_score`: titles scaled to 0-100 against the max titles value.
- `finals_score`: finals appearances scaled to 0-100 against the max finals value.
- `semi_finals_score`: semi-final appearances scaled to 0-100 against the max semi-final value.
- `win_rate_score`: match win rate on its natural 0-100 percentage scale.

This is a historical football strength index. It is not a prediction model and does not produce win
probabilities.

### `normalization_comparison.csv`

Location: `data/worldcup/processed/normalization_comparison.csv`

Compares appearance rankings before and after team identity normalization.

### Unnormalized outputs

For auditability, the pipeline also writes:

- `data/worldcup/processed/team_tournament_features_unnormalized.csv`
- `data/worldcup/processed/team_feature_store_unnormalized.csv`

## Future joins

The feature store is keyed by `team_id`, `team_code`, `team_name`, and `tournament_gender`.
Future external features should join on stable country/team identifiers where possible:

- FIFA rankings: likely by `team_code` plus ranking date
- ELO ratings: likely by normalized team name/code plus rating date
- Recent form: likely by team identifier plus match date window

Keep those future sources as separate raw datasets and add their assumptions to this catalog before
combining them with the World Cup history features.
