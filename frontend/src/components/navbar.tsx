"use client"

import Link from 'next/link';
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';

import { Button } from './ui/button';
import { Briefcase, Home, HomeIcon, Info, LogOut, LogOutIcon, Menu, MessageCircleIcon, Search, User, User2, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ModeToggle } from './mode-toggle';
import { useAppData, RealTime_service } from '@/context/AppContext';
import { SocketContext } from '@/context/socketContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { isAuth, user, loading, LogOutuser } = useAppData()
    
    // 🚀 PULL SOCKET FROM CONTEXT TO ENSURE LISTENERS ATTACH
    const { socket } = useContext(SocketContext);

    // ================= GLOBAL UNREAD STATES =================
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [unreadLoading, setUnreadLoading] = useState(false);
    
    const toggleMenu = () => {
        setIsOpen(!isOpen)
    };
    
    const handleConfirmLogout = () => {
        LogOutuser();
        setIsOpen(false);
        setTotalUnreadMessages(0); // Clear badge on logout
    }

    // ================= FETCH GLOBAL UNREAD =================
    const getGlobalUnreadBadge = async () => {
      try {
        if (!isAuth) return;
        setUnreadLoading(true);

        const token = Cookies.get("token");
        const { data } = await axios.get(
          `${RealTime_service}/api/chat/conversations/unread-badge`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data?.success) {
          setTotalUnreadMessages(data.totalUnreadMessages || 0);
        }
      } catch (error: any) {
        console.error("Global unread fetch error:", error?.response?.data || error.message);
      } finally {
        setUnreadLoading(false);
      }
    };

    // ================= INITIAL FETCH =================
    useEffect(() => {
      getGlobalUnreadBadge();
    }, [isAuth]);

    // ================= REALTIME LISTENER =================
    useEffect(() => {
      // Wait for BOTH auth and socket to be ready
      if (!isAuth || !socket) return;

      socket.on("global_unread_updated", getGlobalUnreadBadge);
      socket.on("receive_message", getGlobalUnreadBadge);
      socket.on("messages_seen", getGlobalUnreadBadge);

      return () => {
        socket.off("global_unread_updated", getGlobalUnreadBadge);
        socket.off("receive_message", getGlobalUnreadBadge);
        socket.off("messages_seen", getGlobalUnreadBadge);
      };
    }, [isAuth, socket]);
    
  return (
    <nav className='z-50 sticky top-0 bg-background/80 border-b backdrop-blur-md shadow-sm'>
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link href={'/'} className='flex items-center gap-1 group'>
           <div className="text-2xl font-bold tracking-tight">
            <span className='bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                HIRE
            </span>
            <span className='text-red-500'>Heaven</span>
           </div>
           </Link>
        </div>
        
        {/* desktop navigation */}
       <div className="hidden md:flex items-center space-x-1">
  {/* Home */}
  <Link href={'/'} className="flex items-center group">
    <Button className="flex items-center font-medium px-3" variant="ghost">
      <Home size={18} />
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-25 group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">
        Home
      </span>
    </Button>
  </Link>

  {/* Jobs */}
  <Link href={'/job'} className="flex items-center group">
    <Button className="flex items-center font-medium px-3" variant="ghost">
      <Briefcase size={18} />
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-25 group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">
        Jobs
      </span>
    </Button>
  </Link>

  {/* About */}
  <Link href={'/about'} className="flex items-center group">
    <Button className="flex items-center font-medium px-3" variant="ghost">
      <Info size={18} />
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-25 group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">
        About
      </span>
    </Button>
  </Link>

  {/* Search */}
  <Link href={'/search'} className="flex items-center group">
    <Button className="flex items-center font-medium px-3" variant="ghost">
      <Search size={18} />
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-25 group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">
        Search
      </span>
    </Button>
  </Link>

  {/* Messages */}
  <Link href={'/messages'} onClick={toggleMenu} className="flex items-center group relative">
    <Button variant="ghost" className="flex items-center font-medium px-3 h-10 relative">
      <div className="relative flex items-center justify-center">
        <MessageCircleIcon size={18} />
        
        {/* DESKTOP GLOBAL BADGE */}
        {!unreadLoading && totalUnreadMessages > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-in fade-in zoom-in">
            {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
          </span>
        )}
      </div>

      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-25 group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">
        Messages
      </span>
    </Button>
  </Link>
</div>

          {/* Right side action */}
          <div className="hidden md:flex items-center gap-3">
          {
            loading ? "": <>
              {isAuth? 
           ( <Popover>
            <PopoverTrigger asChild>
               <button className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
                <Avatar className='h-9 w-9 ring-2 ring-offset-2 ring-offset-background ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all'>
                  <AvatarImage src={user ? user.profile_pic as string : ""} alt={user? user.name :""}/>
                  <AvatarFallback className='bg-blue-100 dark:bg-blue-950 text-blue-600'>
                     {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
               </button>
            </PopoverTrigger>
          <PopoverContent className='w-56 p-2' align='end'>
            <div className="px-3 py-2 mb-2 border-b">
              <p className='text-sm font-semibold '> {user?.name.toUpperCase()}</p>
              <p className='text-xs opacity-60 truncate'>{user?.email}</p>
            </div>
            <Link href={'/account'}>
            <Button className='w-full justify-start gap-2' variant={'ghost'}>
           <User size={16}/>My Profile
            </Button>
            </Link>

            {/* Desktop Logout Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className='w-full justify-start gap-2 mt-1' variant={'ghost'}>
                  <LogOut size={16}/>Log OUT
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account and redirected to the sign-in page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmLogout} className="bg-red-600 hover:bg-red-700 text-white">
                    Yes, log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </PopoverContent>

           </Popover>)
            :(<Link href={"/login"}><Button className='gap-2 '>
              <User size={16}/>Sign In
              </Button></Link>
            )}</>
          }
            <ModeToggle/>
          </div>

          {/* Mobile menu */}
          <div className='md:hidden flex items-center gap-3'>
             <ModeToggle/>
           <button onClick={toggleMenu} className='p-2 rounded-lg hover:bg-accent transition-colors ' aria-label='Toggle Menu'>
            {isOpen ? <X size={24}/>:<Menu size={24}/>}
           </button>
          </div>
      </div>
     </div>

     {/* Mobile view */}
     <div className={`md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100":"max-h-0 opacity-0"}`}>
      <div className="px-3 py-3 space-x-1 space-y-1 bg-background/95 backdrop-blur-md ">
        <Link href={'/'} onClick={toggleMenu}>
            <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
              <HomeIcon size={18}/>Home
            </Button>
          </Link>
        <Link href={'/job'} onClick={toggleMenu}>
            <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
              <Briefcase size={18}/>Jobs
            </Button>
          </Link>
        <Link href={'/about'} onClick={toggleMenu}>
            <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
              <Info size={18}/>About
            </Button>
          </Link>
        <Link href={'/search'} onClick={toggleMenu}>
            <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
              <Search size={18}/>search
            </Button>
          </Link>
        <Link href={'/messages'} onClick={toggleMenu}>
            <Button variant={'ghost'} className='w-full justify-start gap-3 h-11 relative'>
              <div className="relative flex items-center justify-center">
                <MessageCircleIcon size={18}/>
                
                {/* MOBILE GLOBAL BADGE */}
                {!unreadLoading && totalUnreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
              </div>
              Messages
            </Button>
          </Link>

          {
            isAuth ? (<>
               <Link href={"/account"} onClick={toggleMenu}>
                 <Button variant={'ghost'} className='w-full justify-start gap-3 h-11 '>
              <User size={18}/>My Profile
            </Button>
           </Link>
           
            {/* Mobile Logout Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={'destructive'} className='w-full justify-start gap-3 h-11'>
                  <LogOutIcon size={18}/>Log OUT
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account and redirected to the sign-in page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmLogout} className="bg-red-600 hover:bg-red-700 text-white">
                    Yes, log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </>) :(
           <Link href={"/login"} onClick={toggleMenu}>
                 <Button  className='w-full justify-start gap-3 h-11 mt-2'>
              <User2 size={18}/>Sign In
            </Button>
           </Link>
            )
          }
      </div>
     </div>
    </nav>
  )
}

export default Navbar