'use client';

export function SvgDefs() {
  return (
    <defs>
      <marker
        id="arrowhead-white"
        markerWidth="8"
        markerHeight="6"
        refX="8"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#ffffff" />
      </marker>
      <marker
        id="arrowhead-yellow"
        markerWidth="8"
        markerHeight="6"
        refX="8"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#facc15" />
      </marker>
      <marker
        id="arrowhead-orange"
        markerWidth="8"
        markerHeight="6"
        refX="8"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
      </marker>
    </defs>
  );
}

export function getArrowheadId(style: string): string {
  switch (style) {
    case 'pass': return 'arrowhead-white';
    case 'run': return 'arrowhead-yellow';
    case 'dribble': return 'arrowhead-orange';
    default: return 'arrowhead-white';
  }
}

export function getArrowColor(style: string): string {
  switch (style) {
    case 'pass': return '#ffffff';
    case 'run': return '#facc15';
    case 'dribble': return '#f97316';
    default: return '#ffffff';
  }
}
