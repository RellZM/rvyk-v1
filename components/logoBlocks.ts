// Logo blocks in the 580x325 viewBox space (axis-aligned bounding boxes,
// derived from the Figma SVG's rotated/flipped rects).
export type Block = { x: number; y: number; w: number; h: number; color: string; gray?: boolean; isR?: boolean };

export const VB_W = 580;
export const VB_H = 325;

export const BLOCKS: Block[] = [
  // R (blue) + its gray stem — build priority group
  { x: 0, y: 3, w: 240, h: 40, color: "#1900A7", isR: true },
  { x: 0, y: 121, w: 40, h: 204, color: "#858585", gray: true, isR: true },
  { x: 0, y: 62, w: 40, h: 40, color: "#1900A7", isR: true },
  { x: 200, y: 62, w: 40, h: 40, color: "#1900A7", isR: true },
  { x: 120, y: 121, w: 120, h: 40, color: "#1900A7", isR: true },
  { x: 120, y: 175, w: 40, h: 40, color: "#1900A7", isR: true },
  { x: 160, y: 230, w: 40, h: 40, color: "#1900A7", isR: true },
  { x: 200, y: 285, w: 40, h: 40, color: "#1900A7", isR: true },
  // V (colored) + its gray stems
  { x: 520, y: 173, w: 60, h: 40, color: "#994D0F" },
  { x: 540.529, y: 0, w: 39.4707, h: 149.111, color: "#858585", gray: true },
  { x: 440, y: 282, w: 60, h: 40, color: "#994D0F" },
  { x: 480, y: 227, w: 60, h: 40, color: "#994D0F" },
  { x: 360, y: 109, w: 60, h: 40, color: "#CFA901" },
  { x: 380.454, y: 164.461, w: 39.4707, h: 160.076, color: "#858585", gray: true },
  { x: 280, y: 0, w: 60, h: 40, color: "#A70000" },
  { x: 320, y: 55, w: 60, h: 40, color: "#A74600" },
];
