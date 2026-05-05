/**
 * Fixparts API client.
 *
 * The Go sync service exposes lean REST endpoints (id/name/image_url/...).
 * The existing frontend components were built against the Laravel-style
 * pickbazar shape (Type/Category/Product with slugs, paginators, etc.).
 *
 * This module bridges the gap: it fetches from the Go API and transforms
 * each response into the shape the existing hooks and components expect.
 *
 * Toggled via NEXT_PUBLIC_USE_FIXPARTS=true. When enabled, HttpClient
 * routes here instead of axios or the mock layer.
 */

const API_BASE =
    (typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_FIXPARTS_API_URL
        : process.env.NEXT_PUBLIC_FIXPARTS_API_URL) || 'http://localhost:8080';

export const FIXPARTS_ENABLED =
    process.env.NEXT_PUBLIC_USE_FIXPARTS === 'true' ||
    process.env.NEXT_PUBLIC_USE_FIXPARTS === '1';

// ─── Raw Go API shapes ─────────────────────────────────────────────

interface RawProduct {
    id: number;
    name: string;
    default_code: string | null;
    category_id: number | null;
    category_name: string | null;
    brand_id: number | null;
    brand_name: string | null;
    image_url: string | null;
    price: number | null;
    is_active: boolean;
    synced_at: string | null;
    created_at: string;
    updated_at: string;
}

interface RawBrand {
    id: number;
    name: string;
    product_count: number;
}

interface RawCategory {
    id: number;
    name: string;
    product_count: number;
}

