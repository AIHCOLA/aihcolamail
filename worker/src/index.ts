import { Router } from './router';
import { MailboxHandler } from './handlers/mailbox';
import { EmailHandler } from './handlers/email';
import { EmailReceiveHandler } from './handlers/email-receive';

export interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string; // 可选，仅当需要发送邮件功能时
  DOMAIN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const router = new Router();

    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 路由注册
    //router.get('/api/mailboxes', MailboxHandler.list);
    //router.post('/api/mailboxes', MailboxHandler.create);
    //router.get('/api/mailboxes/:id', MailboxHandler.get);
    //router.delete('/api/mailboxes/:id', MailboxHandler.delete);
    //router.get('/api/mailboxes/:id/emails', EmailHandler.list);
    //router.get('/api/emails/:id', EmailHandler.get);
    //router.post('/api/emails/send', EmailHandler.send);
    //router.post('/api/email/receive', EmailReceiveHandler.receive);

    // 辅助函数：同时注册带/api和不带/api的路由，解决前端配置不一致导致的404问题
    const register = (method: 'GET' | 'POST' | 'DELETE', path: string, handler: any) => {
      if (method === 'GET') router.get(path, handler);
      if (method === 'POST') router.post(path, handler);
      if (method === 'DELETE') router.delete(path, handler);

      // 如果路径以 /api 开头，同时注册一个不带 /api 的版本
      if (path.startsWith('/api')) {
        const pathWithoutApi = path.replace('/api', '');
        if (method === 'GET') router.get(pathWithoutApi, handler);
        if (method === 'POST') router.post(pathWithoutApi, handler);
        if (method === 'DELETE') router.delete(pathWithoutApi, handler);
      }
    };

    register('GET', '/api/mailboxes', MailboxHandler.list);
    register('POST', '/api/mailboxes', MailboxHandler.create);
    register('GET', '/api/mailboxes/:id', MailboxHandler.get);
    register('DELETE', '/api/mailboxes/:id', MailboxHandler.delete);
    register('GET', '/api/mailboxes/:id/emails', EmailHandler.list);
    register('GET', '/api/emails/:id', EmailHandler.get);
    register('POST', '/api/emails/send', EmailHandler.send);
    register('POST', '/api/email/receive', EmailReceiveHandler.receive);


    try {
      const response = await router.handle(request, env, ctx);

      // 添加 CORS 头
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      return new Response(response.body, {
        status: response.status,
        headers: {
          ...response.headers,
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
