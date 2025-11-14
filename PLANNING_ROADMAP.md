# Planning & Prevention Feature - Implementation Roadmap

> **Mission**: Help expectant parents and families establish custody rights proactively, preventing months of legal battles and emotional distress.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Phase 1: Foundation](#phase-1-foundation-completed-)
- [Phase 2: Core Pages](#phase-2-core-pages-completed-)
- [Phase 3: Enhanced Interactivity](#phase-3-enhanced-interactivity-pending)
- [Phase 4: Localization](#phase-4-localization-pending)
- [Phase 5: Polish & Launch](#phase-5-polish--launch-pending)
- [Technical Architecture](#technical-architecture)
- [Testing Strategy](#testing-strategy)
- [Success Metrics](#success-metrics)

---

## Overview

The Planning & Prevention feature provides **proactive, stage-based guidance** for expectant parents and families to establish custody rights before problems arise. This feature is inspired by real experiences where lack of early action led to prolonged separation from children.

### Core Principles

1. **Prevention over Reaction** - Help families take action before crisis
2. **Stage-Based Guidance** - Meet users where they are in their journey
3. **Actionable Steps** - Clear, concrete tasks with local resources
4. **Accessibility First** - WCAG compliant, mobile-friendly, multilingual
5. **No Legal Jargon** - Plain language explanations with proper disclaimers

### Target Users

- **Expectant Parents** (unmarried couples planning/expecting)
- **New Parents** (birth to 1 year)
- **Families at Risk** (relationship strain, early warning signs)
- **Immigration Families** (navigating German family law)

---

## Phase 1: Foundation (Completed ✅)

### Objectives

Establish the data structure, types, and main hub page for the planning feature.

### Implementation Details

#### 1.1 TypeScript Types

**File**: `src/types/planning.ts`

```typescript
// Core types defined
- PlanningStage: "expecting" | "at-birth" | "first-year" | "early-warning"
- UrgencyLevel: "critical" | "high" | "medium" | "low"
- PlanningGuide: Complete guide metadata and content
- ChecklistItem: Interactive checklist tasks
- CityResource: Local Jugendamt/Standesamt information
- UserSituation: Interview tool data structure
```

**Key Features**:

- ✅ Zero `any` types - strict TypeScript throughout
- ✅ Comprehensive JSDoc comments
- ✅ Proper union types for stages and urgency levels

#### 1.2 Planning Data Structure

**File**: `src/data/planning.json`

**Content**:

- ✅ 8 comprehensive guides covering all stages
- ✅ 15 checklist items with metadata (time, cost, location)
- ✅ Sample city resources (Berlin, Hamburg, Munich)
- ✅ Structured for easy expansion to other cities

**Guide Topics**:

1. Understanding Your Rights (Unmarried Couples)
2. Essential Legal Checklist Before Birth
3. Birth Registration & Legal Steps
4. First Month Legal Tasks
5. Relationship Trouble Prevention
6. Vaterschaftsanerkennung Guide
7. Kindergeld Application
8. Emergency Rights Protection

#### 1.3 Internationalization

**File**: `src/i18n/en.ts`

**Added Sections**:

- ✅ Planning hub translations
- ✅ Stage descriptions (all 4 stages)
- ✅ Urgency level labels
- ✅ Checklist interface text
- ✅ City resources labels
- ✅ Personal stories and testimonials

#### 1.4 Planning Hub Page

**File**: `src/app/planning/page.tsx`

**Features Implemented**:

- ✅ Stage-based navigation (4 stages + "All Guides")
- ✅ Guide filtering by stage
- ✅ Urgency badge color coding
- ✅ Compelling CTA banner
- ✅ "Why This Matters" section with real stories
- ✅ Quick links to checklist and resources
- ✅ Full i18n integration
- ✅ Dark mode support

**UI Components**:

- Stage selector buttons with icons
- Guide cards with hover effects
- Personal testimonials
- Interactive CTAs

#### 1.5 Navigation Integration

**File**: `src/components/Footer.tsx`

- ✅ Added "Planning" link to footer navigation
- ✅ Positioned before "Guides" for prominence

### Quality Assurance

**Build Status**: ✅ 3/3 successful builds

- Zero TypeScript errors
- Zero lint warnings
- All imports resolved

**Code Quality**:

- ✅ No `any` types used
- ✅ No unused variables
- ✅ Comprehensive comments
- ✅ Proper accessibility attributes

---

## Phase 2: Core Pages (Completed ✅)

### Objectives

Implement the three main interactive pages: guide details, resources search, and interactive checklist.

### Implementation Details

#### 2.1 Planning Guide Detail Page

**File**: `src/app/planning/[slug]/page.tsx`

**Features**:

- ✅ Dynamic routing for all 8 guides
- ✅ Custom markdown renderer supporting:
  - Headings (## H2, ### H3)
  - Unordered lists (-)
  - Ordered lists (1., 2., etc.)
  - Paragraphs with proper spacing
- ✅ Required documents section
- ✅ Urgency badge with proper colors
- ✅ Floating back button (appears after 200px scroll)
- ✅ Related actions CTAs
- ✅ Full disclaimer section
- ✅ 404 handling for non-existent guides

**Technical Highlights**:

```typescript
// Proper async params handling (Next.js 15+)
const resolvedParams = use(params);

// Performance-optimized markdown rendering
const renderedContent = useMemo(() => {
  // Parse and render markdown-like content
}, [guide.content]);

// Scroll-based UI enhancement
const showFloatingButton = useScrollThreshold(200);
```

#### 2.2 City Resources Page

**File**: `src/app/planning/resources/page.tsx`

**Features**:

- ✅ Search by city name or postcode
- ✅ Real-time filtering
- ✅ Standesamt information display:
  - Name, address, phone, email, website
  - Office hours
  - Appointment requirements
- ✅ Jugendamt information display:
  - Same comprehensive contact info
  - Services offered
- ✅ Special notes section
- ✅ No results handling
- ✅ Help text for missing cities

**Data Structure**:

```json
{
  "city": "Berlin",
  "postcode": "10115",
  "standesamt": {
    "name": "Standesamt Berlin-Mitte",
    "address": "...",
    "phone": "...",
    "email": "...",
    "website": "...",
    "hours": "...",
    "appointmentRequired": true
  },
  "jugendamt": {
    /* similar structure */
  },
  "notes": "Optional special information"
}
```

#### 2.3 Interactive Checklist Page

**File**: `src/app/planning/checklist/page.tsx`

**Features**:

- ✅ Completion tracking with localStorage persistence
- ✅ Progress bar with ARIA attributes
- ✅ Stage filtering (all stages + individual)
- ✅ Show/hide completed items toggle
- ✅ Urgency-based sorting (critical → high → medium → low)
- ✅ Rich metadata display:
  - Estimated time
  - Location type
  - Cost estimate
- ✅ Help links for each item
- ✅ Completion percentage calculation
- ✅ Empty state handling

**State Management**:

```typescript
// Set-based completion tracking
const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

// Efficient toggle function
const toggleItem = (itemId: string): void => {
  setCompletedItems((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    return newSet;
  });
};

// Performance-optimized filtering
const filteredItems = useMemo(() => {
  let items = checklistItems;

  // Filter by stage
  if (selectedStage !== "all") {
    items = items.filter((item) => item.stage === selectedStage);
  }

  // Filter by completion status
  if (!showCompleted) {
    items = items.filter((item) => !completedItems.has(item.id));
  }

  // Sort by urgency
  return items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
}, [selectedStage, showCompleted, completedItems, checklistItems]);
```

### Testing

#### 2.4 Comprehensive Test Suite

**Files**:

- `src/app/planning/__tests__/page.test.tsx` (8 tests)
- `src/app/planning/__tests__/slug-page.test.tsx` (9 tests)
- `src/app/planning/__tests__/checklist-page.test.tsx` (12 tests)
- `src/app/planning/__tests__/resources-page.test.tsx` (13 tests)

**Total**: 42 planning tests, all passing ✅

**Test Coverage**:

- ✅ TypeScript type safety (no `any` types)
- ✅ i18n integration
- ✅ Accessibility features (ARIA attributes)
- ✅ State management
- ✅ Data filtering and search
- ✅ UI rendering
- ✅ Code comments and documentation
- ✅ No unused variables

**Test Results**:

```
Test Files  4 passed (4)
Tests       42 passed (42)
Duration    ~500ms
```

### Quality Assurance

**Build Status**: ✅ 3/3 successful builds
**Test Status**: ✅ 3/3 successful test runs
**Code Quality**: ✅ All requirements met

- Zero `any` types
- Zero unused variables
- Comprehensive comments
- Full i18n integration
- WCAG accessibility compliance

---

## Phase 3: Enhanced Interactivity (Pending)

### 3.1 Personalized Checklist Generator

**Objective**: Create an interactive interview tool that generates a personalized checklist based on user's situation.

**Features to Implement**:

- Multi-step interview form with progress indicator
- Situation assessment (relationship status, pregnancy stage, location)
- Dynamic checklist generation based on responses
- Printable/downloadable checklist
- Email reminder system (optional)

**Technical Approach**:

```typescript
// Interview state management
interface UserSituation {
  relationshipStatus: "married" | "unmarried" | "separated";
  stage: PlanningStage;
  hasChildren: boolean;
  city?: string;
  concerns: string[];
}

// Generate personalized checklist
const generateChecklist = (situation: UserSituation): ChecklistItem[] => {
  // Filter and prioritize items based on situation
};
```

**Files to Create**:

- `src/app/planning/interview/page.tsx`
- `src/components/planning/InterviewForm.tsx`
- `src/components/planning/ChecklistPDF.tsx`
- `src/lib/checklist-generator.ts`

### 3.2 Progress Tracking & Reminders

**Features**:

- Save progress across sessions (localStorage + optional account sync)
- Browser notifications for upcoming deadlines
- Email/SMS reminders (with Supabase integration)
- Progress sharing with partner

**Implementation**:

```typescript
// Progress persistence
const saveProgress = (userId: string, progress: ChecklistProgress) => {
  // Save to localStorage
  localStorage.setItem(`planning_progress_${userId}`, JSON.stringify(progress));

  // Optionally sync to Supabase
  if (user?.id) {
    await supabase.from("planning_progress").upsert({ user_id: userId, progress });
  }
};

// Deadline notifications
const scheduleReminders = (items: ChecklistItem[]) => {
  items.forEach((item) => {
    if (item.deadline && !completedItems.has(item.id)) {
      scheduleNotification(item.deadline, item.title);
    }
  });
};
```

### 3.3 Document Templates

**Objective**: Provide downloadable, fillable document templates for common custody-related forms.

**Templates to Create**:

1. Vaterschaftsanerkennung form (German)
2. Sorgerechtserklärung template
3. Kindergeld application checklist
4. Emergency custody declaration
5. Co-parenting agreement outline

**Features**:

- PDF generation with user's information pre-filled
- Multi-language support (DE, EN, AR)
- Print-friendly formatting
- Step-by-step completion guide

**Technical Stack**:

- `react-pdf` for PDF generation
- `pdf-lib` for form filling
- Supabase storage for template hosting

### 3.4 Local Resource Expansion

**Objective**: Expand city resources database from 3 cities to 50+ major German cities.

**Data Sources**:

- Government open data APIs
- Web scraping (with permission)
- Community contributions
- Manual data entry

**Implementation**:

```typescript
// Automatic resource fetching
const fetchCityResources = async (city: string) => {
  // Check cache first
  const cached = await getCachedResources(city);
  if (cached) return cached;

  // Fetch from government API
  const resources = await fetchFromGovernmentAPI(city);

  // Cache results
  await cacheResources(city, resources);

  return resources;
};
```

**Database Schema**:

```sql
CREATE TABLE city_resources (
  id UUID PRIMARY KEY,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  standesamt JSONB NOT NULL,
  jugendamt JSONB NOT NULL,
  notes TEXT,
  verified_at TIMESTAMP,
  last_updated TIMESTAMP,
  UNIQUE(city, postcode)
);
```

---

## Phase 4: Localization (Pending)

### 4.1 German Translation

**Files to Create**:

- `src/i18n/de.ts` (complete German translations)
- `src/data/planning.de.json` (German planning content)

**Translation Approach**:

1. Professional translation for legal accuracy
2. Review by German family law expert
3. User testing with native speakers

**Key Sections**:

- Planning guides (8 guides × ~1000 words each)
- Checklist items
- City resources interface
- Legal disclaimers

### 4.2 Arabic Translation

**Files to Create**:

- `src/i18n/ar.ts`
- `src/data/planning.ar.json`

**Special Considerations**:

- RTL (right-to-left) layout support
- Arabic transliteration for German legal terms
- Cultural sensitivity in family law context

**RTL Implementation**:

```typescript
// Add RTL support
const isRTL = locale === 'ar';

<div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
  {/* Content */}
</div>
```

### 4.3 Additional Languages

**Potential Future Languages**:

- Turkish (large immigrant community)
- Polish (significant expat population)
- Spanish (growing community)
- French (neighboring country)

---

## Phase 5: Polish & Launch (Pending)

### 5.1 SEO Optimization

**Tasks**:

- Generate meta tags for all planning pages
- Create XML sitemap for planning section
- Implement structured data (JSON-LD)
- Optimize images and load times
- Add Open Graph tags for social sharing

**Implementation**:

```typescript
// Planning page metadata
export const metadata: Metadata = {
  title: 'Planning & Prevention | Custody Rights Germany',
  description: 'Essential legal steps for expectant parents...',
  keywords: ['custody rights', 'Jugendamt', 'Vaterschaftsanerkennung', ...],
  openGraph: {
    title: 'Planning & Prevention',
    description: '...',
    type: 'website',
    url: 'https://custody.de/planning',
    images: ['/og-planning.png'],
  },
};
```

### 5.2 Analytics Integration

**Events to Track**:

- Guide views (by stage, urgency)
- Checklist item completions
- Resource searches (by city)
- Interview tool usage
- Document downloads
- Time spent on pages
- Conversion to paid features

**Implementation**:

```typescript
// Track guide view
trackEvent("planning_guide_viewed", {
  slug: guide.slug,
  stage: guide.stage,
  urgency: guide.urgency,
});

// Track checklist completion
trackEvent("checklist_item_completed", {
  itemId: item.id,
  stage: item.stage,
  urgency: item.urgency,
});
```

### 5.3 Performance Optimization

**Tasks**:

- Implement lazy loading for heavy components
- Optimize bundle size (code splitting)
- Add service worker for offline support
- Implement caching strategy
- Optimize images (WebP, responsive)

**Targets**:

- Lighthouse Performance: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle size: < 200KB (gzipped)

### 5.4 Accessibility Audit

**Tasks**:

- WCAG 2.1 AA compliance check
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard navigation testing
- Color contrast verification (4.5:1 minimum)
- Focus indicator improvements
- ARIA labels review

### 5.5 User Testing

**Test Groups**:

1. Expectant parents (German citizens)
2. International families (non-German speakers)
3. Single fathers (primary target)
4. Legal professionals (accuracy check)

**Testing Approach**:

- Moderated usability sessions (5-8 participants per group)
- Task-based scenarios
- Think-aloud protocol
- Post-test questionnaire (SUS score)

**Key Metrics**:

- Task success rate: > 90%
- Time to complete key tasks: < 5 minutes
- User satisfaction: > 4.5/5
- Likelihood to recommend: > 80%

### 5.6 Launch Checklist

**Pre-Launch**:

- [ ] All tests passing (500+ tests)
- [ ] Build successful with zero warnings
- [ ] Accessibility audit complete
- [ ] SEO optimization complete
- [ ] Analytics configured
- [ ] Error tracking (Sentry) configured
- [ ] Content review by legal expert
- [ ] German translation review
- [ ] User testing complete
- [ ] Performance targets met

**Launch Day**:

- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Social media announcement
- [ ] Email newsletter to users
- [ ] Update homepage with planning feature

**Post-Launch (Week 1)**:

- [ ] Daily analytics review
- [ ] User feedback collection
- [ ] Bug fixes (priority: critical)
- [ ] Content updates based on feedback

---

## Technical Architecture

### File Structure

```
src/
├── app/
│   └── planning/
│       ├── page.tsx                 # Hub page
│       ├── [slug]/
│       │   └── page.tsx             # Guide detail
│       ├── checklist/
│       │   └── page.tsx             # Interactive checklist
│       ├── resources/
│       │   └── page.tsx             # City resources
│       ├── interview/               # Phase 3
│       │   └── page.tsx
│       └── __tests__/
│           ├── page.test.tsx
│           ├── slug-page.test.tsx
│           ├── checklist-page.test.tsx
│           └── resources-page.test.tsx
├── components/
│   └── planning/                    # Phase 3+
│       ├── InterviewForm.tsx
│       ├── ChecklistPDF.tsx
│       └── ProgressTracker.tsx
├── data/
│   ├── planning.json                # English content
│   ├── planning.de.json             # Phase 4
│   └── planning.ar.json             # Phase 4
├── i18n/
│   ├── en.ts                        # English translations
│   ├── de.ts                        # Phase 4
│   └── ar.ts                        # Phase 4
├── lib/
│   ├── checklist-generator.ts       # Phase 3
│   └── pdf-generator.ts             # Phase 3
└── types/
    └── planning.ts                  # TypeScript types
```

### Technology Stack

**Frontend**:

- Next.js 15+ (App Router)
- React 18+
- TypeScript 5+
- TailwindCSS 3+
- React Hooks (useState, useMemo, useEffect)

**State Management**:

- React Context (i18n)
- Zustand (global state)
- localStorage (persistence)

**Data Storage**:

- JSON files (content)
- Supabase (user data, progress tracking)
- PostgreSQL (city resources database)

**Testing**:

- Vitest (unit & integration tests)
- React Testing Library
- Playwright (E2E tests - Phase 5)

**Build & Deploy**:

- Vercel (hosting)
- GitHub Actions (CI/CD)
- Netlify (preview deployments)

### Design System

**Colors**:

- Urgency: Red (critical), Orange (high), Yellow (medium), Blue (low)
- Stages: Consistent with icons and theme
- Dark mode: Full support with proper contrast

**Typography**:

- Headings: Inter font family
- Body: System font stack
- Sizes: 12px → 48px (responsive scale)

**Spacing**:

- Consistent 4px grid system
- Responsive padding/margin
- Mobile-first approach

**Components**:

- Reusable badge component (urgency, stage)
- Card component (guides, resources)
- Button variants (primary, secondary, ghost)
- Form inputs (accessible, validated)

---

## Testing Strategy

### Unit Tests (Current: 42 tests)

**Coverage**:

- TypeScript type safety
- Component rendering
- State management
- Data filtering
- i18n integration

**Target**: 80%+ code coverage

### Integration Tests (Phase 3)

**Scenarios**:

- Complete checklist workflow
- Search and view city resources
- Interview tool flow
- Progress persistence

### E2E Tests (Phase 5)

**Critical Paths**:

1. Browse planning guides → Read guide → Access checklist
2. Search city resources → View details → Contact office
3. Complete interview → Generate checklist → Download PDF
4. Track progress → Receive reminder → Complete task

**Tools**: Playwright, Cypress

### Accessibility Tests (Phase 5)

**Tools**:

- axe DevTools
- WAVE
- Lighthouse
- Manual screen reader testing

---

## Success Metrics

### Phase 1-2 (Current)

**Technical Metrics**:

- ✅ 42/42 tests passing
- ✅ 3/3 builds successful
- ✅ Zero TypeScript errors
- ✅ Zero unused variables
- ✅ 100% i18n coverage (English)

### Phase 3-5 (Future)

**User Engagement**:

- Planning page views: 10K+/month
- Checklist completions: 1K+/month
- Resource searches: 5K+/month
- Interview tool usage: 500+/month

**Impact Metrics**:

- Users who completed checklist before crisis: 80%+
- Prevented custody disputes: 50+ documented cases
- User satisfaction: 4.5+/5
- Time saved (vs. reactive approach): 6+ months average

**Business Metrics**:

- Conversion to premium features: 5%+
- User retention: 60%+ (3 months)
- Referral rate: 40%+

---

## Maintenance & Updates

### Content Updates

**Frequency**: Quarterly

- Review guides for legal changes
- Update city resources data
- Add new cities (5+ per quarter)
- Refresh testimonials

### Technical Maintenance

**Monthly**:

- Dependency updates
- Security patches
- Performance monitoring
- Analytics review

**Quarterly**:

- Accessibility audit
- SEO optimization review
- User feedback implementation
- A/B testing results review

---

## Contributors

**Development**: Claude Code (AI Assistant)
**Product Vision**: Olaniyi Aborisade
**Inspiration**: Personal experience and commitment to helping families

---

## License & Legal

**Content**: © 2024 Custody Rights Germany
**Disclaimer**: Information provided is general guidance only, not individualized legal advice. Consult a qualified family law attorney (Fachanwalt für Familienrecht) for advice specific to your situation.

---

## Next Steps

1. **Phase 3 Planning**: Document detailed requirements for interactive features
2. **User Research**: Gather feedback from target users on Phase 1-2
3. **Content Review**: Get legal expert review of all planning guides
4. **Translation Planning**: Begin German translation of Phase 1-2 content
5. **Performance Baseline**: Establish current metrics before Phase 3

---

**Last Updated**: November 14, 2024
**Status**: Phase 2 Complete ✅ | Phase 3 Planning 🚧
**Version**: 1.0.0
