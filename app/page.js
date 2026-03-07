"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";


// ═══════════════════════════════════════════════════════════════
// i18n STRINGS
// ═══════════════════════════════════════════════════════════════

const i18n = {
  es: {
    brand: "NEXUS", brandAccent: "IQ",
    tagline: "Evaluación Cognitiva Avanzada",
    heroTitle1: "Descubre tu", heroTitle2: "Potencial Cognitivo",
    heroDesc: "24 preguntas diseñadas por expertos que evalúan 6 dominios de inteligencia. Resultado con intervalo de confianza del 80% y análisis por dominio.",
    time: "12-15 min", questions: "24 preguntas", timed: "Tiempo limitado",
    startBtn: "Comenzar Test Gratuito",
    socialProof: "+12.400 tests completados",
    disclaimer: "Estimación orientativa. No sustituye una evaluación psicométrica profesional.",
    analyzing: "ANALIZANDO RESPUESTAS",
    results: "Resultados",
    iqEstimated: "Coeficiente Intelectual Estimado",
    confidenceInterval: "INTERVALO DE CONFIANZA 80%",
    classification: "Clasificación", percentile: "Percentil", correct: "Aciertos",
    domainPerf: "Rendimiento por dominio",
    strengths: "FORTALEZAS", areasImprove: "ÁREAS DE MEJORA",
    interpretation: "INTERPRETACIÓN",
    interpretText: (l, u, p, fast, s, w) => `Con un 80% de confianza, tu CI se sitúa entre ${l} y ${u}. Esto te ubica en el percentil ${p}, superando al ${p}% de la población.${fast ? " Tu velocidad de procesamiento fue notable, indicando buena fluidez cognitiva." : ""} Tu perfil muestra mayor facilidad en ${s}, con margen de mejora en ${w}.`,
    avgTime: "Tiempo medio", rawScore: "Puntuación bruta",
    fullReport: "Informe Completo",
    fullReportDesc: "Análisis detallado por dominio, fortalezas, debilidades y recomendaciones personalizadas",
    unlock: "Desbloquear — 4,99€",
    emailAlt: "o recibe un resumen gratis por email",
    emailPlaceholder: "tu@email.com", send: "Enviar",
    emailSent: "✓ Te enviaremos el resumen pronto",
    share: "Compartir resultado", retry: "Repetir test",
    shareText: (iq, l, u) => `He obtenido un CI estimado de ${iq} (rango ${l}-${u}) en NexusIQ. ¿Cuánto sacas tú?`,
    timeUp: "Tiempo agotado", difficulty: "dificultad",
    footerDisclaimer: "NexusIQ proporciona una estimación orientativa. Para una evaluación formal, consulta un profesional certificado (WAIS-IV, Raven's SPM).",
    selectLang: "Selecciona tu idioma", continueBtn: "Continuar",
    iqLabels: { exceptional: "Excepcional", superior: "Superior", aboveAvg: "Por encima de la media", average: "Media", belowAvg: "Por debajo de la media", sigLow: "Significativamente bajo" },
    domains: { logic: "Razonamiento Lógico", numerical: "Razonamiento Numérico", spatial: "Razonamiento Espacial", verbal: "Razonamiento Verbal", memory: "Memoria de Trabajo", abstract: "Inteligencia Fluida" },
  },
  en: {
    brand: "NEXUS", brandAccent: "IQ",
    tagline: "Advanced Cognitive Assessment",
    heroTitle1: "Discover your", heroTitle2: "Cognitive Potential",
    heroDesc: "24 expert-designed questions evaluating 6 intelligence domains. Results include an 80% confidence interval and domain-by-domain analysis.",
    time: "12-15 min", questions: "24 questions", timed: "Time limited",
    startBtn: "Start Free Test",
    socialProof: "+12,400 tests completed",
    disclaimer: "Indicative estimate. Does not replace a professional psychometric assessment.",
    analyzing: "ANALYZING RESPONSES",
    results: "Results",
    iqEstimated: "Estimated Intelligence Quotient",
    confidenceInterval: "80% CONFIDENCE INTERVAL",
    classification: "Classification", percentile: "Percentile", correct: "Correct",
    domainPerf: "Performance by domain",
    strengths: "STRENGTHS", areasImprove: "AREAS FOR IMPROVEMENT",
    interpretation: "INTERPRETATION",
    interpretText: (l, u, p, fast, s, w) => `With 80% confidence, your IQ falls between ${l} and ${u}. This places you at the ${p}th percentile, scoring equal to or higher than ${p}% of the population.${fast ? " Your processing speed was notable, suggesting strong cognitive fluency." : ""} Your profile shows strength in ${s}, with room for growth in ${w}.`,
    avgTime: "Avg. time", rawScore: "Raw score",
    fullReport: "Full Report",
    fullReportDesc: "Detailed domain breakdown, strengths, weaknesses and personalized recommendations",
    unlock: "Unlock — $4.99",
    emailAlt: "or get a free summary by email",
    emailPlaceholder: "you@email.com", send: "Send",
    emailSent: "✓ We'll send your summary soon",
    share: "Share result", retry: "Retake test",
    shareText: (iq, l, u) => `I scored an estimated IQ of ${iq} (range ${l}-${u}) on NexusIQ. What's yours?`,
    timeUp: "Time's up", difficulty: "difficulty",
    footerDisclaimer: "NexusIQ provides an indicative estimate. For a formal assessment, consult a certified professional (WAIS-IV, Raven's SPM).",
    selectLang: "Select your language", continueBtn: "Continue",
    iqLabels: { exceptional: "Exceptional", superior: "Superior", aboveAvg: "Above average", average: "Average", belowAvg: "Below average", sigLow: "Significantly low" },
    domains: { logic: "Logical Reasoning", numerical: "Numerical Reasoning", spatial: "Spatial Reasoning", verbal: "Verbal Reasoning", memory: "Working Memory", abstract: "Fluid Intelligence" },
  },
};

// ═══════════════════════════════════════════════════════════════
// QUESTION BANKS
// ═══════════════════════════════════════════════════════════════

