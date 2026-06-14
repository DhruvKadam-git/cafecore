import { KDSOrder } from "./kds-types";

export const INITIAL_KDS_ORDERS: KDSOrder[] = [
  {
    id: "#0041",
    table: "Table 3",
    stage: "to-cook",
    elapsed: 2,
    note: "No onion",
    items: [
      { id: 1, name: "Flat White", quantity: 2, done: false },
      { id: 2, name: "Butter Croissant", quantity: 1, done: false },
      { id: 3, name: "Avocado Toast", quantity: 1, done: false },
    ],
  },
  {
    id: "#0040",
    table: "Bar",
    stage: "preparing",
    elapsed: 9,
    items: [
      { id: 1, name: "Americano", quantity: 1, done: true },
      { id: 2, name: "Grilled Cheese", quantity: 1, done: false },
    ],
  },
  {
    id: "#0039",
    table: "Table 12",
    stage: "ready",
    elapsed: 14,
    items: [
      { id: 1, name: "Cappuccino", quantity: 2, done: true },
      { id: 2, name: "Blueberry Muffin", quantity: 1, done: true },
    ],
  },
  {
    id: "#0038",
    table: "Table 7",
    stage: "ready",
    elapsed: 15,
    items: [
      { id: 1, name: "Latte", quantity: 1, done: true },
      { id: 2, name: "Banana Bread", quantity: 1, done: true },
    ],
  },
  {
    id: "#0037",
    table: "Table 2",
    stage: "to-cook",
    elapsed: 2,
    items: [
      { id: 1, name: "Espresso", quantity: 1, done: false },
      { id: 2, name: "Sandwich", quantity: 1, done: false },
      { id: 3, name: "Cold Brew", quantity: 1, done: false },
    ],
  },
  {
    id: "#0036",
    table: "Table 11",
    stage: "preparing",
    elapsed: 5,
    items: [
      { id: 1, name: "Chai Latte", quantity: 2, done: false },
      { id: 2, name: "Croissant", quantity: 1, done: true },
    ],
  },
];
