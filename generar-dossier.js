const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType } = require("docx");
const fs = require("fs");
const path = require("path");

const W = 9360;
const border = { style: BorderStyle.SINGLE, size: 4, color: "8AA399" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerShade = { type: ShadingType.CLEAR, fill: "0F766E" };
const altShade = { type: ShadingType.CLEAR, fill: "EEF6F2" };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts.size || 22,
        bold: !!opts.bold,
        italics: !!opts.italics,
        color: opts.color,
      }),
    ],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, font: "Calibri", size: 28, bold: true, color: "0B4F49" })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, font: "Calibri", size: 24, bold: true, color: "0F766E" })],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.w || 2340, type: WidthType.DXA },
    shading: opts.header ? headerShade : opts.alt ? altShade : undefined,
    children: [
      new Paragraph({
        spacing: { after: 40, before: 40 },
        children: [
          new TextRun({
            text,
            font: "Calibri",
            size: opts.size || 18,
            bold: !!opts.bold || !!opts.header,
            color: opts.header ? "FFFFFF" : "173028",
          }),
        ],
      }),
    ],
  });
}

function table(headers, rows, widths) {
  const ws = widths || headers.map(() => Math.floor(W / headers.length));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: ws,
    rows: [
      new TableRow({
        children: headers.map((h, i) => cell(h, { header: true, w: ws[i], bold: true })),
      }),
      ...rows.map((r, ri) =>
        new TableRow({
          children: r.map((c, i) => cell(String(c), { w: ws[i], alt: ri % 2 === 1 })),
        })
      ),
    ],
  });
}

function mono(lines) {
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: line, font: "Consolas", size: 16, color: "173028" })],
      })
  );
}

