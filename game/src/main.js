// Warung Rush — entry point. One clear job: run the loop, wire input,
// and stage deterministic states for screenshots (?shot=start|play|serve).
import { CANVAS_W, CANVAS_H } from "./config.js";
import { newGame, startGame, spawnOrder, tick, flash } from "./state.js";
import { render } from "./render.js";
import { attachInput } from "./input.js";
import { sfx } from "./audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const state = newGame();
attachInput(canvas, state);

// Deterministic screenshot states: real renders of this game's own code.
function applyShot() {
  const shot = new URLSearchParams(location.search).get("shot");
  if (!shot) return;
  startGame(state);
  if (shot === "start") {
    state.screen = "title";
    return;
  }
  if (shot === "play") {
    // Mid-assembly: two orders waiting, pan half full and cooking a dish,
    // timer running, plate empty — the kitchen at work.
    state.orders = [
      { dishId: "nasi-goreng", patience: 32, waited: 6 },
      { dishId: "sate-ayam", patience: 32, waited: 14 },
      { dishId: "mie-goreng", patience: 32, waited: 2 },
    ];
    state.pan = ["rice", "egg"];
    state.timeLeft = 87;
    state.coins = 23;
    state.served = 2;
    state.combo = 2;
    flash(state, "Cooking NASI GORENG — one more ingredient!");
    return;
  }
  if (shot === "serve") {
    // Plate ready to serve: dish finished, matching ticket waiting.
    state.orders = [
      { dishId: "nasi-goreng", patience: 32, waited: 9 },
      { dishId: "gado-gado", patience: 32, waited: 20 },
    ];
    state.plate = "nasi-goreng";
    state.timeLeft = 64;
    state.coins = 41;
    state.served = 4;
    state.combo = 3;
    flash(state, "NASI GORENG ready — serve it!");
    return;
  }
  if (shot === "end") {
    state.screen = "over";
    state.served = 9;
    state.lost = 2;
    state.coins = 118;
    state.bestCombo = 4;
  }
}

applyShot();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const ev = tick(state, dt);
  if (ev === "plated") sfx.plated();
  else if (ev === "served") sfx.served();
  else if (ev === "wrong") sfx.wrong();
  else if (ev === "gameover") sfx.gameOver();
  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
