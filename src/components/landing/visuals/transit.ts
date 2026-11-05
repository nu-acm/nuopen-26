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
