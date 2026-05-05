import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/how-to-find-clips-from-podcasts",
        destination: "/blog/how-to-find-clips-from-podcasts-fast",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;