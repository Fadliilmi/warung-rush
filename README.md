# warung-rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Fadliilmi/warung-rush/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Fadliilmi/warung-rush/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Warung Rush** — a complete cooking game set in a little Indonesian warung. Read the order board, click ingredients (or press keys 1–8) onto the stove, watch the pan cook, plate the dish and serve its ticket before the guest's patience runs out. Five dishes (Nasi Goreng, Mie Goreng, Sate Ayam, Gado-Gado, Nasi Kecap), a 120-second shift, coins and tips, combos, and a service rush that grows as orders stack up. All art is drawn in code, all sounds are synthesized with WebAudio — no assets, no network.

## Play it

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library. Screenshots are real renders of the game's own code (`?shot=start|play|serve|end` stages deterministic states).

---

<sub>Entered on [make.fun](https://make.fun/?ref=bdkjp2b1&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
