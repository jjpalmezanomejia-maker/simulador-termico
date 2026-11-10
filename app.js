/**
 * GeoCalor — inicio manual + informe DOCX por correo
 */
import { createGeoScene } from "./scene3d.js";
import { CONFIG } from "./config.js";
import { generarInformeDocx } from "./informe.js";

const els = {
  nombre: document.getElementById("nombre"),
  correo: document.getElementById("correo"),
  demanda: document.getElementById("demanda"),
  demandaOut: document.getElementById("demandaOut"),
  copGeo: document.getElementById("copGeo"),
  copGeoOut: document.getElementById("copGeoOut"),
  copConv: document.getElementById("copConv"),
  copConvOut: document.getElementById("copConvOut"),
  horas: document.getElementById("horas"),
  horasOut: document.getElementById("horasOut"),
  tempTerreno: document.getElementById("tempTerreno"),
  tempTerrenoOut: document.getElementById("tempTerrenoOut"),
  escenario: document.getElementById("escenario"),
  mensaje: document.getElementById("mensajeValidacion"),
  mensajeEnvio: document.getElementById("mensajeEnvio"),
  btnIniciar: document.getElementById("btnIniciar"),
  consumoGeo: document.getElementById("consumoGeo"),
  consumoConv: document.getElementById("consumoConv"),
  ahorro: document.getElementById("ahorro"),
  energiaDia: document.getElementById("energiaDia"),
  explicacion: document.getElementById("explicacion"),
  barGeo: document.getElementById("barGeo"),
  barConv: document.getElementById("barConv"),
  meterFill: document.getElementById("meterFill"),
  meterCaption: document.getElementById("meterCaption"),
  labelTerreno: document.getElementById("labelTerreno"),
  schemaCaption: document.getElementById("schemaCaption"),
  retoFeedback: document.getElementById("retoFeedback"),
  viewport: document.getElementById("viewport3d"),
  btnResetCam: document.getElementById("btnResetCam"),
  comentario: document.getElementById("comentario"),
  btnComentario: document.getElementById("btnComentario"),
  mensajeComentario: document.getElementById("mensajeComentario"),
};

let scene3d;
try {
  scene3d = createGeoScene(els.viewport);
  scene3d.setAutoRotate(false);
  scene3d.setState({
    geoOk: false,
    heating: true,
    demanda: 8,
    copGeo: 4,
    consumoGeo: 0,
    consumoConv: 0,
    tempTerreno: 18,
  });
} catch (err) {
  console.error(err);
  els.schemaCaption.textContent = "Error 3D: " + err.message;
  scene3d = { setState() {}, resetCamera() {}, setAutoRotate() {} };
}

function calcularConsumo(demandaKw, cop) {
  if (!Number.isFinite(demandaKw) || demandaKw <= 0) {
    return { ok: false, valor: null, error: "Q debe ser > 0." };
  }
  if (!Number.isFinite(cop) || cop <= 0) {
    return { ok: false, valor: null, error: "COP debe ser > 0." };
  }
  return { ok: true, valor: demandaKw / cop, error: null };
}

function formatear(n, unidad) {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toFixed(2) + (unidad ? " " + unidad : "");
}

