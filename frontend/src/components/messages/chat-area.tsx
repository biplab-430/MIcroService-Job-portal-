"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { flushSync } from "react-dom";

import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import MessageBubble from "./message-bubble";

import {
  useAppData,
  RealTime_service,
} from "@/context/AppContext";

import { SocketContext } from "@/context/socketContext";
// Update this interface at the top of ChatArea.tsx
interface IMessage {
  _id: string;
  conversationId: string;
  senderId: number;
  receiverId: number;
  content: string;
  mediaUrl?: string; // ADD THIS
  type?: "text" | "image" | "document"; // ADD THIS
  status: "sent" | "delivered" | "seen";
  createdAt: string;
  isEdited?: boolean;
  deletedForEveryone?: boolean;
}

export default function ChatArea({
  conversationId,
}: {
  conversationId: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // LOCK: Prevents multiple API calls firing at the exact same time when scrolling
  const isFetchingRef = useRef(false);

  const { user } = useAppData();
  const { socket } = useContext(SocketContext);
  const token = Cookies.get("token");

  // ================= STATES =================

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ================= FETCH MESSAGES =================

  const fetchMessages = async (
    pageNumber = 1,
    appendOlder = false
  ) => {
    isFetchingRef.current = true; // Lock active

    try {
      if (appendOlder) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${RealTime_service}/api/chat/get/messages`,
        {
          params: {
            conversationId,
            page: pageNumber,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        const fetchedMessages = data.messages;

        // Stop only when no messages are returned
        if (fetchedMessages.length === 0) {
          setHasMore(false);
        }

        if (appendOlder) {
          const container = scrollRef.current;
          const previousHeight = container?.scrollHeight || 0;

          // Force synchronous DOM update before measuring height
          flushSync(() => {
            setMessages((prev) => {
              const existingIds = new Set(
                prev.map((msg) => msg._id)
              );

              const uniqueOlder = fetchedMessages.filter(
                (msg: IMessage) => !existingIds.has(msg._id)
              );

              return [...uniqueOlder, ...prev];
            });
          });

          // Measure new height safely after the DOM has repainted
          if (container) {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - previousHeight;
          }
        } else {
          setMessages(fetchedMessages);

          requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
              behavior: "auto",
            });
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false; // Release the lock
    }
  };

  // ================= INITIAL FETCH & MARK AS READ =================

  useEffect(() => {
    if (!conversationId || !token) return;

    setPage(1);
    setHasMore(true);
    fetchMessages(1, false);

    // 🚀 HIT THE BACKEND API TO MARK AS READ
    const markConversationAsRead = async () => {
      try {
        // IMPORTANT: Ensure this URL matches your Express router path for the markAsRead controller
        await axios.put(
          `${RealTime_service}/api/chat/conversations/mark-read`,
          { conversationId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to mark messages as read", error);
      }
    };

    markConversationAsRead();
  }, [conversationId, token]);

  // ================= INFINITE SCROLL =================

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (
        container.scrollTop <= 100 &&
        hasMore &&
        !isFetchingRef.current // Check the lock
      ) {
        isFetchingRef.current = true; // Lock instantly
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchMessages(nextPage, true);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [page, hasMore]);

  // ================= SOCKET EVENTS =================

  useEffect(() => {
    if (!socket || !conversationId || !user) return;

    // JOIN ROOM
    socket.emit("join_conversation", conversationId);

    // === CREATE NAMED FUNCTIONS TO FIX THE "SOCKET ASSASSIN" BUG ===

   const handleReceiveMessage = (message: IMessage) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });

        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        });

        // 🚀 THE FIX: If I am receiving a message that SOMEONE ELSE sent me,
        // and I currently have this chat open, instantly tell the server I read it!
        if (message.senderId !== user?.user_id) {
          try {
            axios.put(
              `${RealTime_service}/api/chat/conversations/mark-read`,
              { conversationId },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          } catch (error) {
            console.error("Failed to auto-read new message", error);
          }
        }
      }
    };

    const handleMessageEdited = (updatedMessage: IMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    const handleMessageDeleted = ({ messageId, deleteType }: any) => {
      if (deleteType === "me") {
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== messageId)
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                ...msg,
                content: "This message was deleted",
                deletedForEveryone: true,
              }
              : msg
          )
        );
      }
    };

 const handleMessagesSeen = ({ conversationId: seenConversationId }: any) => {
      if (seenConversationId !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          // 🚀 FIXED: Added ? to user and check if status is already seen
          msg.senderId === user?.user_id && msg.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    };
    // ATTACH NAMED LISTENERS
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("messages_seen", handleMessagesSeen);

    return () => {
      // ONLY REMOVE THESE SPECIFIC INSTANCES, LEAVING THE SIDEBAR ALONE
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("messages_seen", handleMessagesSeen);
    };
  }, [socket, conversationId, user]);

  // ================= UI FUNCTIONS =================

  async function handleDelete(
    messageId: string,
    deleteType: "me" | "everyone"
  ) {
    try {
      await axios.delete(
        `${RealTime_service}/api/chat/delete/messages/${messageId}`,
        {
          data: { deleteType },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (deleteType === "me") {
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== messageId)
        );
      }

      if (deleteType === "everyone") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                ...msg,
                content: "This message was deleted",
                deletedForEveryone: true,
              }
              : msg
          )
        );
      }

      socket?.emit("delete_message", {
        messageId,
        conversationId,
        deleteType,
      });

      toast.success("Message deleted");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to delete message"
      );
    }
  }

  async function handleEdit(
    messageId: string,
    content: string
  ) {
    try {
      await axios.put(
        `${RealTime_service}/api/chat/messages/${messageId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, content, isEdited: true }
            : msg
        )
      );

      socket?.emit("edit_message", {
        messageId,
        content,
        conversationId,
      });

      toast.success("Message updated");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to edit message"
      );
    }
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Loading messages...
      </div>
    );
  }

  // ================= UI =================

  return (
    <div
      ref={scrollRef}
      /* CRITICAL FIX: Added min-h-0 and overflowAnchor */
      className="flex-1 overflow-y-auto flex flex-col gap-4 p-2 w-full min-h-0"
      style={{ overflowAnchor: "none" }}
    >
      {loadingMore && (
        <div className="text-center text-xs text-muted-foreground py-2">
          Loading older messages...
        </div>
      )}

      {messages.map((message) => {
        const isOwnMessage =
          message.senderId === user?.user_id;

        const displayTime = new Date(
          message.createdAt
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <MessageBubble
            key={message._id}
            id={message._id}
            text={message.content}
            timestamp={displayTime}
           status={message.status}
            mediaUrl={message.mediaUrl} // ADD THIS
            type={message.type}         // ADD THIS
            isOwnMessage={isOwnMessage}
            createdAtRaw={message.createdAt}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      })}

      {/* AUTO SCROLL TARGET */}
      <div ref={bottomRef} />
    </div>
  );
}