import React, { ReactNode } from "react";

export interface JobOptions {
    title: string,
    responsibilities: string,
    why: string
}

export interface SkillsToLearn {
    title: string,
    why: string,
    how: string
}

export interface SkillCategory {
    category: string,
    skills: SkillsToLearn[]
}

export interface LearningApproach {
    title: string,
    points: string[]

}

export interface CarrerGuideResponse {
    summary: string,
    jobOptions: JobOptions[];
    skillsToLearn: SkillCategory[],
    learningApproach: LearningApproach[]
}

export interface ScoreBreakDown {
    formatting: { score: number; feedback: string },
    keywords: { score: number; feedback: string },
    structure: { score: number; feedback: string },
    readability: { score: number; feedback: string },
}

export interface Suggestion {
    category: string,
    issue: string,
    recommendation: string,
    priority: "high" | "medium" | "high"

}

export interface ResumeAnalysisResponse {
    atsScore: number;
    scoreBreakdown: ScoreBreakDown,
    suggestions: Suggestion[],
    strengths: string[];
    summary: string
}


export interface User {
    user_id: number;
    name: string;
    email: string;
    phone_number: string;
    role: "jobseeker" | "recruiter";
    bio: string | null;
    resume: string | null;
    resume_public_id: string | null;
    profile_pic: string | null;
    profile_pic_public_id: string | null;
    skills: string[];
    subscription: string | null;
    isFollowing?: boolean;
  followers?: any[]; // or number if your backend just returns the count
  following?: any[];

}


export interface AppContextType {
    user: User | null;
    loading: boolean;
    btnLoading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
    LogOutuser: () => Promise<void>
    updateProfilePic: (formData: any) => Promise<void>
    updateResume: (formData: any) => Promise<void>
    updateUser: (
        name?: string,
        phoneNumber?: string,
        bio?: string
    ) => Promise<void>
    addskill:(skill:string,setskill:React.Dispatch<React.SetStateAction<string>>)=> Promise<void>
    removeSkill:(skill:string)=> Promise<void>,
    applyJob:(job_id:number)=> Promise<void>,
    deleteApplication:(application_id:number)=> Promise<void>,
    applications:Application[] ;
    fetchApplications:()=> Promise<void>,
}

export interface AppProviderProps {
    children: ReactNode
}

export interface AccountProps {
    user: User;
    isYourAccount: boolean;
}

export interface Job{
    job_id:number;
    title:string;
    description:string;
    salary:number | string | null;
    location:string | null;
    job_type:"Full-time" | "Part-time" | "Contract" |"Internship";
    openings:number;
    role:string;
    work_location:'Remote'|
            'On-site'|
            'Hybrid';
    company_id:number;
    company_name:string;
    company_logo:string;
    posted_by_recruiter_id:number;
    created_at:string;
    is_active:boolean
}

export interface Company{
    company_id:string;
    name:string;
    description:string;
    website:string;
    logo:string;
    logo_public_id:string ;
    recruiter_id:number;
    created_at:string ;
    jobs?:Job[];
}

type ApplicationStatus='Submitted'|
            'Hired'|
            'Rejected';

export interface Application{
    application_id:number;
    job_id:number;
    applicant_id:number;
    applicant_email:string;
    status:ApplicationStatus;
    resume:string;
    applied_at:string;
    subscribed:boolean;
    job_title:string;
    job_salary:number;
    job_location:string
}
export interface FollowUnfollowProps {
  isOwnProfile: boolean;

  initialIsFollowing?: boolean;

  initialFollowersCount: number;

  initialFollowingCount: number;

  onFollowersClick?: () => void;

  onFollowingClick?: () => void;

  userId: string | number;
}