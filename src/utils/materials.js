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
 * Ultra-Realistic Scanned PBR Materials (Megascans / AmbientCG grade)
 * Authentic Hot-Rolled Structural Steel (S275/S355), Photorealistic Concrete,
 * Galvanized Fasteners & Hardware, Timber/Wood, and Architectural Finishes.
 */
export function createRealisticMaterial(preset = 'steel_hot_rolled', partName = '', detailId = '', materialName = '') {
  const nameLower = (partName || '').toLowerCase();
  const matLower = (materialName || '').toLowerCase();
  const isDatasmith = (detailId || '').startsWith('maqueta-ma');

  // Textures
  const steelScale = 1.0;
  const steelDiff = getTexture('steelRealDiff', '/textures/steel_color_real.jpg', steelScale);
  const steelRough = getTexture('steelRealRough', '/textures/steel_roughness_real.jpg', steelScale);
  const steelNormal = getTexture('steelRealNormal', '/textures/steel_normal_real.jpg', steelScale);
  const steelMetal = getTexture('steelRealMetal', '/textures/steel_metalness_real.jpg', steelScale);

  const boltScale = 2.0;
  const boltDiff = getTexture('galvRealDiff', '/textures/galv_color_real.jpg', boltScale);
  const boltRough = getTexture('galvRealRough', '/textures/galv_roughness_real.jpg', boltScale);
  const boltNormal = getTexture('galvRealNormal', '/textures/galv_normal_real.jpg', boltScale);
  const boltMetal = getTexture('galvRealMetal', '/textures/galv_metalness_real.jpg', boltScale);

  const concScale = 1.2;
  const concDiff = getTexture('concDiff', '/textures/concrete_diffuse_pbr.png', concScale);
  const concNormal = getTexture('concNormal', '/textures/concrete_normal.png', concScale);
  const concRough = getTexture('concRough', '/textures/concrete_roughness.png', concScale);
  const concBump = getTexture('concBump', '/textures/concrete_bump.png', concScale);

  // 1. Concrete (Hormigón Estructural, Zapatas, Pedestales, Losas, Capa de Compresión, Estuco en maquetas Datasmith)
  const isPractice2 = (detailId || '').startsWith('P2');
  const isConcrete = (
    matLower.includes('hormigon') ||
    matLower.includes('hormigón') ||
    (isDatasmith && (matLower.includes('estuco') || nameLower.includes('estuco') || nameLower.includes('hormigon'))) ||
    (isPractice2 && (
      nameLower.includes('pedestal') ||
      nameLower.includes('capa:0.07') ||
      (detailId.includes('P2-B1') && nameLower.includes('capa')) ||
      (detailId.includes('P2-A2') && nameLower.includes('capa')) ||
      (detailId.includes('P2-A3') && nameLower.includes('capa'))
    )) || (
      nameLower.includes('hormigon') ||
      nameLower.includes('hormigón') ||
      nameLower.includes('panel') ||
      nameLower.includes('zapata') ||
      nameLower.includes('losa') ||
      nameLower.includes('arqueta') ||
      nameLower.includes('capa_compresion')
    )
  );

  if (isConcrete && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: concDiff,
      normalMap: concNormal,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: concRough,
      bumpMap: concBump,
      bumpScale: 0.04,
      roughness: 0.86,
      metalness: 0.02,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // 2. Hardware, Screws, Bolts, Cleats & Fasteners (Tornillos, Pernos, Varillas, Anclajes, Herrajes, y Baldosas de sujeción en MA07)
  const isFastener = (
    matLower.includes('cromo') ||
    matLower.includes('niquel') ||
    matLower.includes('zinc') ||
    matLower.includes('tornillo') ||
    matLower.includes('perno') ||
    matLower.includes('tuerca') ||
    (isDatasmith && matLower.includes('baldosas')) ||
    nameLower.includes('tornillo') ||
    nameLower.includes('perno') ||
    nameLower.includes('tuerca') ||
    nameLower.includes('arandela') ||
    nameLower.includes('anclaje') ||
    nameLower.includes('roldana') ||
    nameLower.includes('varilla') ||
    nameLower.includes('bolt') ||
    nameLower.includes('screw')
  );

  if (isFastener && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      map: boltDiff,
      roughnessMap: boltRough,
      normalMap: boltNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      metalnessMap: boltMetal,
      roughness: 0.24,
      metalness: 0.94,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // 3. Timber & Structural Wood (Madera de Roble, Caoba, Vigas de Madera)
  const isWood = (
    matLower.includes('madera') ||
    nameLower.includes('madera') ||
    matLower.includes('roble') ||
    matLower.includes('caoba')
  );

  if (isWood && preset !== 'wireframe') {
    const isMahogany = matLower.includes('caoba');
    const woodDiff = getTexture('woodDiff', '/textures/wood_diffuse.png', 1.0);
    const woodNormal = getTexture('woodNormal', '/textures/wood_normal.png', 1.0);
    const woodRough = getTexture('woodRough', '/textures/wood_roughness.png', 1.0);

    return new THREE.MeshStandardMaterial({
      color: isMahogany ? 0xb8603e : 0xf2cb9b,
      map: woodDiff,
      normalMap: woodNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: woodRough,
      roughness: 0.62,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
  }

  // 4. Shop Primer / Bermellón / Burdeos / Minio Antioxidante (Cartelas de unión y rigidizadores de acero)
  const isPrimer = (
    matLower.includes('bermell') ||
    matLower.includes('burdeos') ||
    matLower.includes('minio') ||
    preset === 'red_primer'
  );

  if (isPrimer && preset !== 'wireframe') {
    const isBurdeos = matLower.includes('burdeos');
    return new THREE.MeshStandardMaterial({
      color: isBurdeos ? 0x7c2d2d : 0xb53a2b,
      map: steelDiff,
      roughnessMap: steelRough,
      normalMap: steelNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.44,
      metalness: 0.62,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // 5. Aluminum (Perfiles y Chapas de Aluminio)
  if (matLower.includes('aluminio') && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      map: steelDiff,
      normalMap: steelNormal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughness: 0.32,
      metalness: 0.90,
      side: THREE.DoubleSide
    });
  }

  // 6. Copper Earthing Rods & Conductors (Puesta a tierra)
  if ((matLower.includes('cobre') || nameLower.includes('cobre') || nameLower.includes('pica') || nameLower.includes('cable_cobre')) && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xca7748,
      roughness: 0.28,
      metalness: 0.92,
      side: THREE.DoubleSide
    });
  }

  // 7. Architectural Glass (Vidrio Claro)
  if ((matLower.includes('vidrio') || matLower.includes('cristal')) && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }

  // 8. Structural Steel Profiles (Pintura Gris Claro / Pintura Gris Oscuro en Revit/Datasmith)
  // These are structural steel beams, columns, purlins, base plates, trusses!
  if ((matLower.includes('pintura-_gris_cl') || matLower.includes('pintura-_gris_os') || matLower.includes('pintura')) && preset !== 'wireframe') {
    const isDark = matLower.includes('gris_os');
    return new THREE.MeshStandardMaterial({
      color: isDark ? 0x999999 : 0xffffff,
      map: steelDiff,
      normalMap: steelNormal,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughnessMap: steelRough,
      metalnessMap: steelMetal,
      roughness: isDark ? 0.36 : 0.32,
      metalness: 0.92,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // 9. Standard Structural Rolled Steel S275 / S355 (All other steel profiles, flanges, webs, gussets)
  switch (preset) {
    case 'steel_hot_rolled':
    default:
      return new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        map: steelDiff,
        roughnessMap: steelRough,
        normalMap: steelNormal,
        normalScale: new THREE.Vector2(0.5, 0.5),
        metalnessMap: steelMetal,
        roughness: 0.36,
        metalness: 0.90,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });

    case 'galvanized':
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
        normalScale: new THREE.Vector2(0.5, 0.5),
        metalnessMap: galvMetal,
        roughness: 0.30,
        metalness: 0.92,
        side: THREE.DoubleSide
      });

    case 'stainless':
      return new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        map: steelDiff,
        roughnessMap: steelRough,
        normalMap: steelNormal,
        normalScale: new THREE.Vector2(0.3, 0.3),
        metalnessMap: steelMetal,
        roughness: 0.22,
        metalness: 0.96,
        side: THREE.DoubleSide
      });

    case 'wireframe':
      return new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
  }
}
