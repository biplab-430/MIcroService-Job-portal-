"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAppData, user_service } from "@/context/AppContext";
import Cookies from "js-cookie";
import { User } from "@/type";
import StartChatButton from "@/components/messages/StartChatButton";

const Searchpage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = Cookies.get("token"); 
  const { user: loggedInUser } = useAppData();

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setMessage("");
        return;
      }

      const fetchUsers = async () => {
        try {
          setLoading(true);
          setMessage("");

          const { data } = await axios.get(
            `${user_service}/api/user/data/search`,
            {
              params: { query },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setResults(data);
        } catch (error: any) {
          setResults([]);
          setMessage(
            error?.response?.data?.message || "No users found"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }, 400); // debounce delay

    return () => clearTimeout(delay);
  }, [query, token]);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      
      <div className="max-w-xl mx-auto mt-10">

        {/* Title */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          Search Users
        </h1>

        {/* Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
          />

          {loading && (
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
        </div>

        {/* Message */}
        {message && !loading && (
          <p className="text-center text-gray-500 mb-4">
            {message}
          </p>
        )}

        {/* Results Container */}
        <div className="flex flex-col gap-3">
          
          {/* Skeleton Loaders */}
          {loading && results.length === 0 && (
            <>
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/20 animate-pulse shadow-sm border border-transparent dark:border-gray-800">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex flex-col gap-2 w-1/2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="w-20 h-9 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </>
          )}

          {/* Actual Results */}
          {!loading && results.map((user) => {
            const isYourAccount = loggedInUser?.user_id?.toString() === user.user_id?.toString();

            return (
              <div 
                key={user.user_id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 transition shadow-sm hover:shadow-md"
              >
                {/* Profile Link Area */}
                <Link
                  href={`/account/${user.user_id}`}
                  className="flex items-center gap-4 flex-1 hover:opacity-80 transition"
                >
                  {/* Profile Pic */}
                  <img
                    src={user.profile_pic || "https://via.placeholder.com/150"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                    }}
                  />

                  {/* Name */}
                  <div className="flex flex-col">
                    <span className="font-semibold flex items-center gap-2">
                      {user.name}
                      {isYourAccount && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                </Link>

                {/* Message Button (hidden if it's the current user's account) */}
                {!isYourAccount && (
    <StartChatButton receiverId={user.user_id} />
  )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Searchpage;