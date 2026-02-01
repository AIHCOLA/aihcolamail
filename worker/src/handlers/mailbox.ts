import { DB } from '../utils/db';
import { generateEmailAddress } from '../utils/email-generator';
import type { Env } from '../index';

export class MailboxHandler {
  static async list(request: Request, env: Env): Promise<Response> {
    const db = new DB(env.DB);
    const mailboxes = await db.listMailboxes();

    return Response.json({ mailboxes });
  }

  static async create(request: Request, env: Env): Promise<Response> {
    const db = new DB(env.DB);
    const email = generateEmailAddress(env.DOMAIN);
    
    // 检查邮箱是否已存在（极小概率，但需要处理）
    let existing = await db.getMailboxByEmail(email);
    let attempts = 0;
    while (existing && attempts < 5) {
      const newEmail = generateEmailAddress(env.DOMAIN);
      existing = await db.getMailboxByEmail(newEmail);
      attempts++;
    }

    if (existing) {
      return Response.json({ error: '生成邮箱失败，请重试' }, { status: 500 });
    }

    const mailbox = await db.createMailbox(email);

    return Response.json({ mailbox });
  }

  static async get(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    params?: Record<string, string>
  ): Promise<Response> {
    const id = params?.id;
    if (!id) {
      return Response.json({ error: 'Missing mailbox ID' }, { status: 400 });
    }

    const db = new DB(env.DB);
    const mailbox = await db.getMailbox(id);

    if (!mailbox) {
      return Response.json({ error: 'Mailbox not found' }, { status: 404 });
    }

    return Response.json({ mailbox });
  }

  static async delete(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    params?: Record<string, string>
  ): Promise<Response> {
    const id = params?.id;
    if (!id) {
      return Response.json({ error: 'Missing mailbox ID' }, { status: 400 });
    }

    const db = new DB(env.DB);
    await db.deleteMailbox(id);

    return Response.json({ success: true });
  }
}
