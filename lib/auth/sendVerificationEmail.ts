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
  <div style="background-color:#f5f5f5;padding:40px 0;">
    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:10px;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
      overflow:hidden;
      font-family:Arial, Helvetica, sans-serif;
    ">

      <!-- Header -->
      <div style="background:#111827;padding:24px;text-align:center;">
        <h1 style="
          color:#ffffff;
          margin:0;
          font-size:24px;
          letter-spacing:0.5px;
        ">
          Coffeesentials ☕
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;color:#333333;">
        <h2 style="margin-top:0;">Hi ${user.name ?? "there"} 👋</h2>

        <p style="font-size:15px;line-height:1.6;">
          Thanks for signing up! To activate your account, please verify your
          email address by clicking the button below.
        </p>

        <!-- Button -->
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}"
            style="
              background:#111827;
              color:#ffffff;
              padding:14px 28px;
              text-decoration:none;
              font-size:16px;
              border-radius:8px;
              display:inline-block;
            ">
            Verify Email
          </a>
        </div>

        <p style="font-size:14px;color:#555555;">
          This verification link will expire in <strong>24 hours</strong>.
        </p>

        <p style="font-size:14px;color:#555555;">
          If you didn’t create this account, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="
        background:#f3f4f6;
        padding:20px;
        text-align:center;
        font-size:12px;
        color:#6b7280;
      ">
        <p style="margin:0;">
          © ${new Date().getFullYear()} Coffeesentials. All rights reserved.
        </p>
      </div>
    </div>
  </div>
  `,
});

}
