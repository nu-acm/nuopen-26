import type { NextConfig } from "next";

// Files in public/ have no content hash, so a day fresh plus a week of background re-checks, not "immutable".
const KEEP_A_DAY = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/models/:file*", headers: KEEP_A_DAY },
      { source: "/audio/:file*", headers: KEEP_A_DAY },
    ];
  },
};

export default nextConfig;
