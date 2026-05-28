"use client";

import React, { useState } from "react";
import axios from "axios";
import { 
  FileText, 
  Download, 
  Wand2, 
  Loader2, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";




import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { utils_service } from "@/context/AppContext";

// Types matching your backend AI output
interface GeneratedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  technicalSkills: {
    languages: string[];
    frontend: string[];
    backendAndDatabases: string[];
    toolsAndArchitecture: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    points: string[];
  }>;
  projects: Array<{
    name: string;
    liveUrl: string;
    repoUrl: string;
    techStack: string;
    points: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
    score: string;
  }>;
  certificationsAndAchievements: string[];
  atsOptimization: {
    keywordsIncluded: string[];
    estimatedATSScore: number;
    missingKeywordsToConsider: string[];
  };
}

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    targetRole: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
    experience: "",
    projects: "",
    education: "",
    achievements: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Split comma/newline separated strings into arrays for the backend
      const payload = {
        targetRole: formData.targetRole,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        experience: formData.experience.split("\n").filter(Boolean),
        projects: formData.projects.split("\n").filter(Boolean),
        education: formData.education.split("\n").filter(Boolean),
        achievements: formData.achievements.split("\n").filter(Boolean),
      };

      // Ensure your Axios instance is sending credentials (cookies/tokens) for isAuth
      const { data } = await axios.post(
        `${utils_service}/api/utilsService/create-resume`, 
        payload,
        { withCredentials: true } 
      );

      setGeneratedResume(data.resume);
      toast.success("Resume generated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Please login to create a resume");
      } else {
        toast.error(error.response?.data?.message || "Failed to generate resume");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedResume) return;
    
    setDownloading(true);
    try {
      const response = await axios.post(
        `${utils_service}/api/utilsService/download-resume`,
        { resumeData: generatedResume },
        { 
          responseType: "blob", // CRITICAL: This tells axios to expect a file blob
          withCredentials: true 
        }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      const safeFileName = generatedResume.personalInfo?.name
        ?.replace(/[^a-z0-9]/gi, "_")
        .toLowerCase() || "resume";
        
      link.setAttribute("download", `${safeFileName}_ats_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Resume downloaded successfully!");
    } catch (error: any) {
      toast.error("Failed to download resume");
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-purple-50 dark:bg-purple-950/30 mb-4">
          <Wand2 size={16} className="text-purple-600" />
          <span className="text-sm font-medium">AI-Powered Resume Builder</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Craft Your Elite ATS Resume</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          Provide your details below. Our AI will automatically fetch your profile, combine it with these details, and write high-impact, scalable bullet points.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Data Input Form */}
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm h-fit">
          <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-4">
            <FileText className="text-purple-600" /> Candidate Information
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Role</Label>
              <Input 
                id="targetRole" name="targetRole" 
                placeholder="e.g. Senior Full Stack Engineer" 
                value={formData.targetRole} onChange={handleInputChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Technical Skills (Comma separated)</Label>
              <Textarea
                id="skills" name="skills" 
                placeholder="React, Node.js, PostgreSQL, AWS, Docker..." 
                value={formData.skills} onChange={handleInputChange} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><LinkIcon size={14}/> LinkedIn</Label>
                <Input name="linkedin" placeholder="linkedin.com/in/username" value={formData.linkedin} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><LinkIcon size={14}/> GitHub</Label>
                <Input name="github" placeholder="github.com/username" value={formData.github} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Briefcase size={16}/> Experience (Brief bullet points)</Label>
              <Textarea 
                name="experience" rows={4}
                placeholder="Software Engineer at TechCorp (2021-Present) - Built a REST API...&#10;Frontend Dev at WebInc (2019-2021) - Redesigned dashboard..." 
                value={formData.experience} onChange={handleInputChange} 
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><FolderGit2 size={16}/> Projects</Label>
              <Textarea
                name="projects" rows={3}
                placeholder="E-commerce App - React, Node, MongoDB - Handled payments...&#10;Chat App - WebSockets, Redis..." 
                value={formData.projects} onChange={handleInputChange} 
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><GraduationCap size={16}/> Education & Achievements</Label>
              <Textarea 
                name="education" rows={2}
                placeholder="B.Tech in Computer Science, XYZ University, 2022, CGPA: 8.5" 
                value={formData.education} onChange={handleInputChange} 
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full h-12 text-md gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {loading ? "Generating Elite Resume..." : "Generate Resume"}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & Download */}
        <div className="space-y-6">
          {generatedResume ? (
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
              {/* Top Banner indicating success */}
              <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 size={18}/> Optimization Complete
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500 opacity-80">
                    Estimated ATS Score: <span className="font-bold">{generatedResume.atsOptimization.estimatedATSScore}/100</span>
                  </p>
                </div>
                <Button onClick={handleDownload} disabled={downloading} className="gap-2">
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Download PDF
                </Button>
              </div>

              {/* Document Preview */}
              <div className="p-8 overflow-y-auto max-h-200 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold uppercase">{generatedResume.personalInfo.name}</h1>
                  <p className="text-sm opacity-80 mt-1 flex flex-wrap justify-center gap-3">
                    <span>{generatedResume.personalInfo.email}</span> | 
                    <span>{generatedResume.personalInfo.phone}</span>
                  </p>
                  <p className="text-sm opacity-80 flex flex-wrap justify-center gap-3 mt-1">
                    {generatedResume.personalInfo.linkedin && <span>{generatedResume.personalInfo.linkedin}</span>}
                    {generatedResume.personalInfo.github && <span> | {generatedResume.personalInfo.github}</span>}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm leading-relaxed">{generatedResume.summary}</p>
                </div>

                <div className="mb-4 border-t pt-4">
                  <h2 className="font-bold uppercase mb-2">Technical Skills</h2>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Languages:</span> {generatedResume.technicalSkills.languages.join(", ")}</p>
                    <p><span className="font-semibold">Frontend:</span> {generatedResume.technicalSkills.frontend.join(", ")}</p>
                    <p><span className="font-semibold">Backend/DB:</span> {generatedResume.technicalSkills.backendAndDatabases.join(", ")}</p>
                    <p><span className="font-semibold">Tools/Arch:</span> {generatedResume.technicalSkills.toolsAndArchitecture.join(", ")}</p>
                  </div>
                </div>

                <div className="mb-4 border-t pt-4">
                  <h2 className="font-bold uppercase mb-3">Experience</h2>
                  {generatedResume.experience.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold">{exp.role} <span className="font-normal">at {exp.company}</span></h3>
                        <span className="text-xs font-medium">{exp.duration}</span>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {exp.points.map((pt, j) => <li key={j} className="opacity-90">{pt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4 border-t pt-4">
                  <h2 className="font-bold uppercase mb-3">Projects</h2>
                  {generatedResume.projects.map((proj, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-semibold">{proj.name}</h3>
                        <span className="text-xs opacity-70">| {proj.techStack}</span>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {proj.points.map((pt, j) => <li key={j} className="opacity-90">{pt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-100 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center bg-secondary/20">
              <FileText size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">Resume Preview</h3>
              <p className="opacity-60 max-w-sm">
                Fill out the form and hit "Generate Resume". Your AI-crafted, ATS-optimized document will appear here ready for download.
              </p>
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900 flex items-start gap-3 text-left max-w-md">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  You must be logged in. The AI automatically fetches your Name, Email, Phone, and Bio from your account settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;