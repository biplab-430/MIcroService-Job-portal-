import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utilis/buffer.js";
import { sql } from "../utilis/db.js";
import ErrorHandler from "../utilis/errorHandler.js";
import { TryCatch } from "../utilis/TryCatch.js";



export const myProfile=TryCatch(async(req: AuthenticatedRequest, res, next)=>{
    const user=req.user;

    res.json(user);

});

export const getUserProfile=TryCatch(async(req,res,next)=>{
    const {userId}=req.params;

     const users = await sql`
           SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.resume_public_id,u.profile_pic,u.profile_pic_public_id,u.subscription,
            ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON 
            u.user_id=us.user_id
           LEFT JOIN skills s ON us.skill_id=s.skill_id
           WHERE u.user_id= ${userId} GROUP BY u.user_id;
           `
    if (users.length === 0) {
       throw new ErrorHandler(404,"user not found")
        }
    
    const user = users[0];
    user.skills = user.skills || [];
    res.json(user);
});

export const updateUserProfile=TryCatch(async(req: AuthenticatedRequest, res, next)=>{
   const user=req.user;
   
   if(!user){
     throw new ErrorHandler(401,"authentication required")
   }

   const {name,phoneNumber,bio}=req.body;

   const newName=name || user.name;
   const newPhoneNumber= phoneNumber || user.phone_number;
   const newBio=bio || user.bio;

   const [updatedUser]=await sql`
   UPDATE users SET name=${newName},phone_number=${newPhoneNumber},
   bio=${newBio}
   WHERE user_id=${user.user_id} 
   RETURNING user_id,name,email,phone_number,bio
   `;

res.json({
    message:"profile updated Successfully",
    user:updatedUser
})
  
});

///////it;s need testing resume updated also

// export const updateUserProfile = TryCatch(
//   async (req: AuthenticatedRequest, res, next) => {
//     const user = req.user;

//     if (!user) {
//       throw new ErrorHandler(401, "authentication required");
//     }

//     const { name, phoneNumber, bio } = req.body;

//     // ✅ safer than ||
//     const newName = name ?? user.name;
//     const newPhoneNumber = phoneNumber ?? user.phone_number;
//     const newBio = bio ?? user.bio;

//     let resumeUrl = user.resume;
//     let resumePublicId = user.resume_public_id;

//     // 🔥 Handle resume upload (same pattern as profile pic)
//     const file = req.file;

//     if (file) {
//       const fileBuffer = getBuffer(file);

//       if (!fileBuffer || !fileBuffer.content) {
//         throw new ErrorHandler(500, "Failed to generate buffer");
//       }

//       // ✅ call your upload service
//       const { data: uploadResult } = await axios.post(
//         `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
//         {
//           buffer: fileBuffer.content,
//           public_id: resumePublicId, // delete old + replace
//         }
//       );

//       resumeUrl = uploadResult.url;
//       resumePublicId = uploadResult.public_id;
//     }

//     const [updatedUser] = await sql`
//       UPDATE users 
//       SET name = ${newName},
//           phone_number = ${newPhoneNumber},
//           bio = ${newBio},
//           resume = ${resumeUrl},
//           resume_public_id = ${resumePublicId}
//       WHERE user_id = ${user.user_id}
//       RETURNING user_id, name, email, phone_number, bio, resume;
//     `;

//     res.json({
//       message: "profile updated Successfully",
//       user: updatedUser,
//     });
//   }
// );

export const updateProfilePic=TryCatch(async(req:AuthenticatedRequest,res,next)=>{
    const user=req.user;

      if(!user){
     throw new ErrorHandler(401,"authentication required")
   }

   const file=req.file;
   if(!file){
    throw new ErrorHandler(400,"no image file provided");
   }

   const oldPublicId=user.profile_pic_public_id

   const fileBuffer=getBuffer(file)

   if(!fileBuffer || !fileBuffer.content){
    throw new ErrorHandler(500,"Failed to generate buffer")
   }

   const {data:uploadResult} =await axios.post(`${process.env.UPLOAD_SERVICE}/api/utilsService/upload`,
    {
        buffer:fileBuffer.content,
        public_id:oldPublicId,
    }
   );

   

   const [updatedUser]=await sql`
      UPDATE users SET profile_pic =${uploadResult.url},profile_pic_public_id=${uploadResult.public_id}
      WHERE user_id= ${user.user_id}
      RETURNING user_id,name,profile_pic;
   `;

  
   res.json({
      message:"profile pic updated Successfully",
    user:updatedUser
   })
});

