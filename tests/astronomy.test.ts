import { describe, it, expect } from 'vitest';
import { degToRad, radToDeg, dateToJd, jdToDate } from '../src/astronomy/constants';
import { solveKepler, trueAnomalyFromEccentric } from '../src/orbits/index';
import { equatorialToCartesian, cartesianToEquatorial } from '../src/astronomy/coordinates';

describe('Astronomical Calculations', () => {
  it('should convert degrees and radians correctly', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 6);
    expect(radToDeg(Math.PI)).toBeCloseTo(180, 6);
  });

  it('should convert Julian Dates correctly', () => {
    // J2000.0 epoch JD = 2451545.0
    const d = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const jd = dateToJd(d);
    expect(jd).toBeCloseTo(2451545.0, 4);

    const backDate = jdToDate(2451545.0);
    expect(backDate.getUTCFullYear()).toBe(2000);
    expect(backDate.getUTCMonth()).toBe(0);
    expect(backDate.getUTCDate()).toBe(1);
    expect(backDate.getUTCHours()).toBe(12);
  });

  it('should solve Kepler\'s equation accurately', () => {
    const M = Math.PI / 4;
    const e = 0.1;
    const E = solveKepler(M, e);
    // E - e*sin(E) should equal M
    expect(E - e * Math.sin(E)).toBeCloseTo(M, 10);
  });

  it('should handle coordinate conversions losslessly', () => {
    const eq = { rightAscension: 12.5, declination: 45.0, distance: 1.5, epoch: 'J2000' as const };
    const cart = equatorialToCartesian(eq);
    const eqBack = cartesianToEquatorial(cart);
    expect(eqBack.rightAscension).toBeCloseTo(eq.rightAscension, 5);
    expect(eqBack.declination).toBeCloseTo(eq.declination, 5);
  });
});
