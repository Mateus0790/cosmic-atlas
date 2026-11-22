/**
 * Cosmic Atlas - Astronomical Constants & Units
 * IAU 2015 Resolution B3 values and standard conversions
 */

// ============================================================================
// FUNDAMENTAL CONSTANTS (IAU 2015 Resolution B3)
// ============================================================================

/**
 * Gaussian gravitational constant (k) - defines the astronomical unit
 * k = 0.01720209895 (exact by definition)
 */
export const GAUSSIAN_GRAVITATIONAL_CONSTANT = 0.01720209895;

/**
 * Astronomical Unit in meters (exact by IAU 2012 Resolution B2)
 * 1 AU = 149,597,870,700 m exactly
 */
export const AU_METERS = 149597870700;

/**
 * Speed of light in vacuum (exact)
 * c = 299,792,458 m/s
 */
export const SPEED_OF_LIGHT_MS = 299792458;

/**
 * Light-second in meters
 */
export const LIGHT_SECOND_METERS = SPEED_OF_LIGHT_MS;

/**
 * Light-minute in meters
 */
export const LIGHT_MINUTE_METERS = LIGHT_SECOND_METERS * 60;

/**
 * Light-hour in meters
 */
export const LIGHT_HOUR_METERS = LIGHT_MINUTE_METERS * 60;

/**
 * Light-day in meters
 */
export const LIGHT_DAY_METERS = LIGHT_HOUR_METERS * 24;

/**
 * Light-year in meters (IAU definition: 365.25 days)
 * 1 ly = 9,460,730,472,580,800 m
 */
export const LIGHT_YEAR_METERS = LIGHT_DAY_METERS * 365.25;

/**
 * Parsec in meters (IAU 2015: exactly 648000/π AU)
 * 1 pc = 3.0856775814913673e16 m
 */
export const PARSEC_METERS = AU_METERS * (648000 / Math.PI);

/**
 * Kiloparsec in meters
 */
export const KILOPARSEC_METERS = PARSEC_METERS * 1000;

/**
 * Megaparsec in meters
 */
export const MEGAPARSEC_METERS = KILOPARSEC_METERS * 1000;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

/**
 * Seconds per minute
 */
export const SECONDS_PER_MINUTE = 60;

/**
 * Seconds per hour
 */
export const SECONDS_PER_HOUR = 3600;

/**
 * Seconds per day (SI day = 86400 s)
 */
export const SECONDS_PER_DAY = 86400;

/**
 * Days per Julian year (exactly 365.25)
 */
export const DAYS_PER_JULIAN_YEAR = 365.25;

/**
 * Seconds per Julian year
 */
export const SECONDS_PER_JULIAN_YEAR = SECONDS_PER_DAY * DAYS_PER_JULIAN_YEAR;

/**
 * Julian Date of J2000.0 epoch
 * JD 2451545.0 = 2000-01-01 12:00:00 TT
 */
export const J2000_JULIAN_DATE = 2451545.0;

/**
 * Modified Julian Date offset
 * MJD = JD - 2400000.5
 */
export const MJD_OFFSET = 2400000.5;

/**
 * TT - TAI offset (seconds)
 * TT = TAI + 32.184 s
 */
export const TT_MINUS_TAI = 32.184;

// ============================================================================
// SOLAR SYSTEM CONSTANTS
// ============================================================================

/**
 * Solar mass in kg (IAU 2015: 1.98855e30 kg nominal)
 */
export const SOLAR_MASS_KG = 1.98855e30;

/**
 * Solar radius in meters (IAU 2015: 695,700 km nominal)
 */
export const SOLAR_RADIUS_METERS = 695700000;

/**
 * Solar luminosity in watts (IAU 2015: 3.828e26 W nominal)
 */
export const SOLAR_LUMINOSITY_WATTS = 3.828e26;

/**
 * Standard gravitational parameter of the Sun (μ = GM)
 * μ☉ = 1.32712440018e20 m³/s² (IAU 2015 nominal)
 */
export const SUN_GM = 1.32712440018e20;

/**
 * Earth mass in kg
 */
export const EARTH_MASS_KG = 5.9722e24;

/**
 * Earth radius in meters (equatorial)
 */
export const EARTH_RADIUS_EQUATORIAL_METERS = 6378137;

/**
 * Earth radius in meters (polar)
 */
export const EARTH_RADIUS_POLAR_METERS = 6356752.3142;

/**
 * Earth mean radius in meters
 */
export const EARTH_RADIUS_MEAN_METERS = 6371008.7714;

