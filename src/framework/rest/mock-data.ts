/**
 * Mock data for endpoints the Go sync service doesn't expose.
 *
 * Real data routing:
 *   - products  → fixparts-api → Go server
 *   - brands    → fixparts-api → Go server
 *   - categories→ fixparts-api → Go server
 *
 * Mocked here (no real backend for these):
 *   - settings, shops, tags, coupons, attributes, FAQs, terms,
 *     become-seller, user account
 *
 * If the products/brands/categories endpoints fall through to this
 * file (e.g. fixparts is disabled or the call type isn't handled),
 * they return an empty paginator so no fake product data renders.
 */

const placeholderImage = {
    id: 1,
    thumbnail: '/assets/placeholder/products/product-list.svg',
    original: '/assets/placeholder/products/product-list.svg',
};

// ─── Settings ──────────────────────────────────────────────
export const mockSettings = {
    id: 1,
    options: {
        siteTitle: 'Yomax',
        siteSubtitle: 'Mobile Spare Parts & Repair Tools',
        currency: 'USD',
        minimumOrderAmount: 0,
        currencyToWalletRatio: 3,
        signupPoints: 100,
        maximumQuestionLimit: 5,
        deliveryTime: [
            { title: 'Express Delivery', description: '90 min express delivery' },
            { title: 'Morning', description: '8:00 AM - 11:00 AM' },
            { title: 'Noon', description: '11:00 AM - 2:00 PM' },
            { title: 'Afternoon', description: '2:00 PM - 5:00 PM' },
            { title: 'Evening', description: '5:00 PM - 8:00 PM' },
        ],
        logo: {
            id: 1,
            thumbnail: '/assets/images/logo.svg',
            original: '/assets/images/logo.svg',
        },
        taxClass: 1,
        shippingClass: 1,
        seo: {
            ogImage: null,
            ogTitle: 'Yomax',
            metaTitle: 'Yomax',
            metaTags: '',
            canonicalUrl: '',
            ogDescription: 'Mobile Spare Parts & Repair Tools',
            twitterHandle: '',
            metaDescription: 'Mobile Spare Parts & Repair Tools',
            twitterCardType: 'summary',
        },
        google: { isEnable: false, tagManagerId: '' },
        facebook: { isEnable: false, appId: '', pageId: '' },
        useOtp: false,
        useGoogleMap: false,
        isProductReview: true,
        freeShipping: false,
        freeShippingAmount: 0,
        useCashOnDelivery: true,
        paymentGateway: [{ name: 'Cash on delivery', title: 'Cash on delivery' }],
        currencyOptions: { formation: 'en-US', fractions: 2 },
        useEnableGateway: false,
        isUnderMaintenance: false,
        maintenance: null,
        isPromoPopUp: false,
        promoPopup: null,
    },
};

// ─── Empty paginator (used for product/brand/category fallbacks) ───
export const emptyPaginator = {
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
    from: null,
    to: null,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
};

// ─── Tags ──────────────────────────────────────────────────
export const mockTags = [
    { id: 1, name: 'Flash Sale', slug: 'flash-sale', details: '', image: null, type: null },
    { id: 2, name: 'Featured Products', slug: 'featured-products', details: '', image: null, type: null },
    { id: 3, name: 'On Sale', slug: 'on-sale', details: '', image: null, type: null },
    { id: 4, name: 'New Arrival', slug: 'new-arrival', details: '', image: null, type: null },
];

// ─── Shops ─────────────────────────────────────────────────
function makeShop(id: number, name: string, address: object, contact: string, description: string) {
    return {
        id,
        name,
        slug: name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        is_active: 1,
        orders_count: 0,
        products_count: 0,
        logo: placeholderImage,
        cover_image: placeholderImage,
        address,
        settings: {
            contact,
            socials: [],
            website: 'https://www.yomax.ma',
            location: { lat: 34.020882, lng: -6.841650, formattedAddress: 'Rabat, Morocco' },
        },
        owner: { id: 1, name: 'Yomax', email: 'contact@yomax.ma' },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    };
}

