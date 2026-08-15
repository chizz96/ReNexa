/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitialSchema1786790576929 {

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        // Extension for gen_random_uuid()
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        // Enums
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('household', 'business_owner', 'waste_collector', 'admin')`);
        await queryRunner.query(`CREATE TYPE "waste_type_enum" AS ENUM ('plastic', 'paper', 'e_waste', 'glass', 'metal', 'other')`);
        await queryRunner.query(`CREATE TYPE "booking_status_enum" AS ENUM ('booked', 'claimed', 'picked_up', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "completion_status_enum" AS ENUM ('completed', 'no_show', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "confirmation_status_enum" AS ENUM ('pending', 'household_confirmed', 'auto_confirmed', 'disputed')`);

        // users
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "firstName" varchar(100) NOT NULL,
                "lastName" varchar(100) NOT NULL,
                "email" varchar(255) NOT NULL UNIQUE,
                "phoneNumber" varchar(20) UNIQUE,
                "password" varchar(255),
                "lga" varchar(100),
                "city" varchar(100),
                "addressText" text,
                "role" user_role_enum NOT NULL,
                "businessName" varchar(150),
                "businessType" varchar(100),
                "googleId" varchar UNIQUE,
                "isVerified" boolean NOT NULL DEFAULT false,
                "profileCompleted" boolean NOT NULL DEFAULT false,
                "resetPasswordToken" varchar,
                "resetPasswordExpires" timestamptz,
                "currentRefreshTokenHash" varchar,
                "otp" varchar,
                "otpExpiry" timestamptz,
                "createdAt" timestamptz NOT NULL DEFAULT now(),
                "updatedAt" timestamptz NOT NULL DEFAULT now(),
                "deletedAt" timestamptz
            )
        `);

        // bookings
        await queryRunner.query(`
            CREATE TABLE "bookings" (
                "booking_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "waste_type" waste_type_enum,
                "lga" varchar(50) NOT NULL,
                "area" varchar(100) NOT NULL,
                "address_text" text NOT NULL,
                "time_window_start" timestamptz NOT NULL,
                "time_window_end" timestamptz NOT NULL,
                "status" booking_status_enum NOT NULL DEFAULT 'booked',
                "price_agreed" numeric(10,2),
                "actual_weight_or_bags" numeric(10,2),
                "completion_status" completion_status_enum,
                "completed_at" timestamptz,
                "confirmation_status" confirmation_status_enum NOT NULL DEFAULT 'pending',
                "confirmation_timestamp" timestamptz,
                "created_at" timestamptz NOT NULL DEFAULT now(),
                "updated_at" timestamptz NOT NULL DEFAULT now(),
                "requester_id" uuid NOT NULL,
                "picker_id" uuid,
                CONSTRAINT "FK_bookings_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_bookings_picker" FOREIGN KEY ("picker_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // booking_status_logs
        await queryRunner.query(`
            CREATE TABLE "booking_status_logs" (
                "log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "status" booking_status_enum NOT NULL,
                "changed_at" timestamptz NOT NULL DEFAULT now(),
                "booking_id" uuid NOT NULL,
                CONSTRAINT "FK_status_logs_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE
            )
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "booking_status_logs"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "users"`);

        await queryRunner.query(`DROP TYPE "confirmation_status_enum"`);
        await queryRunner.query(`DROP TYPE "completion_status_enum"`);
        await queryRunner.query(`DROP TYPE "booking_status_enum"`);
        await queryRunner.query(`DROP TYPE "waste_type_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }

}
