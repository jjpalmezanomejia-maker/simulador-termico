/**
 * GeoCalor — backend Google Apps Script
 * Recibe JSON con participante + simulación + DOCX (base64) y envía correo.
 *
 * Despliegue:
 * 1. script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar → Nueva implementación → Tipo: Aplicación web
 * 3. Ejecutar como: Yo | Acceso: Cualquiera
 * 4. Copiar la URL en config.js → APPS_SCRIPT_URL
 */

const CONFIG = {
  /** Copia (CC) por defecto si el cliente no envía emailCopia */
  EMAIL_COPIA: 'jjorgepalmezano@uniguajira.edu.co',
  ASUNTO: 'Informe GeoCalor — simulación geotérmica'
};

function doGet() {
  return respuesta_({ ok: true, mensaje: 'Servicio GeoCalor activo' });
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
    const d = limpiar_(raw);

    const adjuntos = [];
    if (d.docxBase64) {
      const bytes = Utilities.base64Decode(d.docxBase64);
      adjuntos.push(
        Utilities.newBlob(
          bytes,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          d.nombreArchivo || ('GeoCalor_' + d.nombreSafe + '.docx')
        )
      );
    }

    const html =
      '<div style="font-family:Arial,sans-serif;color:#173028">' +
      '<h2 style="color:#0f766e;margin:0 0 8px">Nueva simulación GeoCalor</h2>' +
      '<p>Se generó un informe automático de bomba de calor geotérmica.</p>' +
      '<table style="border-collapse:collapse;width:100%;max-width:560px">' +
      fila_('Participante', d.nombre) +
      fila_('Correo del participante', d.correo) +
      fila_('Escenario', d.escenario) +
      fila_('Demanda térmica Q', d.demanda + ' kW') +
      fila_('COP geotérmica', String(d.copGeo)) +
      fila_('COP convencional', String(d.copConv)) +
      fila_('Horas/día', String(d.horas)) +
      fila_('Temp. terreno', d.tempTerreno + ' °C') +
      fila_('P_geo', d.consumoGeo + ' kW') +
      fila_('P_conv', d.consumoConv + ' kW') +
      fila_('Ahorro', d.ahorro + ' kW (' + d.ahorroPct + '%)') +
      fila_('Energía diaria', d.energiaDia + ' kWh') +
      fila_('Fecha', d.fecha) +
      '</table>' +
      '<p style="margin-top:14px">Adjunto: informe DOCX con datos, resultados y gráfica.</p>' +
      '<p style="color:#4d6358;font-size:12px">Destinatario: ' + d.correo +
      ' · Copia (CC): ' + d.emailCopia + '.</p>' +
      '</div>';

    // To = quien simula | CC = correo de informes
    const mailOpts = {
      to: d.correo,
      subject: CONFIG.ASUNTO + ' — ' + d.nombre,
      htmlBody: html,
      replyTo: d.correo,
      name: 'GeoCalor Informes',
      attachments: adjuntos
    };
    if (d.emailCopia && d.emailCopia.toLowerCase() !== d.correo.toLowerCase()) {
      mailOpts.cc = d.emailCopia;
    }

    MailApp.sendEmail(mailOpts);

    return respuesta_({
      ok: true,
      destino: d.correo,
      copia: d.emailCopia
    });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  }
}

function limpiar_(d) {
  const t = function (v, max) {
    return String(v == null ? '' : v).substring(0, max || 120)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  const n = function (v) {
    v = Number(v);
    return isFinite(v) ? v : 0;
  };
  const nombre = t(d.nombre, 80) || 'Anónimo';
  return {
    nombre: nombre,
    nombreSafe: nombre.replace(/[^\w\-]+/g, '_').substring(0, 40) || 'participante',
    correo: t(d.correo, 120),
    escenario: t(d.escenario, 40),
    demanda: n(d.demanda).toFixed(2),
    copGeo: n(d.copGeo).toFixed(2),
    copConv: n(d.copConv).toFixed(2),
    horas: n(d.horas).toFixed(0),
    tempTerreno: n(d.tempTerreno).toFixed(0),
    consumoGeo: n(d.consumoGeo).toFixed(2),
    consumoConv: n(d.consumoConv).toFixed(2),
    ahorro: n(d.ahorro).toFixed(2),
    ahorroPct: n(d.ahorroPct).toFixed(0),
    energiaDia: n(d.energiaDia).toFixed(2),
    fecha: t(d.fecha, 40) || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
    docxBase64: d.docxBase64 ? String(d.docxBase64) : '',
    nombreArchivo: t(d.nombreArchivo, 80),
    emailCopia: t(d.emailCopia || CONFIG.EMAIL_COPIA, 120) || CONFIG.EMAIL_COPIA
  };
}

function fila_(k, v) {
  return '<tr>' +
    '<td style="padding:7px;border:1px solid #c9d5cc;background:#eef7f3;width:42%"><b>' + k + '</b></td>' +
    '<td style="padding:7px;border:1px solid #c9d5cc">' + v + '</td>' +
    '</tr>';
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Prueba manual desde el editor */
function probarEnvio() {
  doPost({
    postData: {
      contents: JSON.stringify({
        nombre: 'Prueba GeoCalor',
        correo: 'prueba@example.com',
        escenario: 'calefaccion',
        demanda: 8,
        copGeo: 4,
        copConv: 1,
        horas: 8,
        tempTerreno: 18,
        consumoGeo: 2,
        consumoConv: 8,
        ahorro: 6,
        ahorroPct: 75,
        energiaDia: 16
      })
    }
  });
}
