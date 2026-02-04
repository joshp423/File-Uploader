import { prisma } from './lib/prisma'

// By ID
const user = await prisma.user.findUnique({
  where: {
    id: 99,
  },
})