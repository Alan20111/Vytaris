/**
 * ================================================================
 *  VYTARIS — script.js
 *  100% cliente · sin backend · sin base de datos
 *
 *  Convención de nombres:
 *    k_  constantes / referencias DOM
 *    v_  variables locales o de bloque
 *    p_  parámetros de función
 *    m_  funciones / métodos
 *
 *  Librería QR: qrcodejs (davidshimjs) — pura browser, sin bundler.
 *    API: new QRCode(element, opts) — síncrona, crea <canvas> directo.
 * ================================================================
 */

'use strict';

/* ================================================================
   1 — REFERENCIAS DOM
   ================================================================ */
const k_formSection    = document.getElementById('k-form-section');
const k_profileSection = document.getElementById('k-profile-section');

const k_profileForm      = document.getElementById('k-profile-form');
const k_inputName        = document.getElementById('k-input-name');
const k_inputBirthdate   = document.getElementById('k-input-birthdate');
const k_inputZip         = document.getElementById('k-input-zip');
const k_inputContact     = document.getElementById('k-input-contact');
const k_selectBlood      = document.getElementById('k-select-blood');
const k_inputAllergies   = document.getElementById('k-input-allergies');
const k_inputConditions  = document.getElementById('k-input-conditions');

const k_errorName      = document.getElementById('k-error-name');
const k_errorBirthdate = document.getElementById('k-error-birthdate');
const k_errorContact   = document.getElementById('k-error-contact');
const k_errorBlood     = document.getElementById('k-error-blood');

const k_qrResult     = document.getElementById('k-qr-result');
const k_qrCanvas     = document.getElementById('k-qr-canvas');
const k_qrUrlPreview = document.getElementById('k-qr-url-preview');

const k_btnGenerate  = document.getElementById('k-btn-generate');
const k_btnDownload  = document.getElementById('k-btn-download');
const k_btnReset     = document.getElementById('k-btn-reset');

const k_medicalCard  = document.getElementById('k-medical-card');

/* ================================================================
   2 — ICONOS SVG INLINE (para HTML generado dinámicamente en JS)
   ================================================================ */
const k_svgPin   = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"/><circle cx="12" cy="8" r="2.5"/></svg>`;

const k_svgPhone = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.61 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.73 9.77a16 16 0 0 0 6.29 6.29l1.13-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const k_svgWarn  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/></svg>`;

const k_svgCross = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;

const k_svgCall  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.61 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.73 9.77a16 16 0 0 0 6.29 6.29l1.13-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const k_svgZap   = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

const k_svgCake  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M12 8v2"/></svg>`;

/* ================================================================
   3 — ESTADO DEL MÓDULO
   ================================================================ */
let v_qrInstance = null;

/* ================================================================
   4 — CODIFICACIÓN BASE64 (Unicode-safe con TextEncoder/Decoder)
   ================================================================ */

/**
 * Objeto JS → JSON → bytes UTF-8 → Base64.
 * @param {Object} p_data
 * @returns {string}
 */
const m_encodeToBase64 = (p_data) => {
  const v_json   = JSON.stringify(p_data);
  const v_bytes  = new TextEncoder().encode(v_json);
  const v_binary = Array.from(v_bytes, (p_b) => String.fromCharCode(p_b)).join('');
  return btoa(v_binary);
};

/**
 * Base64 → bytes → JSON → objeto JS.
 * @param {string} p_b64
 * @returns {Object|null}
 */
const m_decodeFromBase64 = (p_b64) => {
  try {
    const v_binary = atob(p_b64);
    const v_bytes  = Uint8Array.from(v_binary, (p_c) => p_c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(v_bytes));
  } catch (v_err) {
    console.error('[Vytaris] Base64 decode error:', v_err);
    return null;
  }
};

/* ================================================================
   5 — UTILIDADES DE URL
   ================================================================ */
const m_getUrlParam = (p_key) => new URLSearchParams(window.location.search).get(p_key);

const m_buildProfileUrl = (p_b64) => {
  const k_base = window.location.href.split('?')[0];
  return `${k_base}?v_info=${encodeURIComponent(p_b64)}`;
};

/* ================================================================
   6 — UTILIDADES DE FECHA Y EDAD
   ================================================================ */

/**
 * Calcula la edad exacta en años a partir de una fecha ISO (YYYY-MM-DD).
 * Considera si el cumpleaños ya pasó en el año actual.
 * @param {string} p_isoDate — fecha de nacimiento en formato YYYY-MM-DD
 * @returns {number|null}
 */
const m_calculateAge = (p_isoDate) => {
  if (!p_isoDate) return null;
  const v_today = new Date();
  const v_birth = new Date(p_isoDate);
  if (isNaN(v_birth.getTime())) return null;

  let v_age = v_today.getFullYear() - v_birth.getFullYear();
  const v_monthDiff = v_today.getMonth() - v_birth.getMonth();

  /* Restar 1 si el cumpleaños todavía no ha llegado este año */
  if (v_monthDiff < 0 || (v_monthDiff === 0 && v_today.getDate() < v_birth.getDate())) {
    v_age--;
  }
  return v_age;
};

