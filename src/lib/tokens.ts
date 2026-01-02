import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";

// Helper to find existing token by email
export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email },
    });
    return verificationToken;
  } catch {
    return null;
  }
};

export const generateVerificationToken = async (email: string) => {
  // 1. Generate a random token
  const token = uuidv4();

  // 2. Set expiration (1 hour from now)
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // 3. Check if a token already exists for this email
  const existingToken = await getVerificationTokenByEmail(email);

  // 4. If it exists, delete it so we don't have duplicates
  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // 5. Create the new token in the database
  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 Hour

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
