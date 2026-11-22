/**
 * Cosmic Atlas - Core Rendering Engine
 * Three.js / React Three Fiber setup with floating origin for astronomical scales
 */

import type { Vector3D, CameraState, RenderSettings, PerformanceMetrics } from '../types';

// ============================================================================
// FLOATING ORIGIN SYSTEM
// ============================================================================

/**
 * Floating origin manager for handling large coordinate ranges
 * Keeps camera near origin (0,0,0) and shifts world instead
 */
export class FloatingOrigin {
  private origin: Vector3D = { x: 0, y: 0, z: 0 };
  private readonly threshold: number; // Distance from origin before shift (meters)
  private readonly maxCoordinate: number; // Maximum coordinate before precision loss

  constructor(threshold: number = 1e6, maxCoordinate: number = 1e12) {
    this.threshold = threshold;
    this.maxCoordinate = maxCoordinate;
  }

  /**
   * Get current origin offset
   */
  getOrigin(): Vector3D {
    return { ...this.origin };
  }

  /**
   * Check if camera position requires origin shift
   */
  needsShift(cameraPos: Vector3D): boolean {
    const dist = Math.sqrt(
      (cameraPos.x - this.origin.x) ** 2 +
      (cameraPos.y - this.origin.y) ** 2 +
      (cameraPos.z - this.origin.z) ** 2
    );
    return dist > this.threshold;
  }

  /**
   * Shift origin to keep camera near zero
   * Returns the shift vector to apply to all objects
   */
  shiftOrigin(cameraPos: Vector3D): Vector3D {
    const shift: Vector3D = {
      x: cameraPos.x - this.origin.x,
      y: cameraPos.y - this.origin.y,
      z: cameraPos.z - this.origin.z,
    };

    this.origin = { ...cameraPos };
    return shift;
  }

  /**
   * Apply origin shift to a position
   * New position = old position - shift
   */
  applyShift(position: Vector3D, shift: Vector3D): Vector3D {
    return {
      x: position.x - shift.x,
      y: position.y - shift.y,
      z: position.z - shift.z,
    };
  }

  /**
   * Convert absolute world position to relative (camera-centered) position
   */
  toRelative(worldPos: Vector3D): Vector3D {
    return {
      x: worldPos.x - this.origin.x,
      y: worldPos.y - this.origin.y,
      z: worldPos.z - this.origin.z,
    };
  }

  /**
   * Convert relative position back to absolute world position
   */
  toAbsolute(relativePos: Vector3D): Vector3D {
    return {
      x: relativePos.x + this.origin.x,
      y: relativePos.y + this.origin.y,
      z: relativePos.z + this.origin.z,
    };
  }

  /**
   * Reset origin to zero
   */
  reset(): void {
    this.origin = { x: 0, y: 0, z: 0 };
  }
}

// Singleton instance
export const floatingOrigin = new FloatingOrigin(1e7, 1e12); // 10,000 km threshold

// ============================================================================
// COORDINATE FRAMES
// ============================================================================

export type CoordinateFrame =
  | 'ICRF'           // International Celestial Reference Frame (quasi-inertial)
  | 'J2000'          // J2000 mean equator and equinox
  | 'Ecliptic'       // Ecliptic coordinates
  | 'Galactic'       // Galactic coordinates
  | 'ECEF'           // Earth-Centered Earth-Fixed (ITRF)
  | 'TEME'           // True Equator Mean Equinox (SGP4)
  | 'BodyFixed';     // Body-fixed rotating frame

/**
 * Transform position between coordinate frames
 */
export interface FrameTransform {
  from: CoordinateFrame;
  to: CoordinateFrame;
  epoch?: number;    // Julian Date for time-dependent transforms
}

/**
 * Coordinate frame transformation manager
 */
export class FrameManager {
  private transforms: Map<string, (pos: Vector3D, epoch: number) => Vector3D> = new Map();

  constructor() {
    this.registerBuiltinTransforms();
  }

  private registerBuiltinTransforms(): void {
    // ICRF <-> J2000 (essentially identical for most purposes)
    this.register('ICRF', 'J2000', (pos) => pos);
    this.register('J2000', 'ICRF', (pos) => pos);

    // ECEF <-> ICRF (requires Earth rotation)
    this.register('ECEF', 'ICRF', (pos, epoch) => this.ecefToIcrf(pos, epoch));
    this.register('ICRF', 'ECEF', (pos, epoch) => this.icrfToEcef(pos, epoch));
  }

