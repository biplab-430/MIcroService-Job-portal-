import express from "express";
import { addSkillsToUser, deleteSkillFromUser, getUserProfile, myProfile, updateProfilePic, updateResume, updateUserProfile } from "../controller/user.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();
router.get("/me", isAuth, myProfile);
router.get("/:userId", isAuth, getUserProfile);
router.put("/updated/profile", isAuth, updateUserProfile);
// for update the resume also
// router.put("/updated/profile", isAuth,uploadFile, updateUserProfile);
router.put("/updated/pic", isAuth, uploadFile, updateProfilePic);
router.put("/updated/resume", isAuth, uploadFile, updateResume);
router.post("/skill/add", isAuth, addSkillsToUser);
router.delete("/skill/delete", isAuth, deleteSkillFromUser);
export default router;