/**
 * Standard gravitational parameter of Earth
 * μ🜨 = 3.986004418e14 m³/s²
 */
export const EARTH_GM = 3.986004418e14;

/**
 * Earth rotation rate (radians/second)
 * ω = 7.2921150e-5 rad/s (IERS 2010)
 */
export const EARTH_ROTATION_RATE = 7.2921150e-5;

/**
 * J2 gravitational harmonic coefficient for Earth
 */
export const EARTH_J2 = 0.00108262998905;

/**
 * Earth's obliquity at J2000 (degrees)
 * ε = 23.4392911°
 */
export const EARTH_OBLIQUITY_J2000_DEG = 23.4392911;

/**
 * Earth's obliquity at J2000 (radians)
 */
export const EARTH_OBLIQUITY_J2000_RAD = EARTH_OBLIQUITY_J2000_DEG * Math.PI / 180;

// ============================================================================
// PLANETARY CONSTANTS (IAU 2015 / NASA JPL DE430)
// ============================================================================

export interface PlanetConstants {
  name: string;
  massKg: number;
  gm: number;                    // Standard gravitational parameter (m³/s²)
  radiusEquatorialM: number;     // Equatorial radius (m)
  radiusPolarM: number;          // Polar radius (m)
  radiusMeanM: number;           // Mean volumetric radius (m)
  rotationPeriodS: number;       // Sidereal rotation period (s)
  axialTiltDeg: number;          // Obliquity to orbit (degrees)
  albedo: number;                // Bond albedo
  semiMajorAxisAU: number;       // Semi-major axis (AU)
  eccentricity: number;          // Orbital eccentricity
  inclinationDeg: number;        // Orbital inclination to ecliptic (degrees)
  orbitalPeriodDays: number;     // Sidereal orbital period (days)
  spectralType?: string;         // For the Sun
  effectiveTempK?: number;       // Effective temperature (K)
  luminositySolar?: number;      // Luminosity (L☉)
  absoluteMagnitude?: number;    // Absolute magnitude
}

// Sun
export const SUN: PlanetConstants = {
  name: 'Sun',
  massKg: SOLAR_MASS_KG,
  gm: SUN_GM,
  radiusEquatorialM: SOLAR_RADIUS_METERS,
  radiusPolarM: SOLAR_RADIUS_METERS,
  radiusMeanM: SOLAR_RADIUS_METERS,
  rotationPeriodS: 25.05 * SECONDS_PER_DAY,  // Carrington rotation
  axialTiltDeg: 7.25,
  albedo: 0,
  semiMajorAxisAU: 0,
  eccentricity: 0,
  inclinationDeg: 0,
  orbitalPeriodDays: 0,
  spectralType: 'G2V',
  effectiveTempK: 5778,
  luminositySolar: 1,
  absoluteMagnitude: 4.83,
};

// Mercury
export const MERCURY: PlanetConstants = {
  name: 'Mercury',
  massKg: 3.3011e23,
  gm: 2.2032e13,
  radiusEquatorialM: 2439700,
  radiusPolarM: 2439700,
  radiusMeanM: 2439700,
  rotationPeriodS: 58.646 * SECONDS_PER_DAY,
  axialTiltDeg: 0.034,
  albedo: 0.068,
  semiMajorAxisAU: 0.387098,
  eccentricity: 0.205630,
  inclinationDeg: 7.00487,
  orbitalPeriodDays: 87.969,
  absoluteMagnitude: -0.36,
};

// Venus
export const VENUS: PlanetConstants = {
  name: 'Venus',
  massKg: 4.8675e24,
  gm: 3.24858592e14,
  radiusEquatorialM: 6051800,
  radiusPolarM: 6051800,
  radiusMeanM: 6051800,
  rotationPeriodS: -243.0226 * SECONDS_PER_DAY,  // Retrograde
  axialTiltDeg: 177.36,
  albedo: 0.90,
  semiMajorAxisAU: 0.723332,
  eccentricity: 0.006772,
  inclinationDeg: 3.39471,
  orbitalPeriodDays: 224.701,
  absoluteMagnitude: -4.40,
};

// Earth
export const EARTH: PlanetConstants = {
  name: 'Earth',
  massKg: EARTH_MASS_KG,
  gm: EARTH_GM,
  radiusEquatorialM: EARTH_RADIUS_EQUATORIAL_METERS,
  radiusPolarM: EARTH_RADIUS_POLAR_METERS,
  radiusMeanM: EARTH_RADIUS_MEAN_METERS,
  rotationPeriodS: 86164.0905,  // Sidereal day
  axialTiltDeg: 23.4392911,
  albedo: 0.306,
  semiMajorAxisAU: 1.000001018,
  eccentricity: 0.0167086,
  inclinationDeg: 0.00005,
  orbitalPeriodDays: 365.256363,
  absoluteMagnitude: -3.99,
};

