"use client";

import { useAppData } from "@/context/AppContext";
import { Job } from "@/type";
import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { ArrowRight, Briefcase, Building2, CheckCircle, DollarSign, MapPin } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

interface JobCardProps {
    job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
    const { user, btnLoading, applyJob, deleteApplication,applications } = useAppData();
    const [applied,setApplied]=useState(false)

    const applyJobHandler = (id: number) => {
        applyJob(id);
    }

    // const deleteApplyJobhandler = (id: number) => {
    //     deleteApplication(id);
    // }

    useEffect(()=>{
        if(applications && job.job_id){
            applications.forEach((item:any)=>{
                if(item.job_id ===job.job_id) setApplied(true)
            })
        }
    },[applications,job.job_id])

    return (
        <Card className="w-full max-w-md hover:shadow-md transition-all duration-300 border border-border/80 hover:border-primary/45 bg-card/65 backdrop-blur-xs rounded-2xl group overflow-hidden">
            <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                            {job.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Building2 size={14} />
                            <span>{job.company_name}</span>
                        </div>
                    </div>

                    <Link
                        href={`/company/${job.company_id}`}
                        className="shrink-0"
                    >
                        <div className="w-12 h-12 rounded-xl border border-border overflow-hidden hover:scale-105 transition-transform bg-background relative">
                            <Image
                                src={job.company_logo || "/company.png"}
                                  alt={job.company_name || "Company Logo"}
                                fill
                                sizes="48px"
                                className="object-cover"
                            />
                        </div>
                    </Link>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
                            <MapPin size={12} /> <span>{job.location}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <DollarSign size={16} className="text-emerald-500" />
                        <span>{job.salary} P.A.</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-4 border-t border-border/40">
                <div className="flex w-full gap-2">
                    <Link href={`/job/${job.job_id}`} className="flex-1">
                        <Button variant={'outline'} className="w-full gap-2 rounded-xl border border-border hover:bg-accent/40 transition-all group/btn text-xs font-bold">
                            View Details <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Button>
                    </Link>
                    {
                        user?.role?.toLowerCase() === "jobseeker" && (
                            <>
                            {
                                applied ? (
                                    <div className="flex-1 flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 animate-fade-in"> 
                                        <CheckCircle size={14}/>Applied
                                    </div>
                                ) : (
                                    <>
                                     {job.is_active !== false && (
                                        <Button
                                            disabled={btnLoading}
                                            onClick={() => applyJobHandler(job.job_id)}
                                            className="flex-1 gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Briefcase size={14} />
                                            Easy Apply
                                        </Button>
                                    )}
                                    </>
                                )
                            }
                            </>
                        )
                    }
                </div>
                {
                    job.is_active === false && (
                        <div className="w-full text-center text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 font-bold uppercase tracking-wider animate-fade-in">
                            Position Closed
                        </div>
                    )
                }
            </CardContent>
        </Card>
    );
};

export default JobCard;