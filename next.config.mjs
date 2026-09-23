import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

let apiHostname = 'localhost'
let apiProtocol = 'http'

try {
  const parsed = new URL(API_SERVER_URL)
  apiHostname = parsed.hostname
  apiProtocol = parsed.protocol.replace(':', '')
} catch {
  // fallback defaults
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
  },
  images: {
    remotePatterns: [
      {
        hostname: apiHostname,
        protocol: apiProtocol,
      },
      {
        hostname: 'localhost',
        protocol: 'http',
      },
      {
        hostname: 'cms.cardmax.in',
        protocol: 'https',
      },
    ],
  },
}

export default nextConfig
