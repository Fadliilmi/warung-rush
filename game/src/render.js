// Warung Rush — rendering. One clear job: draw the kitchen on the canvas
// from the state. No rules, no input, only pixels.
import { CANVAS_W, CANVAS_H, INGREDIENTS, ingredientById, dishById } from "./config.js";
import { layout, dishInPan } from "./state.js";
import { ingredientRects, orderRects } from "./input.js";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = "left", bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? "bold " : ""}${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}

function ingredientChip(ctx, id, x, y, r) {
  const ing = ingredientById(id);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = ing.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#5d4037";
  ctx.stroke();
  text(ctx, ing.label, x, y, Math.max(10, r * 0.42), "#3e2723", "center", true);
}

function dishDrawing(ctx, dishId, x, y, scale) {
  // A plated dish: plate, mound of food, garnish dots. Drawn, not an image.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 62, 44, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#bcaaa4";
  ctx.stroke();
  const dish = dishById(dishId);
  const colors = dish.needs.map((n) => ingredientById(n).color);
  ctx.beginPath();
  ctx.ellipse(0, -4, 44, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors[0];
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-14, 4, 22, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors[1];
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 6, 18, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors[2];
  ctx.fill();
  ctx.restore();
}

function drawBoard(ctx, state) {
  const L = layout();
  rr(ctx, L.board.x, L.board.y, L.board.w, L.board.h, 12);
  ctx.fillStyle = "#6d4c41";
  ctx.fill();
  text(ctx, "ORDER BOARD", L.board.x + 18, L.board.y + 30, 20, "#ffcc80", "left", true);
  text(ctx, "click a ticket to serve", L.board.x + 18, L.board.y + 58, 13, "#ffe0b2");
  text(ctx, "WARUNG RUSH", L.board.x + 18, L.board.y + 88, 13, "#ffcc80", "left", true);
  for (const { order, rect } of orderRects(state)) {
    const dish = dishById(order.dishId);
    const frac = 1 - order.waited / order.patience;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = frac < 0.3 ? "#ff5252" : "#fff3e0";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#4e342e";
    ctx.stroke();
    text(ctx, dish.name, rect.x + 12, rect.y + 22, 18, "#3e2723", "left", true);
    text(ctx, dish.needs.map((n) => ingredientById(n).label).join(" + "), rect.x + 12, rect.y + 48, 13, "#6d4c41");
    text(ctx, `${dish.price} coins`, rect.x + 12, rect.y + 72, 14, "#2e7d32", "left", true);
    // Patience bar.
    ctx.fillStyle = "#d7ccc8";
    ctx.fillRect(rect.x + 150, rect.y + 64, 130, 10);
    ctx.fillStyle = frac < 0.3 ? "#d32f2f" : "#43a047";
    ctx.fillRect(rect.x + 150, rect.y + 64, 130 * Math.max(0, frac), 10);
  }
  if (state.orders.length === 0) {
    text(ctx, "No orders — take a breath, chef.", L.board.x + 200, L.board.y + 60, 16, "#ffe0b2");
  }
}

function drawStove(ctx, state) {
  const L = layout();
  rr(ctx, L.stove.x, L.stove.y, L.stove.w, L.stove.h, 12);
  ctx.fillStyle = "#8d6e63";
  ctx.fill();
  text(ctx, "STOVE — click ingredients below to fill the pan", L.stove.x + 16, L.stove.y + 26, 15, "#fff8e1", "left", true);
  // Pan.
  const cx = L.stove.x + L.stove.w / 2;
  const cy = L.stove.y + 150;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 150, 62, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#37474f";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#263238";
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 132, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#455a64";
  ctx.fill();
  state.pan.forEach((id, i) => {
    ingredientChip(ctx, id, cx - 70 + i * 70, cy - 6, 30);
  });
  if (state.pan.length === 0) {
    text(ctx, "empty pan", cx, cy, 16, "#b0bec5", "center");
  }
  const dish = dishInPan(state);
  if (dish && state.cookProgress < 1) {
    // Cooking progress bar — the dish mid-assembly.
    const bw = 300;
    const bx = cx - bw / 2;
    const by = L.stove.y + L.stove.h - 42;
    ctx.fillStyle = "#d7ccc8";
    ctx.fillRect(bx, by, bw, 18);
    ctx.fillStyle = "#ff7043";
    ctx.fillRect(bx, by, bw * state.cookProgress, 18);
    text(ctx, `Cooking ${dish.name}… ${Math.round(state.cookProgress * 100)}%`, cx, by - 16, 14, "#fff8e1", "center", true);
  } else if (dish) {
    text(ctx, `${dish.name} is ready — plate it!`, cx, L.stove.y + L.stove.h - 26, 15, "#ffcc80", "center", true);
  } else if (state.pan.length > 0) {
    text(ctx, `${state.pan.length}/3 in the pan — check the order board`, cx, L.stove.y + L.stove.h - 26, 14, "#ffe0b2", "center");
  }
}

function drawPlate(ctx, state) {
  const L = layout();
  rr(ctx, L.plate.x, L.plate.y, L.plate.w, L.plate.h, 12);
  ctx.fillStyle = "#a1887f";
  ctx.fill();
  text(ctx, "PLATE — ready to serve", L.plate.x + 16, L.plate.y + 26, 15, "#fff8e1", "left", true);
  if (state.plate) {
    dishDrawing(ctx, state.plate, L.plate.x + L.plate.w / 2, L.plate.y + 120, 1.4);
    text(ctx, dishById(state.plate).name, L.plate.x + L.plate.w / 2, L.plate.y + 200, 18, "#ffffff", "center", true);
    text(ctx, "click its ticket above!", L.plate.x + L.plate.w / 2, L.plate.y + 224, 13, "#ffe0b2", "center");
  } else {
    ctx.beginPath();
    ctx.ellipse(L.plate.x + L.plate.w / 2, L.plate.y + 120, 86, 60, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#efebe9";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#bcaaa4";
    ctx.stroke();
    text(ctx, "empty plate", L.plate.x + L.plate.w / 2, L.plate.y + 120, 15, "#8d6e63", "center");
  }
}

function drawCounter(ctx, state) {
  const L = layout();
  rr(ctx, L.counter.x, L.counter.y, L.counter.w, L.counter.h, 12);
  ctx.fillStyle = "#795548";
  ctx.fill();
  text(ctx, "COUNTER — ingredients (keys 1-8)", L.counter.x + 16, L.counter.y + 26, 15, "#ffcc80", "left", true);
  for (const { ing, rect } of ingredientRects()) {
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = "#fff3e0";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#4e342e";
    ctx.stroke();
    ingredientChip(ctx, ing.id, rect.x + rect.w / 2, rect.y + 28, 22);
    text(ctx, `${ing.label}  [${ing.key}]`, rect.x + rect.w / 2, rect.y + 62, 13, "#3e2723", "center", true);
  }
}

function drawHud(ctx, state) {
  const L = layout();
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const timeText = `${mins}:${String(secs).padStart(2, "0")}`;
  text(ctx, `⏱ ${timeText}`, 190, 672, 26, state.timeLeft < 15 ? "#d32f2f" : "#3e2723", "left", true);
  text(ctx, `🪙 ${state.coins} coins`, 330, 672, 22, "#3e2723", "left", true);
  text(ctx, `🍽 Served ${state.served}   Lost ${state.lost}   Combo x${state.combo}`, 560, 672, 20, "#3e2723", "left", true);
  // Trash.
  rr(ctx, L.trash.x, L.trash.y, L.trash.w, L.trash.h, 10);
  ctx.fillStyle = "#efebe9";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#4e342e";
  ctx.stroke();
  text(ctx, "🗑 Trash pan", L.trash.x + 75, L.trash.y + 30, 15, "#3e2723", "center", true);
  if (state.message && state.now - state.messageAt < 3) {
    text(ctx, state.message, CANVAS_W / 2, 452, 18, "#3e2723", "center", true);
  }
}

function drawTitle(ctx) {
  ctx.fillStyle = "#f6e3c0";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(0, 0, CANVAS_W, 90);
  text(ctx, "🍜 WARUNG RUSH 🍜", CANVAS_W / 2, 46, 44, "#ffcc80", "center", true);
  text(ctx, "The little warung that could — cook fast, serve faster.", CANVAS_W / 2, 140, 24, "#5d4037", "center");
  text(ctx, "Read the order board. Click ingredients onto the stove.", CANVAS_W / 2, 220, 20, "#3e2723", "center");
  text(ctx, "When the pan is full it cooks itself — then serve the ticket.", CANVAS_W / 2, 255, 20, "#3e2723", "center");
  text(ctx, "Wrong mix? Trash the pan and start over. 120-second shift.", CANVAS_W / 2, 290, 20, "#3e2723", "center");
  dishDrawing(ctx, "nasi-goreng", CANVAS_W / 2 - 130, 420, 1.6);
  dishDrawing(ctx, "sate-ayam", CANVAS_W / 2 + 130, 420, 1.6);
  text(ctx, "CLICK TO START  •  keys 1-8 cook, Enter serves, R restarts", CANVAS_W / 2, 560, 22, "#bf360c", "center", true);
  text(ctx, "A complete cooking game: order board, counter, stove, timer, plate.", CANVAS_W / 2, 620, 15, "#8d6e63", "center");
}

function drawOver(ctx, state) {
  ctx.fillStyle = "rgba(43,29,18,0.82)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, "SHIFT OVER!", CANVAS_W / 2, 240, 56, "#ffcc80", "center", true);
  text(ctx, `You served ${state.served} dishes, lost ${state.lost}, and earned ${state.coins} coins.`, CANVAS_W / 2, 320, 24, "#ffffff", "center");
  text(ctx, `Best combo: x${state.bestCombo}`, CANVAS_W / 2, 360, 22, "#ffffff", "center");
  text(ctx, "CLICK OR PRESS R TO COOK AGAIN", CANVAS_W / 2, 440, 22, "#ffcc80", "center", true);
}

export function render(ctx, state) {
  if (state.screen === "title") { drawTitle(ctx); return; }
  ctx.fillStyle = "#f6e3c0";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Kitchen wall + floor.
  ctx.fillStyle = "#ffe0b2";
  ctx.fillRect(0, 0, CANVAS_W, 150);
  ctx.fillStyle = "#d7a86a";
  ctx.fillRect(0, 640, CANVAS_W, 80);
  drawBoard(ctx, state);
  drawStove(ctx, state);
  drawPlate(ctx, state);
  drawCounter(ctx, state);
  drawHud(ctx, state);
  if (state.screen === "over") drawOver(ctx, state);
}
