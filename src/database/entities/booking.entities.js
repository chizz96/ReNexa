import { EntitySchema } from "typeorm";
import { BookingStatus, CompletionStatus, ConfirmationStatus } from "../../types/bookingstatus.js";

export const Booking = new EntitySchema({
  name: "Booking",
  tableName: "bookings",

  columns: {
    booking_id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },

    waste_type: {
      type: "varchar",
      length: 50,
      nullable: true,
    },

    lga: {
      type: "varchar",
      length: 50,
    },

    area: {
      type: "varchar",
      length: 100,
    },

    address_text: {
      type: "text",
    },

    time_window_start: {
      type: "timestamptz",
    },

    time_window_end: {
      type: "timestamptz",
    },

    status: {
      type: "enum",
      enum: Object.values(BookingStatus),
      default: BookingStatus.BOOKED,
    },

    price_agreed: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: true,
    },

    actual_weight_or_bags: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: true,
    },

    completion_status: {
      type: "enum",
      enum: Object.values(CompletionStatus),
      nullable: true,
    },

    completed_at: {
      type: "timestamptz",
      nullable: true,
    },

    confirmation_status: {
      type: "enum",
      enum: Object.values(ConfirmationStatus),
      default: ConfirmationStatus.PENDING,
    },

    confirmation_timestamp: {
      type: "timestamptz",
      nullable: true,
    },

    created_at: {
      type: "timestamptz",
      createDate: true,
    },

    updated_at: {
      type: "timestamptz",
      updateDate: true,
    },
  },

  relations: {
    requester: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "requester_id",
        referencedColumnName: "id",
      },
      onDelete: "RESTRICT",
    },

    picker: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "picker_id",
        referencedColumnName: "id",
      },
      nullable: true,
      onDelete: "SET NULL",
    },

    statusLogs: {
      type: "one-to-many",
      target: "BookingStatusLog",
      inverseSide: "booking",
    },
  },
});