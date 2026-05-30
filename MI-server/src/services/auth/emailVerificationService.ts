// src/services/auth/emailVerificationService.ts
import { randomUUID } from 'node:crypto'
import { prisma } from '../../database/prisma'
import {
  createEmailVerificationToken,
  findEmailVerificationToken,
  deleteEmailVerificationToken,
  deleteAllEmailVerificationTokensForUser,
} from '../../repositories/auth/emailVerificationRepository'
import { sendMail } from '../../lib/mailer'
import { ERRORS, buildError } from '../../lib/errors/errors'
import { GeneralErrorResponse } from '../../errors/GeneralErrorResponse'
import { StatusCode } from '../../utils/statusCode'
import { env } from '../../env'

// ── Service ───────────────────────────────────────────────────────────────────

export async function sendVerificationEmailService(
  userId: string,
  userEmail: string,
  userName: string,
): Promise<void> {
  // Invalida tokens anteriores para o mesmo usuário antes de gerar um novo
  await deleteAllEmailVerificationTokensForUser(userId)

  const token     = randomUUID()
  const expiresAt = new Date(Date.now() + env.EMAIL_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000)

  await createEmailVerificationToken({ token, userId, expiresAt })

  const verificationUrl = `${env.APP_URL}/verify-email?token=${token}`

  await sendMail({
    to:      userEmail,
    subject: 'Confirme seu e-mail institucional — MI UFPB',
    html:    buildVerificationEmailHtml(userName, verificationUrl, env.EMAIL_VERIFICATION_EXPIRES_HOURS),
  })
}

export async function verifyEmailService(token: string): Promise<void> {
  const record = await findEmailVerificationToken(token)

  if (!record) {
    throw new GeneralErrorResponse(StatusCode.BAD_REQUEST, buildError(ERRORS.AUTH.INVALID_VERIFICATION_TOKEN))
  }

  if (record.expiresAt < new Date()) {
    await deleteEmailVerificationToken(token)
    throw new GeneralErrorResponse(StatusCode.BAD_REQUEST, buildError(ERRORS.AUTH.INVALID_VERIFICATION_TOKEN))
  }

  await prisma.user.update({
    where: { id: record.userId },
    data:  { emailVerified: true },
  })

  await deleteEmailVerificationToken(token)
}

// ── Template de e-mail ────────────────────────────────────────────────────────

function buildVerificationEmailHtml(
  name: string,
  url: string,
  expiresHours: number,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">

        <!-- Header -->
        <tr>
          <td style="background:#4338ca;padding:28px 40px">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:bold">MI</p>
            <p style="margin:4px 0 0;color:#a5b4fc;font-size:12px">Materiais Instrucionais · UFPB</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:bold">Olá, ${name}!</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
              Para ativar sua conta institucional na plataforma de Materiais Instrucionais do Campus IV, clique no botão abaixo para confirmar seu e-mail.
            </p>

            <a href="${url}"
               style="display:inline-block;background:#4338ca;color:#fff;text-decoration:none;
                      font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px">
              Confirmar e-mail
            </a>

            <p style="margin:24px 0 0;color:#9ca3af;font-size:12px">
              Este link expira em ${expiresHours} horas. Se você não criou esta conta, ignore este e-mail.
            </p>

            <hr style="margin:28px 0;border:none;border-top:1px solid #f3f4f6"/>
            <p style="margin:0;color:#d1d5db;font-size:11px">
              Caso o botão não funcione, copie e cole o link abaixo no navegador:<br/>
              <span style="color:#6366f1">${url}</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #f3f4f6">
            <p style="margin:0;color:#d1d5db;font-size:11px">Campus IV · UFPB — Rio Tinto / Mamanguape</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
