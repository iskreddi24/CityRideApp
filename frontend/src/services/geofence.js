
export const HYD_BOUNDS = { latMin:17.20, latMax:17.60, lngMin:78.30, lngMax:78.70 }
export function inHyderabad(p){ return p && p.lat>HYD_BOUNDS.latMin && p.lat<HYD_BOUNDS.latMax && p.lng>HYD_BOUNDS.lngMin && p.lng<HYD_BOUNDS.lngMax }
