import { AppDataSource } from "../../config/db.js";
import { BookingStatus, CompletionStatus, ConfirmationStatus} from "../../types/bookingstatus.js";
import { AppError } from "../../utils/AppError.js";
import * as eventService from "../eventlog/eventlog.services.js"
import { UserRole } from "../../types/user.js";

const bookingRepository = AppDataSource.getRepository("Booking");
const bookingStatusLogRepository = AppDataSource.getRepository("BookingStatusLog");


export const createBooking = async (userId, payload) => {
  return await AppDataSource.transaction(async (manager) => {
    const user = await manager.getRepository("User").findOne({
      where: { id: userId },
    });
      if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
    const userType = user.role === UserRole.HOUSEHOLD ? "Household" : `Business - ${user.businessType}`;
    
    const booking = manager.getRepository("Booking").create({
      requester: { id: userId },
      waste_type: payload.waste_type,
      quantity: payload.quantity,
      lga: payload.lga,
      area: payload.area,
      address_text: payload.address_text,
      time_window_start: payload.time_window_start,
      time_window_end: payload.time_window_end,
    });

    const savedBooking = await manager.getRepository("Booking").save(booking);

    await manager.getRepository("BookingStatusLog").save({
      booking: savedBooking,
      status: BookingStatus.BOOKED,
    });

    await eventService.logBookingCreated({
      zone: savedBooking.lga,
      userType: userType,
      userId: userId,
      wasteType: savedBooking.waste_type,
      requestedPickupDate: savedBooking.time_window_start,
      priceQuoted: savedBooking.price_agreed,
      paymentMethodIntent: payload.payment_method_intent,
    });

    return savedBooking;
  });
};

//
export const claimBooking = async (bookingId, pickerId) => {
  return await AppDataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository("Booking");

    const updateResult = await bookingRepo
      .createQueryBuilder()
      .update(Booking)
      .set({ status: BookingStatus.CLAIMED, picker: { id: pickerId } })
      .where("booking_id = :bookingId", { bookingId })
      .andWhere("status = :status", { status: BookingStatus.BOOKED })
      .execute();

    if (updateResult.affected === 0) {
      const exists = await bookingRepo.findOne({ where: { booking_id: bookingId } });
      if (!exists) throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
      throw new AppError("Booking is no longer available", 409, "BOOKING_NOT_AVAILABLE");
    }

    const savedBooking = await bookingRepo.findOne({ where: { booking_id: bookingId } });

    await manager.getRepository("BookingStatusLog").save({
      booking: savedBooking,
      status: BookingStatus.CLAIMED,
    });

    await eventService.logBookingMatched({
      bookingId,
      pickerId,
      zone: savedBooking.lga,
    });

    return savedBooking;
  });
};


export const completeBooking = async (bookingId, pickerId, payload) => {
  return await AppDataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository("Booking");

    const booking = await bookingRepo.findOne({
      where: { booking_id: bookingId },
      relations: ['picker'],
    });

    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    if (booking.picker?.id !== pickerId) {
      throw new AppError("You are not assigned to this booking", 403, "NOT_ASSIGNED_TO_BOOKING");
    }

    if (booking.status !== BookingStatus.CLAIMED) {
      throw new AppError("Booking cannot be completed", 409, "BOOKING_NOT_CLAIMED");
    }

    booking.actual_weight_or_bags = payload.actual_weight_or_bags;
    booking.completion_status = payload.completion_status;
    booking.completed_at = new Date();

    booking.status = payload.completion_status === CompletionStatus.COMPLETED ? BookingStatus.COMPLETED : BookingStatus.FAILED; 

    const savedBooking = await bookingRepo.save(booking);

    await manager.getRepository("BookingStatusLog").save({
      booking: savedBooking,
      status: savedBooking.status, // matches reality now
    });

    await eventService.logPickupCompleted({
      bookingId,
      pickerId,
      actualWeightOrBags: savedBooking.actual_weight_or_bags,
      completionStatus: savedBooking.completion_status,
    });

    return savedBooking;
  });
};

export const confirmBooking = async (bookingId, userId, confirmationStatus) => {
  return await AppDataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository("Booking");

    const booking = await bookingRepo.findOne({
      where: { booking_id: bookingId },
      relations: ["requester"],
    });

    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    if (booking.requester?.id !== userId) {
      throw new AppError( "You are not the requester of this booking", 403, "NOT_BOOKING_REQUESTER");
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError( "Booking has not been completed", 409, "BOOKING_NOT_COMPLETED");
    }

    booking.confirmation_status = confirmationStatus;
    booking.confirmation_timestamp = new Date();

    const savedBooking = await bookingRepo.save(booking);

    await eventService.logPickupConfirmed({
      bookingId,
      confirmationStatus,
    });

    return savedBooking;
  });
};