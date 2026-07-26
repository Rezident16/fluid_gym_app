import prisma from './prisma'

export const createSession = async (data: any) => {
  return prisma.session.create({ data })
}

export const getSessionById = async (id: string) => {
  return prisma.session.findUnique({ where: { id }, include: { setLogs: true } })
}

export const addSetLog = async (sessionId: string, setLogData: any) => {
  return prisma.setLog.create({ data: { sessionId, ...setLogData } })
}

export const completeSession = async (id: string) => {
  return prisma.session.update({ where: { id }, data: { status: 'completed' } })
}