  private register(
    from: CoordinateFrame,
    to: CoordinateFrame,
    fn: (pos: Vector3D, epoch: number) => Vector3D
  ): void {
    this.transforms.set(`${from}->${to}`, fn);
  }

  transform(pos: Vector3D, from: CoordinateFrame, to: CoordinateFrame, epoch: number): Vector3D {
    if (from === to) return pos;
    const key = `${from}->${to}`;
    const fn = this.transforms.get(key);
    if (!fn) {
      console.warn(`No transform from ${from} to ${to}`);
      return pos;
    }
    return fn(pos, epoch);
  }

  // Simplified ECEF <-> ICRF using GMST
  private ecefToIcrf(pos: Vector3D, epoch: number): Vector3D {
    // GMST in radians
    const T = (epoch - 2451545.0) / 36525;
    let gmst = 280.46061837 + 360.98564736629 * (epoch - 2451545.0) + 0.000387933 * T * T;
    gmst = (gmst % 360) * Math.PI / 180;

    // Rotate around Z
    const cos = Math.cos(gmst);
    const sin = Math.sin(gmst);
    return {
      x: pos.x * cos - pos.y * sin,
      y: pos.x * sin + pos.y * cos,
      z: pos.z,
    };
  }

  private icrfToEcef(pos: Vector3D, epoch: number): Vector3D {
    const T = (epoch - 2451545.0) / 36525;
    let gmst = 280.46061837 + 360.98564736629 * (epoch - 2451545.0) + 0.000387933 * T * T;
    gmst = (gmst % 360) * Math.PI / 180;

    const cos = Math.cos(-gmst);
    const sin = Math.sin(-gmst);
    return {
      x: pos.x * cos - pos.y * sin,
      y: pos.x * sin + pos.y * cos,
      z: pos.z,
    };
  }
}

export const frameManager = new FrameManager();

// ============================================================================
// SCALE MANAGEMENT
// ============================================================================

/**
 * Scale presets for different astronomical scales
 */
export interface ScalePreset {
  name: string;
  description: string;
  // Distance range where this preset is active (meters)
  minDistance: number;
  maxDistance: number;
  // Camera settings
  cameraNear: number;
  cameraFar: number;
  cameraFov: number;
  // Rendering
  unitScale: number;        // Meters per Three.js unit
  showOrbits: boolean;
  showLabels: boolean;
  showStars: boolean;
  showGalaxies: boolean;
  lodBias: number;
  // Visible object categories
  visibleCategories: string[];
}

export const SCALE_PRESETS: ScalePreset[] = [
  {
    name: 'Surface',
    description: 'Planetary surface view',
    minDistance: 0,
    maxDistance: 1e6, // 1,000 km
    cameraNear: 0.1,
    cameraFar: 1e6,
    cameraFov: 75,
    unitScale: 1, // 1 unit = 1 meter
    showOrbits: false,
    showLabels: true,
    showStars: true,
    showGalaxies: false,
    lodBias: 2.0,
    visibleCategories: ['surface', 'atmosphere', 'satellites-low'],
  },
  {
    name: 'Planetary',
    description: 'Planet and moons system',
    minDistance: 1e6,
    maxDistance: 1e9, // 1 million km
    cameraNear: 100,
    cameraFar: 1e9,
    cameraFov: 60,
    unitScale: 1000, // 1 unit = 1 km
    showOrbits: true,
    showLabels: true,
    showStars: true,
    showGalaxies: false,
    lodBias: 1.0,
    visibleCategories: ['planets', 'moons', 'rings', 'satellites'],
  },
  {
    name: 'SolarSystem',
    description: 'Inner/outer solar system',
    minDistance: 1e9,
    maxDistance: 1e13, // ~100 AU
    cameraNear: 1e6,
    cameraFar: 1e13,
    cameraFov: 50,
    unitScale: 1e9, // 1 unit = 1 million km
    showOrbits: true,
    showLabels: true,
    showStars: true,
    showGalaxies: false,
    lodBias: 0.5,
    visibleCategories: ['planets', 'asteroids', 'comets', 'probes', 'heliopause'],
  },
  {
    name: 'Interstellar',
    description: 'Nearby stars and Oort cloud',
    minDistance: 1e13,
    maxDistance: 1e18, // ~100 light-years
    cameraNear: 1e10,
    cameraFar: 1e18,
    cameraFov: 45,
    unitScale: 1e13, // 1 unit = 10 AU
    showOrbits: false,
    showLabels: true,
    showStars: true,
    showGalaxies: false,
    lodBias: 0.2,
    visibleCategories: ['stars', 'exoplanets', 'oort-cloud', 'probes'],
  },
  {
    name: 'Galactic',
    description: 'Milky Way structure',
    minDistance: 1e18,
    maxDistance: 1e22, // ~1 Mly
    cameraNear: 1e15,
    cameraFar: 1e22,
    cameraFov: 40,
    unitScale: 1e18, // 1 unit = ~100 ly
    showOrbits: false,
    showLabels: true,
    showStars: true,
    showGalaxies: true,
    lodBias: 0.1,
    visibleCategories: ['stars', 'nebulae', 'clusters', 'galactic-center', 'spiral-arms'],
  },
  {
    name: 'Cosmological',
    description: 'Galaxies and large-scale structure',
    minDistance: 1e22,
    maxDistance: 1e27, // Observable universe
    cameraNear: 1e19,
    cameraFar: 1e27,
    cameraFov: 35,
    unitScale: 1e22, // 1 unit = ~1 Mly
    showOrbits: false,
    showLabels: false,
    showStars: false,
    showGalaxies: true,
    lodBias: 0.05,
    visibleCategories: ['galaxies', 'clusters', 'superclusters', 'filaments', 'voids', 'cmb'],
  },
];

