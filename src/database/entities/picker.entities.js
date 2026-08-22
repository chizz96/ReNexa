import { EntitySchema } from "typeorm";
import { ClientType } from "../../types/clienttype.js";
import { Zone } from "../../types/zone.js";

export const Picker = new EntitySchema({
  name: "Picker",
  tableName: "pickers",

  columns: {
    id: { 
        primary: true, 
        type: "uuid", 
        generated: "uuid" 
    },

    fullName: { 
        type: "varchar", 
        length: 150 
    },

    phoneNumber: { 
        type: "varchar", 
        unique: true, 
        length: 20 
    },

    clientType: { 
        type: "enum", 
        enum: Object.values(ClientType), 
        nullable: false 
    },

    zone: { 
        type: "enum", 
        enum: Object.values(Zone), 
        nullable: false 
    },

    isActive: { 
        type: "boolean", 
        default: true 
    },


    createdAt: { 
        type: "timestamptz", 
        createDate: true 
    },
    updatedAt: { 
        type: "timestamptz", 
        updateDate: true 
    },
    deletedAt: { 
        type: "timestamptz", 
        deleteDate: true, 
        nullable: true 
    },
  },

  relations: {
    bookings: { 
        type: "one-to-many", 
        target: "Booking", 
        inverseSide: "picker" 
    },
  },
});