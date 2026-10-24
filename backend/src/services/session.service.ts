import { prisma } from "../utils/prisma";
import { normalizePersona } from "../utils/normalizePersona";
import { logger } from "../utils/logger";

export const findOrCreateSession = async (clientToken: string, persona: string) => {
  const canonicalPersona = normalizePersona(persona);
  try {
    const session = await prisma.anonymousSession.upsert({
      where: { clientToken },
      update: { persona: canonicalPersona },
      create: { clientToken, persona: canonicalPersona },
    });
    return session;
  } catch (err: any) {
    logger.warn(`Database session upsert unavailable (${err.message}) - using resilient session identifier.`);
    return {
      id: `sess-${clientToken.slice(0, 12)}`,
      clientToken,
      persona: canonicalPersona,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
};