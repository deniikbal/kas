'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { UserPlus, Edit, Trash2 } from 'lucide-react'

interface Student {
  id: number
  nis: string
  name: string
  kelas: string
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    nis: '',
    name: '',
    kelas: ''
  })
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'delete' | 'update'
    studentId?: number
    studentData?: Student
  }>({
    open: false,
    type: 'delete'
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students'
      const method = editingStudent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: editingStudent ? "Data siswa berhasil diperbarui" : "Siswa berhasil ditambahkan",
          variant: "success"
        })
        setDialogOpen(false)
        setEditingStudent(null)
        setFormData({ nis: '', name: '', kelas: '' })
        fetchStudents()
      } else {
        throw new Error('Failed to save student')
      }
    } catch (error) {
      console.error('Failed to save student:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data siswa",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      nis: student.nis,
      name: student.name,
      kelas: student.kelas
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (student: Student) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      studentId: student.id,
      studentData: student
    })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.studentId) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/students/${confirmDialog.studentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Siswa berhasil dihapus",
          variant: "success"
        })
        setConfirmDialog({ open: false, type: 'delete' })
        fetchStudents()
      } else {
        throw new Error('Failed to delete student')
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus siswa",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const resetForm = () => {
    setEditingStudent(null)
    setFormData({ nis: '', name: '', kelas: '' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manajemen Siswa</h1>
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
          <h1 className="text-3xl font-bold">Manajemen Siswa</h1>
          <p className="text-muted-foreground">Kelola data siswa dan informasi kelas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Perbarui data siswa yang ada' : 'Masukkan data siswa baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nis">NIS</Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="Nomor Induk Siswa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap siswa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Input
                  id="kelas"
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  placeholder="Contoh: X-A, XI-B, XII-C"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Total {students.length} siswa terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Belum ada data siswa</p>
              <Button onClick={() => setDialogOpen(true)}>
                Tambah Siswa Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nis}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.kelas}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(student.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(student)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
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
            ? 'Hapus Siswa' 
            : 'Update Siswa'
        }
        description={
          confirmDialog.type === 'delete' && confirmDialog.studentData
            ? `Apakah Anda yakin ingin menghapus siswa "${confirmDialog.studentData.name}" (${confirmDialog.studentData.nis})? Tindakan ini tidak dapat dibatalkan.`
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