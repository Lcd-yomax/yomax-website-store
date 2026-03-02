/**
 * Mock data for running the Shop frontend without the Laravel backend.
 * These provide realistic placeholder data for all major API endpoints.
 */

const placeholderImage = {
    id: 1,
    thumbnail: '/assets/placeholder/products/product-list.svg',
    original: '/assets/placeholder/products/product-list.svg',
};

const placeholderImageGrid = {
    id: 1,
    thumbnail: '/assets/placeholder/products/product-grid.svg',
    original: '/assets/placeholder/products/product-grid.svg',
};

// ─── Settings ──────────────────────────────────────────────
export const mockSettings = {
    id: 1,
    options: {
        siteTitle: 'ChawkBazar',
        siteSubtitle: 'Fastest E-commerce template',
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
            ogTitle: 'ChawkBazar',
            metaTitle: 'ChawkBazar',
            metaTags: '',
            canonicalUrl: '',
            ogDescription: 'Fastest E-commerce template',
            twitterHandle: '',
            metaDescription: 'Fastest E-commerce template',
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

// ─── Products ──────────────────────────────────────────────
function makeProduct(id: number, name: string, price: number, salePrice?: number) {
    return {
        id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `High quality ${name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        price,
        sale_price: salePrice ?? null,
        min_price: salePrice ?? price,
        max_price: price,
        sku: `SKU-${id.toString().padStart(4, '0')}`,
        quantity: 50,
        in_stock: true,
        is_taxable: true,
        status: 'publish',
        product_type: 'simple',
        unit: '1 pc',
        image: placeholderImage,
        gallery: [placeholderImage, placeholderImageGrid],
        categories: [],
        tags: [],
        type: { id: 1, name: 'Fashion', slug: 'fashion', icon: 'DressIcon' },
        shop: {
            id: 1,
            name: 'ChawkBazar Store',
            slug: 'chawkbazar-store',
            is_active: 1,
            logo: placeholderImage,
            cover_image: placeholderImage,
        },
        ratings: 4.5,
        total_reviews: 12,
        variations: [],
        variation_options: [],
        author: null,
        manufacturer: null,
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
    };
}

export const mockProducts = [
    makeProduct(1, 'Classic Leather Jacket', 199.99, 149.99),
    makeProduct(2, 'Slim Fit Denim Jeans', 89.99),
    makeProduct(3, 'Cotton Crew T-Shirt', 29.99, 19.99),
    makeProduct(4, 'Wool Blend Overcoat', 349.99, 279.99),
    makeProduct(5, 'Running Sneakers Pro', 129.99),
    makeProduct(6, 'Silk Evening Dress', 259.99, 199.99),
    makeProduct(7, 'Casual Chino Pants', 69.99),
    makeProduct(8, 'Linen Summer Shirt', 49.99, 39.99),
    makeProduct(9, 'Waterproof Hiking Boots', 179.99),
    makeProduct(10, 'Cashmere Scarf', 89.99, 69.99),
    makeProduct(11, 'Polarized Sunglasses', 159.99),
    makeProduct(12, 'Canvas Tote Bag', 45.99, 35.99),
];

export const mockProductPaginator = {
    data: mockProducts,
    current_page: 1,
    first_page_url: '',
    from: 1,
    last_page: 1,
    last_page_url: '',
    next_page_url: null,
    path: '',
    per_page: 30,
    prev_page_url: null,
    to: mockProducts.length,
    total: mockProducts.length,
};

// ─── Categories ────────────────────────────────────────────
function makeCategory(id: number, name: string, image?: string) {
    return {
        id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        icon: 'DressIcon',
        image: image ? { id, thumbnail: image, original: image } : placeholderImageGrid,
        details: null,
        parent: null,
        children: [],
        products_count: Math.floor(Math.random() * 50) + 5,
        type: { id: 1, name: 'Fashion', slug: 'fashion' },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    };
}

export const mockCategories = [
    makeCategory(1, 'Men'),
    makeCategory(2, 'Women'),
    makeCategory(3, 'Kids'),
    makeCategory(4, 'Sports'),
    makeCategory(5, 'Accessories'),
    makeCategory(6, 'Shoes'),
    makeCategory(7, 'Bags'),
    makeCategory(8, 'Watches'),
    makeCategory(9, 'Jewelry'),
    makeCategory(10, 'Electronics'),
];

// ─── Types / Brands ───────────────────────────────────────
export const mockTypes = [
    {
        id: 1,
        name: 'Fashion',
        slug: 'fashion',
        icon: 'DressIcon',
        promotional_sliders: [],
        settings: { isHome: true, productCard: 'neon', layoutType: 'modern' },
        banners: [],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 2,
        name: 'Casual Wear',
        slug: 'casual-wear',
        icon: 'DressIcon',
        promotional_sliders: [],
        settings: { isHome: false, productCard: 'neon', layoutType: 'modern' },
        banners: [],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
];

export const mockTypePaginator = {
    data: mockTypes,
    current_page: 1,
    last_page: 1,
    total: mockTypes.length,
    per_page: 30,
    from: 1,
    to: mockTypes.length,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
};

// ─── Tags ──────────────────────────────────────────────────
export const mockTags = [
    { id: 1, name: 'Flash Sale', slug: 'flash-sale', details: '', image: null, type: mockTypes[0] },
    { id: 2, name: 'Featured Products', slug: 'featured-products', details: '', image: null, type: mockTypes[0] },
    { id: 3, name: 'On Sale', slug: 'on-sale', details: '', image: null, type: mockTypes[0] },
    { id: 4, name: 'New Arrival', slug: 'new-arrival', details: '', image: null, type: mockTypes[0] },
];

// ─── Shops ─────────────────────────────────────────────────
function makeShop(id: number, name: string) {
    return {
        id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `Welcome to ${name}. We offer the best products with competitive prices.`,
        is_active: 1,
        orders_count: Math.floor(Math.random() * 500),
        products_count: Math.floor(Math.random() * 100),
        logo: placeholderImage,
        cover_image: placeholderImage,
        address: {
            street_address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
        },
        settings: {
            contact: '123-456-7890',
            socials: [],
            website: 'https://example.com',
            location: { lat: 40.7128, lng: -74.006, formattedAddress: 'New York, NY' },
        },
        owner: { id: 1, name: 'Shop Owner', email: 'owner@example.com' },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    };
}

export const mockShops = [
    makeShop(1, 'ChawkBazar Store'),
    makeShop(2, 'Urban Fashion'),
    makeShop(3, 'SportZone'),
    makeShop(4, 'Elegant Boutique'),
    makeShop(5, 'Tech Haven'),
    makeShop(6, 'Kids World'),
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
export const mockCoupons = [
    {
        id: 1,
        code: 'WELCOME10',
        description: 'Get 10% off on your first order',
        type: 'percentage',
        amount: 10,
        minimum_cart_amount: 50,
        is_valid: true,
        expire_at: '2027-12-31',
        image: placeholderImage,
        shop: mockShops[0],
        created_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 2,
        code: 'FLAT20',
        description: 'Flat $20 off on orders above $100',
        type: 'fixed',
        amount: 20,
        minimum_cart_amount: 100,
        is_valid: true,
        expire_at: '2027-12-31',
        image: placeholderImage,
        shop: mockShops[0],
        created_at: '2024-01-01T00:00:00.000Z',
    },
];

export const mockCouponPaginator = {
    data: mockCoupons,
    current_page: 1,
    last_page: 1,
    total: mockCoupons.length,
    per_page: 30,
    from: 1,
    to: mockCoupons.length,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
};

// ─── Attributes ────────────────────────────────────────────
export const mockAttributes = [
    {
        id: 1,
        name: 'Color',
        slug: 'color',
        values: [
            { id: 1, value: 'Red', attribute_id: 1, meta: '#ff0000' },
            { id: 2, value: 'Blue', attribute_id: 1, meta: '#0000ff' },
            { id: 3, value: 'Black', attribute_id: 1, meta: '#000000' },
            { id: 4, value: 'White', attribute_id: 1, meta: '#ffffff' },
        ],
    },
    {
        id: 2,
        name: 'Size',
        slug: 'size',
        values: [
            { id: 5, value: 'S', attribute_id: 2, meta: '' },
            { id: 6, value: 'M', attribute_id: 2, meta: '' },
            { id: 7, value: 'L', attribute_id: 2, meta: '' },
            { id: 8, value: 'XL', attribute_id: 2, meta: '' },
        ],
    },
];

// ─── FAQs ──────────────────────────────────────────────────
export const mockFaqs = {
    data: [
        {
            id: 1,
            faq_title: 'How do I place an order?',
            faq_description: 'Browse products, add to cart, and proceed to checkout. It\'s that simple!',
            slug: 'how-to-order',
            faq_type: 'global',
        },
        {
            id: 2,
            faq_title: 'What payment methods are accepted?',
            faq_description: 'We accept cash on delivery, credit cards, and various digital payment methods.',
            slug: 'payment-methods',
            faq_type: 'global',
        },
        {
            id: 3,
            faq_title: 'How can I track my order?',
            faq_description: 'You can track your order from the My Account > Orders section using your tracking number.',
            slug: 'track-order',
            faq_type: 'global',
        },
    ],
    current_page: 1,
    last_page: 1,
    total: 3,
    per_page: 30,
    from: 1,
    to: 3,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
};

// ─── Terms and Conditions ──────────────────────────────────
export const mockTerms = {
    data: [
        {
            id: 1,
            title: 'Terms of Service',
            slug: 'terms-of-service',
            description: 'These are the terms of service for using ChawkBazar...',
            is_approved: true,
            type: 'global',
        },
    ],
    current_page: 1,
    last_page: 1,
    total: 1,
    per_page: 30,
    from: 1,
    to: 1,
    first_page_url: '',
    last_page_url: '',
    next_page_url: null,
    prev_page_url: null,
    path: '',
};

// ─── Become Seller ─────────────────────────────────────────
export const mockBecomeSeller = {
    id: 1,
    page_options: {
        banner: {
            heading: 'Become a Seller',
            subHeading: 'Start selling your products on ChawkBazar today!',
            image: placeholderImage,
        },
        sellerInformation: [],
        commission: {
            title: 'Commission',
            description: 'We charge a competitive commission rate.',
        },
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
        bio: 'Demo user account',
        contact: '1234567890',
    },
    address: [],
    orders: { current_page: 1, data: [] },
    permissions: ['customer'],
    wallet: { available_points: 100, total_points: 100 },
    created_at: '2024-01-01T00:00:00.000Z',
};

// ─── Empty paginators for auth-required endpoints ──────────
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

// ─── Endpoint → mock data mapping ─────────────────────────
export const MOCK_ENABLED = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_API === '1')
    : (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NEXT_PUBLIC_MOCK_API === '1');

/**
 * Returns mock data for a given URL if available, otherwise null.
 */
export function getMockData(url: string, _params?: unknown): any {
    // Normalize URL
    const cleanUrl = url.replace(/^\//, '').split('?')[0];
    const basePath = cleanUrl.split('/')[0];

    switch (basePath) {
        case 'settings':
            return mockSettings;
        case 'products':
            if (cleanUrl.includes('/')) {
                // Single product
                const slug = cleanUrl.split('/')[1];
                return mockProducts.find(p => p.slug === slug) || mockProducts[0];
            }
            return mockProductPaginator;
        case 'popular-products':
            return mockProducts.slice(0, 6);
        case 'categories':
        case 'featured-categories':
            if (cleanUrl.includes('/')) {
                const slug = cleanUrl.split('/')[1];
                return mockCategories.find(c => c.slug === slug) || mockCategories[0];
            }
            return mockCategories;
        case 'types':
            if (cleanUrl.includes('/')) {
                const slug = cleanUrl.split('/')[1];
                return mockTypes.find(t => t.slug === slug) || mockTypes[0];
            }
            return mockTypes;
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
            if (cleanUrl.includes('/')) {
                return mockTerms.data[0];
            }
            return mockTerms;
        case 'became-seller':
            return mockBecomeSeller;
        case 'me':
            return mockUser;
        case 'orders':
            return emptyPaginator;
        case 'downloads':
            return emptyPaginator;
        case 'wishlists':
        case 'my-wishlists':
            return emptyPaginator;
        default:
            return null;
    }
}
