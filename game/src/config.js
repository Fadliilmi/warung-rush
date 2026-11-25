// Warung Rush — menu, recipes and tuning. One clear job: the data the
// rest of the game plays with. No logic lives here, only numbers.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const SHIFT_SECONDS = 120;
export const ORDER_PATIENCE = 32; // seconds before a waiting order walks away
export const COOK_SECONDS = 4; // seconds a full pan needs on the stove
export const MAX_ORDERS = 3;
export const MAX_PAN = 3;

// Ingredient catalogue: id, label, colour, keyboard key.
export const INGREDIENTS = [
  { id: "rice", label: "Nasi", color: "#fff8e7", key: "1" },
  { id: "noodle", label: "Mie", color: "#f2c14e", key: "2" },
  { id: "egg", label: "Telur", color: "#ffd94d", key: "3" },
  { id: "chili", label: "Sambal", color: "#d9381e", key: "4" },
  { id: "veg", label: "Sayur", color: "#4caf50", key: "5" },
  { id: "skewer", label: "Sate", color: "#8d5524", key: "6" },
  { id: "peanut", label: "Kacang", color: "#c68a4b", key: "7" },
  { id: "sauce", label: "Kecap", color: "#5d4037", key: "8" },
];

// Dishes on the menu: name, price in coins, the three ingredients it needs.
export const DISHES = [
  { id: "nasi-goreng", name: "NASI GORENG", price: 12, needs: ["rice", "egg", "chili"] },
  { id: "mie-goreng", name: "MIE GORENG", price: 11, needs: ["noodle", "egg", "veg"] },
  { id: "sate-ayam", name: "SATE AYAM", price: 14, needs: ["skewer", "peanut", "chili"] },
  { id: "gado-gado", name: "GADO-GADO", price: 10, needs: ["veg", "peanut", "egg"] },
  { id: "nasi-kecap", name: "NASI KECAP", price: 9, needs: ["rice", "sauce", "veg"] },
];

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id);
}

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

// Tip scales with how much patience is left when the dish is served.
export function tipFor(order, servedAtSeconds) {
  const left = Math.max(0, order.patience - servedAtSeconds);
  return Math.round((left / ORDER_PATIENCE) * 6);
}
