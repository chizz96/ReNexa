import { Router } from "express";
import { authverification, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createBookingSchema,assignPickerSchema } from "./booking.validate.js";
import * as bookingController from "./booking.controller.js";
import { UserRole } from "../../types/user.js";
import { completeBookingSchema } from "./booking-completion.validate.js";

const router = Router();

router.use(authverification);

router.post( "/bookings", authorize(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER), validate(createBookingSchema), bookingController.createBooking);
router.get( "/bookings/all", authorize(UserRole.ADMIN), bookingController.getAllBookings);
router.get( "/bookings/mine", authorize(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER, UserRole.ADMIN), bookingController.getMyBookings);
router.get( "/bookings/picker/:pickerId", authorize(UserRole.ADMIN), bookingController.getBookingsByPickerId);
router.get( "/bookings", authorize(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER, UserRole.ADMIN), bookingController.getBookings);
router.get( "/bookings/:bookingId", authorize(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER, UserRole.ADMIN), bookingController.getBookingById);  
router.patch("/:bookingId/assign", authorize(UserRole.ADMIN), validate(assignPickerSchema), bookingController.assignPickerToBooking);
router.patch( "/:bookingId/complete", authorize(UserRole.ADMIN), validate(completeBookingSchema), bookingController.completeBooking);

export default router;