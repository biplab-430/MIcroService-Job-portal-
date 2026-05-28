"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MessageSquare, Loader2 } from "lucide-react";

import { RealTime_service } from "@/context/AppContext";

export default function StartChatButton({ receiverId }: { receiverId: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const token = Cookies.get("token");

  const handleStartChat = async () => {
    if (!token) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    try {
      setIsLoading(true);

      // Hit your new getOrCreateConversation API
      const { data } = await axios.post(
        `${RealTime_service}/api/chat/conversations/${receiverId}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        const conversationId = data.conversation.conversationId;
        
        // Redirect the user to the chat page with the new conversationId
        router.push(`/messages/${conversationId}`);
      }
    } catch (error: any) {
      console.error("Failed to start chat:", error);
      toast.error(error.response?.data?.message || "Failed to start chat");
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <button
    onClick={handleStartChat}
    disabled={isLoading}
    className="
      group
      relative
      overflow-hidden
      flex items-center justify-center gap-2
      px-5 py-2.5
      rounded-xl
      bg-gradient-to-r from-green-500 to-emerald-600
      text-white
      font-medium
      shadow-md
      transition-all duration-300 ease-out
      hover:scale-105
      hover:shadow-green-500/40
      hover:shadow-xl
      active:scale-95
      disabled:opacity-70
      disabled:cursor-not-allowed
    "
  >
    {/* Hover glow */}
    <span
      className="
        absolute inset-0
        bg-white/10
        opacity-0
        group-hover:opacity-100
        transition-opacity duration-300
      "
    />

    {/* Shine effect */}
    <span
      className="
        absolute -left-20 top-0 h-full w-16
        rotate-12
        bg-white/20
        blur-md
        transition-all duration-700
        group-hover:left-[120%]
      "
    />

    <span className="relative z-10 flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <MessageSquare className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />

          <span>
            {isLoading ? "Opening Chat..." : "Message"}
          </span>

          {/* Animated Arrow */}
          <span
            className="
              inline-block
              transition-all duration-300
              group-hover:translate-x-1
            "
          >
            →
          </span>
        </>
      )}
    </span>
  </button>
);
}