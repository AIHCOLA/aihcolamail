
const API_BASE = (() => {
  const rawBase = (import.meta.env.VITE_API_URL || '/api').trim();
  if (rawBase.startsWith('http://') || rawBase.startsWith('https://')) {
    const url = new URL(rawBase);
    const pathname = url.pathname.replace(/\/$/, '');
    if (pathname === '' || pathname === '/') {
      url.pathname = '/api';
    }
    return url.toString().replace(/\/$/, '');
  }

  const normalized = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
  if (normalized === '/' || normalized === '') {
    return '/api';
  }
  return normalized.replace(/\/$/, '');
})();

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

export interface CreateMailboxResponse {
  mailbox: Mailbox;
}

export interface GetEmailsResponse {
  emails: Email[];
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || '请求失败');
  }

  return response.json();
}

export const api = {
  // 创建邮箱
  createMailbox: async (): Promise<CreateMailboxResponse> => {
    return request<CreateMailboxResponse>('/mailboxes', {
      method: 'POST',
    });
  },

  // 获取邮箱列表
  getMailboxes: async (): Promise<{ mailboxes: Mailbox[] }> => {
    return request<{ mailboxes: Mailbox[] }>('/mailboxes');
  },

  // 获取邮箱详情
  getMailbox: async (id: string): Promise<{ mailbox: Mailbox }> => {
    return request<{ mailbox: Mailbox }>(`/mailboxes/${id}`);
  },

  // 获取邮件列表
  getEmails: async (mailboxId: string): Promise<GetEmailsResponse> => {
    return request<GetEmailsResponse>(`/mailboxes/${mailboxId}/emails`);
  },

  // 获取邮件详情
  getEmail: async (id: string): Promise<{ email: Email }> => {
    return request<{ email: Email }>(`/emails/${id}`);
  },

  // 发送邮件
  sendEmail: async (data: SendEmailRequest): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>('/emails/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 删除邮箱
  deleteMailbox: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/mailboxes/${id}`, {
      method: 'DELETE',
    });
  },
};
