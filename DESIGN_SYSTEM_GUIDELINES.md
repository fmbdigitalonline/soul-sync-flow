# 🎨 Golden Standard Design System Guidelines

## Developer Implementation Guide

This document provides clear "before and after" examples for implementing the Golden Standard Design System. All examples are **enforced by ESLint** - non-compliant code will trigger build errors.

---

## 🎯 Core Principles

### Typography System
- **Display Font**: `font-display` (Cormorant Garamond) for headings and brand text
- **Body Font**: `font-body` (Inter) for UI text, descriptions, and content
- **Semantic Sizes**: Use `text-heading-*` and `text-text-*` tokens

### Color System
- **Semantic Tokens Only**: Use `text-main`, `bg-surface`, `border-default`
- **No Hardcoded Colors**: Forbidden: `bg-white`, `text-black`, `border-gray-300`
- **State Colors**: Use `success`, `warning`, `error`, `info` tokens

### Spacing System
- **Semantic Spacing**: Use `space-*`, `component-*`, `layout-*` tokens
- **No Hardcoded Values**: Forbidden: `p-4`, `m-6`, `gap-8`

---

## 📝 Implementation Examples

### ✅ Primary Button Component

```tsx
// ✅ CORRECT - Golden Standard Compliant
import { Button } from "@/components/ui/button"

<Button 
  variant="default" 
  className="font-display text-heading-sm"
>
  Create Blueprint
</Button>
```

```tsx
// ❌ WRONG - Will trigger linter error
<button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">
  Create Blueprint
</button>
```

### ✅ Card Layout Component

```tsx
// ✅ CORRECT - Golden Standard Compliant
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="bg-surface border-border-default shadow-card">
  <CardHeader className="p-space-lg">
    <CardTitle className="font-display text-heading-lg text-main">
      Your Blueprint
    </CardTitle>
  </CardHeader>
  <CardContent className="p-space-lg space-y-space-md">
    <p className="font-body text-text-base text-secondary">
      Discover your cosmic personality profile.
    </p>
  </CardContent>
</Card>
```

```tsx
// ❌ WRONG - Will trigger linter error
<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    Your Blueprint
  </h2>
  <p className="text-gray-600">
    Discover your cosmic personality profile.
  </p>
</div>
```

### ✅ Navigation Component

```tsx
// ✅ CORRECT - Golden Standard Compliant
import { NavLink } from "react-router-dom"

<nav className="p-space-md bg-surface-elevated border-b border-border-muted">
  <NavLink 
    to="/blueprint" 
    className="font-body text-text-base text-main hover:text-primary"
  >
    Blueprint
  </NavLink>
</nav>
```

```tsx
// ❌ WRONG - Will trigger linter error
<nav className="p-4 bg-gray-50 border-b border-gray-200">
  <a href="/blueprint" className="text-gray-900 hover:text-blue-600">
    Blueprint
  </a>
</nav>
```

### ✅ Form Component

```tsx
// ✅ CORRECT - Golden Standard Compliant
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-component-md">
  <Label className="font-body text-text-base text-main">
    Birth Date
  </Label>
  <Input 
    className="border-border-default focus:border-border-focus bg-surface text-main"
    placeholder="Enter your birth date"
  />
</div>
```

```tsx
// ❌ WRONG - Will trigger linter error
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">
    Birth Date
  </label>
  <input 
    className="border border-gray-300 focus:border-blue-500 bg-white text-black p-2 rounded"
    placeholder="Enter your birth date"
  />
</div>
```

### ✅ Page Layout Component

```tsx
// ✅ CORRECT - Golden Standard Compliant
<div className="min-h-screen bg-background">
  <header className="p-layout-md border-b border-border-default">
    <h1 className="font-display text-display-md text-main">
      Soul Sync
    </h1>
  </header>
  
  <main className="p-layout-lg space-y-layout-md max-w-4xl mx-auto">
    <section className="space-y-space-lg">
      <h2 className="font-display text-heading-xl text-main">
        Welcome to Your Journey
      </h2>
      <p className="font-body text-text-lg text-secondary">
        Discover the cosmic blueprint that shapes your destiny.
      </p>
    </section>
  </main>
</div>
```

```tsx
// ❌ WRONG - Will trigger linter error
<div className="min-h-screen bg-gray-50">
  <header className="p-8 border-b border-gray-200">
    <h1 className="text-4xl font-bold text-black">
      Soul Sync
    </h1>
  </header>
  
  <main className="p-12 space-y-8 max-w-4xl mx-auto">
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">
        Welcome to Your Journey
      </h2>
      <p className="text-lg text-gray-600">
        Discover the cosmic blueprint that shapes your destiny.
      </p>
    </section>
  </main>
</div>
```

---

## 🎨 Color Token Reference

### Text Colors
```tsx
text-main           // Primary text (dark on light, light on dark)
text-secondary      // Secondary text (medium contrast)
text-muted          // Muted text (low contrast)
text-subtle         // Subtle text (very low contrast)
text-on-brand       // Text on branded backgrounds
text-on-dark        // Text on dark backgrounds
text-disabled       // Disabled text
```

