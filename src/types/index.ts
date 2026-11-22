/**
 * Cosmic Atlas - Core Type Definitions
 * Centralized types for the entire astronomical visualization platform
 */

// ============================================================================
// COORDINATE SYSTEMS
// ============================================================================

/**
 * 3D Cartesian coordinates in meters
 * Uses floating origin technique: coordinates are relative to camera position
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Spherical coordinates
 */
export interface SphericalCoordinates {
  radius: number;      // Distance from origin (meters)
  theta: number;       // Polar angle (radians, 0 to PI) - inclination from +Z axis
  phi: number;         // Azimuthal angle (radians, 0 to 2*PI) - rotation around Z axis
}

/**
 * Equatorial coordinates (J2000 epoch)
 */
export interface EquatorialCoordinates {
  rightAscension: number;   // RA in hours (0-24) or degrees (0-360)
  declination: number;      // Dec in degrees (-90 to +90)
  distance?: number;        // Distance in parsecs or light-years
  epoch?: string;           // Reference epoch (default: "J2000")
}

/**
 * Ecliptic coordinates
 */
export interface EclipticCoordinates {
  longitude: number;    // Ecliptic longitude in degrees (0-360)
  latitude: number;     // Ecliptic latitude in degrees (-90 to +90)
  distance?: number;    // Distance in AU
}

/**
 * Galactic coordinates
 */
export interface GalacticCoordinates {
  longitude: number;    // Galactic longitude in degrees (0-360)
  latitude: number;     // Galactic latitude in degrees (-90 to +90)
  distance?: number;    // Distance in parsecs
}

/**
 * Horizontal coordinates (observer-dependent)
 */
export interface HorizontalCoordinates {
  azimuth: number;      // Azimuth in degrees (0-360, North=0)
  altitude: number;     // Altitude in degrees (-90 to +90)
  distance?: number;    // Distance in meters
}

// ============================================================================
// TIME & EPHEMERIS
// ============================================================================

/**
 * Astronomical time representation
 */
export interface AstronomicalTime {
  utc: Date;                    // UTC timestamp
  jd: number;                   // Julian Date
  tt?: number;                  // Terrestrial Time (Julian Date)
  ut1?: number;                 // UT1 (Julian Date)
  tai?: number;                 // International Atomic Time (Julian Date)
  deltaT?: number;              // TT - UT1 (seconds)
}

/**
 * Simulation clock state
 */
export interface SimulationClock {
  currentTime: AstronomicalTime;
  timeScale: number;            // 1 = real-time, >1 = accelerated, <0 = reverse
  isPaused: boolean;
  referenceFrame: 'inertial' | 'rotating' | 'body-fixed';
}

// ============================================================================
// CELESTIAL OBJECTS
// ============================================================================

export type CelestialObjectType =
  | 'star'
  | 'planet'
  | 'dwarf-planet'
  | 'moon'
  | 'asteroid'
  | 'comet'
  | 'satellite'
  | 'space-probe'
  | 'space-station'
  | 'nebula'
  | 'galaxy'
  | 'globular-cluster'
  | 'open-cluster'
  | 'black-hole'
  | 'supernova-remnant'
  | 'quasar'
  | 'cosmic-structure'
  | 'unknown';

export type ObjectCategory =
  | 'solar-system'
  | 'near-earth'
  | 'stellar'
  | 'galactic'
  | 'extragalactic'
  | 'cosmological'
  | 'artificial';

/**
 * Data source classification
 */
export type DataSourceType =
  | 'observed'          // Direct observational data
  | 'calculated'        // Computed from orbital elements / ephemerides
  | 'estimated'         // Derived from models with uncertainty
  | 'simulated'         // Numerical simulation result
  | 'illustrative';     // Artistic representation, not scientific data

/**
 * Data freshness state
 */
export type DataFreshness =
  | 'current'           // Updated within expected refresh interval
  | 'stale'             // Older than refresh interval but valid
  | 'historical'        // Fixed historical record
  | 'unknown';          // Freshness cannot be determined

