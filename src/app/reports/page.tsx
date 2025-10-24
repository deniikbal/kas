'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon,
  Users,
  Receipt,
  BarChart3,
  PieChart,
  Filter,
  Printer
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReportData {
  totalIncome: number
  totalExpense: number
  netBalance: number
  totalStudents: number
  totalTransactions: number
  periodData: {
    weekNo: number
    income: number
    expense: number
    balance: number
  }[]
  categoryData: {
    category: string
    amount: number
    percentage: number
  }[]
  recentTransactions: {
    id: number
    type: 'income' | 'expense'
    category: string
    description: string
    amount: number
    date: string
    student?: {
      name: string
      nis: string
    }
  }[]
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date())
  const [reportType, setReportType] = useState('summary')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod, selectedMonth])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Mock API call - ini nanti bisa diganti dengan API call yang sesungguhnya
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: ReportData = {
        totalIncome: 15000000,
        totalExpense: 8500000,
        netBalance: 6500000,
        totalStudents: 45,
        totalTransactions: 89,
        periodData: [
          { weekNo: 1, income: 3000000, expense: 1500000, balance: 1500000 },
          { weekNo: 2, income: 3200000, expense: 2000000, balance: 1200000 },
          { weekNo: 3, income: 2800000, expense: 1800000, balance: 1000000 },
          { weekNo: 4, income: 3500000, expense: 2200000, balance: 1300000 },
          { weekNo: 5, income: 2500000, expense: 1000000, balance: 1500000 },
        ],
        categoryData: [
          { category: 'ATK', amount: 1500000, percentage: 17.6 },
          { category: 'Listrik', amount: 2000000, percentage: 23.5 },
          { category: 'Air', amount: 800000, percentage: 9.4 },
          { category: 'Internet', amount: 1200000, percentage: 14.1 },
          { category: 'Kebersihan', amount: 1000000, percentage: 11.8 },
          { category: 'Lainnya', amount: 2000000, percentage: 23.5 },
        ],
        recentTransactions: [
          {
            id: 1,
            type: 'income',
            category: 'Kas Mingguan',
            description: 'Pembayaran kas minggu 5',
            amount: 20000,
            date: '2024-01-15',
            student: { name: 'Ahmad Rizki', nis: '2024001' }
          },
          {
            id: 2,
            type: 'expense',
            category: 'ATK',
            description: 'Pembelian kertas dan pulpen',
            amount: 500000,
            date: '2024-01-14'
          },
          {
            id: 3,
            type: 'income',
            category: 'Kas Mingguan',
            description: 'Pembayaran kas minggu 5',
            amount: 20000,
            date: '2024-01-14',
            student: { name: 'Siti Nurhaliza', nis: '2024002' }
          },
          {
            id: 4,
            type: 'expense',
            category: 'Listrik',
            description: 'Pembayaran listrik bulanan',
            amount: 2000000,
            date: '2024-01-13'
          },
        ]
      }
      
      setReportData(mockData)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const handleExport = (type: 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`)
    // Implementasi export logic di sini
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Gagal memuat data laporan</p>
        <Button onClick={fetchReportData} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
          <p className="text-muted-foreground">Analisis dan ringkasan keuangan kas siswa</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Periode</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="quarter">Triwulan Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bulan</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedMonth ? format(selectedMonth, "MMMM yyyy", { locale: id }) : "Pilih bulan"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={setSelectedMonth}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Laporan</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis laporan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Ringkasan</SelectItem>
                  <SelectItem value="detailed">Detail</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(reportData.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {reportData.totalTransactions} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.categoryData.length} kategori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(reportData.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Siswa aktif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="weekly">Mingguan</TabsTrigger>
          <TabsTrigger value="category">Kategori</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grafik Per Minggu
                </CardTitle>
                <CardDescription>
                  Pemasukan dan pengeluaran per minggu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.periodData.map((period) => (
                    <div key={period.weekNo} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Minggu {period.weekNo}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-green-600">
                          {formatCurrency(period.income)}
                        </span>
                        <span className="text-sm text-red-600">
                          {formatCurrency(period.expense)}
                        </span>
                        <Badge variant={period.balance >= 0 ? "default" : "destructive"}>
                          {formatCurrency(period.balance)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribusi Pengeluaran
                </CardTitle>
                <CardDescription>
                  Pengeluaran berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.categoryData.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{category.category}</span>
                        <Badge variant="secondary">{category.percentage}%</Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Mingguan</CardTitle>
              <CardDescription>
                Detail pemasukan dan pengeluaran per minggu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Minggu</TableHead>
                    <TableHead className="text-right">Pemasukan</TableHead>
                    <TableHead className="text-right">Pengeluaran</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.periodData.map((period) => (
                    <TableRow key={period.weekNo}>
                      <TableCell className="font-medium">Minggu {period.weekNo}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(period.income)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(period.expense)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(period.balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={period.balance >= 0 ? "default" : "destructive"}>
                          {period.balance >= 0 ? "Surplus" : "Defisit"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Kategori</CardTitle>
              <CardDescription>
                Pengeluaran berdasarkan kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Persentase</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.categoryData
                    .sort((a, b) => b.amount - a.amount)
                    .map((category, index) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(category.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{category.percentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terakhir</CardTitle>
              <CardDescription>
                Daftar transaksi paling recent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.student ? (
                          <div>
                            <div className="font-medium">{transaction.student.name}</div>
                            <div className="text-sm text-muted-foreground">{transaction.student.nis}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}