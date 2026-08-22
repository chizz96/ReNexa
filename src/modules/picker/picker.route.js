import { Router } from "express";
import * as pickerController from "./picker.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authverification, authorize } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../types/user.js";
import {createPickerSchema,updatePickerSchema,listPickersQuerySchema,} from "./picker.validate.js";

const router = Router();

router.use(authverification, authorize(UserRole.ADMIN));

router.post("/", validate(createPickerSchema), pickerController.createPicker);
router.get("/", validate(listPickersQuerySchema, "query"), pickerController.listPickers);
router.get("/:pickerId", pickerController.getPicker);
router.patch("/:pickerId", validate(updatePickerSchema), pickerController.updatePicker);
router.delete("/:pickerId", pickerController.deletePicker);

export default router;