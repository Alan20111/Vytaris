/**
 * ================================================================
 *  VYTARIS — script.js
 *  Aplicación de perfil médico por QR, 100% lado del cliente.
 *
 *  Convención de nomenclatura obligatoria:
 *    k_  → constantes
 *    v_  → variables locales / de bloque
 *    p_  → parámetros de función
 *    m_  → funciones / métodos
 *    c_  → clases (no usadas en este archivo, solo Vanilla JS)
 *    a_  → atributos (string literals de atributos HTML)
 * ================================================================
 */

'use strict';

/* ================================================================
   SECCIÓN 1 — CONSTANTES DE REFERENCIAS DOM
   ================================================================ */

/* ── Secciones principales ── */
const k_formSection    = document.getElementById('k-form-section');
const k_profileSection = document.getElementById('k-profile-section');

/* ── Elementos del formulario ── */
const k_profileForm     = document.getElementById('k-profile-form');
const k_inputName       = document.getElementById('k-input-name');
const k_inputZip        = document.getElementById('k-input-zip');
const k_inputContact    = document.getElementById('k-input-contact');
const k_selectBlood     = document.getElementById('k-select-blood');
const k_inputAllergies  = document.getElementById('k-input-allergies');
const k_inputConditions = document.getElementById('k-input-conditions');

/* ── Mensajes de error por campo ── */
const k_errorName    = document.getElementById('k-error-name');
const k_errorContact = document.getElementById('k-error-contact');
const k_errorBlood   = document.getElementById('k-error-blood');

/* ── Panel de resultado QR ── */
const k_qrResult     = document.getElementById('k-qr-result');
const k_qrCanvas     = document.getElementById('k-qr-canvas');
const k_qrUrlPreview = document.getElementById('k-qr-url-preview');

/* ── Botones ── */
const k_btnGenerate = document.getElementById('k-btn-generate');
const k_btnDownload = document.getElementById('k-btn-download');
const k_btnReset    = document.getElementById('k-btn-reset');

/* ── Tarjeta médica ── */
const k_medicalCard = document.getElementById('k-medical-card');

/* ================================================================
   SECCIÓN 2 — UTILIDADES DE CODIFICACIÓN BASE64 + UNICODE
   ================================================================ */

/**
 * Serializa un objeto JS a Base64 de forma segura para Unicode.
 * Flujo: objeto → JSON string → bytes UTF-8 → Base64.
 *
 * Se usa TextEncoder para convertir el JSON a bytes reales,
 * evitando la limitación de btoa() con caracteres > U+00FF.
 *
 * @param {Object} p_data - Objeto a codificar.
 * @returns {string} Cadena Base64 (puede contener +, /, =).
 */
const m_encodeToBase64 = (p_data) => {
  const v_jsonString = JSON.stringify(p_data);
  const v_bytes      = new TextEncoder().encode(v_jsonString);
  /* Convierte cada byte a su carácter binario para que btoa lo acepte */
  const v_binaryStr  = Array.from(v_bytes, (p_byte) => String.fromCharCode(p_byte)).join('');
  return btoa(v_binaryStr);
};

/**
 * Deserializa una cadena Base64 (generada por m_encodeToBase64) de vuelta a objeto JS.
 * Flujo inverso: Base64 → bytes → JSON string → objeto.
 *
 * @param {string} p_b64 - Cadena Base64 a decodificar.
 * @returns {Object|null} Objeto parseado, o null si la cadena está corrompida.
 */
const m_decodeFromBase64 = (p_b64) => {
  try {
    const v_binaryStr = atob(p_b64);
    const v_bytes     = Uint8Array.from(v_binaryStr, (p_char) => p_char.charCodeAt(0));
    const v_jsonStr   = new TextDecoder().decode(v_bytes);
    return JSON.parse(v_jsonStr);
  } catch (v_error) {
    console.error('[Vytaris] Error al decodificar Base64:', v_error);
    return null;
  }
};

