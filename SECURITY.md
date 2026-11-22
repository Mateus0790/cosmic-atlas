# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Cosmic Atlas, please report it responsibly.

### How to Report

**Do not** create a public GitHub issue for security vulnerabilities.

Instead, please email: **security@cosmic-atlas.dev**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

### What to Expect

1. **Acknowledgment**: We'll acknowledge receipt within 48 hours
2. **Assessment**: We'll assess the vulnerability and determine severity
3. **Timeline**: We'll provide an estimated timeline for a fix
4. **Disclosure**: Coordinated disclosure after fix is deployed

### Scope

This policy covers:
- The Cosmic Atlas web application
- Build and deployment pipelines
- Dependencies (we monitor for vulnerable dependencies)

Out of scope:
- Third-party API services (NASA, ESA, etc.)
- User data (we don't collect personal data)
- Browser or OS vulnerabilities

## Security Measures

### Dependencies

- Automated dependency scanning via GitHub Dependabot
- Regular `npm audit` in CI/CD
- Pin exact versions in package-lock.json
- Review all new dependencies

### Build & Deployment

- GitHub Actions with minimal permissions
- No secrets in repository (use GitHub Secrets)
- Signed commits required for maintainers
- Build provenance via SLSA (future)

### Content Security Policy

The application implements CSP headers:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (required for Vite dev)
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: https:`
- `connect-src 'self' https://api.celestrak.com https://ssd.jpl.nasa.gov`

### Data Handling

- No user authentication (currently)
- No personal data collected
- No cookies or tracking
- API keys only via environment variables (never committed)

## Known Considerations

### Cross-Origin Resource Sharing (CORS)

The application fetches data from external APIs:
- CelesTrak (satellite data)
- JPL Horizons (ephemerides)
- Gaia Archive (star data)
- SIMBAD (astronomical objects)

These requests are made client-side. Some APIs may not support CORS; we use proxy services or serverless functions where needed (future).

### WebGL Security

WebGL exposes GPU access. We:
- Use only standard WebGL 2 features
- Validate all shader inputs
- Limit resource sizes (textures, buffers)
- Handle context loss gracefully

### Worker Security

Web Workers used for orbital calculations:
- No access to DOM
- Communication via postMessage only
- No eval or dynamic code execution

## Responsible Disclosure Timeline

| Phase | Timeline |
|-------|----------|
| Acknowledgment | 48 hours |
| Initial Assessment | 1 week |
| Fix Development | 2-4 weeks (depending on severity) |
| Testing & Release | 1 week |
| Public Disclosure | After fix deployed |

## Contact

Security team: security@cosmic-atlas.dev

For non-security issues, use [GitHub Issues](https://github.com/Mateus0790/cosmic-atlas/issues).