export const BookingStatus = Object.freeze({
  BOOKED: "booked",
  PICKED_UP: "picked_up",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  CLAIMED: "claimed",
  FAILED: "failed",
});

export const CompletionStatus = Object.freeze({
  COMPLETED: "completed",
  NO_SHOW: "no_show",
  CANCELLED: "cancelled",
});

export const ConfirmationStatus = Object.freeze({
  PENDING: "pending",
  HOUSEHOLD_CONFIRMED: "household_confirmed",
  AUTO_CONFIRMED: "auto_confirmed",
  DISPUTED: "disputed",
});