'use client';

import { useCallback, useState, useRef } from 'react';
import type { ActionType, LineStyle } from '../../types/tactical-sequence';
import type { CanvasArrow } from '../../types/canvas';
import { clientToSVG, clampToPitch } from '../lib/svg-utils';
import { newId } from '../lib/id';
import { getArrowColor } from '../components/canvas/svg-defs';

interface ActionDrawState {
  isDrawing: boolean;
  actionType: ActionType;
  lineStyle: LineStyle;
  startPoint: { x: number; y: number } | null;
  endPoint: { x: number; y: number } | null;
  controlPoint: { x: number; y: number } | null; // For curved lines
  pathPoints: { x: number; y: number }[]; // For free-draw
  preview: { x: number; y: number } | null;
}

/**
 * Enhanced hook for drawing football actions with different line styles
 * Supports: straight, curved, and free-draw modes
 */
export function useActionDraw(
  svgRef: React.RefObject<SVGSVGElement | null>,
  actionType: ActionType,
  lineStyle: LineStyle,
  onComplete: (arrow: CanvasArrow, lineStyle: LineStyle, pathPoints?: { x: number; y: number }[]) => void
) {
  const [state, setState] = useState<ActionDrawState>({
    isDrawing: false,
    actionType,
    lineStyle,
    startPoint: null,
    endPoint: null,
    controlPoint: null,
    pathPoints: [],
    preview: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Handle click based on current line style
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const pt = clientToSVG(e.nativeEvent, svg);
      const clamped = clampToPitch(pt.x, pt.y);
      const current = stateRef.current;

      if (lineStyle === 'straight') {
        // Straight line: start → end
        if (!current.startPoint) {
          setState({
            ...current,
            isDrawing: true,
            startPoint: clamped,
            preview: clamped,
          });
        } else {
          // Complete straight line
          const arrow: CanvasArrow = {
            id: newId(),
            x1: current.startPoint.x,
            y1: current.startPoint.y,
            x2: clamped.x,
            y2: clamped.y,
            style: actionType === 'pass' ? 'pass' : actionType === 'run' ? 'run' : actionType === 'dribble' ? 'dribble' : 'movement',
            color: getArrowColor(actionType),
          };
          // Pass path points for straight line too (start and end)
          onComplete(arrow, lineStyle, [current.startPoint, clamped]);
          setState({
            isDrawing: false,
            actionType,
            lineStyle,
            startPoint: null,
            endPoint: null,
            controlPoint: null,
            pathPoints: [],
            preview: null,
          });
        }
      } else if (lineStyle === 'curved') {
        // Curved line: start → control point → end
        if (!current.startPoint) {
          setState({
            ...current,
            isDrawing: true,
            startPoint: clamped,
          });
        } else if (!current.controlPoint) {
          setState({
            ...current,
            controlPoint: clamped,
          });
        } else {
          // Complete curved line with bezier
          const arrow: CanvasArrow = {
            id: newId(),
            x1: current.startPoint.x,
            y1: current.startPoint.y,
            x2: clamped.x,
            y2: clamped.y,
            style: actionType === 'pass' ? 'pass' : actionType === 'run' ? 'run' : actionType === 'dribble' ? 'dribble' : 'movement',
            color: getArrowColor(actionType),
          };
          // Store control points for curved line: [start, control, end]
          const curvePoints = [current.startPoint, current.controlPoint, clamped];
          onComplete(arrow, lineStyle, curvePoints);
          setState({
            isDrawing: false,
            actionType,
            lineStyle,
            startPoint: null,
            endPoint: null,
            controlPoint: null,
            pathPoints: [],
            preview: null,
          });
        }
      }
      // Free-draw is handled differently (via mouse move)
    },
    [svgRef, actionType, lineStyle, onComplete]
  );

  // Handle mouse move for preview and free-draw
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const pt = clientToSVG(e.nativeEvent, svg);
      const clamped = clampToPitch(pt.x, pt.y);
      const current = stateRef.current;

      if (!current.isDrawing) return;

      if (lineStyle === 'free_draw') {
        // Capture path points for free drawing
        setState((prev) => ({
          ...prev,
          pathPoints: [...prev.pathPoints, clamped],
        }));
      } else {
        // Update preview for straight and curved
        setState((prev) => ({
          ...prev,
          preview: clamped,
        }));
      }
    },
    [svgRef, lineStyle]
  );

  // Start free-draw mode
  const startFreeDraw = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (lineStyle !== 'free_draw') return;

      const svg = svgRef.current;
      if (!svg) return;

      const pt = clientToSVG(e.nativeEvent, svg);
      const clamped = clampToPitch(pt.x, pt.y);

      setState({
        isDrawing: true,
        actionType,
        lineStyle,
        startPoint: clamped,
        endPoint: null,
        controlPoint: null,
        pathPoints: [clamped],
        preview: null,
      });
    },
    [svgRef, actionType, lineStyle]
  );

  // Complete free-draw
  const endFreeDraw = useCallback(() => {
    const current = stateRef.current;
    if (lineStyle !== 'free_draw' || !current.isDrawing || current.pathPoints.length < 2) {
      return;
    }

    const simplified = simplifyPath(current.pathPoints, 5); // Tolerance of 5px
    const start = simplified[0];
    const end = simplified[simplified.length - 1];

    const arrow: CanvasArrow = {
      id: newId(),
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      style: actionType === 'pass' ? 'pass' : actionType === 'run' ? 'run' : actionType === 'dribble' ? 'dribble' : 'movement',
      color: getArrowColor(actionType),
    };

    onComplete(arrow, lineStyle, simplified);

    setState({
      isDrawing: false,
      actionType,
      lineStyle,
      startPoint: null,
      endPoint: null,
      controlPoint: null,
      pathPoints: [],
      preview: null,
    });
  }, [actionType, lineStyle, onComplete]);

  return {
    state,
    handleClick,
    handleMouseMove,
    startFreeDraw,
    endFreeDraw,
  };
}

// Generate points along a quadratic bezier curve
function generateBezierPoints(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  segments: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
    const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
    points.push({ x, y });
  }

  return points;
}

// Simplify path using Ramer-Douglas-Peucker algorithm
function simplifyPath(points: { x: number; y: number }[], tolerance: number): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  // Find the point with maximum distance
  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = simplifyPath(points.slice(0, index + 1), tolerance);
    const right = simplifyPath(points.slice(index), tolerance);
    return [...left.slice(0, -1), ...right];
  } else {
    return [points[0], points[end]];
  }
}

function perpendicularDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  }

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);

  if (t < 0) {
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  } else if (t > 1) {
    return Math.hypot(point.x - lineEnd.x, point.y - lineEnd.y);
  }

  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;

  return Math.hypot(point.x - projX, point.y - projY);
}
