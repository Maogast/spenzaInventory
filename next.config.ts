// next.config.ts
import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig, RuleSetRule } from 'webpack'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mui/material',
    '@mui/x-data-grid',
    '@mui/utils'
  ],

  webpack: (config: WebpackConfig) => {
    // Grab existing module and rules (or default to empty)
    const existingModule = config.module ?? {}
    const existingRules = Array.isArray(existingModule.rules)
      ? existingModule.rules
      : []

    // Define the null-loader rule for DataGrid's CSS
    const nullLoaderRule: RuleSetRule = {
      test: /[\\/]@mui[\\/]x-data-grid[\\/]esm[\\/]index\.css$/,
      use: 'null-loader'
    }

    // Return a new config object with module.rules overwritten
    return {
      ...config,
      module: {
        ...existingModule,
        rules: [nullLoaderRule, ...existingRules]
      }
    }
  }
}

export default nextConfig