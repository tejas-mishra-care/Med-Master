# Design Tokens


This document outlines the design tokens used in the MedMaster application for consistent styling.

## Colors

Our color palette is defined with clear semantic meanings and includes light and dark variants.

| Token         | Light Theme | Dark Theme  | High Contrast | Description                  |
|---------------|-------------|-------------|---------------|------------------------------|
| `--color-primary`  | `#1E3A8A`   | `#60A5FA`   | `#1D4ED8`    | Main brand color, used for key elements. |
| `--color-accent`   | `#14B8A6`   | `#5EEAD4`   | `#0D9488`    | Secondary color, for highlights and actions. |
| `--color-highlight`| `#F59E0B`   | `#FCD34D`   | `#D97706`    | Used for emphasis or important notices. |
| `--color-bg`       | `#F8FAFC`   | `#1E293B`   | `#0F172A`    | Background color.           |
| `--color-text`     | `#1E293B`   | `#F8FAFC`   | `#E2E8F0`    | Default text color.         |
| `--color-text-secondary` | `#64748B`   | `#94A3B8`   | `#CBD5E1`    | Secondary text, less prominent. |
| `--color-border`   | `#E2E8F0`   | `#334155`   | `#475569`    | Border color.               |
| `--color-success`  | `#10B981`   | `#34D399`   | `#059669`    | Indicates success or positive actions. |
| `--color-danger`   | `#EF4444`   | `#F87171`   | `#DC2626`    | Indicates errors or negative actions. |

<!-- Usage examples for color tokens in CSS -->
**Usage (CSS):**

```
css
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-bg); /* Use background as text color for contrast */
}

.text-highlight {
  color: var(--color-highlight);
}
```
## Spacing

A consistent spacing scale derived from multiples of 4px.

| Token       | Value | Description        |
|-------------|-------|--------------------|
| `--space-xs`| `4px` | Extra small space  |
| `--space-sm`| `8px` | Small space        |
| `--space-md`| `16px`| Medium space       |
| `--space-lg`| `24px`| Large space        |
| `--space-xl`| `32px`| Extra large space  |
| `--space-2xl`| `48px`| Double XL space    |
| `--space-3xl`| `64px`| Triple XL space    |

**Usage (CSS):**
```
css
.card {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}
```
## Radii

Border radius values for rounded corners.

| Token       | Value | Description        |
|-------------|-------|--------------------|
| `--radius-sm`| `4px` | Small radius       |
| `--radius-md`| `8px` | Medium radius      |
| `--radius-lg`| `12px`| Large radius       |
| `--radius-full`| `9999px`| Fully rounded (pill) |

**Usage (CSS):**
```
css
.button {
  border-radius: var(--radius-md);
}
```
## Motion Durations

Standard durations for animations and transitions.

| Token         | Value   | Description          |
|---------------|---------|----------------------|
| `--duration-short`| `150ms` | Short transitions    |
| `--duration-medium`| `300ms` | Medium transitions   |
| `--duration-long` | `500ms` | Long transitions     |

**Usage (CSS):**
```
css
.modal {
  transition: opacity var(--duration-medium) ease-in-out;
}
```
## High-Contrast Mode

In addition to light/dark themes, we support a high-contrast mode for improved accessibility. CSS variables are defined to override default color tokens when a high-contrast media query or class is active.

**Example (CSS):**
```
css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: var(--color-text-dark);
    /* ... dark theme colors ... */
  }
}

@media (prefers-contrast: high) {
  :root {
    --color-primary: var(--color-primary-high-contrast);
    --color-text: var(--color-text-high-contrast);
    /* ... high contrast colors ... */
  }
}
```
Developers should utilize these design tokens consistently throughout the application to maintain a unified look and feel.