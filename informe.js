/**
 * Genera el informe DOCX (datos + resultados + gráfica de barras).
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  ShadingType,
} from "https://esm.sh/docx@9.1.0";

const W = 9000;
const border = { style: BorderStyle.SINGLE, size: 4, color: "8AA399" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.w || 4500, type: WidthType.DXA },
    shading: opts.header
      ? { type: ShadingType.CLEAR, fill: "0F766E" }
      : opts.alt
        ? { type: ShadingType.CLEAR, fill: "EEF6F2" }
        : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text),
            font: "Calibri",
            size: 20,
            bold: !!opts.header || !!opts.bold,
            color: opts.header ? "FFFFFF" : "173028",
          }),
        ],
      }),
    ],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts.size || 22,
        bold: !!opts.bold,
        color: opts.color || "173028",
      }),
    ],
  });
}

/** Dibuja gráfica de barras P_geo vs P_conv → PNG base64 (sin prefijo) */
export function crearGraficaPngBase64(consumoGeo, consumoConv) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, 720, 360);

  ctx.fillStyle = "#173028";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("Comparación de consumo eléctrico (misma Q)", 24, 36);

  const max = Math.max(consumoGeo, consumoConv, 0.01);
  const baseY = 300;
  const hGeo = Math.max(8, (consumoGeo / max) * 200);
  const hConv = Math.max(8, (consumoConv / max) * 200);

  // Geo
  ctx.fillStyle = "#0f766e";
  ctx.fillRect(160, baseY - hGeo, 120, hGeo);
  ctx.fillStyle = "#173028";
  ctx.font = "16px sans-serif";
  ctx.fillText("Geotérmica", 165, baseY + 24);
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(consumoGeo.toFixed(2) + " kW", 168, baseY - hGeo - 10);

  // Conv
  ctx.fillStyle = "#475569";
  ctx.fillRect(420, baseY - hConv, 120, hConv);
  ctx.fillStyle = "#173028";
  ctx.font = "16px sans-serif";
  ctx.fillText("Convencional", 415, baseY + 24);
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(consumoConv.toFixed(2) + " kW", 428, baseY - hConv - 10);

  ctx.strokeStyle = "#c9d5cc";
  ctx.beginPath();
  ctx.moveTo(40, baseY);
  ctx.lineTo(680, baseY);
  ctx.stroke();

  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.split(",")[1];
}

function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * @param {object} data
 * @returns {Promise<{ base64: string, nombreArchivo: string }>}
 */
export async function generarInformeDocx(data) {
  const chartB64 = crearGraficaPngBase64(data.consumoGeo, data.consumoConv);
  const chartBytes = base64ToUint8Array(chartB64);

  const rows = [
    ["Participante", data.nombre],
    ["Correo", data.correo],
    ["Escenario", data.escenario === "calefaccion" ? "Calefacción" : "Refrigeración"],
    ["Demanda térmica Q", data.demanda.toFixed(2) + " kW"],
    ["COP geotérmica", data.copGeo.toFixed(2)],
    ["COP convencional", data.copConv.toFixed(2)],
    ["Horas / día", String(data.horas)],
    ["Temp. terreno", data.tempTerreno + " °C"],
    ["Consumo geotérmico P_geo", data.consumoGeo.toFixed(2) + " kW"],
    ["Consumo convencional P_conv", data.consumoConv.toFixed(2) + " kW"],
    ["Ahorro", data.ahorro.toFixed(2) + " kW (" + data.ahorroPct.toFixed(0) + "%)"],
    ["Energía diaria", data.energiaDia.toFixed(2) + " kWh"],
    ["Fecha", data.fecha],
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        children: [
          p("GeoCalor — Informe de simulación", {
            bold: true,
            size: 32,
            color: "0B4F49",
            align: AlignmentType.CENTER,
          }),
          p("Energía geotérmica y bombas de calor", {
            size: 22,
            align: AlignmentType.CENTER,
            after: 200,
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "1. Identificación",
                font: "Calibri",
                size: 26,
                bold: true,
                color: "0F766E",
              }),
            ],
          }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [3600, 5400],
            rows: rows.slice(0, 3).map(
              (r, i) =>
                new TableRow({
                  children: [
                    cell(r[0], { w: 3600, bold: true, alt: i % 2 === 1 }),
                    cell(r[1], { w: 5400, alt: i % 2 === 1 }),
                  ],
                })
            ),
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "2. Parámetros y resultados",
                font: "Calibri",
                size: 26,
                bold: true,
                color: "0F766E",
              }),
            ],
          }),
          p("Modelo: P_el = Q ÷ COP  |  Validación: COP > 0  |  Misma Q en ambos sistemas."),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [3600, 5400],
            rows: [
              new TableRow({
                children: [
                  cell("Campo", { w: 3600, header: true }),
                  cell("Valor", { w: 5400, header: true }),
                ],
              }),
              ...rows.slice(3).map(
                (r, i) =>
                  new TableRow({
                    children: [
                      cell(r[0], { w: 3600, bold: true, alt: i % 2 === 1 }),
                      cell(r[1], { w: 5400, alt: i % 2 === 1 }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "3. Gráfica comparativa",
                font: "Calibri",
                size: 26,
                bold: true,
                color: "0F766E",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new ImageRun({
                type: "png",
                data: chartBytes,
                transformation: { width: 520, height: 260 },
              }),
            ],
          }),
          p(
            "Interpretación: con la misma demanda térmica, la bomba geotérmica consume " +
              data.consumoGeo.toFixed(2) +
              " kW frente a " +
              data.consumoConv.toFixed(2) +
              " kW del sistema convencional.",
            { after: 80 }
          ),
          p(
            "Generado automáticamente por GeoCalor · Julio Jorge Palmezano Mejía · Uniguajira",
            { size: 18, color: "4F655B" }
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const safe = String(data.nombre || "participante")
    .replace(/[^\w\-]+/g, "_")
    .substring(0, 40);
  return {
    base64,
    nombreArchivo: "GeoCalor_" + safe + "_" + Date.now() + ".docx",
  };
}
