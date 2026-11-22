/**
 * Cosmic Atlas - Orbital Mechanics & SGP4 Integration
 * Satellite orbit propagation, Keplerian orbits, and JPL Horizons integration
 */

import type { Vector3D, OrbitalElements, AstronomicalTime, CelestialObject } from '../types';
import { sgp4, twoline2satrec, gstime } from 'sgp4';
import {
  AU_METERS,
  SECONDS_PER_DAY,
  SECONDS_PER_MINUTE,
  EARTH_GM,
  EARTH_RADIUS_MEAN_METERS,
  EARTH_RADIUS_EQUATORIAL_METERS,
  EARTH_RADIUS_POLAR_METERS,
  EARTH_ROTATION_RATE,
  J2000_JULIAN_DATE,
  julianCenturiesSinceJ2000,
  dateToJd,
  jdToDate,
} from '../astronomy/constants';
import { mat3Vec3, rotZ, rotX, normalize, cartesianToSpherical, sphericalToCartesian, mat3Mul } from '../astronomy/coordinates';

// ============================================================================
// SGP4 SATELLITE PROPAGATION
// ============================================================================

/**
 * TLE (Two-Line Element) data structure
 */
export interface TLEData {
  line1: string;
  line2: string;
  name?: string;
  noradId?: number;
  internationalDesignator?: string;
  classification?: string;
  epoch?: Date;
  epochYear?: number;
  epochDay?: number;
  bstar?: number;        // BSTAR drag term
  meanMotion?: number;   // Revs per day
  meanMotionDot?: number; // 1st derivative of mean motion
  meanMotionDDot?: number; // 2nd derivative of mean motion
}

/**
 * Parse TLE lines into structured data
 */
export function parseTLE(line1: string, line2: string, name?: string): TLEData {
  const satrec = twoline2satrec(line1, line2);

  return {
    line1,
    line2,
    name,
    noradId: satrec.satnum,
    internationalDesignator: satrec.intldesg,
    classification: satrec.classification,
    epoch: satrec.epoch,
    epochYear: satrec.epochyr,
    epochDay: satrec.epochdays,
    bstar: satrec.bstar,
    meanMotion: satrec.no,
    meanMotionDot: satrec.ndot,
    meanMotionDDot: satrec.nddot,
  };
}

/**
 * SGP4 propagation result
 */
export interface SGP4Result {
  position: Vector3D;       // TEME frame, kilometers
  velocity: Vector3D;       // TEME frame, km/s
  gmst: number;             // Greenwich Mean Sidereal Time (radians)
  jd: number;               // Julian Date of propagation
  isValid: boolean;         // True if propagation succeeded
  error?: number;           // SGP4 error code
}

/**
 * Propagate satellite using SGP4
 * @param tle TLE data
 * @param date Target date (UTC)
 * @returns Position and velocity in TEME frame (km, km/s)
 */
export function propagateSGP4(tle: TLEData, date: Date): SGP4Result {
  const satrec = twoline2satrec(tle.line1, tle.line2);

  // Convert date to minutes since epoch
  const jd = dateToJd(date);
  const epochJd = dateToJd(satrec.epoch);
  const minutesSinceEpoch = (jd - epochJd) * SECONDS_PER_DAY / SECONDS_PER_MINUTE;

  // Propagate
  const result = sgp4(satrec, minutesSinceEpoch);

  return {
    position: result.position
      ? { x: result.position.x, y: result.position.y, z: result.position.z }
      : { x: 0, y: 0, z: 0 },
    velocity: result.velocity
      ? { x: result.velocity.x, y: result.velocity.y, z: result.velocity.z }
      : { x: 0, y: 0, z: 0 },
    gmst: gstime(jd),
    jd,
    isValid: result.position !== null,
    error: result.position === null ? 1 : 0,
  };
}

/**
 * Propagate satellite to multiple time steps
 */
export function propagateSGP4Series(
  tle: TLEData,
  startDate: Date,
  endDate: Date,
  stepSeconds: number = 60
): SGP4Result[] {
  const results: SGP4Result[] = [];
  const current = new Date(startDate.getTime());

  while (current <= endDate) {
    const result = propagateSGP4(tle, current);
    if (result.isValid) {
      results.push(result);
    }
    current.setTime(current.getTime() + stepSeconds * 1000);
  }

  return results;
}

