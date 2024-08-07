import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTypedCSSModules } from '@rsbuild/plugin-typed-css-modules'
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'

export default defineConfig({
    html: {
        template: './index.html',
    },
    output: {
        polyfill: 'usage',
    },
    source: {
        entry: {
            index: './src/index.tsx',
        },
    },
    server: {
        // strictPort: true,
    },
    plugins: [
        pluginReact(),
        pluginTypedCSSModules(),
        pluginNodePolyfill(),
        {
            name: 'test',
            setup(build) {
                // build.modifyBundlerChain(chain => {
                //     chain.module.rule('test').
                // })
                // build.transform(
                //     {
                //         test: /^test$/,
                //     },
                //     ctx => {
                //         console.log('ctx', ctx)
                //         return {
                //             code: `export default 'test'`,
                //         }
                //     },
                // )
            },
        },
    ],
})
