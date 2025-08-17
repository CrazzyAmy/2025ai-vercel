import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/forgot-password', destination: '/auth/forgot-password' },
      { source: '/login', destination: '/auth/login' },
      { source: '/signup', destination: '/auth/signup' },
      { source: '/aigen', destination: '/auth/signup/page.tsx' },
      { source: '/surveyedit', destination: '/auth/login/surveyedit/page.tsx' },
      { source: '/surveyset', destination: '/auth/login/surveyset/page.tsx' },
      // 視需要加其他 rewrites
    ];
  },
};

export default nextConfig;
