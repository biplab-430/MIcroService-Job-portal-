"use client";

import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { useAppData } from "@/context/AppContext";
import { Application } from "@/type";

import {
    Briefcase,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    XCircle,
    Trash2,
} from "lucide-react";

import Link from "next/link";
import React from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppliedJobProps {
    applications: Application[];
}

const Appliedjobs: React.FC<AppliedJobProps> = ({ applications }) => {
    const { loading, deleteApplication } = useAppData();

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "hired":
                return {
                    icon: CheckCircle2,
                    bg: "bg-green-100 dark:bg-green-900/30",
                    color: "text-green-600 dark:text-green-400",
                    border: "border-green-200 dark:border-green-800",
                };

            case "rejected":
                return {
                    icon: XCircle,
                    bg: "bg-red-100 dark:bg-red-900/30",
                    color: "text-red-600 dark:text-red-400",
                    border: "border-red-200 dark:border-red-800",
                };

            default:
                return {
                    icon: Clock,
                    bg: "bg-yellow-100 dark:bg-yellow-900/30",
                    color: "text-yellow-600 dark:text-yellow-400",
                    border: "border-yellow-200 dark:border-yellow-800",
                };
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Card className="shadow-lg border-2 overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 text-white p-6 border-b">
                    <div className="flex items-center gap-3 mb-3">

                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Briefcase size={20} className="text-white" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Your Applied Jobs
                            </h1>

                            <p className="text-sm text-blue-100">
                                {applications.length} applications submitted
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {applications.length > 0 ? (
                        <div className="space-y-4">

                            {applications.map((a) => {
                                const statusConfig = getStatusConfig(a.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={`${a.application_id}-${a.job_id}`}
                                        className="p-5 rounded-xl border-2 hover:border-blue-500 transition-all bg-background"
                                    >

                                        <div className="flex items-start justify-between gap-4 flex-wrap">

                                            {/* Left */}
                                            <div className="flex-1 min-w-0">

                                                <h3 className="text-xl font-semibold mb-3">
                                                    {a.job_title}
                                                </h3>

                                                <div className="flex flex-wrap gap-3 items-center">

                                                    {/* Salary */}
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                                        <DollarSign size={14} />

                                                        <span className="font-medium">
                                                            {a.job_salary}
                                                        </span>
                                                    </div>

                                                    {/* Status */}
                                                    <div
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border}`}
                                                    >
                                                        <StatusIcon
                                                            size={14}
                                                            className={statusConfig.color}
                                                        />

                                                        <span
                                                            className={`font-medium text-sm ${statusConfig.color}`}
                                                        >
                                                            {a.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Buttons */}
                                            <div className="flex items-center gap-2">

                                                {/* View Job */}
                                                <Link
                                                    href={`/job/${a.job_id}`}
                                                    className="group relative shrink-0 flex items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    <Eye size={18} />

                                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View Job
                                                    </span>
                                                </Link>

                                                {/* Delete Application */}
                                                <AlertDialog>

                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            disabled={a.status === "Hired"}
                                                            className={`group relative shrink-0 flex items-center justify-center p-2 rounded-lg transition-colors ${
                                                                a.status === "Hired"
                                                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                                                    : "bg-red-600 hover:bg-red-700 text-white"
                                                            }`}
                                                        >
                                                            <Trash2 size={18} />

                                                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {a.status === "Hired"
                                                                    ? "Cannot Delete"
                                                                    : "Delete Application"}
                                                            </span>
                                                        </button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent>

                                                        <AlertDialogHeader>

                                                            <AlertDialogTitle>
                                                                Delete Application?
                                                            </AlertDialogTitle>

                                                            <AlertDialogDescription>
                                                                This action cannot be undone.
                                                                This will permanently remove
                                                                your application for{" "}
                                                                <span className="font-semibold">
                                                                    {a.job_title}
                                                                </span>.
                                                            </AlertDialogDescription>

                                                        </AlertDialogHeader>

                                                        <AlertDialogFooter>

                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>

                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    deleteApplication(
                                                                        a.application_id
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>

                                                        </AlertDialogFooter>

                                                    </AlertDialogContent>

                                                </AlertDialog>

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    ) : (
                        <div className="py-12 text-center">

                            <Briefcase
                                size={50}
                                className="mx-auto text-muted-foreground mb-4"
                            />

                            <h2 className="text-xl font-semibold mb-2">
                                No Applications Yet
                            </h2>

                            <p className="text-muted-foreground">
                                Start applying to jobs to see them here.
                            </p>

                        </div>
                    )}
                </div>

            </Card>
        </div>
    );
};

export default Appliedjobs;