import type { NextApiRequest, NextApiResponse } from 'next';

const GO_API =
  process.env.NEXT_PUBLIC_FIXPARTS_API_URL || 'http://localhost:8080';

/**
 * Proxy route for product images served by the Go service.
 *
 * Next.js image optimization blocks upstream requests to private/loopback IPs
 * (SSRF protection added in Next.js 14.1.1). Routing through here means the
 * browser fetches /api/images/products/xxx.webp from the Next.js server, and
 * this handler fetches from localhost:8080 — which is a normal server-side
 * HTTP call, not an upstream image optimization request.
 *
 * Usage: product image_urls are rewritten in fixparts-api.ts from
 *   http://localhost:8080/images/products/xxx.webp
 * to
 *   /api/images/products/xxx.webp
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const pathSegments = req.query.path;
  if (!pathSegments) {
    return res.status(400).end('Bad request');
  }

  const relativePath = Array.isArray(pathSegments)
    ? pathSegments.join('/')
    : pathSegments;

  const upstreamUrl = `${GO_API}/images/${relativePath}`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl);
  } catch {
    return res.status(502).end('Bad gateway');
  }

  if (!upstream.ok) {
    return res.status(upstream.status).end(upstream.statusText);
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
  const cacheControl = upstream.headers.get('cache-control') ?? 'public, max-age=86400';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', cacheControl);

  const buffer = await upstream.arrayBuffer();
  res.status(200).send(Buffer.from(buffer));
}
