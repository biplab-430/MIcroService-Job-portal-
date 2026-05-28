"use client";

import React, { useEffect, useState, use, useContext } from "react"; // <-- ADDED useContext
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, MoreVertical, Trash2, Search } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import ChatArea from "@/components/messages/chat-area";
import MessageInput from "@/components/messages/message-input";
import MessageSearch from "@/components/messages/message-search"; 
import { RealTime_service } from "@/context/AppContext";

// 🚀 IMPORT SOCKET CONTEXT
import { SocketContext } from "@/context/socketContext"; 

interface ConversationUser {
  user_id: number;
  name: string;
  profile_pic?: string;
  isOnline?: boolean;
}

export default function MessagePage({
  params,
}: {
  params: Promise<{
    conversationId: string;
  }>;
}) {
  const resolvedParams = use(params);
  const conversationId = resolvedParams.conversationId;
  const router = useRouter();

  const [chatUser, setChatUser] = useState<ConversationUser | null>(null);
  const [loading, setLoading] = useState(true);

  // --- UI STATES ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSearch, setShowSearch] = useState(false); 
  const [chatRefreshKey, setChatRefreshKey] = useState(0);

  const token = Cookies.get("token");
  
  // 🚀 GRAB SOCKET FROM CONTEXT
  const { socket } = useContext(SocketContext); 

  // ================= FETCH CONVERSATION =================
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          `${RealTime_service}/api/chat/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          const currentConversation = data.conversations.find(
            (conv: any) => conv.conversationId === conversationId
          );

          if (currentConversation) {
            setChatUser(currentConversation.user);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token && conversationId) {
      fetchConversation();
    }
  }, [conversationId, token]);

  // ================= 🚀 REAL-TIME ONLINE STATUS =================
  useEffect(() => {
    if (!socket || !chatUser) return;

    const handleUserOnline = ({ userId }: any) => {
      if (Number(userId) === chatUser.user_id) {
        setChatUser((prev) => (prev ? { ...prev, isOnline: true } : prev));
      }
    };

    const handleUserOffline = ({ userId }: any) => {
      if (Number(userId) === chatUser.user_id) {
        setChatUser((prev) => (prev ? { ...prev, isOnline: false } : prev));
      }
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket, chatUser?.user_id]);
  // ==============================================================

  const handleVisitProfile = () => {
    if (chatUser?.user_id) {
      router.push(`/account/${chatUser.user_id}`);
    }
  };

  // ================= CLEAR CHAT API CALL =================
  const handleClearChat = async () => {
    try {
      setIsClearing(true);
      const { data } = await axios.delete(
        `${RealTime_service}/api/chat/conversations/${conversationId}/clear`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setIsAlertOpen(false);
        setChatRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to clear chat:", error);
    } finally {
      setIsClearing(false);
    }
  };

  // ================= UI =================
  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b h-16 shrink-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="md:hidden p-1 mr-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {chatUser?.profile_pic ? (
            <img
              src={chatUser.profile_pic}
              alt={chatUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {chatUser?.name?.charAt(0) || "U"}
            </div>
          )}

          <div className="flex flex-col">
            <h3 className="font-semibold text-sm">
              {loading
                ? "Loading..."
                : chatUser?.name || `User ${conversationId}`}
            </h3>
            <span
              className={`text-xs font-medium transition-colors duration-300 ${
                chatUser?.isOnline
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              {chatUser?.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-muted-foreground items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleVisitProfile}
                  className="hover:text-foreground transition cursor-pointer"
                >
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* DROPDOWN MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:text-foreground transition outline-none">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              
              {/* --- NEW SEARCH OPTION --- */}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4 mr-2" />
                {showSearch ? "Close Search" : "Search Chat"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={() => setIsAlertOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- CONDITIONAL SEARCH COMPONENT --- */}
      {showSearch && (
        <MessageSearch 
          conversationId={conversationId} 
          // We wrap the single user in an array so the search component can reuse the same name-mapping logic
          conversations={chatUser ? [{ user: chatUser }] as any : []} 
        />
      )}

      {/* CHAT AREA */}
      <div className="flex-1 bg-muted/5 flex flex-col min-h-0">
        <ChatArea key={chatRefreshKey} conversationId={conversationId} />
      </div>

      {/* MESSAGE INPUT */}
      <div className="p-4 border-t shrink-0 bg-background relative z-20">
        {!loading && chatUser && (
          <MessageInput
            conversationId={conversationId}
            receiverId={chatUser.user_id}
          />
        )}
      </div>

      {/* ALERT DIALOG FOR CLEAR CHAT */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the conversation history for you. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClearChat();
              }}
              disabled={isClearing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isClearing ? "Clearing..." : "Clear Chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}