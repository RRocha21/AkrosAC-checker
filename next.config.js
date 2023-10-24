/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: 'build',
    publicRuntimeConfig: {
        // Will be available on both server and client
        fontsFolder: '/fonts',
    }
}

module.exports = nextConfig
