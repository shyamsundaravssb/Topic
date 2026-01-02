import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  // 1. Create the confirmation link
  // Note: Change 'http://localhost:3000' to your domain in production
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

  // 2. Send the email
  await resend.emails.send({
    from: "onboarding@resend.dev", // Only works for testing. For prod, verify your domain.
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`,
  });
};

// ... existing imports

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};
