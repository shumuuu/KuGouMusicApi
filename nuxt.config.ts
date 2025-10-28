export default defineNuxtConfig({
    // 服务器端配置
    nitro: {
        experimental: {
            wasm: true
        }
    },

    // 运行时配置
    runtimeConfig: {
        // 私有配置（仅在服务器端可用）
        kugouApi: {
            baseUrl: process.env.KUGOU_API_BASE_URL || 'https://www.kugou.com',
            timeout: process.env.KUGOU_API_TIMEOUT || 10000
        },

        // 公共配置（客户端和服务器端都可用）
        public: {
            kugouApi: {
                version: '1.3.9',
                corsOrigin: process.env.CORS_ALLOW_ORIGIN || '*'
            }
        }
    },

    // 类型定义
    typescript: {
        strict: true,
        typeCheck: true
    }
})