const Q_ES = [
  {id:"L01",domain:"logic",difficulty:0.2,question:"Si llueve, el suelo se moja. El suelo está mojado. ¿Qué podemos concluir?",options:["Ha llovido seguro","Puede que haya llovido, pero hay otras causas posibles","No ha llovido","El suelo está seco"],correct:1,timeLimit:25},
  {id:"L02",domain:"logic",difficulty:0.25,question:"¿Cuál es el siguiente: 2, 6, 18, 54, ...?",options:["108","162","72","148"],correct:1,timeLimit:25},
  {id:"L03",domain:"logic",difficulty:0.35,question:"Todos los gatos son animales. Algunos animales son salvajes. ¿Qué es NECESARIAMENTE cierto?",options:["Todos los gatos son salvajes","Algunos gatos son salvajes","Los gatos son animales","Ningún gato es salvaje"],correct:2,timeLimit:30},
  {id:"L04",domain:"logic",difficulty:0.4,question:"Si todos los Blips son Clops, y algunos Clops son Drens, ¿cuál es NECESARIAMENTE cierta?",options:["Todos los Blips son Drens","Algunos Drens son Blips","Algunos Blips podrían ser Drens","Ningún Blip es Dren"],correct:2,timeLimit:40},
  {id:"L05",domain:"logic",difficulty:0.45,question:"Ana es más alta que Bea. Bea es más alta que Clara. Diana es más baja que Clara. ¿Quién es la más baja?",options:["Ana","Bea","Clara","Diana"],correct:3,timeLimit:30},
  {id:"L06",domain:"logic",difficulty:0.5,question:"Un pastor cruza un río con un lobo, una oveja y una col. Solo lleva uno a la vez. ¿Viajes mínimos (ida+vuelta=2)?",options:["5","7","9","11"],correct:1,timeLimit:50},
  {id:"L07",domain:"logic",difficulty:0.55,question:"Si A → B, B → C, y no C. ¿Qué concluimos?",options:["A es verdadero","B es verdadero","A es falso","Nada"],correct:2,timeLimit:35},
  {id:"L08",domain:"logic",difficulty:0.6,question:"Isla: caballeros (verdad) y pícaros (mentira). Alguien dice: 'Yo soy un pícaro'. ¿Qué es?",options:["Caballero","Pícaro","Cualquiera","Imposible que lo diga"],correct:3,timeLimit:45},
  {id:"L09",domain:"logic",difficulty:0.65,question:"Un reloj se atrasa 3 min/hora. Puesto en hora a las 12:00, ¿hora real cuando marque las 23:00?",options:["23:00","23:33","23:35","23:39"],correct:2,timeLimit:60},
  {id:"L10",domain:"logic",difficulty:0.7,question:"3 cajas (manzanas/naranjas/ambas), TODAS mal etiquetadas. De la caja 'Ambas' sacas manzana. ¿Qué tiene 'Naranjas'?",options:["Naranjas","Manzanas","Ambas","Imposible saber"],correct:2,timeLimit:60},
  {id:"L11",domain:"logic",difficulty:0.75,question:"'FISH' → 'GKUJ'. ¿Cómo se codifica 'BRAIN'?",options:["CSBJO","CSBKO","DSCJO","CSBJP"],correct:0,timeLimit:50},
  {id:"L12",domain:"logic",difficulty:0.8,question:"12 bolas, una pesa diferente. Balanza de platillos. ¿Pesadas mínimas?",options:["2","3","4","5"],correct:1,timeLimit:45},
  {id:"L13",domain:"logic",difficulty:0.85,question:"5 personas en fila. A no junto a B. C en extremo. D junto a E. ¿Disposiciones válidas?",options:["8","12","16","24"],correct:1,timeLimit:60},
  {id:"L14",domain:"logic",difficulty:0.9,question:"Torneo eliminatorio, 64 jugadores. ¿Partidos totales?",options:["32","63","64","128"],correct:1,timeLimit:35},
  {id:"L15",domain:"logic",difficulty:0.95,question:"2 cuerdas (60 min cada una, quema no uniforme). ¿Medir 45 min exactos?",options:["Sí: una por ambos extremos + otra por uno","No es posible","Sí: cortar una por la mitad","Necesitas 3 cuerdas"],correct:0,timeLimit:55},
  {id:"N01",domain:"numerical",difficulty:0.2,question:"Siguiente: 2, 4, 8, 16, ...?",options:["24","28","32","36"],correct:2,timeLimit:15},
  {id:"N02",domain:"numerical",difficulty:0.3,question:"Siguiente: 1, 1, 2, 3, 5, 8, 13, ...?",options:["18","20","21","26"],correct:2,timeLimit:20},
  {id:"N03",domain:"numerical",difficulty:0.35,question:"Compras a 8€, vendes a 10€. ¿% beneficio?",options:["20%","25%","80%","2%"],correct:1,timeLimit:25},
  {id:"N04",domain:"numerical",difficulty:0.4,question:"¿Cuántos cuadrados en un tablero 8×8? (No solo casillas)",options:["64","200","204","256"],correct:2,timeLimit:45},
  {id:"N05",domain:"numerical",difficulty:0.45,question:"Caracol: +3m día, -2m noche. ¿Días para salir de pozo de 10m?",options:["7","8","9","10"],correct:1,timeLimit:40},
  {id:"N06",domain:"numerical",difficulty:0.5,question:"3 máquinas → 3 piezas en 3 min. ¿100 máquinas en 100 min?",options:["100","300","3333","10000"],correct:2,timeLimit:50},
  {id:"N07",domain:"numerical",difficulty:0.55,question:"Siguiente: 1, 4, 9, 16, 25, ...?",options:["30","35","36","49"],correct:2,timeLimit:20},
  {id:"N08",domain:"numerical",difficulty:0.6,question:"Nenúfares ×2 cada día. Lleno en 30 días. ¿Medio lleno?",options:["Día 15","Día 25","Día 28","Día 29"],correct:3,timeLimit:30},
  {id:"N09",domain:"numerical",difficulty:0.65,question:"Siguiente: 1, 4, 27, 256, ...?",options:["625","1024","3125","4096"],correct:2,timeLimit:40},
  {id:"N10",domain:"numerical",difficulty:0.7,question:"Suma de 1 a 100:",options:["4950","5000","5050","5500"],correct:2,timeLimit:35},
  {id:"N11",domain:"numerical",difficulty:0.75,question:"Siguiente primo: 2, 3, 5, 7, 11, 13, ...?",options:["15","16","17","19"],correct:2,timeLimit:25},
  {id:"N12",domain:"numerical",difficulty:0.8,question:"1000€ al 5% compuesto anual. ¿Tras 3 años?",options:["1150€","1157.63€","1150.50€","1200€"],correct:1,timeLimit:40},
  {id:"N13",domain:"numerical",difficulty:0.85,question:"¿Ceros finales en 100!?",options:["10","20","24","25"],correct:2,timeLimit:50},
  {id:"N14",domain:"numerical",difficulty:0.9,question:"2^100 mod 7 = ?",options:["1","2","4","6"],correct:1,timeLimit:55},
  {id:"S01",domain:"spatial",difficulty:0.2,question:"Desarrollo en cruz → cubo. ¿Caras?",options:["4","5","6","8"],correct:2,timeLimit:15},
  {id:"S02",domain:"spatial",difficulty:0.3,question:"¿Caras de un icosaedro?",options:["10","12","20","30"],correct:2,timeLimit:20},
  {id:"S03",domain:"spatial",difficulty:0.35,question:"Letra 'N' girada 90° horario. ¿Se parece a?",options:["Z","M","W","U"],correct:0,timeLimit:25},
  {id:"S04",domain:"spatial",difficulty:0.45,question:"Cubo + 2 cortes perpendiculares. ¿Piezas?",options:["2","3","4","8"],correct:2,timeLimit:35},
  {id:"S05",domain:"spatial",difficulty:0.5,question:"Papel doblado por la mitad, cortas esquina del borde. Desdoblas. ¿Agujeros?",options:["0 (corte en borde)","1","2","4"],correct:0,timeLimit:35},
  {id:"S06",domain:"spatial",difficulty:0.55,question:"Cubos de 1cm³ para cubo de 3cm de lado:",options:["9","18","27","36"],correct:2,timeLimit:25},
  {id:"S07",domain:"spatial",difficulty:0.6,question:"Dado (opuestas suman 7). 1 arriba, 2 hacia ti. ¿Derecha?",options:["3","4","5","6"],correct:0,timeLimit:40},
  {id:"S08",domain:"spatial",difficulty:0.65,question:"Cubo 3×3×3 pintado. ¿Cubitos con al menos 1 cara pintada?",options:["8","20","26","27"],correct:2,timeLimit:40},
  {id:"S09",domain:"spatial",difficulty:0.7,question:"Reflejo vertical de '►▲◄▼':",options:["◄▲►▼","▼◄▲►","◄▼►▲","▼►▲◄"],correct:2,timeLimit:35},
  {id:"S10",domain:"spatial",difficulty:0.75,question:"Cuadrado doblado por diagonal (×2). Cortas punta central. Agujero al desdoblar:",options:["Triángulo","Cuadrado","Rombo","Círculo"],correct:2,timeLimit:45},
  {id:"S11",domain:"spatial",difficulty:0.8,question:"Ejes de simetría de hexágono regular:",options:["3","4","6","12"],correct:2,timeLimit:30},
  {id:"S12",domain:"spatial",difficulty:0.85,question:"Tetraedro regular (4 caras). ¿Aristas?",options:["4","6","8","12"],correct:1,timeLimit:25},
  {id:"S13",domain:"spatial",difficulty:0.9,question:"4 cubos en L. ¿Caras visibles desde fuera?",options:["14","16","18","20"],correct:2,timeLimit:50},
  {id:"V01",domain:"verbal",difficulty:0.2,question:"CALIENTE:FRÍO :: ALTO:?",options:["Grande","Bajo","Largo","Pesado"],correct:1,timeLimit:12},
  {id:"V02",domain:"verbal",difficulty:0.25,question:"Sinónimo de 'efímero':",options:["Eterno","Pasajero","Fuerte","Oscuro"],correct:1,timeLimit:15},
  {id:"V03",domain:"verbal",difficulty:0.35,question:"PÁJARO:NIDO :: ABEJA:?",options:["Miel","Flor","Colmena","Enjambre"],correct:2,timeLimit:15},
  {id:"V04",domain:"verbal",difficulty:0.4,question:"¿Cuál NO es antónimo de 'prolijo'?",options:["Conciso","Breve","Escueto","Minucioso"],correct:3,timeLimit:20},
  {id:"V05",domain:"verbal",difficulty:0.45,question:"CIRUJANO:BISTURÍ :: PINTOR:?",options:["Cuadro","Pincel","Color","Lienzo"],correct:1,timeLimit:15},
  {id:"V06",domain:"verbal",difficulty:0.5,question:"No pertenece: Metonimia, Sinécdoque, Hipérbole, Silogismo",options:["Metonimia","Sinécdoque","Hipérbole","Silogismo"],correct:3,timeLimit:25},
  {id:"V07",domain:"verbal",difficulty:0.55,question:"DEMOCRACIA:PUEBLO :: TEOCRACIA:?",options:["Ejército","Dinero","Dios","Rey"],correct:2,timeLimit:20},
  {id:"V08",domain:"verbal",difficulty:0.6,question:"Oxímoron = opuestos combinados. ¿Ejemplo?",options:["Lluvia torrencial","Silencio ensordecedor","Mar profundo","Fuego brillante"],correct:1,timeLimit:25},
  {id:"V09",domain:"verbal",difficulty:0.65,question:"ENTOMOLOGÍA ↔ INSECTOS:",options:["Hábitat","Ciencia que los estudia","Etimología","Taxonomía"],correct:1,timeLimit:20},
  {id:"V10",domain:"verbal",difficulty:0.7,question:"Misántropo odia humanidad. ¿Filántropo?",options:["Odia animales","Ama sabiduría","Ama humanidad","Estudia lenguas"],correct:2,timeLimit:20},
  {id:"V11",domain:"verbal",difficulty:0.8,question:"'Cronos' en 'anacronismo' significa:",options:["Lugar","Tiempo","Orden","Forma"],correct:1,timeLimit:20},
  {id:"V12",domain:"verbal",difficulty:0.85,question:"EPISTEME:CONOCIMIENTO :: DOXA:?",options:["Verdad","Opinión","Ciencia","Método"],correct:1,timeLimit:25},
  {id:"V13",domain:"verbal",difficulty:0.9,question:"'Apócrifo' = algo...",options:["Muy antiguo","De autoría dudosa","Sagrado","Incomprensible"],correct:1,timeLimit:20},
  {id:"M01",domain:"memory",difficulty:0.2,question:"4-7-2 al revés:",options:["2-7-4","7-4-2","4-2-7","2-4-7"],correct:0,timeLimit:20},
  {id:"M02",domain:"memory",difficulty:0.3,question:"7-3-9-1-5 invertido:",options:["5-1-9-3-7","7-3-9-1-5","5-9-1-3-7","1-3-5-7-9"],correct:0,timeLimit:25},
  {id:"M03",domain:"memory",difficulty:0.35,question:"A=1,B=2,C=3... D+E+F=?",options:["12","15","18","21"],correct:1,timeLimit:25},
  {id:"M04",domain:"memory",difficulty:0.4,question:"A=1,B=2... Letras de 'CASA' suman:",options:["24","25","26","27"],correct:1,timeLimit:35},
  {id:"M05",domain:"memory",difficulty:0.45,question:"ROJO,AZUL,VERDE,NEGRO,BLANCO. ¿3º alfabéticamente?",options:["BLANCO","NEGRO","ROJO","VERDE"],correct:2,timeLimit:30},
  {id:"M06",domain:"memory",difficulty:0.5,question:"100 menos 7, menos 7... ¿5º número?",options:["65","72","58","79"],correct:1,timeLimit:35},
  {id:"M07",domain:"memory",difficulty:0.55,question:"3,7,12,5,9. Mayor menos menor:",options:["7","8","9","10"],correct:2,timeLimit:25},
  {id:"M08",domain:"memory",difficulty:0.6,question:"8,3,6,1,9,4. Suma del 2º y 5º:",options:["7","10","12","13"],correct:2,timeLimit:30},
  {id:"M09",domain:"memory",difficulty:0.65,question:"Reordena 'LPAEBAN'. ¿Categoría?",options:["Animal","Emoción","Idioma","País"],correct:2,timeLimit:40},
  {id:"M10",domain:"memory",difficulty:0.7,question:"Luna,Sol,Marte,Venus,Júpiter. Letras del 4º:",options:["3","4","5","6"],correct:2,timeLimit:25},
  {id:"M11",domain:"memory",difficulty:0.75,question:"100 días después de lunes = ¿qué día?",options:["Lunes","Miércoles","Jueves","Viernes"],correct:1,timeLimit:35},
  {id:"M12",domain:"memory",difficulty:0.8,question:"5,11,8,3,14,6,9 ordenados. ¿4º?",options:["6","8","9","11"],correct:1,timeLimit:35},
  {id:"M13",domain:"memory",difficulty:0.9,question:"GATO=7+1+20+15=43 (A=1..Z=27). ¿PERRO?",options:["68","73","75","80"],correct:2,timeLimit:50},
  {id:"A01",domain:"abstract",difficulty:0.2,question:"16:4 :: 81:?",options:["3","9","18","27"],correct:1,timeLimit:20},
  {id:"A02",domain:"abstract",difficulty:0.3,question:"No encaja: 2,3,5,7,9,11,13",options:["2","3","9","11"],correct:2,timeLimit:25},
  {id:"A03",domain:"abstract",difficulty:0.35,question:"○+△=10, ○=3△. ¿△?",options:["2","2.5","3","4"],correct:1,timeLimit:30},
  {id:"A04",domain:"abstract",difficulty:0.4,question:"AZ, BY, CX, D_?",options:["E","U","W","V"],correct:2,timeLimit:25},
  {id:"A05",domain:"abstract",difficulty:0.45,question:"★×★ = ★+★+★+★. ¿★ (≠0)?",options:["2","3","4","5"],correct:2,timeLimit:30},
  {id:"A06",domain:"abstract",difficulty:0.5,question:"Pentágono + todas las diagonales. ¿Triángulos?",options:["5","8","10","35"],correct:2,timeLimit:45},
  {id:"A07",domain:"abstract",difficulty:0.55,question:"◆+◇=12, ◆-◇=4, ◆×●=24. ¿●?",options:["2","3","4","6"],correct:1,timeLimit:35},
  {id:"A08",domain:"abstract",difficulty:0.6,question:"1→1, 2→4, 3→9, 4→16, 5→?",options:["20","25","30","36"],correct:1,timeLimit:20},
  {id:"A09",domain:"abstract",difficulty:0.65,question:"Vocal=5, consonante=3. ¿'MESA'?",options:["13","14","16","18"],correct:2,timeLimit:25},
  {id:"A10",domain:"abstract",difficulty:0.7,question:"Subir 4 escalones (de 1 o 2). ¿Formas?",options:["3","4","5","8"],correct:2,timeLimit:40},
  {id:"A11",domain:"abstract",difficulty:0.75,question:"Intercambiar 2 dígitos en '123456789'. ¿Configuraciones?",options:["36","72","81","362880"],correct:0,timeLimit:45},
  {id:"A12",domain:"abstract",difficulty:0.8,question:"Mín. colores para colorear mapa plano (adyacentes ≠ color):",options:["3","4","5","6"],correct:1,timeLimit:30},
  {id:"A13",domain:"abstract",difficulty:0.85,question:"1, 11, 21, 1211, 111221... ¿Siguiente?",options:["312211","122211","112221","1112221"],correct:0,timeLimit:55},
  {id:"A14",domain:"abstract",difficulty:0.92,question:"f(x)=f(x-1)+f(x-2), f(1)=f(2)=1. ¿f(10)?",options:["34","55","89","144"],correct:1,timeLimit:45},
];