/**
 * Convert TEME position to ECI (J2000) using GMST
 * This is an approximation - for high precision use full IAU 2006/2000A
 */
export function temeToECI(pos: Vector3D, gmst: number): Vector3D {
  // TEME to ECI is approximately a rotation around Z by GMST
  // For better accuracy, need TETE/ITRF transformations
  return mat3Vec3(rotZ(-gmst), pos);
}

/**
 * Convert ECI (J2000) to ECEF (Earth-fixed) using GMST
 */
export function eciToECEF(pos: Vector3D, gmst: number): Vector3D {
  return mat3Vec3(rotZ(gmst), pos);
}

/**
 * Convert ECEF to geodetic (lat, lon, alt)
 * Uses WGS84 ellipsoid
 */
export function ecefToGeodetic(ecef: Vector3D): { lat: number; lon: number; alt: number } {
  const a = EARTH_RADIUS_EQUATORIAL_METERS / 1000; // km
  const b = EARTH_RADIUS_POLAR_METERS / 1000;       // km
  const e2 = 1 - (b * b) / (a * a);

  const x = ecef.x;
  const y = ecef.y;
  const z = ecef.z;

  const p = Math.sqrt(x * x + y * y);
  const lon = Math.atan2(y, x);

  // Iterative solution for latitude
  let lat = Math.atan2(z, p * (1 - e2));
  for (let i = 0; i < 5; i++) {
    const N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
    const h = p / Math.cos(lat) - N;
    lat = Math.atan2(z, p * (1 - e2 * N / (N + h)));
  }

  const N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
  const alt = p / Math.cos(lat) - N;

  return {
    lat: lat * 180 / Math.PI,
    lon: lon * 180 / Math.PI,
    alt: alt * 1000, // meters
  };
}

/**
 * Get satellite ground track (lat/lon/alt over time)
 */
export function getGroundTrack(
  tle: TLEData,
  startDate: Date,
  endDate: Date,
  stepSeconds: number = 60
): Array<{ time: Date; lat: number; lon: number; alt: number }> {
  const results = propagateSGP4Series(tle, startDate, endDate, stepSeconds);

  return results.map(r => {
    const eci = temeToECI(r.position, r.gmst);
    const ecef = eciToECEF(eci, r.gmst);
    const geo = ecefToGeodetic(ecef);
    return {
      time: jdToDate(r.jd),
      lat: geo.lat,
      lon: geo.lon,
      alt: geo.alt,
    };
  });
}

// ============================================================================
// KEPLERIAN ORBIT PROPAGATION (Planets, Moons, Probes)
// ============================================================================

/**
 * Solve Kepler's equation: M = E - e*sin(E)
 * Returns eccentric anomaly E in radians
 */
export function solveKepler(M: number, e: number): number {
  if (e < 1e-12) return M; // Circular orbit

  let E = M; // Initial guess
  const tolerance = 1e-12;
  let delta = 1;

  // Newton-Raphson iteration
  while (Math.abs(delta) > tolerance) {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    const f = E - e * sinE - M;
    const fp = 1 - e * cosE;
    delta = f / fp;
    E -= delta;
  }

  return E;
}

/**
 * Compute true anomaly from eccentric anomaly
 */
export function trueAnomalyFromEccentric(E: number, e: number): number {
  const sinE = Math.sin(E);
  const cosE = Math.cos(E);
  const sinNu = (Math.sqrt(1 - e * e) * sinE) / (1 - e * cosE);
  const cosNu = (cosE - e) / (1 - e * cosE);
  return Math.atan2(sinNu, cosNu);
}

/**
 * Compute mean anomaly at time t from epoch
 */
export function meanAnomalyAtTime(
  meanAnomaly0: number,    // Mean anomaly at epoch (radians)
  meanMotion: number,      // Mean motion (radians/sec)
  epochJD: number,
  targetJD: number
): number {
  const dt = (targetJD - epochJD) * SECONDS_PER_DAY; // seconds
  let M = meanAnomaly0 + meanMotion * dt;
  // Normalize to [0, 2π)
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  return M;
}

