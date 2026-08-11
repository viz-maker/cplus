import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // `oracledb` is a native/optional-dependency-heavy package. When the Oracle
  // adapter is wired up, keeping it external stops the bundler from trying to
  // trace its optional binaries into the serverless function.
  serverExternalPackages: ['oracledb'],
};

export default nextConfig;
