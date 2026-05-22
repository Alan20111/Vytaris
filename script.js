/**
 * ================================================================
 *  VYTARIS — script.js
 *  100% cliente · sin backend · sin base de datos
 *
 *  Convención de nombres (obligatoria):
 *    k_  constantes / referencias DOM
 *    v_  variables locales o de bloque
 *    p_  parámetros de función
 *    m_  funciones / métodos
 *
 *  Librería QR: qrcode@1.5.3 (npm) via jsdelivr CDN
 *    API: QRCode.toDataURL(text, options) → Promise<string>
 * ================================================================
 */

'use strict';

/* ================================================================
   1 — REFERENCIAS DOM
   ================================================================ */
const k_formSection    = document.getElementById('k-form-section');
const k_profileSection = document.getElementById('k-profile-section');

const k_profileForm     = document.getElementById('k-profile-form');
const k_inputName       = document.getElementById('k-input-name');
const k_inputZip        = document.getElementById('k-input-zip');
const k_inputContact    = document.getElementById('k-input-contact');
const k_selectBlood     = document.getElementById('k-select-blood');
const k_inputAllergies  = document.getElementById('k-input-allergies');
const k_inputConditions = document.getElementById('k-input-conditions');

const k_errorName    = document.getElementById('k-error-name');
const k_errorContact = document.getElementById('k-error-contact');
const k_errorBlood   = document.getElementById('k-error-blood');

const k_qrResult     = document.getElementById('k-qr-result');
const k_qrCanvas     = document.getElementById('k-qr-canvas');
const k_qrUrlPreview = document.getElementById('k-qr-url-preview');

const k_btnGenerate  = document.getElementById('k-btn-generate');
const k_btnDownload  = document.getElementById('k-btn-download');
const k_btnReset     = document.getElementById('k-btn-reset');

const k_medicalCard  = document.getElementById('k-medical-card');

/* ================================================================
   2 — ICONOS SVG INLINE (para HTML generado dinámicamente en JS)
       Mismos símbolos del sprite, como strings interpolables.
       stroke="currentColor" hereda el color del elemento padre.
   ================================================================ */
const k_svgPin   = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"/><circle cx="12" cy="8" r="2.5"/></svg>`;

const k_svgPhone = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.61 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.73 9.77a16 16 0 0 0 6.29 6.29l1.13-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const k_svgDrop  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C12 2 4 10.5 4 15.5a8 8 0 0 0 16 0C20 10.5 12 2 12 2z"/></svg>`;

