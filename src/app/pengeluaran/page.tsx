'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, TrendingDown, FileText, Calculator, Trash2 } from 'lucide-react'

interface Transaction {
  id: number
  kind: string
  category: string
  description: string | null
  amount: number
  studentId: number | null
  createdAt: string
  student?: {
    id: number
    name: string
    nis: string
  }
}

interface Student {
  id: number
  nis: string
  name: string
  kelas: string
}

const EXPENSE_CATEGORIES = [
  'ATK',
  'Listrik',
  'Air',
  'Internet',
  'Kebersihan',
  'Keamanan',
  'Pemeliharaan',
  'Acara',
  'Lainnya'
]

export default function PengeluaranPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    studentId: 'none'
  })
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'delete' | 'update'
    transactionId?: number
    transactionData?: Transaction
  }>({
    open: false,
    type: 'delete'
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transactionsRes, studentsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/students')
      ])

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData.filter((t: Transaction) => t.kind === 'expense'))
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'expense',
          category: formData.category,
          description: formData.description || null,
          amount: parseInt(formData.amount),
          studentId: formData.studentId === 'none' ? null : parseInt(formData.studentId)
        }),
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Pengeluaran berhasil dicatat",
          variant: "success"
        })
        setDialogOpen(false)
        setFormData({ category: '', description: '', amount: '', studentId: 'none' })
        fetchData()
      } else {
        throw new Error('Failed to create transaction')
      }
    } catch (error) {
      console.error('Failed to create transaction:', error)
      toast({
        title: "Error",
        description: "Gagal mencatat pengeluaran",
        variant: "destructive"
      })
    }
  }

  const handleDeleteClick = (transaction: Transaction) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      transactionId: transaction.id,
      transactionData: transaction
    })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.transactionId) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/transactions/${confirmDialog.transactionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Transaksi berhasil dihapus",
          variant: "success"
        })
        setConfirmDialog({ open: false, type: 'delete' })
        fetchData()
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
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
    return new Date(dateString).toLocaleString('id-ID')
  }

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pengeluaran</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pengeluaran</h1>
          <p className="text-muted-foreground">Catat dan kelola pengeluaran kas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setFormData({ category: '', description: '', amount: '', studentId: 'none' })
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Catat Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail pengeluaran yang akan dicatat
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Contoh: 50000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi pengeluaran (opsional)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Terikat ke Siswa (Opsional)</Label>
                <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih siswa (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak terikat siswa</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} ({student.nis})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan Pengeluaran
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Seluruh pengeluaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.length > 0 ? totalExpense / transactions.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Rata-rata per transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengeluaran</CardTitle>
          <CardDescription>
            Daftar semua transaksi pengeluaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Belum ada data pengeluaran</p>
              <Button onClick={() => setDialogOpen(true)}>
                Catat Pengeluaran Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.description || '-'}
                      </TableCell>
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
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={
          confirmDialog.type === 'delete' 
            ? 'Hapus Transaksi' 
            : 'Update Transaksi'
        }
        description={
          confirmDialog.type === 'delete' && confirmDialog.transactionData
            ? `Apakah Anda yakin ingin menghapus transaksi "${confirmDialog.transactionData.category}" sebesar ${formatCurrency(confirmDialog.transactionData.amount)}? Tindakan ini tidak dapat dibatalkan.`
            : 'Apakah Anda yakin ingin melanjutkan tindakan ini?'
        }
        confirmText={confirmDialog.type === 'delete' ? 'Hapus' : 'Update'}
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        variant={confirmDialog.type}
        loading={actionLoading}
      />
    </div>
  )
}