import { Router } from "express";
import { authverification, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createBookingSchema, confirmBookingSchema } from "./booking.validate.js";
import * as bookingController from "./booking.controller.js";
import { UserRole } from "../../types/user.js";
import { completeBookingSchema} from "./booking-completion.validate.js";

const router = Router();

router.use(authverification);

router.post( "/bookings", authorize(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER), validate(createBookingSchema), bookingController.createBooking);
router.patch("/:bookingId/claim", authorize(UserRole.WASTE_COLLECTOR), bookingController.claimBooking);
router.patch( "/:bookingId/complete", authorize(UserRole.WASTE_COLLECTOR), validate(completeBookingSchema), bookingController.completeBooking);
router.patch( "/:bookingId/confirm", authverification, authorize(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER),validate(confirmBookingSchema), bookingController.confirmBooking);

export default router;