### Background Colors
```tsx
bg-background       // Main page background
bg-surface          // Card and component surfaces
bg-surface-elevated // Elevated surfaces (modals, popovers)
bg-surface-sunken   // Sunken surfaces (inputs, wells)
bg-surface-overlay  // Overlay backgrounds
```

### Border Colors
```tsx
border-border-default  // Default borders
border-border-muted    // Muted borders
border-border-subtle   // Subtle borders
border-border-focus    // Focus states
border-border-error    // Error states
```

### State Colors
```tsx
bg-success / text-success     // Success states
bg-warning / text-warning     // Warning states
bg-error / text-error         // Error states
bg-info / text-info           // Info states
```

---

## 📏 Spacing Token Reference

### Component Spacing (Internal spacing)
```tsx
p-component-xs      // 2px - Minimal internal spacing
p-component-sm      // 6px - Small internal spacing
p-component-md      // 12px - Medium internal spacing
p-component-lg      // 20px - Large internal spacing
p-component-xl      // 28px - Extra large internal spacing
```

### Layout Spacing (Between components)
```tsx
space-y-space-xs    // 4px - Extra small gaps
space-y-space-sm    // 8px - Small gaps
space-y-space-md    // 16px - Medium gaps (base)
space-y-space-lg    // 24px - Large gaps
space-y-space-xl    // 32px - Extra large gaps
space-y-space-2xl   // 48px - 2x large gaps
space-y-space-3xl   // 64px - 3x large gaps
```

### Page Layout Spacing
```tsx
p-layout-xs         // 16px - Small page padding
p-layout-sm         // 24px - Medium page padding
p-layout-md         // 32px - Base page padding
p-layout-lg         // 48px - Large page padding
p-layout-xl         // 64px - Extra large page padding
p-layout-2xl        // 96px - 2x large page padding
```

---

## 🔧 Typography Token Reference

### Heading Sizes (Use font-display)
```tsx
text-heading-xs     // 16px - Small headings
text-heading-sm     // 18px - Small headings
text-heading-md     // 20px - Medium headings
text-heading-lg     // 24px - Large headings
text-heading-xl     // 28px - Extra large headings
text-heading-2xl    // 32px - 2x large headings
text-heading-3xl    // 36px - 3x large headings
```

### Body Text Sizes (Use font-body)
```tsx
text-text-xs        // 10px - Extra small text
text-text-sm        // 12px - Small text
text-text-base      // 14px - Base text
text-text-md        // 16px - Medium text
text-text-lg        // 18px - Large text
text-text-xl        // 20px - Extra large text
```

### Display Sizes (Hero sections, use font-display)
```tsx
text-display-sm     // 40px - Small display
text-display-md     // 48px - Medium display
text-display-lg     // 56px - Large display
```

---

## 🚨 Common Violations & Fixes

### Hardcoded Colors
```tsx
// ❌ VIOLATION - Will trigger linter error
className="bg-white text-black border-gray-300"

// ✅ FIX - Use semantic tokens
className="bg-surface text-main border-border-default"
```

### Hardcoded Spacing
```tsx
// ❌ VIOLATION - Will trigger linter error
className="p-4 m-6 space-y-8"

// ✅ FIX - Use semantic tokens
className="p-space-md m-layout-sm space-y-space-lg"
```

### Hardcoded Typography
```tsx
// ❌ VIOLATION - Will trigger linter error
className="text-2xl font-bold"

// ✅ FIX - Use semantic tokens
className="font-display text-heading-xl"
```

### Wrong Font Usage
```tsx
// ❌ VIOLATION - Wrong font for content type
<h1 className="font-body text-heading-xl">Title</h1>
<p className="font-display text-text-base">Description</p>

// ✅ FIX - Correct font pairing
<h1 className="font-display text-heading-xl">Title</h1>
<p className="font-body text-text-base">Description</p>
```

---

## 🔄 Migration Workflow

When updating existing components:

1. **Replace hardcoded colors** with semantic tokens
2. **Replace hardcoded spacing** with semantic tokens
3. **Apply correct font pairing** (display for headings, body for text)
4. **Use semantic text sizes** instead of generic ones
5. **Test responsive behavior** on mobile
6. **Run linter** to catch remaining violations

### Component Checklist

- [ ] **Typography**: Correct font pairing applied
- [ ] **Colors**: Only semantic tokens used
- [ ] **Spacing**: Only semantic spacing tokens used
- [ ] **Responsive**: Works on mobile devices
- [ ] **Accessible**: Proper contrast and focus states
- [ ] **Linter**: No ESLint violations

---

**Remember**: The ESLint configuration will **automatically catch** violations during development. This guidelines document is your reference for implementing compliant components from the start.

**Status**: Active enforcement via ESLint
**Last Updated**: 2025-07-21