export type RouteHandler = (
  request: Request,
  env: any,
  ctx: ExecutionContext,
  params?: Record<string, string>
) => Promise<Response>;

export class Router {
  private routes: Array<{
    method: string;
    pattern: RegExp;
    handler: RouteHandler;
    paramNames: string[];
  }> = [];

  add(method: string, path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    const pattern = path
      .replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      handler,
      paramNames,
    });
  }

  get(path: string, handler: RouteHandler) {
    this.add('GET', path, handler);
  }

  post(path: string, handler: RouteHandler) {
    this.add('POST', path, handler);
  }

  delete(path: string, handler: RouteHandler) {
    this.add('DELETE', path, handler);
  }

  async handle(
    request: Request,
    env: any,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return route.handler(request, env, ctx, params);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}
