# Football Session Planner - Feature Expansion Plan

**Status**: Roadmap for future phases
**Current MVP State**: Phase 0 complete (Dashboard, Sessions, Drills, Templates, Teams, Attendance, Tactical Board, Calendar, Settings)

---

## Build Strategy

- **Build in phases, not all at once**
- **Each step fits within a single Claude session** (small, incremental changes)
- Each phase integrates cleanly with existing modules
- Preserve minimal but descriptive UX philosophy
- New features must not clutter Session Builder by default
- Use progressive disclosure for advanced workflows
- All features must be SaaS-ready and role-aware

---

## Phase 0.5: Quick Data Model Enhancements
**Goal**: Add professional-grade coaching fields without disrupting existing workflows
**Priority**: Highest (before Phase 1 UI features)
**Implementation**: One migration per feature, each can be done in a single session

### 1. Enhanced Coaching Points Structure
**Single-session task**: Add attacking/defending coaching points fields
**Implementation**:
- Migration: Add `attacking_coaching_points` and `defending_coaching_points` TEXT[] to `drills` and `session_blocks`
- Keep existing `coaching_points` field for backward compatibility
- No UI changes yet (Phase 1)

### 2. Progressions Field
**Single-session task**: Add progressions tracking
**Implementation**:
- Migration: Add `progressions` JSONB[] to `drills` and `session_blocks`
- Structure: `[{ title, description, difficulty_level }]`
- No UI changes yet (Phase 1)

### 3. Key Ideas Field
**Single-session task**: Add key coaching ideas
**Implementation**:
- Migration: Add `key_ideas` TEXT[] to `drills` and `session_blocks`
- No UI changes yet (Phase 1)

### 4. Scoring Rules Field
**Single-session task**: Add constraint-based scoring
**Implementation**:
- Migration: Add `scoring_rules` TEXT to `drills` and `session_blocks`
- No UI changes yet (Phase 1)

### 5. Session Graphic Storage
**Single-session task**: Add graphic capture URLs
**Implementation**:
- Migration: Add `graphic_url` TEXT to `sessions` and `drills`
- Stores URL to captured tactical board image
- No UI changes yet (Phase 1)

### 6. Session in Action Media
**Single-session task**: Add media attachments for real sessions
**Implementation**:
- Migration: Add `session_media` JSONB[] to `sessions`
- Structure: `[{ type, url, caption, timestamp }]`
- No UI changes yet (Phase 3)

---

## Phase 1: Enhanced Coaching Workflows
**Goal**: Surface new data fields and add operational planning features
**Priority**: Highest
**Implementation**: Each feature is 1-2 sessions max

### 1A. Enhanced Coaching Points UI
**Single-session tasks** (do separately):
- **Task 1**: Add tabs to drill form (General / Attacking / Defending) for coaching points
- **Task 2**: Add tabs to block editor for coaching points
- **Task 3**: Show attacking/defending points in drill/session detail views

### 1B. Progressions UI
**Single-session tasks**:
- **Task 1**: Add progressions section to drill form with add/remove buttons
- **Task 2**: Add progressions section to block editor
- **Task 3**: Display progressions in drill/session detail views with difficulty indicators

### 1C. Key Ideas & Scoring Rules UI
**Single-session tasks**:
- **Task 1**: Add "Key Ideas" multi-input field to drill/block editors
- **Task 2**: Add "Scoring Rules" textarea to drill/block editors
- **Task 3**: Display in detail views with clear formatting

### 1D. Session Graphic Capture
**Single-session tasks**:
- **Task 1**: Add "Capture Diagram" button to tactical board in session blocks
- **Task 2**: Generate PNG from SVG canvas and upload to Supabase Storage
- **Task 3**: Display captured graphic in session detail and export views

### 1E. Weekly Planner / Microcycle View
**Multi-session feature** (break into 4 tasks):
- **Task 1**: Create `/weekly-planner` route with weekly calendar layout (dates + day headers)
- **Task 2**: Load and display existing sessions on their scheduled dates
- **Task 3**: Add drag-and-drop to move sessions between days (update `session_date`)
- **Task 4**: Add "Create Session" button per day slot, team filter, and session theme badges

### 1F. Session Reflection and Review
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Migration - add `reflections` JSONB to `sessions` table
- **Task 2**: Add "Reflection" tab to session detail page with form (post-session notes, objectives met, intensity, observations)
- **Task 3**: Make reflections searchable from sessions list page

