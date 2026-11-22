/**
 * Cosmic Atlas - Coordinate Transformations
 * High-precision coordinate system conversions for astronomy
 * Based on IAU SOFA algorithms and standard references
 */

import type {
  Vector3D,
  SphericalCoordinates,
  EquatorialCoordinates,
  EclipticCoordinates,
  GalacticCoordinates,
  HorizontalCoordinates,
  AstronomicalTime,
} from '../types';

import {
  degToRad,
  radToDeg,
  hoursToDeg,
  degToHours,
  julianCenturiesSinceJ2000,
  J2000_JULIAN_DATE,
  EARTH_OBLIQUITY_J2000_RAD,
} from './constants';

// ============================================================================
// MATRIX & VECTOR UTILITIES
// ============================================================================

/**
 * 3x3 rotation matrix
 */
export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

/**
 * Multiply 3x3 matrix by 3D vector
 */
export function mat3Vec3(m: Matrix3x3, v: Vector3D): Vector3D {
  return {
    x: m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
    y: m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
    z: m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z,
  };
}

/**
 * Transpose 3x3 matrix
 */
export function mat3Transpose(m: Matrix3x3): Matrix3x3 {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]],
  ];
}

/**
 * Multiply two 3x3 matrices
 */
export function mat3Mul(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
  const result: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
    }
  }
  return result;
}

/**
 * Rotation matrix around X axis
 */
export function rotX(angle: number): Matrix3x3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [1, 0, 0],
    [0, c, -s],
    [0, s, c],
  ];
}

/**
 * Rotation matrix around Y axis
 */
export function rotY(angle: number): Matrix3x3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c],
  ];
}

/**
 * Rotation matrix around Z axis
 */
export function rotZ(angle: number): Matrix3x3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}

/**
 * Normalize a vector
 */
export function normalize(v: Vector3D): Vector3D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Dot product
 */
export function dot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Cross product
 */
export function cross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Vector length
 */
