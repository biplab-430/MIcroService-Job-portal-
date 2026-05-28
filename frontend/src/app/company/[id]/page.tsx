"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

import { job_service, useAppData } from "@/context/AppContext";

import { Company, Job } from "@/type";

import Loading from "@/components/loading";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Imported new icons for both Main Page and Modals
import {
  Briefcase,
  Globe,
  Pencil,
  Trash2,
  Plus,
  Type,
  AlignLeft,
  UserCircle,
  Banknote,
  MapPin,
  Users,
  Clock,
  Laptop,
  Activity,
  CheckCircle,
  XCircle,
  Eye, // <-- Imported Eye icon for the view button
} from "lucide-react";

import toast from "react-hot-toast";

const CompanyPage = () => {
  const params = useParams();
  const id = params.id as string;

  const token = Cookies.get("token");

  const { user } = useAppData();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [company, setCompany] = useState<Company | null>(null);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState("");
  const [job_type, setJobType] = useState("");
  const [work_location, setWorkLocation] = useState("");
  const [is_active, setIsActive] = useState(true);

  const clearInput = () => {
    setTitle("");
    setDescription("");
    setRole("");
    setSalary("");
    setLocation("");
    setOpenings("");
    setJobType("");
    setWorkLocation("");
    setIsActive(true);
  };

  async function fetchCompany() {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${job_service}/api/jobs/company/${id}`
      );

      setCompany(data.company);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch company");
    } finally {
      setLoading(false);
    }
  }

  const addJobHandler = async () => {
    try {
      setBtnLoading(true);

      const jobData = {
        title,
        description,
        role,
        salary: salary ? Number(salary) : null,
        location,
        openings: openings ? Number(openings) : 0,
        job_type,
        work_location,
        company_id: id,
        is_active: true, // New jobs are active by default
      };

      await axios.post(
        `${job_service}/api/jobs/company/job`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Job posted successfully");

      fetchCompany();

      clearInput();

      setIsAddModalOpen(false);
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to add job"
      );
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (jobId: number) => {
    try {
      setBtnLoading(true);

      await axios.delete(
        `${job_service}/api/jobs/company/job/delete/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Job deleted successfully");

      fetchCompany();
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to delete job"
      );
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);

    setTitle(job.title);
    setDescription(job.description);
    setRole(job.role);
    setSalary(String(job.salary || ""));
    setLocation(job.location || "");
    setOpenings(String(job.openings));
    setJobType(job.job_type);
    setWorkLocation(job.work_location);
    setIsActive(job.is_active);

    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setSelectedJob(null);
    clearInput();
    setIsUpdateModalOpen(false);
  };

  const updateJobHandler = async () => {
    if (!selectedJob) return;

    try {
      setBtnLoading(true);

      const updateData = {
        title,
        description,
        role,
        salary: salary ? Number(salary) : null,
        location,
        openings: openings ? Number(openings) : 0,
        job_type,
        work_location,
        is_active, // Sends the updated active status
        company_id: company?.company_id,
      };

      await axios.put(
        `${job_service}/api/jobs/company/job/${selectedJob.job_id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Job updated successfully");

      fetchCompany();

      handleCloseUpdateModal();
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to update job"
      );
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const isRecruiterOwner =
    user && company && user.user_id === company.recruiter_id;

  const totalActiveJobs =
    company?.jobs?.filter((job) => job.is_active).length || 0;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Company Card */}
          <Card className="overflow-hidden shadow-lg border-2 mb-8 transition-all hover:shadow-xl duration-300">
            <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 animate-in fade-in duration-700"></div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                {/* Logo */}
                <div className="w-32 h-32 rounded-2xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-3xl font-bold bg-linear-to-br from-muted to-secondary">
                      {company.name?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold mb-2 tracking-tight">
                    {company.name}
                  </h1>

                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">
                    {company.description}
                  </p>
                </div>

                {/* Website */}
                {company.website && (
                  <Link
                    href={company.website}
                    target="_blank"
                    className="md:mb-4"
                  >
                    <Button className="gap-2 transition-transform hover:scale-105">
                      <Globe size={18} />
                      Visit Website
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>

          {/* Jobs Section */}
          <Card className="shadow-lg border-2 overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 border-b p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Briefcase
                      size={20}
                      className="text-white"
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-white">
                    Open Positions
                  </h2>
                  <p className="text-sm font-medium px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                    {totalActiveJobs === 1 ? "Job" : "Jobs"}:{" "}
                    {totalActiveJobs}
                  </p>
                </div>

                {isRecruiterOwner && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    variant="secondary"
                    className="gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                    Add Job
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4 bg-linear-to-b from-transparent to-secondary/10">
              {company.jobs && company.jobs.length > 0 ? (
                company.jobs.map((job) => (
                  <Card
                    key={job.job_id}
                    className="p-5 hover:border-blue-500/50 transition-colors duration-300 group"
                  >
                    <div className="flex justify-between gap-4 flex-wrap">
                      <div>
                        {/* Title & Status Badge */}
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          {job.is_active ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                              <CheckCircle size={14} /> Hiring
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                              <XCircle size={14} /> Closed
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-muted-foreground">
                          {job.description}
                        </p>

                        {/* Job Details with Icons */}
                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <UserCircle size={16} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">Role:</span>{" "}
                            {job.role}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Banknote size={16} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">Salary:</span>{" "}
                            {job.salary || "N/A"}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">Location:</span>{" "}
                            {job.location || "N/A"}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Users size={16} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">Openings:</span>{" "}
                            {job.openings}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">Type:</span>{" "}
                            {job.job_type}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Laptop size={16} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground/80">Mode:</span>{" "}
                            {job.work_location}
                          </div>
                        </div>
                      </div>

                      {/* Job Action Buttons */}
                      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                        {/* View Job Button - Visible to everyone */}
                        <Link href={`/job/${job.job_id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={18} />
                          </Button>
                        </Link>

                        {/* Edit & Delete Buttons - Visible to recruiter only */}
                        {isRecruiterOwner && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleOpenUpdateModal(job)}
                            >
                              <Pencil size={18} />
                            </Button>

                             <Button
                              size="icon"
                              variant="destructive"
                              disabled={btnLoading}
                              onClick={() => deleteHandler(job.job_id)}
                            >
                              <Trash2 size={18} />
                            </Button> 
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
                  <Briefcase size={40} className="opacity-20" />
                  <p className="text-lg font-medium">No open positions available</p>
                  <p className="text-sm opacity-70">Check back later for updates.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Add Job Modal */}
          <Dialog
            open={isAddModalOpen}
            onOpenChange={(isOpen) => {
              setIsAddModalOpen(isOpen);
              if (!isOpen) clearInput();
            }}
          >
            <DialogContent className="sm:max-w-106.25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                  Add New Job
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label>Title</Label>
                  <div className="relative mt-1">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter job title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="pl-10 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <div className="relative mt-1">
                    <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Enter job Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="pl-10 focus-visible:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <div className="relative mt-1">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. Developer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Salary</Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. 50000"
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. New York"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Openings</Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. 5"
                        type="number"
                        value={openings}
                        onChange={(e) => setOpenings(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Type</Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={job_type}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Work Location</Label>
                    <div className="relative mt-1">
                      <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={work_location}
                        onChange={(e) => setWorkLocation(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
                      >
                        <option value="">Select Mode</option>
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={addJobHandler}
                  disabled={btnLoading}
                  className="w-full mt-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md"
                >
                  {btnLoading ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Job Modal */}
          <Dialog
            open={isUpdateModalOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleCloseUpdateModal();
              else setIsUpdateModalOpen(true);
            }}
          >
            <DialogContent className="sm:max-w-106.25 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                  Update Job
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label>Title</Label>
                  <div className="relative mt-1">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="pl-10 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <div className="relative mt-1">
                    <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="pl-10 focus-visible:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <div className="relative mt-1">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Salary</Label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Openings</Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={openings}
                        onChange={(e) => setOpenings(e.target.value)}
                        className="pl-10 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Type</Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={job_type}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Work Location</Label>
                    <div className="relative mt-1">
                      <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={work_location}
                        onChange={(e) => setWorkLocation(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
                      >
                        <option value="">Select Mode</option>
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status Toggle for Active/Closed */}
                <div>
                  <Label>Job Status</Label>
                  <div className="relative mt-1">
                    <Activity 
                      className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
                        is_active ? "text-green-600" : "text-red-600"
                      }`} 
                    />
                    <select
                      value={is_active ? "true" : "false"}
                      onChange={(e) => setIsActive(e.target.value === "true")}
                      className={`w-full h-10 pl-10 pr-3 rounded-md border border-input py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none ${
                        is_active 
                          ? "bg-green-50 text-green-700 border-green-200 font-medium" 
                          : "bg-red-50 text-red-700 border-red-200 font-medium"
                      }`}
                    >
                      <option value="true">Active (Hiring)</option>
                      <option value="false">Closed</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={updateJobHandler}
                  disabled={btnLoading}
                  className="w-full mt-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md"
                >
                  {btnLoading ? "Updating..." : "Update Job"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