/**
 * Propagate Keplerian orbit to target time
 * Returns position and velocity in orbital plane (perifocal frame)
 */
export function propagateKeplerian(
  elements: OrbitalElements,
  targetTime: AstronomicalTime
): { position: Vector3D; velocity: Vector3D } {
  const a = elements.semiMajorAxis;           // meters
  const e = elements.eccentricity;
  const i = elements.inclination * Math.PI / 180;
  const omega = elements.argumentOfPeriapsis * Math.PI / 180;
  const Omega = elements.longitudeOfAscendingNode * Math.PI / 180;
  const M0 = elements.meanAnomaly * Math.PI / 180;

  // Mean motion: n = sqrt(μ/a³)
  // Need central body GM - assume Sun for now
  const mu = elements.referenceFrame === 'Body-fixed' ? EARTH_GM : 1.32712440018e20; // Sun GM
  const n = Math.sqrt(mu / (a * a * a)); // rad/s

  const epochJD = elements.epoch.jd;
  const targetJD = targetTime.jd;

  // Mean anomaly at target time
  const M = meanAnomalyAtTime(M0, n, epochJD, targetJD);

  // Solve Kepler's equation
  const E = solveKepler(M, e);

  // True anomaly
  const nu = trueAnomalyFromEccentric(E, e);

  // Radius
  const r = a * (1 - e * Math.cos(E));

  // Position in perifocal frame (PQW)
  const cosNu = Math.cos(nu);
  const sinNu = Math.sin(nu);
  const p = a * (1 - e * e); // Semi-latus rectum
  const h = Math.sqrt(mu * p); // Specific angular momentum

  const posPQW: Vector3D = {
    x: r * cosNu,
    y: r * sinNu,
    z: 0,
  };

  const velPQW: Vector3D = {
    x: -mu / h * sinNu,
    y: mu / h * (e + cosNu),
    z: 0,
  };

  // Rotate to inertial frame: R_z(-Omega) * R_x(-i) * R_z(-omega)
  // This is the inverse of the standard transformation
  const R1 = rotZ(-Omega);
  const R2 = rotX(-i);
  const R3 = rotZ(-omega);

  const R = mat3Mul(mat3Mul(R1, R2), R3);

  return {
    position: mat3Vec3(R, posPQW),
    velocity: mat3Vec3(R, velPQW),
  };
}

// ============================================================================
// JPL HORIZONS INTEGRATION
// ============================================================================

/**
 * JPL Horizons API query parameters
 */
export interface HorizonsQuery {
  // Target specification
  target: string;              // e.g., "399" (Earth), "Voyager 1", "10" (Sun)
  targetType: 'majorbody' | 'smallbody' | 'spacecraft' | 'designation';

  // Observer location
  center: string;              // e.g., "@sun", "@0", "500@399" (Mars from Earth)
  coordType: 'geodetic' | 'cylindrical' | 'spherical';

  // Time span
  startTime: string;           // ISO format or "JDxxxx.x"
  stopTime: string;
  stepSize: string;            // e.g., "1 d", "1 h", "10 m"

  // Output
  quantities: string;          // e.g., "1,2,9,20,23,24" (standard astrometric)
  refPlane: 'ecliptic' | 'frame';
  refSystem: 'J2000' | 'ICRF' | 'B1950';
  outputFormat: 'json' | 'text';
}

/**
 * Standard quantities for Horizons
 * 1 = Astrometric RA/Dec
 * 2 = Apparent RA/Dec
 * 9 = Range & Range-rate
 * 20 = Observer-centered ecliptic lon/lat
 * 23 = Heliocentric ecliptic lon/lat
 * 24 = Heliocentric range & range-rate
 */
export const HORIZONS_QUANTITIES = {
  ASTROMETRIC: '1',
  APPARENT: '2',
  RANGE_RADIAL: '9',
  ECLIPTIC_OBSERVER: '20',
  ECLIPTIC_HELIOCENTRIC: '23',
  HELIOCENTRIC_RANGE: '24',
  ALL_STANDARD: '1,2,9,20,23,24',
};

