import { defineConfig, loadEnv } from 'vite';

const autoprefixer = require('autoprefixer'); //解决浏览器样式前缀问题
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';//导入
import eslintPlugin from 'vite-plugin-eslint'; //导入包
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus'; //setup语法糖扩展名
import qiankun from 'vite-plugin-qiankun'
const path = require('path');
const config = ({ mode }) => {
    const isProd = mode === 'production'
    const envPrefix = 'APP_';
    const { APP_TITLE = '' } = loadEnv(mode, process.cwd(), envPrefix);
    return {
        base: isProd ? '/tag-picture/' : './',
        plugins: [
            vue(),
            qiankun('tagPicture', { // 微应用名字，与主应用注册的微应用名字保持一致
                useDevMode: true
            }),
            vueSetupExtend(),
            // 增加下面的配置项,这样在运行时就能检查eslint规范
            // eslintPlugin({
            //     include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue'],
            // }),
            createHtmlPlugin({
                minify: isProd,
                inject: {
                    data: {
                        title: APP_TITLE,
                    },
                },
            }),
        ],
        build: {
            target: 'es2015',
            outDir: path.resolve(__dirname, 'dist'),
            assetsDir: 'assets',
            assetsInlineLimit: 8192,
            rollupOptions: {
                input: path.resolve(__dirname, 'index.html'),
                output: {
                    chunkFileNames: 'js/[name].[hash].js',
                    entryFileNames: 'js/[name].[hash].js',
                }
            }
        },
        envPrefix,
        resolve: {
            alias: [
                { find: /^@\//, replacement: path.resolve(__dirname, 'src') + '/' },
                { find: /^~/, replacement: '' },
            ],
            extensions: ['.ts', '.tsx', '.js', '.mjs', '.vue', '.json', '.less', '.css'],
        },
        css: {
            postcss: {
                plugins: [autoprefixer]
            },
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                    additionalData: `@import "${path.resolve(__dirname, 'src/styles/variable.less')}";`,
                },
            },
        },
        server: {
            port: 3111,
            open: true,
            proxy: {
                '/fontFile': {
                    target: 'https://github.com/',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/fontFile/, ''),
                }
            },
            origin: 'http://localhost:3111'
        },
        preview: {
            port: 5000,
        },
    }
}


export default defineConfig(config)