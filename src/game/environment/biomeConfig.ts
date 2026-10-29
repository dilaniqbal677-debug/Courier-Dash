/**
 * Dynamic Biomes & Atmospheric Lighting Configurations
 * Seamlessly transitions the 3D map environment as the courier runs through different city districts
 */

export type BiomeId = 'perkotaan' | 'pelabuhan' | 'hutan' | 'angkasa';

export interface BiomeConfig {
  id: BiomeId;
  name: string;
  badge: string;
  icon: string;
  desc: string;
  startDistance: number;
  endDistance: number;
  
  // Sky & Atmospheric Lighting
  bgColor: number;
  fogColor: number;
  fogDensity: number;
  
  // Sunlight (Directional)
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  
  // Ambient & Rim
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  rimColor: number;
  rimIntensity: number;

  // Weather & Particles
  weather: {
    enabled: boolean;
    name: string;
    icon: string;
    particleColor: number;
    particleOpacity: number;
    particleSize: number;
    fallSpeed: number;
  };

  // Surface Road Characteristics
  roadRoughness: number;
  roadMetalness: number;
  curbStyle: 'modern' | 'hazard' | 'neon' | 'guardrail';
  tractionModifier: number; // 1.0 = normal, < 1.0 = slippery
}

export const BIOMES: Record<BiomeId, BiomeConfig> = {
  perkotaan: {
    id: 'perkotaan',
    name: 'Pusat Perkotaan HND',
    badge: 'METROPOLIS',
    icon: '🏢',
    desc: 'Kawasan kota modern, gedung pencakar langit & trotoar kota yang sibuk',
    startDistance: 0,
    endDistance: 250,
    bgColor: 0x7dd3fc, 
    fogColor: 0xbae6fd,
    fogDensity: 0.0035,
    sunColor: 0xfffbeb,
    sunIntensity: 2.3,
    sunPosition: [14, 24, 12],
    hemiSkyColor: 0xbae6fd,
    hemiGroundColor: 0x475569,
    hemiIntensity: 1.25,
    rimColor: 0x38bdf8,
    rimIntensity: 0.8,
    weather: {
      enabled: false,
      name: 'Cerah',
      icon: '☀️',
      particleColor: 0xffffff,
      particleOpacity: 0,
      particleSize: 0,
      fallSpeed: 0,
    },
    roadRoughness: 0.7,
    roadMetalness: 0.1,
    curbStyle: 'modern',
    tractionModifier: 1.0,
  },
  pelabuhan: {
    id: 'pelabuhan',
    name: 'Pelabuhan Kargo HND',
    badge: 'DOCKYARD',
    icon: '⚓',
    desc: 'Area pelabuhan dengan peti kemas, crane besar & kabut laut',
    startDistance: 250,
    endDistance: 500,
    bgColor: 0x64748b, 
    fogColor: 0x94a3b8,
    fogDensity: 0.008,
    sunColor: 0xd1d5db,
    sunIntensity: 1.5,
    sunPosition: [10, 15, 20],
    hemiSkyColor: 0x64748b,
    hemiGroundColor: 0x1e293b,
    hemiIntensity: 1.0,
    rimColor: 0x94a3b8,
    rimIntensity: 0.5,
    weather: {
      enabled: true,
      name: 'Berkabut',
      icon: '🌫️',
      particleColor: 0xffffff,
      particleOpacity: 0.3,
      particleSize: 0.2,
      fallSpeed: 2,
    },
    roadRoughness: 0.9,
    roadMetalness: 0.3,
    curbStyle: 'hazard',
    tractionModifier: 0.9,
  },
  hutan: {
    id: 'hutan',
    name: 'Hutan Belantara HND',
    badge: 'JUNGLE RUN',
    icon: '🌲',
    desc: 'Jalur hutan dengan pepohonan lebat, dedaunan & nuansa alam',
    startDistance: 500,
    endDistance: 750,
    bgColor: 0x166534, 
    fogColor: 0x14532d,
    fogDensity: 0.012,
    sunColor: 0x84cc16,
    sunIntensity: 1.8,
    sunPosition: [5, 20, 10],
    hemiSkyColor: 0x15803d,
    hemiGroundColor: 0x064e3b,
    hemiIntensity: 1.1,
    rimColor: 0x86efac,
    rimIntensity: 0.6,
    weather: {
      enabled: true,
      name: 'Gerimis',
      icon: '🌧️',
      particleColor: 0xccfbf1,
      particleOpacity: 0.5,
      particleSize: 0.1,
      fallSpeed: 25,
    },
    roadRoughness: 0.95,
    roadMetalness: 0.0,
    curbStyle: 'guardrail',
    tractionModifier: 0.7,
  },
  angkasa: {
    id: 'angkasa',
    name: 'Luar Angkasa HND',
    badge: 'SPACE RUSH',
    icon: '🚀',
    desc: 'Luar angkasa dengan planet, bintang, dan neon futuristik',
    startDistance: 750,
    endDistance: 1000,
    bgColor: 0x020617, 
    fogColor: 0x0f172a,
    fogDensity: 0.001,
    sunColor: 0xffffff,
    sunIntensity: 0.5,
    sunPosition: [0, 50, 0],
    hemiSkyColor: 0x1e1b4b,
    hemiGroundColor: 0x000000,
    hemiIntensity: 0.4,
    rimColor: 0xec4899,
    rimIntensity: 1.5,
    weather: {
      enabled: true,
      name: 'Meteor',
      icon: '☄️',
      particleColor: 0xfef08a,
      particleOpacity: 0.8,
      particleSize: 0.3,
      fallSpeed: 40,
    },
    roadRoughness: 0.2,
    roadMetalness: 0.9,
    curbStyle: 'neon',
    tractionModifier: 1.0,
  },
};

export const BIOME_CYCLE_LENGTH = 1000;

export function getBiomeForDistance(distance: number): BiomeConfig {
  const normDist = Math.max(0, distance) % BIOME_CYCLE_LENGTH;
  if (normDist < 250) return BIOMES.perkotaan;
  if (normDist < 500) return BIOMES.pelabuhan;
  if (normDist < 750) return BIOMES.hutan;
  return BIOMES.angkasa;
}
