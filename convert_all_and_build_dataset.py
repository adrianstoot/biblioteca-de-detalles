import struct, trimesh, numpy as np, os, json, glob

META = {
    # PRACTICA 1
    "P1-1": {
        "title": "Nudo Articulado Viga IPE a Pilar UPN con Casquillo de Alma",
        "category": "Nudos Articulados Viga-Pilar",
        "categoryKey": "articulated",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Unión flexible viga-pilar mediante angular laminado simple atornillado/soldado al alma.",
        "detailedDescription": "Unión articulada viga-pilar resuelta mediante casquillo angular fijado al alma de la viga IPE y al perfil UPN del pilar. Diseñado para transmitir el esfuerzo cortante sin coacción al giro, permitiendo el libre giro del extremo de la viga según hipótesis de cálculo de viga biapoyada.",
        "structuralBehavior": "Transmisión exclusiva de esfuerzo cortante vertical. Capacidad de rotación plástica sin desarrollo de momentos flectores significativos.",
        "components": ["Perfil pilar UPN", "Viga IPE", "Casquillo angular L", "Tornillería ordinaria / soldadura de taller al alma"],
        "normativeReference": "CTE DB-SE-A Art. 8.4 / UNE-EN 1993-1-8",
        "tags": ["articulado", "casquillo", "angular", "alma", "cortante", "upn", "ipe"]
    },
    "P1-2": {
        "title": "Nudo Semi-Rígido Viga a Pilar con Angulares de Asiento y Cabeza",
        "category": "Nudos Articulados Viga-Pilar",
        "categoryKey": "articulated",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Apoyo sobre angular de asiento inferior con angular estabilizador superior de cabeza.",
        "detailedDescription": "Detalle constructivo de unión viga-soporte constituido por un angular inferior que resiste la reacción vertical de apoyo y un angular superior en el ala de cabeza que proporciona arriostramiento contra el vuelco lateral. Presenta rigidez rotacional parcial clasificada como semi-rígida.",
        "structuralBehavior": "Reacción vertical resistida por angular inferior. Resistencia a momento moderada según deformabilidad del angular de cabeza.",
        "components": ["Pilar UPN", "Viga metálica IPE", "Angular de asiento inferior", "Angular estabilizador de cabeza"],
        "normativeReference": "CTE DB-SE-A Art. 8.4 / UNE-EN 1993-1-8 Cl. 5.1.2",
        "tags": ["asiento", "semi-rigido", "angular", "vuelco", "ipe", "upn"]
    },
    "P1-6": {
        "title": "Nudo de Esquina con Pilar Continuo y Viga Apoyada en Chapa de Reparto",
        "category": "Nudos Articulados Viga-Pilar",
        "categoryKey": "articulated",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Apoyo de viga sobre repisa / chapa de asiento en cara exterior de pilar continuo.",
        "detailedDescription": "Enlace constructivo donde la viga acomete a la cara del pilar continuo UPN apoyando directamente sobre una cartela o chapa de reparto rigidizada. Facilita el montaje de forjados garantizando la continuidad vertical del soporte.",
        "structuralBehavior": "Apoyo directo por compresión vertical. Excentricidad de carga controlada sobre el eje del soporte.",
        "components": ["Pilar continuo UPN", "Viga de forjado", "Chapa de asiento rigidizada", "Tornillos de fijación"],
        "normativeReference": "CTE DB-SE-A Art. 8.3 / UNE-EN 1993-1-8",
        "tags": ["esquina", "pilar continuo", "chapa reparto", "asiento", "upn"]
    },
    "P1-7": {
        "title": "Nudo Viga Doble UPN a Pilar Continuo con Casquillo",
        "category": "Nudos Articulados Viga-Pilar",
        "categoryKey": "articulated",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Viga compuesta por doble perfil UPN conectada a cara de pilar mediante casquillo.",
        "detailedDescription": "Unión de dintel formado por dos perfiles UPN dispuestos espalda contra espalda o en cajón hacia el soporte continuo. Se resuelve con casquillos y pasadores asegurando la entrega equilibrada de ambas vigas al pilar.",
        "structuralBehavior": "Distribución simétrica de esfuerzos cortantes de ambas almas hacia el núcleo del pilar.",
        "components": ["Doble perfil UPN en viga", "Pilar metálico", "Casquillos de enlace", "Tornillería pasante"],
        "normativeReference": "CTE DB-SE-A Art. 8.5",
        "tags": ["doble upn", "perfil compuesto", "casquillo", "articulado", "viga doble"]
    },
    "P1-8": {
        "title": "Empalme de Viga Soldado a Tope con Cubrejuntas en Alas",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Empalme de continuidad soldado con platabandas de refuerzo en alas traccionada y comprimida.",
        "detailedDescription": "Unión de prolongación longitudinal viga-viga realizada mediante soldadura a tope con biselado de chapas y reforzada con cubrejuntas soldadas en ambas alas. Desarrolla la capacidad portante completa del perfil metálico.",
        "structuralBehavior": "Transmisión total de momento flector, esfuerzo cortante y axil (empalme de resistencia completa).",
        "components": ["Perfiles IPE alineados", "Soldadura a tope en alma", "Cubrejuntas de alas superior e inferior", "Cordones en ángulo"],
        "normativeReference": "CTE DB-SE-A Art. 8.7 / UNE-EN 1993-1-8",
        "tags": ["empalme", "soldado", "cubrejuntas", "continuidad", "ipe", "tope"]
    },
    "P1-9": {
        "title": "Empalme Atornillado Viga-Viga con Cubrejuntas en Alma y Alas",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Empalme de montaje en obra con cubrejuntas atornilladas en alma y en ambas alas.",
        "detailedDescription": "Solución estándar de montaje rápido en obra sin soldadura en posición. Las cubrejuntas de las alas absorben el par de fuerzas de tracción-compresión del momento flector, mientras que la cubrejunta doble de alma absorbe el cortante mediante tornillos de alta resistencia.",
        "structuralBehavior": "Conexión a cortante por fricción/aplastamiento y absorción de momento flector por platabandas de ala.",
        "components": ["Perfiles viga", "Platabandas de ala exterior e interior", "Doble cubrejunta de alma", "Tornillos de alta resistencia (8.8/10.9)"],
        "normativeReference": "CTE DB-SE-A Art. 8.7 y 8.8",
        "tags": ["empalme atornillado", "cubrejuntas", "tornillos TR", "alma", "alas", "resistencia completa"]
    },
    "P1-10": {
        "title": "Nudo Rígido Soldado Viga IPE a Pilar con Rigidizadores de Alma",
        "category": "Nudos Rígidos Viga-Pilar",
        "categoryKey": "rigid",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Empotramiento viga-pilar con rigidizadores horizontales de tracción y compresión.",
        "detailedDescription": "Nudo rígido de pórtico formado por viga IPE soldada a tope directamente al ala de pilar HEB/IPE. Incluye rigidizadores horizontales en el alma del pilar alineados con las alas de la viga para evitar el abollamiento por compresión y plastificación por tracción del alma del pilar.",
        "structuralBehavior": "Nudo rígido de resistencia completa. Transmisión íntegra del momento elástico/plástico de la viga sin distorsión del nudo.",
        "components": ["Pilar de perfiles HEB/IPE", "Viga IPE", "Rigidizadores de compresión", "Rigidizadores de tracción", "Soldadura a tope en alas y ángulo en alma"],
        "normativeReference": "CTE DB-SE-A Art. 8.6 / UNE-EN 1993-1-8 Cl. 6.2",
        "tags": ["rigido", "empotrado", "soldado", "rigidizador", "traccion", "compresion", "ipe", "heb"]
    },
    "P1-11": {
        "title": "Nudo Viga IPE a Soporte Hueco / Cajón con Chapa de Testa",
        "category": "Nudos Articulados Viga-Pilar",
        "categoryKey": "articulated",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Conexión de viga a pilar tubular de sección hueca mediante chapa frontal.",
        "detailedDescription": "Enlace entre una viga abierta IPE y un soporte cerrado tubular o cajón conformado. Se emplea una chapa de testa soldada en taller a la viga y anclada a la cara plana del tubo, optimizando la ejecución sin requerir acceso al interior del soporte.",
        "structuralBehavior": "Transmisión de cortante y momento según espesor de la cara del perfil tubular y rigidez de la chapa de testa.",
        "components": ["Pilar cajón / perfil hueco conformado", "Viga IPE", "Chapa de testa plana", "Tornillos de unión"],
        "normativeReference": "CTE DB-SE-A Art. 8.4 / UNE-EN 1993-1-8 Cl. 7",
        "tags": ["tubular", "soporte cajon", "chapa de testa", "viga-pilar", "perfil hueco"]
    },
    "P1-12": {
        "title": "Nudo Rígido Viga-Pilar con Rigidizadores Ortogonales y Cartela",
        "category": "Nudos Rígidos Viga-Pilar",
        "categoryKey": "rigid",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Nudo de gran capacidad con rigidizadores en cruz y refuerzo inferior en ménsula.",
        "detailedDescription": "Configuración de nudo pórtico para naves y estructuras de edificación con grandes solicitaciones. Incorpora rigidización ortogonal continua en el pilar y cartela triangular inferior para incrementar el brazo mecánico y reducir las tensiones en las uniones soldadas.",
        "structuralBehavior": "Elevadísima rigidez rotacional y capacidad de absorción de energía cíclica / sísmica.",
        "components": ["Pilar de gran inercia", "Viga IPE", "Cartela acartelada inferior", "Rigidizadores transversales en cruz"],
        "normativeReference": "CTE DB-SE-A Art. 8.6",
        "tags": ["rigido", "cartela", "ortogonal", "acartelado", "gran capacidad", "pórtico"]
    },
    "P1-13": {
        "title": "Soporte Compuesto Presillado con Perfiles UPN y Presillas Soldadas",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Columna metálica formada por 2 UPN en cajón unidos periódicamente mediante presillas.",
        "detailedDescription": "Elemento pilar comprimido compuesto por dos perfiles UPN dispuestos en paralelo con cordones de separación fijados por presillas metálicas periódicas. Reduce la esbeltez mecánica en el eje débil (eje Y-Y) frente a pandeo por flexión.",
        "structuralBehavior": "Comportamiento solidario de la sección compuesta. Cálculo de presillas a cortante según DB-SE-A Art. 6.3.3.",
        "components": ["2 Perfiles UPN enfrentados", "Presillas de unión en chapa", "Soldadura en ángulo perimetral"],
        "normativeReference": "CTE DB-SE-A Art. 6.3.3 / UNE-EN 1993-1-1 Cl. 6.4",
        "tags": ["presillado", "pilar compuesto", "upn", "pandeo", "presillas", "compresion"]
    },
    "P1-14": {
        "title": "Entramado de Forjado: Cruce de Viga Principal y Secundaria",
        "category": "Entramados y Cruces de Forjado",
        "categoryKey": "framework",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Encuentro ortogonal de viga maestra jácena y viguetas secundarias continuas.",
        "detailedDescription": "Detalle constructivo de emparrillado de piso donde una viga principal continua recibe vigas secundarias perpendiculares. Se aprecian las piezas de fijación, rigidizadores bajo carga concentrada y casquillos angulares.",
        "structuralBehavior": "Transmisión de cargas repartidas de forjado desde las viguetas a la jácena principal mediante reacciones puntuales.",
        "components": ["Viga principal (jácena)", "Vigas secundarias (correas/viguetas)", "Rigidizadores de apoyo", "Angulares de sujeción"],
        "normativeReference": "CTE DB-SE-A Art. 8.3 / UNE-EN 1993-1-8",
        "tags": ["entramado", "cruce", "forjado", "viga principal", "secundaria", "jacena"]
    },
    "P1-15": {
        "title": "Nudo Articulado Viga IPE a Pilar con Chapa Frontal Corta",
        "category": "Nudos Articulados Viga-Pilar",
        "categoryKey": "articulated",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Unión atornillada con chapa frontal no extendida que garantiza libertad de giro.",
        "detailedDescription": "Nudo resuelto con chapa frontal soldada en taller únicamente al alma de la viga (chapa no extendida a las alas). Al no confinar las alas, el nudo posee una rigidez a flexión despreciable actuando como apoyo simple a cortante.",
        "structuralBehavior": "Rótula plástica pasiva. Transmisión exclusiva de cortante mediante los tornillos centrales.",
        "components": ["Pilar metálico", "Viga IPE", "Chapa frontal corta", "Tornillos pretensados"],
        "normativeReference": "CTE DB-SE-A Art. 8.4",
        "tags": ["chapa frontal", "articulado", "chapa corta", "rotula", "ipe", "cortante"]
    },
    "P1-17": {
        "title": "Enlace de Continuidad: Viga Pasante sobre Cabeza de Pilar con Rigidizador",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Viga continua apoyada en la coronación de un soporte metálico con chapa de reparto.",
        "detailedDescription": "Encuentro en el que la viga pasa continua sobre el extremo superior del pilar inferior. Incorpora rigidizadores en el alma de la viga directamente sobre el eje del pilar para prevenir la abolladura del alma por carga puntual.",
        "structuralBehavior": "Continuidad estática de la viga (momento flector negativo sobre apoyo). Apoyo directo a compresión sobre pilar.",
        "components": ["Pilar metálico inferior", "Viga continua superior", "Chapa de cabeza de pilar", "Rigidizadores de alma en viga"],
        "normativeReference": "CTE DB-SE-A Art. 6.2.8 y 8.3",
        "tags": ["continuidad", "cabeza pilar", "viga pasante", "rigidizador", "apoyo continuo"]
    },
    "P1-18": {
        "title": "Cabeza de Pilar con Chapa de Reparto para Apoyo de Dintel",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Mecanización de coronación de soporte con placa gruesa de reparto de carga.",
        "detailedDescription": "Detalle de remate superior de pilar preparado para recibir vigas de cubierta o dinteles. La chapa gruesa soldada en la testa del soporte distribuye uniformemente la presión de contacto hacia las alas y alma del perfil vertical.",
        "structuralBehavior": "Distribución uniforme de presiones de contacto por aplastamiento directo.",
        "components": ["Perfil de pilar", "Placa de cabeza de reparto t=20mm", "Cordón de soldadura continuo"],
        "normativeReference": "CTE DB-SE-A Art. 8.3",
        "tags": ["cabeza de pilar", "chapa reparto", "coronacion", "dintel", "apoyo"]
    },
    "P1-20": {
        "title": "Nudo Rígido Atornillado con Chapa de Testa Extendida y Cartela Acartelada",
        "category": "Nudos Rígidos Viga-Pilar",
        "categoryKey": "rigid",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Nudo empotrado de alta ductilidad con chapa de testa extendida y acartelamiento inferior.",
        "detailedDescription": "Unión rígida desmontable para pórticos de edificación. La chapa de testa sobresale del ala traccionada permitiendo alojar filas de tornillos exteriores de tracción. El acartelamiento triangular inferior aleja la sección crítica de plastificación del plano del pilar.",
        "structuralBehavior": "Momento flector y rigidez clasificada como rígida de resistencia completa. Mecanismo de fallo dúctil en chapa de testa o viga.",
        "components": ["Pilar HEB", "Viga IPE", "Cartela acartelada", "Chapa de testa extendida", "Tornillos de alta resistencia clase 10.9"],
        "normativeReference": "CTE DB-SE-A Art. 8.6 / UNE-EN 1993-1-8 Cl. 6.2.7",
        "tags": ["chapa testa extendida", "acartelado", "rigido", "tornillos TR", "portico", "ductil"]
    },
    "P1-21": {
        "title": "Nudo Rígido Viga-Pilar con Rigidizador Diagonal en Panel de Cortante",
        "category": "Nudos Rígidos Viga-Pilar",
        "categoryKey": "rigid",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Refuerzo diagonal en alma de pilar para absorber el esfuerzo cortante del nudo de pórtico.",
        "detailedDescription": "Nudo rígido para zonas con elevados esfuerzos cortantes en el alma del pilar producidos por los pares de momentos de vigas concurrentes. El rigidizador diagonal actúa como tirante/puntal triangulado evitando el pandeo por cortante del panel de nudo.",
        "structuralBehavior": "Aumento drástico de la resistencia a cortante del panel de nudo. Evita el deslizamiento angular relativo del pilar.",
        "components": ["Pilar metálico", "Viga IPE", "Rigidizador diagonal en alma", "Rigidizadores horizontales"],
        "normativeReference": "CTE DB-SE-A Art. 8.6.3 / UNE-EN 1993-1-8 Cl. 6.2.6.1",
        "tags": ["panel cortante", "diagonal", "rigidizador diagonal", "rigido", "ductilidad", "sismo"]
    },
    "P1-22": {
        "title": "Cruce de Forjado: Apoyo de Viga Secundaria sobre Ala Superior de Jácena",
        "category": "Entramados y Cruces de Forjado",
        "categoryKey": "framework",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Apoyo directo a diferente cota de correa/vigueta apoyada sobre la viga principal.",
        "detailedDescription": "Solución de forjado a cotas diferenciadas donde la viga secundaria apoya directamente sobre el ala superior de la viga principal continua. Fijación mediante angulares laterales o tornillos pasantes para absorber esfuerzos de succión o vuelco.",
        "structuralBehavior": "Apoyo continuo de correa. Transmisión de compresión directa al ala superior con rigidización local de alma si la reacción es elevada.",
        "components": ["Jácena principal", "Viga secundaria / correa", "Casquillo o clip de retención", "Tornillos de anclaje"],
        "normativeReference": "CTE DB-SE-A Art. 8.3",
        "tags": ["cruce", "ala superior", "correa", "forjado", "diferente cota", "apoyo"]
    },
    "P1-23": {
        "title": "Empalme Atornillado Viga-Viga de Alta Resistencia con Platabandas",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Empalme de tramos de viga mediante platabandas mecanizadas en ambas alas y en el alma.",
        "detailedDescription": "Unión atornillada precalificada de continuidad de vigas continuas de edificación. Permite transportar vigas en módulos de longitud reglamentaria y montarlas en obra garantizando el 100% de la capacidad mecánica del perfil sin aplicar calor ni soldadura en altura.",
        "structuralBehavior": "Transmisión total de momento flector y cortante con deformabilidad rotacional prácticamente nula.",
        "components": ["Perfiles IPE", "Platabandas exteriores de ala", "Platabandas interiores de ala", "Cubrejuntas de alma", "Tornillos pretensados 10.9"],
        "normativeReference": "CTE DB-SE-A Art. 8.7",
        "tags": ["empalme", "platabanda", "atornillado", "alta resistencia", "continuidad", "ipe"]
    },
    "P1-24": {
        "title": "Unión Viga Secundaria a Viga Principal Enrasada con Doble Angular",
        "category": "Entramados y Cruces de Forjado",
        "categoryKey": "framework",
        "practice": "Práctica 1: Uniones y Empalmes",
        "practiceNum": 1,
        "shortDescription": "Conexión a la misma cota de vigueta a alma de jácena mediante doble casquillo angular.",
        "detailedDescription": "Encuentro ortogonal de forjado a ras (misma cota superior de compresión). Las alas de la viga secundaria se recortan o despuntan para encajar en el alma de la viga principal, conectándose mediante dos angulares laminados atornillados al alma.",
        "structuralBehavior": "Unión articulada a cortante puro a cota constante, permitiendo colocar chapa colaborante o bovedillas continuas.",
        "components": ["Jácena principal", "Vigueta secundaria recortada", "Doble angular L de alma", "Tornillería estándar"],
        "normativeReference": "CTE DB-SE-A Art. 8.4",
        "tags": ["enrasado", "misma cota", "doble angular", "forjado", "despunte", "articulado"]
    },

    # PRACTICA 2
    "P2-A1": {
        "title": "Base Articulada de Pilar UPN con Placa de Anclaje Simple",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Placa de anclaje con 2 pernos centrados en el eje neutro para permitir giro libre.",
        "detailedDescription": "Base de soporte metálico de perfiles UPN articulada en cimentación. La placa de base se apoya sobre el pedestal y dispone de 2 pernos de anclaje dispuestos sobre el eje de menor inercia, garantizando que el pilar no transmite momento flector a la zapata.",
        "structuralBehavior": "Apoyo articulado teórico. Transmisión de axil de compresión por contacto y cortante horizontal por rozamiento o pernos.",
        "components": ["Pilar de perfiles UPN", "Placa de anclaje base", "2 Pernos de anclaje", "Mortero de nivelación / grout"],
        "normativeReference": "CTE DB-SE-A Art. 8.9 / UNE-EN 1993-1-8 Cl. 6.2.8",
        "tags": ["base", "placa anclaje", "articulada", "2 pernos", "cimentacion", "upn"]
    },
    "P2-A2": {
        "title": "Base Articulada con Placa de Asiento y Chapa de Reparto en Cimentación",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Apoyo articulado con doble chapa para reparto óptimo de presiones sobre dado de hormigón.",
        "detailedDescription": "Placa de anclaje combinada con chapa de reparto mecanizada sobre pedestal de hormigón armado. Mejora la difusión de presiones locales de compresión evitando la trituración del hormigón bajo las alas del pilar.",
        "structuralBehavior": "Distribución uniforme de presiones trapezoidales sobre hormigón HA-25/30 sin coacción al giro.",
        "components": ["Pilar metálico", "Placa base mecanizada", "Pernos de fijación", "Pedestal de cimentación"],
        "normativeReference": "CTE DB-SE-A Art. 8.9",
        "tags": ["base articulada", "chapa reparto", "pedestal", "hormigon", "presion"]
    },
    "P2-A3": {
        "title": "Base Articulada de Pilar con Cartelas de Reparto Inferiores",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Placa base articulada rigidizada con pequeñas cartelas triangulares de reparto.",
        "detailedDescription": "Base de apoyo en cimentación en la que la placa base se rigidiza mediante pequeñas cartelas triangulares en la base del soporte para reducir el espesor requerido de la placa base frente a flexión por la presión reactiva del hormigón.",
        "structuralBehavior": "Comportamiento articulado en conjunto; reduce la deformación en ménsula de los vuelos de la placa.",
        "components": ["Pilar metálico", "Placa base de anclaje", "Cartelas triangulares de base", "Pernos de anclaje"],
        "normativeReference": "CTE DB-SE-A Art. 8.9",
        "tags": ["base", "cartelas de reparto", "placa base", "cimentacion", "rigidez local"]
    },
    "P2-B1-A": {
        "title": "Base Semi-Empotrada con 4 Pernos y Pedestal de Hormigón Armado",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Placa de anclaje con 4 pernos perimetrales y entrega en pedestal de cimentación.",
        "detailedDescription": "Detalle constructivo de base con 4 pernos de anclaje roscados embebidos en el pedestal de cimentación. Ofrece resistencia al giro parcial (semi-rígida) permitiendo absorber momentos de viento en fase de montaje y servicio.",
        "structuralBehavior": "Rigidez rotacional media. Transmisión combinada de esfuerzo axil, cortante basal y momento flector moderado.",
        "components": ["Pilar metálico", "Placa de anclaje cuadrangular", "4 Pernos de anclaje con patilla", "Dado de hormigón armado"],
        "normativeReference": "CTE DB-SE-A Art. 8.9 / UNE-EN 1993-1-8 Cl. 6.2.8",
        "tags": ["semi-empotrada", "4 pernos", "pedestal", "zapata", "momento flector"]
    },
    "P2-B1-B": {
        "title": "Base Empotrada de Pilar con Pernos Exteriores y Rigidizadores de Base",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Empotramiento en cimentación con pernos exteriores a las alas y cartelas rigidizadoras.",
        "detailedDescription": "Base empotrada para pilares de pórtico sometidos a fuertes momentos de empotramiento en la base. Los pernos se sitúan fuera del contorno del perfil para maximizar el brazo de palanca interno, con rigidizadores soldados en las alas.",
        "structuralBehavior": "Empotramiento rígido. El par resistente tracción en pernos / compresión en hormigón absorbe el momento flector completo.",
        "components": ["Pilar de pórtico", "Placa base extendida", "Rigidizadores de ala", "Pernos de gran diámetro 8.8"],
        "normativeReference": "CTE DB-SE-A Art. 8.9",
        "tags": ["empotrada", "pernos exteriores", "brazo mecanico", "portico", "rigidizadores base"]
    },
    "P2-C1": {
        "title": "Base de Gran Inercia con Rigidizadores en Cruz para Momentos Biaxiales",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Placa de base rigidizada en ambos ejes ortogonales con cartelas perimetrales en cruz.",
        "detailedDescription": "Solución de apoyo para soportes principales de esquina o aislados sometidos a flexión esviada (momentos Mx y My simultáneos). Las cartelas en cruz reparten las tensiones en todas direcciones hacia la zapata.",
        "structuralBehavior": "Empotramiento biaxial rígido. Control de presiones de contacto bidimensionales y deformación del acero.",
        "components": ["Pilar metálico de gran inercia", "Placa de anclaje reforzada", "Cartelas ortogonales en cruz", "Grupo de pernos perimetrales"],
        "normativeReference": "CTE DB-SE-A Art. 8.9",
        "tags": ["flexion esviada", "rigidizadores en cruz", "gran inercia", "empotramiento biaxial", "base"]
    },
    "P2-C2": {
        "title": "Transición y Enlace Pilar-Pilar: Soporte Compuesto UPN a Perfil IPE",
        "category": "Empalmes y Continuidad",
        "categoryKey": "splice",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Empalme de cambio de sección en altura entre pilar de dos UPN y pilar simple IPE.",
        "detailedDescription": "Detalle constructivo de transición de planta entre un pilar de planta baja de mayor capacidad (formado por dos perfiles UPN presillados) y el pilar de planta superior (perfil laminado IPE de menor escuadría), resuelto con chapa de transición y cartelas.",
        "structuralBehavior": "Transmisión centrada de cargas axiles y compatibilidad de giros con chapa de transición mecanizada.",
        "components": ["Pilar inferior 2 UPN", "Pilar superior IPE", "Chapa de transición mecanizada t=25mm", "Cartelas de rigidización"],
        "normativeReference": "CTE DB-SE-A Art. 8.8",
        "tags": ["transicion", "cambio de seccion", "pilar-pilar", "upn", "ipe", "chapa transicion"]
    },
    "P2-D1": {
        "title": "Base Empotrada de Pórtico con Cartelas Triangulares de Gran Canto",
        "category": "Bases y Placas de Anclaje",
        "categoryKey": "base",
        "practice": "Práctica 2: Bases de Pilar",
        "practiceNum": 2,
        "shortDescription": "Empotramiento de nave industrial con rigidizadores triangulares de gran altura.",
        "detailedDescription": "Base rígida de pilar de nave de gran luz. Incorpora cartelas triangulares de gran altura que trasladan las fuerzas de tracción de los pernos directamente a la coronación de las alas del pilar, garantizando un comportamiento rígido puro sin pandeo de placa.",
        "structuralBehavior": "Empotramiento perfecto con rigidez rotacional máxima. Distribución lineal de tensiones en zapatas de gran canto.",
        "components": ["Pilar HEB / IPE de nave", "Placa base de 35mm", "Cartelas triangulares de gran canto", "Pernos de anclaje de alta capacidad con placa de anclaje inferior"],
        "normativeReference": "CTE DB-SE-A Art. 8.9",
        "tags": ["gran canto", "cartelas triangulares", "nave industrial", "empotramiento perfecto", "portico pesada"]
    },

    # PRACTICA 3
    "P3-POLONCEAU COMPUESTA": {
        "title": "Cercha Polonceau Compuesta Completa (Luz ~14m)",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Maqueta completa de la cercha Polonceau triangulada con tirantes y montantes.",
        "detailedDescription": "Estructura metálica triangulada de cubierta de dos aguas ideada por J.B. Polonceau en su variante compuesta. Cuenta con pares de doble UPN en compresión, tirantes inferiores de acero en tracción, montantes y péndolas intermedias. Salva luces de 14 a 24 metros con óptima ligereza y estética.",
        "structuralBehavior": "Estructura articulada triangulada isostática/hiperestática. Los pares trabajan a flexo-compresión y los tirantes a tracción pura.",
        "components": ["Pares de doble UPN en cajón", "Tirante horizontal inferior", "Montantes comprimidos", "Tirantillos secundarios", "Cartelas nodales de unión"],
        "normativeReference": "CTE DB-SE-A Art. 6.3 / UNE-EN 1993-1-1 Cl. 6.3",
        "tags": ["cercha polonceau", "celosia", "cubierta", "triangulada", "tirante", "par", "montante", "luz 14m"]
    },
    "P3-1": {
        "title": "Nudo 1: Apoyo y Arranque de Cercha en Cabeza de Pilar",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Nudo de estribo y encuentro del par inclinado y tirante inferior sobre el pilar.",
        "detailedDescription": "Nudo singular de apoyo perimetral de la cercha Polonceau. En esta cartela convergen el par inclinado (comprimido) y el tirante inferior (traccionado), entregando la resultante de carga vertical sobre la chapa de coronación del pilar de fachada.",
        "structuralBehavior": "Descomposición triangular de fuerzas: equilibrio entre compresión del par y tracción del tirante inferior. Apoyo deslizante o fijo sobre pilar.",
        "components": ["Extremo de par doble UPN", "Terminal de tirante inferior", "Cartela nodal de arranque", "Placa de apoyo sobre pilar", "Perno pasador"],
        "normativeReference": "CTE DB-SE-A Art. 8.5",
        "tags": ["nudo 1", "apoyo cercha", "arranque", "estribo", "cartela", "pilar fachada"]
    },
    "P3-2": {
        "title": "Nudo 2: Cumbrera de Cercha (Encuentro de Pares en Coronación)",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Vértice superior de la cercha donde confluyen ambos pares de cubierta y el montante central.",
        "detailedDescription": "Nudo de coronación (cumbrera) de la cercha Polonceau. En este nudo se unen los dos pares superiores que forman la pendiente de la cubierta y la péndola vertical o montante central mediante una cartela triangular de chapa gruesa atornillada/soldada.",
        "structuralBehavior": "Equilibrio simétrico de compresiones de ambos pares y tracción de la péndola vertical central.",
        "components": ["Par izquierdo doble UPN", "Par derecho doble UPN", "Cartela de cumbrera", "Péndola / montante central", "Tornillos de unión"],
        "normativeReference": "CTE DB-SE-A Art. 8.5",
        "tags": ["cumbrera", "nudo 2", "coronacion", "vertice", "pares", "pendola", "cartela cumbrera"]
    },
    "P3-3": {
        "title": "Nudo 3: Cumbrera con Cartela de Enlace y Apoyo de Correa de Cubierta",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Detalle de cumbrera con casquillos y repisa de apoyo para la correa de coronación.",
        "detailedDescription": "Variante de nudo de cumbrera en la que además de enlazar los pares estructurales se incorpora el detalle constructivo de apoyo de la correa de cumbrera que sustenta las chapas de cubrición y el remate de chapa de ventilación.",
        "structuralBehavior": "Transmisión de cargas gravitatorias y de succión de viento de la correa al nudo principal de la cercha.",
        "components": ["Pares de cercha", "Cartela de cumbrera", "Casquillo de apoyo de correa", "Perfil correa IPE / conformado"],
        "normativeReference": "CTE DB-SE-A Art. 8.3",
        "tags": ["cumbrera", "correa", "cubierta", "nudo 3", "apoyo correa", "cartela"]
    },
    "P3-10": {
        "title": "Nudo 10: Nudo Intermedio de Cordón Superior (Par, Montante y Diagonal)",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Encuentro en el par continuo de la cercha con el montante perpendicular y la diagonal.",
        "detailedDescription": "Nudo intermedio a lo largo del cordón superior de la cercha Polonceau. En la cartela intermedia se produce el empalme y conexión del montante perpendicular al par y las barras diagonales estabilizadoras que reducen la luz de pandeo del par.",
        "structuralBehavior": "Transmisión de esfuerzos axiles axiales concurrentes en un único punto nodal para evitar momentos secundarios parásitos.",
        "components": ["Par superior continuo", "Montante tubular / angular", "Diagonal de celosía", "Cartela pasante atornillada"],
        "normativeReference": "CTE DB-SE-A Art. 8.5",
        "tags": ["nudo intermedio", "cordon superior", "par", "montante", "diagonal", "nudo 10"]
    },
    "P3-20": {
        "title": "Nudo 20: Nudo Central de Tirante Inferior y Péndola",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Unión inferior del tirante horizontal con las diagonales y el montante vertical.",
        "detailedDescription": "Nudo articulado situado en la cuerda inferior de la cercha. Conecta los tramos del tirante traccionado con la péndola central que sostiene el tirante evitando su deformación por peso propio (catenaria).",
        "structuralBehavior": "Tracción pura en barras horizontales equilibrada por la fuerza de suspensión de la péndola.",
        "components": ["Tirante horizontal (redondo / angular)", "Péndola vertical de cuelgue", "Cartela circular o trapezoidal", "Bulones pasadores"],
        "normativeReference": "CTE DB-SE-A Art. 8.5",
        "tags": ["tirante", "nudo inferior", "pendola", "nudo 20", "traccion", "cuerda inferior"]
    },
    "P3-29": {
        "title": "Nudo 29: Anclaje y Tensor de Tirante Inferior con Horquilla y Bulón",
        "category": "Cercha Polonceau y Celosías",
        "categoryKey": "truss",
        "practice": "Práctica 3: Cercha Polonceau",
        "practiceNum": 3,
        "shortDescription": "Mecanismo de tesado y regulación de longitud de tirante mediante bulón y horquilla.",
        "detailedDescription": "Detalle constructivo de alta precisión para el tesado inicial y ajuste de flecha de la cercha metálica. Cuenta con horquilla roscada mecanizada, bulón pasador y tuercas de contrabloqueo para garantizar la puesta en carga uniforme de los tirantes.",
        "structuralBehavior": "Conexión articulada pura (rótula cilíndrica) resistente a tracción pura axial sin transmisión de flexión al tensor.",
        "components": ["Tensor de acero macizo", "Horquilla articulada roscada", "Bulón pasador templado", "Chapa de anclaje con barrilete"],
        "normativeReference": "CTE DB-SE-A Art. 8.5 / UNE-EN 1993-1-11",
        "tags": ["tensor", "bulon", "horquilla", "regulacion", "tesado", "nudo 29", "tirante"]
    }
}

