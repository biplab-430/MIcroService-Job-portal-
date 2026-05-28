import express from "express";
import { addSkillsToUser, applyForJob, deleteApplicationJob, deleteSkillFromUser, followUser, getAllApplications, getAllFollowers, getAllFollowing, getUserProfile, myProfile, removeFollower, searchUsers, unfollowUser, updateProfilePic, updateResume, updateUserProfile } from "../controller/user.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();

router.get("/me", isAuth, myProfile);
router.put("/updated/profile", isAuth, updateUserProfile);

// for update the resume also
// router.put("/updated/profile", isAuth,uploadFile, updateUserProfile);

router.put("/updated/pic", isAuth,uploadFile, updateProfilePic);
router.put("/updated/resume", isAuth,uploadFile, updateResume);

router.post("/skill/add", isAuth, addSkillsToUser);
router.put("/skill/delete", isAuth, deleteSkillFromUser);

router.post("/apply/job", isAuth, applyForJob);
router.get("/application/all",isAuth,getAllApplications)

router.delete("/delete/job/:id",isAuth,deleteApplicationJob)

router.get("/data/search", isAuth, searchUsers);

/////////////////////////////follow-unfollow system routes////////////////////////////////////////////////


router.post("/follow/:userId",isAuth,followUser);

router.delete("/unfollow/:userId",isAuth,unfollowUser);

router.get("/followers/:userId",isAuth,getAllFollowers);

router.get("/following/:userId",isAuth,getAllFollowing);

router.delete("/remove-follower/:userId",isAuth,removeFollower);


router.get("/:userId", isAuth, getUserProfile);

export default router;