import prisma from './prisma'
import type { Prisma } from '@prisma/client'

export const listExercisesByBodyPart = async (bodyPart: string) => {
  return prisma.exercise.findMany({ where: { bodyPart } })
}

export const findExerciseById = async (id: string) => {
  return prisma.exercise.findUnique({ where: { id } })
}

export const createExercise = async (data: Prisma.ExerciseCreateInput) => {
  return prisma.exercise.create({ data })
}
