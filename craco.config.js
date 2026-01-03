const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        configure: (webpackConfig, { env, paths }) => {
            // Production optimizations
            if (env === 'production') {
                // Optimize chunk splitting for better caching
                webpackConfig.optimization = {
                    ...webpackConfig.optimization,
                    splitChunks: {
                        chunks: 'all',
                        minSize: 20000,
                        maxSize: 244000, // Keep chunks under 244KB for optimal loading
                        cacheGroups: {
                            // Separate vendor chunks for better caching
                            vendor: {
                                test: /[\\/]node_modules[\\/]/,
                                name: 'vendors',
                                chunks: 'all',
                                priority: 20,
                            },
                            // MUI components in separate chunk
                            mui: {
                                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                                name: 'mui',
                                chunks: 'all',
                                priority: 30,
                            },
                            // React core in separate chunk
                            react: {
                                test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                                name: 'react',
                                chunks: 'all',
                                priority: 40,
                            },
                            // Common shared code
                            common: {
                                minChunks: 2,
                                priority: 10,
                                reuseExistingChunk: true,
                            },
                        },
                    },
                    // Enable module IDs hashing for better caching
                    moduleIds: 'deterministic',
                };

                // Disable source maps in production for smaller bundle
                webpackConfig.devtool = false;
            }

            return webpackConfig;
        },
    },
    devServer: {
        setupMiddlewares: (middlewares, devServer) => {
            devServer.app.use(
                '/api/deepseek',
                createProxyMiddleware({
                    target: 'https://api.deepseek.com',
                    changeOrigin: true,
                    pathRewrite: {
                        '^/api/deepseek': '',
                    },
                    onProxyReq: (proxyReq, req, res) => {
                        console.log(`[Proxy] ${req.method} ${req.url} -> https://api.deepseek.com${req.url.replace('/api/deepseek', '')}`);
                    },
                    onError: (err, req, res) => {
                        console.error('[Proxy Error]', err);
                    },
                })
            );
            return middlewares;
        },
        // Enable compression for dev server
        compress: true,
        // Hot module replacement settings
        hot: true,
        // Client overlay settings
        client: {
            overlay: {
                warnings: false, // Don't show warnings overlay - improves dev experience
                errors: true,
            },
        },
    },
};
