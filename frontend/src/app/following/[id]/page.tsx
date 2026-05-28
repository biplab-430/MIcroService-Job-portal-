"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAppData, user_service } from "@/context/AppContext";
import Cookies from "js-cookie";
import { User } from "@/type";
import StartChatButton from "@/components/messages/StartChatButton";

const FollowingPage = () => {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id as string;
  const { user: loggedInUser } = useAppData();
  const token = Cookies.get("token");

  const [following, setFollowing] = useState<User[]>([]);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // check if current logged-in user profile
  const isMyProfile = loggedInUser?.user_id?.toString() === profileId;

  useEffect(() => {
    if (!profileId) return;

    const fetchFollowingData = async () => {
      try {
        setLoading(true);
        setMessage("");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // fetch profile name if not own profile
        if (!isMyProfile) {
          try {
            const userRes = await axios.get(
              `${user_service}/api/user/${profileId}`,
              config
            );
            setProfileName(userRes.data?.name || "User");
          } catch (err) {
            setProfileName("User");
          }
        }

        // fetch following list
        const followingRes = await axios.get(
          `${user_service}/api/user/following/${profileId}`,
          config
        );

        // IMPORTANT FIX
        setFollowing(followingRes.data.following || []);
      } catch (error: any) {
        setFollowing([]);
        setMessage(
          error?.response?.data?.message || "Could not load following list."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingData();
  }, [profileId, isMyProfile, token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-xl mx-auto mt-10">

        {/* HEADER */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            ← Back
          </button>

          <h1 className="text-xl sm:text-2xl font-bold flex-1 text-center pr-10 sm:pr-20">
            {isMyProfile ? "My Following" : `${profileName}'s Following`}
          </h1>
        </div>

        {/* ================= SKELETON LOADER ================= */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Skeleton Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>

                  {/* Skeleton Text */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                  </div>
                </div>

                {/* Skeleton Button */}
                <div className="ml-4 w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"></div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {message && !loading && (
          <p className="text-center text-red-500 mb-4">{message}</p>
        )}

        {/* EMPTY */}
        {!loading && following.length === 0 && !message && (
          <p className="text-center text-gray-500 mb-4">
            Not following anyone yet.
          </p>
        )}

        {/* ================= FOLLOWING LIST ================= */}
        {!loading && following.length > 0 && (
          <div className="flex flex-col gap-3">
            {following.map((user) => {
              const isYourAccount =
                loggedInUser?.user_id?.toString() === user.user_id?.toString();

              return (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 transition shadow-sm hover:shadow-md"
                >
                  {/* PROFILE */}
                  <Link
                    href={`/account/${user.user_id}`}
                    className="flex items-center gap-4 flex-1 hover:opacity-80 transition"
                  >
                    {/* ORIGINAL HTML IMAGE TAG */}
                    <img
                      src={user.profile_pic || "https://via.placeholder.com/150"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/150";
                      }}
                    />

                    {/* USER INFO */}
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-2">
                        {user.name}
                        {isYourAccount && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </span>

                      {user.bio && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {user.bio}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* MESSAGE BUTTON */}
                  {!isYourAccount && (
                    <StartChatButton receiverId={user.user_id} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingPage;