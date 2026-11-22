/**
 * Cosmic Atlas - Main App Component
 * Application shell with UI panels, navigation, and state management
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CosmicScene, Earth, Sun, Orbit, StarField, Label } from './scene/CosmicScene';
import type { CelestialObject, ObjectCategory, CameraState, ActiveFilters, DataSourceType, DataFreshness } from './types';
import type { PLANETS, SUN } from './astronomy/constants';

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const createMockObjects = (): CelestialObject[] => [
  // Sun
  {
    id: 'sun',
    name: 'Sun',
    designations: ['Sol', 'G2V'],
    type: 'star',
    category: 'solar-system',
    radius: 695700000,
    mass: 1.98855e30,
    temperature: 5778,
    luminosity: 1,
    spectralType: 'G2V',
    absoluteMagnitude: 4.83,
    orbitalElements: undefined,
    position: { x: 0, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 0 },
      ecliptic: { longitude: 0, latitude: 0, distance: 0 },
    },
    dataSource: 'observed',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xffcc00,
      emissiveColor: 0xffcc00,
      emissiveIntensity: 1,
      label: { show: true, text: 'Sun', offset: { x: 0, y: 0, z: 0 }, minScale: 1, maxScale: 2, distanceFadeStart: 1e9, distanceFadeEnd: 1e11 },
    },
  },
  // Mercury
  {
    id: 'mercury',
    name: 'Mercury',
    designations: ['Mercury', '199'],
    type: 'planet',
    category: 'solar-system',
    radius: 2439700,
    mass: 3.3011e23,
    gravity: 3.7,
    rotationPeriod: 5067000,
    axialTilt: 0.034,
    albedo: 0.068,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 57909000000,
      eccentricity: 0.205630,
      inclination: 7.00487,
      longitudeOfAscendingNode: 48.3313,
      argumentOfPeriapsis: 29.124,
      meanAnomaly: 174.796,
      referenceFrame: 'J2000',
    },
    position: { x: 57909000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 0.387 },
      ecliptic: { longitude: 0, latitude: 0, distance: 0.387 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xb5b5b5,
      label: { show: true, text: 'Mercury', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e8, distanceFadeEnd: 1e10 },
    },
  },
  // Venus
  {
    id: 'venus',
    name: 'Venus',
    designations: ['Venus', '299'],
    type: 'planet',
    category: 'solar-system',
    radius: 6051800,
    mass: 4.8675e24,
    gravity: 8.87,
    rotationPeriod: -20996800,
    axialTilt: 177.36,
    albedo: 0.90,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 108209000000,
      eccentricity: 0.006772,
      inclination: 3.39471,
      longitudeOfAscendingNode: 76.680,
      argumentOfPeriapsis: 54.884,
      meanAnomaly: 50.115,
      referenceFrame: 'J2000',
    },
    position: { x: 108209000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 0.723 },
      ecliptic: { longitude: 0, latitude: 0, distance: 0.723 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xe6c87a,
      label: { show: true, text: 'Venus', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e8, distanceFadeEnd: 1e10 },
    },
  },
  // Earth
  {
    id: 'earth',
    name: 'Earth',
    designations: ['Earth', 'Terra', '399'],
    type: 'planet',
    category: 'solar-system',
    radius: 6371008,
    mass: 5.9722e24,
    gravity: 9.81,
    rotationPeriod: 86164,
    axialTilt: 23.44,
    albedo: 0.306,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 149597870700,
      eccentricity: 0.0167086,
      inclination: 0.00005,
      longitudeOfAscendingNode: 0,
      argumentOfPeriapsis: 102.94,
      meanAnomaly: 357.517,
      referenceFrame: 'J2000',
    },
    position: { x: 149597870700, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 1.0 },
      ecliptic: { longitude: 0, latitude: 0, distance: 1.0 },
    },
    dataSource: 'observed',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [
      { id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() },
      { id: 'nasa-gibs', name: 'NASA GIBS', url: 'https://gibs.earthdata.nasa.gov/', accessedAt: new Date() },
    ],
    visual: {
      geometryType: 'sphere',
      textureMaps: {
        diffuse: '/textures/earth/day.jpg',
        normal: '/textures/earth/normal.jpg',
        specular: '/textures/earth/specular.jpg',
        clouds: '/textures/earth/clouds.png',
        emission: '/textures/earth/night.jpg',
      },
      atmosphere: {
        enabled: true,
        color: 0x3366ff,
        innerRadius: 6371008,
        outerRadius: 6471008,
        density: 1.0,
      },
      label: { show: true, text: 'Earth', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 2, distanceFadeStart: 1e7, distanceFadeEnd: 1e9 },
    },
  },
  // Mars
  {
    id: 'mars',
    name: 'Mars',
    designations: ['Mars', '499'],
    type: 'planet',
    category: 'solar-system',
    radius: 3389500,
    mass: 6.4171e23,
    gravity: 3.71,
    rotationPeriod: 88643,
    axialTilt: 25.19,
    albedo: 0.25,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 227940000000,
      eccentricity: 0.093412,
      inclination: 1.85061,
      longitudeOfAscendingNode: 49.558,
      argumentOfPeriapsis: 286.502,
      meanAnomaly: 19.373,
      referenceFrame: 'J2000',
    },
    position: { x: 227940000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 1.524 },
      ecliptic: { longitude: 0, latitude: 0, distance: 1.524 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xc1440e,
      label: { show: true, text: 'Mars', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e8, distanceFadeEnd: 1e10 },
    },
  },
  // Jupiter
  {
    id: 'jupiter',
    name: 'Jupiter',
    designations: ['Jupiter', '599'],
    type: 'planet',
    category: 'solar-system',
    radius: 69911000,
    mass: 1.8982e27,
    gravity: 24.79,
    rotationPeriod: 35730,
    axialTilt: 3.13,
    albedo: 0.503,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 778330000000,
      eccentricity: 0.048392,
      inclination: 1.30530,
      longitudeOfAscendingNode: 100.464,
      argumentOfPeriapsis: 273.867,
      meanAnomaly: 20.020,
      referenceFrame: 'J2000',
    },
    position: { x: 778330000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 5.203 },
      ecliptic: { longitude: 0, latitude: 0, distance: 5.203 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xd4a574,
      label: { show: true, text: 'Jupiter', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 2, distanceFadeStart: 1e9, distanceFadeEnd: 1e11 },
    },
  },
  // Saturn
  {
    id: 'saturn',
    name: 'Saturn',
    designations: ['Saturn', '699'],
    type: 'planet',
    category: 'solar-system',
    radius: 58232000,
    mass: 5.6834e26,
    gravity: 10.44,
    rotationPeriod: 38350,
    axialTilt: 26.73,
    albedo: 0.342,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 1427000000000,
      eccentricity: 0.054150,
      inclination: 2.48446,
      longitudeOfAscendingNode: 113.665,
      argumentOfPeriapsis: 339.392,
      meanAnomaly: 317.020,
      referenceFrame: 'J2000',
    },
    position: { x: 1427000000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 9.537 },
      ecliptic: { longitude: 0, latitude: 0, distance: 9.537 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xf4e4bc,
      rings: {
        enabled: true,
        innerRadius: 74658000,
        outerRadius: 136775000,
        color: 0xc9b896,
        opacity: 0.7,
      },
      label: { show: true, text: 'Saturn', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 2, distanceFadeStart: 1e9, distanceFadeEnd: 1e11 },
    },
  },
  // Uranus
  {
    id: 'uranus',
    name: 'Uranus',
    designations: ['Uranus', '799'],
    type: 'planet',
    category: 'solar-system',
    radius: 25362000,
    mass: 8.6810e25,
    gravity: 8.87,
    rotationPeriod: -62060,
    axialTilt: 97.77,
    albedo: 0.300,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 2871000000000,
      eccentricity: 0.047167,
      inclination: 0.76986,
      longitudeOfAscendingNode: 74.006,
      argumentOfPeriapsis: 96.999,
      meanAnomaly: 142.238,
      referenceFrame: 'J2000',
    },
    position: { x: 2871000000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 19.191 },
      ecliptic: { longitude: 0, latitude: 0, distance: 19.191 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0x4fd0e7,
      label: { show: true, text: 'Uranus', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e10, distanceFadeEnd: 1e12 },
    },
  },
  // Neptune
  {
    id: 'neptune',
    name: 'Neptune',
    designations: ['Neptune', '899'],
    type: 'planet',
    category: 'solar-system',
    radius: 24622000,
    mass: 1.0241e26,
    gravity: 11.15,
    rotationPeriod: 57960,
    axialTilt: 28.32,
    albedo: 0.290,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 4495100000000,
      eccentricity: 0.008585,
      inclination: 1.76917,
      longitudeOfAscendingNode: 131.784,
      argumentOfPeriapsis: 272.846,
      meanAnomaly: 256.225,
      referenceFrame: 'J2000',
    },
    position: { x: 4495100000000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 30.07 },
      ecliptic: { longitude: 0, latitude: 0, distance: 30.07 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0x4b70dd,
      label: { show: true, text: 'Neptune', offset: { x: 0, y: 0, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e10, distanceFadeEnd: 1e12 },
    },
  },
  // Moon
  {
    id: 'moon',
    name: 'Moon',
    designations: ['Moon', 'Luna', '301'],
    type: 'moon',
    category: 'solar-system',
    radius: 1737400,
    mass: 7.342e22,
    gravity: 1.62,
    rotationPeriod: 2360591,
    axialTilt: 6.68,
    albedo: 0.136,
    orbitalElements: {
      epoch: { utc: new Date(), jd: 2451545.0 },
      semiMajorAxis: 384400000,
      eccentricity: 0.0549,
      inclination: 5.145,
      longitudeOfAscendingNode: 125.08,
      argumentOfPeriapsis: 318.15,
      meanAnomaly: 135.27,
      referenceFrame: 'Body-fixed',
    },
    position: { x: 149597870700 + 384400000, y: 0, z: 0 },
    coordinates: {
      equatorial: { rightAscension: 0, declination: 0, distance: 1.00257 },
      ecliptic: { longitude: 0, latitude: 0, distance: 1.00257 },
    },
    dataSource: 'observed',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [{ id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() }],
    visual: {
      geometryType: 'sphere',
      color: 0xaaaaaa,
      label: { show: true, text: 'Moon', offset: { x: 0, y: 0, z: 0 }, minScale: 0.3, maxScale: 1, distanceFadeStart: 1e7, distanceFadeEnd: 1e9 },
    },
  },
  // Voyager 1
  {
    id: 'voyager1',
    name: 'Voyager 1',
    designations: ['Voyager 1', '1977-084A', '-31'],
    type: 'space-probe',
    category: 'solar-system',
    mass: 722,
    orbitalElements: undefined,
    position: { x: 2.3e13, y: 1.1e13, z: -5.2e12 },
    coordinates: {
      equatorial: { rightAscension: 17.16, declination: 12.12, distance: 159.5 },
      ecliptic: { longitude: 262.5, latitude: 34.8, distance: 159.5 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [
      { id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() },
      { id: 'voyager-mission', name: 'Voyager Mission', url: 'https://voyager.jpl.nasa.gov/', accessedAt: new Date() },
    ],
    visual: {
      geometryType: 'custom',
      customModel: '/models/voyager.glb',
      label: { show: true, text: 'Voyager 1', offset: { x: 0, y: 5, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e10, distanceFadeEnd: 1e13 },
    },
    metadata: {
      launchDate: '1977-09-05',
      mission: 'Voyager',
      status: 'active',
      distanceFromSun: 159.5,
      heliocentricVelocity: 16.9,
      signalTime: '22h 30m',
    },
  },
  // Voyager 2
  {
    id: 'voyager2',
    name: 'Voyager 2',
    designations: ['Voyager 2', '1977-076A', '-32'],
    type: 'space-probe',
    category: 'solar-system',
    mass: 722,
    orbitalElements: undefined,
    position: { x: 1.9e13, y: -1.3e13, z: -6.1e12 },
    coordinates: {
      equatorial: { rightAscension: 20.08, declination: -58.9, distance: 132.3 },
      ecliptic: { longitude: 301.2, latitude: -28.5, distance: 132.3 },
    },
    dataSource: 'calculated',
    dataFreshness: 'current',
    lastUpdated: new Date(),
    sources: [
      { id: 'jpl-horizons', name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', accessedAt: new Date() },
      { id: 'voyager-mission', name: 'Voyager Mission', url: 'https://voyager.jpl.nasa.gov/', accessedAt: new Date() },
    ],
    visual: {
      geometryType: 'custom',
      customModel: '/models/voyager.glb',
      label: { show: true, text: 'Voyager 2', offset: { x: 0, y: 5, z: 0 }, minScale: 0.5, maxScale: 1.5, distanceFadeStart: 1e10, distanceFadeEnd: 1e13 },
    },
    metadata: {
      launchDate: '1977-08-20',
      mission: 'Voyager',
      status: 'active',
      distanceFromSun: 132.3,
      heliocentricVelocity: 15.2,
      signalTime: '18h 35m',
    },
  },
];

// ============================================================================
// SEARCH & FILTER
// ============================================================================

const SEARCH_SUGGESTIONS = [
  'Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
  'Moon', 'Voyager 1', 'Voyager 2', 'Alpha Centauri', 'Sirius', 'Betelgeuse',
  'Andromeda', 'Sagittarius A*', 'Messier 31', 'Messier 87', 'JWST', 'Hubble', 'ISS',
];

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

interface AppState {
  // Camera
  cameraState: CameraState;
  // Selection
  selectedObjectId: string | null;
  // UI Panels
  panels: {
    search: boolean;
    objectInfo: boolean;
    navigation: boolean;
    clock: boolean;
    filters: boolean;
    settings: boolean;
  };
  // Clock
  simulationTime: Date;
  timeScale: number;
  isPaused: boolean;
  // Filters
  filters: ActiveFilters;
  // Search
  searchQuery: string;
  searchResults: CelestialObject[];
  // Data
  objects: CelestialObject[];
}

const initialState: AppState = {
  cameraState: {
    position: { x: 0, y: 0, z: 100 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    fov: 50,
    near: 0.1,
    far: 1e12,
    floatingOrigin: { x: 0, y: 0, z: 0 },
  },
  selectedObjectId: null,
  panels: {
    search: true,
    objectInfo: false,
    navigation: true,
    clock: true,
    filters: false,
    settings: false,
  },
  simulationTime: new Date(),
  timeScale: 1,
  isPaused: false,
  filters: {
    categories: new Set(['solar-system', 'near-earth', 'stellar', 'galactic', 'extragalactic', 'cosmological', 'artificial']),
    types: new Set(['star', 'planet', 'dwarf-planet', 'moon', 'asteroid', 'comet', 'satellite', 'space-probe', 'space-station', 'nebula', 'galaxy', 'globular-cluster', 'open-cluster', 'black-hole', 'supernova-remnant', 'quasar', 'cosmic-structure', 'unknown']),
    dataSources: new Set(['observed', 'calculated', 'estimated', 'simulated', 'illustrative']),
    freshness: new Set(['current', 'stale', 'historical', 'unknown']),
    magnitudeLimit: 6.5,
    distanceLimit: 1e27,
    showOrbits: true,
    showLabels: true,
    showConstellations: false,
    showGrid: false,
  },
  searchQuery: '',
  searchResults: [],
  objects: createMockObjects(),
};

export const CosmicAtlasApp: React.FC = () => {
  const [state, setState] = useState<AppState>(initialState);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // Handle camera changes from scene
  const handleCameraChange = useCallback((cameraState: Partial<CameraState>) => {
    setState(prev => ({
      ...prev,
      cameraState: { ...prev.cameraState, ...cameraState },
    }));
  }, []);

  // Handle object selection
  const selectObject = useCallback((objectId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedObjectId: objectId,
      panels: { ...prev.panels, objectInfo: objectId !== null },
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    const results = query
      ? initialState.objects.filter(obj =>
          obj.name.toLowerCase().includes(query.toLowerCase()) ||
          obj.designations.some(d => d.toLowerCase().includes(query.toLowerCase()))
        )
      : [];

    setState(prev => ({
      ...prev,
      searchQuery: query,
      searchResults: results,
    }));
  }, []);

  // Focus on object
  const focusObject = useCallback((object: CelestialObject) => {
    if (!object.position) return;
    selectObject(object.id);
  }, [selectObject]);

  // Toggle panel
  const togglePanel = useCallback((panel: keyof AppState['panels']) => {
    setState(prev => ({
      ...prev,
      panels: { ...prev.panels, [panel]: !prev.panels[panel] },
    }));
  }, []);

  // Toggle filter category
  const toggleFilterCategory = useCallback((category: ObjectCategory) => {
    setState(prev => {
      const newCategories = new Set(prev.filters.categories);
      if (newCategories.has(category)) newCategories.delete(category);
      else newCategories.add(category);
      return { ...prev, filters: { ...prev.filters, categories: newCategories } };
    });
  }, []);

  // Time controls
  const setTimeScale = useCallback((scale: number) => {
    setState(prev => ({ ...prev, timeScale: scale }));
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const setSimulationTime = useCallback((date: Date) => {
    setState(prev => ({ ...prev, simulationTime: date }));
  }, []);

  // Get selected object
  const selectedObject = useMemo(() => {
    if (!state.selectedObjectId) return null;
    return state.objects.find(o => o.id === state.selectedObjectId) || null;
  }, [state.selectedObjectId, state.objects]);

  // Get hovered object
  const hoveredObject = useMemo(() => {
    if (!hoveredObjectId) return null;
    return state.objects.find(o => o.id === hoveredObjectId) || null;
  }, [hoveredObjectId, state.objects]);

  return (
    <div style={styles.container}>
      {/* Main 3D Scene */}
      <div style={styles.sceneContainer}>
        <CosmicScene
          timeScale={state.timeScale}
          onCameraChange={handleCameraChange}
        >
          {/* Sun */}
          <Sun radius={20} temperature={5778} />

          {/* Planet Orbits & Planets */}
          {state.objects
            .filter(obj => obj.orbitalElements && obj.id !== 'sun' && obj.id !== 'voyager1' && obj.id !== 'voyager2' && obj.id !== 'moon')
            .map(obj => (
              <React.Fragment key={obj.id}>
                {state.filters.showOrbits && obj.orbitalElements && (
                  <Orbit
                    semiMajorAxis={metersToThreeUnits(obj.orbitalElements.semiMajorAxis, 1e9)}
                    eccentricity={obj.orbitalElements.eccentricity}
                    inclination={obj.orbitalElements.inclination}
                    longitudeOfAscendingNode={obj.orbitalElements.longitudeOfAscendingNode}
                    argumentOfPeriapsis={obj.orbitalElements.argumentOfPeriapsis}
                    color={0x666666}
                    opacity={0.3}
                    segments={120}
                  />
                )}
                {/* Planet mesh - simplified for now */}
                <mesh
                  position={[
                    metersToThreeUnits(obj.position!.x, 1e9),
                    metersToThreeUnits(obj.position!.y, 1e9),
                    metersToThreeUnits(obj.position!.z, 1e9),
                  ]}
                  onClick={() => selectObject(obj.id)}
                  onPointerOver={() => setHoveredObjectId(obj.id)}
                  onPointerOut={() => setHoveredObjectId(null)}
                >
                  <sphereGeometry args={[metersToThreeUnits(obj.radius || 1e6, 1e9), 32, 32]} />
                  <meshStandardMaterial color={obj.visual?.color || 0xffffff} />
                </mesh>
                {state.filters.showLabels && obj.visual?.label?.show && (
                  <Label
                    position={new THREE.Vector3(
                      metersToThreeUnits(obj.position!.x, 1e9),
                      metersToThreeUnits(obj.position!.y, 1e9) + metersToThreeUnits(obj.radius || 1e6, 1e9) * 1.5,
                      metersToThreeUnits(obj.position!.z, 1e9)
                    )}
                    text={obj.name}
                    fontSize={12}
                  />
                )}
              </React.Fragment>
            ))}

          {/* Moon orbit around Earth */}
          {state.filters.showOrbits && (
            <Orbit
              semiMajorAxis={metersToThreeUnits(384400000, 1e9)}
              eccentricity={0.0549}
              inclination={5.145}
              longitudeOfAscendingNode={125.08}
              argumentOfPeriapsis={318.15}
              color={0x888888}
              opacity={0.3}
              segments={60}
            />
          )}

          {/* Earth with full textures */}
          <Earth
            radius={metersToThreeUnits(6371008, 1e9)}
            showAtmosphere={true}
            showClouds={true}
            showNightLights={true}
            rotationSpeed={1}
            tilt={23.44}
          />

          {/* Voyager 1 & 2 */}
          {state.objects
            .filter(obj => obj.id === 'voyager1' || obj.id === 'voyager2')
            .map(obj => (
              <mesh
                key={obj.id}
                position={[
                  metersToThreeUnits(obj.position!.x, 1e13),
                  metersToThreeUnits(obj.position!.y, 1e13),
                  metersToThreeUnits(obj.position!.z, 1e13),
                ]}
                onClick={() => selectObject(obj.id)}
                onPointerOver={() => setHoveredObjectId(obj.id)}
                onPointerOut={() => setHoveredObjectId(null)}
              >
                <boxGeometry args={[2, 1, 1]} />
                <meshStandardMaterial color={0xffff00} emissive={0xffff00} emissiveIntensity={0.5} />
              </mesh>
            ))}

          {/* Star field background */}
          <StarField starCount={5000} radius={1e6} magnitudeLimit={6.5} />
        </CosmicScene>
      </div>

      {/* Top Bar - Search & Clock */}
      <div style={styles.topBar}>
        {/* Search */}
        {state.panels.search && (
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search celestial objects... (e.g., Mars, Voyager 1, Andromeda)"
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />
            {state.searchQuery && state.searchResults.length > 0 && (
              <div style={styles.searchResults}>
                {state.searchResults.slice(0, 8).map(obj => (
                  <div
                    key={obj.id}
                    style={styles.searchResultItem}
                    onClick={() => focusObject(obj)}
                  >
                    <span style={{ color: getTypeColor(obj.type) }}>●</span>
                    {obj.name} ({obj.type})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clock */}
        {state.panels.clock && (
          <div style={styles.clockContainer}>
            <div style={styles.clockTime}>
              {state.simulationTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
            </div>
            <div style={styles.clockControls}>
              <button
                style={{ ...styles.clockBtn, background: state.isPaused ? '#ff4444' : '#444' }}
                onClick={togglePause}
              >
                {state.isPaused ? '▶' : '⏸'}
              </button>
              <select
                value={state.timeScale}
                onChange={(e) => setTimeScale(Number(e.target.value))}
                style={styles.clockSelect}
              >
                <option value={-3600}>⏪ 1h/s</option>
                <option value={-60}>⏪ 1m/s</option>
                <option value={-1}>⏪ 1x</option>
                <option value={0}>⏹ Stopped</option>
                <option value={1}>▶ 1x</option>
                <option value={60}>▶ 1m/s</option>
                <option value={3600}>▶ 1h/s</option>
                <option value={86400}>▶ 1d/s</option>
                <option value={31557600}>▶ 1yr/s</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Left Panel - Navigation */}
      {state.panels.navigation && (
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <h3>Navigation</h3>
            <button onClick={() => togglePanel('navigation')} style={styles.closeBtn}>×</button>
          </div>
          <div style={styles.navSection}>
            <h4>Solar System</h4>
            {['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon']
              .map(id => {
                const obj = state.objects.find(o => o.id === id);
                return obj ? (
                  <div
                    key={obj.id}
                    style={{
                      ...styles.navItem,
                      background: state.selectedObjectId === obj.id ? '#3366ff' : 'transparent',
                    }}
                    onClick={() => focusObject(obj)}
                  >
                    <span style={{ color: getTypeColor(obj.type) }}>●</span>
                    {obj.name}
                  </div>
                ) : null;
              })}
          </div>
          <div style={styles.navSection}>
            <h4>Space Probes</h4>
            {['voyager1', 'voyager2']
              .map(id => {
                const obj = state.objects.find(o => o.id === id);
                return obj ? (
                  <div
                    key={obj.id}
                    style={{
                      ...styles.navItem,
                      background: state.selectedObjectId === obj.id ? '#3366ff' : 'transparent',
                    }}
                    onClick={() => focusObject(obj)}
                  >
                    <span style={{ color: getTypeColor(obj.type) }}>●</span>
                    {obj.name}
                  </div>
                ) : null;
              })}
          </div>
          <div style={styles.navSection}>
            <h4>Scales</h4>
            {[
              { id: 'surface', name: 'Surface', desc: 'Planetary surface' },
              { id: 'planetary', name: 'Planetary', desc: 'Planet & moons' },
              { id: 'solarsystem', name: 'Solar System', desc: 'Inner/Outer system' },
              { id: 'interstellar', name: 'Interstellar', desc: 'Nearby stars' },
              { id: 'galactic', name: 'Galactic', desc: 'Milky Way' },
              { id: 'cosmological', name: 'Cosmological', desc: 'Galaxies & universe' },
            ].map(scale => (
              <div key={scale.id} style={styles.navItem} onClick={() => console.log('Navigate to', scale.id)}>
                <span>◉</span> {scale.name}
                <span style={styles.navDesc}>{scale.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel - Object Info */}
      {state.panels.objectInfo && selectedObject && (
        <div style={styles.rightPanel}>
          <div style={styles.panelHeader}>
            <h3>{selectedObject.name}</h3>
            <button onClick={() => selectObject(null)} style={styles.closeBtn}>×</button>
          </div>
          <div style={styles.objectInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Type:</span>
              <span style={{ color: getTypeColor(selectedObject.type) }}>{selectedObject.type}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Category:</span>
              <span>{selectedObject.category}</span>
            </div>
            {selectedObject.radius && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Radius:</span>
                <span>{formatDistance(selectedObject.radius)}</span>
              </div>
            )}
            {selectedObject.mass && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Mass:</span>
                <span>{formatMass(selectedObject.mass)}</span>
              </div>
            )}
            {selectedObject.gravity && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Surface Gravity:</span>
                <span>{selectedObject.gravity.toFixed(2)} m/s²</span>
              </div>
            )}
            {selectedObject.rotationPeriod && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Rotation Period:</span>
                <span>{formatTime(selectedObject.rotationPeriod)}</span>
              </div>
            )}
            {selectedObject.axialTilt !== undefined && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Axial Tilt:</span>
                <span>{selectedObject.axialTilt.toFixed(2)}°</span>
              </div>
            )}
            {selectedObject.albedo !== undefined && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Albedo:</span>
                <span>{selectedObject.albedo.toFixed(3)}</span>
              </div>
            )}
            {selectedObject.temperature && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Temperature:</span>
                <span>{selectedObject.temperature} K</span>
              </div>
            )}
            {selectedObject.spectralType && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Spectral Type:</span>
                <span>{selectedObject.spectralType}</span>
              </div>
            )}
            {selectedObject.orbitalElements && (
              <div style={{ ...styles.infoRow, marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                <span style={styles.infoLabel}>Orbital Elements:</span>
              </div>
            )}
            {selectedObject.orbitalElements && (
              <>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Semi-major Axis:</span>
                  <span>{formatDistance(selectedObject.orbitalElements.semiMajorAxis)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Eccentricity:</span>
                  <span>{selectedObject.orbitalElements.eccentricity.toFixed(6)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Inclination:</span>
                  <span>{selectedObject.orbitalElements.inclination.toFixed(4)}°</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Longitude of Node:</span>
                  <span>{selectedObject.orbitalElements.longitudeOfAscendingNode.toFixed(4)}°</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Argument of Periapsis:</span>
                  <span>{selectedObject.orbitalElements.argumentOfPeriapsis.toFixed(4)}°</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Mean Anomaly:</span>
                  <span>{selectedObject.orbitalElements.meanAnomaly.toFixed(4)}°</span>
                </div>
              </>
            )}
            {selectedObject.coordinates && (
              <div style={{ ...styles.infoRow, marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                <span style={styles.infoLabel}>Coordinates:</span>
              </div>
            )}
            {selectedObject.coordinates?.equatorial && (
              <>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>RA/Dec (J2000):</span>
                  <span>{formatRA(selectedObject.coordinates.equatorial.rightAscension)} / {formatDec(selectedObject.coordinates.equatorial.declination)}</span>
                </div>
              </>
            )}
            {selectedObject.coordinates?.ecliptic && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Ecliptic Lon/Lat:</span>
                <span>{selectedObject.coordinates.ecliptic.longitude.toFixed(4)}° / {selectedObject.coordinates.ecliptic.latitude.toFixed(4)}°</span>
              </div>
            )}
            {selectedObject.coordinates?.galactic && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Galactic Lon/Lat:</span>
                <span>{selectedObject.coordinates.galactic.longitude.toFixed(4)}° / {selectedObject.coordinates.galactic.latitude.toFixed(4)}°</span>
              </div>
            )}
            {selectedObject.position && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Position (m):</span>
                <span>({selectedObject.position.x.toExponential(3)}, {selectedObject.position.y.toExponential(3)}, {selectedObject.position.z.toExponential(3)})</span>
              </div>
            )}
            <div style={{ ...styles.infoRow, marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
              <span style={styles.infoLabel}>Data Source:</span>
              <span style={{ color: getDataSourceColor(selectedObject.dataSource) }}>{selectedObject.dataSource}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Data Freshness:</span>
              <span style={{ color: getFreshnessColor(selectedObject.dataFreshness) }}>{selectedObject.dataFreshness}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Last Updated:</span>
              <span>{selectedObject.lastUpdated.toLocaleString()}</span>
            </div>
            {selectedObject.sources && selectedObject.sources.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <span style={styles.infoLabel}>Sources:</span>
                <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '12px' }}>
                  {selectedObject.sources.map(src => (
                    <li key={src.id}>
                      <a href={src.url} target="_blank" rel="noopener" style={{ color: '#88aaff' }}>
                        {src.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedObject.metadata && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                <span style={styles.infoLabel}>Mission Data:</span>
                <pre style={{ fontSize: '11px', color: '#aaa', whiteSpace: 'pre-wrap', marginTop: '4px' }}>
                  {JSON.stringify(selectedObject.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar - Filters & Status */}
      <div style={styles.bottomBar}>
        <div style={styles.filterButtons}>
          <button onClick={() => togglePanel('filters')} style={styles.filterBtn}>
            🔍 Filters
          </button>
          <button onClick={() => togglePanel('settings')} style={styles.filterBtn}>
            ⚙ Settings
          </button>
        </div>
        <div style={styles.statusInfo}>
          <span>Objects: {state.objects.length}</span>
          <span style={{ marginLeft: '16px' }}>Selected: {selectedObject?.name || 'None'}</span>
          <span style={{ marginLeft: '16px' }}>Scale: {getCurrentScaleLabel(state.cameraState.position)}</span>
        </div>
      </div>

      {/* Filters Panel (modal) */}
      {state.panels.filters && (
        <div style={styles.modalOverlay} onClick={() => togglePanel('filters')}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.panelHeader}>
              <h3>Visualization Filters</h3>
              <button onClick={() => togglePanel('filters')} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.filterSection}>
              <h4>Object Categories</h4>
              {Array.from(['solar-system', 'near-earth', 'stellar', 'galactic', 'extragalactic', 'cosmological', 'artificial'] as ObjectCategory[]).map(cat => (
                <label key={cat} style={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={state.filters.categories.has(cat)}
                    onChange={() => toggleFilterCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
            <div style={styles.filterSection}>
              <h4>Data Sources</h4>
              {Array.from(['observed', 'calculated', 'estimated', 'simulated', 'illustrative'] as DataSourceType[]).map(src => (
                <label key={src} style={styles.filterLabel}>
                  <input
                    type="checkbox"
                    checked={state.filters.dataSources.has(src)}
                    onChange={() => {
                      setState(prev => {
                        const newSources = new Set(prev.filters.dataSources);
                        if (newSources.has(src)) newSources.delete(src);
                        else newSources.add(src);
                        return { ...prev, filters: { ...prev.filters, dataSources: newSources } };
                      });
                    }}
                  />
                  {src}
                </label>
              ))}
            </div>
            <div style={styles.filterSection}>
              <h4>Display Options</h4>
              <label style={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={state.filters.showOrbits}
                  onChange={() => setState(prev => ({ ...prev, filters: { ...prev.filters, showOrbits: !prev.filters.showOrbits } }))}
                />
                Show Orbits
              </label>
              <label style={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={state.filters.showLabels}
                  onChange={() => setState(prev => ({ ...prev, filters: { ...prev.filters, showLabels: !prev.filters.showLabels } }))}
                />
                Show Labels
              </label>
              <label style={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={state.filters.showConstellations}
                  onChange={() => setState(prev => ({ ...prev, filters: { ...prev.filters, showConstellations: !prev.filters.showConstellations } }))}
                />
                Show Constellations
              </label>
              <label style={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={state.filters.showGrid}
                  onChange={() => setState(prev => ({ ...prev, filters: { ...prev.filters, showGrid: !prev.filters.showGrid } }))}
                />
                Show Reference Grid
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function metersToThreeUnits(meters: number, unitScale: number): number {
  return meters / unitScale;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    star: '#ffcc00',
    planet: '#4488ff',
    'dwarf-planet': '#8866ff',
    moon: '#aaaaaa',
    asteroid: '#886644',
    comet: '#00ffff',
    satellite: '#ff8800',
    'space-probe': '#ffff00',
    'space-station': '#ff88ff',
    nebula: '#ff00ff',
    galaxy: '#ff4488',
    'globular-cluster': '#ffff88',
    'open-cluster': '#88ffff',
    'black-hole': '#000000',
    'supernova-remnant': '#ff4400',
    quasar: '#ff0088',
    'cosmic-structure': '#8844ff',
    unknown: '#888888',
  };
  return colors[type] || '#888888';
}

function getDataSourceColor(source: DataSourceType): string {
  const colors: Record<DataSourceType, string> = {
    observed: '#00ff00',
    calculated: '#4488ff',
    estimated: '#ffaa00',
    simulated: '#ff44ff',
    illustrative: '#888888',
  };
  return colors[source];
}

function getFreshnessColor(freshness: DataFreshness): string {
  const colors: Record<DataFreshness, string> = {
    current: '#00ff00',
    stale: '#ffaa00',
    historical: '#4488ff',
    unknown: '#888888',
  };
  return colors[freshness];
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(0)} m`;
  if (meters < 1e6) return `${(meters / 1000).toFixed(1)} km`;
  if (meters < 1.496e11) return `${(meters / 1e6).toFixed(1)} Mm`;
  if (meters < 9.461e15) return `${(meters / 1.496e11).toFixed(3)} AU`;
  if (meters < 3.086e16) return `${(meters / 9.461e15).toFixed(2)} ly`;
  return `${(meters / 3.086e16).toFixed(2)} pc`;
}

function formatMass(kg: number): string {
  if (kg < 1e3) return `${kg.toFixed(1)} kg`;
  if (kg < 1e24) return `${(kg / 1e21).toFixed(2)} × 10²¹ kg`;
  if (kg < 1e30) return `${(kg / 1e24).toFixed(2)} × 10²⁴ kg`;
  return `${(kg / 1e30).toFixed(2)} × 10³⁰ kg`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} h`;
  if (seconds < 31557600) return `${(seconds / 86400).toFixed(2)} d`;
  return `${(seconds / 31557600).toFixed(2)} yr`;
}

function formatRA(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = ((hours - h - m / 60) * 3600).toFixed(1);
  return `${h}h ${m}m ${s}s`;
}

function formatDec(deg: number): string {
  const sign = deg >= 0 ? '+' : '-';
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d - m / 60) * 3600).toFixed(1);
  return `${sign}${d}° ${m}' ${s}"`;
}

function getCurrentScaleLabel(pos: { x: number; y: number; z: number }): string {
  const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
  if (dist < 1e6) return 'Surface';
  if (dist < 1e9) return 'Planetary';
  if (dist < 1e13) return 'Solar System';
  if (dist < 1e18) return 'Interstellar';
  if (dist < 1e22) return 'Galactic';
  return 'Cosmological';
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    background: '#000',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  },
  sceneContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 100,
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: 500,
    margin: '0 20px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px',
    fontSize: '16px',
    background: 'rgba(20,20,30,0.95)',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    backdropFilter: 'blur(10px)',
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: 'rgba(20,20,30,0.98)',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 200,
  },
  searchResultItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    borderBottom: '1px solid #222',
  },
  clockContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#ccc',
  },
  clockControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  clockBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockSelect: {
    padding: '6px 10px',
    fontSize: '13px',
    background: 'rgba(20,20,30,0.95)',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    outline: 'none',
  },
  leftPanel: {
    position: 'absolute',
    top: 60,
    left: 0,
    bottom: 50,
    width: 260,
    background: 'rgba(15,15,25,0.95)',
    borderRight: '1px solid #333',
    overflowY: 'auto',
    padding: '16px',
    zIndex: 50,
    backdropFilter: 'blur(10px)',
  },
  rightPanel: {
    position: 'absolute',
    top: 60,
    right: 0,
    bottom: 50,
    width: 340,
    background: 'rgba(15,15,25,0.95)',
    borderLeft: '1px solid #333',
    overflowY: 'auto',
    padding: '16px',
    zIndex: 50,
    backdropFilter: 'blur(10px)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #333',
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSection: {
    marginBottom: '20px',
  },
  navItem: {
    padding: '10px 12px',
    margin: '4px 0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  navDesc: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#888',
  },
  objectInfo: {
    fontSize: '13px',
    lineHeight: '1.8',
  },
  infoRow: {
    display: 'flex',
    gap: '12px',
    padding: '4px 0',
  },
  infoLabel: {
    color: '#888',
    minWidth: '140px',
    flexShrink: 0,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 20px',
    background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 100,
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: 'rgba(20,20,30,0.9)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    backdropFilter: 'blur(10px)',
  },
  statusInfo: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#888',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalContent: {
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    background: 'rgba(15,15,25,0.98)',
    border: '1px solid #333',
    borderRadius: '12px',
    overflowY: 'auto',
    padding: '20px',
    backdropFilter: 'blur(20px)',
  },
  filterSection: {
    marginBottom: '20px',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    cursor: 'pointer',
    fontSize: '13px',
  },
};

export default CosmicAtlasApp
