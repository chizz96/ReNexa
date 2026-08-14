import { Event } from "../../database/entities/eventlog.entities.js";
import { AppDataSource } from "../../config/db.js"

const eventRepo = AppDataSource.getRepository(Event);

// src/services/event.service.js
export const logBookingCreated = async ({ zone, userType, userId, wasteType, requestedPickupDate, priceQuoted, paymentMethodIntent }) => {
  const event = await eventRepo.save(
    eventRepo.create({
      id: newId(),
      eventType: "booking_created",
      timestamp: new Date(),
      payload: { zone, userType, userId, wasteType, requestedPickupDate, priceQuoted, paymentMethodIntent },
    }),
  );

  return event; // event.id is the bookingId downstream events reference
};

export const logBookingMatched = async ({ bookingId, pickerId, zone }) => {
  const event = await eventRepo.save(
    eventRepo.create({
      id: newId(),
      eventType: "booking_matched",
      timestamp: new Date(),
      bookingId,
      payload: { pickerId, zone },
    }),
  );

  return event;
};

export const logPickupCompleted = async ({ bookingId, pickerId, actualWeightOrBags, completionStatus }) => {
  const event = await eventRepo.save(
    eventRepo.create({
      id: newId(),
      eventType: "pickup_completed",
      timestamp: new Date(),
      bookingId,
      payload: { pickerId, actualWeightOrBags, completionStatus },
    }),
  );

  return event;
};

export const logPickupConfirmed = async ({
  bookingId,
  confirmationStatus,
}) => {
  const event = await eventRepo.save(
    eventRepo.create({
      id: newId(),
      eventType: "pickup_confirmation",
      timestamp: new Date(),
      bookingId,
      payload: {
        confirmationStatus,
      },
    }),
  );

  return event;
};

export const logPaymentSale = async ({ bookingId, amount, paymentStatus }) => {
  const event = await eventRepo.save(
    eventRepo.create({
      id: newId(),
      eventType: "payment_sale",
      timestamp: new Date(),
      bookingId,
      payload: { amount, paymentStatus },
    }),
  );

  return event;
};

export const logPickerActivity = async ({ pickerId, zone, activeStatus, jobsCompletedToDate }) => {
  const event = await eventRepo.save(
    eventRepo.create({
      id: newId(),
      eventType: "picker_activity",
      timestamp: new Date(),
      payload: { pickerId, zone, activeStatus, jobsCompletedToDate },
    }),
  );

  return event;
};

export const getEvents = async ({ eventType, bookingId }) => {
  const where = {};
  if (eventType) where.eventType = eventType;
  if (bookingId) where.bookingId = bookingId;

  return eventRepo.find({ where, order: { timestamp: "ASC" } });
};