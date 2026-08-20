import { prisma } from "../utils/prisma";

export const findOrCreateSession = async (clientToken: string, persona: string) => {
  console.log("mencari atau membuat sesion untuk token:", clientToken)
  const session = await prisma.anonymousSession.upsert({
    where: { clientToken },
    update: { persona },
    create: { clientToken, persona },
  });
  // console.log("Sesi berhasil:", {
  //   sessionId: session.id,
  //   clientToken: session.clientToken,
  //   persona: session.persona
  // });
  return session;
};