const Q_EN = [
  {id:"L01",domain:"logic",difficulty:0.2,question:"If it rains, the ground gets wet. The ground is wet. What can we conclude?",options:["It definitely rained","It may have rained, but other causes are possible","It didn't rain","The ground is dry"],correct:1,timeLimit:25},
  {id:"L02",domain:"logic",difficulty:0.25,question:"What comes next: 2, 6, 18, 54, ...?",options:["108","162","72","148"],correct:1,timeLimit:25},
  {id:"L03",domain:"logic",difficulty:0.35,question:"All cats are animals. Some animals are wild. What is NECESSARILY true?",options:["All cats are wild","Some cats are wild","Cats are animals","No cat is wild"],correct:2,timeLimit:30},
  {id:"L04",domain:"logic",difficulty:0.4,question:"All Blips are Clops. Some Clops are Drens. Which is NECESSARILY true?",options:["All Blips are Drens","Some Drens are Blips","Some Blips might be Drens","No Blip is a Dren"],correct:2,timeLimit:40},
  {id:"L05",domain:"logic",difficulty:0.45,question:"Ana > Bea > Clara. Diana < Clara. Who's shortest?",options:["Ana","Bea","Clara","Diana"],correct:3,timeLimit:30},
  {id:"L06",domain:"logic",difficulty:0.5,question:"Farmer crosses river with wolf, sheep, cabbage. One at a time. Min trips (round trip=2)?",options:["5","7","9","11"],correct:1,timeLimit:50},
  {id:"L07",domain:"logic",difficulty:0.55,question:"If A→B, B→C, and ¬C. Conclusion?",options:["A is true","B is true","A is false","Nothing"],correct:2,timeLimit:35},
  {id:"L08",domain:"logic",difficulty:0.6,question:"Island: knights (truth), knaves (lie). Someone says: 'I am a knave.' What are they?",options:["Knight","Knave","Either","Impossible to say that"],correct:3,timeLimit:45},
  {id:"L09",domain:"logic",difficulty:0.65,question:"Clock loses 3 min/hour. Set at 12:00. Real time when it shows 23:00?",options:["23:00","23:33","23:35","23:39"],correct:2,timeLimit:60},
  {id:"L10",domain:"logic",difficulty:0.7,question:"3 boxes (apples/oranges/both). ALL labels WRONG. From 'Both' box you get apple. What's in 'Oranges'?",options:["Oranges","Apples","Both","Can't tell"],correct:2,timeLimit:60},
  {id:"L11",domain:"logic",difficulty:0.75,question:"'FISH' → 'GKUJ'. Code for 'BRAIN'?",options:["CSBJO","CSBKO","DSCJO","CSBJP"],correct:0,timeLimit:50},
  {id:"L12",domain:"logic",difficulty:0.8,question:"12 identical balls, one weighs different. Balance scale. Min weighings?",options:["2","3","4","5"],correct:1,timeLimit:45},
  {id:"L13",domain:"logic",difficulty:0.85,question:"5 people in a row. A not next to B. C at end. D next to E. Valid arrangements?",options:["8","12","16","24"],correct:1,timeLimit:60},
  {id:"L14",domain:"logic",difficulty:0.9,question:"Single-elimination tournament, 64 players. Total matches?",options:["32","63","64","128"],correct:1,timeLimit:35},
  {id:"L15",domain:"logic",difficulty:0.95,question:"2 ropes (60 min each, non-uniform burn). Measure exactly 45 min?",options:["Yes: one from both ends + other from one","Not possible","Yes: cut one in half","Need 3 ropes"],correct:0,timeLimit:55},
  {id:"N01",domain:"numerical",difficulty:0.2,question:"Next: 2, 4, 8, 16, ...?",options:["24","28","32","36"],correct:2,timeLimit:15},
  {id:"N02",domain:"numerical",difficulty:0.3,question:"Next: 1, 1, 2, 3, 5, 8, 13, ...?",options:["18","20","21","26"],correct:2,timeLimit:20},
  {id:"N03",domain:"numerical",difficulty:0.35,question:"Buy at $8, sell at $10. Profit %?",options:["20%","25%","80%","2%"],correct:1,timeLimit:25},
  {id:"N04",domain:"numerical",difficulty:0.4,question:"Squares on 8×8 chessboard? (Not just cells)",options:["64","200","204","256"],correct:2,timeLimit:45},
  {id:"N05",domain:"numerical",difficulty:0.45,question:"Snail: +3m day, -2m night. Days to escape 10m well?",options:["7","8","9","10"],correct:1,timeLimit:40},
  {id:"N06",domain:"numerical",difficulty:0.5,question:"3 machines → 3 widgets in 3 min. 100 machines in 100 min?",options:["100","300","3333","10000"],correct:2,timeLimit:50},
  {id:"N07",domain:"numerical",difficulty:0.55,question:"Next: 1, 4, 9, 16, 25, ...?",options:["30","35","36","49"],correct:2,timeLimit:20},
  {id:"N08",domain:"numerical",difficulty:0.6,question:"Lily pads double daily. Full on day 30. Half full?",options:["Day 15","Day 25","Day 28","Day 29"],correct:3,timeLimit:30},
  {id:"N09",domain:"numerical",difficulty:0.65,question:"Next: 1, 4, 27, 256, ...?",options:["625","1024","3125","4096"],correct:2,timeLimit:40},
  {id:"N10",domain:"numerical",difficulty:0.7,question:"Sum of 1 to 100:",options:["4950","5000","5050","5500"],correct:2,timeLimit:35},
  {id:"N11",domain:"numerical",difficulty:0.75,question:"Next prime: 2, 3, 5, 7, 11, 13, ...?",options:["15","16","17","19"],correct:2,timeLimit:25},
  {id:"N12",domain:"numerical",difficulty:0.8,question:"$1000 at 5% compound annual. After 3 years?",options:["$1150","$1157.63","$1150.50","$1200"],correct:1,timeLimit:40},
  {id:"N13",domain:"numerical",difficulty:0.85,question:"Trailing zeros in 100!?",options:["10","20","24","25"],correct:2,timeLimit:50},
  {id:"N14",domain:"numerical",difficulty:0.9,question:"2^100 mod 7 = ?",options:["1","2","4","6"],correct:1,timeLimit:55},
  {id:"S01",domain:"spatial",difficulty:0.2,question:"Cross-shaped net → cube. Faces?",options:["4","5","6","8"],correct:2,timeLimit:15},
  {id:"S02",domain:"spatial",difficulty:0.3,question:"Faces on an icosahedron?",options:["10","12","20","30"],correct:2,timeLimit:20},
  {id:"S03",domain:"spatial",difficulty:0.35,question:"'N' rotated 90° clockwise looks like?",options:["Z","M","W","U"],correct:0,timeLimit:25},
  {id:"S04",domain:"spatial",difficulty:0.45,question:"Cube + 2 perpendicular cuts. Pieces?",options:["2","3","4","8"],correct:2,timeLimit:35},
  {id:"S05",domain:"spatial",difficulty:0.5,question:"Fold paper in half, cut folded-edge corner. Unfold. Holes?",options:["0 (edge cut)","1","2","4"],correct:0,timeLimit:35},
  {id:"S06",domain:"spatial",difficulty:0.55,question:"1cm³ cubes to build 3cm cube:",options:["9","18","27","36"],correct:2,timeLimit:25},
  {id:"S07",domain:"spatial",difficulty:0.6,question:"Die (opposites sum 7). 1 up, 2 facing you. Right side?",options:["3","4","5","6"],correct:0,timeLimit:40},
  {id:"S08",domain:"spatial",difficulty:0.65,question:"3×3×3 cube painted outside. Small cubes with ≥1 painted face?",options:["8","20","26","27"],correct:2,timeLimit:40},
  {id:"S09",domain:"spatial",difficulty:0.7,question:"Vertical mirror of '►▲◄▼':",options:["◄▲►▼","▼◄▲►","◄▼►▲","▼►▲◄"],correct:2,timeLimit:35},
  {id:"S10",domain:"spatial",difficulty:0.75,question:"Square folded diagonally (×2). Cut center tip. Unfolded hole shape?",options:["Triangle","Square","Diamond","Circle"],correct:2,timeLimit:45},
  {id:"S11",domain:"spatial",difficulty:0.8,question:"Axes of symmetry in regular hexagon:",options:["3","4","6","12"],correct:2,timeLimit:30},
  {id:"S12",domain:"spatial",difficulty:0.85,question:"Regular tetrahedron (4 faces). Edges?",options:["4","6","8","12"],correct:1,timeLimit:25},
  {id:"S13",domain:"spatial",difficulty:0.9,question:"4 cubes in L-shape. Visible faces from outside?",options:["14","16","18","20"],correct:2,timeLimit:50},
  {id:"V01",domain:"verbal",difficulty:0.2,question:"HOT:COLD :: TALL:?",options:["Big","Short","Long","Heavy"],correct:1,timeLimit:12},
  {id:"V02",domain:"verbal",difficulty:0.25,question:"Synonym of 'ephemeral':",options:["Eternal","Fleeting","Strong","Dark"],correct:1,timeLimit:15},
  {id:"V03",domain:"verbal",difficulty:0.35,question:"BIRD:NEST :: BEE:?",options:["Honey","Flower","Hive","Swarm"],correct:2,timeLimit:15},
  {id:"V04",domain:"verbal",difficulty:0.4,question:"Which is NOT an antonym of 'verbose'?",options:["Concise","Brief","Terse","Detailed"],correct:3,timeLimit:20},
  {id:"V05",domain:"verbal",difficulty:0.45,question:"SURGEON:SCALPEL :: PAINTER:?",options:["Painting","Brush","Color","Canvas"],correct:1,timeLimit:15},
  {id:"V06",domain:"verbal",difficulty:0.5,question:"Doesn't belong: Metonymy, Synecdoche, Hyperbole, Syllogism",options:["Metonymy","Synecdoche","Hyperbole","Syllogism"],correct:3,timeLimit:25},
  {id:"V07",domain:"verbal",difficulty:0.55,question:"DEMOCRACY:PEOPLE :: THEOCRACY:?",options:["Army","Money","God","King"],correct:2,timeLimit:20},
  {id:"V08",domain:"verbal",difficulty:0.6,question:"Oxymoron = opposite concepts combined. Example?",options:["Heavy rain","Deafening silence","Deep ocean","Bright fire"],correct:1,timeLimit:25},
  {id:"V09",domain:"verbal",difficulty:0.65,question:"ENTOMOLOGY ↔ INSECTS:",options:["Habitat","Science that studies them","Etymology","Taxonomy"],correct:1,timeLimit:20},
  {id:"V10",domain:"verbal",difficulty:0.7,question:"Misanthrope hates humanity. Philanthropist?",options:["Hates animals","Loves wisdom","Loves humanity","Studies languages"],correct:2,timeLimit:20},
  {id:"V11",domain:"verbal",difficulty:0.8,question:"'Chronos' in 'anachronism' means:",options:["Place","Time","Order","Form"],correct:1,timeLimit:20},
  {id:"V12",domain:"verbal",difficulty:0.85,question:"EPISTEME:KNOWLEDGE :: DOXA:?",options:["Truth","Opinion","Science","Method"],correct:1,timeLimit:25},
  {id:"V13",domain:"verbal",difficulty:0.9,question:"'Apocryphal' means something:",options:["Very ancient","Of doubtful authorship","Sacred","Incomprehensible"],correct:1,timeLimit:20},
  {id:"M01",domain:"memory",difficulty:0.2,question:"4-7-2 reversed:",options:["2-7-4","7-4-2","4-2-7","2-4-7"],correct:0,timeLimit:20},
  {id:"M02",domain:"memory",difficulty:0.3,question:"7-3-9-1-5 reversed:",options:["5-1-9-3-7","7-3-9-1-5","5-9-1-3-7","1-3-5-7-9"],correct:0,timeLimit:25},
  {id:"M03",domain:"memory",difficulty:0.35,question:"A=1,B=2,C=3... D+E+F=?",options:["12","15","18","21"],correct:1,timeLimit:25},
  {id:"M04",domain:"memory",difficulty:0.4,question:"A=1,B=2... Letters of 'FACE' sum to:",options:["14","15","16","17"],correct:0,timeLimit:35},
  {id:"M05",domain:"memory",difficulty:0.45,question:"RED,BLUE,GREEN,BLACK,WHITE. 3rd alphabetically?",options:["GREEN","RED","WHITE","BLUE"],correct:0,timeLimit:30},
  {id:"M06",domain:"memory",difficulty:0.5,question:"Count back by 7 from 100. 5th number?",options:["65","72","58","79"],correct:1,timeLimit:35},
  {id:"M07",domain:"memory",difficulty:0.55,question:"3,7,12,5,9. Largest minus smallest:",options:["7","8","9","10"],correct:2,timeLimit:25},
  {id:"M08",domain:"memory",difficulty:0.6,question:"8,3,6,1,9,4. Sum of 2nd and 5th:",options:["7","10","12","13"],correct:2,timeLimit:30},
  {id:"M09",domain:"memory",difficulty:0.65,question:"Rearrange 'AEGNLUD' to form a word. Category?",options:["Animal","Emotion","Language","Country"],correct:2,timeLimit:40},
  {id:"M10",domain:"memory",difficulty:0.7,question:"Moon,Sun,Mars,Venus,Jupiter. Letters in 4th:",options:["3","4","5","6"],correct:2,timeLimit:25},
  {id:"M11",domain:"memory",difficulty:0.75,question:"100 days after Monday = ?",options:["Monday","Wednesday","Thursday","Friday"],correct:1,timeLimit:35},
  {id:"M12",domain:"memory",difficulty:0.8,question:"5,11,8,3,14,6,9 sorted. 4th?",options:["6","8","9","11"],correct:1,timeLimit:35},
  {id:"M13",domain:"memory",difficulty:0.9,question:"CAT=3+1+20=24 (A=1..Z=26). DOG=?",options:["24","26","28","30"],correct:1,timeLimit:50},
  {id:"A01",domain:"abstract",difficulty:0.2,question:"16:4 :: 81:?",options:["3","9","18","27"],correct:1,timeLimit:20},
  {id:"A02",domain:"abstract",difficulty:0.3,question:"Doesn't fit: 2,3,5,7,9,11,13",options:["2","3","9","11"],correct:2,timeLimit:25},
  {id:"A03",domain:"abstract",difficulty:0.35,question:"○+△=10, ○=3△. △=?",options:["2","2.5","3","4"],correct:1,timeLimit:30},
  {id:"A04",domain:"abstract",difficulty:0.4,question:"AZ, BY, CX, D_?",options:["E","U","W","V"],correct:2,timeLimit:25},
  {id:"A05",domain:"abstract",difficulty:0.45,question:"★×★ = ★+★+★+★. ★ (≠0)?",options:["2","3","4","5"],correct:2,timeLimit:30},
  {id:"A06",domain:"abstract",difficulty:0.5,question:"Pentagon + all diagonals. Triangles?",options:["5","8","10","35"],correct:2,timeLimit:45},
  {id:"A07",domain:"abstract",difficulty:0.55,question:"◆+◇=12, ◆-◇=4, ◆×●=24. ●=?",options:["2","3","4","6"],correct:1,timeLimit:35},
  {id:"A08",domain:"abstract",difficulty:0.6,question:"Rule: 1→1, 2→4, 3→9, 4→16, 5→?",options:["20","25","30","36"],correct:1,timeLimit:20},
  {id:"A09",domain:"abstract",difficulty:0.65,question:"Vowel=5, consonant=3. 'TABLE'=?",options:["17","19","21","23"],correct:1,timeLimit:25},
  {id:"A10",domain:"abstract",difficulty:0.7,question:"Climb 4 stairs (1 or 2 steps). Ways?",options:["3","4","5","8"],correct:2,timeLimit:40},
  {id:"A11",domain:"abstract",difficulty:0.75,question:"Swap exactly 2 digits in '123456789'. Configurations?",options:["36","72","81","362880"],correct:0,timeLimit:45},
  {id:"A12",domain:"abstract",difficulty:0.8,question:"Min colors for any planar map (adjacent ≠ color):",options:["3","4","5","6"],correct:1,timeLimit:30},
  {id:"A13",domain:"abstract",difficulty:0.85,question:"1, 11, 21, 1211, 111221... Next?",options:["312211","122211","112221","1112221"],correct:0,timeLimit:55},
  {id:"A14",domain:"abstract",difficulty:0.92,question:"f(x)=f(x-1)+f(x-2), f(1)=f(2)=1. f(10)?",options:["34","55","89","144"],correct:1,timeLimit:45},
];

