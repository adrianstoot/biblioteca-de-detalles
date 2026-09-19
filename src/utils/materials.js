import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const textureCache = {};
const BASE = import.meta.env.BASE_URL || '/';

function resolveAsset(path) {
  return `${BASE}${path.replace(/^\//, '')}`;
}

function getTexture(key, path, repeat = 1.0) {
  const cacheKey = `${key}_${repeat}`;
  if (!textureCache[cacheKey]) {
    const fullPath = resolveAsset(path);
    const tex = textureLoader.load(fullPath);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    textureCache[cacheKey] = tex;
  }
  return textureCache[cacheKey];
}

/**
 * Ultra-Realistic Scanned PBR Materials (Megascans / AmbientCG grade)
 * Authentic Hot-Rolled Structural Steel (S275/S355) with exact physical metric scale.
 * Zero untextured black parts: All steel elements receive seamless PBR textures with DoubleSide.
 */
export function createRealisticMaterial(preset = 'steel_hot_rolled', partName = '', detailId = '') {
  const nameLower = (partName || '').toLowerCase();
  // Concrete check: Foundation pedestals, retaining wall panels, slabs, beams, footings
  const isPractice2 = (detailId || '').startsWith('P2');
  const isConcrete = (isPractice2 && (
    nameLower.includes('pedestal') ||
    nameLower.includes('capa:0.07') ||
    (detailId.includes('P2-B1') && nameLower.includes('capa')) ||
    (detailId.includes('P2-A2') && nameLower.includes('capa')) ||
    (detailId.includes('P2-A3') && nameLower.includes('capa'))
  )) || (
    nameLower.includes('hormigon') ||
    nameLower.includes('panel') ||
    nameLower.includes('zapata') ||
    nameLower.includes('viga') ||
    nameLower.includes('losa') ||
    nameLower.includes('arqueta') ||
    nameLower.includes('capa_compresion')
  );

  // Concrete Structural Elements
  if (isConcrete && preset !== 'wireframe') {
    const concDiff = getTexture('concDiff', '/textures/concrete_diffuse.png', 1.0);
    const concBump = getTexture('concBump', '/textures/concrete_bump.png', 1.0);

    return new THREE.MeshStandardMaterial({
      color: nameLower.includes('limpieza') ? 0xd1d5db : 0xe5e7eb,
      map: concDiff,
      bumpMap: concBump,
      bumpScale: 0.018,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // Terracotta / Ceramic (Bovedillas de forjado)
  if (nameLower.includes('bovedilla') && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xc25e38,
      roughness: 0.92,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
  }

  // Copper Earthing Electrodes & Cables (Puesta a tierra)
  if ((nameLower.includes('cobre') || nameLower.includes('pica') || nameLower.includes('cable_cobre')) && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.30,
      metalness: 0.85,
      side: THREE.DoubleSide
    });
  }

  // Cast Iron (Tapas de arqueta de registro y anclajes)
  if (nameLower.includes('tapa') && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.82,
      metalness: 0.65,
      side: THREE.DoubleSide
    });
  }

  // Genuine Scanned PBR Maps for Structural Steel (AmbientCG Metal046B)
  const steelScale = 0.65; // ~1.54m per tile, matching real rolled beams
  const steelDiff = getTexture('steelRealDiff', '/textures/steel_color_real.jpg', steelScale);
  const steelRough = getTexture('steelRealRough', '/textures/steel_roughness_real.jpg', steelScale);
  const steelNormal = getTexture('steelRealNormal', '/textures/steel_normal_real.jpg', steelScale);

  switch (preset) {
    case 'steel_hot_rolled': // Genuine Dark Charcoal Structural Steel S275 / S355
    default:
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: steelDiff,
        roughnessMap: steelRough,
        normalMap: steelNormal,
        normalScale: new THREE.Vector2(0.4, 0.4),
        roughness: 0.42,
        metalness: 0.38,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });

    case 'galvanized': // Genuine Scanned Galvanized Steel with Zinc Spangles (Metal038)
      const galvScale = 1.6;
      const galvDiff = getTexture('galvRealDiff', '/textures/galv_color_real.jpg', galvScale);
      const galvRough = getTexture('galvRealRough', '/textures/galv_roughness_real.jpg', galvScale);
      const galvNormal = getTexture('galvRealNormal', '/textures/galv_normal_real.jpg', galvScale);
      const galvMetal = getTexture('galvRealMetal', '/textures/galv_metalness_real.jpg', galvScale);

      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: galvDiff,
        roughnessMap: galvRough,
        normalMap: galvNormal,
        normalScale: new THREE.Vector2(0.4, 0.4),
        metalnessMap: galvMetal,
        roughness: 0.35,
        metalness: 0.75,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });

    case 'red_primer': // Red Oxide Structural Shop Primer (Minio de taller)
      return new THREE.MeshStandardMaterial({
        color: 0x93382c,
        map: steelDiff,
        roughnessMap: steelRough,
        normalMap: steelNormal,
        normalScale: new THREE.Vector2(0.35, 0.35),
        roughness: 0.78,
        metalness: 0.12,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });

    case 'stainless': // Satin Architectural Stainless Steel
      return new THREE.MeshStandardMaterial({
        color: 0xdce2ec,
        map: steelDiff,
        roughnessMap: steelRough,
        normalMap: steelNormal,
        normalScale: new THREE.Vector2(0.25, 0.25),
        roughness: 0.22,
        metalness: 0.90,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });

    case 'wireframe': // X-Ray Wireframe
      return new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        wireframe: true,
        side: THREE.DoubleSide
      });
  }
}
