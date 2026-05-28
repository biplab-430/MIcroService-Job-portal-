"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ChevronDown } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/AppContext";
import { FollowUnfollowProps } from "@/type";
import toast from "react-hot-toast";

// Import Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "@/components/loading";

const getAuthHeader = () => {
  const token = Cookies.get("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getFollowers = async (userId: string | number) => {
  const { data } = await axios.get(
    `${user_service}/api/user/followers/${userId}`,
    getAuthHeader()
  );
  return data;
};

export const getFollowing = async (userId: string | number) => {
  const { data } = await axios.get(
    `${user_service}/api/user/following/${userId}`,
    getAuthHeader()
  );
  return data;
};

export const followUser = async (userId: string | number) => {
  const { data } = await axios.post(
    `${user_service}/api/user/follow/${userId}`,
    {},
    getAuthHeader()
  );
  return data;
};

export const unfollowUser = async (userId: string | number) => {
  const { data } = await axios.delete(
    `${user_service}/api/user/unfollow/${userId}`,
    getAuthHeader()
  );
  return data;
};

export const removeFollower = async (userId: string | number) => {
  const { data } = await axios.delete(
    `${user_service}/api/user/remove-follower/${userId}`,
    getAuthHeader()
  );
  return data;
};

const FollowUnfollow: React.FC<FollowUnfollowProps> = ({
  isOwnProfile,
  initialIsFollowing = false,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
  onFollowersClick,
  onFollowingClick,
  userId,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);
  
  const [isLoading, setIsLoading] = useState(false); // For the button toggle
  const [isFetchingData, setIsFetchingData] = useState(true); // For initial component mount
  
  const { loading } = useAppData();

  const refreshFollowData = async () => {
    try {
      const followersData = await getFollowers(userId);
      const followingData = await getFollowing(userId);

      setFollowersCount(followersData.totalFollowers || 0);
      setFollowingCount(followingData.totalFollowing || 0);

      if (typeof followersData.isFollowing !== "undefined") {
        setIsFollowing(followersData.isFollowing);
      }
    } catch (error) {
      console.error("Failed to refresh follow data:", error);
    }
  };

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setFollowersCount(initialFollowersCount);
    setFollowingCount(initialFollowingCount);

    const loadInitialData = async () => {
      if (userId) {
        setIsFetchingData(true);
        await refreshFollowData();
        setIsFetchingData(false);
      } else {
        setIsFetchingData(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userId,
    initialIsFollowing,
    initialFollowersCount,
    initialFollowingCount,
    isOwnProfile,
  ]);

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // Optimistic UI update
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    setFollowersCount((prev) =>
      newFollowingState ? prev + 1 : Math.max(0, prev - 1)
    );

    try {
      if (newFollowingState) {
        await followUser(userId);
        toast.success("Followed");
      } else {
        await unfollowUser(userId);
        toast.success("Unfollowed");
      }

      await refreshFollowData();
    } catch (error: any) {
      // Revert on error
      setIsFollowing(!newFollowingState);
      setFollowersCount((prev) =>
        !newFollowingState ? prev + 1 : Math.max(0, prev - 1)
      );

      if (error.response?.status === 409) {
        toast.error("You are already following this user.");
        await refreshFollowData();
      } else if (error.response?.status === 404) {
        toast.error("You are not following this user.");
        await refreshFollowData();
      } else {
        toast.error("Failed to update follow status");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Global app loading
  if (loading) return <Loading />;

  // ======================================================
  // SKELETON LOADER (Shows while fetching initial data)
  // ======================================================
  if (isFetchingData) {
    return (
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-4 sm:gap-8 w-full animate-pulse">
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="h-5 w-8 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            <div className="h-4 w-14 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="h-5 w-8 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            <div className="h-4 w-14 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
        </div>
        {!isOwnProfile && (
          <div className="w-full sm:w-auto shrink-0 mt-1 sm:mt-0 flex justify-center">
            <div className="w-full max-w-[200px] sm:w-[110px] h-9 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
        )}
      </div>
    );
  }

  // ======================================================
  // ACTUAL UI (Shows after data is fetched)
  // ======================================================
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-4 sm:gap-8 w-full">
      
      {/* ================= STATS ================= */}
      <div className="flex items-center gap-8">
        
        {/* FOLLOWERS */}
        <Link
          href={`/followers/${userId}`}
          onClick={onFollowersClick}
          className="flex flex-col items-center justify-center group cursor-pointer transition-all duration-200 active:scale-95"
        >
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {followersCount.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            followers
          </span>
        </Link>

        {/* FOLLOWING */}
        <Link
          href={`/following/${userId}`}
          onClick={onFollowingClick}
          className="flex flex-col items-center justify-center group cursor-pointer transition-all duration-200 active:scale-95"
        >
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {followingCount.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            following
          </span>
        </Link>
      </div>

      {/* ================= FOLLOW / UNFOLLOW MENU ================= */}
      {!isOwnProfile && (
        <div className="w-full sm:w-auto shrink-0 mt-1 sm:mt-0 flex justify-center">
          
          {isFollowing ? (
            /* --- FOLLOWING MENU (Matches your screenshot) --- */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="w-full max-w-[200px] sm:w-[120px] font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Following
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="center" 
                className="w-64 rounded-2xl p-1 bg-white dark:bg-[#1a1a1a] dark:border-[#333] shadow-xl"
              >
                <DropdownMenuItem 
                  onClick={handleToggle}
                  className="p-3 cursor-pointer rounded-xl font-medium text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
                >
                  Unfollow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          ) : (
            /* --- STANDARD FOLLOW BUTTON --- */
            <Button
              onClick={handleToggle}
              disabled={isLoading}
              size="sm"
              className="w-full max-w-[200px] sm:w-[110px] font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Follow"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowUnfollow;