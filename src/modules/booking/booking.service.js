import { AppDataSource } from "../../config/db.js";
import { BookingStatus, CompletionStatus} from "../../types/bookingstatus.js";
import { AppError } from "../../utils/AppError.js";


const bookingRepository = AppDataSource.getRepository("Booking");
const bookingStatusLogRepository = AppDataSource.getRepository("BookingStatusLog");


export const createBooking = async (userId, payload) => {
  return await dataSource.transaction(async (manager) => {
    const booking = manager.getRepository(Booking).create({
      requester: { id: userId },
      waste_type: payload.waste_type,
      pickup_address: payload.pickup_address,
      quantity: payload.quantity,
      time_window_start: payload.time_window_start,
      time_window_end: payload.time_window_end,
    });

    const savedBooking = await manager.getRepository(Booking).save(booking);

    await manager.getRepository(BookingStatusLog).save({
      booking: savedBooking,
      status: BookingStatus.BOOKED,
    });

    return savedBooking;
  });
};

//
export const claimBooking = async (bookingId, pickerId) => {
  return await dataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository(Booking);

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

    await manager.getRepository(BookingStatusLog).save({
      booking: savedBooking,
      status: BookingStatus.CLAIMED,
    });

    return savedBooking;
  });
};


export const completeBooking = async (bookingId, pickerId, payload) => {
  return await dataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository(Booking);

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

    booking.status =
      payload.completion_status === CompletionStatus.COMPLETED
        ? BookingStatus.COMPLETED
        : BookingStatus.FAILED; // or whatever your enum defines for non-success paths

    const savedBooking = await bookingRepo.save(booking);

    await manager.getRepository(BookingStatusLog).save({
      booking: savedBooking,
      status: savedBooking.status, // matches reality now
    });

    return savedBooking;
  });
};