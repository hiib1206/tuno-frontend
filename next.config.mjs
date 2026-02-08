/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 추가 개발환경에서만 필요
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone", // Docker 배포용
};

export default nextConfig;