const doc = new Document({
  styles: {
    default: {
      document: {
        styles: [
          // noop placeholder for structure
        ],
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: [
        p("UNIVERSIDAD DE LA GUAJIRA — Facultad de Ingeniería", { bold: true, size: 20, align: AlignmentType.CENTER }),
        p("Algoritmos y Programación | 2026-II", { size: 20, align: AlignmentType.CENTER }),
        p("Dossier de diseño lógico — Entrega 1 (E1–E8)", { bold: true, size: 26, align: AlignmentType.CENTER, after: 80 }),
        p("GeoCalor: Energía geotérmica y bombas de calor", { size: 22, align: AlignmentType.CENTER }),
        p("Estudiante: Julio Jorge Palmezano Mejía  |  jjorgepalmezano@uniguajira.edu.co", { size: 20, align: AlignmentType.CENTER }),
        p("Carpeta: Palmezano_Julio_Geotermia  |  Versión: v01_Logica", { size: 18, align: AlignmentType.CENTER, after: 200 }),

        h1("E1. Ficha del problema"),
        p("Nombre de la app: GeoCalor"),
        p("Tema asignado: Energía geotérmica y bombas de calor (N.° 13)."),
        p("Usuario: estudiante o ciudadano que quiere entender cómo una bomba de calor geotérmica reduce el consumo eléctrico frente a climatización convencional."),
        p("Pregunta que responde: ¿Cuánta electricidad consume una bomba geotérmica frente a un sistema convencional para la misma demanda térmica?"),
        p("Objetivo: relacionar demanda térmica (Q) y COP con el consumo eléctrico (P), validar COP > 0 y comparar escenarios bajo iguales condiciones."),
        p("Alcance inicial: cálculo puntual P = Q / COP; comparación geotérmica vs convencional; horas/día para energía diaria; esquema animado del intercambio térmico."),
        p("Lo que NO simula: dimensionamiento de sondeos, pérdidas del terreno a largo plazo, tarifas económicas, dinámica transitoria del suelo ni refrigerante real del ciclo."),

        h1("E2. Proceso energético"),
        p("Diagrama A — sistema energético (entradas → transformaciones → salidas):"),
        ...mono([
          "[Terreno T° estable] --calor--> [Intercambiador / lazo] --fluido--> [Bomba de calor]",
          "                                                      |",
          "                                         electricidad (P)",
          "                                                      |",
          "                                                      v",
          "[Demanda del edificio Q] <----- calor útil (Q = COP * P) ----+",
          "",
          "Comparación paralela (misma Q):",
          "[Sistema convencional COP_c] → P_c = Q / COP_c",
          "[Sistema geotérmico COP_g]   → P_g = Q / COP_g",
          "Ahorro = P_c - P_g   (si ambos COP > 0)",
        ]),
        p("Flechas: calor del terreno (entrada gratuita relativa), electricidad (entrada costosa), calor útil al edificio (salida), y rama de comparación con A/C o resistencia."),

        h1("E3. Datos y variables"),
        table(
          ["Nombre", "Tipo", "Unidad", "Rango", "Origen / significado"],
          [
            ["Q / demanda", "entrada numérica", "kW", "1–20", "Demanda térmica del edificio"],
            ["COP_g", "entrada numérica", "adim.", "0–6 (válido >0)", "Rendimiento bomba geotérmica"],
            ["COP_c", "entrada numérica", "adim.", "0–4 (válido >0)", "Rendimiento sistema convencional"],
            ["horas", "entrada numérica", "h/día", "1–24", "Tiempo de operación diario"],
            ["T_terreno", "entrada numérica", "°C", "8–28", "Temperatura del suelo (didáctica)"],
            ["escenario", "entrada categórica", "—", "calef./refrig.", "Dirección del flujo de calor"],
            ["P_g", "calculada", "kW", ">0 si válido", "P_g = Q / COP_g"],
            ["P_c", "calculada", "kW", ">0 si válido", "P_c = Q / COP_c"],
            ["ahorro", "calculada", "kW y %", "—", "P_c − P_g"],
            ["E_dia", "calculada", "kWh/día", "—", "P_g × horas"],
            ["valido", "estado booleano", "—", "true/false", "Ambos COP > 0 y Q > 0"],
          ],
          [1600, 1400, 1100, 1800, 3460]
        ),

        h1("E4. Modelo y reglas"),
        p("Fórmula principal: P = Q / COP"),
        p("Reglas de decisión:"),
        p("1) Si Q ≤ 0 → error: demanda inválida; no calcular."),
        p("2) Si COP_g ≤ 0 o COP_c ≤ 0 → error: COP debe ser positivo (evita división por cero o sentido físico nulo)."),
        p("3) Si ambos válidos → calcular P_g, P_c, ahorro = P_c − P_g, E_dia = P_g × horas."),
        p("4) Escenario solo afecta la animación/dirección del flujo (didáctico), no cambia la fórmula de potencia en este alcance."),
        p("Supuestos: COP constante; misma Q en ambos sistemas; sin pérdidas de distribución; T_terreno no modifica aún el COP (ampliable después)."),

        h1("E5. Algoritmo completo"),
        h2("Pseudocódigo"),
        ...mono([
          "INICIO",
          "  LEER Q, COP_g, COP_c, horas, T_terreno, escenario",
          "  SI Q <= 0 ENTONCES",
          "    MOSTRAR \"Q debe ser > 0\"",
          "    FIN",
          "  FIN SI",
          "  SI COP_g <= 0 O COP_c <= 0 ENTONCES",
          "    MOSTRAR \"COP debe ser > 0\"",
          "    DETENER animación",
          "    FIN",
          "  FIN SI",
          "  P_g <- Q / COP_g",
          "  P_c <- Q / COP_c",
          "  ahorro <- P_c - P_g",
          "  E_dia <- P_g * horas",
          "  MOSTRAR P_g, P_c, ahorro, E_dia",
          "  ACTUALIZAR gráfica y partículas según escenario y Q",
          "  PARA cada partícula en el lazo HACER",
          "    avanzar posición según dirección (calefacción/refrigeración)",
          "  FIN PARA",
          "FIN",
        ]),
        h2("Diagrama B — algoritmo (bloques)"),
        ...mono([
          "[B1 Inicio]",
          "   |",
          "[B2 Leer entradas: Q, COP_g, COP_c, horas, T, escenario]",
          "   |",
          "[B3 ¿Q > 0?] --No--> [B3a Mostrar error Q] --> [B9 Fin]",
          "   |Sí",
          "[B4 ¿COP_g > 0 Y COP_c > 0?] --No--> [B4a Error COP / detener flujo] --> [B9 Fin]",
          "   |Sí",
          "[B5 P_g <- Q/COP_g ; P_c <- Q/COP_c]",
          "   |",
          "[B6 ahorro <- P_c-P_g ; E_dia <- P_g*horas]",
          "   |",
          "[B7 Mostrar resultados y actualizar barras]",
          "   |",
          "[B8 Mientras la app esté abierta: animar partículas del lazo]",
          "   |",
          "[B9 Fin / espera nuevo cambio de control]",
        ]),
        p("Estructuras evidenciadas: secuencia (B2→B7), selección (B3, B4), repetición (B8 animación / re-cálculo al cambiar controles)."),

        h1("E6. Comprobación (pruebas de escritorio)"),
        h2("Caso 1 — Normal"),
        p("Q=10 kW, COP_g=4, COP_c=1, horas=8 → P_g=2.5 kW, P_c=10 kW, ahorro=7.5 kW (75%), E_dia=20 kWh."),
        h2("Caso 2 — Otra rama (refrigeración)"),
        p("Mismos números, escenario=refrigeración → mismos P_g/P_c (fórmula igual); cambia solo dirección visual del flujo."),
        h2("Caso 3 — Límite"),
        p("Q=1 kW, COP_g=0.1, COP_c=0.1 → P_g=10 kW, P_c=10 kW, ahorro=0. COP mínimo positivo permitido por validación (>0)."),
        h2("Caso 4 — Inválido"),
        p("Q=8 kW, COP_g=0, COP_c=1 → no calcula; mensaje “COP debe ser > 0”; barras en cero; animación detenida."),
        h2("Traza manual del caso 1"),
        table(
          ["Paso", "Operación", "Valor"],
          [
            ["1", "Leer Q", "10"],
            ["2", "¿Q>0?", "Sí"],
            ["3", "Leer COP_g, COP_c", "4 y 1"],
            ["4", "¿ambos >0?", "Sí"],
            ["5", "P_g = 10/4", "2.5"],
            ["6", "P_c = 10/1", "10"],
            ["7", "ahorro = 10-2.5", "7.5"],
            ["8", "E_dia = 2.5*8", "20"],
          ],
          [1200, 4160, 4000]
        ),

        h1("E7. Boceto de interfaz"),
        p("Pantalla única sin scroll (escritorio): tres columnas."),
        p("Izquierda — controles: deslizadores Q, COP_g, COP_c, horas, T_terreno; selector calefacción/refrigeración; KPI P_g, P_c, ahorro, kWh/día; mensaje de validación."),
        p("Centro — canvas animado del edificio, bomba, lazo al terreno y bloque convencional."),
        p("Derecha — barras de consumo comparado + reto (10÷4) + detalles de conceptos/créditos."),
        p("Relación control→variable: cada slider escribe su variable; cada KPI muestra una salida de B5–B6; el canvas refleja estado válido y escenario."),

        h1("E8. Bitácora y fuentes"),
        p("Avances: se descartó el backend de riego solar (tema incorrecto). Se construyó GeoCalor en HTML/CSS/JS con foco P=Q/COP, validación COP>0, comparación bajo misma Q, animación realtime y layout compacto."),
        p("Dudas: en ampliaciones futuras, ¿cómo acoplar T_terreno al COP (curva empírica) sin perder trazabilidad del algoritmo?"),
        p("Siguiente paso: sustentar diagrama B y traza del caso 1; luego ampliar con sensibilidad de COP vs temperatura."),
        p("Apoyo de IA: usada para estructurar la app y el dossier; fórmulas y pruebas comprobadas manualmente (caso 10/4=2.5)."),
        p("Fuentes técnicas:"),
        p("1) Servicio Geológico Colombiano. Geotermia y su exploración en Colombia. (definición y usos de geotermia / bombas de calor)."),
        p("2) Directiva (UE) 2018/2001 relativa al fomento del uso de energía procedente de fuentes renovables — marco de bombas de calor y energía geotérmica."),

        p("Fin del dossier v01_Logica — Julio Jorge Palmezano Mejía", { bold: true, after: 40, before: 240 }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = path.join(__dirname, "v01_Logica_Dossier_E1-E8.docx");
  fs.writeFileSync(out, buffer);
  console.log("OK", out);
});
