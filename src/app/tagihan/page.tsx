'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, CheckCircle, Clock, DollarSign, Calendar } from 'lucide-react'

interface KasPeriod {
  id: number
  weekNo: number
  startsAt: string
  endsAt: string
  nominal: number
}

interface Student {
  id: number
  nis: string
  name: string
  kelas: string
}

interface PaymentItem {
  student: Student
  payment: {
    id: number
    amount: number
    paidAt: string
  } | null
}

export default function TagihanPage() {
  const [periods, setPeriods] = useState<KasPeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null)
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newPeriodData, setNewPeriodData] = useState({
    weekNo: '',
    nominal: '',
    startDate: '',
    endDate: ''
  })
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'payment' | 'delete'
    studentId?: number
    studentName?: string
    amount?: number
  }>({
    open: false,
    type: 'payment'
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPeriods()
  }, [])

  useEffect(() => {
    if (selectedPeriod) {
      fetchPaymentItems(selectedPeriod)
    }
  }, [selectedPeriod])

  const fetchPeriods = async () => {
    try {
      const response = await fetch('/api/kas-periods')
      if (response.ok) {
        const data = await response.json()
        setPeriods(data)
        
        // Auto-select current period
        const now = new Date()
        const currentPeriod = data.find((p: KasPeriod) => {
          const start = new Date(p.startsAt)
          const end = new Date(p.endsAt)
          return now >= start && now <= end
        })
        
        if (currentPeriod) {
          setSelectedPeriod(currentPeriod.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch periods:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data periode",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentItems = async (periodId: number) => {
    try {
      const response = await fetch(`/api/kas-periods/${periodId}/payments`)
      if (response.ok) {
        const data = await response.json()
        setPaymentItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch payment items:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive"
      })
    }
  }

  const handlePaymentClick = (student: Student, amount: number) => {
    setConfirmDialog({
      open: true,
      type: 'payment',
      studentId: student.id,
      studentName: student.name,
      amount
    })
  }

  const handlePaymentConfirm = async () => {
    if (!selectedPeriod || !confirmDialog.studentId || !confirmDialog.amount) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/kas-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: confirmDialog.studentId,
          kasPeriodId: selectedPeriod,
          amount: confirmDialog.amount
        }),
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Pembayaran berhasil dicatat",
          variant: "success"
        })
        setConfirmDialog({ open: false, type: 'payment' })
        fetchPaymentItems(selectedPeriod)
      } else {
        throw new Error('Failed to record payment')
      }
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast({
        title: "Error",
        description: "Gagal mencatat pembayaran",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/kas-periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNo: parseInt(newPeriodData.weekNo),
          nominal: parseInt(newPeriodData.nominal),
          startsAt: newPeriodData.startDate,
          endsAt: newPeriodData.endDate
        }),
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Periode kas berhasil dibuat",
          variant: "success"
        })
        setCreateDialogOpen(false)
        setNewPeriodData({ weekNo: '', nominal: '', startDate: '', endDate: '' })
        fetchPeriods()
      } else {
        throw new Error('Failed to create period')
      }
    } catch (error) {
      console.error('Failed to create period:', error)
      toast({
        title: "Error",
        description: "Gagal membuat periode kas",
        variant: "destructive"
      })
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

  const paidCount = paymentItems.filter(item => item.payment !== null).length
  const unpaidCount = paymentItems.filter(item => item.payment === null).length
  const totalCollected = paymentItems
    .filter(item => item.payment !== null)
    .reduce((sum, item) => sum + item.payment!.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tagihan Kas</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Tagihan Kas</h1>
          <p className="text-muted-foreground">Kelola tagihan kas mingguan siswa</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Periode Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Periode Kas Baru</DialogTitle>
              <DialogDescription>
                Buat periode kas mingguan baru untuk menagih siswa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weekNo">Minggu Ke</Label>
                <Input
                  id="weekNo"
                  type="number"
                  value={newPeriodData.weekNo}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, weekNo: e.target.value })}
                  placeholder="Contoh: 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominal">Nominal (Rp)</Label>
                <Input
                  id="nominal"
                  type="number"
                  value={newPeriodData.nominal}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, nominal: e.target.value })}
                  placeholder="Contoh: 20000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newPeriodData.startDate}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newPeriodData.endDate}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Buat Periode
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedPeriod?.toString() || null} onValueChange={(value) => setSelectedPeriod(value ? parseInt(value) : null)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Periode Kas" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id.toString()}>
                  Minggu {period.weekNo} - {formatCurrency(period.nominal)} ({formatDate(period.startsAt)} - {formatDate(period.endsAt)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedPeriod && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sudah Bayar</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalCollected)} terkumpul
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{unpaidCount}</div>
                <p className="text-xs text-muted-foreground">
                  Menunggu pembayaran
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  Siswa terdaftar
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Pembayaran</CardTitle>
              <CardDescription>
                Status pembayaran kas untuk periode yang dipilih
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada data siswa</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Tanggal Bayar</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentItems.map((item) => (
                        <TableRow key={item.student.id}>
                          <TableCell className="font-medium">{item.student.nis}</TableCell>
                          <TableCell>{item.student.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.student.kelas}</Badge>
                          </TableCell>
                          <TableCell>
                            {item.payment ? (
                              <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Sudah Bayar
                              </Badge>
                            ) : (
                              <Badge variant="destructive flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Belum Bayar
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.payment ? formatCurrency(item.payment.amount) : '-'}
                          </TableCell>
                          <TableCell>
                            {item.payment ? formatDate(item.payment.paidAt) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.payment ? (
                              <span className="text-sm text-muted-foreground">Lunas</span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handlePaymentClick(item.student, periods.find(p => p.id === selectedPeriod)?.nominal || 0)}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Bayar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={
          confirmDialog.type === 'payment' 
            ? 'Konfirmasi Pembayaran' 
            : 'Konfirmasi Hapus'
        }
        description={
          confirmDialog.type === 'payment' && confirmDialog.studentName && confirmDialog.amount
            ? `Apakah Anda yakin ingin mencatat pembayaran untuk "${confirmDialog.studentName}" sebesar ${formatCurrency(confirmDialog.amount)}?`
            : 'Apakah Anda yakin ingin melanjutkan tindakan ini?'
        }
        confirmText={confirmDialog.type === 'payment' ? 'Bayar' : 'Hapus'}
        cancelText="Batal"
        onConfirm={handlePaymentConfirm}
        variant={confirmDialog.type === 'payment' ? 'default' : 'delete'}
        loading={actionLoading}
      />
    </div>
  )
}