import { EntitySchema } from "typeorm";
import { UserRole } from "../../types/user.js";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",

  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },

    firstName: {
      type: "varchar",
      length: 100,
    },

    lastName: {
      type: "varchar",
      length: 100,
    },

    email: {
      type: "varchar",
      unique: true,
      length: 255,
    },

    phoneNumber: {
      type: "varchar",
      unique: true,
      length: 20,
      nullable: true,
    },

    password: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    lga: {
      type: "varchar",
      length: 100,
      nullable: true,
    },

    city: {
      type: "varchar",
      length: 100,
      nullable: true,
    },

    addressText: {
      type: "text",
      nullable: true,
    },

    role: {
      type: "enum",
      enum: Object.values(UserRole),
    },

    businessName: {
      type: "varchar",
      length: 150,
      nullable: true,
    },

    businessType: {
      type: "varchar",
      length: 100,
      nullable: true,
    },

    googleId: {
      type: "varchar",
      unique: true,
      nullable: true,
    },

    isVerified: {
      type: "boolean",
      default: false,
    },

    profileCompleted: {
      type: "boolean",
      default: false,
    },

    resetPasswordToken: {
      type: "varchar",
      nullable: true,
    },

    resetPasswordExpires: {
      type: "timestamptz",
      nullable: true,
    },

    otp: {
      type: "varchar",
      nullable: true,
    },

    otpExpiry: {
      type: "timestamptz",
      nullable: true,
    },

    createdAt: {
      type: "timestamptz",
      createDate: true,
    },

    updatedAt: {
      type: "timestamptz",
      updateDate: true,
    },

    deletedAt: {
      type: "timestamptz",
      deleteDate: true,
      nullable: true,
    },
  },

  relations: {
    bookingsAsRequester: {
      type: "one-to-many",
      target: "Booking",
      inverseSide: "requester",
    },

    bookingsAsPicker: {
      type: "one-to-many",
      target: "Booking",
      inverseSide: "picker",
    },
  },
});