function emailValido(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function actualizarEtiquetasControles() {
  els.demandaOut.textContent = Number(els.demanda.value).toFixed(1) + " kW";
  els.copGeoOut.textContent = Number(els.copGeo.value).toFixed(1);
  els.copConvOut.textContent = Number(els.copConv.value).toFixed(1);
  els.horasOut.textContent = Number(els.horas.value) + " h";
  els.tempTerrenoOut.textContent = Number(els.tempTerreno.value) + " °C";
  els.labelTerreno.textContent = "Terreno " + Number(els.tempTerreno.value) + " °C";
}

function actualizarGrafica(geo, conv) {
  const max = Math.max(geo || 0, conv || 0, 0.01);
  els.barGeo.style.height = Math.max(6, ((geo || 0) / max) * 100) + "%";
  els.barConv.style.height = Math.max(6, ((conv || 0) / max) * 100) + "%";
  if (geo > 0 && conv > 0) {
    els.meterFill.style.width = Math.min(100, Math.max(0, (1 - geo / conv) * 100)) + "%";
    els.meterCaption.textContent =
      "Función comparativa: P_geo es el " +
      ((geo / conv) * 100).toFixed(0) +
      "% de P_conv (misma Q)";
  } else {
    els.meterFill.style.width = "0%";
    els.meterCaption.textContent = "Sin resultados: inicia la simulación";
  }
}

function limpiarResultados() {
  els.consumoGeo.textContent = "—";
  els.consumoConv.textContent = "—";
  els.ahorro.textContent = "—";
  els.energiaDia.textContent = "—";
  els.explicacion.textContent =
    "Aún no hay simulación. Completa nombre/correo, ajusta parámetros y pulsa Iniciar.";
  actualizarGrafica(0, 0);
  els.schemaCaption.textContent = "En espera de iniciar simulación";
}

function construirPayload(geo, conv) {
  const demanda = Number(els.demanda.value);
  const copGeo = Number(els.copGeo.value);
  const copConv = Number(els.copConv.value);
  const horas = Number(els.horas.value);
  const ahorro = conv.valor - geo.valor;
  const ahorroPct = (ahorro / conv.valor) * 100;
  return {
    nombre: els.nombre.value.trim(),
    correo: els.correo.value.trim(),
    escenario: els.escenario.value,
    demanda,
    copGeo,
    copConv,
    horas,
    tempTerreno: Number(els.tempTerreno.value),
    consumoGeo: geo.valor,
    consumoConv: conv.valor,
    ahorro,
    ahorroPct,
    energiaDia: geo.valor * horas,
    fecha: new Date().toLocaleString("es-CO"),
  };
}

async function enviarInforme(payload, docx) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("PEGAR_AQUI")) {
    throw new Error(
      "Falta configurar APPS_SCRIPT_URL en config.js (despliega Code.gs y pega la URL)."
    );
  }

  const body = {
    ...payload,
    docxBase64: docx.base64,
    nombreArchivo: docx.nombreArchivo,
    emailCopia: CONFIG.EMAIL_DESTINO,
  };

  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    // text/plain evita preflight CORS en Apps Script
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Respuesta inválida del servidor de correo.");
  }
  if (!json.ok) throw new Error(json.error || "No se pudo enviar el correo.");
  return json;
}

/**
 * Envía el comentario de la plataforma al correo del docente.
 * Se reutiliza el mismo backend de Apps Script (Code.gs) con tipo "comentario".
 */
async function enviarComentario() {
  const texto = els.comentario.value.trim();
  const nombre = els.nombre.value.trim();
  const correo = els.correo.value.trim();

  if (texto.length < 5) {
    return { ok: false, error: "Escribe un comentario de al menos 5 caracteres." };
  }
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("PEGAR_AQUI")) {
    return { ok: false, error: "Falta configurar APPS_SCRIPT_URL en config.js." };
  }

  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    // text/plain evita preflight CORS en Apps Script
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      tipo: "comentario",
      comentario: texto,
      nombre: nombre || "Sin nombre",
      correo: correo || "Sin correo",
      pagina: location.href,
      fecha: new Date().toLocaleString("es-CO"),
    }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "Respuesta inválida del servidor de correo." };
  }
  if (!json.ok) return { ok: false, error: json.error || "No se pudo enviar el comentario." };
  return json;
}

