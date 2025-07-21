# Soul Guide Component Inventory
**Version:** 1.0  
**Status:** ✅ Official Golden Standard Component Library  
**Last Updated:** 2025-01-21

## Overview
This document serves as the definitive inventory of all pre-built, Golden Standard-compliant components available in the Soul Guide system. Every component listed here has been fully migrated to use semantic tokens and follows the SoulSync design principles.

**🎯 Purpose:** Prevent component duplication, ensure consistent usage, and provide a single source of truth for all available UI components.

---

## 📋 Core Interactive Components

### Button
**Location:** `src/components/ui/button.tsx`  
**Status:** ✅ Golden Standard Compliant

**Available Variants:**
- `default` - Primary purple button (--color-primary)
- `destructive` - Error/delete actions (--destructive)
- `outline` - Border-only button (--border)
- `secondary` - Secondary accent (--color-secondary) 
- `ghost` - Transparent with hover
- `link` - Text-only link style
- `success` - Success actions (--color-success)
- `warning` - Warning actions (--color-warning)
- `info` - Info actions (--color-info)

**Available Sizes:**
- `sm` - Small (h-10, px-4)
- `default` - Standard (h-12, px-6)
- `lg` - Large (h-14, px-8)
- `icon` - Square icon button (h-12, w-12)

**Typography:** Uses `font-cormorant` for emphasis and elegance

**Usage:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
```

---

### Input
**Location:** `src/components/ui/input.tsx`  
**Status:** ✅ Golden Standard Compliant

**Features:**
- Uses `--color-border-input` for borders
- Focus state uses `--color-primary` with ring
- Backdrop blur for modern aesthetic
- Fully accessible with proper focus management

**Usage:**
```tsx
import { Input } from "@/components/ui/input"

<Input placeholder="Enter your name" />
<Input type="email" defaultValue="user@example.com" />
```

---

### Textarea
**Location:** `src/components/ui/textarea.tsx`  
**Status:** ✅ Golden Standard Compliant

**Features:**
- Special `focusMode` prop for enhanced focus typography
- Uses semantic border and surface colors
- Automatic resize disabled for consistent layout

**Usage:**
```tsx
import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Enter description..." />
<Textarea focusMode={true} rows={5} />
```

---

### Label
**Location:** `src/components/ui/label.tsx`  
**Status:** ✅ Golden Standard Compliant

**Features:**
- Uses `--color-text-main` for primary text
- Proper disabled state styling
- Accessible peer-disabled interactions

**Usage:**
```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email Address</Label>
```

---

## 🗃️ Layout & Container Components

### Card
**Location:** `src/components/ui/card.tsx`  
**Status:** ✅ Golden Standard Compliant

**Available Components:**
- `Card` - Main container
- `CardHeader` - Title/description area
- `CardTitle` - Uses `font-cormorant` heading typography
- `CardDescription` - Uses `--color-text-secondary`
- `CardContent` - Main content area
- `CardFooter` - Action/button area

**Features:**
- Uses `--color-surface` background
- Implements `--shadow-card` elevation
- Hover effects with `--shadow-elevated`

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Feature Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
</Card>
```

---

## 🎛️ Overlay Components

### Dialog (Modal)
**Location:** `src/components/ui/dialog.tsx`  
**Status:** ✅ Golden Standard Compliant

**Available Components:**
- `Dialog` - Root provider
- `DialogTrigger` - Trigger element
- `DialogContent` - Modal container
- `DialogHeader` - Title area
- `DialogTitle` - Modal title
- `DialogDescription` - Modal description
- `DialogFooter` - Action area
- `DialogClose` - Close trigger

**Features:**
- Uses `--shadow-overlay` for depth
- Backdrop blur and proper focus management
- Accessible keyboard navigation

---

### Dropdown Menu
**Location:** `src/components/ui/dropdown-menu.tsx`  
**Status:** ✅ Golden Standard Compliant

**Available Components:**
- `DropdownMenu` - Root container
- `DropdownMenuTrigger` - Trigger button
- `DropdownMenuContent` - Menu container
- `DropdownMenuItem` - Individual menu item
- `DropdownMenuSeparator` - Visual separator
- `DropdownMenuLabel` - Section labels
- `DropdownMenuCheckboxItem` - Checkbox items
- `DropdownMenuRadioItem` - Radio items

---

## 📝 Form Components

### Form System
**Location:** `src/components/ui/form.tsx`  
**Status:** ✅ Golden Standard Compliant

**Available Components:**
- `Form` - Form provider (react-hook-form integration)
- `FormField` - Individual field wrapper
- `FormItem` - Field container
- `FormLabel` - Accessible label
- `FormControl` - Input wrapper
- `FormDescription` - Help text
- `FormMessage` - Error/validation messages

**Features:**
- Full react-hook-form integration
- Automatic accessibility attributes
- Error state management with semantic colors

---

## 🎨 Template Components

### Golden Standard Templates
**Location:** `src/components/templates/`  
**Status:** ✅ Golden Standard Compliant

**Available Templates:**
- `GoldenStandardCard` - Pre-configured card component
- `GoldenStandardPage` - Full page layout template
- `GoldenStandardForm` - Form component template

**Purpose:** Enforce design system compliance from creation

---

## 🚀 Usage Guidelines

### ✅ Do This
```tsx
// Use semantic components
<Button variant="primary">Submit</Button>
<Card className="p-space-lg">Content</Card>

// Compose from the inventory
import { Button, Card, Input } from "@/components/ui"
```

### ❌ Never Do This
```tsx
// Don't use raw HTML
<button className="bg-purple-500">Submit</button>

// Don't use direct color classes
<div className="bg-white border-gray-300">Content</div>

// Don't create one-off components that duplicate functionality
const MyCustomButton = () => <div>...</div>
```

---

## 🔄 Migration Status

All components in this inventory have been fully migrated to Golden Standard v3.0:
- ✅ Semantic token usage
- ✅ Typography system compliance  
- ✅ Spacing system adherence
- ✅ Accessibility standards
- ✅ Mobile-responsive design

---

## 📚 Next Steps

**Future Enhancement:** This inventory will serve as the foundation for a **Storybook** implementation, providing:
- Interactive component playground
- Visual regression testing
- Live documentation with examples
- Design token visualization

---

## 🛠️ Developer Notes

- **Linting:** `eslint-plugin-tailwindcss` enforces usage of these components
- **Code Reviews:** Ensure all new UI uses this inventory
- **Updates:** Any new components must be added to this inventory
- **Support:** Reference `DESIGN_SYSTEM_GUIDELINES.md` for implementation details