
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <ScrollArea className="flex-1">
        <main className="container mx-auto py-6 px-4 flex-1">
          <Outlet />
        </main>
      </ScrollArea>
    </div>
  );
};

export default AppLayout;