export const updateResume=TryCatch(async(req:AuthenticatedRequest,res,next)=>{
    const user=req.user;

      if(!user){
     throw new ErrorHandler(401,"authentication required")
   }

   const file=req.file;
   if(!file){
    throw new ErrorHandler(400,"no image file provided");
   }

   const oldPublicId=user.resume_public_id

   const fileBuffer=getBuffer(file)

   if(!fileBuffer || !fileBuffer.content){
    throw new ErrorHandler(500,"Failed to generate buffer")
   }

   const {data:uploadResult} =await axios.post(`${process.env.UPLOAD_SERVICE}/api/utilsService/upload`,
    {
        buffer:fileBuffer.content,
        public_id:oldPublicId,
    }
   );

   console.log(fileBuffer.content)
   console.log(oldPublicId)

   const [updatedUser]=await sql`
      UPDATE users SET resume =${uploadResult.url},resume_public_id=${uploadResult.public_id}
      WHERE user_id= ${user.user_id}
      RETURNING user_id,name,resume;
   `;

   console.log(updatedUser)
   res.json({
      message:"resume updated Successfully",
    user:updatedUser
   })
});

export const addSkillsToUser=TryCatch(async(req:AuthenticatedRequest,res,next)=>{
    const userId=req.user?.user_id;
    const {skillName}=req.body;
 
    if(!skillName || skillName.trim() ===""){
        throw new ErrorHandler(400,"please provide a valid skill name")
    }
    let wasSkillAdded=false;

   try {
    await sql `BEGIN`
    const users=await sql `
    SELECT user_id FROM users WHERE user_id=${userId}
    `;
    if(users.length==0){
        throw new ErrorHandler(404,"User not found")
    }
    const [skill]=await sql `
    INSERT INTO skills (name) VALUES (${skillName.trim()}) ON CONFLICT
    (name) DO UPDATE SET name=EXCLUDED.name RETURNING skill_id
    `;

    const skillId=skill.skill_id;
    const inserionResult=await sql`
    INSERT INTO user_skills (user_id,skill_id) VALUES (${userId},${skillId})
    ON CONFLICT  (user_id,skill_id)
     DO NOTHING RETURNING user_id
    `;

    if(inserionResult.length>0){
        wasSkillAdded=true;
    }
    await sql`COMMIT`
   } catch (error) {
    await sql`ROLLBACK`
    throw error;
   }

   if(!wasSkillAdded){
    return res.status(200).json({
        message:"skill already exists for user"
    })
   }
   res.json({
    message:`skill:${skillName.trim()} is added to user successfully`
   })


})


export const deleteSkillFromUser = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "authentication Required");
    }

    const { skillName } = req.body;

    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler(
        400,
        "please provide a valid skill name"
      );
    }

    const trimmedSkill = skillName.trim().toLowerCase();

    // get skill id first
    const skill = await sql`
      SELECT skill_id
      FROM skills
      WHERE LOWER(name) = ${trimmedSkill};
    `;

    if (skill.length === 0) {
      throw new ErrorHandler(404, "skill not found");
    }

    const skillId = skill[0].skill_id;

    // delete relation from user_skills
    const deleted = await sql`
      DELETE FROM user_skills
      WHERE user_id = ${user.user_id}
      AND skill_id = ${skillId}
      RETURNING user_id;
    `;

    if (deleted.length === 0) {
      throw new ErrorHandler(
        404,
        `skill ${skillName.trim()} not found for user`
      );
    }

    // check if skill is still used by any user
    const remainingUsers = await sql`
      SELECT user_id
      FROM user_skills
      WHERE skill_id = ${skillId};
    `;

    // if nobody uses it, remove from skills table
    if (remainingUsers.length === 0) {
      await sql`
        DELETE FROM skills
        WHERE skill_id = ${skillId};
      `;
    }

    res.json({
      message: `skill ${skillName.trim()} removed successfully`,
    });
  }
);

