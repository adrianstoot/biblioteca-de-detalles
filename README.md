# BIBLIOTECA DE DETALLES

Plataforma 3D moderna, minimalista e interactiva para la visualización y estudio de maquetas de detalles constructivos metálicos y cimentaciones de la Escuela Técnica Superior de Ingeniería de Edificación (ETSIE).

🔗 **Live Demo (GitHub Pages):** [https://adrianstoot.github.io/biblioteca-de-detalles/](https://adrianstoot.github.io/biblioteca-de-detalles/)

---

## 🚀 Integración en Unreal Engine (Web Browser Widget)

Puedes embeber esta plataforma directamente en tu videojuego o aplicación interactiva en Unreal Engine utilizando el componente **Web Browser Widget**:

1. Activa el plugin **Web Browser** en Unreal Engine (`Edit > Plugins > Web Browser`).
2. En tu Widget Blueprint (UMG), arrastra un componente **Web Browser**.
3. Configura la **Initial URL** con el enlace principal:
   ```
   https://adrianstoot.github.io/biblioteca-de-detalles/
   ```

### 🎯 Enlaces directos por ID en Unreal Engine
Para abrir o enfocar una maqueta concreta al interactuar con un objeto en el juego (viga, pilar, zapata, cercha), simplemente pasa el parámetro `?id=<CODIGO>` a la función `Load URL`:

- **Nudo HEB con IPE y rigidizadores:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P1-10`
- **Nudo IPE a pilar tubular:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P1-11`
- **Nudo rígido con cartela:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P1-12`
- **Base articulada simple:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P2-A1`
- **Base empotrada con rigidizadores:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P2-B1-B`
- **Nudo de cumbrera:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P3-2`
- **Cercha Polonceau completa:** `https://adrianstoot.github.io/biblioteca-de-detalles/?id=P3-POLONCEAU%20COMPUESTA`

---

## ✨ Características Principales

- **34 Maquetas 3D Completas**: Cobertura íntegra de uniones rígidas, articuladas, empalmes, bases de pilar y celosías/cerchas Polonceau.
- **Materiales PBR Escaneados**: Texturas fotorrealistas de acero estructural laminado en caliente (S275/S355) con mapas continuos de rugosidad, normales y microrrelieve superficial.
- **Doble Cara (DoubleSide)**: Geometrías sin caras negras o huecos de renderizado.
- **Aristas Técnicas CAD**: Delineación precisa de aristas y contornos para lectura constructiva inmediata.
- **Tarjetas Compactas & Minimalistas**: Panel de biblioteca optimizado con miniaturas 3D flotantes y títulos concretos.
- **Cumplimiento Normativo CTE DB-SE-A**: Fichas técnicas con dimensiones en milímetros y comportamiento estructural.

---

## 🛠️ Tecnologías

- **React 19** + **Vite 8**
- **Three.js** (WebGL 2.0 / PBR Standard Shaders / ACES Filmic Tone Mapping)
- **Tailwind CSS**
- **Lucide Icons**
- **GitHub Actions & GitHub Pages**
