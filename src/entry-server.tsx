import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import AppProviders from './AppProviders';
import { appRoutes } from './router/routes';

export async function render(url: string) {
  const normalizedUrl = url.length > 1 ? url.replace(/\/+$/, '') : url;
  if (url !== normalizedUrl) {
    return { status: 301, redirectTo: normalizedUrl, html: '', helmetContext: {} };
  }

  const helmetContext: Record<string, unknown> = {};
  const handler = createStaticHandler(appRoutes);
  const request = new Request(`https://sakina.tj${normalizedUrl}`);
  const context = await handler.query(request);

  if (context instanceof Response) {
    return { status: context.status, html: '', helmetContext };
  }

  const router = createStaticRouter(handler.dataRoutes, context as any);
  const appHtml = renderToString(
    <AppProviders helmetContext={helmetContext}>
      <StaticRouterProvider router={router} context={context as any} />
    </AppProviders>,
  );

  const routeMatches = (context as any)?.matches ?? [];
  const hasWildcardMatch = routeMatches.some((match: any) => match?.route?.path === '*');
  const statusCode = hasWildcardMatch ? 404 : ((context as any)?.statusCode ?? 200);

  return { status: statusCode, html: appHtml, helmetContext };
}