async function iniciarSimulacion() {
  actualizarEtiquetasControles();
  els.mensajeEnvio.textContent = "";
  els.mensajeEnvio.className = "hint";

  const nombre = els.nombre.value.trim();
  const correo = els.correo.value.trim();
  if (!nombre) {
    els.mensaje.textContent = "Debes ingresar el nombre de quien genera la simulación.";
    els.mensaje.className = "hint error";
    els.nombre.focus();
    return;
  }
  if (!emailValido(correo)) {
    els.mensaje.textContent = "Debes ingresar un correo válido.";
    els.mensaje.className = "hint error";
    els.correo.focus();
    return;
  }

  const demanda = Number(els.demanda.value);
  const copGeo = Number(els.copGeo.value);
  const copConv = Number(els.copConv.value);
  const geo = calcularConsumo(demanda, copGeo);
  const conv = calcularConsumo(demanda, copConv);

  if (!geo.ok || !conv.ok) {
    const error = (!geo.ok && geo.error) || (!conv.ok && conv.error);
    els.mensaje.textContent = "Validación: " + error;
    els.mensaje.className = "hint error";
    limpiarResultados();
    scene3d.setState({
      geoOk: false,
      heating: els.escenario.value === "calefaccion",
      demanda,
      copGeo,
      consumoGeo: 0,
      consumoConv: 0,
      tempTerreno: Number(els.tempTerreno.value),
    });
    return;
  }

  const payload = construirPayload(geo, conv);
  const ahorroKw = payload.ahorro;
  const ahorroPct = payload.ahorroPct;

  els.mensaje.textContent =
    "Simulación iniciada · Q = " + demanda.toFixed(1) + " kW · participante: " + nombre;
  els.mensaje.className = "hint ok";
  els.consumoGeo.textContent = formatear(geo.valor, "kW");
  els.consumoConv.textContent = formatear(conv.valor, "kW");
  els.ahorro.textContent = formatear(ahorroKw, "kW") + " (" + ahorroPct.toFixed(0) + "%)";
  els.energiaDia.textContent = formatear(payload.energiaDia, "kWh");
  els.explicacion.textContent =
    "Paso a paso: P_geo = " + demanda.toFixed(1) + " ÷ " + copGeo.toFixed(1) +
    " = " + geo.valor.toFixed(2) + " kW; P_conv = " +
    demanda.toFixed(1) + " ÷ " + copConv.toFixed(1) +
    " = " + conv.valor.toFixed(2) + " kW; ahorro = " +
    ahorroKw.toFixed(2) + " kW; E_día = " + payload.energiaDia.toFixed(2) + " kWh.";
  els.schemaCaption.textContent =
    els.escenario.value === "calefaccion"
      ? "Simulación activa: calor terreno → edificio"
      : "Simulación activa: calor edificio → terreno";

  actualizarGrafica(geo.valor, conv.valor);
  scene3d.setAutoRotate(true);
  scene3d.setState({
    geoOk: true,
    heating: els.escenario.value === "calefaccion",
    demanda,
    copGeo,
    consumoGeo: geo.valor,
    consumoConv: conv.valor,
    tempTerreno: payload.tempTerreno,
  });

  els.btnIniciar.disabled = true;
  els.mensajeEnvio.textContent =
    "Generando DOCX y enviando a " + correo + " (copia: " + CONFIG.EMAIL_DESTINO + ")…";
  els.mensajeEnvio.className = "hint";

  try {
    const docx = await generarInformeDocx(payload);
    await enviarInforme(payload, docx);
    els.mensajeEnvio.textContent =
      "Informe DOCX enviado a " + correo + " · Copia (CC): " + CONFIG.EMAIL_DESTINO +
      " · Archivo: " + docx.nombreArchivo;
    els.mensajeEnvio.className = "hint ok";
  } catch (err) {
    console.error(err);
    els.mensajeEnvio.textContent =
      "Simulación OK, pero el envío falló: " + err.message;
    els.mensajeEnvio.className = "hint error";
  } finally {
    els.btnIniciar.disabled = false;
  }
}

[
  els.demanda,
  els.copGeo,
  els.copConv,
  els.horas,
  els.tempTerreno,
  els.escenario,
].forEach((el) => {
  el.addEventListener("input", actualizarEtiquetasControles);
  el.addEventListener("change", actualizarEtiquetasControles);
});

els.btnIniciar.addEventListener("click", () => {
  iniciarSimulacion();
});

els.btnResetCam.addEventListener("click", () => scene3d.resetCamera());

els.btnComentario.addEventListener("click", async () => {
  const msg = els.mensajeComentario;
  const texto = els.comentario.value.trim();
  if (texto.length < 5) {
    msg.textContent = "Escribe un comentario de al menos 5 caracteres.";
    msg.className = "hint error";
    els.comentario.focus();
    return;
  }
  els.btnComentario.disabled = true;
  msg.textContent = "Enviando comentario…";
  msg.className = "hint";
  try {
    const r = await enviarComentario();
    if (r.ok) {
      msg.textContent = "Comentario enviado a " + CONFIG.COMENTARIOS_DESTINO + ". ¡Gracias!";
      msg.className = "hint ok";
      els.comentario.value = "";
    } else {
      msg.textContent = r.error;
      msg.className = "hint error";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Error de red al enviar: " + err.message;
    msg.className = "hint error";
  } finally {
    els.btnComentario.disabled = false;
  }
});

document.querySelectorAll(".reto-actions button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const valor = btn.getAttribute("data-respuesta");
    if (valor === "2.5") {
      els.retoFeedback.textContent =
        "Correcto. Funcionamiento: P_el = 10 ÷ 4 = 2.5 kW.";
      els.retoFeedback.className = "hint ok";
    } else {
      els.retoFeedback.textContent =
        "Incorrecto. Recuerda la función: P_el = Q ÷ COP → 10 ÷ 4 = 2.5 kW.";
      els.retoFeedback.className = "hint error";
    }
  });
});

actualizarEtiquetasControles();
limpiarResultados();
