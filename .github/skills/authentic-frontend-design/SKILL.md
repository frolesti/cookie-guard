---
name: authentic-frontend-design
description: 'Use when designing or reviewing Cookie Guard UI, browser-extension popup UI, options pages, or frontend CSS. Produces specific, restrained, context-appropriate interfaces and prevents generic AI-generated visual patterns.'
---

# Authentic Frontend Design

## Goal
Design the smallest useful interface for the product context. A browser privacy utility is an operational surface, not a marketing page.

## Procedure
1. Identify the repeated user action and give it visual priority.
2. Use platform-native controls and readable system typography for browser extension surfaces. Do not import a display font merely to make a utility look styled.
3. Prefer a compact hierarchy: title, state, primary control, then supporting facts. Use dense spacing and dividers rather than nested cards.
4. Select one restrained accent and semantic error/success colors. Use CSS variables when color use expands.
5. Add motion only when it explains a state change; do not add decorative animation.
6. Check keyboard focus, labels, contrast, disabled controls, long translated strings, and narrow popup widths.

## Avoid
- Purple gradients, floating panels, decorative blobs, faux dashboards, oversized headings, or marketing copy.
- Generic component stacks where a native checkbox, button, select, or dialog is clearer.
- Blindly clicking any text-matched page button; consent automation must be scoped to visible dialogs and explicit reject patterns.
- Reusing a default visual recipe. Match the product's purpose first.

## Review Checklist
- Can a user identify the current protection state and change it in one action?
- Does every visible control map to an actual feature?
- Would the interface still look intentional with no images or animation?
- Is this a simple tool surface rather than a landing page in miniature?