### 1G. Account Activation Flow
**Single-session tasks**:
- **Task 1**: Enable Supabase email confirmation in auth settings (no code, just config)
- **Task 2**: Add "Resend Verification Email" button to login page if email not confirmed
- **Task 3**: Show "Check your email" message after signup

### 1H. Multi-Channel Session Sharing
**Multi-session feature** (break into 4 tasks):
- **Task 1**: Create `/share/[token]` route that displays read-only session view
- **Task 2**: Add "Generate Share Link" button to session detail, store token in `session_shares` table
- **Task 3**: Add QR code generation using `qrcode` npm package
- **Task 4**: Add permission toggle (internal staff / presentation-only / public)

### 1I. Multiple Export Formats
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Install `jspdf` and `html2canvas`, create basic PDF export function
- **Task 2**: Add export mode selector (Coach Print / Staff Presentation / Player Sheet)
- **Task 3**: Implement 3 PDF templates with different layouts

---

## Phase 2: Club Workflows and Interactive Modes
**Goal**: Add reusable content systems and professional club features
**Priority**: High
**Implementation**: Each sub-task is 1-2 sessions

### 2A. View Mode Switcher
**Single-session tasks**:
- **Task 1**: Add view mode toggle to session detail page (Static / Interactive / Edit)
- **Task 2**: Static mode: render read-only session with no interactions
- **Task 3**: Interactive mode: allow diagram playback and animation controls

### 2B. Phase of Play Coaching Patterns
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Migration - add `phase_of_play` enum to `drills` (build_up, progression, finishing, transition_attack, transition_defend, set_piece)
- **Task 2**: Add phase of play selector to drill form
- **Task 3**: Filter drills by phase of play in drill library

### 2C. Drill Packs and Session Packs
**Multi-session feature** (break into 5 tasks):
- **Task 1**: Migration - create `content_packs` table (type, title, description, items JSONB[], age_group, theme)
- **Task 2**: Create `/packs` route with list view
- **Task 3**: Add "Create Pack" form that lets user select multiple drills or sessions
- **Task 4**: Add "Use Pack" button that inserts all pack items into weekly planner or session builder
- **Task 5**: Add pack filters (age group, theme, season phase)

### 2D. Season / Curriculum Planner
**Multi-session feature** (break into 4 tasks):
- **Task 1**: Migration - create `curriculum_blocks` table (phase, theme, month, year, items JSONB[])
- **Task 2**: Create `/season-planner` route with timeline view
- **Task 3**: Add drag-and-drop to assign sessions/packs to curriculum blocks
- **Task 4**: Add phase/theme selectors and long-term view controls

### 2E. Shared Club Libraries
**Multi-session feature** (break into 4 tasks):
- **Task 1**: Migration - add `organization_id` to `drills`, `session_templates`, `content_packs`
- **Task 2**: Migration - add `is_club_approved` boolean to those tables
- **Task 3**: Add "Club Library" tab to drills/templates/packs pages showing organization-wide content
- **Task 4**: Add admin controls to mark content as club-approved

### 2F. Roles and Permissions
**Multi-session feature** (break into 5 tasks):
- **Task 1**: Migration - create `organization_members` table (organization_id, user_id, role enum)
- **Task 2**: Add organization creation flow (invite-only initially)
- **Task 3**: Implement role-based RLS policies (owner, head_coach, assistant_coach, viewer)
- **Task 4**: Add permission checks to UI (hide/show actions based on role)
- **Task 5**: Add organization settings page for role management

### 2G. Club Methodology Layer
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Migration - create `organization_methodology` table (coaching_principles JSONB, session_structures JSONB, approved_tags TEXT[])
- **Task 2**: Create `/settings/methodology` page for organization admins
- **Task 3**: Surface methodology guidance in session builder (suggested structures, approved tags dropdowns)

---

## Phase 3: Premium Features and Platform Polish
**Goal**: Video, insights, matchday workflows, and SaaS readiness
**Priority**: Medium
**Implementation**: Each sub-task is 1-2 sessions

### 3A. Session in Action Media Gallery
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Add "Session Media" tab to session detail page
- **Task 2**: File upload component for images/videos (store in Supabase Storage)
- **Task 3**: Display media gallery with captions and timestamps

### 3B. Video Attachments to Drills
**Multi-session feature** (break into 2 tasks):
- **Task 1**: Add video URL field to drill form (YouTube, Vimeo embeds)
- **Task 2**: Display embedded video player in drill detail view

