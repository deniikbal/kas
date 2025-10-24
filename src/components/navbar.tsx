'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart3, Users, CreditCard, DollarSign } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/students', label: 'Siswa', icon: Users },
  { href: '/tagihan', label: 'Tagihan', icon: CreditCard },
  { href: '/pengeluaran', label: 'Pengeluaran', icon: DollarSign },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <Card className="sticky top-0 z-50 border-b">
      <nav className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            K
          </div>
          <h1 className="text-xl font-bold">Kas Siswa</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </nav>
    </Card>
  )
}