/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
  runtimeCaching,
});

module.exports = withPWA({
  i18n,
  images: {
    remotePatterns: [
      { hostname: '127.0.0.1' },
      { hostname: 'localhost' },
      { hostname: 'googleusercontent.com' },
      { hostname: 'maps.googleapis.com' },
      { hostname: 'Yomaxapi.redq.io' },
      { hostname: 'graph.facebook.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 's3.amazonaws.com' },
      { hostname: '18.141.64.26' },
      { hostname: 'via.placeholder.com' },
      { hostname: 'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com' },
      { hostname: 'Yomaxlaravel.s3.ap-southeast-1.amazonaws.com' },
      { hostname: 'picsum.photos' },
      { hostname: 'cdninstagram.com' },
      { hostname: 'scontent.cdninstagram.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },

  turbopack: {},

  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },
});