def parse_3ds_file(filepath):
    with open(filepath, 'rb') as f:
        data = f.read()
    
    pos = 0
    length = len(data)
    meshes = {}
    
    def parse_chunk(offset, end_offset, current_obj_name):
        p = offset
        while p < end_offset - 6:
            c_id, c_len = struct.unpack('<HI', data[p:p+6])
            if c_len < 6 or p + c_len > end_offset:
                p += 1
                continue
            chunk_end = p + c_len
            
            if c_id == 0x4000: # EDIT_OBJECT
                str_end = data.find(b'\x00', p + 6)
                obj_name = data[p+6:str_end].decode('latin1', errors='ignore')
                parse_chunk(str_end + 1, chunk_end, obj_name)
            elif c_id == 0x4100: # OBJ_TRIMESH
                parse_chunk(p + 6, chunk_end, current_obj_name)
            elif c_id == 0x4110: # TRI_VERTEXL
                nv = struct.unpack('<H', data[p+6:p+8])[0]
                verts = []
                vp = p + 8
                for _ in range(nv):
                    if vp + 12 <= chunk_end:
                        x, y, z = struct.unpack('<fff', data[vp:vp+12])
                        verts.append([x, y, z])
                        vp += 12
                if current_obj_name not in meshes:
                    meshes[current_obj_name] = {'verts': [], 'faces': []}
                meshes[current_obj_name]['verts'] = verts
            elif c_id == 0x4120: # TRI_FACEL1
                nf = struct.unpack('<H', data[p+6:p+8])[0]
                faces = []
                fp = p + 8
                for _ in range(nf):
                    if fp + 8 <= chunk_end:
                        a, b, c, flags = struct.unpack('<HHHH', data[fp:fp+8])
                        faces.append([a, b, c])
                        fp += 8
                if current_obj_name not in meshes:
                    meshes[current_obj_name] = {'verts': [], 'faces': []}
                meshes[current_obj_name]['faces'] = faces
            else:
                if c_id in (0x4D4D, 0x3D3D):
                    parse_chunk(p + 6, chunk_end, current_obj_name)
            p = chunk_end

    parse_chunk(0, length, 'root')
    return meshes

