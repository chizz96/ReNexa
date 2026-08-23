import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as bookingService from "./booking.service.js";

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(
    req.user.sub,
    req.body
  );

  return sendSuccess(
    res,
    201,
    "Booking created successfully",
    booking
  );
});

export const assignPickerToBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.assignPickerToBooking(
    req.params.bookingId,
    req.body.pickerId
  );

  return sendSuccess( res, 200, "Picker assigned to booking successfully", booking);
});

export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(
    req.params.bookingId,
    req.user.sub,
    req.body
  );

  return sendSuccess( res, 200, "Booking completed successfully", booking);
});

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBookings(req.user.sub, req.user.role);
  return sendSuccess(res, 200, "Bookings retrieved successfully", bookings);
}); 

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user.sub);
  return sendSuccess(res, 200, "My bookings retrieved successfully", bookings);
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  return sendSuccess(res, 200, "Booking retrieved successfully", booking);
});

export const getBookingsByPickerId = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBookingsByPickerId(req.params.pickerId);
  return sendSuccess(res, 200, "Bookings retrieved successfully", bookings);
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings();
  return sendSuccess(res, 200, "All bookings retrieved successfully", bookings);
});
