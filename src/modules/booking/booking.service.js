import { AppDataSource } from "../../config/db.js";
import { BookingStatus, CompletionStatus } from "../../types/bookingstatus.js";
import { AppError } from "../../utils/AppError.js";
import logger from "../../utils/logger.js";

const bookingRepository = AppDataSource.getRepository("Booking");
const bookingStatusLogRepository = AppDataSource.getRepository("BookingStatusLog");

export const createBooking = async (userId, payload) => {
  return await AppDataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository("Booking");

    const booking = bookingRepo.create({
      requester: { id: userId },
      waste_type: payload.waste_type,
      pickup_address: payload.pickup_address,
      quantity: payload.quantity,
      pickup_date: payload.pickup_date,
      pickup_time: payload.pickup_time,
      bagSize: payload.bagSize, 
      status: BookingStatus.BOOKED,
    });

    const savedBooking = await bookingRepo.save(booking);

    await manager.getRepository("BookingStatusLog").save({
      booking: savedBooking,
      status: BookingStatus.BOOKED,
    });

    logger.info("Booking created", { bookingId: savedBooking.booking_id, userId });

    return savedBooking;
  });
};

export const assignPickerToBooking = async (bookingId, pickerId) => {
  return await AppDataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository("Booking");
    const pickerRepo = manager.getRepository("Picker");

    const picker = await pickerRepo.findOne({ where: { id: pickerId } });
    if (!picker) {
      logger.warn("Assign attempted with nonexistent picker", { bookingId, pickerId });
      throw new AppError("Picker not found", 404, "PICKER_NOT_FOUND");
    }


    const updateResult = await bookingRepo
      .createQueryBuilder()
      .update("Booking")
      .set({ status: BookingStatus.CLAIMED, picker: { id: pickerId } })
      .where("booking_id = :bookingId", { bookingId })
      .andWhere("status = :status", { status: BookingStatus.BOOKED })
      .execute();

    if (updateResult.affected === 0) {
      const exists = await bookingRepo.findOne({ where: { booking_id: bookingId } });

      if (!exists) {
        logger.warn("Claim attempted on nonexistent booking", { bookingId, pickerId });
        throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
      }

      logger.warn("Claim attempted on unavailable booking", {
        bookingId,
        pickerId,
        currentStatus: exists.status,
      });
      throw new AppError("Booking is no longer available", 409, "BOOKING_NOT_AVAILABLE");
    }

    const savedBooking = await bookingRepo.findOne({
      where: { booking_id: bookingId },
      relations: ["picker"],
    });

    await manager.getRepository("BookingStatusLog").save({
      booking: savedBooking,
      status: BookingStatus.CLAIMED,
    });

    logger.info("Booking claimed", { bookingId, pickerId });

    return savedBooking;
  });
};

export const completeBooking = async (bookingId, pickerId, payload) => {
  return await AppDataSource.transaction(async (manager) => {
    const bookingRepo = manager.getRepository("Booking");

    if (!Object.values(CompletionStatus).includes(payload.completion_status)) {
      throw new AppError("Invalid completion status", 400, "INVALID_COMPLETION_STATUS");
    }

    const booking = await bookingRepo.findOne({
      where: { booking_id: bookingId },
      relations: ["picker"],
    });

    if (!booking) {
      logger.warn("Complete attempted on nonexistent booking", { bookingId, pickerId });
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    if (booking.picker?.id !== pickerId) {
      logger.warn("Complete attempted by unassigned picker", {
        bookingId,
        pickerId,
        assignedPickerId: booking.picker?.id,
      });
      throw new AppError("You are not assigned to this booking", 403, "NOT_ASSIGNED_TO_BOOKING");
    }

    if (booking.status !== BookingStatus.CLAIMED) {
      logger.warn("Complete attempted on booking not in CLAIMED state", {
        bookingId,
        pickerId,
        currentStatus: booking.status,
      });
      throw new AppError("Booking cannot be completed", 409, "BOOKING_NOT_CLAIMED");
    }

    if (payload.bagSize !== undefined) {
      booking.bagSize = payload.bagSize;
    }
    
    booking.completion_status = payload.completion_status;
    booking.completed_at = new Date();
    booking.status =
      payload.completion_status === CompletionStatus.COMPLETED
        ? BookingStatus.COMPLETED
        : BookingStatus.FAILED;

    const savedBooking = await bookingRepo.save(booking);

    await manager.getRepository("BookingStatusLog").save({
      booking: savedBooking,
      status: savedBooking.status,
    });

    logger.info("Booking completed", {
      bookingId,
      pickerId,
      finalStatus: savedBooking.status,
    });

    return savedBooking;
  });
};


export const getmyBookings = async (userId) => {
  const bookings = await bookingRepository.find({
    where: { requester: { id: userId } },
    relations: ["picker", "statusLogs"],
    order: { created_at: "DESC" },
  });
  return bookings;
};

export const getBookingById = async (bookingId) => {
  const booking = await bookingRepository.findOne({
    where: { booking_id: bookingId },
    relations: ["picker", "statusLogs"],
  });
  return booking;
};

export const getBookingsByPickerId = async (pickerId) => {
  const bookings = await bookingRepository.find({
    where: { picker: { id: pickerId } },
    relations: ["requester", "statusLogs"],
    order: { created_at: "DESC" },
  });
  return bookings;
}

export const getAllBookings = async () => {
  const bookings = await bookingRepository.find({
    relations: ["requester", "picker", "statusLogs"], 

    order: { created_at: "DESC" },
  });
  return bookings;
}