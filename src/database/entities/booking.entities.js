import { EntitySchema } from "typeorm";
import { BookingStatus, CompletionStatus, ConfirmationStatus } from "../../types/bookingstatus.js";
import { WasteType } from "../../types/wastetype.js";
import { BagSize } from "../../types/bagsize.js";

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
      type: "enum",
      enum: Object.values(WasteType),
      nullable: true,
    },

    pickup_address: {
      type: "text",
    },  

    time_of_booking: {
      type: "timestamptz",
      createDate: true,
    },

    quantity: {
      type: "numeric",
      precision: 10,
      scale: 2,
    },

    bagSize: {
      type: "enum",
      enum: Object.values(BagSize),
      nullable: false,
    },

    status: {
      type: "enum",
      enum: Object.values(BookingStatus),
      default: BookingStatus.BOOKED,
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