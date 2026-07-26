/**
 * Two-stage exercise catalog generator (README §4a).
 *
 * Stage 1 — AI proposes exercise names/metadata (structured JSON, forced tool call).
 * Stage 2 — YouTube Data API resolves each proposal to a real, verified video.
 *
 * Usage:
 *   npm run generate:catalog -- <bodyPart> [count]
 *   npm run generate:catalog -- chest 10
 */
import Anthropic from '@anthropic-ai/sdk'
import prisma from '../src/db/prisma'
import type { BodyPart, Equipment } from '../src/models/types'

const BODY_PARTS: BodyPart[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body']
const EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable']

interface ProposedExercise {
  name: string
  bodyPart: BodyPart
  secondaryBodyParts: BodyPart[]
  equipment: Equipment
  alternativeNames: string[]
}

interface YoutubeMatch {
  videoId: string
  title: string
  channel: string
}

async function proposeExercises(anthropic: Anthropic, bodyPart: BodyPart, count: number): Promise<ProposedExercise[]> {
  const response = await anthropic.messages.create({
    model: process.env.CATALOG_MODEL ?? 'claude-sonnet-5',
    max_tokens: 2048,
    tools: [
      {
        name: 'propose_exercises',
        description: 'Propose a batch of real, well-known gym exercises for a given body part.',
        input_schema: {
          type: 'object',
          properties: {
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Common exercise name, e.g. "Barbell Bench Press"' },
                  bodyPart: { type: 'string', enum: BODY_PARTS },
                  secondaryBodyParts: { type: 'array', items: { type: 'string', enum: BODY_PARTS } },
                  equipment: { type: 'string', enum: EQUIPMENT },
                  alternativeNames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '1-2 real exercises that work the same primary body part and could substitute for this one',
                  },
                },
                required: ['name', 'bodyPart', 'secondaryBodyParts', 'equipment', 'alternativeNames'],
              },
            },
          },
          required: ['exercises'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'propose_exercises' },
    messages: [
      {
        role: 'user',
        content: `Propose ${count} real, well-known, distinct gym exercises whose primary body part is "${bodyPart}". Only name exercises that actually exist and are commonly taught — do not invent variations.`,
      },
    ],
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Model did not return a tool_use block for propose_exercises')
  }
  const { exercises } = toolUse.input as { exercises: ProposedExercise[] }
  return exercises
}

async function resolveYoutubeVideo(youtubeApiKey: string, exerciseName: string): Promise<YoutubeMatch | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', `${exerciseName} proper form tutorial`)
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('key', youtubeApiKey)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`YouTube search.list failed (${res.status}): ${await res.text()}`)
  }
  const data = (await res.json()) as { items?: Array<{ id: { videoId: string }; snippet: { title: string; channelTitle: string } }> }
  const top = data.items?.[0]
  if (!top) return null

  return { videoId: top.id.videoId, title: top.snippet.title, channel: top.snippet.channelTitle }
}

async function findOrCreateExercise(
  youtubeApiKey: string,
  proposed: ProposedExercise,
): Promise<{ id: string; needsReview: boolean; qcLine: string }> {
  const existing = await prisma.exercise.findFirst({ where: { name: proposed.name } })
  if (existing) {
    return { id: existing.id, needsReview: false, qcLine: `${proposed.name} → already in catalog, skipped` }
  }

  const match = await resolveYoutubeVideo(youtubeApiKey, proposed.name)
  const needsReview = match === null

  const created = await prisma.exercise.create({
    data: {
      name: proposed.name,
      bodyPart: proposed.bodyPart,
      secondaryBodyParts: proposed.secondaryBodyParts,
      equipment: proposed.equipment,
      youtubeVideoId: match?.videoId ?? null,
      youtubeTitle: match?.title ?? null,
      youtubeChannel: match?.channel ?? null,
      source: 'AI_generated',
      alternatives: [],
      needsReview,
    },
  })

  const qcLine = needsReview
    ? `${proposed.name} → NEEDS REVIEW (no usable YouTube match)`
    : `${proposed.name} → "${match!.title}" (${match!.channel})`

  return { id: created.id, needsReview, qcLine }
}

async function main() {
  const bodyPartArg = process.argv[2] as BodyPart | undefined
  const count = Number(process.argv[3] ?? 10)

  if (!bodyPartArg || !BODY_PARTS.includes(bodyPartArg)) {
    console.error(`Usage: generate:catalog <bodyPart> [count]\nbodyPart must be one of: ${BODY_PARTS.join(', ')}`)
    process.exit(1)
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const youtubeKey = process.env.YOUTUBE_API_KEY
  if (!anthropicKey || anthropicKey.startsWith('your-')) {
    console.error('ANTHROPIC_API_KEY is missing or still a placeholder in .env — add a real key before running this.')
    process.exit(1)
  }
  if (!youtubeKey || youtubeKey.startsWith('your-')) {
    console.error('YOUTUBE_API_KEY is missing or still a placeholder in .env — add a real key before running this.')
    process.exit(1)
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey })

  console.log(`Stage 1: asking AI for ${count} "${bodyPartArg}" exercises...`)
  const proposed = await proposeExercises(anthropic, bodyPartArg, count)

  console.log(`Stage 2: resolving each against the YouTube Data API...`)
  const qcLines: string[] = []
  let needsReviewCount = 0

  for (const exercise of proposed) {
    const primary = await findOrCreateExercise(youtubeKey, exercise)
    qcLines.push(primary.qcLine)
    if (primary.needsReview) needsReviewCount++

    const alternativeIds: string[] = []
    for (const altName of exercise.alternativeNames) {
      const alt = await findOrCreateExercise(youtubeKey, {
        name: altName,
        bodyPart: exercise.bodyPart,
        secondaryBodyParts: exercise.secondaryBodyParts,
        equipment: exercise.equipment,
        alternativeNames: [],
      })
      qcLines.push(`  alt: ${alt.qcLine}`)
      if (alt.needsReview) needsReviewCount++
      alternativeIds.push(alt.id)
    }

    if (alternativeIds.length > 0) {
      await prisma.exercise.update({ where: { id: primary.id }, data: { alternatives: alternativeIds } })
    }
  }

  console.log('\n--- QC diff ---')
  console.log(qcLines.join('\n'))
  console.log(`\nDone. ${proposed.length} primary exercises processed, ${needsReviewCount} flagged needsReview.`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
