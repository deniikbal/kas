import { pgTable, serial, varchar, integer, timestamp, text, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Students table
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  nis: varchar('nis', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  kelas: varchar('kelas', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
})

// Kas Periods table
export const kasPeriods = pgTable('kas_periods', {
  id: serial('id').primaryKey(),
  weekNo: integer('weekNo').notNull(),
  startsAt: timestamp('startsAt', { mode: 'date' }).notNull(),
  endsAt: timestamp('endsAt', { mode: 'date' }).notNull(),
  nominal: integer('nominal').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
})

// Kas Payments table
export const kasPayments = pgTable('kas_payments', {
  id: serial('id').primaryKey(),
  studentId: integer('studentId').notNull().references(() => students.id, { onDelete: 'cascade' }),
  kasPeriodId: integer('kasPeriodId').notNull().references(() => kasPeriods.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  paidAt: timestamp('paidAt', { mode: 'date' }).defaultNow().notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueStudentPeriod: unique().on(table.studentId, table.kasPeriodId),
}))

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  kind: varchar('kind', { length: 50 }).notNull(), // 'income' | 'expense'
  category: varchar('category', { length: 255 }).notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  studentId: integer('studentId').references(() => students.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
})

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  avatar: varchar('avatar', { length: 255 }),
  lastLogin: timestamp('lastLogin', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
})

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  kasPayments: many(kasPayments),
  transactions: many(transactions),
}))

export const kasPeriodsRelations = relations(kasPeriods, ({ many }) => ({
  kasPayments: many(kasPayments),
}))

export const kasPaymentsRelations = relations(kasPayments, ({ one }) => ({
  student: one(students, {
    fields: [kasPayments.studentId],
    references: [students.id],
  }),
  kasPeriod: one(kasPeriods, {
    fields: [kasPayments.kasPeriodId],
    references: [kasPeriods.id],
  }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  student: one(students, {
    fields: [transactions.studentId],
    references: [students.id],
  }),
}))

// Type exports
export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert
export type KasPeriod = typeof kasPeriods.$inferSelect
export type NewKasPeriod = typeof kasPeriods.$inferInsert
export type KasPayment = typeof kasPayments.$inferSelect
export type NewKasPayment = typeof kasPayments.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
