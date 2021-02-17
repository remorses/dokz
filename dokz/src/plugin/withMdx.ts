import path from 'path'
import { Configuration } from 'webpack'
type Options = {
    extension?: RegExp
    options?: any
    onStart?: (config, options) => any
}

export const withMdx = (pluginOptions: Options = {}) => (
    nextConfig = {} as any,
) => {
    const { extension = /\.mdx$/, options: mdxOptions = {} } = pluginOptions

    return Object.assign({}, nextConfig, {
        webpack(config: Configuration, options) {
            if (!options.defaultLoaders) {
                throw new Error(
                    'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade',
                )
            }
            if (pluginOptions.onStart) {
                pluginOptions.onStart(config, options)
            }
            config.resolve.alias['nextjs_root_folder_'] = path.join(
                process.cwd(),
            ) // needed to find the sidebar.json
            config.resolve.alias['buble'] = '@philpl/buble' // smaller buble version

            config.module.rules.push({
                test: extension,
                use: [
                    options.defaultLoaders.babel,
                    ...makeDebugLoader(),
                    {
                        loader: require.resolve('./injectorLoader'),
                    },
                    {
                        loader: '@mdx-js/loader',
                        options: mdxOptions,
                    },
                ],
            })

            if (typeof nextConfig.webpack === 'function') {
                return nextConfig.webpack(config, options)
            }

            return config
        },
    })
}

function makeDebugLoader() {
    if (!process.env.DEBUG) {
        return []
    }
    return [
        {
            loader: require.resolve('./debugLoader'),
        },
    ]
}
