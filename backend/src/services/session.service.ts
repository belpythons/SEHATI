import { prisma } from "../utils/prisma";
import { normalizePersona } from "../utils/normalizePersona";

export const findOrCreateSession = async (clientToken: string, persona: string) => {
  const canonicalPersona = normalizePersona(persona);
  const session = await prisma.anonymousSession.upsert({
    where: { clientToken },
    update: { persona: canonicalPersona },
    create: { clientToken, persona: canonicalPersona },
  });
  // console.log("Sesi berhasil:", {
  //   sessionId: session.id,
  //   clientToken: session.clientToken,
  //   persona: session.persona
  // });
  return session;
};