export const mockShops = [
    makeShop(
        1,
        'Point de Vente Rabat GZA',
        { street_address: 'قيسارية واد الذهب الكزا رقم 74', city: 'الرباط', state: '', zip: '', country: 'MA' },
        '',
        'قيسارية واد الذهب الكزا الرباط رقم 74',
    ),
    makeShop(
        2,
        'Point de Vente Casablanca',
        { street_address: 'Centre commercial takhfid reda, Magasin 208', city: 'Rabat', state: '', zip: '', country: 'MA' },
        '',
        'Centre commercial takhfid reda, Magasin 208, Rabat.',
    ),
    makeShop(
        3,
        'Point de Vente Fès',
        { street_address: 'Rue Mohamed El Oukili, Kisariyat Ghita n°20', city: 'Fès', state: '', zip: '', country: 'MA' },
        '',
        'Centre ville, Rue Mohamed El Oukili, Kisariyat Ghita n°20, Fès.',
    ),
];

export const mockShopPaginator = {
    data: mockShops,
    current_page: 1,
    last_page: 1,
    total: mockShops.length,
    per_page: 30,
    from: 1,
    to: mockShops.length,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
};

// ─── Coupons ───────────────────────────────────────────────
export const mockCoupons: any[] = [];
export const mockCouponPaginator = { ...emptyPaginator };

// ─── Attributes ────────────────────────────────────────────
export const mockAttributes: any[] = [];

// ─── FAQs ──────────────────────────────────────────────────
export const mockFaqs = { ...emptyPaginator };

// ─── Terms and Conditions ──────────────────────────────────
export const mockTerms = { ...emptyPaginator };

// ─── Become Seller ─────────────────────────────────────────
export const mockBecomeSeller = {
    id: 1,
    page_options: {
        banner: { heading: 'Become a Seller', subHeading: '', image: placeholderImage },
        sellerInformation: [],
        commission: { title: 'Commission', description: '' },
    },
};

// ─── Mock User ─────────────────────────────────────────────
export const mockUser = {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    email_verified_at: '2024-01-01T00:00:00.000Z',
    is_active: true,
    profile: {
        id: 1,
        avatar: placeholderImage,
        bio: '',
        contact: '',
    },
    address: [],
    orders: { current_page: 1, data: [] },
    permissions: ['customer'],
    wallet: { available_points: 0, total_points: 0 },
    created_at: '2024-01-01T00:00:00.000Z',
};

// ─── Mode flag ─────────────────────────────────────────────
export const MOCK_ENABLED =
    process.env.NEXT_PUBLIC_MOCK_API === 'true' ||
    process.env.NEXT_PUBLIC_MOCK_API === '1';

// ─── Endpoint dispatcher ───────────────────────────────────
//
// Products, brands, and categories MUST come from the Go server.
// If a request for those falls through here (fixparts disabled or
// failed), return an empty paginator so no fake products show up.
//
// Everything else (shops, tags, settings, etc.) returns its mock
// data normally.

export function getMockData(url: string, _params?: unknown): any {
    const cleanUrl = url.replace(/^\//, '').split('?')[0];
    const basePath = cleanUrl.split('/')[0];

    switch (basePath) {
        case 'settings':
            return mockSettings;

        // ── Real-data endpoints: never serve fakes here ──────
        case 'products':
        case 'popular-products':
        case 'categories':
        case 'featured-categories':
        case 'types':
            return cleanUrl.includes('/') ? null : emptyPaginator;

        // ── Mocked normal-data endpoints ─────────────────────
        case 'tags':
            if (cleanUrl.includes('/')) {
                const slug = cleanUrl.split('/')[1];
                return mockTags.find(t => t.slug === slug) || mockTags[0];
            }
            return { data: mockTags, current_page: 1, last_page: 1, total: mockTags.length, per_page: 30 };

        case 'shops':
            if (cleanUrl.includes('/')) {
                const slug = cleanUrl.split('/')[1];
                return mockShops.find(s => s.slug === slug) || mockShops[0];
            }
            return mockShopPaginator;

        case 'coupons':
            return mockCouponPaginator;
        case 'attributes':
            return mockAttributes;
        case 'faqs':
            return mockFaqs;
        case 'terms-and-conditions':
            if (cleanUrl.includes('/')) return null;
            return mockTerms;
        case 'became-seller':
            return mockBecomeSeller;

        // ── Auth / user (features removed) ──────────────────
        case 'me':
            return mockUser;
        case 'orders':
        case 'downloads':
        case 'wishlists':
        case 'my-wishlists':
            return emptyPaginator;

        default:
            return null;
    }
}
