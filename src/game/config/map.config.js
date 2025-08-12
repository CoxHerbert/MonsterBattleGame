export default {
  chunkSize: 512,
  cacheKeepRadius: 3,
  obstacle: {
    perChunkRange: [2, 4],
    rectSize: [140, 360],
    thickness: [18, 34],
    cornerRadius: 8
  },
  walls: {
    perChunkRange: [0, 2],
    length: [180, 320],
    thickness: [12, 20]
  },
  grass: {
    perChunkRange: [8, 20],
    radius: [14, 36],
    baseColor: [100, 160, 22],
    alpha: 0.55
  },
  rivers: {
    enable: true,
    width: [38, 64],
    threshold: 0.22,
    meander: 0.008
  },
  tileTint: [8, 20],
  safeRadius: 380
};
