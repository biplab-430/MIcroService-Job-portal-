"use client"

import { auth_service, useAppData } from '@/context/AppContext'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ForgotPage = () => {
    const [email, setEmail] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    const { isAuth } = useAppData()
    const router = useRouter()

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
        setBtnLoading(true)

        try {
            const { data } = await axios.post(`${auth_service}/api/auth/forgot`, {
                email
            })
            toast.success(data.message)
            setEmail("")
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
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 drop-shadow-sm mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Don't worry! Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="hello@hireheaven.com"
                            className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={btnLoading}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 focus:ring-offset-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:-translate-y-1"
                    >
                        {btnLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Send Reset Link"
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

export default ForgotPage