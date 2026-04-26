---
name: Deep Autumn Cyber
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#5a4136'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#8e7164'
  outline-variant: '#e3bfb1'
  surface-tint: '#a33e00'
  primary: '#a33e00'
  on-primary: '#ffffff'
  primary-container: '#ff6600'
  on-primary-container: '#561d00'
  inverse-primary: '#ffb596'
  secondary: '#ac322e'
  on-secondary: '#ffffff'
  secondary-container: '#fd6e64'
  on-secondary-container: '#6d0008'
  tertiary: '#805600'
  on-tertiary: '#ffffff'
  tertiary-container: '#c98a00'
  on-tertiary-container: '#422a00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7c2e00'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb3ac'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#8a1a1a'
  tertiary-fixed: '#ffddaf'
  tertiary-fixed-dim: '#ffba43'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#614000'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Epilogue
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  terminal-code:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin: 32px
  column_count: '12'
---

## Brand & Style

This design system establishes a high-energy, "cyber-physical" aesthetic that bridges the gap between technical precision and organic warmth. The brand personality is intellectual, vibrant, and forward-looking, moving away from the cold blues of traditional cyberpunk toward a "Solar-Cyber" ethos. It evokes the feeling of a high-tech terminal operating within a sun-drenched, autumnal environment.

The style is a hybrid of **Brutalism** and **Glassmorphism**. It utilizes the structural integrity of visible grid lines and monospaced-adjacent layouts (Brutalism) but softens the execution with translucent amber overlays and subtle glows (Glassmorphism). The result is a UI that feels like specialized hardware—tactile, functional, yet inviting.

## Colors

The palette is anchored by a high-vis primary orange that serves as the main interactive signal. This is balanced against a "Warm Cream" background to reduce eye strain while maintaining a high-energy feel. 

- **Primary (#ff6600):** Used for primary actions, active states, and critical technical readouts.
- **Background (#faf7f2):** A rich, light beige that provides an organic foundation.
- **Accents:** Deep Red is reserved for warnings and secondary depth, while Amber Glow is used for focus states and decorative "light-pipe" effects.
- **Grid & Lines:** A slightly darker beige/brown is used for structural grid lines, maintaining the "schematic" look without the harshness of pure black or gray.

## Typography

Typography balances the mechanical with the editorial. **Space Grotesk** is used for headlines and labels to provide a technical, geometric edge reminiscent of engineering blueprints. **Epilogue** is utilized for body copy to ensure long-form readability and a contemporary, stylish feel.

To maintain the cyber aesthetic, all labels and data-heavy components should use uppercase Space Grotesk with slight letter spacing. Headlines should be tightly tracked to feel impactful and structural.

## Layout & Spacing

This design system employs a **Fixed Grid** model inspired by technical schematics. The interface is divided into a 12-column layout where grid lines are often rendered visible (1px stroke) to define content boundaries.

The spacing rhythm is strictly based on an 8px modular scale. Components should "snap" to the grid, and padding within cards should be generous (24px or 32px) to prevent the technical elements from feeling cluttered. Alignment should be primarily left-heavy to mimic a terminal readout.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Amber Glows** rather than traditional drop shadows.

- **Level 0 (Base):** The Cream background.
- **Level 1 (Panels):** Slightly darker beige surfaces with 1px borders.
- **Level 2 (Interactive):** Elements that "glow" when hovered. Use a soft, amber-tinted outer glow (`box-shadow: 0 0 15px rgba(255, 176, 0, 0.3)`) to suggest a backlit screen.
- **Glass Effects:** Use backdrop blurs (10px–20px) on overlays to create the sensation of semi-transparent plexiglass or "cyber-amber" sheets.

## Shapes

The shape language is **Soft-Technical**. A base roundedness of `0.25rem` (4px) is used to take the "bite" off the brutalist layout while maintaining a sense of precision. 

Large containers and cards may use `rounded-lg` (8px), but should never feel "bubbly." The goal is to mimic high-end industrial design—machined edges that are polished rather than sharp.

## Components

- **Buttons:** Primary buttons are solid Orange (#ff6600) with white or very dark brown text. Use a "clipped corner" or 1px stroke offset for a technical feel.
- **Terminal Input:** Text fields should feature a leading "prompt" character (e.g., `>`) and use a monospaced-style font. The cursor should be a solid amber block.
- **Cards:** Cards are defined by 1px solid borders (#e6e0d5). Headers should be separated by a horizontal rule, mimicking a data sheet.
- **Chips/Badges:** Small, rectangular tags with high-contrast backgrounds (Deep Red or Orange) and uppercase label-sm typography.
- **Grid Lines:** Decorative vertical and horizontal lines should be used to separate sections of the page, acting as structural anchors for the content.
- **Glow Indicators:** Small circular or rectangular amber indicators are used to show "System Active" or "Live" states.
