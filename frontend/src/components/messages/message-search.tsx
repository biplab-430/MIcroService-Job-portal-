"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  Search,
  X,
  Loader2,
} from "lucide-react";

import axios from "axios";
import Cookies from "js-cookie";

import {
  RealTime_service,
  useAppData,
} from "@/context/AppContext";

interface IConversation {
  user: {
    user_id: number;
    name: string;
  };
}

// 1. ADDED conversationId TO PROPS
interface MessageSearchProps {
  conversations?: IConversation[]; 
  conversationId?: string; 
}

interface MessageResult {
  _id: string;
  content: string;
  senderId: number;
  conversationId: string;
  createdAt: string;
}

// 2. DESTRUCTURE conversationId FROM PROPS
const MessageSearch = ({ conversations = [], conversationId }: MessageSearchProps) => {
  const { user: loggedInUser } = useAppData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MessageResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // ================= SEARCH FUNCTION =================
  const SearchInChat = async (
    searchQuery: string,
    targetConversationId?: string
  ) => {
    try {
      const token = Cookies.get("token");

      const queryParams = new URLSearchParams({
        searchQuery,
      });

      if (targetConversationId) {
        queryParams.append("conversationId", targetConversationId);
      }

      const { data } = await axios.get(
        `${RealTime_service}/api/chat/messages/search?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      return data;
    } catch (error: any) {
      console.error(
        "Search API Error:",
        error?.response?.data || error.message
      );
      return null;
    }
  };

  // ================= HANDLE SEARCH =================
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);

      // 3. PASSED conversationId INTO THE SEARCH FUNCTION
      const data = await SearchInChat(searchQuery, conversationId);

      if (data?.success) {
        setResults(data.results);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, conversationId]); // 4. ADDED TO DEPENDENCY ARRAY

  // ================= CLEAR =================
  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="p-3 border-b shrink-0 bg-background relative">
      {/* SEARCH BAR */}
      <div
        className={`
          relative flex items-center w-full h-10 rounded-full
          bg-muted/40 border border-transparent
          transition-all duration-300 ease-out
          hover:bg-muted/80 hover:border-primary/30
          ${
            isFocused
              ? "bg-background shadow-sm border-primary/50 ring-4 ring-primary/10"
              : ""
          }
        `}
      >
        {/* Search Icon */}
        <div className="pl-3 pr-2 flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Search
              className={`w-4 h-4 transition-colors duration-300 ${
                isFocused
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full h-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Clear Button */}
        <button
          onClick={handleClear}
          type="button"
          className={`
            pr-3 flex items-center justify-center transition-all duration-200
            ${
              searchQuery.length > 0
                ? "opacity-100 scale-100 cursor-pointer"
                : "opacity-0 scale-75 pointer-events-none"
            }
          `}
        >
          <div className="bg-muted-foreground/20 hover:bg-muted-foreground/40 rounded-full p-1 transition-colors">
            <X className="w-3 h-3 text-foreground" />
          </div>
        </button>
      </div>

      {/* SEARCH RESULTS */}
      {showResults && searchQuery.trim().length >= 2 && (
        <div className="absolute left-0 top-16 w-full bg-background border rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
          
          {/* Empty */}
          {!loading && results.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No messages found
            </div>
          )}

          {/* Results */}
          {results.map((msg) => {
            
            // === LOGIC TO FIND THE NAME ===
            let displayName = `User ${msg.senderId}`; 
            
            if (msg.senderId === loggedInUser?.user_id) {
              displayName = "You";
            } else {
              // Find the user in the sidebar's conversation list
              const matchingConv = conversations.find(
                (c) => c.user?.user_id === msg.senderId
              );
              if (matchingConv) {
                displayName = matchingConv.user.name;
              }
            }

            return (
              <div
                key={msg._id}
                className="p-3 border-b last:border-none hover:bg-muted/50 cursor-pointer transition"
              >
                <p className="text-sm text-foreground line-clamp-2">
                  {msg.content}
                </p>

                <div className="flex items-center justify-between mt-1">
                  
                  {/* === DISPLAY NAME INSTEAD OF ID === */}
                  <span className="text-xs text-muted-foreground font-medium text-primary">
                    {displayName}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;