// Mars
export const MARS: PlanetConstants = {
  name: 'Mars',
  massKg: 6.4171e23,
  gm: 4.282837e13,
  radiusEquatorialM: 3396200,
  radiusPolarM: 3376200,
  radiusMeanM: 3389500,
  rotationPeriodS: 1.025957 * SECONDS_PER_DAY,
  axialTiltDeg: 25.19,
  albedo: 0.25,
  semiMajorAxisAU: 1.523662,
  eccentricity: 0.093412,
  inclinationDeg: 1.85061,
  orbitalPeriodDays: 686.980,
  absoluteMagnitude: -1.52,
};

// Jupiter
export const JUPITER: PlanetConstants = {
  name: 'Jupiter',
  massKg: 1.8982e27,
  gm: 1.26686531e17,
  radiusEquatorialM: 71492000,
  radiusPolarM: 66854000,
  radiusMeanM: 69911000,
  rotationPeriodS: 9.925 * SECONDS_PER_HOUR,
  axialTiltDeg: 3.13,
  albedo: 0.503,
  semiMajorAxisAU: 5.203363,
  eccentricity: 0.048392,
  inclinationDeg: 1.30530,
  orbitalPeriodDays: 4332.59,
  absoluteMagnitude: -9.25,
};

// Saturn
export const SATURN: PlanetConstants = {
  name: 'Saturn',
  massKg: 5.6834e26,
  gm: 3.7931187e16,
  radiusEquatorialM: 60268000,
  radiusPolarM: 54364000,
  radiusMeanM: 58232000,
  rotationPeriodS: 10.656 * SECONDS_PER_HOUR,
  axialTiltDeg: 26.73,
  albedo: 0.342,
  semiMajorAxisAU: 9.537070,
  eccentricity: 0.054150,
  inclinationDeg: 2.48446,
  orbitalPeriodDays: 10759.22,
  absoluteMagnitude: -8.91,
};

// Uranus
export const URANUS: PlanetConstants = {
  name: 'Uranus',
  massKg: 8.6810e25,
  gm: 5.793939e15,
  radiusEquatorialM: 25559000,
  radiusPolarM: 24973000,
  radiusMeanM: 25362000,
  rotationPeriodS: -17.24 * SECONDS_PER_HOUR,  // Retrograde
  axialTiltDeg: 97.77,
  albedo: 0.300,
  semiMajorAxisAU: 19.191263,
  eccentricity: 0.047167,
  inclinationDeg: 0.76986,
  orbitalPeriodDays: 30688.5,
  absoluteMagnitude: -7.19,
};

// Neptune
export const NEPTUNE: PlanetConstants = {
  name: 'Neptune',
  massKg: 1.0241e26,
  gm: 6.835100e15,
  radiusEquatorialM: 24764000,
  radiusPolarM: 24341000,
  radiusMeanM: 24622000,
  rotationPeriodS: 16.11 * SECONDS_PER_HOUR,
  axialTiltDeg: 28.32,
  albedo: 0.290,
  semiMajorAxisAU: 30.068963,
  eccentricity: 0.008585,
  inclinationDeg: 1.76917,
  orbitalPeriodDays: 60182,
  absoluteMagnitude: -6.87,
};

// Moon
export const MOON: PlanetConstants = {
  name: 'Moon',
  massKg: 7.342e22,
  gm: 4.9048695e12,
  radiusEquatorialM: 1738100,
  radiusPolarM: 1736000,
  radiusMeanM: 1737400,
  rotationPeriodS: 27.321661 * SECONDS_PER_DAY,  // Synchronous
  axialTiltDeg: 6.68,
  albedo: 0.136,
  semiMajorAxisAU: 0.002569,  // Relative to Earth
  eccentricity: 0.0549,
  inclinationDeg: 5.145,
  orbitalPeriodDays: 27.321661,
  absoluteMagnitude: 0.25,
};

// All planets in order
export const PLANETS: PlanetConstants[] = [
  SUN,
  MERCURY,
  VENUS,
  EARTH,
  MARS,
  JUPITER,
  SATURN,
  URANUS,
  NEPTUNE,
];

