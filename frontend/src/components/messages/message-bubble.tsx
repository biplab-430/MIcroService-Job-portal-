"use client";

import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  MoreVertical,
  CheckCheck,
  Check,
  Pencil,
  Trash2,
  FileText, // Added for document icon
} from "lucide-react";

type Props = {
  id: string;
  text: string;
  mediaUrl?: string; // Added for media
  type?: "text" | "image" | "document"; // Added for media
  timestamp: string;
  createdAtRaw?: string; // Added for time-limit calculation
  status: "sent" | "delivered" | "seen"; // 🚀 CHANGED from isRead to status
  isOwnMessage: boolean;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (
    id: string,
    deleteType: "me" | "everyone"
  ) => Promise<void>;
};

export default function MessageBubble({
  id,
  text,
  mediaUrl,
  type,
  timestamp,
  createdAtRaw,
  status, // 🚀 CHANGED from isRead to status
  isOwnMessage,
  onEdit,
  onDelete,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editedText, setEditedText] = useState(text);

  const isDeleted = text === "This message was deleted";

  // ================= LOGIC CHECKS FOR EDITING =================
  const isExpired = createdAtRaw 
    ? Date.now() - new Date(createdAtRaw).getTime() > 15 * 60 * 1000 
    : false;
  
  const isTextOnly = type === "text" || type === undefined; 
  const canEdit = isTextOnly && !isExpired;
  // ============================================================

  const handleEditSave = async () => {
    if (!editedText.trim()) return;

    await onEdit(id, editedText);

    setEditOpen(false);
  };

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        }`}
      >
        {/* ACTION BUTTON (Needs z-10 so it sits above media) */}
        {isOwnMessage && !isDeleted && (
          <div className="absolute top-1 right-1 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-black/10 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (canEdit) setEditOpen(true);
                  }}
                  disabled={!canEdit}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit {isExpired && "(Expired)"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* IMAGE PREVIEW */}
        {type === "image" && mediaUrl && !isDeleted && (
          <div className="mt-2 mb-2 pr-4">
            <img
              src={mediaUrl}
              alt="Attachment"
              className="max-w-[200px] sm:max-w-[250px] object-cover rounded-md"
            />
          </div>
        )}

        {/* DOCUMENT PREVIEW */}
        {type === "document" && mediaUrl && !isDeleted && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 mb-2 pr-4 flex items-center gap-2 p-2 rounded-lg border transition-colors ${
              isOwnMessage
                ? "bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20"
                : "bg-background hover:bg-background/80 border-border"
            }`}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium underline truncate">
              View Document
            </span>
          </a>
        )}

        {/* MESSAGE TEXT */}
        {text && (
          <p
            className={`text-sm wrap-break-word pr-5 ${
              isDeleted ? "italic opacity-70" : ""
            }`}
          >
            {text}
          </p>
        )}

        {/* FOOTER - 🚀 UPDATED TICK LOGIC HERE */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">{timestamp}</span>

          {isOwnMessage && (
            <>
              {status === "seen" && (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              )}
              {status === "delivered" && (
                <CheckCheck className="w-3 h-3 opacity-70" />
              )}
              {status === "sent" && (
                <Check className="w-3 h-3 opacity-70" />
              )}
            </>
          )}
        </div>

        {/* EDIT DIALOG */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
            </DialogHeader>

            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>

              <Button onClick={handleEditSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE DIALOG */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  await onDelete(id, "me");
                  setDeleteOpen(false);
                }}
              >
                Delete For Me
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  await onDelete(id, "everyone");
                  setDeleteOpen(false);
                }}
              >
                Delete For Everyone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}