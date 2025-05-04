
import type { Configuration } from 'webpack';

interface WebpackConfig extends Configuration {
  resolve: {
    alias: Record<string, string>;
  };
}

interface NextConfig {
  webpack: (config: WebpackConfig) => WebpackConfig;
}

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api.js'
    };
    return config;
  }
};

module.exports = nextConfig;