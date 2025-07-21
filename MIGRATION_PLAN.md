# 🎯 Golden Standard Migration Plan

## Mission: Operationalize the Golden Standard Design System

This document tracks the systematic migration from legacy styling to the Golden Standard semantic token system.

## Migration Status Overview

### ✅ Foundation Layer (COMPLETE)
- [x] **index.css**: Golden Standard tokens defined
- [x] **tailwind.config.ts**: Legacy tokens purged, semantic tokens enforced
- [x] **eslint.config.js**: Design system linting enabled

### 🔄 Component Layer (IN PROGRESS)

#### Core UI Components
- [ ] **Button component**: Migrate to font-cormorant for text, semantic colors
- [ ] **Card component**: Ensure bg-surface usage, semantic shadows
- [ ] **Input components**: Standardize border-default, text-main
- [ ] **Navigation components**: Apply font-inter for UI text

#### Page Components  
- [ ] **Index.tsx**: Verify font-display for headings, font-body for descriptions
- [ ] **Blueprint pages**: Ensure semantic spacing (space-* tokens)
- [ ] **Dreams pages**: Validate color token usage
- [ ] **Profile pages**: Apply typography hierarchy

### 🚫 Forbidden Patterns (AUTO-ENFORCED BY LINTER)

The ESLint configuration now **automatically prevents**:
- Hardcoded colors: `bg-white`, `text-black`, `border-gray-300` ❌
- Legacy spacing: `p-4`, `m-6`, `space-y-8` ❌  
- Direct font usage: `text-lg`, `text-xl` ❌
- Arbitrary values: `w-[300px]`, `h-[50px]` ❌

### ✅ Required Patterns (GOLDEN STANDARD)

**Typography:**
```tsx
// ✅ Correct - Golden Standard
<h1 className="font-display text-heading-xl text-main">Title</h1>
<p className="font-body text-text-base text-secondary">Description</p>

// ❌ Wrong - Will trigger linter error
<h1 className="font-bold text-2xl text-gray-900">Title</h1>
```

**Spacing:**
```tsx
// ✅ Correct - Semantic tokens
<div className="p-space-md m-layout-sm">Content</div>

// ❌ Wrong - Will trigger linter error  
<div className="p-4 m-6">Content</div>
```

**Colors:**
```tsx
// ✅ Correct - Semantic tokens
<div className="bg-surface text-main border-border-default">Content</div>

// ❌ Wrong - Will trigger linter error
<div className="bg-white text-black border-gray-300">Content</div>
```

## Migration Checklist Template

For each component, verify:

### Typography Compliance
- [ ] Headings use `font-display` (Cormorant Garamond)
- [ ] Body text uses `font-body` (Inter)  
- [ ] Text sizes use semantic tokens (`text-heading-*`, `text-text-*`)
- [ ] Text colors use semantic tokens (`text-main`, `text-secondary`, etc.)

### Color Compliance
- [ ] Backgrounds use semantic tokens (`bg-surface`, `bg-surface-elevated`)
- [ ] Borders use semantic tokens (`border-default`, `border-muted`)
- [ ] State colors use semantic tokens (`success`, `warning`, `error`)

### Spacing Compliance
- [ ] Padding uses semantic tokens (`p-space-*`, `p-component-*`)
- [ ] Margins use semantic tokens (`m-space-*`, `m-layout-*`)
- [ ] Gap spacing uses semantic tokens (`gap-space-*`)

### Interactive States
- [ ] Hover states use semantic tokens (`hover:bg-interactive-hover`)
- [ ] Focus states use semantic tokens (`focus:border-focus`)
- [ ] Active states use semantic tokens (`active:bg-interactive-active`)

## Enforcement Mechanism

### ESLint Integration ✅
- **Auto-enforcement**: Linter prevents non-semantic class usage
- **Build-time validation**: CI/CD will fail on Golden Standard violations
- **Developer feedback**: Real-time errors in IDE

### Component Templates (Next Phase)
- Starter templates that enforce Golden Standard from creation
- Pre-configured semantic token usage
- Automatic compliance out-of-the-box

## Success Criteria

### Technical Goals
- [ ] Zero linter errors for non-semantic class usage
- [ ] All components use only Golden Standard tokens
- [ ] No hardcoded colors, spacing, or typography values

### Design Goals  
- [ ] Consistent visual hierarchy across all pages
- [ ] Perfect typography pairing (Cormorant + Inter)
- [ ] Cohesive color palette throughout application
- [ ] Mobile-responsive semantic spacing

### Operational Goals
- [ ] Self-sustaining system (new code automatically compliant)
- [ ] Clear developer guidelines and templates
- [ ] Automated validation in CI/CD pipeline

## Next Steps

1. **Phase 3**: Create developer guidelines and component templates
2. **Phase 4**: Execute final migration sweep with linter guidance
3. **Validation**: Comprehensive design system audit

---

**Status**: Foundation complete, enforcement active, migration in progress
**Last Updated**: 2025-07-21
**Responsible**: SoulSync Engineering Team