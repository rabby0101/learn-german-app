const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api/deepseek',
        createProxyMiddleware({
            target: 'https://api.deepseek.com',
            changeOrigin: true,
            pathRewrite: {
                '^/api/deepseek': '',
            },
            onProxyReq: (proxyReq, req, res) => {
                // Log proxy requests for debugging
                console.log(`[Proxy] ${req.method} ${req.url} -> https://api.deepseek.com${req.url.replace('/api/deepseek', '')}`);
            },
        })
    );
};
