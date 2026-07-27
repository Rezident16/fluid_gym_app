import prisma from './prisma'
import type { Prisma } from '@prisma/client'

export const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data })
}

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } })
}

export const findUserByGoogleId = async (googleId: string) => {
  return prisma.user.findUnique({ where: { googleId } })
}

export const linkGoogleId = async (id: string, googleId: string) => {
  return prisma.user.update({ where: { id }, data: { googleId } })
}
