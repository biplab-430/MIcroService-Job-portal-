"use client"

import { auth_service, useAppData } from '@/context/AppContext'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ResetPage = () => {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    
    // States for password visibility toggles
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { isAuth } = useAppData()
    const router = useRouter()
    const params = useParams()
    
    // Extract token from the URL (e.g., /reset/[token])
    const token = params?.token

    // Trigger the fade-in pop-up animation on mount
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Redirect to home if the user is already authenticated
    useEffect(() => {
        if (isAuth) {
            router.push("/")
        }
    }, [isAuth, router])

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match!")
        }

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters")
        }

        setBtnLoading(true)

        try {
            // Passing the token in the URL as per your backend route setup
            const { data } = await axios.post(`${auth_service}/api/auth/reset/${token}`, {
                password
            })
            
            toast.success(data.message) // "Password reset successfully"
            router.push("/login") // Redirect to login upon success
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again."
            toast.error(errorMessage)
        } finally {
            setBtnLoading(false)
        }
    }

    if (isAuth) return null 

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 transition-colors duration-500 overflow-hidden">
            {/* Animated Background Gradients (Adapts to Light/Dark) */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] dark:blur-[128px] opacity-60 dark:opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-300 dark:bg-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] dark:blur-[128px] opacity-60 dark:opacity-40 animate-pulse" style={{ animationDelay: "2s" }}></div>
            <div className="absolute top-[20%] left-[60%] w-72 h-72 bg-sky-300 dark:bg-sky-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] dark:blur-[128px] opacity-50 dark:opacity-30 animate-pulse" style={{ animationDelay: "4s" }}></div>

            {/* Glassmorphism Card */}
            <div 
                className={`relative z-10 w-full max-w-md p-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transform transition-all duration-700 ease-out hover:scale-[1.02] ${
                    isMounted 
                        ? "opacity-100 translate-y-0 scale-100" 
                        : "opacity-0 translate-y-8 scale-95"
                }`}
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 drop-shadow-sm mb-2">
                        Create New Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Your new password must be different from your previously used passwords.
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-5">
                    {/* New Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors focus:outline-none"
                            >
                                <div className="relative w-5 h-5">
                                    {/* Eye Open Icon */}
                                    <svg className={`absolute inset-0 transition-all duration-300 transform ${showPassword ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {/* Eye Closed Icon */}
                                    <svg className={`absolute inset-0 transition-all duration-300 transform ${!showPassword ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors focus:outline-none"
                            >
                                <div className="relative w-5 h-5">
                                    {/* Eye Open Icon */}
                                    <svg className={`absolute inset-0 transition-all duration-300 transform ${showConfirmPassword ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {/* Eye Closed Icon */}
                                    <svg className={`absolute inset-0 transition-all duration-300 transform ${!showConfirmPassword ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={btnLoading}
                        className="w-full flex items-center justify-center py-3 px-4 mt-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 focus:ring-offset-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:-translate-y-1"
                    >
                        {btnLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Update Password"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPage