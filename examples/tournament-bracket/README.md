# Tournament bracket

`tournament_bracket.eml` runs a single-elimination tournament: pair up
adjacent teams, the stronger rating advances, repeat on the surviving half
until one team is left. Eight teams take exactly three rounds.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a loop whose collection **halves every iteration**
— the list being iterated is replaced by the winners of the round just
played, so the termination condition is the field shrinking rather than a
counter reaching a bound.

Two things are deliberate:

- **Outcomes are decided by rating, not chance.** The corpus's
  execution-truth gate compares interpreter output against a real Python
  run byte for byte, so anything random would differ between the two and
  the case could never pass. Same reason
  [`examples/dice-roll-tally/`](../dice-roll-tally/) and
  [`examples/rock-paper-scissors-simulator/`](../rock-paper-scissors-simulator/)
  use fixed scripted inputs.
- **The draw is arranged to show that seeding is not fairness.** The two
  highest-rated teams — Tigers (95) and Wolves (91) — start in the same
  half, so they meet in the **semi-final**. The second-strongest side is
  eliminated a round early, and Hawks (84, only fourth-strongest) reaches
  the final purely by starting in the emptier half. The strongest team
  still wins here, but the runner-up is decided by bracket position rather
  than merit, which is visible in the printed rounds.

Verify it yourself:

```bash
pnpm eml transpile examples/tournament-bracket/tournament_bracket.eml   # -> Python
pnpm eml run examples/tournament-bracket/tournament_bracket.eml         # -> 3 rounds of matchups + the champion
pnpm eml trace examples/tournament-bracket/tournament_bracket.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/tournament-bracket/tournament_bracket.eml   # -> OK (fixpoint)
```
