import { describe, it, expect } from 'vitest';
import { solveKepler, trueAnomalyFromEccentric, parseTLE } from '../src/orbits/index';
import { equatorialToHorizontal, precessEquatorial } from '../src/astronomy/coordinates';

describe('Orbital Mechanics & Advanced Astronomy', () => {
  it('should solve Kepler equation correctly for circular and elliptical orbits', () => {
    expect(solveKepler(0, 0)).toBe(0);
    const M = 1.0;
    const e = 0.2;
    const E = solveKepler(M, e);
    expect(E - e * Math.sin(E)).toBeCloseTo(M, 8);
  });

  it('should compute true anomaly from eccentric anomaly', () => {
    const E = Math.PI / 2;
    const e = 0.5;
    const nu = trueAnomalyFromEccentric(E, e);
    expect(nu).toBeGreaterThan(0);
  });

  it('should parse TLE successfully', () => {
    const line1 = '1 25544U 98067A   26050.50000000  .00016717  00000-0  10270-3 0  9023';
    const line2 = '2 25544  51.6400 120.1234 0005678  45.1234 315.1234 15.50000000351234';
    const tle = parseTLE(line1, line2, 'ISS (ZARYA)');
    expect(tle.noradId).toBe(25544);
    expect(tle.name).toBe('ISS (ZARYA)');
  });

  it('should perform equinox precession without errors', () => {
    const eq = { rightAscension: 6.0, declination: -23.5, distance: 1.0, epoch: 'J2000' as const };
    const precessed = precessEquatorial(eq, 2451545.0, 2455000.0);
    expect(precessed.rightAscension).toBeDefined();
    expect(precessed.declination).toBeDefined();
  });
});