/**
 * JPL Horizons API response (JSON format)
 */
export interface HorizonsResponse {
  signature: {
    version: string;
    source: string;
    time: string;
  };
  result: string;  // Contains the actual data in JSON format when format=json
}

/**
 * Parsed ephemeris data from Horizons
 */
export interface EphemerisData {
  target: string;
  center: string;
  refFrame: string;
  data: Array<{
    jd: number;
    calendarDate: string;
    ra: number;       // degrees
    dec: number;      // degrees
    delta: number;    // AU (range)
    deldot: number;   // km/s (range-rate)
    hl: number;       // heliocentric lon (deg)
    hb: number;       // heliocentric lat (deg)
    hr: number;       // heliocentric range (AU)
    hrdot: number;    // heliocentric range-rate (km/s)
    ol: number;       // observer-centered ecliptic lon (deg)
    ob: number;       // observer-centered ecliptic lat (deg)
    // ... additional fields based on quantities
  }>;
}

/**
 * Build Horizons API URL
 */
export function buildHorizonsUrl(query: HorizonsQuery): string {
  const baseUrl = 'https://ssd.jpl.nasa.gov/api/horizons.api';

  const params = new URLSearchParams({
    format: query.outputFormat,
    COMMAND: `'${query.target}'`,
    CENTER: `'${query.center}'`,
    COORD_TYPE: query.coordType,
    START_TIME: query.startTime,
    STOP_TIME: query.stopTime,
    STEP_SIZE: query.stepSize,
    QUANTITIES: query.quantities,
    REF_PLANE: query.refPlane,
    REF_SYSTEM: query.refSystem,
    CSV_FORMAT: 'NO',
    OBJ_DATA: 'YES',
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Fetch ephemeris from JPL Horizons
 */
export async function fetchHorizonsEphemeris(
  query: HorizonsQuery
): Promise<EphemerisData | null> {
  try {
    const url = buildHorizonsUrl(query);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Horizons API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse JSON format response
    if (data.result) {
      return parseHorizonsJson(data.result);
    }

    return null;
  } catch (error) {
    console.error('Horizons fetch error:', error);
    return null;
  }
}

/**
 * Parse Horizons JSON output
 */
function parseHorizonsJson(jsonText: string): EphemerisData | null {
  try {
    // Horizons JSON format has data embedded in result string
    const parsed = JSON.parse(jsonText);
    // Implementation depends on exact JSON structure returned
    // This is a simplified parser
    return {
      target: '',
      center: '',
      refFrame: '',
      data: [],
    };
  } catch {
    return null;
  }
}

/**
 * Parse Horizons text output (fallback)
 */
export function parseHorizonsText(text: string): EphemerisData | null {
  // Horizons text output parsing
  // Look for $$SOE ... $$EOE block
  const soeMatch = text.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
  if (!soeMatch) return null;

  const lines = soeMatch[1].trim().split('\n');
  const data: EphemerisData['data'] = [];

  for (const line of lines) {
    // Parse fixed-width columns (depends on QUANTITIES selected)
    // This is a simplified version
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 8) {
      data.push({
        jd: parseFloat(parts[0]),
        calendarDate: parts[1] + ' ' + parts[2],
        ra: parseFloat(parts[3]),
        dec: parseFloat(parts[4]),
        delta: parseFloat(parts[5]),
        deldot: parseFloat(parts[6]),
        hl: parseFloat(parts[7]),
        hb: parseFloat(parts[8]),
        hr: parseFloat(parts[9]),
        hrdot: parseFloat(parts[10]),
        ol: parseFloat(parts[11]),
        ob: parseFloat(parts[12]),
      });
    }
  }

  return {
    target: '',
    center: '',
    refFrame: '',
    data,
  };
}

// ============================================================================
// ORBIT VISUALIZATION HELPERS
// ============================================================================

/**
 * Generate orbit path points for visualization
 */
export function generateOrbitPath(
  elements: OrbitalElements,
  numPoints: number = 360
): Vector3D[] {
  const points: Vector3D[] = [];
  const a = elements.semiMajorAxis;
  const e = elements.eccentricity;
  const i = elements.inclination * Math.PI / 180;
  const omega = elements.argumentOfPeriapsis * Math.PI / 180;
  const Omega = elements.longitudeOfAscendingNode * Math.PI / 180;

  // Perifocal frame points
  for (let j = 0; j < numPoints; j++) {
    const nu = (j / numPoints) * 2 * Math.PI;
    const cosNu = Math.cos(nu);
    const sinNu = Math.sin(nu);

    const p = a * (1 - e * e);
    const r = p / (1 + e * cosNu);

    const posPQW: Vector3D = {
      x: r * cosNu,
      y: r * sinNu,
      z: 0,
    };

    // Rotate to inertial frame
    const R1 = rotZ(-Omega);
    const R2 = rotX(-i);
    const R3 = rotZ(-omega);
    const R = mat3Mul(mat3Mul(R1, R2), R3);

    points.push(mat3Vec3(R, posPQW));
  }

  return points;
}

/**
 * Generate satellite orbit ground track for visualization
 */
export function generateGroundTrackPath(
  tle: TLEData,
  numPoints: number = 180
): Array<{ lat: number; lon: number; alt: number }> {
  const now = new Date();
  const periodMinutes = 1440 / tle.meanMotion!; // Approximate period in minutes
  const startDate = new Date(now.getTime() - periodMinutes * 0.5 * 60 * 1000);
  const endDate = new Date(now.getTime() + periodMinutes * 0.5 * 60 * 1000);
  const stepMs = (endDate.getTime() - startDate.getTime()) / numPoints;

  const track: Array<{ lat: number; lon: number; alt: number }> = [];

  for (let i = 0; i <= numPoints; i++) {
    const date = new Date(startDate.getTime() + i * stepMs);
    const result = propagateSGP4(tle, date);

    if (result.isValid) {
      const eci = temeToECI(result.position, result.gmst);
      const ecef = eciToECEF(eci, result.gmst);
      const geo = ecefToGeodetic(ecef);
      track.push({ lat: geo.lat, lon: geo.lon, alt: geo.alt });
    }
  }

  return track;
}

/**
 * Calculate light time from object to observer
 */
export function lightTime(distanceMeters: number): number {
  return distanceMeters / 299792458; // seconds
}

/**
 * Format light time as human readable
 */
export function formatLightTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} h`;
  return `${(seconds / 86400).toFixed(2)} d`;
}

// ============================================================================
// VOYAGER & DEEP SPACE PROBES
// ============================================================================

/**
 * Known deep space probe identifiers for Horizons
 */
export const DEEP_SPACE_PROBES = {
  'Voyager 1': '-31',
  'Voyager 2': '-32',
  'Pioneer 10': '-40',
  'Pioneer 11': '-41',
  'New Horizons': '-98',
  'Cassini': '-82',
  'Juno': '-61',
  'Parker Solar Probe': '-168',
  'OSIRIS-REx': '-102',
  'Lucy': '-188',
  'Psyche': '-192',
  'Juice': '-195',
  'Europa Clipper': '-196',
} as const;

export type ProbeName = keyof typeof DEEP_SPACE_PROBES;

/**
 * Get Horizons target ID for a probe
 */
export function getProbeHorizonsId(name: ProbeName): string {
  return DEEP_SPACE_PROBES[name];
}

/**
 * Build query for deep space probe tracking
 */
export function buildProbeQuery(
  probeName: ProbeName,
  startTime: Date,
  stopTime: Date,
  stepSize: string = '1 d'
): HorizonsQuery {
  return {
    target: getProbeHorizonsId(probeName),
    targetType: 'spacecraft',
    center: '@sun',
    coordType: 'spherical',
    startTime: startTime.toISOString().split('T')[0],
    stopTime: stopTime.toISOString().split('T')[0],
    stepSize,
    quantities: HORIZONS_QUANTITIES.ALL_STANDARD,
    refPlane: 'ecliptic',
    refSystem: 'J2000',
    outputFormat: 'json',
  };
}