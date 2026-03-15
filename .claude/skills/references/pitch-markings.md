# Session Data Schema

Full JSON structure for saving, loading, and sharing sessions.

---

## Top-Level Session Object

```json
{
  "id": "uuid-v4",
  "version": "1.0",
  "meta": {
    "title": "Pressing Trigger Practice",
    "author": "Coach Smith",
    "club": "FC Example",
    "created": "2026-03-11T10:00:00Z",
    "updated": "2026-03-11T12:30:00Z",
    "tags": ["pressing", "defending", "u16"],
    "category": "pressing-defending",
    "skillLevel": "intermediate",
    "language": "en"
  },
  "screens": [ /* ScreenObject[] */ ]
}
```

---

## Screen Object

```json
{
  "id": "uuid-v4",
  "name": "Phase 1 — Initial Shape",
  "pitchType": "full | half-attack | half-defend | small-sided | futsal | thirds",
  "pitchColor": "#2d8a4e",
  "players": [ /* PlayerObject[] */ ],
  "arrows": [ /* ArrowObject[] */ ],
  "zones": [ /* ZoneObject[] */ ],
  "ball": { "x": 400, "y": 260 },
  "scribbles": [ /* ScribbleObject[] */ ],
  "notes": { /* NotesObject */ }
}
```

---

## Player Object

```json
{
  "id": "uuid-v4",
  "x": 200,
  "y": 180,
  "type": "team-a | team-b | gk-a | gk-b | referee",
  "number": 9,
  "name": "Striker",
  "kitColor": "#1a56db",
  "kitColorSecondary": "#ffffff"
}
```

---

## Arrow Object

```json
{
  "id": "uuid-v4",
  "style": "pass | run | dribble",
  "x1": 200, "y1": 180,
  "x2": 400, "y2": 260,
  "curved": false,
  "controlX": 300,
  "controlY": 130,
  "color": "#facc15",
  "dashed": false
}
```

---

## Zone Object

```json
{
  "id": "uuid-v4",
  "x": 150,
  "y": 100,
  "width": 200,
  "height": 150,
  "color": "#facc15",
  "opacity": 0.25,
  "label": "Press Here"
}
```

---

## Scribble Object

```json
{
  "id": "uuid-v4",
  "path": "M 100 100 L 120 130 L 145 120...",
  "color": "#ffffff",
  "strokeWidth": 2
}
```

---

## Notes Object

```json
{
  "organisation": "8v8 on a 60x40 pitch. 2 teams of 8. Mannequins used as triggers in middle third.",
  "objective": "Develop coordinated pressing triggers from a mid-block shape.",
  "instructions": "Team A starts in 4-4 mid-block. Ball is played to the wide player (trigger). On the trigger, Team A presses as a unit...",
  "progressions": [
    "Start with walking pace — coach dictates trigger",
    "Progress to jogging — players identify trigger themselves",
    "Full speed — add a 3rd team waiting to come on"
  ],
  "keyIdeas": [
    "Press on the back foot",
    "Cover shadow the central midfield",
    "Compact shape — no gaps between lines"
  ],
  "defendingPoints": [
    "Identify the trigger early",
    "First defender sets the press angle",
    "Second defender cuts off the return pass"
  ],
  "attackingPoints": [
    "Play quickly to switch the press",
    "Use the goalkeeper as an outlet",
    "Third man runs in behind the press"
  ],
  "scoring": "1 point for winning the ball in the pressing zone. 2 points for scoring after winning it."
}
```

---

## Local Storage Key Conventions

```
fsp_sessions         → array of session metadata (id, title, updated, tags)
fsp_session_{id}     → full session JSON
fsp_settings         → user preferences (kit colors, default pitch, language)
fsp_draft            → autosave of unsaved current session
```

---

## Export Formats

| Format | Content | Use |
|---|---|---|
| `.fsp` (JSON) | Full session JSON | Save/load in app |
| `.png` | Pitch canvas screenshot | Share on WhatsApp, print |
| `.pdf` | Multi-screen layout + notes | Full session document |
| Share URL | `?session={base64}` | Quick share without login |
