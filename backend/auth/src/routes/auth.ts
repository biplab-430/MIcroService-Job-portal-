import express from "express";
import { forgetPassword, LoginUser, registerUser, resetPassword } from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();


router.post("/register",uploadFile,registerUser);
router.post("/login",LoginUser);
router.post("/forgot",forgetPassword)
router.post("/reset/:token",resetPassword)


export default router;