export function length(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Convert spherical to cartesian
 * radius, theta (polar from +Z), phi (azimuthal from +X)
 */
export function sphericalToCartesian(sph: SphericalCoordinates): Vector3D {
  const sinTheta = Math.sin(sph.theta);
  return {
    x: sph.radius * sinTheta * Math.cos(sph.phi),
    y: sph.radius * sinTheta * Math.sin(sph.phi),
    z: sph.radius * Math.cos(sph.theta),
  };
}

/**
 * Convert cartesian to spherical
 */
export function cartesianToSpherical(v: Vector3D): SphericalCoordinates {
  const radius = length(v);
  if (radius === 0) return { radius: 0, theta: 0, phi: 0 };
  return {
    radius,
    theta: Math.acos(v.z / radius),
    phi: Math.atan2(v.y, v.x),
  };
}

// ============================================================================
// EQUATORIAL <-> CARTESIAN (ICRS/J2000)
// ============================================================================

/**
 * Convert equatorial (RA/Dec/Distance) to Cartesian (ICRS/J2000)
 * RA in hours, Dec in degrees, distance in parsecs
 * Returns vector in parsecs
 */
export function equatorialToCartesian(eq: EquatorialCoordinates): Vector3D {
  const raRad = hoursToDeg(eq.rightAscension) * Math.PI / 180;
  const decRad = degToRad(eq.declination);
  const dist = eq.distance ?? 1; // Default 1 parsec if not provided

  const cosDec = Math.cos(decRad);
  return {
    x: dist * cosDec * Math.cos(raRad),
    y: dist * cosDec * Math.sin(raRad),
    z: dist * Math.sin(decRad),
  };
}

/**
 * Convert Cartesian (ICRS/J2000, parsecs) to Equatorial
 */
export function cartesianToEquatorial(v: Vector3D): EquatorialCoordinates {
  const dist = length(v);
  if (dist === 0) {
    return { rightAscension: 0, declination: 0, distance: 0, epoch: 'J2000' };
  }

  const decRad = Math.asin(v.z / dist);
  let raRad = Math.atan2(v.y, v.x);
  if (raRad < 0) raRad += 2 * Math.PI;

  return {
    rightAscension: degToHours(radToDeg(raRad)),
    declination: radToDeg(decRad),
    distance: dist,
    epoch: 'J2000',
  };
}

// ============================================================================
// EQUATORIAL <-> ECLIPTIC
// ============================================================================

/**
 * Compute mean obliquity of ecliptic at given Julian Date
 * IAU 2006 precession model (approximate)
 * ε = 23°26'21.406'' - 46.836769'' T - 0.0001831'' T² + 0.00200340'' T³ - ...
 * T = Julian centuries since J2000
 */
export function meanObliquity(jd: number): number {
  const T = julianCenturiesSinceJ2000(jd);
  // Arcseconds to radians
  const arcsec = Math.PI / (180 * 3600);
  const eps = 23.4392911111 * Math.PI / 180  // 23°26'21.406''
    - 46.836769 * arcsec * T
    - 0.0001831 * arcsec * T * T
    + 0.00200340 * arcsec * T * T * T
    - 0.576e-6 * arcsec * T * T * T * T
    - 4.34e-8 * arcsec * T * T * T * T * T;
  return eps;
}

/**
 * Nutation in longitude and obliquity (simplified IAU 2000A)
 * Returns [Δψ, Δε] in radians
 */
export function nutation(jd: number): [number, number] {
  const T = julianCenturiesSinceJ2000(jd);
  const arcsec = Math.PI / (180 * 3600);

  // Fundamental arguments (Simon et al. 1994)
  const L = degToRad(280.4665 + 36000.7698 * T);        // Mean anomaly of Moon
  const Lp = degToRad(218.3165 + 481267.8813 * T);       // Mean anomaly of Sun
  const F = degToRad(93.2721 + 483202.0175 * T);         // Mean argument of latitude
  const D = degToRad(297.8502 + 445267.1115 * T);        // Mean elongation
  const Om = degToRad(125.0445 - 1934.1363 * T);         // Longitude of ascending node

  // Nutation series (major terms only, IAU 2000A)
  let dPsi = 0;
  let dEps = 0;

  // Main term: -17.20'' * sin(Ω)
  dPsi += -17.20 * Math.sin(Om);
  dEps += 9.20 * Math.cos(Om);

  // Second term: -1.32'' * sin(2L - 2D + 2F - 2Ω)
  const arg2 = 2 * L - 2 * D + 2 * F - 2 * Om;
  dPsi += -1.32 * Math.sin(arg2);
  dEps += 0.57 * Math.cos(arg2);

  // Third term: -0.23'' * sin(2L)
  dPsi += -0.23 * Math.sin(2 * L);
  dEps += 0.10 * Math.cos(2 * L);

  // Fourth term: +0.21'' * sin(2D)
  dPsi += 0.21 * Math.sin(2 * D);
  dEps += -0.09 * Math.cos(2 * D);

  return [dPsi * arcsec, dEps * arcsec];
}

/**
 * True obliquity of ecliptic (mean + nutation)
 */
export function trueObliquity(jd: number): number {
  const eps0 = meanObliquity(jd);
  const [, dEps] = nutation(jd);
  return eps0 + dEps;
}

/**
 * Equatorial to Ecliptic conversion (J2000 or date)
 * Includes nutation if date provided
 */
export function equatorialToEcliptic(
  eq: EquatorialCoordinates,
  jd?: number
): EclipticCoordinates {
  const eps = jd ? trueObliquity(jd) : EARTH_OBLIQUITY_J2000_RAD;

  const raRad = hoursToDeg(eq.rightAscension) * Math.PI / 180;
  const decRad = degToRad(eq.declination);

  const sinDec = Math.sin(decRad);
  const cosDec = Math.cos(decRad);
  const sinRa = Math.sin(raRad);
  const cosRa = Math.cos(raRad);

  // Rotation matrix: R_x(-ε)
  const sinEps = Math.sin(eps);
  const cosEps = Math.cos(eps);

  const latRad = Math.asin(sinDec * cosEps - cosDec * sinRa * sinEps);
  let lonRad = Math.atan2(
    cosDec * sinRa * cosEps + sinDec * sinEps,
    cosDec * cosRa
  );

  if (lonRad < 0) lonRad += 2 * Math.PI;

  return {
    longitude: radToDeg(lonRad),
    latitude: radToDeg(latRad),
    distance: eq.distance,
  };
}

/**
 * Ecliptic to Equatorial conversion
 */
export function eclipticToEquatorial(
  ecl: EclipticCoordinates,
  jd?: number
): EquatorialCoordinates {
  const eps = jd ? trueObliquity(jd) : EARTH_OBLIQUITY_J2000_RAD;

  const lonRad = degToRad(ecl.longitude);
  const latRad = degToRad(ecl.latitude);

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinLon = Math.sin(lonRad);
  const cosLon = Math.cos(lonRad);

  const sinEps = Math.sin(eps);
  const cosEps = Math.cos(eps);

  const decRad = Math.asin(sinLat * cosEps + cosLat * sinLon * sinEps);
  let raRad = Math.atan2(
    cosLat * sinLon * cosEps - sinLat * sinEps,
    cosLat * cosLon
  );

  if (raRad < 0) raRad += 2 * Math.PI;

  return {
    rightAscension: degToHours(radToDeg(raRad)),
    declination: radToDeg(decRad),
    distance: ecl.distance,
    epoch: jd ? 'date' : 'J2000',
  };
}

// ============================================================================
// EQUATORIAL <-> GALACTIC (IAU 1958 definition)
// ============================================================================

// Galactic North Pole in J2000 equatorial coordinates
// α_G = 12h 51m 26.282s = 192.8595083°
// δ_G = +27° 07' 42.01'' = +27.1283361°
// Galactic Center: l=0°, b=0° -> α=17h 45m 37.224s, δ=-28° 56' 10.23''
// Position angle of Galactic Center: 122.93192°

const GALACTIC_NP_RA = 192.8595083;  // degrees
const GALACTIC_NP_DEC = 27.1283361;  // degrees
const GALACTIC_CENTER_PA = 122.93192; // degrees

// Pre-computed rotation matrix: Equatorial (J2000) -> Galactic
// From Reid & Brunthaler 2004, consistent with IAU 1958
const EQ_TO_GAL_MATRIX: Matrix3x3 = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.4448296300, 0.7469822445],
  [-0.8676661490, -0.1980763734, 0.4559837762],
];