/**
 * Formatea una fecha ISO a texto legible en español: "01 ene 1999".
 * @param {string} p_isoDate
 * @returns {string}
 */
const m_formatDateES = (p_isoDate) => {
  if (!p_isoDate) return '';
  const k_months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const v_d = new Date(p_isoDate + 'T12:00:00'); /* T12 evita desfase de zona horaria */
  return `${String(v_d.getDate()).padStart(2,'0')} ${k_months[v_d.getMonth()]} ${v_d.getFullYear()}`;
};

/* ================================================================
   7 — VALIDACIÓN DEL FORMULARIO
   ================================================================ */
const m_setError   = (p_input, p_span, p_msg) => { p_input.classList.add('is-invalid');    p_span.textContent = p_msg; };
const m_clearError = (p_input, p_span)         => { p_input.classList.remove('is-invalid'); p_span.textContent = '';    };

/**
 * Valida los campos obligatorios.
 * @returns {Object|null} datos del formulario, o null si hay errores.
 */
const m_validateForm = () => {
  m_clearError(k_inputName,      k_errorName);
  m_clearError(k_inputBirthdate, k_errorBirthdate);
  m_clearError(k_inputContact,   k_errorContact);
  m_clearError(k_selectBlood,    k_errorBlood);

  let v_focus = null;

  if (!k_inputName.value.trim()) {
    m_setError(k_inputName, k_errorName, 'El nombre completo es obligatorio.');
    v_focus = v_focus || k_inputName;
  }

  if (!k_inputBirthdate.value) {
    m_setError(k_inputBirthdate, k_errorBirthdate, 'La fecha de nacimiento es obligatoria.');
    v_focus = v_focus || k_inputBirthdate;
  } else {
    const v_age = m_calculateAge(k_inputBirthdate.value);
    if (v_age === null || v_age < 0 || v_age > 120) {
      m_setError(k_inputBirthdate, k_errorBirthdate, 'Ingresa una fecha de nacimiento válida.');
      v_focus = v_focus || k_inputBirthdate;
    }
  }

  if (!k_inputContact.value.trim()) {
    m_setError(k_inputContact, k_errorContact, 'El contacto de emergencia es obligatorio.');
    v_focus = v_focus || k_inputContact;
  }

  if (!k_selectBlood.value) {
    m_setError(k_selectBlood, k_errorBlood, 'Selecciona tu tipo de sangre.');
    v_focus = v_focus || k_selectBlood;
  }

  if (v_focus) { v_focus.focus(); return null; }

  return {
    nombre:      k_inputName.value.trim(),
    nacimiento:  k_inputBirthdate.value,           /* ISO: YYYY-MM-DD */
    postal:      k_inputZip.value.trim()        || '',
    contacto:    k_inputContact.value.trim(),
    sangre:      k_selectBlood.value,
    alergias:    k_inputAllergies.value.trim()  || '',
    condiciones: k_inputConditions.value.trim() || '',
  };
};

/* ================================================================
   8 — GENERACIÓN Y DESCARGA DEL QR
       qrcodejs → new QRCode(element, opts) — síncrono, sin bundler.
   ================================================================ */

/**
 * Valida, codifica y genera el QR de forma síncrona.
 */
