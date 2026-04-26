---
name: Winter Cyber Light
colors:
  surface: '#f6fafe'
  surface-dim: '#d6dade'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#3a494b'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#6a7a7b'
  outline-variant: '#b9cacb'
  surface-tint: '#00696f'
  primary: '#00696f'
  on-primary: '#ffffff'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00dbe7'
  secondary: '#0056c4'
  on-secondary: '#ffffff'
  secondary-container: '#006df5'
  on-secondary-container: '#fefcff'
  tertiary: '#5f5d69'
  on-tertiary: '#ffffff'
  tertiary-container: '#ddd9e7'
  on-tertiary-container: '#615e6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#afc6ff'
  on-secondary-fixed: '#001944'
  on-secondary-fixed-variant: '#00429a'
  tertiary-fixed: '#e5e0ef'
  tertiary-fixed-dim: '#c9c4d3'
  on-tertiary-fixed: '#1c1a25'
  on-tertiary-fixed-variant: '#474551'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  technical-sm:
    fontFamily: Share Tech Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Share Tech Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 40px
  container-max: 1280px
---

## Brand & Style

This design system establishes a high-fidelity visual language that merges the serene, sharp clarity of an arctic winter with the precise, high-tech aesthetics of a "white-mode" cyberpunk future. The atmosphere is intentionally cold, crisp, and intellectually advanced, evoking the feeling of a laboratory situated in a glacial landscape.

The design style is a hybrid of **Glassmorphism** and **Minimalism**, characterized by:
- **Translucency:** UI surfaces mimic sheets of polished ice and frosted glass.
- **Precision:** Ultra-thin "nanometer" borders and glowing light-leak accents.
- **Vastness:** Aggressive use of whitespace to simulate the openness of a snowy tundra.
- **Crystalline Motifs:** Replacing traditional organic shapes with geometric frost patterns and hexagonal structures.

## Colors

The palette is anchored by "Crystalline Cyan" and "Deep Frost Blue," designed to vibrate against a near-white, "Ice Grey" background. 

- **Primary (Crystalline Cyan):** Used for interactive elements, glowing states, and high-priority data visualization.
- **Secondary (Deep Frost Blue):** Used for depth, structural anchors, and links to ensure legibility against light backgrounds.
- **Accent (Violet-White):** A soft, chromatic aberration-inspired hue used for subtle highlights and hover states.
- **Background (Ice Grey):** A sophisticated neutral that prevents eye strain while maintaining a cold, high-tech mood.

Color application should prioritize high contrast and "internal luminescence," making elements appear as if they are backlit through ice.

## Typography

The typography strategy employs a "Modern-Technical" hierarchy. **Space Grotesk** is utilized for headlines to provide a sharp, geometric structure that feels futuristic yet legible. For Japanese text, **Zen Kaku Gothic New** provides a matching clean, sans-serif profile.

The technical layer is handled by **Share Tech Mono**, used for metadata, labels, and "readout" elements. This monospace font injects a sense of machine-driven precision. All technical labels should favor a slight tracking increase to emphasize the airy, crystalline feel of the design system.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model within a flexible container. A 12-column grid is standard, but the rhythm is defined by a strict 4px baseline unit. 

- **Grid:** 12 columns with wide 24px gutters to allow the "air" of the winter theme to permeate the layout.
- **Subtle Grids:** Backgrounds should feature a faint 32px or 64px square grid in a very low-opacity cyan (#00f2ff at 3-5% opacity) to evoke a blueprint or HUD feel.
- **Margins:** Generous exterior margins (minimum 40px) ensure content feels like it is floating in a vast, clean space.

## Elevation & Depth

Hierarchy is achieved through **Glassmorphism** rather than traditional drop shadows. Instead of simulating light falling on a surface, this design system simulates light passing through layers of ice.

- **Frosted Surfaces:** Use `backdrop-filter: blur(12px)` combined with a 60% opacity white background for primary containers.
- **Glowing Borders:** Instead of shadows, use 1px solid borders. Active elements feature a `box-shadow: 0 0 8px #00f2ff` to simulate a neon glow trapped in frost.
- **Layering:** Elements closer to the user are more transparent but have a higher blur radius, creating a sense of physical depth within the UI stack.

## Shapes

The shape language is primarily **Sharp and Angular**, mimicking the natural geometry of ice crystals and snowflakes. 

- **Corner Radius:** Standard components use a very subtle 4px (Soft) radius to maintain a high-tech edge without being hostile. 
- **Hexagons:** Decorative elements and image masks may utilize hexagonal or 45-degree clipped corners to reinforce the "cyber" aspect.
- **Dividers:** Use ultra-thin (0.5pt - 1pt) lines that fade out at the ends, suggesting a laser-cut or etched-in-ice precision.

## Components

### Buttons
- **Primary:** Filled with a subtle gradient (Crystalline Cyan to Deep Frost Blue), white text, and a sharp 2px glow on hover.
- **Ghost:** 1px Cyan border with a light violet-white background blur. Text is Deep Frost Blue.

### Cards
- **Frosted Card:** White-grey at 40% opacity, 15px backdrop blur, and a 1px white border at 20% opacity. 
- **Interactive State:** Border color shifts to Crystalline Cyan on hover with a faint inner glow.

### Input Fields
- Underline style only, using a 1px Deep Frost Blue line. 
- **Focus State:** The line glows Crystalline Cyan, and a faint monospace "system status" label appears in the upper right.

### Frost Patterns (Decorative)
- Replace all organic flourishes with procedural frost patterns. These should be SVG-based, using thin, white lines at 10-15% opacity, concentrated in the corners of the viewport or large containers.

### Chips & Tags
- Rectangular with clipped corners. High-contrast monochromatic backgrounds (Ice Grey) with Deep Frost Blue text.