/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'img1.kakaocdn.net',
      },
      {
        protocol: 'http',
        hostname: 't1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 't1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net',
      },
    ],
  },
};

export default nextConfig;
