const fs = require('fs');
const path = require('path');
const { context } = require('esbuild');
const { solidPlugin } = require('esbuild-plugin-solid');
const CssModulesPlugin = require('esbuild-css-modules-plugin');
const { htmlPlugin } = require('@craftamap/esbuild-plugin-html');
const { copy } = require('esbuild-plugin-copy');

const entry = process.argv[2];
if (!entry) {
    console.log('Usage: node build/esbuild.js <entry>');
    process.exit(1);
}

const entryPath = path.join('src', 'entries', `${entry}.ts`);
if (!fs.existsSync(entryPath) || !fs.statSync(entryPath).isFile()) {
    console.log(`"${entryPath}" does not exist or is not a file`);
}

const shouldServe = process.env.ESBUILD_SERVE;

async function main() {
    const ctx = await context({
        entryPoints: [entryPath],
        entryNames: '[name]',
        bundle: true,
        metafile: true,
        publicPath: '/',
        outdir: path.resolve('out'),
        outbase: path.resolve('src', 'entries'),
        minify: false,
        sourcemap: true,
        logLevel: 'info',
        plugins: [
            solidPlugin(),
            CssModulesPlugin({
                inject: false,
            }),
            htmlPlugin({
                files: [
                    {
                        entryPoints: [entryPath],
                        filename: `${entry}.html`,
                        htmlTemplate: path.resolve(__dirname, 'index.html'),
                        scriptLoading: 'blocking',
                        findRelatedCssFiles: true,
                    },
                ],
            }),
            copy({
                resolveFrom: 'cwd',
                assets: [
                    {
                        from: './assets/**/*',
                        to: './out',
                    },
                ],
            }),
        ],
        loader: {
            '.ttf': 'file',
        },
    });

    if (shouldServe) {
        await ctx.serve({
            port: 3000,
            servedir: path.resolve('out'),
            onRequest: (req) => {
                console.log(`[${req.status}] ${req.method} ${req.path} (${req.timeInMS} ms)`);
            },
        });
    } else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
