# Pitch Variants — Coordinate Reference

All variants use the same `800 × 520` viewBox. Adjust markings accordingly.

---

## Half Pitch (Attacking Half)

Show only the right half of the pitch. Crop viewBox to `400 × 520`.
- Right penalty area, right 6-yard box, right goal remain
- Centre line becomes left boundary
- Good for: set plays, attacking patterns, finishing drills

```
viewBox="400 10 400 500"
```

## Half Pitch (Defensive Half)

Mirror of above — left half only.
```
viewBox="0 10 400 500"
```

---

## Small-Sided Pitch (5v5 / 7v7)

Scaled-down pitch. Use full 800×520 canvas but draw smaller pitch:
```
Outer: x=100 y=60 w=600 h=400
No penalty areas — just small goal areas:
  Left goal area: x=100 y=155 w=60 h=110
  Right goal area: x=640 y=155 w=60 h=110
Goals:
  Left:  x=85  y=200 w=15 h=120
  Right: x=700 y=200 w=15 h=120
Centre circle: r=50
```

---

## Futsal Pitch

Rectangular with rounded corners, penalty spots only (no arcs):
```
Outer: x=20 y=10 w=760 h=500 rx=10
Centre line: x=400
Centre circle: r=50
Penalty spots: cx=100 cy=260 and cx=700 cy=260
No penalty areas — just 6m zone marks
Goal areas: x=20 y=210 w=50 h=100 and x=730 y=210 w=50 h=100
Goals: x=5 y=225 w=15 h=70 and x=780 y=225 w=15 h=70
```

---

## Thirds Zones

Overlay the full pitch with three horizontal zone bands:
```js
const thirds = [
  { x: 20, y: 10, w: 253, label: 'Defensive Third', color: 'rgba(239,68,68,0.12)' },
  { x: 273, y: 10, w: 254, label: 'Middle Third', color: 'rgba(234,179,8,0.12)' },
  { x: 527, y: 10, w: 253, label: 'Attacking Third', color: 'rgba(34,197,94,0.12)' },
]
```
Render behind pitch markings, with zone label as vertical text centered in each band.

---

## Custom Dimensions

Allow user to input width/height as meters. Map to canvas:
```js
const scaleX = (meters) => (meters / pitchWidthMeters) * 760 + 20
const scaleY = (meters) => (meters / pitchHeightMeters) * 500 + 10
```
Standard pitch: 105m × 68m. Show a "pitch size" input in settings.
