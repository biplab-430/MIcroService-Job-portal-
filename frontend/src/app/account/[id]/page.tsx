"use client";

import Appliedjobs from "@/app/components/Applied-job";
import Company from "@/app/components/company"; 
import Info from "@/app/components/info";
import Skills from "@/app/components/skills";

import Loading from "@/components/loading";

import { user_service, useAppData } from "@/context/AppContext"; 
import { User } from "@/type";

import axios from "axios";
import Cookies from "js-cookie";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const UserAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const id = params?.id;

  // Pull context data
  const { user: loggedInUser, applications } = useAppData();

  // Evaluate if the profile being viewed belongs to the logged-in user
  const isYourAccount = loggedInUser?.user_id?.toString() === id?.toString();

  async function fetchUser() {
    const token = Cookies.get("token");

    try {
      const { data } = await axios.get(
        `${user_service}/api/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) return <Loading />;

  return (
    <>
      {user && (
        <div className='w-[90%] md:w-[60%] m-auto space-y-6 pb-12'>
          
          {/* Info component handles its own layout and internally mounts FollowUnfollow */}
          <Info user={user} isYourAccount={isYourAccount} />

          {user.role === 'jobseeker' && (
            <>
              <Skills user={user} isYourAccount={isYourAccount} />
              
              {isYourAccount && applications && (
                 <Appliedjobs applications={applications} />
              )}
            </>
          )}

          {user.role === 'recruiter' && (
            <>
              {isYourAccount && (
                <Company />
              )}
            </>
          )}

        </div>
      )}
    </>
  );
};

export default UserAccount;