const m_generateQR = () => {
  const v_data = m_validateForm();
  if (!v_data) return;

  const v_b64     = m_encodeToBase64(v_data);
  const v_fullUrl = m_buildProfileUrl(v_b64);

  /* Limpiar QR anterior */
  k_qrCanvas.innerHTML = '';
  v_qrInstance = null;

  /* qrcodejs crea un <canvas> de forma inmediata y síncrona */
  v_qrInstance = new QRCode(k_qrCanvas, {
    text:         v_fullUrl,
    width:        256,
    height:       256,
    colorDark:    '#1a202c',
    colorLight:   '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });

  /* URL truncada de vista previa */
  const k_maxChars = 55;
  k_qrUrlPreview.textContent = v_fullUrl.length > k_maxChars
    ? v_fullUrl.slice(0, k_maxChars) + '…'
    : v_fullUrl;

  k_qrResult.classList.remove('hidden');
  k_qrResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Descarga el <canvas> del QR como archivo PNG.
 */
const m_downloadQR = () => {
  const v_canvas = k_qrCanvas.querySelector('canvas');
  const v_img    = k_qrCanvas.querySelector('img');
  let   v_url    = null;

  if (v_canvas) {
    v_url = v_canvas.toDataURL('image/png');
  } else if (v_img && v_img.src) {
    const v_tmp  = document.createElement('canvas');
    v_tmp.width  = 256;
    v_tmp.height = 256;
    v_tmp.getContext('2d').drawImage(v_img, 0, 0);
    v_url = v_tmp.toDataURL('image/png');
  }

  if (!v_url) { alert('Primero genera el código QR.'); return; }

  const v_a    = document.createElement('a');
  v_a.download = 'vytaris-qr-medico.png';
  v_a.href     = v_url;
  document.body.appendChild(v_a);
  v_a.click();
  document.body.removeChild(v_a);
};

/**
 * Reinicia el formulario al estado inicial.
 */
const m_resetForm = () => {
  k_profileForm.reset();
  m_clearError(k_inputName,      k_errorName);
  m_clearError(k_inputBirthdate, k_errorBirthdate);
  m_clearError(k_inputContact,   k_errorContact);
  m_clearError(k_selectBlood,    k_errorBlood);

  k_qrCanvas.innerHTML       = '';
  k_qrUrlPreview.textContent = '';
  v_qrInstance               = null;
  k_qrResult.classList.add('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  k_inputName.focus();
};

/* ================================================================
   9 — TARJETA DE EMERGENCIA (modo lectura)
   ================================================================ */

/** Sanitiza texto contra XSS antes de inyectarlo con innerHTML. */
const m_sanitize = (p_str) => {
  const v_d = document.createElement('div');
  v_d.textContent = String(p_str || '');
  return v_d.innerHTML;
};

/**
 * Genera el HTML de un campo de la tarjeta médica.
 * @param {string}  p_iconSvg
 * @param {string}  p_label
 * @param {string}  p_value
 * @param {boolean} p_isAlert — true = estilo naranja de alerta
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

/** Extrae el primer número telefónico de un texto libre. */
const m_extractPhone = (p_text) => {
  const v_m = p_text.match(/[\d\s\-\(\)\+]{7,}/);
  return v_m ? v_m[0].replace(/[^\d+]/g, '') : null;
};

/**
 * Renderiza la tarjeta médica completa.
 * Orden de lectura optimizado para paramédico:
 *   Nombre + Edad → Sangre → Alergias → Condiciones → Contacto → CP → Llamar
 * @param {Object} p_data
 */
const m_renderEmergencyCard = (p_data) => {
  const v_name  = m_sanitize(p_data.nombre) || 'Sin nombre registrado';
  const v_blood = m_sanitize(p_data.sangre) || '?';
  const v_phone = m_extractPhone(p_data.contacto || '');

  /* Edad calculada en tiempo real al escanear el QR */
  const v_age     = m_calculateAge(p_data.nacimiento);
  const v_dateStr = m_formatDateES(p_data.nacimiento);

  let v_ageHtml = '';
  if (v_age !== null) {
    v_ageHtml = `<div class="mc-age">${v_age} años &nbsp;·&nbsp; Nacido el ${v_dateStr}</div>`;
  }

  const v_callBtn = v_phone
    ? `<a href="tel:${v_phone}" class="btn--call" aria-label="Llamar al contacto de emergencia">
         ${k_svgCall} Llamar al contacto de emergencia
       </a>`
    : '';

  k_medicalCard.innerHTML = `
    <div class="mc-header">
      <div class="mc-name">${v_name}</div>
      ${v_ageHtml}
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

/** Error cuando el QR está dañado o es inválido. */
const m_renderDecodeError = () => {
  k_medicalCard.innerHTML = `
    <div class="mc-body" style="padding:2.5rem 1.25rem;text-align:center">
      <svg style="width:3rem;height:3rem;color:#C0392B;margin-bottom:1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
      <div class="mc-value mc-value--alert" style="text-align:center;font-size:1rem">
        El código QR está dañado o es inválido.<br/>No se pudo leer la información médica.
      </div>
    </div>`;
};

/* ================================================================
   10 — ENRUTADOR CLIENTE
   ================================================================ */
const m_initApp = () => {
  /* Limitar el selector de fecha al día de hoy (no fechas futuras) */
  k_inputBirthdate.max = new Date().toISOString().split('T')[0];

  const v_encoded = m_getUrlParam('v_info');

  if (v_encoded) {
    /* ── MODO PERFIL DE EMERGENCIA ── */
    const v_data = m_decodeFromBase64(v_encoded);
    k_formSection.classList.add('hidden');
    k_profileSection.classList.remove('hidden');
    v_data ? m_renderEmergencyCard(v_data) : m_renderDecodeError();
  } else {
    /* ── MODO CAPTURA (default) ── */
    k_formSection.classList.remove('hidden');
    k_profileSection.classList.add('hidden');
  }
};

/* ================================================================
   11 — EVENT LISTENERS
   ================================================================ */
k_btnGenerate.addEventListener('click', m_generateQR);
k_btnDownload.addEventListener('click', m_downloadQR);
k_btnReset.addEventListener('click',    m_resetForm);

k_inputName.addEventListener('input',      () => m_clearError(k_inputName,      k_errorName));
k_inputBirthdate.addEventListener('change',() => m_clearError(k_inputBirthdate, k_errorBirthdate));
k_inputContact.addEventListener('input',   () => m_clearError(k_inputContact,   k_errorContact));
k_selectBlood.addEventListener('change',   () => m_clearError(k_selectBlood,    k_errorBlood));

k_inputZip.addEventListener('input', () => {
  k_inputZip.value = k_inputZip.value.replace(/[^\d\s\-]/g, '');
});

/* ================================================================
   ARRANQUE
   ================================================================ */
m_initApp();
