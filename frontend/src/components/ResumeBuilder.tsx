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
import Cookies from "js-cookie";




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

      const token = Cookies.get("token");
      // Ensure your Axios instance is sending credentials (cookies/tokens) for isAuth
      const { data } = await axios.post(
        `${utils_service}/api/utilsService/create-resume`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true 
        } 
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
      const token = Cookies.get("token");
      const response = await axios.post(
        `${utils_service}/api/utilsService/download-resume`,
        { resumeData: generatedResume },
        { 
          responseType: "blob", // CRITICAL: This tells axios to expect a file blob
          headers: {
            Authorization: `Bearer ${token}`
          },
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
    <div className="max-w-7xl mx-auto px-4 py-16 border-t border-border/30">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 animate-float">
          <Wand2 size={14} className="text-primary animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">AI-Powered Resume Builder</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-foreground bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">Craft Your Elite ATS Resume</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Provide your details below. Our AI will automatically fetch your profile, combine it with these details, and write high-impact, scalable bullet points.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Data Input Form */}
        <div className="space-y-6 bg-card/65 backdrop-blur-xs p-6 rounded-2xl border border-border/80 shadow-sm h-fit hover:border-primary/20 transition-all duration-300">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4 text-foreground">
            <FileText className="text-primary" /> Candidate Information
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetRole" className="text-xs font-bold uppercase tracking-wider">Target Role</Label>
              <Input 
                id="targetRole" name="targetRole" 
                placeholder="e.g. Senior Full Stack Engineer" 
                value={formData.targetRole} onChange={handleInputChange} 
                className="rounded-xl focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-xs font-bold uppercase tracking-wider">Technical Skills (Comma separated)</Label>
              <Textarea
                id="skills" name="skills" 
                placeholder="React, Node.js, PostgreSQL, AWS, Docker..." 
                value={formData.skills} onChange={handleInputChange} 
                className="rounded-xl focus-visible:ring-primary min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><LinkIcon size={12}/> LinkedIn</Label>
                <Input name="linkedin" placeholder="linkedin.com/in/username" value={formData.linkedin} onChange={handleInputChange} className="rounded-xl focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><LinkIcon size={12}/> GitHub</Label>
                <Input name="github" placeholder="github.com/username" value={formData.github} onChange={handleInputChange} className="rounded-xl focus-visible:ring-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Briefcase size={14}/> Experience (Brief bullet points)</Label>
              <Textarea 
                name="experience" rows={4}
                placeholder="Software Engineer at TechCorp (2021-Present) - Built a REST API...&#10;Frontend Dev at WebInc (2019-2021) - Redesigned dashboard..." 
                value={formData.experience} onChange={handleInputChange} 
                className="rounded-xl focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><FolderGit2 size={14}/> Projects</Label>
              <Textarea
                name="projects" rows={3}
                placeholder="E-commerce App - React, Node, MongoDB - Handled payments...&#10;Chat App - WebSockets, Redis..." 
                value={formData.projects} onChange={handleInputChange} 
                className="rounded-xl focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><GraduationCap size={14}/> Education & Achievements</Label>
              <Textarea 
                name="education" rows={2}
                placeholder="B.Tech in Computer Science, XYZ University, 2022, CGPA: 8.5" 
                value={formData.education} onChange={handleInputChange} 
                className="rounded-xl focus-visible:ring-primary"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full h-12 text-sm font-bold gap-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              {loading ? "Generating Elite Resume..." : "Generate Resume"}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & Download */}
        <div className="space-y-6">
          {generatedResume ? (
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:border-primary/20 transition-all duration-300">
              {/* Top Banner indicating success */}
              <div className="bg-emerald-500/5 border-b border-emerald-500/20 p-5 flex justify-between items-center rounded-t-2xl">
                <div>
                  <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16}/> Optimization Complete
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Estimated ATS Score: <span className="font-bold text-emerald-500 dark:text-emerald-400">{generatedResume.atsOptimization.estimatedATSScore}/100</span>
                  </p>
                </div>
                <Button onClick={handleDownload} disabled={downloading} className="gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-medium shadow-xs">
                  {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download PDF
                </Button>
              </div>

              {/* Document Preview */}
              <div className="p-8 overflow-y-auto max-h-200 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border-t border-border shadow-inner font-sans">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold uppercase tracking-wide">{generatedResume.personalInfo.name}</h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap justify-center gap-2.5">
                    <span>{generatedResume.personalInfo.email}</span> | 
                    <span>{generatedResume.personalInfo.phone}</span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap justify-center gap-2.5 mt-1">
                    {generatedResume.personalInfo.linkedin && <span>{generatedResume.personalInfo.linkedin}</span>}
                    {generatedResume.personalInfo.github && <span> | {generatedResume.personalInfo.github}</span>}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{generatedResume.summary}</p>
                </div>

                <div className="mb-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-2.5">Technical Skills</h2>
                  <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-300">
                    <p><span className="font-bold text-zinc-700 dark:text-zinc-300">Languages:</span> {generatedResume.technicalSkills.languages.join(", ")}</p>
                    <p><span className="font-bold text-zinc-700 dark:text-zinc-300">Frontend:</span> {generatedResume.technicalSkills.frontend.join(", ")}</p>
                    <p><span className="font-bold text-zinc-700 dark:text-zinc-300">Backend/DB:</span> {generatedResume.technicalSkills.backendAndDatabases.join(", ")}</p>
                    <p><span className="font-bold text-zinc-700 dark:text-zinc-300">Tools/Arch:</span> {generatedResume.technicalSkills.toolsAndArchitecture.join(", ")}</p>
                  </div>
                </div>

                <div className="mb-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3">Experience</h2>
                  {generatedResume.experience.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-xs text-zinc-700 dark:text-zinc-200">{exp.role} <span className="font-normal text-zinc-500">at {exp.company}</span></h3>
                        <span className="text-[10px] font-bold text-zinc-400">{exp.duration}</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pl-1">
                        {exp.points.map((pt, j) => <li key={j} className="leading-relaxed">{pt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3">Projects</h2>
                  {generatedResume.projects.map((proj, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-bold text-xs text-zinc-700 dark:text-zinc-200">{proj.name}</h3>
                        <span className="text-[10px] text-zinc-400">| {proj.techStack}</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pl-1">
                        {proj.points.map((pt, j) => <li key={j} className="leading-relaxed">{pt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-card/45 border-border hover:border-primary/20 transition-all duration-300">
              <FileText size={40} className="text-muted-foreground/30 mb-4 animate-float" />
              <h3 className="text-lg font-bold mb-1.5 text-foreground">Resume Preview</h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-6">
                Fill out the form and hit "Generate Resume". Your AI-crafted, ATS-optimized document will appear here ready for download.
              </p>
              
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3 text-left max-w-sm">
                <AlertCircle className="text-primary shrink-0 mt-0.5 animate-pulse" size={16} />
                <p className="text-xs text-primary/95 leading-relaxed font-semibold">
                  Note: You must be logged in. The AI automatically fetches your Name, Email, Phone, and Bio from your account settings.
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