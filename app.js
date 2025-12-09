// app.js - versión consolidada

const DEFAULT_CHECKLIST = [
  "Mapas",
  "Silbato",
  "Tabletas (medicamentos)",
  "Linternas",
  "Cosas de higiene personal",
  "Toallas",
  "Dinero en efectivo",
  "Llaves extras",
  "Alimento no perecedero",
  "Mascarillas (barbijos)",
  "Una biblia",
  "Fotografías de familiares"
];

const guias = {
  sismos: `
<h3>Guía para Sismos</h3>
<p>✔ Mantén la calma.</p>
<p>✔ Aléjate de ventanas.</p>
<p>✔ Ubícate debajo de una mesa resistente.</p>
<p>✔ No uses ascensores.</p>
`,
  incendios: `
<h3>Guía para Incendios</h3>
<p>✔ Sal inmediatamente del lugar.</p>
<p>✔ Cúbrete la boca con un paño húmedo.</p>
<p>✔ No regreses por objetos.</p>
`,
  inundaciones: `
<h3>Guía para Inundaciones</h3>
<p>✔ Desconecta la energía eléctrica.</p>
<p>✔ No cruces corrientes de agua.</p>
<p>✔ Mantén una ruta de evacuación.</p>
`
};

let lista;
// items marcados en la mini-checklist (guardados por texto)
let checkedItems = [];

function mostrarSeccion(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('visible'));
  const el = document.getElementById(id);
  if (el) el.classList.add('visible');
}