/**
 * Core celestial object interface
 */
export interface CelestialObject {
  // Identity
  id: string;                           // Unique internal ID
  name: string;                         // Common name
  designations: string[];               // All known designations (catalog IDs, etc.)
  type: CelestialObjectType;
  category: ObjectCategory;

  // Physical properties
  radius?: number;                      // Mean radius in meters
  mass?: number;                        // Mass in kg
  gravity?: number;                     // Surface gravity in m/s²
  rotationPeriod?: number;              // Sidereal rotation period in seconds
  axialTilt?: number;                   // Axial tilt in degrees
  albedo?: number;                      // Bond albedo (0-1)
  temperature?: number;                 // Effective temperature in Kelvin
  luminosity?: number;                  // Luminosity in solar units (L☉)
  absoluteMagnitude?: number;           // Absolute magnitude
  spectralType?: string;                // Spectral classification

  // Orbital elements (for orbiting bodies)
  orbitalElements?: OrbitalElements;

  // Position & motion (computed for current time)
  position?: Vector3D;                  // Current position in scene coordinates (meters)
  velocity?: Vector3D;                  // Current velocity vector (m/s)
  coordinates?: {
    equatorial?: EquatorialCoordinates;
    ecliptic?: EclipticCoordinates;
    galactic?: GalacticCoordinates;
    horizontal?: HorizontalCoordinates; // Observer-dependent
  };

  // Data provenance
  dataSource: DataSourceType;
  dataFreshness: DataFreshness;
  lastUpdated: Date;                    // When this object's data was last refreshed
  sources: DataSource[];                // References to data providers

  // Visual representation
  visual?: VisualProperties;

  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Orbital elements (Keplerian / osculating)
 */
export interface OrbitalElements {
  epoch: AstronomicalTime;              // Epoch of elements
  semiMajorAxis: number;                // a (meters or AU)
  eccentricity: number;                 // e (0-1 for ellipses)
  inclination: number;                  // i (degrees)
  longitudeOfAscendingNode: number;     // Ω (degrees)
  argumentOfPeriapsis: number;          // ω (degrees)
  meanAnomaly: number;                  // M (degrees) at epoch
  meanMotion?: number;                  // n (degrees/day)
  period?: number;                      // Orbital period (seconds)
  referenceFrame: 'ICRF' | 'J2000' | 'Ecliptic' | 'Body-fixed';
  // For perturbed orbits
  perturbations?: string[];             // Applied perturbation models
}

/**
 * Visual properties for rendering
 */
export interface VisualProperties {
  // Geometry
  geometryType: 'sphere' | 'ellipsoid' | 'custom' | 'sprite' | 'point-cloud' | 'orbit-line';
  customModel?: string;                 // Path to GLTF/GLB model

  // Materials
  textureMaps?: {
    diffuse?: string;                   // Albedo/base color texture
    normal?: string;                    // Normal map
    specular?: string;                  // Specular/roughness map
    emission?: string;                  // Emission map (for stars, hot objects)
    clouds?: string;                    // Cloud layer texture (Earth, Venus, etc.)
    rings?: string;                     // Ring texture (Saturn, etc.)
    height?: string;                    // Displacement/height map
  };
  color?: number;                       // Base color (hex) if no texture
  emissiveColor?: number;               // Emission color (hex)
  emissiveIntensity?: number;           // Emission strength

  // Atmosphere / corona
  atmosphere?: {
    enabled: boolean;
    color: number;
    innerRadius: number;                // Planet radius
    outerRadius: number;                // Atmosphere outer radius
    density: number;                    // Rayleigh scattering density
  };
  corona?: {
    enabled: boolean;
    color: number;
    size: number;                       // Multiplier on object radius
  };

  // Rings
  rings?: {
    enabled: boolean;
    innerRadius: number;
    outerRadius: number;
    texture?: string;
    color: number;
    opacity: number;
  };

