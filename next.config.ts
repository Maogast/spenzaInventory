// next.config.ts
import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig } from 'webpack'

const nextConfig: NextConfig = {
  transpilePackages: ['@mui/material', '@mui/x-data-grid', '@mui/utils'],

  // typed webpack override
  webpack: (config: WebpackConfig) => {
    // Guarantee module.rules is an array
    const rules = Array.isArray(config.module?.rules)
      ? config.module!.rules
      : []

    // Reassign back so TS knows module.rules is defined
    if (!config.module) {
      config.module = { rules } as any
    } else {
      config.module.rules = rules
    }

    // Strip out any DataGrid CSS imports
    config.module.rules.unshift({
      test: /[\\/]@mui[\\/]x-data-grid[\\/]esm[\\/]index\.css$/,
      use: 'null-loader',
    })

    return config
  },
}

export default nextConfig