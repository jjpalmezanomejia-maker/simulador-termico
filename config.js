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
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyXlMjlDI2Pwolp8Ot4OQ9YVjvqJ6RY03lx1tPnzFxpNFaCRbfvgvyuWUwI81pyN1ydRQ/exec",
  ASUNTO: "Informe GeoCalor — simulación geotérmica",
};
