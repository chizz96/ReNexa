import { EntitySchema } from "typeorm";
import { BookingStatus } from "../../types/bookingstatus.js";

export const BookingStatusLog = new EntitySchema({
  name: "BookingStatusLog",
  tableName: "booking_status_logs",

  columns: {
    log_id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },

    status: {
      type: "enum",
      enum: Object.values(BookingStatus),
    },

    changed_at: {
      type: "timestamptz",
      createDate: true,
    },
  },

  relations: {
    booking: {
      type: "many-to-one",
      target: "Booking",
      joinColumn: {
        name: "booking_id",
        referencedColumnName: "booking_id",
      },
      onDelete: "CASCADE",
    },
  },
});