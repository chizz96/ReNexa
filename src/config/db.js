import { DataSource } from "typeorm";
import dotenv  from "dotenv";
import "reflect-metadata";
import { User } from "../Database/entities/user.entities.js";
import { Booking } from "../database/entities/booking.entities.js";
import { BookingStatusLog } from "../database/entities/booking_status_logs.entities.js";


dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },

  synchronize: true,
  logging: false,
  entities: [ User, Booking, BookingStatusLog ],
  migrations: [
    "src/migration/**/*.ts"
  ],
  
});

