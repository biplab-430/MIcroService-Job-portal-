"use client"
import Loading from '@/components/loading'
import { useAppData } from '@/context/AppContext'
import React, { useEffect } from 'react'
import Info from '../components/info'
import Skills from '../components/skills'
import Company from '../components/company'

import { useRouter } from "next/navigation";
import Appliedjobs from '../components/Applied-job'

const AccountPage = () => {
    const { isAuth, user, loading, applications } = useAppData()
    const router = useRouter()

   // ---> ADDED DEPENDENCY ARRAY HERE to prevent infinite loops
   useEffect(() => {
    if(!isAuth && !loading){
      router.push('/login') // <--- MINOR TWEAK: Changed './login' to '/login'
    }
   }, [isAuth, loading, router])    

    if(loading) return <Loading/>

  return (
  <>
  {user && ( 
    <div className='w-[90%] md:w-[60%] m-auto'>
        
        {/* The Follow/Unfollow stats are now automatically rendered INSIDE this Info component! */}
        <Info user={user} isYourAccount={true}/>
        
         {
          user.role ==='jobseeker' && <Skills user={user} isYourAccount={true}/>
         }
         {
          user.role ==='jobseeker' && <Appliedjobs applications={applications}/>
         }
         {
          user.role ==='recruiter' && <Company/>
         }
    </div>
  )}
  </>
  );
}

export default AccountPage