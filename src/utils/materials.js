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
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    textureCache[cacheKey] = tex;
  }
  return textureCache[cacheKey];
}

/**
 * Ultra-Realistic Scanned PBR Metal Materials
 * Applied to ALL structural models (Datasmith and technical details),
 * excluding scanned photogrammetry Tripo models which keep their baked maps.
 */
export function createRealisticMaterial(preset = 'steel_hot_rolled', partName = '', detailId = '', materialName = '') {
  const nameLower = (partName || '').toLowerCase();
  const matLower = (materialName || '').toLowerCase();

  // Genuine Scanned Structural Steel PBR Maps from the original nudos (Metal046B)
  const steelScale = 0.65; // Physical metric scale matching structural rolled beams
  const steelDiff = getTexture('steelRealDiff', '/textures/steel_color_real.jpg', steelScale);
  const steelRough = getTexture('steelRealRough', '/textures/steel_roughness_real.jpg', steelScale);
  const steelNormal = getTexture('steelRealNormal', '/textures/steel_normal_real.jpg', steelScale);
  const steelMetal = getTexture('steelRealMetal', '/textures/steel_metalness_real.jpg', steelScale);

  // Galvanized Fasteners & Hardware
  const boltScale = 1.6;
  const boltDiff = getTexture('galvRealDiff', '/textures/galv_color_real.jpg', boltScale);
  const boltRough = getTexture('galvRealRough', '/textures/galv_roughness_real.jpg', boltScale);
  const boltNormal = getTexture('galvRealNormal', '/textures/galv_normal_real.jpg', boltScale);
  const boltMetal = getTexture('galvRealMetal', '/textures/galv_metalness_real.jpg', boltScale);

  // Fasteners, bolts, nuts, and washers get galvanized metal finish
  const isFastener = (
    nameLower.includes('tornillo') ||
    nameLower.includes('perno') ||
    nameLower.includes('tuerca') ||
    nameLower.includes('arandela') ||
    nameLower.includes('bolt') ||
    nameLower.includes('screw') ||
    matLower.includes('cromo') ||
    matLower.includes('niquel') ||
    matLower.includes('zinc')
  );

  if (isFastener && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: boltDiff,
      roughnessMap: boltRough,
      normalMap: boltNormal,
      normalScale: new THREE.Vector2(0.4, 0.4),
      metalnessMap: boltMetal,
      roughness: 0.35,
      metalness: 0.75,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // ALL structural parts receive the genuine hot rolled steel material of the nudos
  switch (preset) {
    case 'steel_hot_rolled':
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

    case 'galvanized':
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: boltDiff,
        roughnessMap: boltRough,
        normalMap: boltNormal,
        normalScale: new THREE.Vector2(0.4, 0.4),
        metalnessMap: boltMetal,
        roughness: 0.35,
        metalness: 0.75,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });

    case 'red_primer':
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

    case 'stainless':
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

    case 'wireframe':
      return new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        wireframe: true,
        side: THREE.DoubleSide
      });
  }
}
