export const menu = [
  {
    id: 1,
    path: '/',
    label: 'menu-demos',
  },
  {
    id: 2,
    path: '/search?category=tools',
    label: 'menu-tools',
  },
  {
    id: 3,
    path: '/search?category=accessoires',
    label: 'menu-accessoires',
  },
  {
    id: 4,
    path: '/search?category=lcd',
    label: 'menu-lcd',
  },
  {
    id: 5,
    path: '/search',
    label: 'menu-search',
  },
  {
    id: 6,
    path: '/shops',
    label: 'menu-shops',
  },
  {
    id: 7,
    path: '/',
    label: 'menu-pages',
    subMenu: [
      {
        id: 1,
        path: '/',
        label: 'menu-users',
        subMenu: [
          { id: 1, path: '/my-account', label: 'menu-my-account' },
          { id: 2, path: '/signin', label: 'menu-sign-in' },
          { id: 3, path: '/signup', label: 'menu-sign-up' },
          { id: 4, path: '/forget-password', label: 'menu-forget-password' },
        ],
      },
      { id: 2, path: '/offers', label: 'menu-offers' },
      { id: 3, path: '/faq', label: 'menu-faq' },
      { id: 4, path: '/privacy', label: 'menu-privacy-policy' },
      { id: 5, path: '/terms', label: 'menu-terms-condition' },
      { id: 6, path: '/contact-us', label: 'menu-contact-us' },
      { id: 7, path: '/checkout', label: 'menu-checkout' },
      { id: 8, path: '/404', label: 'menu-404' },
      { id: 9, path: '/become-seller', label: 'menu-become-seller' },
    ],
  },
];

export const mobileMenu = [
  { id: 1, path: '/', label: 'menu-demos' },
  { id: 2, path: '/search?category=tools', label: 'menu-tools' },
  { id: 3, path: '/search?category=accessoires', label: 'menu-accessoires' },
  { id: 4, path: '/search?category=lcd', label: 'menu-lcd' },
  { id: 5, path: '/search', label: 'menu-search' },
  { id: 6, path: '/shops', label: 'menu-shops' },
  {
    id: 7,
    path: '/',
    label: 'menu-pages',
    subMenu: [
      { id: 1, path: '/my-account', label: 'menu-my-account' },
      { id: 2, path: '/signin', label: 'menu-sign-in' },
      { id: 3, path: '/signup', label: 'menu-sign-up' },
      { id: 4, path: '/forget-password', label: 'menu-forget-password' },
      { id: 5, path: '/offers', label: 'menu-offers' },
      { id: 6, path: '/faq', label: 'menu-faq' },
      { id: 7, path: '/privacy', label: 'menu-privacy-policy' },
      { id: 8, path: '/terms', label: 'menu-terms-condition' },
      { id: 9, path: '/contact-us', label: 'menu-contact-us' },
      { id: 10, path: '/checkout', label: 'menu-checkout' },
      { id: 11, path: '/404', label: 'menu-404' },
      { id: 12, path: '/become-seller', label: 'menu-become-seller' },
    ],
  },
];
