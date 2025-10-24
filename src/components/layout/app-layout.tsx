'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Sidebar from './sidebar'
import AuthLayout from './auth-layout'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, isLoading } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <AuthLayout />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Menu Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed && "rotate-180"
              )} />
            </Button>
          </div>
          
          {/* Breadcrumb or Page Title bisa ditambahkan di sini */}
          <div className="flex-1" />
          
          {/* Quick Actions atau User Info bisa ditambahkan di sini */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}