/* ================================================================
   SECCIÓN 3 — UTILIDADES DE URL
   ================================================================ */

/**
 * Obtiene el valor de un parámetro de la URL actual.
 * URLSearchParams decodifica automáticamente los caracteres %XX.
 *
 * @param {string} p_key - Nombre del parámetro (ej. 'v_info').
 * @returns {string|null} Valor del parámetro, o null si no existe.
 */
const m_getUrlParam = (p_key) => {
  const v_params = new URLSearchParams(window.location.search);
  return v_params.get(p_key);
};

/**
 * Construye la URL del perfil de emergencia para ser codificada en el QR.
 * Usa encodeURIComponent sobre la cadena Base64 para sanitizar los
 * caracteres especiales (+, /, =) que Base64 puede generar.
 *
 * @param {string} p_b64Data - Datos del perfil en Base64.
 * @returns {string} URL absoluta con el parámetro ?v_info=<base64>.
 */
const m_buildProfileUrl = (p_b64Data) => {
  /* Tomamos solo el origen + ruta, descartando cualquier query string previo */
  const k_baseUrl = window.location.href.split('?')[0];
  return `${k_baseUrl}?v_info=${encodeURIComponent(p_b64Data)}`;
};

/* ================================================================
   SECCIÓN 4 — MODO CAPTURA: VALIDACIÓN DEL FORMULARIO
   ================================================================ */

/**
 * Establece el estado de error visual en un campo del formulario.
 *
 * @param {HTMLElement} p_input     - Elemento input/select a marcar.
 * @param {HTMLElement} p_errorEl   - Elemento <span> donde mostrar el mensaje.
 * @param {string}      p_message   - Texto del error a mostrar.
 */
const m_setFieldError = (p_input, p_errorEl, p_message) => {
  p_input.classList.add('is-invalid');
  p_errorEl.textContent = p_message;
};

/**
 * Limpia el estado de error de un campo.
 *
 * @param {HTMLElement} p_input   - Elemento a limpiar.
 * @param {HTMLElement} p_errorEl - Elemento de error a vaciar.
 */
const m_clearFieldError = (p_input, p_errorEl) => {
  p_input.classList.remove('is-invalid');
  p_errorEl.textContent = '';
};

/**
 * Valida todos los campos requeridos del formulario.
 * Muestra mensajes de error inline y hace foco en el primer campo inválido.
 *
 * @returns {Object|null} Objeto con los datos del formulario si es válido,
 *                        o null si hay errores de validación.
 */
const m_validateForm = () => {
  /* Limpiamos errores previos antes de re-validar */
  m_clearFieldError(k_inputName,    k_errorName);
  m_clearFieldError(k_inputContact, k_errorContact);
  m_clearFieldError(k_selectBlood,  k_errorBlood);

  let v_isValid        = true;
  let v_firstInvalidEl = null;

  if (!k_inputName.value.trim()) {
    m_setFieldError(k_inputName, k_errorName, 'El nombre completo es obligatorio.');
    v_firstInvalidEl = v_firstInvalidEl || k_inputName;
    v_isValid = false;
  }

  if (!k_inputContact.value.trim()) {
    m_setFieldError(k_inputContact, k_errorContact, 'El contacto de emergencia es obligatorio.');
    v_firstInvalidEl = v_firstInvalidEl || k_inputContact;
    v_isValid = false;
  }

  if (!k_selectBlood.value) {
    m_setFieldError(k_selectBlood, k_errorBlood, 'Selecciona tu tipo de sangre.');
    v_firstInvalidEl = v_firstInvalidEl || k_selectBlood;
    v_isValid = false;
  }

  if (v_firstInvalidEl) {
    v_firstInvalidEl.focus();
    return null;
  }

  /* Construimos y retornamos el objeto de datos limpio */
  return {
    nombre:      k_inputName.value.trim(),
    postal:      k_inputZip.value.trim()        || '',
    contacto:    k_inputContact.value.trim(),
    sangre:      k_selectBlood.value,
    alergias:    k_inputAllergies.value.trim()  || '',
    condiciones: k_inputConditions.value.trim() || '',
  };
};

