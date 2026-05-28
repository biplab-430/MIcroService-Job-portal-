import React from "react";

interface ConversationItemProps {
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatar: string;
  isActive?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
}

const ConversationItem = ({
  name,
  lastMessage,
  timestamp,
  unreadCount = 0,
  avatar,
  isActive = false,
  isOnline = false,
  onClick,
}: ConversationItemProps) => {
  // Detect image/file URLs
  const isImage =
    lastMessage?.includes(
      "/image/upload/"
    );

  const isFile =
    lastMessage?.includes(
      "/raw/upload/"
    );

  const displayMessage =
    isImage
      ? "📷 Image"
      : isFile
      ? "📄 File"
      : lastMessage;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 transition cursor-pointer border-b border-border/50 
      
      hover:bg-muted/80
      
      ${
        isActive
          ? "bg-muted/60"
          : "bg-transparent"
      }
    `}
    >
      {/* Avatar */}

      <div className="relative shrink-0">
        {avatar?.startsWith(
          "http"
        ) ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {avatar}
          </div>
        )}

        {/* Online Dot */}

        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      {/* Message Info */}

      <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
        {/* Top Row */}

        <div className="flex justify-between items-baseline gap-2 mb-0.5">
          <span className="font-semibold text-sm truncate text-foreground">
            {name}
          </span>

          <span
            className={`text-[11px] whitespace-nowrap shrink-0 ${
              unreadCount > 0
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            {timestamp}
          </span>
        </div>

        {/* Bottom Row */}

        <div className="flex justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
            {displayMessage}
          </p>

          {/* Unread Badge */}

          {unreadCount >
            0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;