def process_all():
    models_dir = 'public/models'
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs('src/data', exist_ok=True)
    
    files = sorted(glob.glob('**/*.3DS', recursive=True))
    dataset = []
    
    print(f'Starting processing of {len(files)} files...')
    
    for f in files:
        base_name = os.path.splitext(os.path.basename(f))[0]
        # match key in META
        meta_key = base_name
        if meta_key not in META:
            print(f'Warning: {meta_key} not found in META dictionary!')
            continue
            
        m_info = META[meta_key]
        meshes = parse_3ds_file(f)
        
        is_full_truss = 'POLONCEAU' in f.upper()
        valid_geoms = {}
        
        for name, d in meshes.items():
            v = np.array(d['verts'], dtype=np.float32)
            fc = np.array(d['faces'], dtype=np.int32)
            if len(v) == 0 or len(fc) == 0:
                continue
            
            span = np.ptp(v, axis=0)
            if not is_full_truss and np.max(span) > 15.0:
                print(f'  [FILTERED OUTLIER] in {base_name}: {name} (span={span})')
                continue
                
            # Coordinate change: 3DS (X right, Y into screen, Z up) -> Three.js (X right, Y up, Z forward)
            v_trans = np.zeros_like(v)
            v_trans[:, 0] = v[:, 0]
            v_trans[:, 1] = v[:, 2]
            v_trans[:, 2] = -v[:, 1]
            
            key = name if name and name != 'root' else f'part_{len(valid_geoms)}'
            valid_geoms[key] = (v_trans, fc)
            
        if not valid_geoms:
            print(f'ERROR: No valid geometries for {base_name}!')
            continue
            
        # Center horizontally, place bottom at Y=0
        all_verts = np.vstack([vg[0] for vg in valid_geoms.values()])
        min_b = np.min(all_verts, axis=0)
        max_b = np.max(all_verts, axis=0)
        
        cx = (min_b[0] + max_b[0]) / 2.0
        cy = min_b[1]
        cz = (min_b[2] + max_b[2]) / 2.0
        
        scene = trimesh.Scene()
        total_verts = 0
        total_faces = 0
        
        for name, (v_trans, fc) in valid_geoms.items():
            v_centered = v_trans.copy()
            v_centered[:, 0] -= cx
            v_centered[:, 1] -= cy
            v_centered[:, 2] -= cz
            
            # Flatten faces so each triangle has crisp flat normals without 90-degree Gouraud dark blotches
            v_flat = v_centered[fc].reshape(-1, 3)
            fc_flat = np.arange(len(v_flat), dtype=np.int32).reshape(-1, 3)

            m = trimesh.Trimesh(vertices=v_flat, faces=fc_flat, process=False)
            m.vertex_normals # trigger normal calculation
            
            # Compute seamless metric box UVs per vertex
            v_coords = m.vertices
            v_norm = m.vertex_normals
            abs_n = np.abs(v_norm)
            dom = np.argmax(abs_n, axis=1) # 0 for X, 1 for Y, 2 for Z
            
            uvs = np.zeros((len(v_coords), 2), dtype=np.float32)
            uv_scale = 1.0 # 1.0 = true metric UVs (1 meter in 3D world = 1 UV unit)
            
            # X dominant (sides): use Z and Y
            mask_x = (dom == 0)
            uvs[mask_x, 0] = v_coords[mask_x, 2] * uv_scale
            uvs[mask_x, 1] = v_coords[mask_x, 1] * uv_scale
            
            # Y dominant (top/bottom): use X and Z
            mask_y = (dom == 1)
            uvs[mask_y, 0] = v_coords[mask_y, 0] * uv_scale
            uvs[mask_y, 1] = v_coords[mask_y, 2] * uv_scale
            
            # Z dominant (front/back): use X and Y
            mask_z = (dom == 2)
            uvs[mask_z, 0] = v_coords[mask_z, 0] * uv_scale
            uvs[mask_z, 1] = v_coords[mask_z, 1] * uv_scale
            
            m.visual = trimesh.visual.TextureVisuals(uv=uvs)
            scene.add_geometry(m, geom_name=name)
            total_verts += len(v_flat)
            total_faces += len(fc_flat)
            
        glb_filename = f'{meta_key}.glb'
        glb_path = os.path.join(models_dir, glb_filename)
        glb_data = scene.export(file_type='glb')
        with open(glb_path, 'wb') as out_f:
            out_f.write(glb_data)
            
        dims = max_b - min_b
        
        entry = {
            "id": meta_key,
            "fileCode": meta_key,
            "title": m_info["title"],
            "practice": m_info["practice"],
            "practiceNum": m_info["practiceNum"],
            "category": m_info["category"],
            "categoryKey": m_info["categoryKey"],
            "shortDescription": m_info["shortDescription"],
            "detailedDescription": m_info["detailedDescription"],
            "structuralBehavior": m_info["structuralBehavior"],
            "components": m_info["components"],
            "normativeReference": m_info["normativeReference"],
            "tags": m_info["tags"],
            "modelFile": f"/models/{glb_filename}",
            "dimensions": {
                "width": round(float(dims[0]), 3),
                "height": round(float(dims[1]), 3),
                "depth": round(float(dims[2]), 3)
            },
            "stats": {
                "geometriesCount": len(valid_geoms),
                "totalVertices": total_verts,
                "totalFaces": total_faces,
                "fileSizeKb": round(len(glb_data) / 1024, 1)
            }
        }
        dataset.append(entry)
        print(f'Processed {meta_key}: {len(valid_geoms)} parts, {dims[0]:.2f}x{dims[1]:.2f}x{dims[2]:.2f}m -> {glb_path}')
        
    with open('src/data/details.json', 'w', encoding='utf-8') as jf:
        json.dump(dataset, jf, ensure_ascii=False, indent=2)
        
    print(f'\nFinished! Generated {len(dataset)} detail entries in src/data/details.json and models in public/models/')

if __name__ == '__main__':
    process_all()
