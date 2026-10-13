export const ORDER_STATUSES = ["NEW", "PREPARING", "READY", "PICKED_UP", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderStatusLabel: Record<OrderStatus, string> = {
  NEW: "Nowe",
  PREPARING: "W przygotowaniu",
  READY: "Gotowe",
  PICKED_UP: "Odebrane",
  CANCELLED: "Anulowane",
};

/** Następny krok w typowym przebiegu – główny przycisk na karcie zamówienia. */
export const nextOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "PREPARING",
  PREPARING: "READY",
  READY: "PICKED_UP",
};

export const nextOrderActionLabel: Partial<Record<OrderStatus, string>> = {
  NEW: "Zacznij przygotowanie",
  PREPARING: "Oznacz jako gotowe",
  READY: "Oznacz jako odebrane",
};

export const RESERVATION_STATUSES = ["NEW", "CONFIRMED", "CANCELLED"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  NEW: "Nowa",
  CONFIRMED: "Potwierdzona",
  CANCELLED: "Anulowana",
};

export function isOrderStatus(v: string): v is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(v);
}

export function isReservationStatus(v: string): v is ReservationStatus {
  return (RESERVATION_STATUSES as readonly string[]).includes(v);
}