function cargarChecklist() {
  const ul = document.getElementById('listaChecklist');
  if (!ul) return;
  ul.innerHTML = '';
  lista.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${escapeHtml(item)} <button class="btn-small" onclick="eliminarItem(${index})">Eliminar</button>`;
    ul.appendChild(li);
  });
  // actualizar mini-checklist (en Inicio)
  if(typeof renderMiniChecklist === 'function') renderMiniChecklist();
}

function agregarItem() {
  const campo = document.getElementById('nuevoItem');
  if (!campo) return;
  const valor = campo.value;
  if (valor.trim() !== '') {
    lista.push(valor.trim());
    guardar();
    cargarChecklist();
    campo.value = '';
  }
}

function eliminarItem(i) {
  lista.splice(i, 1);
  guardar();
  cargarChecklist();
}

function guardar() {
  localStorage.setItem('checklist', JSON.stringify(lista));
}

function restablecerChecklist(){
  if(!confirm('¿Deseas restablecer la checklist a los ítems por defecto? Se sobrescribirá tu checklist actual.')) return;
  lista = DEFAULT_CHECKLIST.slice();
  checkedItems = [];
  try{ localStorage.removeItem('checklistChecked'); }catch(e){}
  guardar();
  cargarChecklist();
  alert('Checklist restablecida a los valores por defecto.');
}

function copiarChecklist(){
  const text = lista.map((i,idx)=>`${idx+1}. ${i}`).join('\n');
  if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(()=> alert('Checklist copiado al portapapeles'));
  } else {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); alert('Checklist copiado');
  }
}

function imprimirChecklist(){
  const contenido = lista.map(i=>`<li>${escapeHtml(i)}</li>`).join('');
  const w = window.open('','_blank');
  w.document.write(`<html><head><title>Checklist</title><style>body{font-family:Arial;padding:20px}ul{}</style></head><body><h2>Checklist de emergencia</h2><ul>${contenido}</ul></body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

// --- Video: guardar/cargar y renderizar ---
function saveVideoUrl(url){
  try{ localStorage.setItem('emVideo', url); }catch(e){}
}

function loadVideoUrl(){
  try{ return localStorage.getItem('emVideo') || ''; }catch(e){ return ''; }
}

function renderVideo(){
  const container = document.getElementById('videoContainer');
  const containerInicio = document.getElementById('videoContainerInicio');
  const input = document.getElementById('videoUrl');
  if(!container) return;
  const url = loadVideoUrl();
  if(url){
    // Soporte para archivos locales (videos/*.mp4, .webm, .ogg)
    const lower = url.toLowerCase();
    const isLocalVideo = lower.startsWith('videos/') || /\.(mp4|webm|ogg)$/.test(lower);
    if(isLocalVideo){
      // Renderizar etiqueta <video>
      const src = escapeHtml(url);
      container.innerHTML = `<video controls src="${src}">Tu navegador no soporta video HTML5.</video>`;
      if(containerInicio) containerInicio.innerHTML = `<video controls src="${src}">Tu navegador no soporta video HTML5.</video>`;
    } else {
      let embed = url;
      if(url.includes('watch?v=')) embed = url.replace('watch?v=', 'embed/');
      if(url.includes('youtu.be/')) embed = url.replace('youtu.be/', 'www.youtube.com/embed/');
      if(!/^https?:\/\//i.test(embed)) embed = 'https://' + embed;
      container.innerHTML = `<iframe src="${escapeHtml(embed)}" allowfullscreen></iframe>`;
      if(containerInicio) containerInicio.innerHTML = `<iframe src="${escapeHtml(embed)}" allowfullscreen></iframe>`;
    }
    if(input) input.value = url;
  } else {
    container.innerHTML = '<p class="muted">No hay video cargado.</p>';
    if(containerInicio) containerInicio.innerHTML = '<p class="muted">No hay video cargado.</p>';
    if(input) input.value = '';
  }
}

function cargarVideo(){
  const input = document.getElementById('videoUrl');
  if(!input) return;
  const url = input.value.trim();
  if(!url){ alert('Introduce la URL del video'); return; }
  saveVideoUrl(url);
  renderVideo();
  alert('Video guardado localmente.');
}

function borrarVideo(){
  try{ localStorage.removeItem('emVideo'); }catch(e){}
  renderVideo();
}

// ---- Mini-checklist: persistencia y render ----
function loadCheckedItems(){
  try{
    const saved = JSON.parse(localStorage.getItem('checklistChecked'));
    if(Array.isArray(saved)) checkedItems = saved.slice();
    else checkedItems = [];
  }catch(e){ checkedItems = []; }
}

function saveCheckedItems(){
  try{ localStorage.setItem('checklistChecked', JSON.stringify(checkedItems)); }catch(e){}
}

function renderMiniChecklist(){
  const cont = document.getElementById('miniChecklistContainer');
  if(!cont) return;
  cont.innerHTML = '';
  lista.forEach(item=>{
    const safeId = 'mini-' + item.replace(/[^a-z0-9]/gi,'_');
    const wrapper = document.createElement('div');
    wrapper.className = 'mini-item';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = safeId;
    chk.checked = checkedItems.indexOf(item) !== -1;
    chk.addEventListener('change', ()=> toggleMiniItem(item, chk.checked));
    const label = document.createElement('label');
    label.htmlFor = safeId;
    label.textContent = item;
    wrapper.appendChild(chk);
    wrapper.appendChild(label);
    cont.appendChild(wrapper);
  });
}

function toggleMiniItem(item, checked){
  if(checked){
    if(checkedItems.indexOf(item) === -1) checkedItems.push(item);
  } else {
    const i = checkedItems.indexOf(item);
    if(i !== -1) checkedItems.splice(i,1);
  }
  saveCheckedItems();
}

function renderGuias(){
  const cont = document.getElementById('contenidoGuias');
  if(!cont) return;
  cont.innerHTML = '';
  const keys = Object.keys(guias);
  const list = document.createElement('div');
  list.className = 'guias-list';
  keys.forEach(k=>{
    const btn = document.createElement('button');
    btn.textContent = k.charAt(0).toUpperCase() + k.slice(1);
    btn.onclick = ()=> showGuia(k);
    list.appendChild(btn);
  });
  cont.appendChild(list);
  const detail = document.createElement('div');
  detail.id = 'guiaDetalle';
  detail.className = 'guia-detalle';
  cont.appendChild(detail);
}

function showGuia(key){
  const detalle = document.getElementById('guiaDetalle');
  if(!detalle) return;
  detalle.innerHTML = guias[key] || '<p>Guía no disponible.</p>';
}

function escapeHtml(str){
  return String(str).replace(/[&<>"'`]/g, s=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'
  }[s]));
}

// Inicialización
document.addEventListener('DOMContentLoaded', ()=>{
  // carga desde localStorage o valores por defecto
  try{
    const saved = JSON.parse(localStorage.getItem('checklist'));
    if(Array.isArray(saved) && saved.length>0) lista = saved.slice();
    else lista = DEFAULT_CHECKLIST.slice();
  }catch(e){ lista = DEFAULT_CHECKLIST.slice(); }
  // cargar items marcados y mostrar checklist inmediatamente
  loadCheckedItems();
  // Si el usuario pidió cargar un video local, lo guardamos ahora (sobrescribe cualquiera anterior)
  try{ saveVideoUrl('videos/jwb_S_201707_06_r720P.mp4'); }catch(e){}
  // mostrar checklist (o la sección que prefieras) y renderizar
  mostrarSeccion('checklist');
  cargarChecklist();
  renderVideo();
  renderGuias();
  const keys = Object.keys(guias);
  if(keys.length) showGuia(keys[0]);
});