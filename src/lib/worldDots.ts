/**
 * A deliberately rough world map, drawn as a grid of dots.
 * Continents are hand-traced [lon, lat] outlines; good enough to orient by,
 * not for navigation.
 */
type Poly = [number, number][]

const LAND: Poly[] = [
  // North America
  [[-168, 66], [-156, 71], [-130, 70], [-110, 73], [-90, 72], [-80, 64], [-65, 60], [-56, 52], [-66, 45], [-70, 42], [-76, 35], [-80, 32], [-81, 25], [-84, 30], [-90, 29], [-97, 27], [-97, 21], [-91, 18], [-87, 21], [-88, 15], [-83, 10], [-78, 8], [-85, 11], [-92, 14], [-105, 20], [-110, 24], [-115, 30], [-117, 33], [-121, 36], [-124, 41], [-124, 47], [-128, 51], [-134, 57], [-142, 60], [-152, 59], [-158, 56], [-165, 54], [-160, 59], [-166, 62]],
  // Greenland
  [[-55, 60], [-42, 60], [-20, 70], [-20, 80], [-60, 82], [-72, 78], [-58, 70]],
  // South America
  [[-80, 9], [-72, 12], [-62, 11], [-50, 2], [-35, -5], [-38, -13], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -41], [-68, -50], [-70, -55], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, 0], [-77, 4]],
  // Eurasia
  [[-10, 36], [-9, 43], [-1, 46], [-5, 48], [2, 51], [8, 54], [8, 58], [5, 62], [15, 69], [28, 71], [42, 67], [60, 69], [80, 73], [100, 77], [120, 73], [140, 72], [160, 70], [180, 68], [178, 62], [163, 58], [156, 51], [142, 53], [140, 46], [130, 42], [126, 37], [122, 31], [121, 25], [110, 20], [108, 12], [105, 9], [100, 13], [99, 8], [103, 1], [98, 8], [94, 16], [91, 22], [86, 20], [80, 15], [77, 8], [73, 16], [70, 21], [66, 25], [57, 25], [59, 22], [53, 16], [44, 12], [43, 15], [39, 22], [35, 28], [34, 31], [36, 36], [28, 37], [26, 40], [23, 38], [20, 40], [19, 42], [13, 45], [16, 41], [18, 40], [16, 38], [12, 42], [8, 44], [3, 43], [0, 39], [-6, 36]],
  // Arabian peninsula fill
  [[35, 28], [48, 30], [50, 26], [56, 24], [59, 22], [53, 16], [44, 12], [43, 15], [39, 22]],
  // Britain & Ireland
  [[-6, 50], [2, 51], [0, 54], [-2, 56], [-5, 58], [-6, 56], [-3, 54], [-5, 52]],
  [[-10, 52], [-6, 52], [-6, 55], [-10, 54]],
  // Africa
  [[-17, 21], [-16, 12], [-12, 7], [-5, 5], [8, 4], [9, 0], [12, -5], [13, -12], [12, -18], [15, -27], [18, -34], [25, -34], [32, -28], [35, -22], [40, -15], [40, -5], [43, 0], [51, 11], [44, 11], [39, 18], [32, 31], [20, 32], [11, 37], [0, 36], [-6, 36], [-10, 30], [-13, 27]],
  // Madagascar
  [[44, -16], [50, -14], [48, -25], [44, -24]],
  // Australia
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [151, -34], [146, -39], [138, -35], [131, -31], [115, -34], [114, -26]],
  // Japan
  [[130, 31], [135, 34], [140, 36], [142, 41], [141, 45], [140, 40], [136, 36], [131, 34]],
  // Indonesia, Borneo, New Guinea
  [[95, 5], [98, 4], [106, -6], [104, -5]],
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]],
  [[106, -6], [115, -8], [120, -9], [106, -8]],
  [[131, -1], [141, -3], [150, -10], [141, -9]],
  // New Zealand
  [[172, -35], [178, -38], [174, -42], [167, -46], [171, -44]],
]

function inside([x, y]: [number, number], poly: Poly) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

export const MAP = { lonMin: -170, lonMax: 180, latMax: 78, latMin: -50, width: 700, height: 260 }

export function project(lon: number, lat: number) {
  return {
    x: ((lon - MAP.lonMin) / (MAP.lonMax - MAP.lonMin)) * MAP.width,
    y: ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.height,
  }
}

/** Land dots, computed once. */
export const LAND_DOTS: { x: number; y: number }[] = (() => {
  const dots: { x: number; y: number }[] = []
  const step = 3
  for (let lat = MAP.latMax - step / 2; lat > MAP.latMin; lat -= step) {
    for (let lon = MAP.lonMin + step / 2; lon < MAP.lonMax; lon += step) {
      if (LAND.some((p) => inside([lon, lat], p))) dots.push(project(lon, lat))
    }
  }
  return dots
})()

/** Great-circle distance in km. */
export function distanceKm(a: { lon: number; lat: number }, b: { lon: number; lat: number }) {
  const r = Math.PI / 180
  const dLat = (b.lat - a.lat) * r
  const dLon = (b.lon - a.lon) * r
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
