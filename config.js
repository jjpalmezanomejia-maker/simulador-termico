/**
 * Configuración del envío de informes.
 * Tras desplegar Code.gs como Web App, pega aquí la URL de implementación.
 */
export const CONFIG = {
  /** Correo de informes en copia (CC). El To es el correo digitado por quien simula. */
  EMAIL_DESTINO: "jjorgepalmezano@uniguajira.edu.co",
  /**
   * URL del Google Apps Script (Implementar > Nueva implementación > Aplicación web).
   * Ejecutar como: Yo | Quién tiene acceso: Cualquiera
   */
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxNfssUq-XOnbLLP8-rKsovPxxEAIXdoHfb_EZoIxkkY60lBLAFc4oKJKGdZ7ABVVsOKA/exec",
  ASUNTO: "Informe GeoCalor — simulación geotérmica",
  /** Destino de la caja de comentarios de la plataforma. */
  COMENTARIOS_DESTINO: "jjorgepalmezano@uniguajira.edu.co",
  ASUNTO_COMENTARIO: "GeoCalor — Comentario sobre la plataforma",
};
