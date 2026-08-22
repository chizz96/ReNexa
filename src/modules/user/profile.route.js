import { Router } from "express";
import * as profileController from "./profile.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authverification, authorize } from '../../middleware/auth.middleware.js';
import {updateProfileSchema,setAccountTypeSchema, completeProfileSchema} from "./profile.validate.js";
import { UserRole } from "../../types/user.js";


const router = Router();
router.use( authverification);

// Get Authenticated User Profile
router.get("/all-profile", authorize(UserRole.ADMIN), profileController.getProfile);

// Update Authenticated User Profile
router.patch("/update-user-profile", authverification, validate(updateProfileSchema), profileController.updateProfile);


router.patch("/account-type", authverification, validate(setAccountTypeSchema), profileController.setAccountType);   // phase 2a
router.patch("/profile", authverification, validate(completeProfileSchema), profileController.completeProfile);       // phase 2b

export default router;