const BANKS = { es: Q_ES, en: Q_EN };
const D_ICONS = { logic:"⚡", numerical:"∑", spatial:"◈", verbal:"✦", memory:"◎", abstract:"∞" };
const D_COLORS = { logic:"#D4A843", numerical:"#45B7AA", spatial:"#D45D5D", verbal:"#8B72CF", memory:"#2EBD7F", abstract:"#CF5E99" };
const QPD = 4;

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Outfit:wght@200;300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

button {
  outline: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

input {
  outline: none;
  border: none;
  font-family: inherit;
}

html,
body {
  min-height: 100%;
}

body {
  background: #08080C;
  color: #E2E0DB;
  font-family: 'Outfit', sans-serif;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%,100% { opacity: .4; }
  50% { opacity: 1; }
}

@keyframes slideWidth {
  from { width: 0%; }
}

@keyframes countUp {
  from { opacity: 0; transform: scale(.8); }
  to { opacity: 1; transform: scale(1); }
}

::selection {
  background: rgba(212,168,67,.3);
}
`;

function useInjectGlobalStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const existing = document.getElementById("nexusiq-global-styles");
    if (existing) return;

    const style = document.createElement("style");
    style.id = "nexusiq-global-styles";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);
}

function pickQs(bank) {
  const sel = [];
  ["logic","numerical","spatial","verbal","memory","abstract"].forEach(d => {
    const pool = bank.filter(q => q.domain === d).sort(() => Math.random() - 0.5);
    const e = pool.filter(q => q.difficulty < 0.5);
    const m = pool.filter(q => q.difficulty >= 0.5 && q.difficulty < 0.75);
    const h = pool.filter(q => q.difficulty >= 0.75);
    const p = [];
    if (e[0]) p.push(e[0]);
    if (m[0]) p.push(m[0]);
    if (h[0]) p.push(h[0]);
    const rem = pool.filter(q => !p.includes(q));
    while (p.length < QPD && rem.length) p.push(rem.shift());
    sel.push(...p);
  });
  return sel.sort((a, b) => a.difficulty - b.difficulty);
}

function calcIQ(res, qs) {
  if (!res.length) return null;

  let wC = 0;
  let tW = 0;
  let sB = 0;

  res.forEach(r => {
    const q = qs.find(x => x.id === r.id);
    if (!q) return;

    const w = 0.5 + q.difficulty * 2;
    tW += w;

    if (r.correct) {
      wC += w;
      const t = r.time / q.timeLimit;
      if (t < 0.25) sB += 0.18 * w;
      else if (t < 0.4) sB += 0.1 * w;
      else if (t < 0.6) sB += 0.04 * w;
    }
  });

  const raw = (wC + sB) / tW;
  const est = 65 + raw * 80;
  const se = 15 / Math.sqrt(res.length) * (1.1 + (1 - raw) * 0.4);
  const z = 1.282;

  const ds = {};
  ["logic","numerical","spatial","verbal","memory","abstract"].forEach(d => {
    const dr = res.filter(r => {
      const q = qs.find(x => x.id === r.id);
      return q && q.domain === d;
    });

    if (dr.length) {
      let dw = 0;
      let dt = 0;

      dr.forEach(r => {
        const q = qs.find(x => x.id === r.id);
        const w = 0.5 + q.difficulty * 2;
        dt += w;
        if (r.correct) dw += w;
      });

      ds[d] = Math.round((dw / dt) * 100);
    }
  });

  const str = Object.entries(ds).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k);
  const wk = Object.entries(ds).sort((a,b)=>a[1]-b[1]).slice(0,2).map(([k])=>k);

  return {
    estimate: Math.round(est),
    lower: Math.round(est - z * se),
    upper: Math.round(est + z * se),
    rawScore: Math.round(raw * 100),
    domainScores: ds,
    totalCorrect: res.filter(r => r.correct).length,
    totalQuestions: res.length,
    avgTime: Math.round(res.reduce((a,r)=>a+r.time,0) / res.length),
    strengths: str,
    weaknesses: wk,
  };
}

const iqLabel = (iq, t) => {
  const l = t.iqLabels;
  if (iq >= 145) return l.exceptional;
  if (iq >= 130) return l.superior;
  if (iq >= 115) return l.aboveAvg;
  if (iq >= 85) return l.average;
  if (iq >= 70) return l.belowAvg;
  return l.sigLow;
};

const pctl = (iq) =>
  Math.min(
    99,
    Math.max(
      1,
      Math.round(
        50 *
          (1 +
            Math.sign((iq - 100) / 15) *
              Math.sqrt(
                1 - Math.exp((-2 * ((iq - 100) / 15) ** 2) / Math.PI)
              ))
      )
    )
  );

export default function NexusIQ() {
  useInjectGlobalStyles();

  const [lang, setLang] = useState(null);
  const [phase, setPhase] = useState("lang");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [iqResult, setIqResult] = useState(null);
  const [showFB, setShowFB] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [pw, setPW] = useState(true);
  const [email, setEmail] = useState("");
  const [emailOk, setEmailOk] = useState(false);
  const [shareToken, setShareToken] = useState("");

  const timerR = useRef(null);
  const nextR = useRef(null);

  const t = lang ? i18n[lang] : i18n.es;
  const q = questions[currentQ];

  // Supabase ready — data saves automatically via saveAssessment in goNext

  useEffect(() => {
    if (phase === "test" && q) {
      setTimeLeft(q.timeLimit);
      setStartTime(Date.now());
      setSelected(null);
      setShowFB(false);
      setFadeIn(false);

      requestAnimationFrame(() => {
        setTimeout(() => setFadeIn(true), 30);
      });

      timerR.current = setInterval(() => {
        setTimeLeft((p) => {
          if (p <= 1) {
            clearInterval(timerR.current);
            return 0;
          }
          return p - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timerR.current);
        clearTimeout(nextR.current);
      };
    }
  }, [phase, currentQ, q]);

  useEffect(() => {
    if (phase === "test" && timeLeft === 0 && !showFB && q) {
      doTimeout();
    }
  }, [timeLeft, phase, showFB, q]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");

    if (paid === "1") {
      const savedResult = localStorage.getItem("nexusiq_result");
      const savedShareToken = localStorage.getItem("nexusiq_share_token");

      if (savedResult) {
        setIqResult(JSON.parse(savedResult));
        setShareToken(savedShareToken || "");
        setPW(false);
        setPhase("results");
      }
    }
  }, []);

  const saveAssessment = async (finalResult, finalAnswers) => {
    const generatedShareToken =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `share_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const payload = {
      // Core scores
      iq_score: finalResult.estimate,
      iq_lower: finalResult.lower,
      iq_upper: finalResult.upper,
      raw_score: finalResult.rawScore,
      percentile: pctl(finalResult.estimate),

      // Timing & accuracy
      avg_time: finalResult.avgTime,
      total_correct: finalResult.totalCorrect,
      total_questions: finalResult.totalQuestions,

      // Domain breakdown (queryable columns)
      domain_scores: finalResult.domainScores,
      strengths: finalResult.strengths,
      weaknesses: finalResult.weaknesses,

      // Full answer detail (for deep analysis later)
      answers_json: finalAnswers,

      // Metadata
      lang: lang || "es",
      email: email || null,
      share_token: generatedShareToken,
      paid: false,

      // Attribution / analytics
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    };

    const { data, error } = await supabase
      .from("assessments")
      .insert([payload])
      .select();

    console.log("[NexusIQ] Save result:", data ? "OK" : "FAILED", error || "");

    if (error) {
      throw error;
    }

    return generatedShareToken;
  };

  const doTimeout = () => {
    if (showFB || !q) return;

    const nr = {
      id: q.id,
      correct: false,
      time: q.timeLimit,
      timedOut: true,
    };

    setResults((p) => [...p, nr]);
    setShowFB(true);
    nextR.current = setTimeout(() => goNext([...results, nr]), 1400);
  };

  const doSelect = (idx) => {
    if (selected !== null || showFB || !q || !startTime) return;

    clearInterval(timerR.current);
    setSelected(idx);

    const el = Math.min((Date.now() - startTime) / 1000, q.timeLimit);
    const nr = {
      id: q.id,
      correct: idx === q.correct,
      time: el,
      timedOut: false,
    };

    setResults((p) => [...p, nr]);
    setShowFB(true);
    nextR.current = setTimeout(() => goNext([...results, nr]), 1100);
  };

  const goNext = (cr) => {
    if (currentQ + 1 >= questions.length) {
      setPhase("calculating");

      setTimeout(async () => {
        try {
          const finalResult = calcIQ(cr, questions);
          const generatedShareToken = await saveAssessment(finalResult, cr);

          setIqResult(finalResult);
          setShareToken(generatedShareToken);

          localStorage.setItem("nexusiq_result", JSON.stringify(finalResult));
          localStorage.setItem("nexusiq_share_token", generatedShareToken);

          setPhase("results");
        } catch (err) {
          console.error("Error saving assessment:", err);
          const finalResult = calcIQ(cr, questions);
          setIqResult(finalResult);
          localStorage.setItem("nexusiq_result", JSON.stringify(finalResult));
          setPhase("results");
        }
      }, 2200);
    } else {
      setCurrentQ((c) => c + 1);
    }
  };

  const startTest = () => {
    if (!lang) return;
    setQuestions(pickQs(BANKS[lang]));
    setCurrentQ(0);
    setResults([]);
    setIqResult(null);
    setShareToken("");
    setPW(true);
    setEmailOk(false);
    setEmail("");
    setPhase("test");
  };

  const handleShare = async () => {
    if (!iqResult) return;

    const sharePath = shareToken ? `/result/${shareToken}` : "";
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${sharePath}`
        : undefined;

    const txt = t.shareText(iqResult.estimate, iqResult.lower, iqResult.upper);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "NexusIQ",
          text: txt,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl || txt);
        alert("Copied to clipboard");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const tp = q ? (timeLeft / q.timeLimit) * 100 : 100;
  const tc = tp > 50 ? "#45B7AA" : tp > 20 ? "#D4A843" : "#D45D5D";

  const bg = {
    minHeight: "100vh",
    background: "#08080C",
    color: "#E2E0DB",
    fontFamily: "'Outfit',sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const gr = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 0,
    background:
      "radial-gradient(ellipse at 15% 50%,rgba(212,168,67,.04) 0%,transparent 60%),radial-gradient(ellipse at 85% 30%,rgba(69,183,170,.03) 0%,transparent 50%)",
  };

  const ct = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "48px 24px",
  };

  if (phase === "lang") {
    return (
      <div style={bg}>
        <div style={gr} />
        <div style={{ ...ct, animation: "fadeUp .8s ease-out" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "4px",
              color: "#D4A843",
              marginBottom: 48,
            }}
          >
            NEXUS<span style={{ color: "#45B7AA" }}>IQ</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(24px,5vw,36px)",
              fontFamily: "'Playfair Display',serif",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {i18n.es.selectLang}
          </h1>

          <p style={{ fontSize: 14, color: "#4A4840", marginBottom: 48 }}>
            Select your language
          </p>

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { c: "es", f: "🇪🇸", l: "Español", s: "Spanish" },
              { c: "en", f: "🇬🇧", l: "English", s: "Inglés" },
            ].map((x) => (
              <button
                key={x.c}
                onClick={() => {
                  setLang(x.c);
                  setPhase("landing");
                }}
                style={{
                  width: 180,
                  padding: "32px 24px",
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 14,
                  color: "#E2E0DB",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  transition: "all .3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.05)";
                  e.currentTarget.style.borderColor = "rgba(212,168,67,.3)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span style={{ fontSize: 40 }}>{x.f}</span>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{x.l}</span>
                <span style={{ fontSize: 12, color: "#4A4840" }}>{x.s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "landing") {
    return (
      <div style={bg}>
        <div style={gr} />
        <div style={{ ...ct, animation: "fadeUp .9s ease-out" }}>
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 32,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "4px",
              color: "#D4A843",
            }}
          >
            {t.brand}
            <span style={{ color: "#45B7AA" }}>{t.brandAccent}</span>
          </div>

          <button
            onClick={() => setPhase("lang")}
            style={{
              position: "absolute",
              top: 28,
              right: 32,
              fontSize: 12,
              color: "#4A4840",
              background: "rgba(255,255,255,.03)",
              padding: "6px 14px",
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            {lang === "es" ? "🇪🇸 ES" : "🇬🇧 EN"}
          </button>

          <div
            style={{
              fontSize: 11,
              letterSpacing: "8px",
              textTransform: "uppercase",
              color: "#45B7AA",
              fontWeight: 400,
              marginBottom: 28,
              opacity: 0.8,
            }}
          >
            {t.tagline}
          </div>

          <h1
            style={{
              fontSize: "clamp(38px,7vw,64px)",
              fontFamily: "'Playfair Display',serif",
              fontWeight: 300,
              textAlign: "center",
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
              margin: "0 0 20px",
              maxWidth: 700,
            }}
          >
            {t.heroTitle1}
            <br />
            <span
              style={{
                fontWeight: 600,
                background: "linear-gradient(135deg,#D4A843,#E8C96A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.heroTitle2}
            </span>
          </h1>

          <p
            style={{
              maxWidth: 480,
              textAlign: "center",
              fontSize: 15,
              lineHeight: 1.75,
              color: "#7A786F",
              fontWeight: 300,
              margin: "0 0 44px",
            }}
          >
            {t.heroDesc}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
              maxWidth: 440,
              width: "100%",
              marginBottom: 44,
            }}
          >
            {Object.keys(D_COLORS).map((k, i) => (
              <div
                key={k}
                style={{
                  padding: "14px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.05)",
                  textAlign: "center",
                  animation: `fadeUp .6s ease-out ${0.1 + i * 0.08}s both`,
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 6, opacity: 0.7 }}>
                  {D_ICONS[k]}
                </div>
                <div
                  style={{
                    fontSize: "10.5px",
                    color: "#7A786F",
                    fontWeight: 400,
                  }}
                >
                  {t.domains[k]}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              alignItems: "center",
              color: "#4A4840",
              fontSize: 12,
              fontWeight: 300,
              marginBottom: 36,
            }}
          >
            <span>⏱ {t.time}</span>
            <span style={{ width: 1, height: 14, background: "#1E1E24" }} />
            <span>{t.questions}</span>
            <span style={{ width: 1, height: 14, background: "#1E1E24" }} />
            <span>{t.timed}</span>
          </div>

          <button
            onClick={startTest}
            style={{
              padding: "18px 56px",
              fontSize: 14,
              fontWeight: 500,
              background: "linear-gradient(135deg,#D4A843,#C49530)",
              color: "#08080C",
              borderRadius: 6,
              letterSpacing: "3px",
              textTransform: "uppercase",
              transition: "all .35s",
              boxShadow: "0 4px 24px rgba(212,168,67,.2)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 32px rgba(212,168,67,.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 24px rgba(212,168,67,.2)";
            }}
          >
            {t.startBtn}
          </button>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex" }}>
              {[1,2,3,4,5].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: `hsl(${i * 50 + 20},30%,${25 + i * 5}%)`,
                    border: "2px solid #08080C",
                    marginLeft: i > 1 ? -8 : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#AAA",
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#4A4840" }}>
              {t.socialProof}
            </span>
          </div>

          <p
            style={{
              position: "absolute",
              bottom: 20,
              fontSize: 10,
              color: "#1E1E24",
              textAlign: "center",
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            {t.disclaimer}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "test" && q) {
    return (
      <div style={bg}>
        <div style={gr} />

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "#12121A",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg,#45B7AA,#D4A843)",
              width: `${(currentQ / questions.length) * 100}%`,
              transition: "width .5s",
            }}
          />
        </div>

        <div style={{ ...ct, justifyContent: "flex-start", paddingTop: 48 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 600,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: D_COLORS[q.domain],
                letterSpacing: "3px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>{D_ICONS[q.domain]}</span>
              {t.domains[q.domain]}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#4A4840",
                fontFamily: "'IBM Plex Mono',monospace",
                fontWeight: 300,
              }}
            >
              {currentQ + 1}
              <span style={{ opacity: 0.3 }}> / </span>
              {questions.length}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 600,
              height: 2,
              background: "#12121A",
              borderRadius: 1,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: "100%",
                background: tc,
                borderRadius: 1,
                width: `${tp}%`,
                transition: "width 1s linear,background .5s",
              }}
            />
          </div>

          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: tc,
              marginBottom: 40,
              fontWeight: 300,
              opacity: 0.6,
            }}
          >
            {timeLeft}s
          </div>

          <div
            style={{
              maxWidth: 600,
              width: "100%",
              opacity: fadeIn ? 1 : 0,
              transform: fadeIn ? "translateY(0)" : "translateY(20px)",
              transition: "all .45s",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,.015)",
                border: "1px solid rgba(255,255,255,.04)",
                borderRadius: 14,
                padding: "36px 32px",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(18px,3vw,22px)",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: "#E2E0DB",
                  textAlign: "center",
                }}
              >
                {q.question}
              </h2>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {q.options.map((opt, idx) => {
                let ob = "rgba(255,255,255,.02)";
                let oB = "1px solid rgba(255,255,255,.05)";
                let oC = "#B8B6B0";

                if (showFB) {
                  if (idx === q.correct) {
                    ob = "rgba(46,189,127,.12)";
                    oB = "1px solid rgba(46,189,127,.4)";
                    oC = "#2EBD7F";
                  } else if (idx === selected) {
                    ob = "rgba(212,93,93,.12)";
                    oB = "1px solid rgba(212,93,93,.4)";
                    oC = "#D45D5D";
                  }
                } else if (selected === idx) {
                  ob = "rgba(212,168,67,.08)";
                  oB = "1px solid rgba(212,168,67,.3)";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => doSelect(idx)}
                    style={{
                      padding: "16px 22px",
                      background: ob,
                      border: oB,
                      borderRadius: 10,
                      color: oC,
                      fontSize: 15,
                      fontWeight: 400,
                      textAlign: "left",
                      transition: "all .2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: showFB ? "default" : "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: 11,
                        color: "#4A4840",
                        minWidth: 18,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {showFB && selected === null && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: "#D45D5D",
                  fontSize: 13,
                  animation: "fadeIn .3s",
                  fontWeight: 300,
                }}
              >
                {t.timeUp}
              </div>
            )}
          </div>

          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 5,
              alignItems: "center",
            }}
          >
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background:
                    i <= Math.ceil(q.difficulty * 5) ? "#D4A843" : "#1E1E24",
                  transition: "background .3s",
                }}
              />
            ))}
            <span style={{ fontSize: 10, color: "#1E1E24", marginLeft: 6 }}>
              {t.difficulty}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "calculating") {
    return (
      <div style={bg}>
        <div style={gr} />
        <div style={{ ...ct, animation: "fadeIn .5s" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "2px solid #1E1E24",
              borderTopColor: "#D4A843",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              marginTop: 28,
              color: "#4A4840",
              fontSize: 12,
              letterSpacing: "4px",
              fontWeight: 300,
            }}
          >
            {t.analyzing}
          </p>

          <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
            {[0, 0.3, 0.6].map((d, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#D4A843",
                  animation: `pulse 1.2s ease-in-out ${d}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" && iqResult) {
    const pc = pctl(iqResult.estimate);

    return (
      <div style={bg}>
        <div style={gr} />
        <div style={{ ...ct, justifyContent: "flex-start", paddingTop: 48 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "4px",
              color: "#D4A843",
              marginBottom: 36,
            }}
          >
            {t.brand}
            <span style={{ color: "#45B7AA" }}>{t.brandAccent}</span> — {t.results}
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: 12,
              animation: "countUp .8s ease-out",
            }}
          >
            <div
              style={{
                fontSize: "clamp(72px,14vw,108px)",
                fontFamily: "'Playfair Display',serif",
                fontWeight: 300,
                lineHeight: 1,
                background: "linear-gradient(180deg,#D4A843 20%,#8B6914 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-4px",
              }}
            >
              {iqResult.estimate}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#7A786F",
                fontWeight: 300,
                marginTop: 6,
                letterSpacing: "1px",
              }}
            >
              {t.iqEstimated}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.02)",
              border: "1px solid rgba(255,255,255,.05)",
              borderRadius: 10,
              padding: "18px 36px",
              marginBottom: 32,
              textAlign: "center",
              animation: "fadeUp .6s ease-out .3s both",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 22,
                fontWeight: 400,
                color: "#E2E0DB",
                letterSpacing: "2px",
              }}
            >
              {iqResult.lower} — {iqResult.upper}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#4A4840",
                marginTop: 6,
                letterSpacing: "2px",
              }}
            >
              {t.confidenceInterval}
            </div>
          </div>

          <div
            style={{
              maxWidth: 520,
              width: "100%",
              marginBottom: 32,
              animation: "fadeUp .6s ease-out .5s both",
            }}
          >
            <svg viewBox="0 0 520 110" style={{ width: "100%", height: "auto" }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#45B7AA" stopOpacity=".15" />
                  <stop offset="100%" stopColor="#45B7AA" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A843" stopOpacity=".25" />
                  <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d={(() => {
                  let p = "M 0 100";
                  for (let x = 0; x <= 520; x += 2) {
                    const iq = 40 + (x / 520) * 120;
                    const z = (iq - 100) / 15;
                    p += ` L ${x} ${100 - Math.exp(-0.5 * z * z) * 88}`;
                  }
                  return p + " L 520 100 Z";
                })()}
                fill="url(#cg)"
                stroke="rgba(69,183,170,.25)"
                strokeWidth="1"
              />

              <path
                d={(() => {
                  const ix = (iq) => Math.max(0, Math.min(520, ((iq - 40) / 120) * 520));
                  let p = `M ${ix(iqResult.lower)} 100`;
                  for (let x = ix(iqResult.lower); x <= ix(iqResult.upper); x += 2) {
                    const iq = 40 + (x / 520) * 120;
                    const z = (iq - 100) / 15;
                    p += ` L ${x} ${100 - Math.exp(-0.5 * z * z) * 88}`;
                  }
                  return p + ` L ${ix(iqResult.upper)} 100 Z`;
                })()}
                fill="url(#hg)"
                stroke="rgba(212,168,67,.5)"
                strokeWidth="1"
              />

              {(() => {
                const ex = ((iqResult.estimate - 40) / 120) * 520;
                const z = (iqResult.estimate - 100) / 15;
                return (
                  <line
                    x1={ex}
                    y1={100 - Math.exp(-0.5 * z * z) * 88 - 4}
                    x2={ex}
                    y2={100}
                    stroke="#D4A843"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                );
              })()}

              {[55,70,85,100,115,130,145].map((iq) => (
                <text
                  key={iq}
                  x={((iq - 40) / 120) * 520}
                  y={109}
                  fill={iq === 100 ? "#5A5850" : "#2A2A30"}
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono"
                >
                  {iq}
                </text>
              ))}
            </svg>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              maxWidth: 460,
              width: "100%",
              marginBottom: 36,
              animation: "fadeUp .6s ease-out .6s both",
            }}
          >
            {[
              { l: t.classification, v: iqLabel(iqResult.estimate, t), m: false },
              { l: t.percentile, v: `${pc}%`, m: true },
              { l: t.correct, v: `${iqResult.totalCorrect}/${iqResult.totalQuestions}`, m: true },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "16px 12px",
                  background: "rgba(255,255,255,.02)",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,.04)",
                }}
              >
                <div
                  style={{
                    fontSize: s.m ? 18 : 14,
                    fontWeight: 500,
                    color: "#E2E0DB",
                    marginBottom: 4,
                    fontFamily: s.m ? "'IBM Plex Mono',monospace" : "inherit",
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#4A4840",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {pw ? (
            <div style={{ maxWidth: 480, width: "100%", animation: "fadeUp .6s ease-out .8s both" }}>
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
                <div
                  style={{
                    filter: "blur(8px)",
                    opacity: 0.4,
                    pointerEvents: "none",
                    padding: 24,
                    background: "rgba(255,255,255,.02)",
                    border: "1px solid rgba(255,255,255,.04)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#4A4840", marginBottom: 16, letterSpacing: "3px" }}>
                    {t.domainPerf.toUpperCase()}
                  </div>

                  {Object.keys(D_COLORS).map((k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 100, fontSize: 11, color: "#666" }}>{t.domains[k]}</div>
                      <div style={{ flex: 1, height: 6, background: "#1A1A1F", borderRadius: 3 }}>
                        <div
                          style={{
                            width: `${40 + Math.random() * 50}%`,
                            height: "100%",
                            background: D_COLORS[k],
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 20, fontSize: 13, color: "#666", lineHeight: 1.7 }}>
                    Lorem ipsum dolor sit amet consectetur...
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(8,8,12,.7)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 12 }}>🔒</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontFamily: "'Playfair Display',serif",
                      fontWeight: 500,
                      color: "#E2E0DB",
                      marginBottom: 8,
                    }}
                  >
                    {t.fullReport}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#7A786F",
                      textAlign: "center",
                      maxWidth: 280,
                      lineHeight: 1.6,
                      marginBottom: 20,
                    }}
                  >
                    {t.fullReportDesc}
                  </div>

                  <button
                    onClick={() => {
                      window.location.href = "https://buy.stripe.com/eVqdR9a1a2U36asfcC63K00";
                    }}
                    style={{
                      padding: "12px 28px",
                      fontSize: 13,
                      fontWeight: 500,
                      background: "linear-gradient(135deg,#D4A843,#C49530)",
                      color: "#08080C",
                      borderRadius: 6,
                      letterSpacing: "1px",
                      transition: "transform .2s",
                    }}
                  >
                    {t.unlock}
                  </button>

                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#4A4840", marginBottom: 8 }}>
                      {t.emailAlt}
                    </div>

                    {!emailOk ? (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <input
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && email.includes("@")) {
                              setEmailOk(true);

                              if (shareToken) {
                                console.log("SHARE TOKEN:", shareToken);

                                const { data, error } = await supabase
                                  .from("assessments")
                                  .update({ email })
                                  .eq("share_token", shareToken)
                                  .select()
                                  .single();

                                if (error) {
                                  console.error("Supabase error:", error);
                                } else {
                                  console.log("ASSESSMENT:", data);
                                  console.log("ASSESSMENT ID:", data?.id);
                                }
                              }
                            }
                          }}
                          style={{
                            padding: "8px 14px",
                            fontSize: 13,
                            background: "rgba(255,255,255,.05)",
                            border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: 5,
                            color: "#E2E0DB",
                            width: 200,
                          }}
                        />
                        <button
                          onClick={() => {
                            if (email.includes("@")) {
                              setEmailOk(true);
                              if (shareToken) {
                                supabase.from("assessments").update({ email }).eq("share_token", shareToken)
                                  .then(({ error }) => { if (error) console.error("[NexusIQ] Email update error:", error); });
                              }
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            fontSize: 12,
                            background: "rgba(69,183,170,.15)",
                            border: "1px solid rgba(69,183,170,.3)",
                            borderRadius: 5,
                            color: "#45B7AA",
                            fontWeight: 500,
                          }}
                        >
                          {t.send}
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#45B7AA" }}>{t.emailSent}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 480, width: "100%", animation: "fadeUp .6s ease-out" }}>
              <div
                style={{
                  padding: 24,
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.04)",
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#4A4840",
                    marginBottom: 18,
                  }}
                >
                  {t.domainPerf}
                </div>

                {Object.entries(iqResult.domainScores).map(([k, s]) => (
                  <div
                    key={k}
                    style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}
                  >
                    <div style={{ width: 110, fontSize: 11, color: "#7A786F", textAlign: "right" }}>
                      {t.domains[k]}
                    </div>
                    <div style={{ flex: 1, height: 6, background: "#12121A", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${s}%`,
                          background: D_COLORS[k],
                          borderRadius: 3,
                          animation: "slideWidth 1s ease-out",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: 36,
                        fontSize: 12,
                        color: "#4A4840",
                        fontFamily: "'IBM Plex Mono',monospace",
                      }}
                    >
                      {s}%
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    padding: 18,
                    background: "rgba(46,189,127,.04)",
                    border: "1px solid rgba(46,189,127,.1)",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: 10, color: "#2EBD7F", letterSpacing: "2px", marginBottom: 10 }}>
                    {t.strengths}
                  </div>
                  {iqResult.strengths.map((s) => (
                    <div key={s} style={{ fontSize: 12, color: "#B8B6B0", marginBottom: 4 }}>
                      {D_ICONS[s]} {t.domains[s]}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: 18,
                    background: "rgba(212,93,93,.04)",
                    border: "1px solid rgba(212,93,93,.1)",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: 10, color: "#D45D5D", letterSpacing: "2px", marginBottom: 10 }}>
                    {t.areasImprove}
                  </div>
                  {iqResult.weaknesses.map((w) => (
                    <div key={w} style={{ fontSize: 12, color: "#B8B6B0", marginBottom: 4 }}>
                      {D_ICONS[w]} {t.domains[w]}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: 22,
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.04)",
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: "3px", color: "#4A4840", marginBottom: 10 }}>
                  {t.interpretation}
                </div>
                <p style={{ fontSize: 13.5, color: "#7A786F", lineHeight: 1.75, fontWeight: 300 }}>
                  {t.interpretText(
                    iqResult.lower,
                    iqResult.upper,
                    pc,
                    iqResult.avgTime < 18,
                    t.domains[iqResult.strengths[0]]?.toLowerCase(),
                    t.domains[iqResult.weaknesses[0]]?.toLowerCase()
                  )}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { l: t.avgTime, v: `${iqResult.avgTime}s` },
                  { l: t.rawScore, v: `${iqResult.rawScore}%` },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      textAlign: "center",
                      background: "rgba(255,255,255,.02)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,.03)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontWeight: 400,
                        color: "#E2E0DB",
                      }}
                    >
                      {s.v}
                    </div>
                    <div style={{ fontSize: 10, color: "#4A4840", letterSpacing: "1px", marginTop: 2 }}>
                      {s.l.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeUp .6s ease-out 1s both",
            }}
          >
            <button
              onClick={handleShare}
              style={{
                padding: "12px 24px",
                fontSize: 12,
                fontWeight: 500,
                background: "rgba(69,183,170,.1)",
                color: "#45B7AA",
                border: "1px solid rgba(69,183,170,.2)",
                borderRadius: 6,
                letterSpacing: "1.5px",
              }}
            >
              {t.share}
            </button>

            <button
              onClick={startTest}
              style={{
                padding: "12px 24px",
                fontSize: 12,
                fontWeight: 500,
                background: "transparent",
                color: "#4A4840",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 6,
                letterSpacing: "1.5px",
              }}
            >
              {t.retry}
            </button>
          </div>

          <p
            style={{
              marginTop: 48,
              fontSize: 10,
              color: "#1E1E24",
              textAlign: "center",
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            {t.footerDisclaimer}
          </p>
        </div>
      </div>
    );
  }

  return null;
}