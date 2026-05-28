"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Loader2,
  Search,
  X,
} from "lucide-react";

import axios from "axios";
import Cookies from "js-cookie";

import {
  RealTime_service,
  useAppData,
} from "@/context/AppContext";

interface IConversation {
  conversationId: string;

  user: {
    user_id: number;
    name: string;
    bio?: string;
    profile_pic?: string;
  };

  lastMessage?: {
    content?: string;
  };

  updatedAt: string;
}

interface MessageResult {
  _id: string;
  content: string;
  senderId: number;
  conversationId: string;
  createdAt: string;
}

interface Props {
  conversations: IConversation[];
}

const UniversalSearch = ({
  conversations,
}: Props) => {

  const { user } =
    useAppData();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showResults, setShowResults] =
    useState(false);

  const [messageResults, setMessageResults] =
    useState<MessageResult[]>(
      []
    );

  const [conversationResults, setConversationResults] =
    useState<IConversation[]>(
      []
    );

  // ================= SEARCH =================

  useEffect(() => {

    const debounce =
      setTimeout(async () => {

        if (
          searchQuery.trim()
            .length < 1
        ) {
          setConversationResults(
            []
          );

          setMessageResults([]);

          return;
        }

        setLoading(true);

        try {

          const token =
            Cookies.get("token");

          // ================= SEARCH CONVERSATIONS =================

          const filteredConversations =
            conversations.filter(
              (conv) =>
                conv.user.name
                  ?.toLowerCase()
                  .includes(
                    searchQuery.toLowerCase()
                  )
            );

          setConversationResults(
            filteredConversations
          );

          // ================= SEARCH MESSAGES =================

          const { data } =
            await axios.get(
              `${RealTime_service}/api/chat/messages/search?searchQuery=${searchQuery}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          if (data.success) {
            setMessageResults(
              data.results
            );
          }

        } catch (error) {

          console.error(error);
        }

        setLoading(false);

      }, 400);

    return () =>
      clearTimeout(debounce);

  }, [
    searchQuery,
    conversations,
  ]);

  // ================= CLEAR =================

  const handleClear = () => {

    setSearchQuery("");

    setConversationResults(
      []
    );

    setMessageResults([]);

    setShowResults(false);
  };

  return (
    <div className="p-3 border-b bg-background relative">

      {/* SEARCH BAR */}

      <div className="relative flex items-center h-11 rounded-full bg-muted/40 border transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">

        <div className="pl-4">

          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <input
          type="text"
          placeholder="Search"
          className="w-full h-full bg-transparent outline-none px-3 text-sm"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(
              e.target.value
            );

            setShowResults(true);
          }}
        />

        <button
          onClick={handleClear}
          className={`pr-4 transition ${
            searchQuery
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* RESULTS */}

      {showResults &&
        searchQuery && (

        <div className="absolute left-0 top-16 w-full bg-background border rounded-xl shadow-xl z-50 max-h-[500px] overflow-y-auto">

          {/* CHATS */}

          {conversationResults.length >
            0 && (

            <div className="p-2">

              <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                Chats
              </p>

              {conversationResults.map(
                (conv) => (

                  <Link
                    key={
                      conv.conversationId
                    }
                    href={`/messages/${conv.conversationId}`}
                  >

                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition">

                      <img
                        src={
                          conv.user
                            .profile_pic ||
                          "/profile.png"
                        }
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      <div className="min-w-0">

                        <p className="text-sm font-medium truncate">
                          {
                            conv.user
                              .name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground truncate">
                          {
                            conv.lastMessage
                              ?.content ||
                            "Start chatting"
                          }
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}

          {/* MESSAGES */}

          {messageResults.length >
            0 && (

            <div className="p-2 border-t">

              <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                Messages
              </p>

              {messageResults.map(
                (msg) => {

                  let senderName =
                    "Unknown";

                  if (
                    msg.senderId ===
                    user?.user_id
                  ) {
                    senderName =
                      "You";
                  } else {

                    const found =
                      conversations.find(
                        (c) =>
                          c.user
                            .user_id ===
                          msg.senderId
                      );

                    if (found) {
                      senderName =
                        found.user.name;
                    }
                  }

                  return (
                    <Link
                      key={msg._id}
                      href={`/messages/${msg.conversationId}`}
                    >

                      <div className="p-2 rounded-lg hover:bg-muted/50 transition">

                        <p className="text-sm line-clamp-1">
                          {msg.content}
                        </p>

                        <div className="flex items-center justify-between mt-1">

                          <span className="text-xs text-primary">
                            {
                              senderName
                            }
                          </span>

                          <span className="text-[10px] text-muted-foreground">
                            {new Date(
                              msg.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            conversationResults.length ===
              0 &&
            messageResults.length ===
              0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;