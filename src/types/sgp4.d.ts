declare module 'sgp4' {
  export function sgp4(satrec: any, tsince: number): { error: number; pos: [number, number, number]; vel: [number, number, number] };
  export function twoline2rv(line1: string, line2: string, gravconst: any): any;
  export function gstime(jd: number): number;
  export function getgravconst(whichconst: string): any;
  export const wgs72: any;
  export const wgs84: any;
  const _default: any;
  export default _default;
}