export const applyForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "authentication required");
    }

   if (user.role !== "jobseeker") {
  throw new ErrorHandler(403, "Forbidden! you are not allowed");
}

    const applicant_id = user.user_id;

    const resume = user.resume;

    if (!resume) {
      throw new ErrorHandler(
        400,
        "you need to add resume to apply for this job"
      );
    }

    const { jobId } = req.body;

    if (!jobId) {
      throw new ErrorHandler(400, "job id is required");
    }

    const [job] = await sql`
      SELECT is_active
      FROM jobs
      WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ErrorHandler(404, "No job with this id");
    }

    if (!job.is_active) {
      throw new ErrorHandler(400, "job is not active");
    }

    const now = Date.now();

    const subTime = req.user?.subscription
      ? new Date(req.user.subscription).getTime()
      : 0;

    const isSubscribed = subTime > now;

    let newApplication;

    try {
      [newApplication] = await sql`
        INSERT INTO applications (
          job_id,
          applicant_id,
          applicant_email,
          resume,
          subscribed
        )
        VALUES (
          ${jobId},
          ${applicant_id},
          ${user.email},
          ${resume},
          ${isSubscribed}
        )
        RETURNING *
      `;
    } catch (error: any) {
      if (error.code === "23505") {
        throw new ErrorHandler(
          409,
          "you have already applied for this job"
        );
      }

      throw error;
    }

    res.json({
      message: "applied for job successfully",
      application: newApplication,
    });
  }
);

export const getAllApplications = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "unauthorized");
    }

    const applications = await sql`
      SELECT 
        a.*,
        j.title AS job_title,
        j.salary AS job_salary,
        j.location AS job_location
      FROM applications a
      JOIN jobs j
      ON a.job_id = j.job_id
      WHERE a.applicant_id = ${user.user_id}
    `;

    res.json(applications);
  }
);

export const deleteApplicationJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "authentication required");
    }

    if (user.role !== "jobseeker") {
      throw new ErrorHandler(
        403,
        "Forbidden! you are not allowed"
      );
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

    // only the same user can cancel the application
    if (application.applicant_id !== user.user_id) {
      throw new ErrorHandler(
        403,
        "you are not allowed to cancel this application"
      );
    }

    // hired application cannot be cancelled
    if (application.status === "Hired") {
      throw new ErrorHandler(
        400,
        "you cannot cancel a hired application"
      );
    }

    await sql`
      DELETE FROM applications
      WHERE application_id = ${id}
    `;

    res.json({
      message: "application cancelled successfully",
    });
  }
);

// search user
export const searchUsers = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { query } = req.query;

    if (!query || String(query).trim() === "") {
      throw new ErrorHandler(
        400,
        "please provide a search term"
      );
    }

    const trimmedQuery = String(query).trim();
    const searchTerm = `%${trimmedQuery}%`;

    const users = await sql`
      SELECT 
        u.user_id,
        u.name,
        u.profile_pic
      FROM users u
      WHERE 
        u.name ILIKE ${searchTerm}
        OR u.email ILIKE ${searchTerm}
      LIMIT 20
    `;

    if (users.length === 0) {
      return res.status(404).json({
        message: `${trimmedQuery} does not exist`
      });
    }

    res.json(users);
  }
);


// follow -unfollow system controlers now 



// ================= FOLLOW USER =================

export const followUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const currentUser = req.user;

    if (!currentUser) {
      throw new ErrorHandler(401, "authentication required");
    }

    const { userId } = req.params;

    if (!userId) {
      throw new ErrorHandler(400, "user id is required");
    }

    // cannot follow yourself
    if (Number(userId) === currentUser.user_id) {
      throw new ErrorHandler(
        400,
        "you cannot follow yourself"
      );
    }

    // check target user exists
    const [targetUser] = await sql`
      SELECT user_id,name
      FROM users
      WHERE user_id = ${userId}
    `;

    if (!targetUser) {
      throw new ErrorHandler(404, "user not found");
    }

    try {
      await sql`
        INSERT INTO followers (
          follower_id,
          following_id
        )
        VALUES (
          ${currentUser.user_id},
          ${userId}
        )
      `;
    } catch (error: any) {
      // duplicate follow
      if (error.code === "23505") {
        throw new ErrorHandler(
          409,
          `you are already following ${targetUser.name}`
        );
      }

      throw error;
    }

    res.json({
      message: `you are now following ${targetUser.name}`,
    });
  }
);



// ================= UNFOLLOW USER =================

export const unfollowUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const currentUser = req.user;

    if (!currentUser) {
      throw new ErrorHandler(401, "authentication required");
    }

    const { userId } = req.params;

    if (!userId) {
      throw new ErrorHandler(400, "user id is required");
    }

    const [targetUser] = await sql`
      SELECT user_id,name
      FROM users
      WHERE user_id = ${userId}
    `;

    if (!targetUser) {
      throw new ErrorHandler(404, "user not found");
    }

    const deletedFollow = await sql`
      DELETE FROM followers
      WHERE follower_id = ${currentUser.user_id}
      AND following_id = ${userId}
      RETURNING follower_id
    `;

    if (deletedFollow.length === 0) {
      throw new ErrorHandler(
        404,
        `you are not following ${targetUser.name}`
      );
    }

    res.json({
      message: `you unfollowed ${targetUser.name}`,
    });
  }
);



// ================= GET ALL FOLLOWERS =================
export const getAllFollowers = TryCatch(
  async (req: AuthenticatedRequest, res) => {

    const currentUser = req.user;

    const { userId } = req.params;

    if (!userId) {
      throw new ErrorHandler(
        400,
        "user id is required"
      );
    }

    // check user exists
    const [targetUser] = await sql`
      SELECT user_id, name
      FROM users
      WHERE user_id = ${userId}
    `;

    if (!targetUser) {
      throw new ErrorHandler(
        404,
        "user not found"
      );
    }

    // followers of this user
    const followers = await sql`
      SELECT
        u.user_id,
        u.name,
        u.bio,
        u.profile_pic,
        f.created_at AS followed_at
      FROM followers f
      JOIN users u
      ON u.user_id = f.follower_id
      WHERE f.following_id = ${userId}
      ORDER BY f.created_at DESC
    `;

    // check if current logged-in user
    // follows this profile
    let isFollowing = false;

    if (currentUser) {

      const alreadyFollowing = await sql`
        SELECT follower_id
        FROM followers
        WHERE follower_id = ${currentUser.user_id}
        AND following_id = ${userId}
      `;

      isFollowing =
        alreadyFollowing.length > 0;
    }

    res.json({
      totalFollowers: followers.length,
      followers,
      isFollowing,
    });
  }
);



// ======================================================
// GET ALL FOLLOWING
// ======================================================

export const getAllFollowing = TryCatch(
  async (req: AuthenticatedRequest, res) => {

    const { userId } = req.params;

    if (!userId) {
      throw new ErrorHandler(
        400,
        "user id is required"
      );
    }

    // check user exists
    const [targetUser] = await sql`
      SELECT user_id, name
      FROM users
      WHERE user_id = ${userId}
    `;

    if (!targetUser) {
      throw new ErrorHandler(
        404,
        "user not found"
      );
    }

    // users this person follows
    const following = await sql`
      SELECT
        u.user_id,
        u.name,
        u.bio,
        u.profile_pic,
        f.created_at AS followed_at
      FROM followers f
      JOIN users u
      ON u.user_id = f.following_id
      WHERE f.follower_id = ${userId}
      ORDER BY f.created_at DESC
    `;

    res.json({
      totalFollowing: following.length,
      following,
    });
  }
);

///////////////////remove user ///////////////////////////////
export const removeFollower = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const currentUser = req.user;

    if (!currentUser) {
      throw new ErrorHandler(401, "authentication required");
    }

    const { userId } = req.params;

    if (!userId) {
      throw new ErrorHandler(400, "user id is required");
    }

    // check follower exists
    const [targetUser] = await sql`
      SELECT user_id,name
      FROM users
      WHERE user_id = ${userId}
    `;

    if (!targetUser) {
      throw new ErrorHandler(404, "user not found");
    }

    // remove follower relation
    const removedFollower = await sql`
      DELETE FROM followers
      WHERE follower_id = ${userId}
      AND following_id = ${currentUser.user_id}
      RETURNING follower_id
    `;

    if (removedFollower.length === 0) {
      throw new ErrorHandler(
        404,
        `${targetUser.name} is not following you`
      );
    }

    res.json({
      message: `${targetUser.name} removed from followers`,
    });
  }
);