/**
 * Get appropriate scale preset for camera distance
 */
export function getScalePreset(distance: number): ScalePreset {
  for (const preset of SCALE_PRESETS) {
    if (distance >= preset.minDistance && distance < preset.maxDistance) {
      return preset;
    }
  }
  // Default to largest scale
  return SCALE_PRESETS[SCALE_PRESETS.length - 1];
}

/**
 * Interpolate between two scale presets for smooth transitions
 */
export function interpolateScale(
  presetA: ScalePreset,
  presetB: ScalePreset,
  t: number // 0-1
): ScalePreset {
  const lerp = (a: number, b: number) => a + (b - a) * t;

  return {
    name: `Transition (${Math.round(t * 100)}%)`,
    description: `Between ${presetA.name} and ${presetB.name}`,
    minDistance: lerp(presetA.minDistance, presetB.minDistance),
    maxDistance: lerp(presetA.maxDistance, presetB.maxDistance),
    cameraNear: lerp(presetA.cameraNear, presetB.cameraNear),
    cameraFar: lerp(presetA.cameraFar, presetB.cameraFar),
    cameraFov: lerp(presetA.cameraFov, presetB.cameraFov),
    unitScale: lerp(presetA.unitScale, presetB.unitScale),
    showOrbits: t < 0.5 ? presetA.showOrbits : presetB.showOrbits,
    showLabels: t < 0.5 ? presetA.showLabels : presetB.showLabels,
    showStars: t < 0.5 ? presetA.showStars : presetB.showStars,
    showGalaxies: t < 0.5 ? presetA.showGalaxies : presetB.showGalaxies,
    lodBias: lerp(presetA.lodBias, presetB.lodBias),
    visibleCategories: t < 0.5 ? presetA.visibleCategories : presetB.visibleCategories,
  };
}

// ============================================================================
// UNIT CONVERSION FOR RENDERING
// ============================================================================

/**
 * Convert astronomical distance (meters) to Three.js units based on current scale
 */
export function metersToThreeUnits(meters: number, unitScale: number): number {
  return meters / unitScale;
}

/**
 * Convert Three.js units to astronomical distance (meters)
 */
export function threeUnitsToMeters(units: number, unitScale: number): number {
  return units * unitScale;
}

/**
 * Scale object size for rendering at current scale
 * Prevents objects from becoming too small or too large
 */
export function scaleForRender(
  radiusMeters: number,
  distanceMeters: number,
  unitScale: number,
  minPixels: number = 2,
  maxScale: number = 100
): number {
  const angularSize = radiusMeters / distanceMeters; // radians
  const screenSize = angularSize * (window.innerHeight / 2) * (180 / Math.PI) / 0.5; // approximate

  let scale = 1;
  if (screenSize < minPixels) {
    scale = minPixels / screenSize;
  }
  return Math.min(scale, maxScale);
}

