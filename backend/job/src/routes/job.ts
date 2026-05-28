import  express  from "express";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";
import { createCompany, createJob, deleteCompany, deleteJob, getAllActiveJobs, getAllApplicationForJob, getAllCompany, getCompanyDetails, getSingleJob, updateApplication, updateJob } from "../controller/job.js";
const router = express.Router();

router.post("/company/new",isAuth,uploadFile,createCompany)
router.delete("/company/:companyId",isAuth,deleteCompany)

router.post("/company/job",isAuth,createJob)
router.put("/company/job/:job_id", isAuth, updateJob)
router.delete(
  "/company/job/delete/:jobId",
  isAuth,
  deleteJob
);

router.get("/company/all",isAuth,getAllCompany);
router.get("/company/:id",getCompanyDetails);
router.get("/job/all",getAllActiveJobs);
router.get("/job/:jobId",getSingleJob);
router.get("/application/all/:jobId",isAuth,getAllApplicationForJob);

router.put("/application/update/:id",isAuth,updateApplication)

export default router;