// By name lookup
export const PLANETS_BY_NAME: Record<string, PlanetConstants> = {
  sun: SUN,
  mercury: MERCURY,
  venus: VENUS,
  earth: EARTH,
  mars: MARS,
  jupiter: JUPITER,
  saturn: SATURN,
  uranus: URANUS,
  neptune: NEPTUNE,
  moon: MOON,
};

// ============================================================================
// COSMOLOGICAL CONSTANTS (Planck 2018 / ΛCDM)
// ============================================================================

/**
 * Hubble constant (km/s/Mpc) - Planck 2018
 * H₀ = 67.36 ± 0.54 km/s/Mpc
 */
export const HUBBLE_CONSTANT_KM_S_MPC = 67.36;

/**
 * Hubble time (years) = 1/H₀
 */
export const HUBBLE_TIME_YEARS = 14.4e9;

/**
 * Hubble distance (Mpc) = c/H₀
 */
export const HUBBLE_DISTANCE_MPC = 299792.458 / HUBBLE_CONSTANT_KM_S_MPC;

/**
 * Matter density parameter Ωₘ
 */
export const OMEGA_MATTER = 0.3153;

/**
 * Dark energy density parameter ΩΛ
 */
export const OMEGA_LAMBDA = 0.6847;

/**
 * Radiation density parameter Ωᵣ
 */
export const OMEGA_RADIATION = 9.2e-5;

/**
 * Curvature density parameter Ωₖ
 */
export const OMEGA_CURVATURE = 0.0;

/**
 * CMB temperature (K)
 */
export const CMB_TEMPERATURE_K = 2.72548;

/**
 * Age of universe (years) - Planck 2018
 */
export const AGE_OF_UNIVERSE_YEARS = 13.797e9;

/**
 * Redshift of matter-radiation equality
 */
export const Z_EQ = 3402;

/**
 * Redshift of recombination
 */
export const Z_REC = 1089.9;

// ============================================================================
// UNIT CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert AU to meters
 */
export function auToMeters(au: number): number {
  return au * AU_METERS;
}

/**
 * Convert meters to AU
 */
export function metersToAu(meters: number): number {
  return meters / AU_METERS;
}

/**
 * Convert parsecs to meters
 */
export function parsecToMeters(pc: number): number {
  return pc * PARSEC_METERS;
}

/**
 * Convert meters to parsecs
 */
export function metersToParsec(meters: number): number {
  return meters / PARSEC_METERS;
}

/**
 * Convert light-years to meters
 */
export function lightYearToMeters(ly: number): number {
  return ly * LIGHT_YEAR_METERS;
}

/**
 * Convert meters to light-years
 */
export function metersToLightYear(meters: number): number {
  return meters / LIGHT_YEAR_METERS;
}

/**
 * Convert parsecs to light-years
 */
export function parsecToLightYear(pc: number): number {
  return pc * (PARSEC_METERS / LIGHT_YEAR_METERS);
}

/**
 * Convert light-years to parsecs
 */
export function lightYearToParsec(ly: number): number {
  return ly * (LIGHT_YEAR_METERS / PARSEC_METERS);
}

/**
 * Convert degrees to radians
 */
export function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

/**
 * Convert hours to degrees (RA)
 */
export function hoursToDeg(hours: number): number {
  return hours * 15;
}

/**
 * Convert degrees to hours (RA)
 */
export function degToHours(deg: number): number {
  return deg / 15;
}

/**
 * Convert arcseconds to radians
 */
export function arcsecToRad(arcsec: number): number {
  return arcsec * Math.PI / (180 * 3600);
}

/**
 * Convert radians to arcseconds
 */
export function radToArcsec(rad: number): number {
  return rad * (180 * 3600) / Math.PI;
}

/**
 * Convert mas (milliarcseconds) to radians
 */
export function masToRad(mas: number): number {
  return mas * Math.PI / (180 * 3600 * 1000);
}

/**
 * Convert Julian Date to Date object
 */
export function jdToDate(jd: number): Date {
  // JD 2440587.5 = 1970-01-01 00:00:00 UTC (Unix epoch)
  const unixEpochJD = 2440587.5;
  const msSinceEpoch = (jd - unixEpochJD) * SECONDS_PER_DAY * 1000;
  return new Date(msSinceEpoch);
}

/**
 * Convert Date object to Julian Date
 */
export function dateToJd(date: Date): number {
  const unixEpochJD = 2440587.5;
  const msSinceEpoch = date.getTime();
  return unixEpochJD + msSinceEpoch / (SECONDS_PER_DAY * 1000);
}

/**
 * Convert Julian Date to Modified Julian Date
 */
