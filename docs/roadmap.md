# Football Session Planner - Feature Expansion Plan

**Status**: Roadmap for future phases
**Current MVP State**: Phase 0 complete (Dashboard, Sessions, Drills, Templates, Teams, Attendance, Tactical Board, Calendar, Settings)

---

## Build Strategy

- Build in phases, not all at once
- Each phase integrates cleanly with existing modules
- Preserve minimal but descriptive UX philosophy
- New features must not clutter Session Builder by default
- Use progressive disclosure for advanced workflows
- All features must be SaaS-ready and role-aware

---

## Phase 1: Operational Planning Expansion
**Goal**: Extend from session planner into weekly coaching workflow platform
**Priority**: Highest

### 1. Weekly Planner / Microcycle View
**Status**: Missing - add next
**Why**: Product is strong at individual sessions but needs broader weekly planning layer

**Requirements**:
- Display sessions by day in weekly calendar layout
- Drag-and-drop session movement between days
- Team assignment and session theme labels
- Quick session creation from templates
- Open any scheduled session in Session Builder
- Show total weekly training load (lightweight)
- Filter by team and age group
- Day notes and session themes (recovery, technical, tactical, match prep)

**Cannot**:
- Replace detailed Session Builder
- Become dense analytics page
- Require complex setup

---

### 2. Session Reflection and Review
**Status**: Missing - add next
**Why**: Plans sessions well but doesn't capture what happened after training

**Requirements**:
- Store post-session notes
- Record whether objectives were met
- Capture perceived intensity
- Record attendance observations
- Log what worked / didn't work
- Next-session considerations
- Searchable reflections

**Cannot**:
- Replace formal player reporting
- Require full reflection before closing session

---

### 3. Multi-Channel Session Sharing
**Status**: Missing - add next
**Why**: Export is useful but distribution workflows too limited

**Requirements**:
- Secure web link sharing
- QR code generation
- Email-ready share mode
- Mobile-friendly share page
- Permission-aware modes (internal staff view, presentation-only)
- Clean printable PDF

**Cannot**:
- Expose private data publicly without permissions
- Turn into chat or social-sharing system

---

### 4. Multiple Export Formats
**Status**: Missing - add next
**Why**: Different coaching contexts need different output formats

**Requirements**:
- Coach print view
- Presentation/staff view
- Simplified player-facing session sheet
- Clean A4 print formatting
- Include tactical diagrams when selected
- Configurable per session

**Cannot**:
- Force all formats to contain same detail level

---

## Phase 2: Reusable Knowledge and Club Workflow Expansion
**Goal**: Expand from solo use into repeatable club/academy workflows
**Priority**: High

### 1. Drill Packs and Session Packs
**Status**: Add after Phase 1
**Why**: Templates handle single sessions, but lacks bundled reusable collections

**Requirements**:
- Bundle multiple drills into packs
- Bundle multiple sessions into packs
- Examples: "U13 pressing week", "matchday minus one", "preseason fitness block"
- Categorize by age group, level, theme, season phase
- Apply packs into weekly planning or templates

**Cannot**:
- Replace individual drill/session editing
- Carry attendance records into packs

---

### 2. Season / Curriculum Planner
**Status**: Add after Phase 1
**Why**: Needs longer planning horizon beyond weekly scheduling

**Requirements**:
- Plan by phase, theme, month, or season block
- Map sessions, templates, or packs into curriculum structure
- Structure content by training themes
- Age-group-specific methodology blocks
- Long-term planning timeline view

**Cannot**:
- Replace weekly planner
- Force all users into long-term planning complexity

---

### 3. Shared Club Libraries
**Status**: Add after Phase 1
**Why**: SaaS-oriented but too individual-user focused

**Requirements**:
- Club-approved drills, templates, packs
- Club or academy admin maintenance
- Permission-aware access
- Distinction between personal and club content
- Reuse shared content across teams

