export type Point3 = readonly [number, number, number];
export type Cluster = { x: number; y: number; z: number; count: number; size: number };

type Acc = {
  sum: [number, number, number];
  min: [number, number, number];
  max: [number, number, number];
  count: number;
};

const centroid = (a: Acc): Point3 => [a.sum[0] / a.count, a.sum[1] / a.count, a.sum[2] / a.count];

/** Greedy clustering: a point joins the first cluster whose centroid is within `radius`, else starts a new one. Largest first. */
export function clusterPoints(points: readonly Point3[], radius: number): Cluster[] {
  const groups: Acc[] = [];
  for (const p of points) {
    const near = groups.find((g) => {
      const c = centroid(g);
      return Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) <= radius;
    });
    if (!near) {
      groups.push({ sum: [...p], min: [...p], max: [...p], count: 1 });
      continue;
    }
    for (let i = 0; i < 3; i++) {
      near.sum[i] += p[i];
      near.min[i] = Math.min(near.min[i], p[i]);
      near.max[i] = Math.max(near.max[i], p[i]);
    }
    near.count++;
  }
  return groups
    .map((g) => {
      const [x, y, z] = centroid(g);
      const size = Math.max(g.max[0] - g.min[0], g.max[1] - g.min[1], g.max[2] - g.min[2]);
      return { x, y, z, count: g.count, size };
    })
    .sort((a, b) => b.count - a.count);
}
