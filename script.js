'use strict';

/*
  VYTARIS — script.js
  Aquí está toda la "lógica" de la app: lo que pasa cuando el usuario
  llena el formulario, genera el QR, o escanea uno existente.

  Convención de nombres usada en este archivo:
    k_  → constante: un valor que nunca cambia (como un botón del HTML)
    v_  → variable: un valor que puede cambiar mientras la app corre
    p_  → parámetro: lo que le pasas a una función
    m_  → función: un bloque de código que hace una tarea
*/


/* ================================================================
   PARTE 1 — CONEXIONES CON EL HTML
   Aquí "buscamos" cada elemento del HTML por su id para poder
   leerlo o modificarlo desde JavaScript.
   Es como poner etiquetas en cajones para saber cuál es cuál.
   ================================================================ */

/* Las dos pantallas principales */
const k_formSection    = document.getElementById('k-form-section');    /* formulario */
const k_profileSection = document.getElementById('k-profile-section'); /* tarjeta de emergencia */

/* Campos del formulario */
const k_profileForm     = document.getElementById('k-profile-form');
const k_inputName       = document.getElementById('k-input-name');
const k_inputBirthdate  = document.getElementById('k-input-birthdate');
const k_inputZip        = document.getElementById('k-input-zip');
const k_inputContact    = document.getElementById('k-input-contact');
const k_selectBlood     = document.getElementById('k-select-blood');
const k_inputAllergies  = document.getElementById('k-input-allergies');
const k_inputConditions = document.getElementById('k-input-conditions');

/* Mensajes de error de cada campo */
const k_errorName      = document.getElementById('k-error-name');
const k_errorBirthdate = document.getElementById('k-error-birthdate');
const k_errorContact   = document.getElementById('k-error-contact');
const k_errorBlood     = document.getElementById('k-error-blood');

/* Sección del QR generado */
const k_qrResult     = document.getElementById('k-qr-result');
const k_qrCanvas     = document.getElementById('k-qr-canvas');
const k_qrUrlPreview = document.getElementById('k-qr-url-preview');

/* Botones */
const k_btnGenerate = document.getElementById('k-btn-generate');
const k_btnDownload = document.getElementById('k-btn-download');
const k_btnReset    = document.getElementById('k-btn-reset');

/* Contenedor donde se ponen los datos médicos en la pantalla de emergencia */
const k_medicalCard = document.getElementById('k-medical-card');


/* ================================================================
   PARTE 2 — ÍCONOS SVG PARA EL CÓDIGO JAVASCRIPT
   Cuando el JS construye la tarjeta de emergencia dinámicamente,
   necesita los íconos como texto HTML listo para insertar.
   (Los íconos del formulario están directamente en el index.html)
   ================================================================ */
