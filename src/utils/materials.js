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

  // 1. Concrete (Hormigón Estructural, Zapatas, Pedestales, Losas, Capa de Compresión)
  const isPractice2 = (detailId || '').startsWith('P2');
  const isConcrete = (
    matLower.includes('hormigon') ||
    matLower.includes('hormigón') ||
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
    const concDiff = getTexture('concDiff', '/textures/concrete_diffuse_pbr.png', 2.0);
    const concNormal = getTexture('concNormal', '/textures/concrete_normal.png', 2.0);
    const concRough = getTexture('concRough', '/textures/concrete_roughness.png', 2.0);
    const concBump = getTexture('concBump', '/textures/concrete_bump.png', 2.0);

    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: concDiff,
      normalMap: concNormal,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughnessMap: concRough,
      bumpMap: concBump,
      bumpScale: 0.035,
      roughness: 0.86,
      metalness: 0.02,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // 2. Hardware, Screws, Bolts & Nuts (Tornillos, Pernos, Varillas, Anclajes, Herrajes)
  const isFastener = (
    matLower.includes('cromo') ||
    matLower.includes('niquel') ||
    matLower.includes('zinc') ||
    matLower.includes('tornillo') ||
    matLower.includes('perno') ||
    matLower.includes('tuerca') ||
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
    const boltScale = 3.5;
    const boltDiff = getTexture('galvRealDiff', '/textures/galv_color_real.jpg', boltScale);
    const boltRough = getTexture('galvRealRough', '/textures/galv_roughness_real.jpg', boltScale);
    const boltNormal = getTexture('galvRealNormal', '/textures/galv_normal_real.jpg', boltScale);
    const boltMetal = getTexture('galvRealMetal', '/textures/galv_metalness_real.jpg', boltScale);

    return new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      map: boltDiff,
      roughnessMap: boltRough,
      normalMap: boltNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      metalnessMap: boltMetal,
      roughness: 0.28,
      metalness: 0.92,
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
    const woodScale = 1.2;
    const woodDiff = getTexture('woodDiff', '/textures/wood_diffuse.png', woodScale);
    const woodNormal = getTexture('woodNormal', '/textures/wood_normal.png', woodScale);
    const woodRough = getTexture('woodRough', '/textures/wood_roughness.png', woodScale);

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

  // 4. Shop Primer / Bermellón / Burdeos / Minio Antioxidante
  const isPrimer = (
    matLower.includes('bermell') ||
    matLower.includes('burdeos') ||
    matLower.includes('minio') ||
    preset === 'red_primer'
  );

  const steelScale = 0.65;
  const steelDiff = getTexture('steelRealDiff', '/textures/steel_color_real.jpg', steelScale);
  const steelRough = getTexture('steelRealRough', '/textures/steel_roughness_real.jpg', steelScale);
  const steelNormal = getTexture('steelRealNormal', '/textures/steel_normal_real.jpg', steelScale);

  if (isPrimer && preset !== 'wireframe') {
    const isBurdeos = matLower.includes('burdeos');
    return new THREE.MeshStandardMaterial({
      color: isBurdeos ? 0x7c2d2d : 0x9e382b,
      map: steelDiff,
      roughnessMap: steelRough,
      normalMap: steelNormal,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.72,
      metalness: 0.16,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0
    });
  }

  // 5. Aluminum (Perfiles y Chapas de Aluminio)
  if (matLower.includes('aluminio') && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xdde3ea,
      map: steelDiff,
      normalMap: steelNormal,
      normalScale: new THREE.Vector2(0.2, 0.2),
      roughness: 0.35,
      metalness: 0.82,
      side: THREE.DoubleSide
    });
  }

  // 6. Plaster / Stucco / Masonry (Estuco Blanco, Yeso, Mortero, Ladrillo)
  if (matLower.includes('estuco') && preset !== 'wireframe') {
    const isRed = matLower.includes('rojo');
    const concBump = getTexture('concBump', '/textures/concrete_bump.png', 2.0);
    return new THREE.MeshStandardMaterial({
      color: isRed ? 0xbf553e : 0xf4f1ea,
      bumpMap: concBump,
      bumpScale: 0.01,
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide
    });
  }

  // 7. Architectural Paint (Pintura Gris Claro, Pintura Gris Oscuro)
  if (matLower.includes('pintura') && preset !== 'wireframe') {
    const isDark = matLower.includes('gris_os');
    return new THREE.MeshStandardMaterial({
      color: isDark ? 0x475569 : 0x94a3b8,
      map: steelDiff,
      normalMap: steelNormal,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.52,
      metalness: 0.32,
      side: THREE.DoubleSide
    });
  }

  // 8. Ceramic Tiles / Pavimentación (Baldosas Marrones)
  if (matLower.includes('baldosas') && preset !== 'wireframe') {
    const concBump = getTexture('concBump', '/textures/concrete_bump.png', 3.0);
    return new THREE.MeshStandardMaterial({
      color: 0x8a5840,
      bumpMap: concBump,
      bumpScale: 0.012,
      roughness: 0.58,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
  }

  // 9. Copper Earthing Rods & Conductors (Puesta a tierra)
  if ((matLower.includes('cobre') || nameLower.includes('cobre') || nameLower.includes('pica') || nameLower.includes('cable_cobre')) && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xca7748,
      roughness: 0.28,
      metalness: 0.90,
      side: THREE.DoubleSide
    });
  }

  // 10. Architectural Glass (Vidrio Claro)
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

  // 11. Terracotta / Ceramic (Bovedillas de forjado)
  if (nameLower.includes('bovedilla') && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0xc25e38,
      roughness: 0.92,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
  }

  // 12. Cast Iron (Tapas de arqueta de registro y anclajes)
  if (nameLower.includes('tapa') && preset !== 'wireframe') {
    return new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.82,
      metalness: 0.65,
      side: THREE.DoubleSide
    });
  }

  // 13. Structural Rolled Steel S275 / S355 (Profiles, Plates, Flanges, Webs, Gussets)
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
