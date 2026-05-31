"use client"
import { useRouter } from "next/navigation";
import { AppContextType, Application, AppProviderProps, User } from "@/type";
import React, { createContext, useContext, useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

export const utils_service =
  process.env.NEXT_PUBLIC_UTILS_SERVICE as string;



export const auth_service =
  process.env.NEXT_PUBLIC_AUTH_SERVICE as string;

export const user_service =
  process.env.NEXT_PUBLIC_USER_SERVICE as string;

export const job_service =
  process.env.NEXT_PUBLIC_JOB_SERVICE as string;

export const RealTime_service =
  process.env.NEXT_PUBLIC_REALTIME_SERVICE as string;


const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [btnLoading, setBtnLoading] = useState(false)
    const router = useRouter();
    const token = Cookies.get("token")

    async function fetchUser() {
        try {
            const { data } = await axios.get(`${user_service}/api/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setUser(data)
            setIsAuth(true)
        } catch (error: any) {
    if (error?.response?.status === 401) {
        Cookies.remove("token");
    }

    setIsAuth(false);
} finally {
            setLoading(false)
        }
    }

    async function updateProfilePic(formData: any) {
        setLoading(true)

        try {
            const { data } = await axios.put(
                `${user_service}/api/user/updated/pic`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(data.message);

            // update frontend user state
            setUser((prev: any) => ({
                ...prev,
                profile_pic: data.user.profile_pic,
            }));

        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateResume(formData: any) {
        setLoading(true);

        try {
            const { data } = await axios.put(
                `${user_service}/api/user/updated/resume`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(data.message);

            setUser((prev: any) => ({
                ...prev,
                ...data.user,
            }));

        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateUser(
        name?: string,
        phoneNumber?: string,
        bio?: string
    ) {

        setBtnLoading(true)

        try {
            const { data } = await axios.put(
                `${user_service}/api/user/updated/profile`,
                {
                    name,
                    phoneNumber,
                    bio,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(data.message);

            setUser((prev: any) => ({
                ...prev,
                ...data.user,
            }));

        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setBtnLoading(false);
        }
    }

    async function LogOutuser() {
        Cookies.set("token", "")
        setUser(null)
        setIsAuth(false)
        toast.success("Looged out")
        router.push("/login");
    }

    async function addskill(
        skill: string,
        setskill: React.Dispatch<React.SetStateAction<string>>
    ) {
        setBtnLoading(true);

        try {
            const { data } = await axios.post(
                `${user_service}/api/user/skill/add`,
                {
                    skillName: skill,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(data.message);
            setskill("");

            // add only if not already present
            setUser((prev: any) => {
                const alreadyExists = prev.skills.some(
                    (s: string) =>
                        s.toLowerCase() === skill.trim().toLowerCase()
                );

                if (alreadyExists) return prev;

                return {
                    ...prev,
                    skills: [...prev.skills, skill.trim()],
                };
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setBtnLoading(false);
        }
    }

    async function removeSkill(skill: string) {
        try {
            const { data } = await axios.put(
                `${user_service}/api/user/skill/delete`,
                {
                    skillName: skill,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(data.message);

            // update frontend instantly
            setUser((prev: any) => ({
                ...prev,
                skills: prev.skills.filter(
                    (s: string) => s !== skill
                ),
            }));

        } catch (error: any) {
            toast.error(error.response?.data?.message);
        }
    }

    async function applyJob(job_id: number) {
        setBtnLoading(true)
  try {
   const { data } = await axios.post(
      `${user_service}/api/user/apply/job`,
      { jobId: job_id },
      {
        headers: {
          Authorization:`Bearer ${token}`,
        },
      }
    );

    toast.success(data.message);
    fetchApplications()

  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || "Failed to apply for job"
    );
  }finally{
    setBtnLoading(false)
  }
}

async function deleteApplication(application_id: number) {
  setBtnLoading(true);

  try {
    const { data } = await axios.delete(
      `${user_service}/api/user/delete/job/${application_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(data.message);
       // refresh applications instantly
    await fetchApplications();

  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
        "Failed to cancel application"
    );

  } finally {
    setBtnLoading(false);
  }
}

const [applications,setApplications]=useState<Application[] >([])

async function fetchApplications() {
    try {
        const { data } = await axios.get(
            `${user_service}/api/user/application/all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setApplications(data);
    } catch (error: any) {
        // Ignore unauthorized errors during initial app load
        if (error?.response?.status !== 401) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch applications"
            );
        }
    } finally {
        setBtnLoading(false);
    }
}

   useEffect(() => {
    if (!token) {
        setLoading(false);
        return;
    }

    fetchUser();
    fetchApplications();
}, [token]);
    return <AppContext.Provider value={{ user, loading, setUser, isAuth, setIsAuth, setLoading, btnLoading, LogOutuser, updateProfilePic, updateResume, updateUser, addskill, removeSkill,applyJob,deleteApplication,applications,fetchApplications }}>{children}
        <Toaster /></AppContext.Provider>
}



export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useappadata must be within appprovider")
    }
    return context
}