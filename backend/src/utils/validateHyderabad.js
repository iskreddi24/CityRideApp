
export function validateHyderabad(start, end){
  const b = { latMin:17.20, latMax:17.60, lngMin:78.30, lngMax:78.70 }
  const inR = (p)=> p && p.lat>b.latMin && p.lat<b.latMax && p.lng>b.lngMin && p.lng<b.lngMax
  return inR(start) && inR(end)
}
