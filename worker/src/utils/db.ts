import type { D1Database } from '@cloudflare/workers-types';

export interface Mailbox {
  id: string;
  email: string;
  created_at: number;
  expires_at?: number;
  is_active: number;
}

export interface Email {
  id: string;
  mailbox_id: string;
  from_email: string;
  from_name?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  received_at: number;
  is_read: number;
}

export class DB {
  constructor(private db: D1Database) {}

  async createMailbox(email: string): Promise<Mailbox> {
    const id = crypto.randomUUID();
    const created_at = Math.floor(Date.now() / 1000);

    await this.db
      .prepare('INSERT INTO mailboxes (id, email, created_at, is_active) VALUES (?, ?, ?, ?)')
      .bind(id, email, created_at, 1)
      .run();

    return { id, email, created_at, is_active: 1 };
  }

  async getMailbox(id: string): Promise<Mailbox | null> {
    const result = await this.db
      .prepare('SELECT * FROM mailboxes WHERE id = ?')
      .bind(id)
      .first<Mailbox>();

    return result || null;
  }

  async getMailboxByEmail(email: string): Promise<Mailbox | null> {
    const result = await this.db
      .prepare('SELECT * FROM mailboxes WHERE email = ?')
      .bind(email)
      .first<Mailbox>();

    return result || null;
  }

  async listMailboxes(): Promise<Mailbox[]> {
    const result = await this.db
      .prepare('SELECT * FROM mailboxes WHERE is_active = 1 ORDER BY created_at DESC')
      .all<Mailbox>();

    return result.results || [];
  }

  async deleteMailbox(id: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM mailboxes WHERE id = ?')
      .bind(id)
      .run();
  }

  async createEmail(
    mailboxId: string,
    fromEmail: string,
    fromName: string | null,
    subject: string | null,
    htmlContent: string | null,
    textContent: string | null
  ): Promise<Email> {
    const id = crypto.randomUUID();
    const received_at = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        'INSERT INTO emails (id, mailbox_id, from_email, from_name, subject, html_content, text_content, received_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, mailboxId, fromEmail, fromName, subject, htmlContent, textContent, received_at, 0)
      .run();

    return {
      id,
      mailbox_id: mailboxId,
      from_email: fromEmail,
      from_name: fromName || undefined,
      subject: subject || undefined,
      html_content: htmlContent || undefined,
      text_content: textContent || undefined,
      received_at,
      is_read: 0,
    };
  }

  async getEmail(id: string): Promise<Email | null> {
    const result = await this.db
      .prepare('SELECT * FROM emails WHERE id = ?')
      .bind(id)
      .first<Email>();

    if (result) {
      // 标记为已读
      await this.db
        .prepare('UPDATE emails SET is_read = 1 WHERE id = ?')
        .bind(id)
        .run();
      result.is_read = 1;
    }

    return result || null;
  }

  async listEmails(mailboxId: string): Promise<Email[]> {
    const result = await this.db
      .prepare('SELECT * FROM emails WHERE mailbox_id = ? ORDER BY received_at DESC')
      .bind(mailboxId)
      .all<Email>();

    return result.results || [];
  }
}