// ============================================================================
// LEVEL OF DETAIL (LOD)
// ============================================================================

export interface LODLevel {
  distance: number;      // Maximum distance for this level (meters)
  detail: 'high' | 'medium' | 'low' | 'billboard' | 'culled';
  geometry?: string;     // Geometry type or path
  textureResolution?: number;
  maxInstances?: number;
}

export const DEFAULT_LOD_LEVELS: LODLevel[] = [
  { distance: 1e6, detail: 'high', maxInstances: 100 },
  { distance: 1e9, detail: 'medium', maxInstances: 1000 },
  { distance: 1e12, detail: 'low', maxInstances: 10000 },
  { distance: 1e15, detail: 'billboard', maxInstances: 100000 },
  { distance: Infinity, detail: 'culled', maxInstances: 0 },
];

/**
 * Determine LOD level for object at given distance
 */
export function getLODLevel(distance: number, levels: LODLevel[] = DEFAULT_LOD_LEVELS): LODLevel {
  for (const level of levels) {
    if (distance <= level.distance) {
      return level;
    }
  }
  return levels[levels.length - 1];
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export class PerformanceMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    memoryUsage: 0,
    lodStats: { high: 0, medium: 0, low: 0, culled: 0 },
  };
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];

  update(renderer?: THREE.WebGLRenderer): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.frames.push(delta);
    if (this.frames.length > 60) this.frames.shift();

    this.frameCount++;
    this.lastTime = now;

    // Calculate FPS
    const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    this.metrics.fps = 1000 / avgFrameTime;
    this.metrics.frameTime = avgFrameTime;

    // Get renderer info if available
    if (renderer) {
      const info = renderer.info;
      this.metrics.drawCalls = info.render.calls;
      this.metrics.triangles = info.render.triangles;
      this.metrics.geometries = info.memory.geometries;
      this.metrics.textures = info.memory.textures;
      // Memory in MB (approximate)
      this.metrics.memoryUsage = (info.memory.geometries * 100 + info.memory.textures * 50) / 1024;
    }

    // Notify callbacks
    this.callbacks.forEach(cb => cb(this.metrics));
  }

  onMetricsUpdate(cb: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(cb);
    return () => {
      const idx = this.callbacks.indexOf(cb);
      if (idx >= 0) this.callbacks.splice(idx, 1);
    };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  updateLODStats(stats: PerformanceMetrics['lodStats']): void {
    this.metrics.lodStats = stats;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// THREE.JS EXTENSIONS
// ============================================================================

// Extend THREE namespace for custom attributes
declare module 'three' {
  interface Object3D {
    __cosmicAtlas?: {
      objectId: string;
      category: string;
      absolutePosition: Vector3D;
      lodLevel: string;
      lastUpdate: number;
    };
  }
}

/**
 * Attach metadata to Three.js object
 */
export function attachMetadata(
  object: THREE.Object3D,
  objectId: string,
  category: string,
  absolutePosition: Vector3D
): void {
  object.__cosmicAtlas = {
    objectId,
    category,
    absolutePosition,
    lodLevel: 'high',
    lastUpdate: Date.now(),
  };
}

/**
 * Get metadata from Three.js object
 */
export function getMetadata(object: THREE.Object3D): THREE.Object3D['__cosmicAtlas'] {
  return object.__cosmicAtlas;
}

// ============================================================================
// RENDER SETTINGS DEFAULTS
// ============================================================================

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  resolutionScale: 1,
  antialias: true,
  toneMapping: 'aces-filmic',
  exposure: 1,
  bloom: {
    enabled: true,
    strength: 0.5,
    radius: 0.5,
    threshold: 0.8,
  },
  ssao: {
    enabled: false,
    radius: 5,
    intensity: 1,
  },
  frustumCulling: true,
  instancing: true,
  lodEnabled: true,
  maxObjectsPerFrame: 1000,
  starField: {
    enabled: true,
    density: 10000,
    magnitudeLimit: 6.5,
    showConstellations: false,
  },
  galaxyBackground: {
    enabled: true,
    opacity: 0.3,
  },
};

// Need to import THREE for type declarations
import type * as THREE from 'three';