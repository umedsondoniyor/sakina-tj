import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const DIST_SSR_DIR = path.resolve(ROOT_DIR, 'dist-ssr');
const SITE_URL = (process.env.SITE_URL || 'https://sakina.tj').replace(/\/$/, '');

async function loadEnvFile() {
  const envPaths = ['.env', '.env.local'];
  for (const relativePath of envPaths) {
    try {
      const fullPath = path.resolve(ROOT_DIR, relativePath);
      const contents = await readFile(fullPath, 'utf8');
      contents.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) return;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^"|"$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      });
    } catch {
      // Optional env files.
    }
  }
}

async function fetchSupabaseRows(table, select) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for prerender');
  }

  const endpoint = `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${table} (${response.status})`);
  }

  return response.json();
}

function buildSitemapXml(routes) {
  const uniqueRoutes = Array.from(new Set(routes));
  const urls = uniqueRoutes
    .map((route) => {
      const loc = route === '/' ? SITE_URL : `${SITE_URL}${route}`;
      return `<url><loc>${loc}</loc></url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function injectRenderedHtml(template, appHtml, helmetContext) {
  const helmet = helmetContext?.helmet ?? {};
  const helmetTags = [
    helmet.title?.toString?.() ?? '',
    helmet.priority?.toString?.() ?? '',
    helmet.meta?.toString?.() ?? '',
    helmet.link?.toString?.() ?? '',
    helmet.script?.toString?.() ?? '',
  ].join('');

  const cleanedTemplate = template
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, '')
    .replace(/<meta[^>]*name="description"[^>]*>/i, '')
    .replace(/<meta[^>]*name="keywords"[^>]*>/i, '')
    .replace(/<meta[^>]*property="og:title"[^>]*>/i, '')
    .replace(/<meta[^>]*property="og:description"[^>]*>/i, '')
    .replace(/<meta[^>]*property="og:url"[^>]*>/i, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/i, '');

  return cleanedTemplate
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace('</head>', `${helmetTags}</head>`);
}

function routeToOutputPath(route) {
  if (route === '/') {
    return path.join(DIST_DIR, 'index.html');
  }
  const safeRoute = route.replace(/^\/+/, '');
  return path.join(DIST_DIR, safeRoute, 'index.html');
}

async function getDynamicRoutes() {
  const [products, categories, productsForCategories] = await Promise.all([
    fetchSupabaseRows('products', 'id,slug'),
    fetchSupabaseRows('categories', 'slug'),
    fetchSupabaseRows('products', 'category'),
  ]);

  const productRoutes = (products || [])
    .map((row) => {
      const seg = (row.slug && String(row.slug).trim()) || row.id;
      return seg ? `/products/${encodeURIComponent(seg)}` : null;
    })
    .filter(Boolean);

  const categorySet = new Set();
  (categories || []).forEach((row) => {
    if (row?.slug) categorySet.add(row.slug);
  });
  (productsForCategories || []).forEach((row) => {
    if (row?.category) categorySet.add(row.category);
  });

  const categoryRoutes = Array.from(categorySet).map((slug) => `/categories/${slug}`);
  const filterLandingRoutes = [
    '/categories/mattresses/size-160x200',
    '/categories/mattresses/size-180x200',
    '/categories/mattresses/size-140x200',
    '/categories/mattresses/latex',
    '/categories/mattresses/memory-foam',
  ];

  return { productRoutes, categoryRoutes, filterLandingRoutes };
}

async function run() {
  await loadEnvFile();

  const templatePath = path.join(DIST_DIR, 'index.html');
  const serverEntryPath = path.join(DIST_SSR_DIR, 'entry-server.js');
  const template = await readFile(templatePath, 'utf8');
  const serverEntry = await import(pathToFileURL(serverEntryPath).href);

  if (!serverEntry.render) {
    throw new Error('Expected render() export from dist-ssr/entry-server.js');
  }

  const { productRoutes, categoryRoutes, filterLandingRoutes } = await getDynamicRoutes();
  const routes = [
    '/',
    '/products',
    '/delivery-payment',
    '/contacts',
    '/faq',
    '/privacy',
    '/blog',
    '/blog/kak-vybrat-matras',
    '/blog/matras-dlya-boli-v-spine',
    '/blog/zhestkost-matrasa',
    '/custom-mattresses',
    '/categories/mattresses/custom',
    ...categoryRoutes,
    ...filterLandingRoutes,
    ...productRoutes,
  ];

  for (const route of routes) {
    const rendered = await serverEntry.render(route);
    if (rendered.status >= 400) continue;

    const finalHtml = injectRenderedHtml(template, rendered.html, rendered.helmetContext);
    const outputPath = routeToOutputPath(route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, finalHtml, 'utf8');
  }

  const sitemapXml = buildSitemapXml(routes);
  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  await writeFile(path.join(DIST_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