const k_svgPhone = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.61 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.73 9.77a16 16 0 0 0 6.29 6.29l1.13-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const k_svgPin   = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"/><circle cx="12" cy="8" r="2.5"/></svg>`;
const k_svgWarn  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/></svg>`;
const k_svgCross = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
const k_svgCall  = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.61 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.73 9.77a16 16 0 0 0 6.29 6.29l1.13-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;


/* ================================================================
   PARTE 3 — CODIFICAR Y DECODIFICAR LOS DATOS
   Los datos del usuario se guardan DENTRO de la URL del QR.
   Para que quepan y no se rompan, los convertimos a Base64:
   un formato de texto que solo usa letras, números y símbolos seguros.

   Es como traducir un mensaje al "idioma del QR".
   ================================================================ */

/* Convierte los datos del formulario en un texto Base64 para meterlo en la URL */
const m_codificar = (p_datos) => {
  const v_json   = JSON.stringify(p_datos);               /* objeto → texto JSON */
  const v_bytes  = new TextEncoder().encode(v_json);      /* texto → bytes (soporta tildes y ñ) */
  const v_binario = Array.from(v_bytes, b => String.fromCharCode(b)).join('');
  return btoa(v_binario);                                 /* bytes → Base64 */
};

/* Hace lo contrario: toma el Base64 de la URL y devuelve los datos originales */
const m_decodificar = (p_base64) => {
  try {
    const v_binario = atob(p_base64);
    const v_bytes   = Uint8Array.from(v_binario, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(v_bytes)); /* Base64 → bytes → JSON → objeto */
  } catch (v_err) {
    console.error('[Vytaris] Error al decodificar:', v_err);
    return null; /* si algo sale mal, devuelve null */
  }
};


/* ================================================================
   PARTE 4 — MANEJAR LA URL
   La app usa la URL para saber en qué modo estar:
     • Sin "?v_info=" → muestra el formulario
     • Con "?v_info=..." → muestra la tarjeta de emergencia
   ================================================================ */

/* Lee un parámetro de la URL — ej: si la URL tiene "?v_info=ABC" devuelve "ABC" */
const m_leerParam = (p_nombre) => new URLSearchParams(window.location.search).get(p_nombre);

/* Construye la URL completa con los datos codificados para meterla en el QR */
const m_construirUrl = (p_base64) => {
  const k_base = window.location.href.split('?')[0]; /* quita todo lo que venga después de "?" */
  return `${k_base}?v_info=${encodeURIComponent(p_base64)}`;
};


/* ================================================================
   PARTE 5 — CALCULAR EDAD Y FORMATEAR FECHAS
   ================================================================ */

/* Calcula cuántos años tiene alguien a partir de su fecha de nacimiento */
const m_calcularEdad = (p_fechaISO) => {
  if (!p_fechaISO) return null;
  const v_hoy       = new Date();
  const v_nacimiento = new Date(p_fechaISO);
  if (isNaN(v_nacimiento.getTime())) return null;

  let v_edad = v_hoy.getFullYear() - v_nacimiento.getFullYear();
  const v_diffMes = v_hoy.getMonth() - v_nacimiento.getMonth();

  /* Si el cumpleaños de este año todavía no ha llegado, quitamos 1 año */
  if (v_diffMes < 0 || (v_diffMes === 0 && v_hoy.getDate() < v_nacimiento.getDate())) {
    v_edad--;
  }
  return v_edad;
};

/* Convierte "1999-05-21" a "21 may 1999" (formato legible en español) */
const m_formatearFecha = (p_fechaISO) => {
  if (!p_fechaISO) return '';
  const k_meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const v_fecha = new Date(p_fechaISO + 'T12:00:00'); /* T12 evita errores de zona horaria */
  return `${String(v_fecha.getDate()).padStart(2,'0')} ${k_meses[v_fecha.getMonth()]} ${v_fecha.getFullYear()}`;
};


/* ================================================================
   PARTE 6 — VALIDAR EL FORMULARIO
   Antes de generar el QR, revisamos que los campos obligatorios
   estén llenos y que los datos tengan sentido.
   ================================================================ */

/* Marca un campo como inválido y muestra el mensaje de error */
const m_mostrarError = (p_input, p_span, p_msg) => {
  p_input.classList.add('is-invalid');
  p_span.textContent = p_msg;
};

/* Quita el error de un campo */
const m_quitarError = (p_input, p_span) => {
  p_input.classList.remove('is-invalid');
  p_span.textContent = '';
};

/* Valida todos los campos y devuelve los datos si todo está bien, o null si hay errores */
const m_validarFormulario = () => {
  /* Primero limpiamos cualquier error anterior */
  m_quitarError(k_inputName,      k_errorName);
  m_quitarError(k_inputBirthdate, k_errorBirthdate);
  m_quitarError(k_inputContact,   k_errorContact);
  m_quitarError(k_selectBlood,    k_errorBlood);

  let v_primerCampoConError = null;

  if (!k_inputName.value.trim()) {
    m_mostrarError(k_inputName, k_errorName, 'El nombre completo es obligatorio.');
    v_primerCampoConError = v_primerCampoConError || k_inputName;
  }

  if (!k_inputBirthdate.value) {
    m_mostrarError(k_inputBirthdate, k_errorBirthdate, 'La fecha de nacimiento es obligatoria.');
    v_primerCampoConError = v_primerCampoConError || k_inputBirthdate;
  } else {
    const v_edad = m_calcularEdad(k_inputBirthdate.value);
    if (v_edad === null || v_edad < 0 || v_edad > 120) {
      m_mostrarError(k_inputBirthdate, k_errorBirthdate, 'Ingresa una fecha de nacimiento válida.');
      v_primerCampoConError = v_primerCampoConError || k_inputBirthdate;
    }
  }

  if (!k_inputContact.value.trim()) {
    m_mostrarError(k_inputContact, k_errorContact, 'El contacto de emergencia es obligatorio.');
    v_primerCampoConError = v_primerCampoConError || k_inputContact;
  }

  if (!k_selectBlood.value) {
    m_mostrarError(k_selectBlood, k_errorBlood, 'Selecciona tu tipo de sangre.');
    v_primerCampoConError = v_primerCampoConError || k_selectBlood;
  }

  /* Si hubo algún error, movemos el cursor al primer campo problemático y paramos */
  if (v_primerCampoConError) {
    v_primerCampoConError.focus();
    return null;
  }

  /* Todo está bien: devolvemos los datos como objeto */
  return {
    nombre:      k_inputName.value.trim(),
    nacimiento:  k_inputBirthdate.value,
    postal:      k_inputZip.value.trim()        || '',
    contacto:    k_inputContact.value.trim(),
    sangre:      k_selectBlood.value,
    alergias:    k_inputAllergies.value.trim()  || '',
    condiciones: k_inputConditions.value.trim() || '',
  };
};


/* ================================================================
   PARTE 7 — GENERAR Y DESCARGAR EL QR
   ================================================================ */

/* Toma los datos del formulario, los codifica, y genera el código QR */
const m_generarQR = () => {
  const v_datos = m_validarFormulario();
  if (!v_datos) return; /* si hay errores, no hacemos nada */

  const v_base64   = m_codificar(v_datos);
  const v_urlFinal = m_construirUrl(v_base64);

  /* Borramos cualquier QR anterior antes de crear el nuevo */
  k_qrCanvas.innerHTML = '';

  /* La librería QRCode dibuja el código en el elemento k_qrCanvas */
  new QRCode(k_qrCanvas, {
    text:         v_urlFinal,
    width:        256,
    height:       256,
    colorDark:    '#1a202c',
    colorLight:   '#ffffff',
    correctLevel: QRCode.CorrectLevel.H, /* corrección alta: el QR sigue funcionando aunque esté un poco dañado */
  });

  /* Mostramos un pedacito de la URL debajo del QR */
  k_qrUrlPreview.textContent = v_urlFinal.length > 55
    ? v_urlFinal.slice(0, 55) + '…'
    : v_urlFinal;

  /* Hacemos visible la sección del QR y hacemos scroll hasta ella */
  k_qrResult.classList.remove('hidden');
  k_qrResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* Descarga el QR como imagen PNG para poder imprimirlo */
const m_descargarQR = () => {
  const v_canvas = k_qrCanvas.querySelector('canvas');
  if (!v_canvas) { alert('Primero genera el código QR.'); return; }

  /* Creamos un link invisible, lo "clickeamos" para descargar, y lo borramos */
  const v_link    = document.createElement('a');
  v_link.download = 'vytaris-qr-medico.png';
  v_link.href     = v_canvas.toDataURL('image/png');
  document.body.appendChild(v_link);
  v_link.click();
  document.body.removeChild(v_link);
};

/* Limpia todo y vuelve al formulario en blanco */
const m_reiniciar = () => {
  k_profileForm.reset();

  /* Quitamos todos los mensajes de error */
  m_quitarError(k_inputName,      k_errorName);
  m_quitarError(k_inputBirthdate, k_errorBirthdate);
  m_quitarError(k_inputContact,   k_errorContact);
  m_quitarError(k_selectBlood,    k_errorBlood);

  /* Ocultamos el panel del QR y lo limpiamos */
  k_qrCanvas.innerHTML       = '';
  k_qrUrlPreview.textContent = '';
  k_qrResult.classList.add('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  k_inputName.focus();
};


/* ================================================================
   PARTE 8 — CONSTRUIR LA TARJETA DE EMERGENCIA
   Cuando alguien escanea el QR, esta parte arma la pantalla
   que le muestra la información médica al paramédico.
   ================================================================ */

/* Limpia el texto para que nadie pueda meter código peligroso en los datos del QR */
const m_limpiarTexto = (p_str) => {
  const v_div = document.createElement('div');
  v_div.textContent = String(p_str || '');
  return v_div.innerHTML;
};

/* Construye una "fila" de información dentro de la tarjeta médica */
const m_crearFila = (p_icono, p_etiqueta, p_valor, p_esAlerta = false) => {
  if (!p_valor || !p_valor.trim()) {
    return `<div class="mc-section">
      <div class="mc-label">${p_icono}${p_etiqueta}</div>
      <div class="mc-value mc-value--none">No especificado</div>
    </div>`;
  }
  return `<div class="mc-section">
    <div class="mc-label">${p_icono}${p_etiqueta}</div>
    <div class="mc-value ${p_esAlerta ? 'mc-value--alert' : ''}">${m_limpiarTexto(p_valor)}</div>
  </div>`;
};

/* Busca si hay un número de teléfono en el texto del contacto */
const m_extraerTelefono = (p_texto) => {
  const v_match = p_texto.match(/[\d\s\-\(\)\+]{7,}/);
  return v_match ? v_match[0].replace(/[^\d+]/g, '') : null;
};

/* Dibuja la tarjeta completa con todos los datos de la persona */
const m_mostrarTarjetaEmergencia = (p_datos) => {
  const v_nombre   = m_limpiarTexto(p_datos.nombre) || 'Sin nombre registrado';
  const v_sangre   = m_limpiarTexto(p_datos.sangre) || '?';
  const v_telefono = m_extraerTelefono(p_datos.contacto || '');
  const v_edad     = m_calcularEdad(p_datos.nacimiento);
  const v_fecha    = m_formatearFecha(p_datos.nacimiento);

  /* La edad se calcula en tiempo real — si alguien escanea el QR años después, saldrá la edad correcta */
  const v_htmlEdad = v_edad !== null
    ? `<div class="mc-age">${v_edad} años &nbsp;·&nbsp; Nacido el ${v_fecha}</div>`
    : '';

  /* Botón de llamada directa si encontramos un número en el texto del contacto */
  const v_htmlLlamar = v_telefono
    ? `<a href="tel:${v_telefono}" class="btn--call" aria-label="Llamar al contacto de emergencia">
         ${k_svgCall} Llamar al contacto de emergencia
       </a>`
    : '';

  k_medicalCard.innerHTML = `
    <div class="mc-header">
      <div class="mc-name">${v_nombre}</div>
      ${v_htmlEdad}
      <div class="mc-blood-badge" aria-label="Tipo de sangre ${v_sangre}">${v_sangre}</div>
      <span class="mc-blood-label">Tipo de sangre</span>
    </div>
    <div class="mc-body">
      ${m_crearFila(k_svgWarn,  'Alergias conocidas',    p_datos.alergias,    true)}
      ${m_crearFila(k_svgCross, 'Enfermedades crónicas', p_datos.condiciones, true)}
      <hr class="mc-divider"/>
      ${m_crearFila(k_svgPhone, 'Contacto de emergencia', p_datos.contacto)}
      ${m_crearFila(k_svgPin,   'Código postal',           p_datos.postal)}
      ${v_htmlLlamar}
    </div>`;
};

/* Si el QR está roto o los datos son inválidos, mostramos este mensaje de error */
const m_mostrarErrorDecodificacion = () => {
  k_medicalCard.innerHTML = `
    <div class="mc-body" style="padding:2.5rem 1.25rem;text-align:center">
      <svg style="width:3rem;height:3rem;color:#C0392B;margin-bottom:1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
      <div class="mc-value mc-value--alert" style="text-align:center;font-size:1rem">
        El código QR está dañado o es inválido.<br/>No se pudo leer la información médica.
      </div>
    </div>`;
};


/* ================================================================
   PARTE 9 — ARRANQUE DE LA APP
   Esta función se ejecuta una sola vez cuando carga la página.
   Decide qué pantalla mostrar según si la URL tiene datos o no.
   ================================================================ */
const m_iniciar = () => {
  /* Bloqueamos fechas futuras en el campo de nacimiento */
  k_inputBirthdate.max = new Date().toISOString().split('T')[0];

  const v_datosEnUrl = m_leerParam('v_info');

  if (v_datosEnUrl) {
    /* La URL tiene datos → modo TARJETA DE EMERGENCIA */
    const v_datos = m_decodificar(v_datosEnUrl);
    k_formSection.classList.add('hidden');
    k_profileSection.classList.remove('hidden');
    v_datos ? m_mostrarTarjetaEmergencia(v_datos) : m_mostrarErrorDecodificacion();
  } else {
    /* La URL no tiene datos → modo FORMULARIO */
    k_formSection.classList.remove('hidden');
    k_profileSection.classList.add('hidden');
  }
};


/* ================================================================
   PARTE 10 — EVENTOS
   Conectamos cada botón y campo con su función correspondiente.
   "addEventListener" es como decir: "cuando pase X, haz Y".
   ================================================================ */

/* Botones principales */
k_btnGenerate.addEventListener('click', m_generarQR);
k_btnDownload.addEventListener('click', m_descargarQR);
k_btnReset.addEventListener('click',    m_reiniciar);

/* Quitamos el error de un campo en cuanto el usuario empieza a corregirlo */
k_inputName.addEventListener('input',       () => m_quitarError(k_inputName,      k_errorName));
k_inputBirthdate.addEventListener('change', () => m_quitarError(k_inputBirthdate, k_errorBirthdate));
k_inputContact.addEventListener('input',    () => m_quitarError(k_inputContact,   k_errorContact));
k_selectBlood.addEventListener('change',    () => m_quitarError(k_selectBlood,    k_errorBlood));

/* El campo de código postal solo acepta números */
k_inputZip.addEventListener('input', () => {
  k_inputZip.value = k_inputZip.value.replace(/[^\d\s\-]/g, '');
});


/* ================================================================
   ¡ARRANCAR!
   Esta es la única línea que se ejecuta directamente.
   Llama a m_iniciar(), que a su vez llama a todo lo demás.
   ================================================================ */
m_iniciar();