  // Label / UI
  label?: {
    show: boolean;
    text: string;
    offset: Vector3D;
    minScale: number;                   // Minimum label size
    maxScale: number;                   // Maximum label size
    distanceFadeStart: number;          // Distance where fade begins
    distanceFadeEnd: number;            // Distance where fully faded
  };

  // Level of detail
  lod?: {
    highDistance: number;               // Switch to high detail within this distance
    mediumDistance: number;             // Switch to medium detail
    lowDistance: number;                // Switch to low detail (billboard/sprite)
  };
}

/**
 * Data source reference
 */
export interface DataSource {
  id: string;                           // Provider identifier (e.g., "jpl-horizons", "gaia-dr3")
  name: string;                         // Human-readable name
  url: string;                          // API endpoint or catalog URL
  accessedAt: Date;                     // When data was retrieved
  license?: string;                     // Data license
  citation?: string;                    // Scientific citation
  version?: string;                     // Data version/release
}

/**
 * Search result for object lookup
 */
export interface SearchResult {
  object: CelestialObject;
  score: number;                        // Relevance score (0-1)
  matchedFields: string[];              // Which fields matched the query
}

// ============================================================================
// CAMERA & NAVIGATION
// ============================================================================

/**
 * Camera state for orbital navigation
 */
export interface CameraState {
  position: Vector3D;                   // World position
  target: Vector3D;                     // Look-at target
  up: Vector3D;                         // Up vector
  fov: number;                          // Field of view (degrees)
  near: number;                         // Near clipping plane
  far: number;                          // Far clipping plane
  // Orbital parameters (when in orbit mode)
  orbit?: {
    enabled: boolean;
    center: Vector3D;                   // Orbit center
    radius: number;                     // Distance from center
    phi: number;                        // Azimuthal angle
    theta: number;                      // Polar angle
  };
  // Follow mode
  followTarget?: string;                // Object ID being followed
  // Floating origin
  floatingOrigin: Vector3D;             // Current origin offset
}

/**
 * Navigation presets for scale transitions
 */
export interface ScalePreset {
  id: string;
  name: string;
  description: string;
  cameraState: Partial<CameraState>;
  visibleLayers: string[];              // Which object categories to show
  lodBias: number;                      // LOD adjustment for this scale
}

// ============================================================================
// RENDERING & PERFORMANCE
// ============================================================================

/**
 * Render quality settings
 */
export interface RenderSettings {
  // Resolution
  pixelRatio: number;                   // Device pixel ratio clamp
  resolutionScale: number;              // Internal render resolution (0.5-2.0)

  // Quality
  antialias: boolean;
  toneMapping: 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces-filmic';
  exposure: number;
  bloom: {
    enabled: boolean;
    strength: number;
    radius: number;
    threshold: number;
  };
  ssao: {
    enabled: boolean;
    radius: number;
    intensity: number;
  };

  // Performance
  frustumCulling: boolean;
  instancing: boolean;
  lodEnabled: boolean;
  maxObjectsPerFrame: number;           // Budget for progressive loading

  // Astronomical
  starField: {
    enabled: boolean;
    density: number;                    // Stars per steradian
    magnitudeLimit: number;             // Limiting magnitude
    showConstellations: boolean;
  };
  galaxyBackground: {
    enabled: boolean;
    texture?: string;
    opacity: number;
  };
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;                    // ms
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryUsage: number;                  // MB (GPU)
  lodStats: {
    high: number;
    medium: number;
    low: number;
    culled: number;
  };
}

// ============================================================================
// DATA PROVIDERS
// ============================================================================

/**
 * Generic data provider interface
 */
export interface DataProvider<T = unknown> {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerDay?: number;
  };
  authentication?: {
    type: 'api-key' | 'oauth' | 'none';
    credentials?: Record<string, string>;
  };
  // Methods implemented by provider
  fetchObjects(query: ProviderQuery): Promise<ProviderResponse<T>>;
  fetchObjectById(id: string): Promise<T | null>;
  search(query: string): Promise<SearchResult[]>;
}