interface RawProductsResponse {
    data: RawProduct[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

interface RawListResponse<T> {
    data: T[];
    total: number;
}

// ─── Helpers ───────────────────────────────────────────────────────

function slugify(input: string | number | null | undefined): string {
    if (input === null || input === undefined) return '';
    return String(input)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function placeholderImage() {
    return {
        id: 1,
        thumbnail: '/assets/placeholder/products/product-list.svg',
        original: '/assets/placeholder/products/product-list.svg',
    };
}

function attachment(url: string | null) {
    if (!url) return placeholderImage();
    return { id: 1, thumbnail: url, original: url };
}

// ─── Transformers: Go shape → frontend shape ───────────────────────

function transformBrand(raw: RawBrand): any {
    return {
        id: raw.id,
        name: raw.name?.trim() || `Brand ${raw.id}`,
        slug: slugify(raw.name) || String(raw.id),
        icon: 'DressIcon',
        image: placeholderImage(),
        banners: [],
        promotional_sliders: [],
        images: [],
        settings: { isHome: false, layoutType: 'modern', productCard: 'neon' },
        products_count: raw.product_count,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

function transformCategory(raw: RawCategory): any {
    return {
        id: raw.id,
        name: raw.name?.trim() || `Category ${raw.id}`,
        slug: slugify(raw.name) || String(raw.id),
        icon: 'DressIcon',
        image: placeholderImage(),
        details: null,
        parent: null,
        children: [],
        products: [],
        products_count: raw.product_count,
        type: { id: 1, name: 'fixparts', slug: 'fixparts' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

function transformProduct(raw: RawProduct): any {
    const baseSlug = slugify(raw.default_code) || String(raw.id);
    const slug = `${baseSlug}-${raw.id}`;
    const img = attachment(raw.image_url);
    const price = raw.price ?? 0;

    return {
        id: raw.id,
        name: raw.name,
        slug,
        description: '',
        sku: raw.default_code || `SKU-${raw.id}`,
        price,
        sale_price: null,
        min_price: price,
        max_price: price,
        quantity: 100,
        in_stock: true,
        is_taxable: false,
        status: 'publish',
        product_type: 'simple',
        unit: '1 pc',
        image: img,
        gallery: [img],
        categories: raw.category_id
            ? [
                  {
                      id: raw.category_id,
                      name: raw.category_name?.trim() || '',
                      slug: slugify(raw.category_name) || String(raw.category_id),
                  },
              ]
            : [],
        tags: [],
        type: raw.brand_id
            ? {
                  id: raw.brand_id,
                  name: raw.brand_name?.trim() || '',
                  slug: slugify(raw.brand_name) || String(raw.brand_id),
                  icon: 'DressIcon',
              }
            : { id: 1, name: 'fixparts', slug: 'fixparts', icon: 'DressIcon' },
        shop: {
            id: 1,
            name: 'Yomax Store',
            slug: 'yomax-store',
            is_active: 1,
            logo: placeholderImage(),
            cover_image: placeholderImage(),
        },
        ratings: 0,
        total_reviews: 0,
        variations: [],
        variation_options: [],
        author: null,
        manufacturer: null,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    };
}

// ─── Fetch + paginator helpers ─────────────────────────────────────

async function fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
        throw new Error(`Fixparts API ${res.status}: ${path}`);
    }
    return (await res.json()) as T;
}

function emptyPaginator<T>(items: T[], total: number, page: number, limit: number) {
    const lastPage = Math.max(1, Math.ceil(total / limit));
    return {
        data: items,
        current_page: page,
        last_page: lastPage,
        total,
        per_page: limit,
        from: items.length ? (page - 1) * limit + 1 : null,
        to: items.length ? (page - 1) * limit + items.length : null,
        first_page_url: '',
        last_page_url: '',
        next_page_url: page < lastPage ? `?page=${page + 1}` : null,
        prev_page_url: page > 1 ? `?page=${page - 1}` : null,
        path: '',
    };
}

// ─── Param extraction ──────────────────────────────────────────────
//
// The frontend passes filter params via the `search` query string the
// Laravel backend used: `categories.slug:lcd;type.slug:samsung;`.
// We parse that out and translate slugs back to IDs by looking up the
// brand/category lists.

function parseSearchString(search: string | undefined): Record<string, string> {
    const result: Record<string, string> = {};
    if (!search) return result;
    for (const part of search.split(';')) {
        const idx = part.indexOf(':');
        if (idx === -1) continue;
        const key = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        if (key && value) result[key] = value;
    }
    return result;
}

let brandCache: any[] | null = null;
let categoryCache: any[] | null = null;

async function getBrandBySlug(slug: string): Promise<any | null> {
    if (!brandCache) {
        const raw = await fetchJson<RawListResponse<RawBrand>>('/api/brands');
        brandCache = raw.data.map(transformBrand);
    }
    return brandCache.find((b) => b.slug === slug) ?? null;
}

async function getCategoryBySlug(slug: string): Promise<any | null> {
    if (!categoryCache) {
        const raw = await fetchJson<RawListResponse<RawCategory>>('/api/categories');
        categoryCache = raw.data.map(transformCategory);
    }
    return categoryCache.find((c) => c.slug === slug) ?? null;
}

// ─── Public dispatcher ─────────────────────────────────────────────
//
// Mirrors the signature of `getMockData(url, params)` from mock-data.ts.
// HttpClient will check FIXPARTS_ENABLED and call this; if it returns
// non-null we use that, otherwise fall through to mock/axios.

export async function getFixpartsData(
    url: string,
    params?: any,
): Promise<any | null> {
    const cleanUrl = url.replace(/^\//, '').split('?')[0];
    const segments = cleanUrl.split('/');
    const base = segments[0];

    try {
        // ── /api/types  →  brands list ────────────────────────────
        if (base === 'types') {
            if (segments.length > 1) {
                const slug = segments[1];
                const brand = await getBrandBySlug(slug);
                return brand ? [brand] : null;
            }
            const raw = await fetchJson<RawListResponse<RawBrand>>('/api/brands');
            const items = raw.data.map(transformBrand);
            const limit = Number(params?.limit ?? items.length);
            const paged = items.slice(0, limit);
            return emptyPaginator(paged, items.length, 1, limit || items.length);
        }

        // ── /api/categories ───────────────────────────────────────
        if (base === 'categories' || base === 'featured-categories') {
            if (segments.length > 1) {
                const slug = segments[1];
                const cat = await getCategoryBySlug(slug);
                return cat ? [cat] : null;
            }
            const raw = await fetchJson<RawListResponse<RawCategory>>(
                '/api/categories',
            );
            const items = raw.data.map(transformCategory);
            const limit = Number(params?.limit ?? items.length);
            const paged = items.slice(0, limit);
            return emptyPaginator(paged, items.length, 1, limit || items.length);
        }

        // ── /api/products ─────────────────────────────────────────
        if (base === 'products') {
            if (segments.length > 1) {
                // single product: by id (numeric) or slug (slug-id)
                const ident = segments[1];
                const idMatch = ident.match(/(\d+)$/);
                if (idMatch) {
                    const res = await fetchJson<{ data: RawProduct }>(
                        `/api/products/${idMatch[1]}`,
                    );
                    return transformProduct(res.data);
                }
                return null;
            }

            const page = Number(params?.page ?? 1);
            const limit = Math.min(Number(params?.limit ?? 20), 100);
            const qs = new URLSearchParams();
            qs.set('page', String(page));
            qs.set('limit', String(limit));

            // text search (frontend passes ?text= or via search string)
            const text = params?.text || params?.name;
            if (text) qs.set('search', String(text));

            // direct ids
            if (params?.brand_id) qs.set('brand_id', String(params.brand_id));
            if (params?.category_id) qs.set('category_id', String(params.category_id));

            // legacy slug-based search string from the Laravel layer
            const parsed = parseSearchString(params?.search);
            if (parsed['type.slug']) {
                const brand = await getBrandBySlug(parsed['type.slug']);
                if (brand) qs.set('brand_id', String(brand.id));
            }
            if (parsed['categories.slug']) {
                const cat = await getCategoryBySlug(parsed['categories.slug']);
                if (cat) qs.set('category_id', String(cat.id));
            }

            const res = await fetchJson<RawProductsResponse>(
                `/api/products?${qs.toString()}`,
            );
            const items = res.data.map(transformProduct);
            return emptyPaginator(items, res.pagination.total, page, limit);
        }

        // ── /api/popular-products  →  reuse products list ────────
        if (base === 'popular-products') {
            const res = await fetchJson<RawProductsResponse>(
                '/api/products?page=1&limit=10',
            );
            return res.data.map(transformProduct);
        }

        // ── settings, tags, shops, etc. fall through to mock ─────
        return null;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[fixparts-api] fetch failed:', err);
        return null;
    }
}
