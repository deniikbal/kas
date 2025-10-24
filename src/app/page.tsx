'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock,
  RefreshCw,
  UserPlus,
  CreditCard,
  Receipt,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalIncome: number
  totalExpense: number
  currentBalance: number
  currentWeekPayments: number
  pendingPayments: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan keuangan kas siswa</p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Siswa terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Seluruh pemasukan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpense || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Seluruh pengeluaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.currentBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats?.currentBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Minggu Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.currentWeekPayments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sudah bayar minggu ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Pembayaran</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Belum bayar minggu ini
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Akses cepat ke fitur-fitur utama
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="h-16 flex flex-col">
                <a href="/students">
                  <UserPlus className="h-6 w-6 mb-1" />
                  <span>Manajemen Siswa</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col">
                <a href="/tagihan">
                  <CreditCard className="h-6 w-6 mb-1" />
                  <span>Tagihan</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col">
                <a href="/pengeluaran">
                  <Receipt className="h-6 w-6 mb-1" />
                  <span>Catat Pengeluaran</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col">
                <a href="/reports">
                  <FileText className="h-6 w-6 mb-1" />
                  <span>Laporan</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
            <CardDescription>
              Informasi status aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Server</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aktif
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Periode Kas</span>
              <Badge variant="secondary">Minggu 1</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Terakhir Update</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}