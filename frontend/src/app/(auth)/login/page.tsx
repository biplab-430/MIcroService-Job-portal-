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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[130px] animate-pulse-glow" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
            Welcome back to HireHeaven
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="border border-border/80 rounded-2xl p-8 shadow-xl dark:shadow-black/50 backdrop-blur-xl bg-card/65 transition-all duration-300 hover:border-primary/30">
          <form onSubmit={submithandler} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="icon-style transition-transform duration-300 group-hover:scale-105" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 rounded-xl bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                Password
              </Label>
              <div className="relative">
                <Lock className="icon-style transition-transform duration-300 group-hover:scale-105" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-11 rounded-xl bg-background/50 focus-visible:ring-primary focus-visible:border-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link href={"/forgot"} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              disabled={btnLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {btnLoading ? "Signing in..." : "Sign in"}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-border/40">
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link href={"/register"} className="text-primary font-bold hover:underline transition-colors">
                Create a new account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Loginpage;