"use client";

import { Job } from "@/type";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { job_service } from "@/context/AppContext";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Filter,
  MapPin,
  Search,
  SearchIcon,
  X,
} from "lucide-react";

import Loading from "@/components/loading";
import JobCard from "@/components/job-card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const locations: string[] = [
  "Delhi",
  "Kolkata",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Bhubaneswar",
  "Patna",
  "Chandigarh",
  "Guwahati",
  "Siliguri",
  "Noida",
  "Gurgaon",
  "Indore",
  "Bhopal",
  "Surat",
  "Nagpur",
  "Remote",
];

const JobsPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const ref = useRef<HTMLButtonElement>(null);

  async function fetchJobs() {
    setLoading(true);

    try {
      const { data } = await axios.get(
        `${job_service}/api/jobs/job/all`,
        {
          params: {
            title,
            location,
          },
        }
      );

      setJobs(data);
    } catch (error: any) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch jobs"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [title, location]);

  const clickEvent = () => {
    ref.current?.click();
  };

  const clearFilter = () => {
    setTitle("");
    setLocation("");

    ref.current?.click();
  };

  const hasActiveFilters = Boolean(title || location);

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Explore{" "}
                <span className="text-red-500">
                  opportunities
                </span>
              </h1>

              <p className="text-base opacity-70">
                {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
              </p>
            </div>

            <Button
              className="gap-2 h-11"
              onClick={clickEvent}
            >
              <Filter size={18} />
              Filters

              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                  Active
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm opacity-70">
                Active Filters:
              </span>

              {title && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm">
                  <Search size={14} />

                  {title}

                  <button
                    onClick={() => setTitle("")}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm">
                  <MapPin size={14} />

                  {location}

                  <button
                    onClick={() => setLocation("")}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Jobs Section */}
          {loading ? (
            <Loading />
          ) : (
            <>
              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Briefcase
                      size={40}
                      className="opacity-40"
                    />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    No Jobs Found
                  </h3>

                  <p className="opacity-70 text-sm">
                    Try changing your filters
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Filter Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              ref={ref}
              className="hidden"
            />
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Filter className="text-blue-600" />
                Filter Jobs
              </DialogTitle>

              {/* FIXED WARNING */}
              <DialogDescription>
                Search jobs using title and location filters.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <SearchIcon size={15} />
                  Search by Job Title
                </Label>

                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  className="h-11"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium flex items-center gap-2 mb-1"
                >
                  <MapPin size={16} />
                  Location
                </Label>

                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="
      w-full
      h-11
      rounded-md
      border
      border-gray-300
      dark:border-gray-700
      bg-white
      dark:bg-gray-900
      text-black
      dark:text-white
      px-3
      text-sm
      outline-none
      transition
      focus:ring-2
      focus:ring-blue-500
      focus:border-blue-500
    "
                >
                  <option
                    value=""
                    className="bg-white dark:bg-gray-900 text-black dark:text-white"
                  >
                    All Locations
                  </option>

                  {locations.map((loc, index) => (
                    <option
                      key={`${loc}-${index}`}
                      value={loc}
                      className="bg-white dark:bg-gray-900 text-black dark:text-white"
                    >
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={clearFilter}
                className="flex-1"
              >
                Clear All Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default JobsPage;