// Transpose for inverse: Galactic -> Equatorial (J2000)
const GAL_TO_EQ_MATRIX: Matrix3x3 = mat3Transpose(EQ_TO_GAL_MATRIX);

/**
 * Equatorial (J2000) to Galactic coordinates
 * Input: RA in hours, Dec in degrees, distance in parsecs
 * Output: l (longitude) in degrees, b (latitude) in degrees
 */
export function equatorialToGalactic(eq: EquatorialCoordinates): GalacticCoordinates {
  const cart = equatorialToCartesian(eq);
  const galCart = mat3Vec3(EQ_TO_GAL_MATRIX, cart);

  const dist = length(galCart);
  if (dist === 0) {
    return { longitude: 0, latitude: 0, distance: 0 };
  }

  const bRad = Math.asin(galCart.z / dist);
  let lRad = Math.atan2(galCart.y, galCart.x);
  if (lRad < 0) lRad += 2 * Math.PI;

  return {
    longitude: radToDeg(lRad),
    latitude: radToDeg(bRad),
    distance: eq.distance ?? dist,
  };
}

/**
 * Galactic to Equatorial (J2000) coordinates
 */
export function galacticToEquatorial(gal: GalacticCoordinates): EquatorialCoordinates {
  const lRad = degToRad(gal.longitude);
  const bRad = degToRad(gal.latitude);
  const dist = gal.distance ?? 1;

  const cosB = Math.cos(bRad);
  const cart: Vector3D = {
    x: dist * cosB * Math.cos(lRad),
    y: dist * cosB * Math.sin(lRad),
    z: dist * Math.sin(bRad),
  };

  const eqCart = mat3Vec3(GAL_TO_EQ_MATRIX, cart);
  return cartesianToEquatorial(eqCart);
}

