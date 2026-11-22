# Cosmic Atlas

> Open-source interactive 3D atlas of the known universe, powered by scientific astronomical data.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vite.dev/)

## Mission

Cosmic Atlas is an interactive 3D platform for exploring the known universe from Earth's surface to the cosmic web of galaxies. Built on real scientific data from NASA, ESA, JPL, and other astronomical institutions.

## Features

### Earth & Near-Earth Space
- High-resolution Earth with day/night cycle, clouds, atmosphere, and city lights
- Real-time satellite tracking (CelesTrak/OMM data + SGP4 propagation)
- International Space Station and major satellites
- Ground track visualization

### Solar System
- All 8 planets + dwarf planets + major moons
- Accurate orbital elements from JPL Horizons
- Keplerian orbit propagation with perturbations
- Planetary rings (Saturn), axial tilts, rotation
- Astronomical clock: past, present, future

### Space Probes
- Voyager 1 & 2 trajectories from launch to interstellar space
- Pioneer 10/11, New Horizons, Cassini, Juno, Parker Solar Probe, OSIRIS-REx
- Real-time positions from JPL Horizons
- Light-time communication delay indicators
- Mission timelines and milestones

### Milky Way & Stars
- Gaia DR3 integration (positions, parallax, proper motion)
- SIMBAD cross-referencing
- Progressive loading by region/zoom level
- Star colors from effective temperature
- Constellation overlays

### Galaxies & Cosmology
- Local Group, Virgo Cluster, Laniakea Supercluster
- Redshift-based distance estimates (Lambda CDM cosmology)
- Cosmic web filaments and voids
- CMB reference frame
- Observable universe boundary

### Technical Highlights
- Floating origin rendering for astronomical scales (1m to 10^27m)
- Logarithmic depth buffer for extreme depth ranges
- LOD system with instancing for millions of stars
- Web Workers for orbital calculations
- Coordinate frame transformations (ICRF, J2000, Ecliptic, Galactic, ECEF, TEME)
- GPU-accelerated atmosphere, corona, and star shaders

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/cosmic-atlas.git
cd cosmic-atlas

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
cosmic-atlas/
├── public/                 # Static assets (textures, models)
├── src/
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Core types (CelestialObject, Coordinates, etc.)
│   ├── astronomy/         # Astronomical calculations
│   │   ├── constants.ts   # Physical constants (IAU 2015)
│   │   └── coordinates.ts # Coordinate transformations
│   ├── orbits/            # Orbital mechanics
│   │   └── index.ts       # SGP4, Keplerian, JPL Horizons
│   ├── core/              # Rendering engine core
│   │   └── renderer.ts    # Floating origin, LOD, scale presets
│   ├── scene/             # React Three Fiber scene components
│   │   └── CosmicScene.tsx # Earth, Sun, Orbits, Stars, Labels
│   ├── components/        # UI components (panels, controls)
│   ├── data-providers/    # API integrations
│   │   ├── celestrak.ts   # Satellite catalog
│   │   ├── jpl-horizons.ts # Ephemeris service
│   │   ├── gaia.ts        # Gaia Archive
│   │   └── simbad.ts      # SIMBAD database
│   ├── services/          # Business logic
│   ├── hooks/             # React hooks
│   ├── utils/             # Utilities
│   ├── workers/           # Web Workers
│   └── index.ts           # Exports
├── tests/                 # Unit & integration tests
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Data Sources

| Domain | Sources |
|--------|---------|
| Earth Observation | NASA GIBS, EUMETSAT, GOES, Himawari |
| Satellites | CelesTrak (GP/OMM), Space-Track.org |
| Solar System | JPL Horizons (DE430/DE440 ephemerides) |
| Stars | ESA Gaia DR3, SIMBAD, Hipparcos, Tycho-2 |
| Galaxies | SIMBAD, NED, HyperLEDA, SDSS |
| Cosmology | Planck 2018 Lambda CDM parameters |
| Images | NASA Image Library, ESA/Hubble, JWST, ESO |

## Architecture

### Coordinate Systems
All positions stored in meters in ICRF/J2000 frame. Runtime transformations to:
- Equatorial (RA/Dec)
- Ecliptic (Lon/Lat)
- Galactic (Lon/Lat)
- Horizontal (Alt/Az) for observer
- ECEF for Earth-fixed objects

### Scale Management
Automatic scale preset switching based on camera distance.

### Floating Origin
Camera stays near (0,0,0); world shifts to maintain precision. Objects beyond ~10,000 km from camera use relative coordinates.

## License

**Code:** MIT License - see LICENSE

**Data:** Respects original licenses of each provider:
- NASA/ESA/JPL: Public domain / open access
- Gaia: ESA Gaia Data Processing Consortium
- SIMBAD: CDS Strasbourg
- CelesTrak: Dr. T.S. Kelso
- Space-Track: Requires free registration

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit changes (git commit -m 'Add amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

See CONTRIBUTING.md for details.

## Roadmap

- [x] Phase 1: Foundation - Scene, camera, Earth, basic UI
- [ ] Phase 2: Solar System - JPL Horizons, orbits, clock
- [ ] Phase 3: Satellites & Probes - SGP4, Voyager tracking
- [ ] Phase 4: Milky Way - Gaia, SIMBAD, star fields
- [ ] Phase 5: Extragalactic - Galaxy catalogs, redshift, cosmic web
- [ ] Phase 6: Polish - Performance, tests, docs, deploy

## Acknowledgments

- NASA/JPL for Horizons, SPICE, and planetary data
- ESA for Gaia, Hubble, and JWST archives
- CDS Strasbourg for SIMBAD and VizieR
- CelesTrak (Dr. T.S. Kelso) for satellite catalogs
- Three.js & React Three Fiber communities
- IAU for astronomical standards

---

Made with love for science and exploration

Cosmic Atlas - Explore the universe from your browser.
