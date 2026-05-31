"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Loginpage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isAuth, setUser, setIsAuth, loading, fetchApplications } = useAppData();
  
  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submithandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${auth_service}/api/auth/login`,
        {
          email,
          password,
        }
      );

      toast.success("Login Successfull");

      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        // sameSite: "strict",
        path: "/",
      });

      setUser(data.user);
      setIsAuth(true);
      fetchApplications();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
      setIsAuth(false);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-white via-gray-50 to-gray-200 dark:from-black dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 transition-all">
            Welcome back to HireHeaven
          </h1>
          <p className="text-sm opacity-70">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl dark:shadow-black/50 backdrop-blur-md bg-white/60 dark:bg-black/60 transition-all duration-300 hover:-translate-y-1">
          <form onSubmit={submithandler} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="icon-style transition-transform duration-300 group-hover:scale-110" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
                Password
              </Label>
              <div className="relative">
                <Lock className="icon-style transition-transform duration-300 group-hover:scale-110" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-11 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link href={"/forgot"} className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all duration-200">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              disabled={btnLoading}
              className="w-full h-11 group transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {btnLoading ? "Signing in..." : "Sign in"}
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm">
              Don't have An Account?{" "}
              <Link href={"/register"} className="text-blue-500 font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all duration-200">
                CREATE a New Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Loginpage;