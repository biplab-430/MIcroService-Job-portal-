import express, { raw } from "express";
import { v2 as cloudinary } from "cloudinary";
import cors from 'cors'
const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer, public_id } = req.body;

    // ✅ Validate input
    if (!buffer) {
      return res.status(400).json({
        message: "Buffer is required",
      });
    }

    // ✅ Delete old file if exists
    if (public_id) {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "auto",
    });

    console.log("DELETE RESULT:", result);
  } catch (err: any) {
    console.log("DELETE ERROR:", err.message);
  }
}

    // ✅ Upload file (important for PDF)
    const cloud = await cloudinary.uploader.upload(buffer, {
      resource_type: "auto",
    });

    return res.status(200).json({
      url: cloud.secure_url,
      public_id: cloud.public_id,
    });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Upload failed",
    });
  }
});



import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
import { AuthenticatedRequest, isAuth } from "./middleware/auth.js";
import { sql } from "./utilis/db.js";
import puppeteer from "puppeteer-core";
import { generateResumeHTML } from "./utilis/generateResumeHTML.js";
import { generateWithFallback } from "./utilis/aiFallback.js";
dotenv.config()





const ai =new GoogleGenAI({apiKey:process.env.API_KEY_GEMINI});

router.post("/career",async(req,res)=>{
  try {
    const {skills}=req.body;

    if(!skills){
      return res.status(400).json({
        message:"Skills Required",
      });
    }

const prompt = `
Based on the following skills: ${skills}.
Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:
{
"summary": "A brief, encouraging summary of the user's skill set and their general job
title.",
"jobOptions": [
{
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
}
],
"skillsToLearn": [
{
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
Mastery', 'DevOps & Cloud').",
"skills": [
{
"title": "The name of the skill to learn.",
"why": "Why learning this skill is important.",
"how": "Specific examples of how to learn or apply this skill."
}
]
}
],
"learningApproach": [
{
"title": "How to Approach Learning",
"points": ["A bullet point list of actionable advice for learning."]
}
]
}
`;
const resultText = await generateWithFallback("", prompt);

let jsonResponse;

 try {
  const rawText = resultText.replace(/```json/g,"").replace(/```/g,"").trim()
if(!rawText){
  throw new Error("ai did not return a valid response.");
}
jsonResponse=JSON.parse(rawText);
 } catch (error) {
    return res.status(500).json({
      message:"ai-returned response that not valid json",
      rawResponse:resultText,
    })
 }

 res.json(jsonResponse)
} catch (error:any) {
      return res.status(500).json({
      message: error.message 
    });
  }
})

