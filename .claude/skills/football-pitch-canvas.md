---
name: football-pitch-canvas
description: "Build an interactive 2D football/soccer pitch canvas for session planning apps. Use this skill whenever the user wants to build, modify, or extend a football pitch visualiser, session planner canvas, tactical board, coaching tool, or any interactive pitch drawing interface. Triggers on pitch, football planner, session planner, tactical board, drag players, draw arrows on pitch, coaching app, football session. Always use this skill before writing any pitch canvas code."
---

# Football Pitch Canvas Skill

A complete reference for building a production-grade interactive 2D football pitch canvas using React + SVG.

## Architecture Overview

**Rendering layer**: SVG (not Canvas, not DOM divs)
- SVG is resolution-independent → clean PNG exports
- React SVG elements are directly interactive (onClick, onMouseDown, etc.)
- Player tokens, arrows, zones all live as SVG elements with React state

**State shape** (single screen):
```js
{
  players: [{ id, x, y, team, role, number, name }],
  arrows:  [{ id, x1, y1, x2, y2, type, curved }],   // type: 'pass' | 'run' | 'dribble'
  zones:   [{ id, x, y, width, height, color, opacity }],
  ball:    { x, y },
  activeTool: 'select' | 'arrow-pass' | 'arrow-run' | 'arrow-dribble' | 'zone' | 'delete'
}
```

**Multi-screen sessions**: Array of the above, with `activeScreenIndex`.

---

## Pitch Dimensions & Markings

Always render the pitch as a **scaled SVG viewport**. Use a fixed coordinate system internally:

```
PITCH_WIDTH  = 1050   (internal units, maps to full pitch)
PITCH_HEIGHT = 680    (internal units)
```

Scale to container with `viewBox="0 0 1050 680"` and `preserveAspectRatio="xMidYMid meet"`.

### Required pitch markings (all as SVG rect, circle, line, path elements):

| Element | Approx SVG values |
|---|---|
| Outer boundary | rect x=50 y=40 width=950 height=600 |
| Centre circle | circle cx=525 cy=340 r=91.5 |
| Centre spot | circle cx=525 cy=340 r=5 |
| Halfway line | line x1=525 y1=40 x2=525 y2=640 |
| Left penalty area | rect x=50 y=182 width=165 height=316 |
| Right penalty area | rect x=835 y=182 width=165 height=316 |
| Left 6-yard box | rect x=50 y=271 width=55 height=138 |
| Right 6-yard box | rect x=945 y=271 width=55 height=138 |
| Left penalty spot | circle cx=161 cy=340 r=5 |
| Right penalty spot | circle cx=889 cy=340 r=5 |
| Goals | rect extending off pitch boundary each end |

Pitch surface colour: CSS variable --pitch-green: #3a7d44. White lines, opacity 0.9.

---

## Player Tokens

