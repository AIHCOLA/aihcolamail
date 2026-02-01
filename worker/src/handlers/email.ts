import { DB } from '../utils/db';
import type { Env } from '../index';

export class EmailHandler {
  static async list(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    params?: Record<string, string>
  ): Promise<Response> {
    const mailboxId = params?.id;
    if (!mailboxId) {
      return Response.json({ error: 'Missing mailbox ID' }, { status: 400 });
    }

    const db = new DB(env.DB);
    const emails = await db.listEmails(mailboxId);

    return Response.json({ emails });
  }

  static async get(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    params?: Record<string, string>
  ): Promise<Response> {
    const id = params?.id;
    if (!id) {
      return Response.json({ error: 'Missing email ID' }, { status: 400 });
    }

    const db = new DB(env.DB);
    const email = await db.getEmail(id);

    if (!email) {
      return Response.json({ error: 'Email not found' }, { status: 404 });
    }

    return Response.json({ email });
  }

  static async send(request: Request, env: Env): Promise<Response> {
    try {
      const body = await request.json();
      const { to, subject, html, text, from } = body;

      if (!to || !subject) {
        return Response.json(
          { error: 'Missing required fields: to, subject' },
          { status: 400 }
        );
      }

      if (!env.RESEND_API_KEY) {
        return Response.json(
          { error: '邮件发送功能未配置。请在 Cloudflare Dashboard 中设置 RESEND_API_KEY 环境变量，或使用其他邮件发送服务。' },
          { status: 503 }
        );
      }

      const fromEmail = from || `noreply@${env.DOMAIN}`;

      // 使用 Resend API 发送邮件
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html: html || text,
          text: text || html?.replace(/<[^>]*>/g, ''),
        }),
      });

      const result = await resendResponse.json();

      if (!resendResponse.ok) {
        return Response.json(
          { error: 'Failed to send email', details: result },
          { status: resendResponse.status }
        );
      }

      return Response.json({ success: true, id: result.id });
    } catch (error) {
      console.error('Send email error:', error);
      return Response.json(
        { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
