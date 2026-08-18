/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class UpdateUserSchema1787044043294 {
    name = 'UpdateUserSchema1787044043294'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_picker"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_requester"`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" DROP CONSTRAINT "FK_status_logs_booking"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "addressText"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "residentialAddress" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businesscity" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessLga" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessAddress" text`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('household', 'business_owner', 'waste_collector', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."waste_type_enum" RENAME TO "waste_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_waste_type_enum" AS ENUM('plastic', 'paper', 'e_waste', 'glass', 'metal', 'other')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "waste_type" TYPE "public"."bookings_waste_type_enum" USING "waste_type"::"text"::"public"."bookings_waste_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."waste_type_enum_old"`);

        // booking_status_enum is shared by bookings.status AND booking_status_logs.status —
        // rename once, migrate BOTH columns off it, then drop the old type once.
        await queryRunner.query(`ALTER TYPE "public"."booking_status_enum" RENAME TO "booking_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('booked', 'claimed', 'picked_up', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."booking_status_logs_status_enum" AS ENUM('booked', 'claimed', 'picked_up', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "public"."bookings_status_enum" USING "status"::"text"::"public"."bookings_status_enum"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'booked'`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" ALTER COLUMN "status" TYPE "public"."booking_status_logs_status_enum" USING "status"::"text"::"public"."booking_status_logs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status_enum_old"`);

        await queryRunner.query(`ALTER TYPE "public"."completion_status_enum" RENAME TO "completion_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_completion_status_enum" AS ENUM('completed', 'no_show', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "completion_status" TYPE "public"."bookings_completion_status_enum" USING "completion_status"::"text"::"public"."bookings_completion_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."completion_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."confirmation_status_enum" RENAME TO "confirmation_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_confirmation_status_enum" AS ENUM('pending', 'household_confirmed', 'auto_confirmed', 'disputed')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "confirmation_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "confirmation_status" TYPE "public"."bookings_confirmation_status_enum" USING "confirmation_status"::"text"::"public"."bookings_confirmation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "confirmation_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."confirmation_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "requester_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" ALTER COLUMN "booking_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_c422619e3ae63f118f3404450eb" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_390e938ff569954abae4a71aa14" FOREIGN KEY ("picker_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" ADD CONSTRAINT "FK_21c42d93bdff461b6abfaf19a72" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "booking_status_logs" DROP CONSTRAINT "FK_21c42d93bdff461b6abfaf19a72"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_390e938ff569954abae4a71aa14"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_c422619e3ae63f118f3404450eb"`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" ALTER COLUMN "booking_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "requester_id" SET NOT NULL`);

        await queryRunner.query(`CREATE TYPE "public"."confirmation_status_enum_old" AS ENUM('pending', 'household_confirmed', 'auto_confirmed', 'disputed')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "confirmation_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "confirmation_status" TYPE "public"."confirmation_status_enum_old" USING "confirmation_status"::"text"::"public"."confirmation_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "confirmation_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."bookings_confirmation_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."confirmation_status_enum_old" RENAME TO "confirmation_status_enum"`);

        await queryRunner.query(`CREATE TYPE "public"."completion_status_enum_old" AS ENUM('completed', 'no_show', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "completion_status" TYPE "public"."completion_status_enum_old" USING "completion_status"::"text"::"public"."completion_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_completion_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."completion_status_enum_old" RENAME TO "completion_status_enum"`);

        // booking_status_enum is shared by bookings.status AND booking_status_logs.status —
        // recreate once, move BOTH columns back, then rename back once.
        await queryRunner.query(`CREATE TYPE "public"."booking_status_enum_old" AS ENUM('booked', 'claimed', 'picked_up', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "public"."booking_status_enum_old" USING "status"::"text"::"public"."booking_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'booked'`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" ALTER COLUMN "status" TYPE "public"."booking_status_enum_old" USING "status"::"text"::"public"."booking_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status_logs_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."booking_status_enum_old" RENAME TO "booking_status_enum"`);

        await queryRunner.query(`CREATE TYPE "public"."waste_type_enum_old" AS ENUM('plastic', 'paper', 'e_waste', 'glass', 'metal', 'other')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "waste_type" TYPE "public"."waste_type_enum_old" USING "waste_type"::"text"::"public"."waste_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_waste_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."waste_type_enum_old" RENAME TO "waste_type_enum"`);

        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('household', 'business_owner', 'waste_collector', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessAddress"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessLga"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businesscity"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "residentialAddress"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "addressText" text`);
        await queryRunner.query(`ALTER TABLE "booking_status_logs" ADD CONSTRAINT "FK_status_logs_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_picker" FOREIGN KEY ("picker_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}