### 3C. Multilingual Interface (i18n)
**Multi-session feature** (break into 4 tasks):
- **Task 1**: Install `next-intl`, configure supported locales (en, es, fr, de, pt)
- **Task 2**: Extract all UI strings to translation JSON files
- **Task 3**: Add language selector to app shell
- **Task 4**: Translate 5 core modules (sessions, drills, teams, calendar, settings)

### 3D. Lightweight Usage Insights
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Create `/insights` route with "Most Used Drills" and "Recent Themes" views
- **Task 2**: Add SQL queries for usage stats (GROUP BY, COUNT, ORDER BY)
- **Task 3**: Display underused content suggestions and usage by age group

### 3E. Matchday Documents
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Create `/matchday` route with document type selector (lineup, set-plays, staff notes)
- **Task 2**: Add lineup sheet builder (team formation + player names)
- **Task 3**: Add set-play sheet with tactical board diagrams and PDF export

### 3F. Review Tracking and Feedback
**Multi-session feature** (break into 3 tasks):
- **Task 1**: Migration - create `content_reviews` table (content_id, user_id, viewed_at, feedback TEXT)
- **Task 2**: Add "Mark as Reviewed" button to shared session views
- **Task 3**: Show review status on session detail for content owners

### 3G. Billing and Subscription Scaffolding
**Multi-session feature** (break into 4 tasks):
- **Task 1**: Migration - create `subscriptions` table (organization_id, plan_tier, status, stripe_subscription_id)
- **Task 2**: Create `/settings/billing` page with plan display
- **Task 3**: Add feature gating middleware (check plan tier before allowing access)
- **Task 4**: Integrate Stripe Checkout for plan upgrades (sandbox mode)

---

## Integration Expectations

### Data Model
- All migrations are **additive** (never break existing features)
- Each new field is **nullable** initially for backward compatibility
- Connect cleanly to existing session, drill, template, team, attendance, user models
- Club features support multi-tenant SaaS architecture
- Permissions considered before building shared workflows

### UI
- Do not overcrowd Session Builder with all new fields at once
- Use **tabs, accordions, and progressive disclosure** for advanced fields
- Weekly planner and season planner are **separate routes**, not tabs in session builder
- Reflections live on session detail/history, **not blocking creation**
- Club libraries visible only when user is part of an organization

### Implementation Size
- **1 task = 1 Claude session max**
- If a feature has 5+ tasks, it's a multi-session feature
- Complete all tasks in a feature before moving to the next feature
- Test after each task to ensure no regressions

---

## Delivery Strategy

### Phase 0.5: Foundation (6 migrations, can be done in 1-2 sessions total)
1. Enhanced coaching points
2. Progressions
3. Key ideas
4. Scoring rules
5. Session graphic storage
6. Session in action media

### Phase 1: Core Workflows (9 features, ~25-30 sessions)
Complete in order:
1. Enhanced Coaching Points UI → Progressions UI → Key Ideas/Scoring UI (data field UIs first)
2. Session Graphic Capture (integrates with tactical board)
3. Weekly Planner (high-value operational feature)
4. Session Reflections (post-session workflow)
5. Account Activation (quick auth improvement)
6. Multi-Channel Sharing (distribution workflow)
7. Multiple Export Formats (PDF generation)

### Phase 2: Club Features (7 features, ~30-35 sessions)
Complete in order:
1. View Mode Switcher (quick UI improvement)
2. Phase of Play Coaching (drill categorization)
3. Drill/Session Packs (reusable bundles)
4. Season Planner (long-term planning)
5. Shared Club Libraries (multi-tenant content)
6. Roles & Permissions (access control)
7. Club Methodology (organization standards)

### Phase 3: Premium & Polish (7 features, ~25-30 sessions)
Complete in order:
1. Session in Action Media (visual enhancement)
2. Video Attachments (coaching context)
3. Multilingual Interface (internationalization)
4. Usage Insights (lightweight analytics)
5. Matchday Documents (adjacent workflow)
6. Review Tracking (collaboration feedback)
7. Billing Scaffolding (SaaS infrastructure)

---

## Current Status

**Phase 0 (MVP)**: ✅ Complete and deployed
**Phase 0.5 (Data Model)**: 🔄 Ready to begin
**Phase 1 (Core Workflows)**: 📋 Planned
**Phase 2 (Club Features)**: 📋 Planned
**Phase 3 (Premium)**: 📋 Planned

**Total estimated sessions**: 80-100 (across all 3 phases)
**Each session**: Small, incremental, testable change
