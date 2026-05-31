"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth_service, useAppData } from "@/context/AppContext";

import axios from "axios";
import Cookies from "js-cookie";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Briefcase,
  FileText,
  Upload,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Registerpage = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isAuth, setUser, setIsAuth, loading } = useAppData();

  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submithandler = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!role) {
      return toast.error("Please select a role");
    }

    setBtnLoading(true);

    const formData = new FormData();

    formData.append("role", role);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);

    if (role === "jobseeker") {
      formData.append("bio", bio);

      if (resume) {
        formData.append("file", resume);
      }
    }

    try {
      const { data } = await axios.post(
        `${auth_service}/api/auth/register`,
        formData
      );

      toast.success("Registration done Successfully");

      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        path: "/",
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Registration failed"
      );
      setIsAuth(false);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-br from-white via-gray-50 to-gray-200 dark:from-black dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 transition-all">
            Join HireHeaven
          </h1>

          <p className="text-sm opacity-70">
            Create your account to start a new journey
          </p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl dark:shadow-black/50 backdrop-blur-md bg-white/60 dark:bg-black/60 transition-all duration-300 hover:-translate-y-1">
          <form
            onSubmit={submithandler}
            className="space-y-5">
            {/* Role */}
            <div className="space-y-2 group">
              <Label className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
                I Want To
              </Label>

              <div className="relative">
                <Briefcase className="icon-style transition-transform duration-300 group-hover:scale-110" />

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="w-full h-11 rounded-md border border-input bg-background/50 backdrop-blur-sm px-10 text-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  required
                >
                  <option value="">
                    Select your role
                  </option>

                  <option value="jobseeker">
                    Find a Job
                  </option>

                  <option value="recruiter">
                    Hire Talent
                  </option>
                </select>
              </div>
            </div>

            {
              role && <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  >
                    Full Name
                  </Label>

                  <div className="relative">
                    <User className="icon-style transition-transform duration-300 group-hover:scale-110" />

                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      required
                      className="pl-10 h-11 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  >
                    Email Address
                  </Label>

                  <div className="relative">
                    <Mail className="icon-style transition-transform duration-300 group-hover:scale-110" />

                    <Input
                      id="email"
                      type="email"
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      className="pl-10 h-11 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  >
                    Phone Number
                  </Label>

                  <div className="relative">
                    <Phone className="icon-style transition-transform duration-300 group-hover:scale-110" />

                    <Input
                      id="phone"
                      type="text"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value)
                      }
                      required
                      className="pl-10 h-11 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {/* Bio */}

                {role === "jobseeker" && (
                  <div className="space-y-2 group animate-in fade-in duration-300">
                    <Label
                      htmlFor="bio"
                      className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                    >
                      Bio
                    </Label>

                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 opacity-70 transition-transform duration-300 group-hover:scale-110" />

                      <textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) =>
                          setBio(e.target.value)
                        }
                        className="w-full min-h-[100px] rounded-md border border-input bg-background/50 backdrop-blur-sm px-10 py-3 text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Resume Upload */}
                {role === "jobseeker" && (
                  <div className="space-y-2 group animate-in fade-in duration-300">
                    <Label
                      htmlFor="resume"
                      className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                    >
                      Upload Resume
                    </Label>

                    <div className="relative">
                      <Upload className="icon-style transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />

                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setResume(e.target.files[0]);
                          }
                        }}
                        className="pl-10 h-11 cursor-pointer bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-gray-300"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  >
                    Password
                  </Label>

                  <div className="relative">
                    <Lock className="icon-style transition-transform duration-300 group-hover:scale-110" />

                    <Input
                      id="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      placeholder="********"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      className="pl-10 pr-10 h-11 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="hover:scale-110 transition-transform" />
                      ) : (
                        <Eye size={18} className="hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
                </div>

            }

            {/* Button */}
            <Button
              disabled={btnLoading}
              className="w-full h-11 group transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {btnLoading
                ? "Creating Account..."
                : "Create Account"}

              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href={"/login"}
                className="text-blue-500 font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all duration-200"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registerpage;