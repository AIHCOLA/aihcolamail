import { DB } from '../utils/db';
import type { Env } from '../index';

// Cloudflare Email Routing 会发送 JSON 格式的 webhook
interface EmailRoutingWebhook {
  From: string;
  To: string;
  Subject?: string;
  'Reply-To'?: string;
  Date: string;
  'Message-ID'?: string;
  'Text-Only'?: string;
  'Text'?: string;
  'HTML'?: string;
  'HTML-Only'?: string;
}

export class EmailReceiveHandler {
  static async receive(request: Request, env: Env): Promise<Response> {
    try {
      const body: EmailRoutingWebhook = await request.json();

      // 解析收件人邮箱
      const toEmail = body.To || '';
      const domain = env.DOMAIN;

      // 验证邮箱格式
      if (!toEmail.includes(`@${domain}`)) {
        return Response.json({ error: 'Invalid email domain' }, { status: 400 });
      }

      // 查找对应的邮箱
      const db = new DB(env.DB);
      const mailbox = await db.getMailboxByEmail(toEmail);

      if (!mailbox) {
        // 如果邮箱不存在，自动创建
        const newMailbox = await db.createMailbox(toEmail);
        
        // 保存邮件
        await db.createEmail(
          newMailbox.id,
          body.From,
          null,
          body.Subject,
          body.HTML || body['HTML-Only'],
          body.Text || body['Text-Only']
        );

        return Response.json({ success: true, message: 'Email received and mailbox created' });
      }

      // 保存邮件
      await db.createEmail(
        mailbox.id,
        body.From,
        null,
        body.Subject,
        body.HTML || body['HTML-Only'],
        body.Text || body['Text-Only']
      );

      return Response.json({ success: true, message: 'Email received' });
    } catch (error) {
      console.error('Receive email error:', error);
      return Response.json(
        { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
