"use client";

import React, {
  useState,
  useRef,
  useContext,
} from "react";

import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import {
  Send,
  Paperclip,
  X,
  FileText,
  Loader2,
} from "lucide-react";

import {
  useAppData,
  RealTime_service,
} from "@/context/AppContext";

import { SocketContext } from "@/context/socketContext";

type Props = {
  conversationId?: string;
  receiverId: number;
};

interface IMessage {
  _id: string;
  conversationId: string;
  senderId: number;
  receiverId: number;
  content: string;
  mediaUrl?: string;
  type: "text" | "image" | "document";
  status: "sent" | "delivered" | "seen";
  createdAt: string;
}

const MessageInput = ({
  conversationId,
  receiverId,
}: Props) => {
  const [message, setMessage] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const { user } =
    useAppData();

  const { socket } =
    useContext(SocketContext);

  const token =
    Cookies.get("token");

  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  // ================= FILE CHANGE =================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      e.target.files &&
      e.target.files[0]
    ) {
      setFile(
        e.target.files[0]
      );
    }
  };

  // ================= REMOVE FILE =================

  const handleRemoveFile = () => {
    setFile(null);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  // ================= SEND MESSAGE =================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !file) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("receiverId", receiverId.toString());

      if (conversationId) {
        formData.append("conversationId", conversationId);
      }

      if (message.trim()) {
        formData.append("content", message);
      }

      // FILE
      if (file) {
        formData.append("file", file);
      }

      const { data } = await axios.post(
        `${RealTime_service}/api/chat/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Message sent");

        // CLEAR INPUTS
        setMessage("");
        setFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to send message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background relative">
      {/* FILE PREVIEW */}

      {file && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-muted border rounded-lg flex items-center gap-3 shadow-sm mx-4 max-w-sm z-10">
          <div className="p-2 bg-primary/10 text-primary rounded-md">
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {file.name}
            </p>

            <p className="text-xs text-muted-foreground truncate">
              {(
                file.size /
                1024
              ).toFixed(1)}{" "}
              KB
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRemoveFile
            }
            className="p-1 hover:bg-muted-foreground/20 rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INPUT AREA */}

      <form
        onSubmit={
          handleSubmit
        }
        className="flex items-end gap-2 w-full"
      >
        {/* FILE INPUT */}

        <input
          type="file"
          ref={
            fileInputRef
          }
          onChange={
            handleFileChange
          }
          className="hidden"
        />

        {/* ATTACH BUTTON */}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* TEXT INPUT */}

        <div className="flex-1 bg-muted/50 border border-transparent focus-within:border-primary/30 focus-within:bg-background rounded-2xl transition-all duration-200">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            disabled={loading}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            className="w-full bg-transparent px-4 py-3 outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* SEND BUTTON */}

        <button
          type="submit"
          disabled={
            loading ||
            (!message.trim() &&
              !file)
          }
          className={`p-3 rounded-full flex items-center justify-center transition-all duration-200 shrink-0
          
          ${message.trim() ||
              file
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
        `}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;