**Cannot**:
- Mix personal and club content without visibility controls
- Allow uncontrolled editing of club content by all users

---

### 4. Roles and Permissions
**Status**: Add after Phase 1
**Why**: Shared workflows need controlled access

**Requirements**:
- Minimum roles: owner/admin, head coach, assistant coach, viewer
- Control access to teams, sessions, libraries, sharing, club content
- Explicit and scalable permission model

**Cannot**:
- Create overly complex enterprise permissions in first version

---

### 5. Club Methodology / Coaching Model Layer
**Status**: Add after Phase 1
**Why**: Academies/pro need standardized planning language and principles

**Requirements**:
- Define coaching principles
- Define approved session structures
- Define age-group methodology
- Define approved tags and categories
- Surface methodology guidance in planning workflows

**Cannot**:
- Make planner feel rigid for solo users

---

## Phase 3: Communication, Insight, and Premium Expansion
**Goal**: Strong differentiators and premium workflows after stable planning core
**Priority**: Medium

### 1. Video Attachments to Drills and Sessions
**Status**: Add later
**Why**: Video-linked coaching context is valuable but comes after stable planning

**Requirements**:
- Attach video clips or links to drills
- Attach to sessions, reflections, tactical items
- Show video context on detail views

**Cannot**:
- Become full tactical video analysis platform
- Require complex editing workflows

---

### 2. Lightweight Usage Insights
**Status**: Add later
**Why**: Help coaches reuse content intelligently

**Requirements**:
- Most-used drills and templates
- Recent session themes
- Underused content highlights
- Planning activity by age group or team
- Actionable and lightweight (not dashboard-heavy)

**Cannot**:
- Become deep BI analytics module in this phase

---

### 3. Matchday Documents and Set-Play Sheets
**Status**: Add later
**Why**: Strong adjacent workflow extending planner into real operations

**Requirements**:
- Printable/shareable lineup sheets
- Set-play sheets
- Staff planning documents
- Reuse tactical board visuals
- Distinct from training-session builder

**Cannot**:
- Replace session planning workflows
- Turn into live match management yet

---

### 4. Shared Content Review Tracking and Feedback
**Status**: Add later
**Why**: Valuable for clubs where staff distribute plans and want visibility

**Requirements**:
- Track whether staff viewed shared plan
- Collect internal comments or light feedback
- Show review status on shared content
- Staff-focused, not social

**Cannot**:
- Become public commenting platform
- Force review workflows for solo users

---

### 5. Billing and Subscription Scaffolding
**Status**: Add later
**Why**: SaaS product needs proper account/product scaffolding

**Requirements**:
- Subscription entities
- Organization-aware product access
- Feature gating support
- Plan-aware permissions
- Architecture ready for billing UI integration

**Cannot**:
- Interrupt coaching workflow with billing complexity during core use

---

## Integration Expectations

### Data Model
- Connect cleanly to existing session, drill, template, team, attendance, user models
- Club features must support multi-tenant SaaS architecture
- Permissions considered before building shared workflows
- Future AI and billing hooks anticipated but not forced into early UX

### UI
- Do not overcrowd Session Builder
- Use separate modules, tabs, drawers, or linked detail pages
- Weekly planner and season planner separate but connected
- Reflections on session detail/history, not blocking creation
- Club libraries and methodology visible only where relevant

### Delivery
- Complete Phase 1 before Phase 2
- Complete core shared-content architecture before heavy club features
- Treat Phase 3 as premium expansion after stable planning core

---

## Implementation Order

1. **Phase 1 (Next)**: Weekly Planner, Reflections, Sharing, Export Formats
2. **Phase 2 (After Phase 1)**: Packs, Season Planner, Club Libraries, Roles, Methodology
3. **Phase 3 (Premium)**: Video, Insights, Matchday Docs, Review Tracking, Billing

**Current Status**: MVP deployed, Phase 1 ready to begin when prioritized
