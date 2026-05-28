import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utilis/buffer.js";
import { sql } from "../utilis/db.js";
import ErrorHandler from "../utilis/errorHandler.js";
import { TryCatch } from "../utilis/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";


export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    console.log("1. request received");

    const user = req.user;

    if (!user) {
      console.log("2. user not found");
      throw new ErrorHandler(401, "unauthorized");
    }

    console.log("3. user found", user.user_id);

    if (user.role !== "recruiter") {
      console.log("4. not recruiter");
      throw new ErrorHandler(403, "Forbidden access");
    }

    console.log("5. recruiter verified");

    const { name, description, website } = req.body;

    console.log("6. body data", {
      name,
      description,
      website,
    });

    if (!name || !description || !website) {
      console.log("7. missing fields");
      throw new ErrorHandler(400, "all fields are required");
    }

    console.log("8. checking existing company");

    const existingCompany = await sql`
      SELECT company_id FROM companies WHERE name = ${name}
    `;

    console.log("9. existing company result", existingCompany);

    if (existingCompany.length > 0) {
      console.log("10. company already exists");

      throw new ErrorHandler(
        409,
        `company with this name ${name} already exists`
      );
    }

    console.log("11. checking file");

    const file = req.file;

    console.log("12. file =", file);

    if (!file) {
      console.log("13. no file found");
      throw new ErrorHandler(400, "company logo is required");
    }

    console.log("14. creating file buffer");

    const fileBuffer = getBuffer(file);

    console.log("15. file buffer created");

    if (!fileBuffer || !fileBuffer.content) {
      console.log("16. file buffer failed");
      throw new ErrorHandler(500, "failed to create file buffer");
    }

    console.log("17. sending upload request");
    console.log("UPLOAD SERVICE =", process.env.UPLOAD_SERVICE);

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utilsService/upload`,
      {
        buffer: fileBuffer.content,
      },
      {
        timeout: 10000,
      }
    );

    console.log("18. upload completed", data);

    console.log("19. inserting company into database");

    const [newCompany] = await sql`
      INSERT INTO companies (
        name,
        description,
        website,
        logo,
        logo_public_id,
        recruiter_id
      )
      VALUES (
        ${name},
        ${description},
        ${website},
        ${data.url},
        ${data.public_id},
        ${req.user?.user_id}
      )
      RETURNING *
    `;

    console.log("20. company inserted");

    res.status(201).json({
      message: "company created successfully",
      company: newCompany,
    });

    console.log("21. response sent");
  }
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    const { companyId } = req.params;

    const [company] = await sql`
      SELECT logo_public_id
      FROM companies
      WHERE company_id = ${companyId}
      AND recruiter_id = ${user.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(
        404,
        "company not found or you are not authorized to delete it"
      );
    }

    await sql`
      DELETE FROM companies
      WHERE company_id = ${companyId}
    `;

    res.json({
      message: "company and associated jobs deleted",
    });
  }
);

