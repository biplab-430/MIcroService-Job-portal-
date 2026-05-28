import React from 'react';
import { MessageSquare } from 'lucide-react';

const MessagesEmptyStatePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background text-center p-8 border-l border-transparent">
      
      {/* Soft icon background circle */}
      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-border/50">
        <MessageSquare className="w-12 h-12 text-muted-foreground/70" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-2xl font-semibold tracking-tight mb-2 text-foreground">
        Your Messages
      </h2>
      
      <p className="text-muted-foreground max-w-sm text-sm">
        Select a conversation from the sidebar to start chatting, or search for a connection to send a new message.
      </p>

    </div>
  );
};

export default MessagesEmptyStatePage;