---
name: FleetFlow Operational Interface
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#525658'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#44474a'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-numeric:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for high-performance logistics management, prioritizing operational awareness through a refined "Utility-Premium" aesthetic. Drawing inspiration from industry-leading developer tools, it balances technical density with extreme visual clarity.

The personality is **authoritative, precise, and anticipatory**. The UI avoids unnecessary decoration, instead using generous white space and high-fidelity typography to reduce cognitive load during complex fleet monitoring. The style is a hybrid of **Minimalism** and **Glassmorphism**, utilizing layered surfaces to establish a clear hierarchy of information without relying on heavy borders or intrusive shadows.

## Colors

The palette is anchored by a neutral, high-legibility base to ensure that status indicators (Success, Warning, Danger) are immediately visible. 

- **Primary Deep Blue**: Reserved for high-intent actions, primary buttons, and active tracking states.
- **Background Surface**: A cool-toned off-white (#F7F9FC) provides a softer canvas than pure white, reducing eye strain during long-shift monitoring.
- **Semantic Accents**: Emerald, Amber, and Red are used sparingly but with high saturation to flag operational exceptions.
- **Neutrals**: A range of cool grays provides structural depth and distinguishes between metadata and primary content.

## Typography

The typography system employs a trio of specialized typefaces to manage different information layers:
- **Geist (Headlines)**: Provides a sharp, technical character to page titles and key metrics.
- **Inter (Body)**: Used for all reading and interface text due to its exceptional legibility and neutral tone.
- **JetBrains Mono (Data/Labels)**: Utilized for VIN numbers, coordinates, timestamps, and table headers. The monospaced nature ensures that fluctuating telemetry data remains stable and readable.

Hierarchy is enforced through strict weight contrast, using Semi-Bold (600) for headers and Regular (400) for secondary descriptions.

## Layout & Spacing

This design system utilizes a **fluid grid** with strict "safe-zone" margins to maintain a floating aesthetic. 

- **The Floating Toolbar**: The main navigation is a floating, centered element at the top of the viewport (Apple-style), utilizing a backdrop-blur effect.
- **Sectioning**: Content is organized into "Fluid Cards" that adapt to a 12-column grid. On desktop, cards typically span 3, 4, 6, or 12 columns.
- **Density**: Use `stack-md` (16px) for internal card padding and `stack-lg` (32px) for spacing between major sections. 
- **Mobile Adaptivity**: At the 768px breakpoint, the 12-column grid collapses into a single column, and horizontal margins reduce from 40px to 16px.

## Elevation & Depth

Depth is used to signify "interactability" and "current focus." The system avoids high-contrast shadows in favor of **Ambient Shadows** and **Tonal Layers**.

1.  **Level 0 (Base)**: The #F7F9FC background.
2.  **Level 1 (Cards)**: Pure white (#FFFFFF) with a very soft, 12% opacity shadow (0px 4px 20px). This is the primary surface for data.
3.  **Level 2 (Modals/Popovers)**: White surfaces with a more pronounced shadow (0px 15px 35px) and a subtle 1px border (#E2E8F0).
4.  **Glass Effect**: Floating toolbars and navigation use a 70% opacity white background with a 20px backdrop blur (saturate 150%).

Interaction states use elevation; a card should subtly lift (increase shadow spread) when hovered, creating a tactile feel.

## Shapes

The shape language is defined by large, "squircle-like" corner radii that lend a modern, approachable feel to an otherwise technical platform.

- **Standard Elements**: Buttons and input fields use a `0.5rem` (8px) radius.
- **Large Containers**: Operational cards and map overlays use `rounded-xl` (1.5rem / 24px) to emphasize the "floating" nature of the UI.
- **Subtle Containers**: Nested elements within cards use `rounded-lg` (1rem / 16px).

## Components

### Buttons
- **Primary**: Deep Blue background, white text, 8px radius. Subtle scale-down effect (0.98) on click.
- **Ghost**: No background, Primary Blue text. Background appears as #F1F5F9 on hover.

### Operational Cards
- Floating white containers. Headlines should be Geist Semi-Bold. Footer actions should be separated by a subtle 1px divider.

### Inputs & Search
- Search bars should be prominent, using a `rounded-xl` shape and a magnifying glass icon. Active states use a 2px Deep Blue outer glow (ring).

### Status Chips
- Small, pill-shaped indicators. Use a low-opacity version of the status color for the background (e.g., 10% Emerald) and a high-opacity version for the text.

### Skeleton Loaders
- Use a smooth, shimmering gradient from #EDF2F7 to #F7FAFC. The animation should be a slow linear pulse (2.5s duration) to maintain the "calm" atmosphere.

### Micro-interactions
- **Transitions**: All hover states should use a `cubic-bezier(0.4, 0, 0.2, 1)` timing function over 200ms.
- **Drawer/Modals**: Slide in from the right or bottom with a slight overshoot for a "physical" feel.