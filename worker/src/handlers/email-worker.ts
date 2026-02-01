import { DB } from '../utils/db';
import type { Env } from '../index';
// @ts-ignore
import PostalMime from 'postal-mime';

export class EmailWorkerHandler {
  static async handle(message: any, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      const db = new DB(env.DB);
      const toEmail = message.to;
      const fromEmail = message.from;
      
      // 验证域名
      if (!toEmail.endsWith(`@${env.DOMAIN}`)) {
        console.log(`Email rejected: domain mismatch. To: ${toEmail}, Expected domain: ${env.DOMAIN}`);
        // 可以选择拒绝或忽略
        return; 
      }

      // 解析邮件内容
      let subject = '(No Subject)';
      let htmlContent = '';
      let textContent = '';
      let parsedFromEmail = fromEmail;
      let parsedFromName = '';

      try {
        const parser = new PostalMime();
        // Cloudflare message.raw 是一个 ReadableStream，为了确保 postal-mime 能正确解析，
        // 我们先将其转换为 ArrayBuffer
        const rawEmail = await new Response(message.raw).arrayBuffer();
        const email = await parser.parse(rawEmail);
        
        subject = email.subject || '(No Subject)';
        htmlContent = email.html || '';
        textContent = email.text || '';
        
        if (email.from) {
          if (email.from.address) parsedFromEmail = email.from.address;
          if (email.from.name) parsedFromName = email.from.name;
        }

        // 如果没有 HTML 内容但有文本内容，将文本内容转换为简单的 HTML
        if (!htmlContent && textContent) {
            htmlContent = `<pre>${textContent}</pre>`;
        }
      } catch (parseError) {
        console.error('Error parsing email with postal-mime:', parseError);
        // 降级处理：仅保存基本信息
        subject = 'Error parsing email content';
        textContent = 'Could not parse email content. Please check server logs.';
      }

      // 查找或创建邮箱
      // 注意：这里的逻辑可能需要调整。通常我们只接收发给现有邮箱的邮件。
      // 但为了方便测试，如果邮箱不存在，也可以自动创建（或者是拒绝）。
      // 现在的逻辑是：如果邮箱不存在，则拒绝（或者自动创建，看需求）。
      // 之前的 HTTP 接收逻辑是自动创建。这里保持一致比较好，或者更严格一点。
      // 为了用户体验，先尝试查找，找不到就自动创建吧。
      
      let mailbox = await db.getMailboxByEmail(toEmail);
      if (!mailbox) {
        console.log(`Mailbox not found for ${toEmail}, creating new one.`);
        mailbox = await db.createMailbox(toEmail);
      }

      // 保存邮件
      await db.createEmail(
        mailbox.id,
        parsedFromEmail,
        parsedFromName || null, 
        subject,
        htmlContent,
        textContent
      );

      console.log(`Email processed successfully for ${toEmail}`);

    } catch (error) {
      console.error('Error in EmailWorkerHandler:', error);
      // Email Workers 如果抛出异常，Cloudflare 会重试，或者退信。
      // 这里我们捕获异常并记录，避免无限重试（除非是临时故障）。
    }
  }
}
