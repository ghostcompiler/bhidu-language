# Changelog

## 1.0.5 - 2026-06-15

### Security

- Prevented Bhidu string literals from breaking out of generated script tags.
- Sanitized rendered markup instead of assigning caller-controlled strings to `innerHTML`.
- Moved generated program state out of arbitrary `window` properties.
- Restricted state update handlers and protected runtime-owned identifiers.
- Escaped collected CSS so it cannot terminate the generated style element.

### Validation

- Added regression coverage for script, style, DOM XSS, and protected-state payloads.
