import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as bookingService from "./booking.service.js";

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(
    req.user.sub,
    req.body
  );

  return sendSuccess( res, 201, "Booking created successfully", booking);
});

export const claimBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.claimBooking(
    req.params.bookingId,
    req.user.sub
  );

  return sendSuccess( res, 200, "Booking claimed successfully", booking);
});

export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(
    req.params.bookingId,
    req.user.sub,
    req.body
  );

  return sendSuccess( res, 200, "Booking completed successfully", booking);
});

export const confirmBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { confirmationStatus } = req.body;

  const booking = await bookingService.confirmBooking(
    bookingId,
    req.user.id,
    confirmationStatus
  );

  return sendSuccess( res, 200, "Booking confirmation recorded", { booking });
});


