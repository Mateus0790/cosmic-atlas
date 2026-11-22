# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with Vite + React + TypeScript
- Three.js r160 with React Three Fiber and Drei
- Core type definitions (`src/types/index.ts`)
- Astronomical constants (IAU 2015) in `src/astronomy/constants.ts`
- Coordinate transformation system in `src/astronomy/coordinates.ts`
- Orbital mechanics (SGP4, Keplerian, JPL Horizons stubs) in `src/orbits/index.ts`
- Rendering engine with floating origin in `src/core/renderer.ts`
- Scene components: Earth, Sun, Orbits, StarField, Labels in `src/scene/CosmicScene.tsx`
- Main application with UI panels in `src/App.tsx`
- Placeholder textures for Earth and environment
- GitHub workflow configuration (CI/CD)
- Documentation: README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY

### Changed
- TypeScript config relaxed for development (`strict: false`)
- Vite config with path aliases and manual chunking

### Fixed
- TypeScript import issues (type-only imports)
- Missing imports in orbital mechanics
- Three.js r155+ compatibility (removed `physicallyCorrectLights`)
- Vite config `__dirname` warning (ESM-compatible)

## [0.1.0] - 2026-11-22

### Added
- Phase 1 Foundation complete
  - Project initialization
  - Core architecture
  - Earth rendering with day/night cycle
  - Basic camera and navigation
  - UI framework with panels
  - Build system

---

## Release Types

### Major (x.0.0)
- Breaking API changes
- Major architecture rewrites
- Incompatible data format changes

### Minor (0.x.0)
- New features (new celestial bodies, data sources, UI panels)
- New coordinate frames or orbital models
- Performance improvements with API changes

### Patch (0.0.x)
- Bug fixes
- Documentation updates
- Dependency updates
- Minor UI tweaks

## Version History

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 0.1.0 | 2026-11-22 | Minor | Phase 1 Foundation complete |

---

*Generated with [Keep a Changelog](https://keepachangelog.com/)*