// ============================================================================
// HORIZONTAL (ALT/AZ) COORDINATES
// ============================================================================

/**
 * Observer location
 */
export interface ObserverLocation {
  latitude: number;    // Geodetic latitude (degrees, +N)
  longitude: number;   // Geodetic longitude (degrees, +E)
  elevation: number;   // Height above ellipsoid (meters)
}

/**
 * Compute Local Sidereal Time (LST) at observer location
 * Returns LST in hours (0-24)
 */
export function localSiderealTime(jd: number, longitude: number): number {
  // Greenwich Mean Sidereal Time at 0h UT (IAU 2006)
  const T = julianCenturiesSinceJ2000(jd);
  let gmst = 280.46061837
    + 360.98564736629 * (jd - J2000_JULIAN_DATE)
    + 0.000387933 * T * T
    - T * T * T / 38710000;

  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;

  // Local Sidereal Time
  let lst = gmst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;

  return lst / 15; // Convert to hours
}

/**
 * Equatorial (J2000) to Horizontal (Alt/Az) for observer at given time
 * Includes refraction correction (optional)
 * Returns azimuth (0°=North, 90°=East) and altitude (degrees)
 */
export function equatorialToHorizontal(
  eq: EquatorialCoordinates,
  observer: ObserverLocation,
  jd: number,
  applyRefraction: boolean = true
): HorizontalCoordinates {
  const lst = localSiderealTime(jd, observer.longitude);
  const haHours = lst - eq.rightAscension; // Hour angle in hours
  const haRad = hoursToDeg(haHours) * Math.PI / 180;
  const decRad = degToRad(eq.declination);
  const latRad = degToRad(observer.latitude);

  const sinDec = Math.sin(decRad);
  const cosDec = Math.cos(decRad);
  const sinHa = Math.sin(haRad);
  const cosHa = Math.cos(haRad);
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);

  // Altitude
  const sinAlt = sinDec * sinLat + cosDec * cosHa * cosLat;
  let altRad = Math.asin(sinAlt);

  // Azimuth (measured from North, East=90°)
  const cosAz = (sinDec - sinAlt * sinLat) / (Math.cos(altRad) * cosLat);
  const sinAz = -cosDec * sinHa / Math.cos(altRad);
  let azRad = Math.atan2(sinAz, cosAz);
  if (azRad < 0) azRad += 2 * Math.PI;

  let altitude = radToDeg(altRad);
  const azimuth = radToDeg(azRad);

  // Atmospheric refraction correction (Saemundsson 1986)
  if (applyRefraction && altitude > -1) {
    const pressure = 101.0; // kPa (standard)
    const temperature = 10.0; // °C (standard)
    const r = 1.02 / Math.tan(degToRad(altitude + 10.3 / (altitude + 5.11))) / 60; // degrees
    altitude += r;
  }

  return {
    azimuth,
    altitude,
    distance: eq.distance,
  };
}

/**
 * Horizontal to Equatorial (J2000)
 */
