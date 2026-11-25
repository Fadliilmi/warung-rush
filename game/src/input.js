// Warung Rush — input. One clear job: translate mouse clicks and keys
// into game actions. Knows the layout; owns no game rules.
import { INGREDIENTS } from "./config.js";
import { addIngredient, clearPan, serveOrder, startGame, layout } from "./state.js";
import { sfx } from "./audio.js";

function inside(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function ingredientRects() {
  const L = layout();
  const w = 140;
  const gap = 12;
  return INGREDIENTS.map((ing, i) => ({
    ing,
    rect: { x: L.counter.x + 16 + i * (w + gap), y: L.counter.y + 52, w, h: 78 },
  }));
}

export function orderRects(state) {
  const L = layout();
  return state.orders.map((o, i) => ({
    order: o,
    index: i,
    rect: { x: L.board.x + 190 + i * (L.orderW + 16), y: L.board.y + 14, w: L.orderW, h: 90 },
  }));
}

export function attachInput(canvas, state) {
  canvas.addEventListener("click", (ev) => {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (canvas.width / r.width);
    const y = (ev.clientY - r.top) * (canvas.height / r.height);
    handleClick(state, x, y);
  });
  window.addEventListener("keydown", (ev) => {
    handleKey(state, ev.key);
  });
}

function handleClick(state, x, y) {
  const L = layout();
  if (state.screen === "title") { startGame(state); sfx.chop(); return; }
  if (state.screen === "over") { startGame(state); sfx.chop(); return; }
  if (inside(x, y, L.trash)) { clearPan(state); sfx.wrong(); return; }
  for (const { ing, rect } of ingredientRects()) {
    if (inside(x, y, rect)) {
      const res = addIngredient(state, ing.id);
      if (res === "ok") sfx.chop();
      else sfx.wrong();
      return;
    }
  }
  if (state.plate && inside(x, y, L.plate)) {
    // Clicking the plate highlights it; serving happens on a ticket.
    return;
  }
  for (const { index, rect } of orderRects(state)) {
    if (inside(x, y, rect)) {
      const res = serveOrder(state, index);
      if (res === "served") sfx.served();
      else if (res === "wrong") sfx.wrong();
      return;
    }
  }
}

function handleKey(state, key) {
  if (key === "r" || key === "R") { startGame(state); return; }
  if (state.screen === "title" || state.screen === "over") {
    if (key === "Enter" || key === " ") startGame(state);
    return;
  }
  const ing = INGREDIENTS.find((i) => i.key === key);
  if (ing) {
    const res = addIngredient(state, ing.id);
    if (res === "ok") sfx.chop();
    else sfx.wrong();
    return;
  }
  if (key === "Backspace" || key === "Delete") { clearPan(state); sfx.wrong(); return; }
  if (key === "Enter" && state.plate) {
    // Serve the first matching ticket, if any.
    const idx = state.orders.findIndex((o) => o.dishId === state.plate);
    if (idx >= 0) {
      const res = serveOrder(state, idx);
      if (res === "served") sfx.served();
    } else {
      sfx.wrong();
    }
  }
}
