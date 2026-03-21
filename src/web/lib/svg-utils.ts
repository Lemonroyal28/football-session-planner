import { PITCH_X, PITCH_Y, PITCH_INNER_WIDTH, PITCH_INNER_HEIGHT } from '../../types/pitch';

export function clientToSVG(
  e: React.MouseEvent | MouseEvent | Touch | { clientX: number; clientY: number },
  svgEl: SVGSVGElement
): { x: number; y: number } {
  const pt = svgEl.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

export function clampToPitch(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(PITCH_X, Math.min(PITCH_X + PITCH_INNER_WIDTH, x)),
    y: Math.max(PITCH_Y, Math.min(PITCH_Y + PITCH_INNER_HEIGHT, y)),
  };
}
