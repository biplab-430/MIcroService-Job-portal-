"use client";

import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Edit, MoreVertical } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

import ConversationItem from "./conv-item";


import { useAppData, RealTime_service } from "@/context/AppContext";
import { SocketContext } from "@/context/socketContext";

import UniversalSearch from "./UniversalSearch";

interface IConversation {
  conversationId: string;
  updatedAt: string;
  unreadCount: number;
  user: {
    user_id: number;
    name: string;
    bio?: string;
    profile_pic?: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
  };
}

function MessageSidebar() {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppData();
  const { socket, onlineUsers } = useContext(SocketContext);
  const token = Cookies.get("token");

  // ================= FETCH CONVERSATIONS =================
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);

        const { data } = await axios.get(
          `${RealTime_service}/api/chat/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          setConversations(data.conversations);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load chats.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchConversations();
    }
  }, [token]);

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    if (!socket || !user) return;

    // 1. DEFINE NAMED FUNCTIONS FOR LISTENERS
    const handleReceiveMessage = (message: any) => {
      setConversations((prev) => {
        let exists = false;

        const updated = prev.map((conv) => {
          if (conv.conversationId === message.conversationId) {
            exists = true;
            
            // Don't increment badge if currently viewing this chat
            const isActiveChat = params?.conversationId === message.conversationId;
            const isMine = message.senderId === user.user_id;

            return {
              ...conv,
              updatedAt: message.createdAt,
              unreadCount:
                !isMine && !isActiveChat
                  ? conv.unreadCount + 1
                  : conv.unreadCount,
              lastMessage: {
                _id: message._id,
                content: message.content,
                createdAt: message.createdAt,
              },
            };
          }
          return conv;
        });

        // SORT LATEST FIRST
        updated.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return [...updated];
      });
    };

    const handleMessagesSeen = ({ conversationId }: any) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    };

    const handleMessageEdited = (updatedMessage: any) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === updatedMessage.conversationId
            ? {
                ...conv,
                lastMessage: conv.lastMessage
                  ? {
                      ...conv.lastMessage,
                      content: updatedMessage.content,
                    }
                  : undefined,
              }
            : conv
        )
      );
    };

    const handleMessageDeleted = ({ messageId, conversationId }: any) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (
            conv.conversationId === conversationId &&
            conv.lastMessage?._id === messageId
          ) {
            return {
              ...conv,
              lastMessage: conv.lastMessage
                ? {
                    ...conv.lastMessage,
                    content: "This message was deleted",
                  }
                : undefined,
            };
          }
          return conv;
        })
      );
    };

    const handleChatCleared = ({ conversationId }: any) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === conversationId
            ? { ...conv, lastMessage: undefined }
            : conv
        )
      );
    };

    // 2. ATTACH THE LISTENERS
    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_seen", handleMessagesSeen);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("chat_cleared", handleChatCleared);

    // 3. CLEAN UP EXACT INSTANCES ONLY
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_seen", handleMessagesSeen);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("chat_cleared", handleChatCleared);
    };
  }, [socket, user, params?.conversationId]);

  // === INSTANTLY CLEAR UNREAD BADGE ON CLICK ===
  useEffect(() => {
    if (params?.conversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === params?.conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  }, [params?.conversationId]);

  // ================= FILTER =================
  const filteredConversations = conversations.filter((conv) =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-background border-r">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b h-16 shrink-0">
        <h2 className="text-xl font-semibold tracking-tight">Chats</h2>
        <div className="flex gap-3 text-muted-foreground">
          <button className="hover:text-foreground transition">
            <Edit className="w-5 h-5" />
          </button>
          <button className="hover:text-foreground transition">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
   <UniversalSearch conversations={conversations} />

      {/* CONVERSATIONS */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading chats...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500">
            {error}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No chats found.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = params?.conversationId === conv.conversationId;

            const timeString = new Date(conv.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            const isOnline = onlineUsers.includes(
              conv.user?.user_id?.toString()
            );

            return (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.conversationId}`}
              >
                <ConversationItem
                  name={conv.user?.name || "Unknown User"}
                  lastMessage={conv.lastMessage?.content || "Started a chat"}
                  timestamp={timeString}
                  unreadCount={conv.unreadCount}
                  avatar={
                    conv.user?.profile_pic ||
                    conv.user?.name?.charAt(0) ||
                    "U"
                  }
                  isActive={isActive}
                  isOnline={isOnline}
                />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MessageSidebar;