### Token design
- Circle with radius 18 (SVG units)
- Team colour fill (configurable, default: #1a73e8 team1, #e53935 team2)
- White border stroke, width 2
- Number centered in white text, font-size 11
- Optional name tag below (font-size 9, truncated to 8 chars)
- GK: slightly different shade + 'GK' label override

### Drag-and-drop implementation

```jsx
// Track which player is being dragged
const [dragging, setDragging] = useState(null) // { id, offsetX, offsetY }

// On player mousedown
const handlePlayerMouseDown = (e, player) => {
  if (activeTool !== 'select') return
  e.stopPropagation()
  const svgPt = clientToSVG(e)
  setDragging({ id: player.id, offsetX: svgPt.x - player.x, offsetY: svgPt.y - player.y })
}

// On SVG mousemove
const handleSVGMouseMove = (e) => {
  if (!dragging) return
  const svgPt = clientToSVG(e)
  setPlayers(prev => prev.map(p =>
    p.id === dragging.id
      ? { ...p, x: svgPt.x - dragging.offsetX, y: svgPt.y - dragging.offsetY }
      : p
  ))
}
```

### Coordinate conversion — ALWAYS use this, never e.offsetX/Y

```js
const clientToSVG = (e) => {
  const svg = svgRef.current
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  return pt.matrixTransform(svg.getScreenCTM().inverse())
}
```

### Player sidebar panel
- Column of player token templates outside SVG
- On drop onto SVG: create new player at drop position
- Categories: Team 1 outfield, Team 1 GK, Team 2 outfield, Team 2 GK, Referee

---

## Arrow Drawing Tools

Three arrow types:

| Type | Default colour | Line style |
|---|---|---|
| Pass | #ffffff (white) | Solid, arrowhead |
| Run | #facc15 (yellow) | Dashed, arrowhead |
| Dribble | #f97316 (orange) | Curved/bezier, arrowhead |

### Two-click draw flow
1. User selects arrow tool
2. First click → store drawStart {x, y}
3. Mouse move → render preview line from drawStart to cursor
4. Second click → commit arrow to state

### Arrowhead SVG marker (define in defs)
```svg
<defs>
  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
  </marker>
</defs>
```

### Curved dribble arrows
```js
const mid = { x: (x1+x2)/2 - (y2-y1)*0.25, y: (y1+y2)/2 + (x2-x1)*0.25 }
const d = `M ${x1} ${y1} Q ${mid.x} ${mid.y} ${x2} ${y2}`
// render as <path d={d} markerEnd="url(#arrowhead)" />
```

---

## Zone Highlighting

Click + drag to draw rectangle zones on pitch.

```jsx
const handleSVGMouseDown = (e) => {
  if (activeTool !== 'zone') return
  setZoneStart(clientToSVG(e))
}
const handleSVGMouseUp = (e) => {
  if (!zoneStart || activeTool !== 'zone') return
  const pt = clientToSVG(e)
  addZone({
    x: Math.min(zoneStart.x, pt.x),
    y: Math.min(zoneStart.y, pt.y),
    width:  Math.abs(pt.x - zoneStart.x),
    height: Math.abs(pt.y - zoneStart.y),
    color: zoneColor,
    opacity: 0.25
  })
  setZoneStart(null)
}
```

Zones render BEHIND players (SVG z-order = DOM order). Render zones first.

---

## Toolbar

```
[ Select ] [ Pass ] [ Run ] [ Dribble ] [ Zone ] [ Delete ] | [ Undo ] [ Redo ] | [ Export PNG ]
```

Keyboard shortcuts: S=select, P=pass, R=run, D=dribble, Z=zone, Del=delete, Cmd+Z=undo

---

## Undo / Redo

```js
const [history, setHistory] = useState([initialState])
const [historyIndex, setHistoryIndex] = useState(0)

const pushHistory = (newState) => {
  const trimmed = history.slice(0, historyIndex + 1)
  setHistory([...trimmed, newState])
  setHistoryIndex(trimmed.length)
}
const undo = () => historyIndex > 0 && setHistoryIndex(i => i - 1)
const redo = () => historyIndex < history.length - 1 && setHistoryIndex(i => i + 1)
```

Push to history ONLY on finalised actions (drop, arrow commit, zone commit, delete).
NOT on every mouse move.

---

## PNG Export

```js
const exportPNG = () => {
  const svg = svgRef.current
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svg)
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = svg.clientWidth * 2
    canvas.height = svg.clientHeight * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0)
    const link = document.createElement('a')
    link.download = 'session.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    URL.revokeObjectURL(url)
  }
  img.src = url
}
```

---

## Multi-Screen Sessions

```js
const [screens, setScreens] = useState([newScreen()])
const [activeScreen, setActiveScreen] = useState(0)
// Tab bar: screen tabs + "Add Screen" button
// Each screen is fully independent pitch state
```

---

## Key Gotchas

1. ALWAYS use clientToSVG() — never e.offsetX/Y (breaks in scaled viewBox)
2. SVG z-order = DOM order: zones → pitch → ball → players → arrows → previews
3. Prevent default on onDragOver to allow drop
4. Touch support: mirror mouse handlers with touchstart/move/end using touches[0]
5. Delete tool: clicking any element while delete active filters it out by id
6. Clamp player positions to pitch boundary on drop

---

## Reference Files

See references/pitch-markings.md for exact SVG path values for all pitch elements.