export function jdToMjd(jd: number): number {
  return jd - MJD_OFFSET;
}

/**
 * Convert Modified Julian Date to Julian Date
 */
export function mjdToJd(mjd: number): number {
  return mjd + MJD_OFFSET;
}

/**
 * Get current Julian Date
 */
export function nowJd(): number {
  return dateToJd(new Date());
}

/**
 * Get current Terrestrial Time (TT) as Julian Date
 * TT ≈ UTC + 32.184s + leap seconds (approximate)
 */
export function nowTt(): number {
  const utc = nowJd();
  // Approximate: TT = UTC + 69.184s (as of 2023, includes leap seconds)
  // For precise work, use IERS bulletins
  return utc + 69.184 / SECONDS_PER_DAY;
}

/**
 * Calculate Julian centuries since J2000.0
 * T = (JD - 2451545.0) / 36525
 */
export function julianCenturiesSinceJ2000(jd: number): number {
  return (jd - J2000_JULIAN_DATE) / 36525;
}

/**
 * Convert km/s to m/s
 */
export function kmsToMs(kms: number): number {
  return kms * 1000;
}

/**
 * Convert m/s to km/s
 */
export function msToKms(ms: number): number {
  return ms / 1000;
}

/**
 * Convert magnitude to flux ratio (relative to mag 0)
 * flux = 10^(-0.4 * mag)
 */
export function magToFlux(mag: number): number {
  return Math.pow(10, -0.4 * mag);
}

/**
 * Convert flux ratio to magnitude
 * mag = -2.5 * log10(flux)
 */
export function fluxToMag(flux: number): number {
  return -2.5 * Math.log10(flux);
}

/**
 * Calculate distance modulus
 * m - M = 5 * log10(d/10pc)
 */
export function distanceModulus(distancePc: number): number {
  return 5 * Math.log10(distancePc / 10);
}

/**
 * Calculate distance from distance modulus
 * d = 10 * 10^((m-M)/5) parsecs
 */
export function distanceFromModulus(modulus: number): number {
  return 10 * Math.pow(10, modulus / 5);
}

/**
 * Calculate absolute magnitude from apparent magnitude and distance
 * M = m - 5 * log10(d/10pc)
 */
export function absoluteMagnitude(apparentMag: number, distancePc: number): number {
  return apparentMag - distanceModulus(distancePc);
}

/**
 * Calculate apparent magnitude from absolute magnitude and distance
 * m = M + 5 * log10(d/10pc)
 */
export function apparentMagnitude(absoluteMag: number, distancePc: number): number {
  return absoluteMag + distanceModulus(distancePc);
}

/**
 * Convert redshift to recession velocity (low-z approximation)
 * v = c * z
 */
export function redshiftToVelocity(z: number): number {
  return z * SPEED_OF_LIGHT_MS;
}

/**
 * Convert recession velocity to redshift (low-z)
 * z = v / c
 */
export function velocityToRedshift(v: number): number {
  return v / SPEED_OF_LIGHT_MS;
}

/**
 * Light travel time for distance in meters (seconds)
 */
export function lightTravelTime(meters: number): number {
  return meters / SPEED_OF_LIGHT_MS;
}

/**
 * Format distance in human-readable units
 */
export function formatDistance(meters: number): string {
  if (meters < AU_METERS) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  if (meters < LIGHT_YEAR_METERS) {
    return `${(meters / AU_METERS).toFixed(3)} AU`;
  }
  if (meters < PARSEC_METERS) {
    return `${(meters / LIGHT_YEAR_METERS).toFixed(2)} ly`;
  }
  if (meters < KILOPARSEC_METERS) {
    return `${(meters / PARSEC_METERS).toFixed(2)} pc`;
  }
  if (meters < MEGAPARSEC_METERS) {
    return `${(meters / KILOPARSEC_METERS).toFixed(2)} kpc`;
  }
  return `${(meters / MEGAPARSEC_METERS).toFixed(2)} Mpc`;
}

/**
 * Format velocity in human-readable units
 */
export function formatVelocity(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(2)} m/s`;
  }
  if (ms < SPEED_OF_LIGHT_MS) {
    return `${(ms / 1000).toFixed(2)} km/s`;
  }
  return `${(ms / SPEED_OF_LIGHT_MS).toFixed(4)} c`;
}

/**
 * Format time in human-readable units
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
  if (seconds < 31557600) return `${(seconds / 86400).toFixed(1)} d`;
  return `${(seconds / 31557600).toFixed(2)} yr`;
}