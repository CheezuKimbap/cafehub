import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { transporter } from "../ email"

export async function sendVerificationEmail(user: {
  id: string
  email: string
  name?: string | null
}) {
    await transporter.verify()
  // Clean up old tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  })

  // Create token
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires,
    },
  })

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(
    user.email
  )}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your email address ☕",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Hi ${user.name ?? "there"} 👋</h2>
        <p>Please verify your email to activate your account.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">
           Verify Email
        </a>
        <p style="margin-top:24px;font-size:12px;color:#666">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  })
}
