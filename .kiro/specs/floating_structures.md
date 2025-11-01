# Kiro Spec: Floating Structures

This document defines the constraints and rules for the AI when generating architectural designs that include floating or levitating elements. The goal is to ensure visual coherence and adherence to the project's "impossible but grounded" aesthetic.

## Core Principles

1.  **Acknowledge Gravity:** Floating elements should appear to defy gravity, not ignore it. There should be a subtle, implied source of power or support (e.g., faint energy fields, minimal tensile connections, visible magnetic emitters).
2.  **Maintain Usability:** All primary structures must be accessible. Floating platforms intended for use must be connected by bridges, teleporters, or other logical means.
3.  **Hierarchy of Scale:** Larger floating masses should be positioned lower or have more significant implied support systems than smaller ones.

## Generation Rules

-   **Maximum Unsupported Span:** No single floating element of `type: 'box'` should have a `width` or `depth` greater than 50 units without a visible or implied support structure at its center or edges.
-   **Minimum Clearance:** The vertical distance between a floating element and any structure directly beneath it must be at least 5 units to emphasize the floating effect.
-   **Material Constraints:** Large, load-bearing floating structures should not be made primarily of `material: 'glass'` unless specified as "reinforced smart glass" in the prompt.
-   **Connectivity:** If a model contains more than two separate floating platforms, the AI MUST generate connecting elements (e.g., spiral bridges, light bridges, smaller connecting platforms) unless explicitly told not to.
-   **Positional Randomness:** The `y` (vertical) position of floating elements should be varied. Avoid placing multiple floating platforms at the exact same height to create a more dynamic composition.

## Prohibited Designs

-   Randomly scattered, unconnected small cubes that serve no architectural purpose.
-   Floating structures that intersect with non-floating structures in a physically jarring way.
-   Perfectly stacked, disconnected floors without a central column or support system.

By adhering to these specifications, the AI will generate "impossible" architecture that is visually stunning, thematically consistent, and architecturally intriguing.