export function horizontalToEquatorial(
  hor: HorizontalCoordinates,
  observer: ObserverLocation,
  jd: number
): EquatorialCoordinates {
  const lst = localSiderealTime(jd, observer.longitude);
  const azRad = degToRad(hor.azimuth);
  const altRad = degToRad(hor.altitude);
  const latRad = degToRad(observer.latitude);

  const sinAlt = Math.sin(altRad);
  const cosAlt = Math.cos(altRad);
  const sinAz = Math.sin(azRad);
  const cosAz = Math.cos(azRad);
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);

  const sinDec = sinAlt * sinLat + cosAlt * cosAz * cosLat;
  const decRad = Math.asin(sinDec);

  const cosDec = Math.cos(decRad);
  const sinHa = -cosAlt * sinAz / cosDec;
  const cosHa = (sinAlt - sinDec * sinLat) / (cosDec * cosLat);
  let haRad = Math.atan2(sinHa, cosHa);

  let raHours = lst - degToHours(radToDeg(haRad));
  raHours = raHours % 24;
  if (raHours < 0) raHours += 24;

  return {
    rightAscension: raHours,
    declination: radToDeg(decRad),
    distance: hor.distance,
    epoch: 'J2000',
  };
}

// ============================================================================
// PRECESSION (IAU 2006)
// ============================================================================

/**
 * Precession matrix from J2000 to date (equinox)
 * Uses IAU 2006 precession model (Capitaine et al. 2003)
 * Returns rotation matrix to apply to J2000 vectors
 */
export function precessionMatrixJ2000ToDate(jd: number): Matrix3x3 {
  const T = julianCenturiesSinceJ2000(jd);

  // Precession angles in arcseconds (IAU 2006)
  const arcsec = Math.PI / (180 * 3600);

  const zeta = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * arcsec;
  const z = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * arcsec;
  const theta = (2004.3109 - 0.85330 * T - 0.000217 * T * T) * arcsec;

  // Rotation: R_z(-z) * R_y(theta) * R_z(-zeta)
  const cosZeta = Math.cos(zeta);
  const sinZeta = Math.sin(zeta);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosZ = Math.cos(z);
  const sinZ = Math.sin(z);

  return [
    [
      cosZeta * cosTheta * cosZ - sinZeta * sinZ,
      -cosZeta * cosTheta * sinZ - sinZeta * cosZ,
      -cosZeta * sinTheta,
    ],
    [
      sinZeta * cosTheta * cosZ + cosZeta * sinZ,
      -sinZeta * cosTheta * sinZ + cosZeta * cosZ,
      -sinZeta * sinTheta,
    ],
    [
      sinTheta * cosZ,
      -sinTheta * sinZ,
      cosTheta,
    ],
  ];
}

/**
 * Apply precession to equatorial coordinates
 */
export function precessEquatorial(
  eq: EquatorialCoordinates,
  fromJD: number,
  toJD: number
): EquatorialCoordinates {
  if (fromJD === toJD) return eq;

  // J2000 -> date1 -> date2
  const cart = equatorialToCartesian(eq);

  // If fromJD is not J2000, first precess to J2000
  let vec = cart;
  if (Math.abs(fromJD - J2000_JULIAN_DATE) > 1e-6) {
    const m1 = precessionMatrixJ2000ToDate(fromJD);
    const m1Inv = mat3Transpose(m1);
    vec = mat3Vec3(m1Inv, vec);
  }

  // Then J2000 -> toJD
  if (Math.abs(toJD - J2000_JULIAN_DATE) > 1e-6) {
    const m2 = precessionMatrixJ2000ToDate(toJD);
    vec = mat3Vec3(m2, vec);
  }

  return cartesianToEquatorial(vec);
}

// ============================================================================
// PROPER MOTION
// ============================================================================

/**
 * Apply proper motion to equatorial coordinates
 * pmRA: proper motion in RA (mas/yr), already includes cos(Dec) factor
 * pmDec: proper motion in Dec (mas/yr)
 * epoch: target epoch as Julian Date
 * refEpoch: reference epoch (default J2000)
 */
export function applyProperMotion(
  eq: EquatorialCoordinates,
  pmRA: number,      // mas/yr
  pmDec: number,     // mas/yr
  epoch: number,
  refEpoch: number = J2000_JULIAN_DATE
): EquatorialCoordinates {
  const dt = (epoch - refEpoch) / DAYS_PER_JULIAN_YEAR; // years

  // Convert mas/yr to degrees
  const dra = pmRA * dt / (3600 * 1000);  // degrees
  const ddec = pmDec * dt / (3600 * 1000); // degrees

  return {
    rightAscension: eq.rightAscension + dra / 15, // Convert deg to hours
    declination: eq.declination + ddec,
    distance: eq.distance,
    epoch: 'J2000',
  };
}

