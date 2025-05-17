/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем переменные окружения в сборку
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  },

  // Опционально: для лучшей безопасности (Next.js 13.4+)
  serverRuntimeConfig: {
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
  },

  // Опционально: если API вызывается из клиента (не рекомендуется для ключей)
  publicRuntimeConfig: {
    // Не используйте для секретных ключей!
    // NEXT_PUBLIC_OPENROUTER_API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
  },
};

export default nextConfig;