/* ================================================================
   SECCIÓN 5 — MODO CAPTURA: GENERACIÓN Y DESCARGA DEL QR
   ================================================================ */

/**
 * Instancia activa de QRCode (guardada para evitar duplicados).
 * @type {QRCode|null}
 */
let v_qrInstance = null;

/**
 * Genera el código QR con la URL del perfil y lo renderiza en pantalla.
 * Valida primero el formulario; si hay errores, aborta.
 */
const m_generateQR = () => {
  const v_formData = m_validateForm();
  if (!v_formData) return;

  /* Codificar + construir URL final */
  const v_b64Data  = m_encodeToBase64(v_formData);
  const v_finalUrl = m_buildProfileUrl(v_b64Data);

  /* Limpiar QR anterior si el usuario generó uno previo */
  k_qrCanvas.innerHTML = '';
  v_qrInstance = null;

  /* Generar el QR con qrcode.js — correctLevel H para mejor tolerancia a daños */
  v_qrInstance = new QRCode(k_qrCanvas, {
    text:         v_finalUrl,
    width:        240,
    height:       240,
    colorDark:    '#1a202c',
    colorLight:   '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });

  /* Mostrar URL de previsualización truncada */
  const k_maxPreviewChars        = 60;
  k_qrUrlPreview.textContent     = v_finalUrl.length > k_maxPreviewChars
    ? v_finalUrl.slice(0, k_maxPreviewChars) + '…'
    : v_finalUrl;

  /* Revelar el panel del QR y hacer scroll suave hacia él */
  k_qrResult.classList.remove('hidden');
  k_qrResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Descarga el QR generado como archivo .png.
 * qrcode.js renderiza un <canvas> en navegadores modernos,
 * y un <img> (data URL) como fallback — manejamos ambos casos.
 */
const m_downloadQR = () => {
  const v_canvas = k_qrCanvas.querySelector('canvas');
  const v_img    = k_qrCanvas.querySelector('img');
  let   v_dataUrl;

  if (v_canvas) {
    /* Caso principal: qrcode.js usó <canvas> */
    v_dataUrl = v_canvas.toDataURL('image/png');
  } else if (v_img && v_img.src) {
    /* Fallback: qrcode.js usó <img> con data URL — redibujamos en canvas temporal */
    const v_tempCanvas        = document.createElement('canvas');
    v_tempCanvas.width        = v_img.naturalWidth  || 240;
    v_tempCanvas.height       = v_img.naturalHeight || 240;
    v_tempCanvas.getContext('2d').drawImage(v_img, 0, 0);
    v_dataUrl = v_tempCanvas.toDataURL('image/png');
  } else {
    alert('El QR aún no se ha generado. Haz clic en "Generar código QR" primero.');
    return;
  }

  const v_link      = document.createElement('a');
  v_link.download   = 'vytaris-qr-medico.png';
  v_link.href       = v_dataUrl;
  document.body.appendChild(v_link);
  v_link.click();
  document.body.removeChild(v_link);
};

/**
 * Reinicia el formulario y la vista al estado inicial.
 */
const m_resetForm = () => {
  k_profileForm.reset();

  /* Limpiar errores de validación */
  m_clearFieldError(k_inputName,    k_errorName);
  m_clearFieldError(k_inputContact, k_errorContact);
  m_clearFieldError(k_selectBlood,  k_errorBlood);

  /* Limpiar QR */
  k_qrCanvas.innerHTML    = '';
  k_qrUrlPreview.textContent = '';
  v_qrInstance            = null;

  /* Ocultar panel de QR */
  k_qrResult.classList.add('hidden');

  /* Scroll al inicio */
  window.scrollTo({ top: 0, behavior: 'smooth' });
  k_inputName.focus();
};

/* ================================================================
   SECCIÓN 6 — MODO PERFIL: RENDERIZADO DE LA TARJETA MÉDICA
   ================================================================ */

/**
 * Genera el HTML de un campo individual de la tarjeta médica.
 * Aplica estilos diferenciados según si el valor representa una alerta
 * (alergias, condiciones) o un dato neutro.
 *
 * @param {string}  p_icon    - Emoji que representa el tipo de dato.
 * @param {string}  p_label   - Texto de la etiqueta del campo.
 * @param {string}  p_value   - Valor a mostrar (vacío si no fue capturado).
 * @param {boolean} p_isAlert - true para aplicar estilo de alerta naranja.
 * @returns {string} Fragmento HTML del campo.
 */
const m_buildCardField = (p_icon, p_label, p_value, p_isAlert = false) => {
  /* Sanitizamos el valor para evitar XSS ya que viene de atob() */
  const m_sanitize = (p_str) => {
    const v_div       = document.createElement('div');
    v_div.textContent = p_str;
    return v_div.innerHTML;
  };

  if (!p_value || !p_value.trim()) {
    return `
      <div class="mc-section">
        <div class="mc-label">
          <span aria-hidden="true">${p_icon}</span>${p_label}
        </div>
        <div class="mc-value mc-value--none">No especificado</div>
      </div>`;
  }

  const v_alertClass = p_isAlert ? 'mc-value--alert' : '';
  const v_safeValue  = m_sanitize(p_value);

  return `
    <div class="mc-section">
      <div class="mc-label">
        <span aria-hidden="true">${p_icon}</span>${p_label}
      </div>
      <div class="mc-value ${v_alertClass}">${v_safeValue}</div>
    </div>`;
};

/**
 * Extrae el primer número telefónico de un string de texto libre.
 * Acepta formatos comunes mexicanos e internacionales.
 *
 * @param {string} p_text - Texto que puede contener un número.
 * @returns {string|null} Número limpio para href="tel:..." o null si no hay.
 */
const m_extractPhoneNumber = (p_text) => {
  /* Busca secuencias de dígitos, espacios, guiones y paréntesis (mínimo 7 dígitos) */
  const v_match = p_text.match(/[\d\s\-\(\)\+]{7,}/);
  if (!v_match) return null;
  /* Conserva solo dígitos, +, y el primer guión como separador de país */
  return v_match[0].replace(/[^\d+]/g, '');
};

/**
 * Renderiza la tarjeta de identificación médica completa en el DOM.
 * Este es el núcleo del Modo Perfil — lo que un paramédico ve al escanear.
 *
 * @param {Object} p_data - Objeto con los datos del perfil del portador.
 *   @param {string} p_data.nombre      - Nombre completo.
 *   @param {string} p_data.postal      - Código postal.
 *   @param {string} p_data.contacto    - Contacto de emergencia + teléfono.
 *   @param {string} p_data.sangre      - Tipo de sangre.
 *   @param {string} p_data.alergias    - Alergias conocidas.
 *   @param {string} p_data.condiciones - Enfermedades crónicas.
 */
const m_renderEmergencyCard = (p_data) => {
  /* Sanitizamos nombre y sangre (se insertan en HTML del encabezado) */
  const m_sanitizeText = (p_str) => {
    const v_div       = document.createElement('div');
    v_div.textContent = String(p_str || '');
    return v_div.innerHTML;
  };

  const v_safeName  = m_sanitizeText(p_data.nombre) || 'Sin nombre registrado';
  const v_safeBlood = m_sanitizeText(p_data.sangre)  || '?';

  /* Intentamos extraer un número de teléfono del campo de contacto */
  const v_phone   = m_extractPhoneNumber(p_data.contacto || '');
  const v_callBtn = v_phone
    ? `<a href="tel:${v_phone}" class="btn--call" aria-label="Llamar al contacto de emergencia">
         <span aria-hidden="true">📞</span> Llamar al contacto de emergencia
       </a>`
    : '';

  /* Construimos el HTML de la tarjeta médica */
  k_medicalCard.innerHTML = `
    <div class="mc-header">
      <div class="mc-name">${v_safeName}</div>
      <div class="mc-blood-badge" aria-label="Tipo de sangre: ${v_safeBlood}">
        ${v_safeBlood}
      </div>
      <span class="mc-blood-label">Tipo de sangre</span>
    </div>

    <div class="mc-body">
      ${m_buildCardField('📍', 'Código Postal',          p_data.postal)}
      ${m_buildCardField('📞', 'Contacto de Emergencia', p_data.contacto)}
      <hr class="mc-divider" />
      ${m_buildCardField('⚠️', 'Alergias Conocidas',     p_data.alergias,    true)}
      ${m_buildCardField('💊', 'Enfermedades Crónicas',  p_data.condiciones, true)}
      ${v_callBtn}
    </div>
  `;
};

/**
 * Renderiza un mensaje de error cuando el QR está dañado o es inválido.
 * Útil si el código se imprimió mal o fue alterado.
 */
const m_renderDecodeError = () => {
  k_medicalCard.innerHTML = `
    <div class="mc-body" style="padding: 2.5rem 1.25rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <div class="mc-value mc-value--alert" style="text-align: center; font-size: 1rem;">
        El código QR está dañado o es inválido.<br/>
        No se pudo leer la información médica.
      </div>
    </div>
  `;
};

/* ================================================================
   SECCIÓN 7 — ENRUTADOR PRINCIPAL (Router del lado del cliente)
   ================================================================ */

/**
 * Punto de entrada de la aplicación.
 *
 * Detecta si la URL contiene el parámetro ?v_info= :
 *   • Con parámetro → Modo Perfil de Emergencia: decodifica y muestra tarjeta médica.
 *   • Sin parámetro → Modo Captura (Default): muestra el formulario de registro.
 *
 * El "enrutamiento" ocurre puramente en el cliente — no hay petición al servidor.
 */
const m_initApp = () => {
  const v_encodedData = m_getUrlParam('v_info');

  if (v_encodedData) {
    /* ── MODO PERFIL DE EMERGENCIA ── */
    const v_profileData = m_decodeFromBase64(v_encodedData);

    /* Ocultar formulario, revelar sección de perfil */
    k_formSection.classList.add('hidden');
    k_profileSection.classList.remove('hidden');

    if (v_profileData) {
      m_renderEmergencyCard(v_profileData);
    } else {
      /* El Base64 estaba corrupto o fue manipulado */
      m_renderDecodeError();
    }
  } else {
    /* ── MODO CAPTURA (Default) ── */
    k_formSection.classList.remove('hidden');
    k_profileSection.classList.add('hidden');
  }
};

/* ================================================================
   SECCIÓN 8 — REGISTRO DE EVENTOS
   ================================================================ */

/* Botón principal: generar QR */
k_btnGenerate.addEventListener('click', m_generateQR);

/* Botón de descarga: guardar QR como PNG */
k_btnDownload.addEventListener('click', m_downloadQR);

/* Botón de reinicio: volver al formulario vacío */
k_btnReset.addEventListener('click', m_resetForm);

/* Limpiar error visual mientras el usuario escribe/selecciona */
k_inputName.addEventListener('input', () => m_clearFieldError(k_inputName,    k_errorName));
k_inputContact.addEventListener('input', () => m_clearFieldError(k_inputContact, k_errorContact));
k_selectBlood.addEventListener('change', () => m_clearFieldError(k_selectBlood,  k_errorBlood));

/* Solo permitir dígitos en el campo de código postal (teclado numérico en móviles) */
k_inputZip.addEventListener('input', () => {
  k_inputZip.value = k_inputZip.value.replace(/[^\d\s\-]/g, '');
});

/* ================================================================
   SECCIÓN 9 — ARRANQUE
   ================================================================ */
m_initApp();
