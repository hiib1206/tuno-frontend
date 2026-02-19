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
  // Samsung Internet 강제 다크모드 방지 - 메타데이터를 스트리밍 대신 head에 직접 포함
  htmlLimitedBots:
    /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|LinkedInBot|Mediapartners-Google|msnbot|adidxbot|BingPreview|Slurp|Baiduspider|baiduspider|yandex|YandexBot|Sogou|Exabot|facebot|facebookexternalhit|ia_archiver|Twitterbot|Applebot|Slackbot|redditbot|rogerbot|SemrushBot|AhrefsBot|SamsungBrowser/,
};

export default nextConfig;