router.post("/resume-analyser",async(req,res)=>{
 try {
   const {pdfBase64}=req.body;

   if(!pdfBase64){
    return res.status(400).json({
      message:"PDF DATA IS REQUIRED"
    })
   }

   const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance
Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:

{
"atsScore": 85,
"scoreBreakdown": {
"formatting": {
"score": 90,
"feedback": "Brief feedback on formatting"
},
"keywords": {
"score": 80,
"feedback": "Brief feedback on keyword usage"
},
"structure": {
"score": 85,
"feedback": "Brief feedback on resume structure"
},
"readability": {
"score": 88,
"feedback": "Brief feedback on readability"
}
},
"suggestions": [
{
"category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
'Structure')",
"issue": "Description of the issue found",
"recommendation": "Specific actionable recommendation to fix it",
"priority": "high/medium/low"
}
],
"strengths": [
"List of things the resume does well for ATS"
],
"summary": "A brief 2-3 sentence summary of the overall ATS performance"
}
Focus on:
- File format and structure compatibility
- Proper use of standard section headings
- Keyword optimization
- Formatting issues (tables, columns, graphics, special characters)
- Contact information placement
- Date formatting
- Use of action verbs and quantifiable achievements
- Section organization and flow
`;

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [{
    role:"user",
    parts:[
      {
      text:prompt
    },
    {
      inlineData:{
        mimeType:"application/pdf",
        data:pdfBase64.replace(/^data:application\/pdf;base64,/,"")
      }
    }
  ]
  }],
  config: {
    responseMimeType: "application/json",
  }
});
let jsonResponse;

 try {
  const rawText=response.text?.replace(/```json/g,"").replace(/```/g,"").trim()
if(!rawText){
  throw new Error("ai did not return a valid text response.");
}
jsonResponse=JSON.parse(rawText);
 } catch (error) {
    return res.status(500).json({
      message:"ai-returned response that not valid json",
      rawResponse:response.text,
    })
 }

 res.json(jsonResponse)

 } catch (error:any) {
    return res.status(500).json({
      message: error.message 
    });
 }

}

)







router.post("/create-resume", isAuth ,async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "unauthorized",
      });
    }

    // fetch user data from db
    const [dbUser] = await sql`
      SELECT
        name,
        email,
        phone_number,
        bio,
        profile_pic,
        resume
      FROM users
      WHERE user_id = ${user.user_id}
    `;

    if (!dbUser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // optional extra data from frontend
    const {
      skills,
      experience,
      education,
      projects,
      achievements,
      linkedin,
      github,
      portfolio,
      targetRole,
    } = req.body;

  const prompt = `
You are an Elite Technical Resume Writer, Senior Software Engineering Recruiter, and ATS Optimization Expert.

Your objective is to transform the provided candidate information into a highly professional, ATS-optimized software engineering resume. You must emulate the quality, technical depth, and impact-driven phrasing of top-tier industry resumes.

### CRITICAL RULES & ATS STANDARDS:
1. **The XYZ Formula**: Every project and experience bullet point MUST follow the accomplishment-driven format: "Accomplished [X] as measured by [Y], by doing [Z]".
2. **High-Impact Action Verbs**: Start every single bullet point with a strong technical action verb (e.g., Architected, Engineered, Orchestrated, Optimized, Deployed, Spearheaded). Avoid weak verbs like "Worked on" or "Helped with".
3. **Quantifiable Metrics & Scale**: Enhance descriptions by implying realistic scale and performance metrics based on the provided context (e.g., "reducing query response times by ~35%", "enforcing data integrity across complex datasets", "building high-quality ML training datasets"). Do NOT hallucinate entirely fake jobs or projects, but elevate the phrasing of existing data to sound highly professional.
4. **Technical Depth**: Explicitly mention architectural patterns (e.g., Monolithic MVC, Microservices), database techniques (e.g., aggregation pipelines, foreign key constraints), and specific libraries/tools used.
5. **No Fluff**: Eliminate generic soft skills, passive voice, and buzzwords. Keep the professional summary under 3 sentences, tightly focused on the Target Role, emphasizing scalability, architecture, and real-world problem solving.
6. **Strict JSON Output**: Return ONLY perfectly valid JSON. Do not include markdown formatting (like \`\`\`json), HTML, or any conversational text before or after the JSON object.

### Candidate Information:
Name: ${dbUser.name}
Email: ${dbUser.email}
Phone: ${dbUser.phone_number}
Bio: ${dbUser.bio || "N/A"}
Target Role: ${targetRole || "Full Stack Software Engineer"}
Skills: ${JSON.stringify(skills || [])}
Experience: ${JSON.stringify(experience || [])}
Education: ${JSON.stringify(education || [])}
Projects: ${JSON.stringify(projects || [])}
Achievements/Certifications: ${JSON.stringify(achievements || [])}
LinkedIn: ${linkedin || "N/A"}
GitHub: ${github || "N/A"}
Portfolio: ${portfolio || "N/A"}

### Required JSON Structure:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "2-3 highly impactful sentences summarizing expertise, target role, and technical focus.",
  "technicalSkills": {
    "languages": ["e.g., C/C++, TypeScript"],
    "frontend": ["e.g., React.js, Tailwind CSS"],
    "backendAndDatabases": ["e.g., Node.js, PostgreSQL, Redis"],
    "toolsAndArchitecture": ["e.g., Microservices, Git, AWS"]
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "Month Year - Month Year",
      "points": [
        "Action verb + technical context + quantified result."
      ]
    }
  ],
  "projects": [
    {
      "name": "",
      "liveUrl": "",
      "repoUrl": "",
      "techStack": "e.g., MERN Stack, TypeScript, Tailwind",
      "points": [
        "Action verb + technical context + quantified result."
      ]
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "duration": "",
      "score": "e.g., CGPA: 8.0"
    }
  ],
  "certificationsAndAchievements": [
    "String detailing a certification, open-source contribution, or major technical achievement."
  ],
  "atsOptimization": {
    "keywordsIncluded": [],
    "estimatedATSScore": 0,
    "missingKeywordsToConsider": []
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("invalid ai response");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned invalid JSON",
        rawResponse: response.text,
      });
    }

    res.json({
      message: "resume created successfully",
      resume: jsonResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// to download the resume


router.post(
  "/download-resume",isAuth,async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "unauthorized",
      });
    }

      // AI generated resume JSON from frontend
      const { resumeData } = req.body;

      if (!resumeData) {
        return res.status(400).json({
          message: "resumeData is required",
        });
      }

      // Generate HTML
      const htmlContent = generateResumeHTML(resumeData);

      // Launch browser
      const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });

      const page = await browser.newPage();

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "12mm",
          right: "12mm",
          bottom: "12mm",
          left: "12mm",
        },
      });

      await browser.close();

      // Safe filename
      const safeFileName =
        resumeData.personalInfo?.name
          ?.replace(/[^a-z0-9]/gi, "_")
          .toLowerCase() || "resume";

      // Headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFileName}_resume.pdf"`
      );

      res.setHeader(
        "Content-Length",
        Buffer.byteLength(pdfBuffer)
      );

      return res.end(pdfBuffer);
    } catch (error: any) {
      console.error("PDF Generation Error:", error);

      return res.status(500).json({
        message: "failed to generate pdf",
        error: error.message,
      });
    }
  }
);

export default router;