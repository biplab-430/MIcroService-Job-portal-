"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import MessageSidebar from '@/components/messages/message-sidebar';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isListView = pathname === '/messages';

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-background border-t">
      
     
      <aside className={`border-r flex-col bg-muted/5 z-10 shadow-sm w-full md:w-80 lg:w-96 
        ${isListView ? 'flex' : 'hidden md:flex'}
      `}>
        <MessageSidebar />
      </aside>

      
      <main className={`flex-1 flex-col bg-background relative 
        ${isListView ? 'hidden md:flex' : 'flex'}
      `}>
        {children}
      </main>

    </div>
  );
}