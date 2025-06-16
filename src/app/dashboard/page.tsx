'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { StockList } from '@/components/StockList';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex md:hidden">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                {/* Filter sidebar content will go here */}
                <div className="py-6">
                  <h2 className="mb-2 px-2 text-lg font-semibold">Filters</h2>
                  {/* Filter components will be added here */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-bold">Penny Stock Insights</h1>
            <nav className="flex items-center space-x-4">{/* Add navigation items here */}</nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar - hidden on mobile, shown on desktop */}
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <h2 className="mb-2 px-2 text-lg font-semibold">Filters</h2>
            {/* Filter components will be added here */}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Stocks</h2>
              {/* Add action buttons here */}
            </div>
            <div className="grid gap-4">
              <StockList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