const k_svgWarn  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/></svg>`;

const k_svgCross = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;

const k_svgCall  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.61 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.73 9.77a16 16 0 0 0 6.29 6.29l1.13-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const k_svgZap   = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

/* ================================================================
   3 — ESTADO DEL MÓDULO
   ================================================================ */

/* Data URL del último QR generado — se usa para la descarga */
let v_currentQRDataUrl = null;

/* ================================================================
   4 — CODIFICACIÓN BASE64 (Unicode-safe con TextEncoder/Decoder)
   ================================================================ */

/**
 * Objeto JS → JSON string → bytes UTF-8 → Base64.
 * @param {Object} p_data
 * @returns {string} Base64
 */
const m_encodeToBase64 = (p_data) => {
  const v_json    = JSON.stringify(p_data);
  const v_bytes   = new TextEncoder().encode(v_json);
  const v_binary  = Array.from(v_bytes, (p_b) => String.fromCharCode(p_b)).join('');
  return btoa(v_binary);
};

/**
 * Base64 → bytes → JSON string → objeto JS.
 * @param {string} p_b64
 * @returns {Object|null}
 */
const m_decodeFromBase64 = (p_b64) => {
  try {
    const v_binary = atob(p_b64);
    const v_bytes  = Uint8Array.from(v_binary, (p_c) => p_c.charCodeAt(0));
    const v_json   = new TextDecoder().decode(v_bytes);
    return JSON.parse(v_json);
  } catch (v_err) {
    console.error('[Vytaris] Base64 decode error:', v_err);
    return null;
  }
};

/* ================================================================
   5 — UTILIDADES DE URL
   ================================================================ */

/**
 * @param {string} p_key  Nombre del parámetro en la query string.
 * @returns {string|null}
 */
const m_getUrlParam = (p_key) => new URLSearchParams(window.location.search).get(p_key);

/**
 * Construye la URL del perfil añadiendo el Base64 como ?v_info=...
 * encodeURIComponent sanitiza +, /, = que Base64 puede generar.
 * @param {string} p_b64
 * @returns {string} URL absoluta
 */
const m_buildProfileUrl = (p_b64) => {
  const k_base = window.location.href.split('?')[0];
  return `${k_base}?v_info=${encodeURIComponent(p_b64)}`;
};

/* ================================================================
   6 — VALIDACIÓN DEL FORMULARIO
   ================================================================ */

const m_setError   = (p_input, p_span, p_msg) => { p_input.classList.add('is-invalid');    p_span.textContent = p_msg; };
const m_clearError = (p_input, p_span)         => { p_input.classList.remove('is-invalid'); p_span.textContent = '';    };

/**
 * Valida campos obligatorios y devuelve el objeto de datos o null.
 * @returns {Object|null}
 */
const m_validateForm = () => {
  m_clearError(k_inputName,    k_errorName);
  m_clearError(k_inputContact, k_errorContact);
  m_clearError(k_selectBlood,  k_errorBlood);

  let v_ok = true;
  let v_focus = null;

  if (!k_inputName.value.trim()) {
    m_setError(k_inputName, k_errorName, 'El nombre completo es obligatorio.');
    v_focus = v_focus || k_inputName;
    v_ok = false;
  }
  if (!k_inputContact.value.trim()) {
    m_setError(k_inputContact, k_errorContact, 'El contacto de emergencia es obligatorio.');
    v_focus = v_focus || k_inputContact;
    v_ok = false;
  }
  if (!k_selectBlood.value) {
    m_setError(k_selectBlood, k_errorBlood, 'Selecciona tu tipo de sangre.');
    v_focus = v_focus || k_selectBlood;
    v_ok = false;
  }

  if (v_focus) { v_focus.focus(); return null; }

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
   7 — GENERACIÓN Y DESCARGA DEL QR
       Usa qrcode@1.5.3 → QRCode.toDataURL() → Promise<dataURL>
   ================================================================ */

/**
 * Valida, codifica y genera el QR. Muestra el panel de resultado.
 */
const m_generateQR = async () => {
  const v_data = m_validateForm();
  if (!v_data) return;

  /* Estado cargando */
  k_btnGenerate.disabled = true;
  k_btnGenerate.innerHTML = `${k_svgZap} Generando…`;

  const v_b64     = m_encodeToBase64(v_data);
  const v_fullUrl = m_buildProfileUrl(v_b64);

  try {
    /* qrcode@1.5.3: QRCode.toDataURL devuelve una Promise */
    const v_dataUrl = await QRCode.toDataURL(v_fullUrl, {
      errorCorrectionLevel: 'H',
      width:   256,
      margin:  2,
      color:   { dark: '#1a202c', light: '#ffffff' },
    });

    /* Renderizar imagen en el contenedor */
    k_qrCanvas.innerHTML = '';
    const v_img = document.createElement('img');
    v_img.src    = v_dataUrl;
    v_img.alt    = 'Código QR médico Vytaris';
    v_img.width  = 256;
    v_img.height = 256;
    k_qrCanvas.appendChild(v_img);

    /* Guardar para descarga posterior */
    v_currentQRDataUrl = v_dataUrl;

    /* Previsualización de la URL (truncada) */
    const k_maxChars = 55;
    k_qrUrlPreview.textContent = v_fullUrl.length > k_maxChars
      ? v_fullUrl.slice(0, k_maxChars) + '…'
      : v_fullUrl;

    /* Mostrar panel y hacer scroll */
    k_qrResult.classList.remove('hidden');
    k_qrResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (v_err) {
    console.error('[Vytaris] Error generando QR:', v_err);
    alert('No se pudo generar el QR. Revisa tu conexión e intenta de nuevo.');
  } finally {
    /* Restaurar botón */
    k_btnGenerate.disabled = false;
    k_btnGenerate.innerHTML = `${k_svgZap} Generar código QR`;
  }
};

/**
 * Descarga el QR como archivo PNG usando el dataURL guardado.
 */
const m_downloadQR = () => {
  if (!v_currentQRDataUrl) {
    alert('Primero genera el código QR.');
    return;
  }
  const v_a      = document.createElement('a');
  v_a.download   = 'vytaris-qr-medico.png';
  v_a.href       = v_currentQRDataUrl;
  document.body.appendChild(v_a);
  v_a.click();
  document.body.removeChild(v_a);
};

/**
 * Limpia el formulario y vuelve al estado inicial.
 */
const m_resetForm = () => {
  k_profileForm.reset();
  m_clearError(k_inputName,    k_errorName);
  m_clearError(k_inputContact, k_errorContact);
  m_clearError(k_selectBlood,  k_errorBlood);

  k_qrCanvas.innerHTML    = '';
  k_qrUrlPreview.textContent = '';
  v_currentQRDataUrl      = null;
  k_qrResult.classList.add('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  k_inputName.focus();
};

/* ================================================================
   8 — TARJETA DE EMERGENCIA (modo lectura)
   ================================================================ */

/**
 * Sanitiza un string para evitar XSS al inyectarlo con innerHTML.
 * @param {string} p_str
 * @returns {string}
 */
const m_sanitize = (p_str) => {
  const v_d       = document.createElement('div');
  v_d.textContent = String(p_str || '');
  return v_d.innerHTML;
};

/**
 * Genera el HTML de un campo de la tarjeta médica.
 * @param {string}  p_iconSvg  — string SVG del icono
 * @param {string}  p_label    — etiqueta visible
 * @param {string}  p_value    — valor (vacío → "No especificado")
 * @param {boolean} p_isAlert  — true = estilo naranja de alerta
 * @returns {string} HTML
 */
const m_buildCardField = (p_iconSvg, p_label, p_value, p_isAlert = false) => {
  if (!p_value || !p_value.trim()) {
    return `<div class="mc-section">
      <div class="mc-label">${p_iconSvg}${p_label}</div>
      <div class="mc-value mc-value--none">No especificado</div>
    </div>`;
  }
  const v_cls = p_isAlert ? 'mc-value--alert' : '';
  return `<div class="mc-section">
    <div class="mc-label">${p_iconSvg}${p_label}</div>
    <div class="mc-value ${v_cls}">${m_sanitize(p_value)}</div>
  </div>`;
};

/**
 * Extrae el primer número telefónico del texto libre del campo contacto.
 * @param {string} p_text
 * @returns {string|null}
 */
const m_extractPhone = (p_text) => {
  const v_m = p_text.match(/[\d\s\-\(\)\+]{7,}/);
  return v_m ? v_m[0].replace(/[^\d+]/g, '') : null;
};

/**
 * Renderiza la tarjeta médica completa en #k-medical-card.
 * Orden visual optimizado para lectura rápida del paramédico:
 * Nombre → Sangre → Alergias → Condiciones → Contacto → Llamar
 * @param {Object} p_data
 */
const m_renderEmergencyCard = (p_data) => {
  const v_name  = m_sanitize(p_data.nombre) || 'Sin nombre registrado';
  const v_blood = m_sanitize(p_data.sangre) || '?';
  const v_phone = m_extractPhone(p_data.contacto || '');

  const v_callBtn = v_phone
    ? `<a href="tel:${v_phone}" class="btn--call" aria-label="Llamar al contacto de emergencia">
         ${k_svgCall} Llamar al contacto de emergencia
       </a>`
    : '';

  k_medicalCard.innerHTML = `
    <div class="mc-header">
      <div class="mc-name">${v_name}</div>
      <div class="mc-blood-badge" aria-label="Tipo de sangre ${v_blood}">${v_blood}</div>
      <span class="mc-blood-label">Tipo de sangre</span>
    </div>
    <div class="mc-body">
      ${m_buildCardField(k_svgWarn,  'Alergias conocidas',    p_data.alergias,    true)}
      ${m_buildCardField(k_svgCross, 'Enfermedades crónicas', p_data.condiciones, true)}
      <hr class="mc-divider"/>
      ${m_buildCardField(k_svgPhone, 'Contacto de emergencia', p_data.contacto)}
      ${m_buildCardField(k_svgPin,   'Código postal',          p_data.postal)}
      ${v_callBtn}
    </div>`;
};

/**
 * Muestra un mensaje de error cuando el QR está dañado.
 */
const m_renderDecodeError = () => {
  k_medicalCard.innerHTML = `
    <div class="mc-body" style="padding:2.5rem 1.25rem;text-align:center">
      <div style="font-size:3rem;margin-bottom:1rem">
        <svg style="width:3rem;height:3rem;color:#C0392B" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <div class="mc-value mc-value--alert" style="text-align:center;font-size:1rem">
        El código QR está dañado o es inválido.<br/>No se pudo leer la información médica.
      </div>
    </div>`;
};

/* ================================================================
   9 — ENRUTADOR CLIENTE
       Sin parámetro → Modo Captura (formulario)
       ?v_info=...   → Modo Perfil  (tarjeta de emergencia)
   ================================================================ */
const m_initApp = () => {
  const v_encoded = m_getUrlParam('v_info');

  if (v_encoded) {
    /* ── MODO PERFIL ── */
    const v_profileData = m_decodeFromBase64(v_encoded);
    k_formSection.classList.add('hidden');
    k_profileSection.classList.remove('hidden');
    v_profileData ? m_renderEmergencyCard(v_profileData) : m_renderDecodeError();

  } else {
    /* ── MODO CAPTURA (default) ── */
    k_formSection.classList.remove('hidden');
    k_profileSection.classList.add('hidden');
  }
};

/* ================================================================
   10 — EVENT LISTENERS
   ================================================================ */
k_btnGenerate.addEventListener('click', m_generateQR);
k_btnDownload.addEventListener('click', m_downloadQR);
k_btnReset.addEventListener('click',    m_resetForm);

/* Limpiar error visual al corregir el campo */
k_inputName.addEventListener('input',    () => m_clearError(k_inputName,    k_errorName));
k_inputContact.addEventListener('input', () => m_clearError(k_inputContact, k_errorContact));
k_selectBlood.addEventListener('change', () => m_clearError(k_selectBlood,  k_errorBlood));

/* Solo dígitos en código postal */
k_inputZip.addEventListener('input', () => {
  k_inputZip.value = k_inputZip.value.replace(/[^\d\s\-]/g, '');
});

/* ================================================================
   ARRANQUE
   ================================================================ */
m_initApp();