/**
 * Apply parallax correction (annual parallax)
 * Returns apparent position at given epoch
 */
export function applyParallax(
  eq: EquatorialCoordinates,
  parallaxMas: number,  // Parallax in milliarcseconds
  epoch: number,
  earthPosition: Vector3D // Earth position in AU (ICRS)
): EquatorialCoordinates {
  if (parallaxMas === 0 || !eq.distance) return eq;

  // Parallax in arcseconds
  const pi = parallaxMas / 1000;

  // Distance in parsecs = 1/parallax
  // But we use the provided distance if available
  const distPc = eq.distance;

  // Parallax offset in AU
  const parallaxAU = 1 / pi; // AU (since 1 pc = 1/π AU)

  // Shift = - (earthPosition / distPc) * (1 AU in pc)
  // 1 AU = 1/206265 pc
  const shiftFactor = -1 / (distPc * 206265);

  const shift: Vector3D = {
    x: earthPosition.x * shiftFactor,
    y: earthPosition.y * shiftFactor,
    z: earthPosition.z * shiftFactor,
  };

  const cart = equatorialToCartesian(eq);
  const shiftedCart: Vector3D = {
    x: cart.x + shift.x,
    y: cart.y + shift.y,
    z: cart.z + shift.z,
  };

  return cartesianToEquatorial(shiftedCart);
}

// ============================================================================
// UTILITY: ANGULAR SEPARATION
// ============================================================================

/**
 * Angular separation between two equatorial positions (degrees)
 */
export function angularSeparation(
  eq1: EquatorialCoordinates,
  eq2: EquatorialCoordinates
): number {
  const ra1 = hoursToDeg(eq1.rightAscension) * Math.PI / 180;
  const dec1 = degToRad(eq1.declination);
  const ra2 = hoursToDeg(eq2.rightAscension) * Math.PI / 180;
  const dec2 = degToRad(eq2.declination);

  const dRA = ra2 - ra1;
  const sinDec1 = Math.sin(dec1);
  const sinDec2 = Math.sin(dec2);
  const cosDec1 = Math.cos(dec1);
  const cosDec2 = Math.cos(dec2);
  const cosDRA = Math.cos(dRA);

  const cosAng = sinDec1 * sinDec2 + cosDec1 * cosDec2 * cosDRA;
  // Clamp for numerical stability
  const clamped = Math.max(-1, Math.min(1, cosAng));
  return radToDeg(Math.acos(clamped));
}

/**
 * Position angle from eq1 to eq2 (degrees, North=0, East=90)
 */
export function positionAngle(
  eq1: EquatorialCoordinates,
  eq2: EquatorialCoordinates
): number {
  const ra1 = hoursToDeg(eq1.rightAscension) * Math.PI / 180;
  const dec1 = degToRad(eq1.declination);
  const ra2 = hoursToDeg(eq2.rightAscension) * Math.PI / 180;
  const dec2 = degToRad(eq2.declination);

  const dRA = ra2 - ra1;
  const sinDRA = Math.sin(dRA);
  const cosDRA = Math.cos(dRA);
  const sinDec1 = Math.sin(dec1);
  const sinDec2 = Math.sin(dec2);
  const cosDec1 = Math.cos(dec1);
  const cosDec2 = Math.cos(dec2);

  const num = sinDRA * cosDec2;
  const den = cosDec1 * sinDec2 - sinDec1 * cosDec2 * cosDRA;

  let pa = Math.atan2(num, den);
  if (pa < 0) pa += 2 * Math.PI;

  return radToDeg(pa);
}

// Missing constant
const DAYS_PER_JULIAN_YEAR = 365.25;