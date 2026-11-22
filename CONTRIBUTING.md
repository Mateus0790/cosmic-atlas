# Contributing to Cosmic Atlas

Thank you for your interest in contributing to Cosmic Atlas! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Mateus0790/cosmic-atlas/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node.js version)

### Suggesting Features

1. Check existing [Discussions](https://github.com/Mateus0790/cosmic-atlas/discussions) and issues
2. Create a new discussion or issue with:
   - Clear description of the feature
   - Use cases and motivation
   - Any relevant scientific references
   - Implementation ideas (if any)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the guidelines below
4. Run tests: `npm test` (when available)
5. Run linting: `npm run lint` (when available)
6. Build successfully: `npm run build`
7. Commit with clear messages
8. Push to your fork
9. Open a Pull Request against `main`

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/cosmic-atlas.git
cd cosmic-atlas

# Install dependencies
npm install

# Start dev server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

## Code Style

### TypeScript

- Use strict TypeScript (where possible, we use relaxed for dev)
- Prefer `type` over `interface` for unions and primitives
- Use explicit return types for public APIs
- Avoid `any` - use `unknown` or proper types

### React

- Functional components with hooks
- Use `React.FC` for component types
- Prefer composition over inheritance
- Keep components small and focused

### Three.js / R3F

- Use `@react-three/fiber` patterns
- Extend via `extend()` for custom objects
- Dispose of geometries, materials, textures in `useEffect` cleanup
- Use `useMemo` for expensive computations

### File Organization

- One component per file
- Co-locate types with components when specific
- Shared types in `src/types/`
- Constants in `src/astronomy/constants.ts`

### Naming Conventions

- Files: PascalCase for components (`Earth.tsx`), camelCase for utilities (`coordinates.ts`)
- Components: PascalCase (`Earth`, `StarField`)
- Functions: camelCase (`calculateOrbit`, `transformCoordinates`)
- Constants: UPPER_SNAKE_CASE (`AU_METERS`, `EARTH_GM`)
- Types: PascalCase (`CelestialObject`, `OrbitalElements`)

## Scientific Accuracy

Cosmic Atlas prioritizes scientific accuracy. When contributing astronomical calculations:

1. **Cite sources** - Reference IAU resolutions, JPL papers, or textbook equations
2. **Document approximations** - Clearly mark where simplifications are made
3. **Use standard constants** - Reference `src/astronomy/constants.ts`
4. **Validate against known values** - Include test cases with expected results

## Data Integration

When adding new data providers:

1. Create a service in `src/data-providers/`
2. Implement caching and rate limiting
3. Handle errors gracefully with fallbacks
4. Document the data source and license
5. Add TypeScript types for the API response

## Testing

- Write unit tests for pure functions (astronomy, orbits, coordinates)
- Integration tests for data providers (mock APIs)
- Visual regression tests for rendering (future)

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for structural changes
- Add JSDoc comments for public APIs
- Include scientific references in code comments

## Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes nor adds feature
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance, build, dependencies

Examples:
```
feat(earth): add procedural cloud layer with real-time data
fix(orbits): correct SGP4 propagation for near-circular orbits
docs(readme): update quick start with Docker instructions
refactor(renderer): extract FloatingOrigin to separate class
```

## Pull Request Template

When opening a PR, please include:

1. **Description**: What does this PR do?
2. **Type**: Feature, fix, refactor, docs, etc.
3. **Testing**: How was this tested?
4. **Screenshots**: For visual changes
5. **Breaking Changes**: Any breaking changes?
6. **Related Issues**: Link to related issues

## Review Process

1. Automated checks must pass (build, type-check)
2. At least one maintainer review required
3. Scientific accuracy review for astronomy changes
4. Performance review for rendering changes

## Questions?

Open a [Discussion](https://github.com/Mateus0790/cosmic-atlas/discussions) or ask in the PR.

Thank you for contributing to Cosmic Atlas! 🌌