/**
 * Query parameters for data providers
 */
export interface ProviderQuery {
  // Spatial filters
  region?: {
    center: EquatorialCoordinates | GalacticCoordinates;
    radius: number;                     // Degrees
  };
  // Object filters
  types?: CelestialObjectType[];
  categories?: ObjectCategory[];
  magnitudeRange?: [number, number];
  distanceRange?: [number, number];     // Parsecs or AU depending on context
  // Temporal
  epoch?: AstronomicalTime;
  // Pagination
  limit?: number;
  offset?: number;
  // Output
  fields?: string[];                    // Specific fields to return
  format?: 'json' | 'csv' | 'votable';
}

/**
 * Standardized provider response
 */
export interface ProviderResponse<T> {
  data: T[];
  totalCount?: number;
  pageInfo?: {
    hasNextPage: boolean;
    nextCursor?: string;
  };
  metadata: {
    source: string;
    query: ProviderQuery;
    fetchedAt: Date;
    cacheExpiry?: Date;
    warnings?: string[];
  };
}

// ============================================================================
// UI STATE
// ============================================================================

/**
 * Selected object state
 */
export interface SelectionState {
  objectId: string | null;
  previousObjectId: string | null;
  mode: 'info' | 'follow' | 'orbit' | 'track';
}

/**
 * UI panel visibility
 */
export interface UIPanelState {
  search: boolean;
  objectInfo: boolean;
  navigation: boolean;
  clock: boolean;
  filters: boolean;
  settings: boolean;
  performance: boolean;
}

/**
 * Active filters
 */
export interface ActiveFilters {
  categories: Set<ObjectCategory>;
  types: Set<CelestialObjectType>;
  dataSources: Set<DataSourceType>;
  freshness: Set<DataFreshness>;
  magnitudeLimit: number;
  distanceLimit: number;                // Maximum distance to show (parsecs)
  showOrbits: boolean;
  showLabels: boolean;
  showConstellations: boolean;
  showGrid: boolean;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface AppError {
  code: string;
  message: string;
  source: string;                       // Module/component where error originated
  severity: 'error' | 'warning' | 'info';
  timestamp: Date;
  recoverable: boolean;
  context?: Record<string, unknown>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AppConfig {
  // API endpoints
  apis: {
    jplHorizons: string;
    celestrak: string;
    spaceTrack: string;
    gaia: string;
    simbad: string;
    ned: string;
    nasaImages: string;
    esaImages: string;
  };
  // Cache settings
  cache: {
    enabled: boolean;
    maxAge: number;                     // Seconds
    storage: 'memory' | 'indexeddb' | 'both';
  };
  // Default render settings
  render: RenderSettings;
  // Default camera
  camera: {
    initialPosition: Vector3D;
    initialTarget: Vector3D;
    minDistance: number;
    maxDistance: number;
  };
  // Feature flags
  features: {
    webWorkers: boolean;
    wasm: boolean;
    progressiveLoading: boolean;
    offlineMode: boolean;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep partial for configuration merging
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Event emitter pattern for internal communication
 */
export interface AppEventMap {
  'object:select': { objectId: string | null };
  'camera:move': { state: CameraState };
  'time:change': { time: AstronomicalTime; scale: number };
  'data:update': { providerId: string; objectCount: number };
  'error': { error: AppError };
  'performance:metrics': { metrics: PerformanceMetrics };
  'layer:toggle': { layer: string; visible: boolean };
  'filter:change': { filters: ActiveFilters };
}

export type AppEvent<K extends keyof AppEventMap> = {
  type: K;
  payload: AppEventMap[K];
};

export type AppEventHandler<K extends keyof AppEventMap> = (event: AppEvent<K>) => void;