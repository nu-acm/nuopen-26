type Vec3 = readonly [number, number, number];

/** Uniform scale and offset that centre a bounding box on the origin at a given height. */
export function fitTransform(
  box: { min: Vec3; max: Vec3 },
  height: number,
): { scale: number; offset: [number, number, number] } {
  const size = box.max[1] - box.min[1];
  const scale = size > 0 ? height / size : 1;
  const offset = box.min.map((lo, i) => -((lo + box.max[i]) / 2) * scale) as [
    number,
    number,
    number,
  ];
  return { scale, offset };
}

/** Camera distance at which `size` fills the given share of the view's width and height, whichever is tighter. */
export function framingDistance(
  size: { width: number; height: number },
  view: { fovY: number; aspect: number },
  fill: { width: number; height: number },
) {
  const tanHalf = Math.tan(view.fovY / 2);
  const byWidth = size.width / (2 * tanHalf * view.aspect * fill.width);
  const byHeight = size.height / (2 * tanHalf * fill.height);
  return Math.max(byWidth, byHeight);
}
