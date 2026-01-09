# Banana Shaker v2.0 - Codex Review Guide (Final)

## Project Scope

### Overview
Banana Shaker is a personal image generation web app. v2.0 adds a new **Diagram Generation Mode** for creating structured infographics, with a dedicated gallery.

### What's Been Added (v2.0)
- **Mode Switcher**: Toggle between "Free Generation" and "Diagram Generation"
- **8 Diagram Structures**: comparison, timeline, hierarchy, process_flow, cycle, pyramid, mindmap, guide_chart
- **13 Design Styles**: corporate, playful, minimal, sketch, neon, retro, gradient, isometric, flat, glassmorphism, neumorphism, watercolor, anime
- **2-Stage Pipeline**: Wireframe → Final Render
- **New DB Tables**: DiagramJob, DiagramImage
- **Diagram Gallery**: Separate gallery for diagram images

### What MUST NOT Change
- Existing `app/actions.ts` functionality
- Existing `components/generator-form.tsx` behavior
- Existing database tables (User, ApiKey, Preset, GenerationJob, Image)
- Authentication flow
- Free generation mode workflow

---

## Changes Summary (All Rounds)

### Round 1 Fixes
| Issue | Fix |
|-------|-----|
| `app-sidebar.tsx` misplaced import | Moved to top |
| FK integrity conflict | Created `DiagramImage` table |
| Missing ownership check | Added to all diagram Server Actions |
| Reference image race condition | Changed to `Promise.all` |

### Round 2 Fixes
| Issue | Fix |
|-------|-----|
| ModeSwitcher URL sync | Added `useEffect` to sync with searchParams |
| Sidebar active detection | Created `isActiveItem` helper for query params |

### New Feature: Diagram Gallery
| File | Purpose |
|------|---------|
| `app/(main)/diagram-gallery/page.tsx` | Gallery page |
| `components/diagram-gallery-grid.tsx` | Grid with detail dialog |
| `app/diagram-gallery-actions.ts` | Server Actions |

---

## Files to Review

### Core Diagram Agent (lib/diagram-agent/)
| File | Purpose |
|------|---------|
| `types.ts` | Type definitions (8 structures, 13 styles) |
| `prompt-builder.ts` | Prompt construction |
| `wireframe-generator.ts` | Wireframe generation |
| `final-renderer.ts` | Final rendering |
| `index.ts` | Re-exports |

### Server Actions
| File | Purpose |
|------|---------|
| `app/diagram-actions.ts` | Diagram generation with ownership checks |
| `app/diagram-gallery-actions.ts` | Gallery data fetching |

### UI Components
| File | Purpose |
|------|---------|
| `components/ModeSwitcher.tsx` | Mode toggle with URL sync |
| `components/diagram-generator/*.tsx` | Diagram form components (6 files) |
| `components/diagram-gallery-grid.tsx` | Gallery grid with dialog |

### Pages
| File | Change |
|------|--------|
| `app/(main)/generate/page.tsx` | ModeSwitcher integration |
| `app/(main)/diagram-gallery/page.tsx` | New diagram gallery |

### Modified Files
| File | Change |
|------|--------|
| `components/app-sidebar.tsx` | Added nav items, fixed active detection |
| `scripts/migrate-diagram.js` | DiagramJob + DiagramImage tables |

---

## Review Checklist

### 1. Type Safety
- [ ] All types properly exported from `types.ts`
- [ ] Minimize `any` usage (some remain for DB results)
- [ ] Proper null/undefined handling

### 2. Security
- [ ] Server Actions validate user session
- [ ] Job ownership verified before generation
- [ ] Image access requires ownership via join
- [ ] No API keys exposed to client

### 3. Non-Breaking Changes
- [ ] `app/actions.ts` unchanged
- [ ] `components/generator-form.tsx` unchanged
- [ ] Database migration is additive only

### 4. React Best Practices
- [ ] `useEffect` for URL sync in ModeSwitcher
- [ ] Proper state management
- [ ] Client/Server component separation

### 5. Error Handling
- [ ] All async operations have try/catch
- [ ] User-friendly error messages

### 6. New Gallery Feature
- [ ] Proper data fetching from DiagramImage
- [ ] Image detail dialog works
- [ ] Download functionality works
- [ ] Empty state shown when no diagrams

---

## Key Technical Decisions

1. **Separate Server Actions**: `diagram-actions.ts`, `diagram-gallery-actions.ts`
2. **Separate DiagramImage table**: Avoids FK conflict with Image → GenerationJob
3. **isActiveItem helper**: Handles query param matching for sidebar
4. **Promise.all for reference images**: Fixes race condition

---

## Testing Recommendations

### Manual Tests
1. **Mode Switching**: Toggle Free/Diagram, verify URL sync
2. **Sidebar Active State**: Check correct highlighting for query param URLs
3. **Free Mode Regression**: Generate image in free mode
4. **Diagram Flow**: Create diagram through full pipeline
5. **Diagram Gallery**: View gallery, open detail, download image
6. **Empty Gallery**: Verify empty state displays correctly

### Verification Commands
```bash
npx tsc --noEmit  # Should pass with no errors
npm run dev       # Start dev server
```