export const createJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden access");
    }

    const {
      title,
      description,
      salary,
      location,
      role,
      job_type,
      work_location,
      company_id,
      openings,
    } = req.body;

    if (
      !title ||
      !description ||
      !salary ||
      !location ||
      !role ||
      !job_type ||
      !work_location ||
      !company_id ||
      !openings
    ) {
      throw new ErrorHandler(400, "all fields are required");
    }

    const [company] = await sql`
      SELECT company_id
      FROM companies
      WHERE company_id = ${company_id}
      AND recruiter_id = ${user.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(
        404,
        `company with id ${company_id} does not exist`
      );
    }

    const [newJob] = await sql`
      INSERT INTO jobs (
        title,
        description,
        salary,
        location,
        role,
        job_type,
        work_location,
        company_id,
        posted_by_recruiter_id,
        openings
      )
      VALUES (
        ${title},
        ${description},
        ${salary},
        ${location},
        ${role},
        ${job_type},
        ${work_location},
        ${company_id},
        ${user.user_id},
        ${openings}
      )
      RETURNING *
    `;

    res.json({
      message: "job posted successfully",
      job: newJob,
    });
  }
);

export const updateJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden access");
    }

    const {
      title,
      description,
      salary,
      location,
      role,
      job_type,
      work_location,
      company_id,
      openings,
      is_active,
    } = req.body;

   if (
  !title ||
  !description ||
  salary == null ||
  !location ||
  !role ||
  !job_type ||
  !work_location ||
  !company_id ||
  openings == null
) {
      throw new ErrorHandler(400, "all fields are required");
    }

    const [existingJob] = await sql`
      SELECT posted_by_recruiter_id
      FROM jobs
      WHERE job_id = ${req.params.job_id}
    `;

    if (!existingJob) {
      throw new ErrorHandler(404, "job not found");
    }

    if (existingJob.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(
        403,
        "forbidden ! you are not allowed"
      );
    }

    const [updatedJob] = await sql`
      UPDATE jobs
      SET
        title = ${title},
        description = ${description},
        salary = ${salary},
        location = ${location},
        role = ${role},
        job_type = ${job_type},
        work_location = ${work_location},
        company_id = ${company_id},
        openings = ${openings},
        is_active = ${is_active}
      WHERE job_id = ${req.params.job_id}
      RETURNING *;
    `;

    res.json({
      message: "job updated successfully",
      job: updatedJob,
    });
  }
);

export const deleteJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden access");
    }

    const { jobId } = req.params;

    if (!jobId) {
      throw new ErrorHandler(400, "job id is required");
    }

    const [job] = await sql`
      SELECT posted_by_recruiter_id
      FROM jobs
      WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ErrorHandler(404, "job not found");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(
        403,
        "forbidden ! you are not allowed to delete this job"
      );
    }

    await sql`
      DELETE FROM jobs
      WHERE job_id = ${jobId}
    `;

    res.json({
      message: "job deleted successfully",
    });
  }
);

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    const companies = await sql`
      SELECT *
      FROM companies
      WHERE recruiter_id = ${user.user_id};
    `;

    res.json({
      message: "all the companies by the recruiter",
      companies: companies,
    });
  }
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler(400, "company id is required");
    }

    const [companyData] = await sql`
      SELECT 
        c.*,
        COALESCE(
          (
            SELECT json_agg(j.*)
            FROM jobs j
            WHERE j.company_id = c.company_id
          ),
          '[]'::json
        ) AS jobs
      FROM companies c
      WHERE c.company_id = ${id}
      GROUP BY c.company_id;
    `;

    if (!companyData) {
      throw new ErrorHandler(404, "company not found");
    }

    res.json({
      message: "company details and related jobs",
      company: companyData,
    });
  }
);

export const getAllActiveJobs = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { title, location } = req.query as {
      title?: string;
      location?: string;
    };

    let queryString = `
      SELECT 
        j.job_id,
        j.title,
        j.description,
        j.salary,
        j.location,
        j.job_type,
        j.role,
        j.work_location,
        j.created_at,
        c.name AS company_name,
        c.logo AS company_logo,
        c.company_id AS company_id
      FROM jobs j
      JOIN companies c
      ON j.company_id = c.company_id
      WHERE j.is_active = true
    `;

    const values: string[] = [];
    let paramIndex = 1;

    if (title) {
      queryString += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title}%`);
      paramIndex++;
    }

    if (location) {
      queryString += ` AND j.location ILIKE $${paramIndex}`;
      values.push(`%${location}%`);
      paramIndex++;
    }

    queryString += ` ORDER BY j.created_at DESC`;

    const jobs = (await sql.query(queryString, values)) as any[];

    res.json(jobs);
  }
);

export const getSingleJob = TryCatch(async (req, res) => {
  const [job] = await sql`
    SELECT *
    FROM jobs
    WHERE job_id = ${req.params.jobId}
  `;

  if (!job) {
    throw new ErrorHandler(404, "job not found");
  }

  res.json(job);
});

export const getAllApplicationForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden access");
    }

    const { jobId } = req.params;

    const [job] = await sql`
      SELECT posted_by_recruiter_id
      FROM jobs
      WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ErrorHandler(404, "job not found");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(
        403,
        "forbidden you are not worthy"
      );
    }

    const applications = await sql`
      SELECT *
      FROM applications
      WHERE job_id = ${jobId}
      ORDER BY subscribed DESC, applied_at ASC
    `;

    res.json(applications);
  }
);

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden access");
    }

    const { id } = req.params;

    const [application] = await sql`
      SELECT *
      FROM applications
      WHERE application_id = ${id}
    `;

    if (!application) {
      throw new ErrorHandler(404, "application not found");
    }

    const [job] = await sql`
      SELECT posted_by_recruiter_id, title
      FROM jobs
      WHERE job_id = ${application.job_id}
    `;

    if (!job) {
      throw new ErrorHandler(404, "no job with this id");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden access");
    }

    const [updatedApplication] = await sql`
      UPDATE applications
      SET status = ${req.body.status}
      WHERE application_id = ${id}
      RETURNING *
    `;

    const message = {
      to: application.applicant_email,
      subject: "APPLICATION UPDATE - job portal",
      html: applicationStatusUpdateTemplate(job.title),
    };

    publishToTopic("send-mail", message).catch((error) => {
      console.error(
        "Failed to publish message to kafka ",
        error
      );
    });

    res.json({
      message: "application updated",
      application: updatedApplication,
    });
  }
);


