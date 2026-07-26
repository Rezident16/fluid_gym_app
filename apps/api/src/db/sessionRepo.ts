import prisma from './prisma'
import type { Prisma } from '@prisma/client'

export const createSession = async (data: Prisma.SessionCreateInput) => {
  return prisma.session.create({ data })
}

export const getSessionById = async (id: string) => {
  return prisma.session.findUnique({ where: { id }, include: { setLogs: true } })
}

export const addSetLog = async (sessionId: string, setLogData: Omit<Prisma.SetLogUncheckedCreateInput, 'sessionId'>) => {
  return prisma.setLog.create({ data: { sessionId, ...setLogData } })
}

export const completeSession = async (id: string) => {
  return prisma.session.update({ where: { id }, data: { status: 'completed' } })
}
