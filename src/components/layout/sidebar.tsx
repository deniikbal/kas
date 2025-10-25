'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu,
  User,
  Home,
  FileText,
  Bell,
  ChevronDown,
  School
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const navItems = [
  { 
    href: '/', 
    label: 'Dashboard', 
    icon: Home,
    description: 'Ringkasan keuangan'
  },
  { 
    href: '/students', 
    label: 'Siswa', 
    icon: Users,
    description: 'Manajemen data siswa'
  },
  { 
    href: '/tagihan', 
    label: 'Tagihan', 
    icon: CreditCard,
    description: 'Pembayaran kas'
  },
  { 
    href: '/pengeluaran', 
    label: 'Pengeluaran', 
    icon: DollarSign,
    description: 'Catat pengeluaran'
  },
  { 
    href: '/reports', 
    label: 'Laporan', 
    icon: FileText,
    description: 'Laporan keuangan'
  },
]

interface SidebarProps {
  className?: string
  collapsed: boolean
}

export default function Sidebar({ className, collapsed }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Mock notification count
  const notificationCount = 3

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return null // Don't render sidebar if user is not logged in
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border",
        collapsed ? "justify-center" : "justify-start"
      )}>
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-sm">
              <School className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Kas Siswa</h1>
              <p className="text-xs text-muted-foreground">Sekolah</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-sm">
            <School className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              variant={isActive ? 'default' : 'ghost'}
              asChild
              className={cn(
                "w-full justify-start h-10 group relative",
                collapsed && "justify-center px-2",
                isActive && "bg-primary text-primary-foreground",
                !isActive && "hover:bg-muted"
              )}
            >
              <Link href={item.href} className="flex items-center space-x-3">
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive && "text-primary-foreground",
                  !isActive && "text-muted-foreground group-hover:text-foreground"
                )} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>{item.description}</div>
                  </div>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                )}
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Notifications */}
        {!collapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
          >
            <div className="relative">
              <Bell className="h-4 w-4 mr-3" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </div>
            <span className="flex-1 text-left">Notifikasi</span>
          </Button>
        )}

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start p-2 h-auto",
                collapsed && "justify-center"
              )}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.role}</div>
                  </div>
                )}
                {!collapsed && <ChevronDown className="h-3 w-3 text-muted-foreground" />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  Login: {user.lastLogin}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Saya</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Statistik</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Stats (when collapsed) */}
        {collapsed && (
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground">Online</div>
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}