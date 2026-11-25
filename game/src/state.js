// Warung Rush — game state. One clear job: the mutable state and the
// rules that change it (orders, pan, plate, timer, score). No drawing here.
import {
  CANVAS_W, CANVAS_H, SHIFT_SECONDS, ORDER_PATIENCE, COOK_SECONDS,
  MAX_ORDERS, MAX_PAN, DISHES, dishById,
} from "./config.js";

export function newGame() {
  return {
    screen: "title", // title | playing | over
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    orders: [], // { dishId, patience, waited }
    pan: [], // ingredient ids in the pan
    cookProgress: 0, // 0..1 while the pan holds a full recipe
    plate: null, // dishId ready to serve, or null
    message: "",
    messageAt: 0,
    now: 0,
    nextOrderIn: 1.5,
    rngSeed: 1,
  };
}

// Tiny deterministic PRNG so screenshot states are reproducible.
export function nextRandom(state) {
  state.rngSeed = (state.rngSeed * 1103515245 + 12345) % 2147483648;
  return state.rngSeed / 2147483648;
}

export function spawnOrder(state) {
  const dish = DISHES[Math.floor(nextRandom(state) * DISHES.length)];
  state.orders.push({ dishId: dish.id, patience: ORDER_PATIENCE, waited: 0 });
}

export function startGame(state) {
  Object.assign(state, newGame(), { screen: "playing" });
  spawnOrder(state);
  spawnOrder(state);
}

export function addIngredient(state, id) {
  if (state.screen !== "playing" || state.plate) return "plate-busy";
  if (state.pan.length >= MAX_PAN) return "pan-full";
  state.pan.push(id);
  state.cookProgress = 0;
  return "ok";
}

export function clearPan(state) {
  state.pan = [];
  state.cookProgress = 0;
}

export function dishInPan(state) {
  if (state.pan.length !== MAX_PAN) return null;
  const sorted = [...state.pan].sort().join(",");
  return DISHES.find((d) => [...d.needs].sort().join(",") === sorted) ?? null;
}

// Advance the simulation by dt seconds. Returns an event name for sound.
export function tick(state, dt) {
  state.now += dt;
  if (state.screen !== "playing") return null;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = "over";
    return "gameover";
  }
  for (const o of state.orders) o.waited += dt;
  const expired = state.orders.find((o) => o.waited >= o.patience);
  if (expired) {
    state.orders = state.orders.filter((o) => o !== expired);
    state.lost += 1;
    state.combo = 0;
    flash(state, `Order ${dishById(expired.dishId).name} walked away!`);
    return "wrong";
  }
  state.nextOrderIn -= dt;
  if (state.orders.length < MAX_ORDERS && state.nextOrderIn <= 0) {
    spawnOrder(state);
    state.nextOrderIn = 6 + nextRandom(state) * 5;
  }
  const dish = dishInPan(state);
  if (dish) {
    state.cookProgress += dt / COOK_SECONDS;
    if (state.cookProgress >= 1) {
      state.cookProgress = 1;
      state.plate = dish.id;
      state.pan = [];
      flash(state, `${dish.name} ready — serve it!`);
      return "plated";
    }
  }
  return null;
}

export function serveOrder(state, index) {
  if (state.screen !== "playing" || !state.plate) return null;
  const order = state.orders[index];
  if (!order) return null;
  if (order.dishId !== state.plate) {
    flash(state, "Wrong ticket — that guest ordered something else!");
    return "wrong";
  }
  const dish = dishById(order.dishId);
  const tip = Math.round((Math.max(0, order.patience - order.waited) / ORDER_PATIENCE) * 6);
  state.coins += dish.price + tip;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders.splice(index, 1);
  state.plate = null;
  flash(state, `Served ${dish.name} +${dish.price} coins, +${tip} tip!`);
  return "served";
}

export function flash(state, text) {
  state.message = text;
  state.messageAt = state.now;
}

export function layout() {
  // Hit rectangles shared by input and render, in canvas pixels.
  return {
    board: { x: 20, y: 16, w: CANVAS_W - 40, h: 118 },
    orderW: 300,
    stove: { x: 380, y: 170, w: 520, h: 260 },
    plate: { x: 950, y: 180, w: 300, h: 240 },
    counter: { x: 20, y: 470, w: CANVAS_W - 40, h: 150 },
    trash: { x: 20, y: 640, w: 150, h: 60 },
    hud: { x: 20, y: 640, w: CANVAS_W - 40, h: 60 },
  };
}
