// ========== STATE ==========
let mesaSeleccionada = null;
let carritoItems = [];
let categoriaActiva = 'Parrilla';

let state = {
  mesas: [
    {id:1, capacidad:4, estado:'libre', nombre:''},
    {id:2, capacidad:2, estado:'ocupada', nombre:'', hora:'19:30'},
    {id:3, capacidad:6, estado:'libre', nombre:''},
    {id:4, capacidad:4, estado:'reservada', nombre:'López', hora:'21:00'},
    {id:5, capacidad:8, estado:'libre', nombre:''},
    {id:6, capacidad:4, estado:'ocupada', nombre:'', hora:'20:00'},
    {id:7, capacidad:2, estado:'libre', nombre:''},
    {id:8, capacidad:4, estado:'libre', nombre:''},
    {id:9, capacidad:6, estado:'reservada', nombre:'González', hora:'20:30'},
    {id:10, capacidad:4, estado:'libre', nombre:''},
    {id:11, capacidad:4, estado:'ocupada', nombre:'', hora:'18:45'},
    {id:12, capacidad:2, estado:'libre', nombre:''},
  ],
  reservas: [
    {id:1, cliente:'Familia López', mesa:4, hora:'21:00', personas:4, notas:'Cumpleaños'},
    {id:2, cliente:'González', mesa:9, hora:'20:30', personas:6, notas:''},
  ],
  menu: [
    {id:1, nombre:'Tira de asado', desc:'Corte tradicional a las brasas', precio:950, cat:'Parrilla'},
    {id:2, nombre:'Vacío entero', desc:'800g, jugoso y tierno', precio:1100, cat:'Parrilla'},
    {id:3, nombre:'Chorizo artesanal', desc:'Con chimichurri casero', precio:420, cat:'Parrilla'},
    {id:4, nombre:'Morcilla', desc:'Criolla, especiada', precio:380, cat:'Parrilla'},
    {id:5, nombre:'Bondiola', desc:'A la parrilla, con salsa', precio:720, cat:'Parrilla'},
    {id:6, nombre:'Provoleta', desc:'Con orégano y aceite de oliva', precio:550, cat:'Entradas'},
    {id:7, nombre:'Empanadas x6', desc:'Carne cortada a cuchillo', precio:480, cat:'Entradas'},
    {id:8, nombre:'Tabla de embutidos', desc:'Selección de fiambres y quesos', precio:750, cat:'Entradas'},
    {id:9, nombre:'Ensalada mixta', desc:'Lechuga, tomate, cebolla', precio:320, cat:'Guarniciones'},
    {id:10, nombre:'Papas fritas', desc:'Con sal gruesa', precio:280, cat:'Guarniciones'},
    {id:11, nombre:'Papas al plomo', desc:'Con manteca y ciboulette', precio:310, cat:'Guarniciones'},
    {id:12, nombre:'Coca-Cola', desc:'500ml, fría', precio:200, cat:'Bebidas'},
    {id:13, nombre:'Agua mineral', desc:'500ml', precio:150, cat:'Bebidas'},
    {id:14, nombre:'Cerveza artesanal', desc:'Rubia, 500cc', precio:450, cat:'Bebidas'},
    {id:15, nombre:'Vino malbec', desc:'Copa 150ml, Mendoza', precio:520, cat:'Bebidas'},
    {id:16, nombre:'Flan casero', desc:'Con dulce de leche y crema', precio:320, cat:'Postres'},
    {id:17, nombre:'Crème brûlée', desc:'Con frutas rojas', precio:380, cat:'Postres'},
  ],
  pedidos: [
    {id:1, mesa:2, estado:'preparando', items:[{menuId:1,qty:2},{menuId:3,qty:1},{menuId:12,qty:2}], hora:'19:35'},
    {id:2, mesa:6, estado:'pendiente', items:[{menuId:6,qty:1},{menuId:2,qty:1},{menuId:9,qty:2}], hora:'20:05'},
    {id:3, mesa:11, estado:'listo', items:[{menuId:4,qty:2},{menuId:10,qty:1},{menuId:14,qty:3}], hora:'18:50'},
  ],
  facturas: [
    {id:'#0001', mesa:3, total:2150, metodo:'Efectivo', hora:'18:20', items:[{nombre:'Vacío entero',qty:1,precio:1100},{nombre:'Papas fritas',qty:1,precio:280},{nombre:'Cerveza artesanal',qty:2,precio:450},{nombre:'Ensalada mixta',qty:1,precio:320}]},
    {id:'#0002', mesa:7, total:1380, metodo:'Tarjeta', hora:'19:10', items:[{nombre:'Tira de asado',qty:1,precio:950},{nombre:'Chorizo artesanal',qty:1,precio:420},{nombre:'Agua mineral',qty:1,precio:150},{nombre:'Empanadas x6',qty:1,precio:480}]},
    {id:'#0003', mesa:1, total:880, metodo:'QR/Transferencia', hora:'19:55', items:[{nombre:'Chorizo artesanal',qty:2,precio:420},{nombre:'Coca-Cola',qty:2,precio:200}]},
  ],
  nextPedidoId: 4,
  nextFacturaId: 4,
};

// ========== RELOJ ==========
function updateReloj() {
  const now = new Date();
  document.getElementById('reloj').textContent = now.toLocaleTimeString('es-UY', {hour:'2-digit',minute:'2-digit'});
  document.getElementById('fecha').textContent = now.toLocaleDateString('es-UY', {weekday:'short', day:'numeric', month:'short'});
}
setInterval(updateReloj, 1000);
updateReloj();

// ========== NAV ==========
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  btn.classList.add('active');
  if(id==='mesas') renderMesas();
  if(id==='menu') renderMenu();
  if(id==='pedidos') renderPedidos();
  if(id==='caja') renderCaja();
  if(id==='boletas') { initBoletasMesa(); renderBoletaItemsList(); renderBoletasHistorial(state.boletas); }
  if(id==='inventario') renderInventario();
}

// ========== BADGES ==========
function updateBadges() {
  const ocupadas = state.mesas.filter(m=>m.estado==='ocupada').length;
  const activasPedidos = state.pedidos.length;
  const pendientesFactura = state.pedidos.filter(p=>p.estado==='listo').length;
  const bajosInv = state.inventario ? state.inventario.filter(i=>i.stock<=i.minimo).length : 0;
  document.getElementById('badge-mesas').textContent = ocupadas;
  document.getElementById('badge-pedidos').textContent = activasPedidos;
  document.getElementById('badge-caja').textContent = pendientesFactura;
  const invBadge = document.getElementById('badge-inv');
  if(invBadge) { invBadge.textContent = bajosInv||''; invBadge.style.display = bajosInv?'':'none'; }
}

// ========== MESAS ==========
function renderMesas() {
  const grid = document.getElementById('mesa-grid');
  grid.innerHTML = state.mesas.map(m => `
    <div class="mesa ${m.estado}" onclick="selectMesa(${m.id})">
      <div class="mesa-dot"></div>
      <div class="mesa-num">${m.id}</div>
      <div class="mesa-estado">${m.estado === 'libre' ? '🟢 Libre' : m.estado === 'ocupada' ? '🔥 Ocupada' : '📅 Reservada'}</div>
      <div class="mesa-info">${m.capacidad} pers.${m.nombre ? ' · '+m.nombre : ''}${m.hora ? ' · '+m.hora : ''}</div>
    </div>
  `).join('');
  renderReservas();
  updateBadges();
}

function renderReservas() {
  const list = document.getElementById('reservas-list');
  if(state.reservas.length === 0) {
    list.innerHTML = '<div class="text-muted">No hay reservas para hoy.</div>';
    return;
  }
  list.innerHTML = state.reservas.map(r => `
    <div class="factura-row">
      <div class="factura-num">Mesa ${r.mesa}</div>
      <div class="factura-info">
        <div class="factura-desc">${r.cliente}</div>
        <div class="factura-meta">${r.hora} · ${r.personas} personas${r.notas ? ' · '+r.notas : ''}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="eliminarReserva(${r.id})">Eliminar</button>
    </div>
  `).join('');
}

function selectMesa(id) {
  mesaSeleccionada = state.mesas.find(m => m.id === id);
  document.getElementById('modal-mesa-title').textContent = `Mesa ${id} – ${mesaSeleccionada.capacidad} personas`;
  document.getElementById('modal-mesa-info').textContent = `Estado actual: ${mesaSeleccionada.estado}${mesaSeleccionada.nombre?' · '+mesaSeleccionada.nombre:''}`;
  document.getElementById('modal-mesa').classList.add('open');
}

function closeMesaModal() { document.getElementById('modal-mesa').classList.remove('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function cambiarEstadoMesa(estado) {
  mesaSeleccionada.estado = estado;
  if(estado==='libre') { mesaSeleccionada.nombre=''; mesaSeleccionada.hora=''; }
  if(estado==='ocupada') { mesaSeleccionada.hora = new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'}); }
  closeMesaModal();
  renderMesas();
}

function openReservaModal() {
  const sel = document.getElementById('reserva-mesa');
  sel.innerHTML = state.mesas.filter(m=>m.estado!=='reservada').map(m=>`<option value="${m.id}">Mesa ${m.id} (${m.capacidad} pers.)</option>`).join('');
  document.getElementById('modal-reserva').classList.add('open');
}

function confirmarReserva() {
  const nombre = document.getElementById('reserva-nombre').value.trim();
  const mesaId = parseInt(document.getElementById('reserva-mesa').value);
  const hora = document.getElementById('reserva-hora').value;
  const personas = parseInt(document.getElementById('reserva-personas').value);
  const notas = document.getElementById('reserva-notas').value.trim();
  if(!nombre) { alert('Ingresá el nombre del cliente.'); return; }
  const mesa = state.mesas.find(m=>m.id===mesaId);
  mesa.estado = 'reservada';
  mesa.nombre = nombre;
  mesa.hora = hora;
  state.reservas.push({id: Date.now(), cliente: nombre, mesa: mesaId, hora, personas, notas});
  document.getElementById('reserva-nombre').value='';
  closeModal('modal-reserva');
  renderMesas();
}

function eliminarReserva(id) {
  const res = state.reservas.find(r=>r.id===id);
  const mesa = state.mesas.find(m=>m.id===res.mesa);
  if(mesa.estado==='reservada') { mesa.estado='libre'; mesa.nombre=''; mesa.hora=''; }
  state.reservas = state.reservas.filter(r=>r.id!==id);
  renderMesas();
}

// ========== MENÚ ==========
const categorias = ['Parrilla','Entradas','Guarniciones','Bebidas','Postres'];

function renderMenu() {
  const tabs = document.getElementById('cat-tabs');
  tabs.innerHTML = categorias.map(c=>`
    <button class="cat-tab ${c===categoriaActiva?'active':''}" onclick="setCat('${c}')">${getCatEmoji(c)} ${c}</button>
  `).join('');
  const items = state.menu.filter(i=>i.cat===categoriaActiva);
  const grid = document.getElementById('menu-items-grid');
  grid.innerHTML = items.map(item=>`
    <div class="menu-item">
      <div class="menu-item-info">
        <div class="menu-item-name">${item.nombre}</div>
        <div class="menu-item-desc">${item.desc}</div>
      </div>
      <div class="menu-item-price">$${item.precio.toLocaleString('es')}</div>
      <button class="btn btn-danger btn-sm" onclick="eliminarItemMenu(${item.id})">✕</button>
    </div>
  `).join('');
}

function getCatEmoji(c) {
  return {Parrilla:'🥩',Entradas:'🫕',Guarniciones:'🥗',Bebidas:'🍺',Postres:'🍮'}[c]||'';
}

function setCat(c) { categoriaActiva=c; renderMenu(); }

function openAddItemModal() { document.getElementById('modal-add-item').classList.add('open'); }

function agregarItemMenu() {
  const nombre = document.getElementById('item-nombre').value.trim();
  const desc = document.getElementById('item-desc').value.trim();
  const precio = parseInt(document.getElementById('item-precio').value);
  const cat = document.getElementById('item-cat').value;
  if(!nombre||!precio) { alert('Completá nombre y precio.'); return; }
  state.menu.push({id: Date.now(), nombre, desc, precio, cat});
  categoriaActiva = cat;
  document.getElementById('item-nombre').value='';
  document.getElementById('item-desc').value='';
  document.getElementById('item-precio').value='';
  closeModal('modal-add-item');
  renderMenu();
}

function eliminarItemMenu(id) {
  state.menu = state.menu.filter(i=>i.id!==id);
  renderMenu();
}

// ========== PEDIDOS ==========
const estadoLabels = {
  pendiente:'🟡 Pendiente',
  preparando:'🔥 Preparando',
  listo:'✅ Listo',
  entregado:'📦 Entregado'
};
const estadoNext = {pendiente:'preparando', preparando:'listo', listo:'entregado'};
const estadoClass = {pendiente:'estado-pendiente', preparando:'estado-preparando', listo:'estado-listo', entregado:'estado-entregado'};

function renderPedidos() {
  const lista = document.getElementById('pedidos-lista');
  if(state.pedidos.length===0) {
    lista.innerHTML='<div class="text-muted" style="padding:20px 0">No hay comandas activas.</div>';
    updateBadges();
    return;
  }
  lista.innerHTML = state.pedidos.map(p => {
    const total = p.items.reduce((s,i)=>{
      const m=state.menu.find(x=>x.id===i.menuId);
      return s+(m?m.precio*i.qty:0);
    },0);
    const items = p.items.map(i=>{
      const m=state.menu.find(x=>x.id===i.menuId);
      return m?`<div class="pedido-item"><div class="pedido-qty">${i.qty}</div><div style="flex:1">${m.nombre}</div><div class="text-muted text-ember">$${(m.precio*i.qty).toLocaleString('es')}</div></div>`:'';
    }).join('');
    return `
      <div class="pedido-card">
        <div class="pedido-header">
          <div>
            <div class="pedido-title">Mesa ${p.mesa}</div>
            <div class="pedido-mesa">${p.hora} · Comanda #${p.id}</div>
          </div>
          <span class="estado-badge ${estadoClass[p.estado]}">${estadoLabels[p.estado]}</span>
        </div>
        <div class="pedido-body">${items}</div>
        <div class="pedido-footer">
          <div class="fw-bold text-ember">$${total.toLocaleString('es')}</div>
          <div style="display:flex;gap:8px">
            ${estadoNext[p.estado]?`<button class="btn btn-primary btn-sm" onclick="avanzarEstado(${p.id})">→ ${estadoNext[p.estado]==='preparando'?'Preparar':'listo'==='listo'?'Listo':'Listo'}</button>`:''}
            ${p.estado==='listo'?`<button class="btn btn-success btn-sm" onclick="facturarPedido(${p.id})">💵 Facturar</button>`:''}
            <button class="btn btn-danger btn-sm" onclick="eliminarPedido(${p.id})">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');
  updateBadges();
}

function openNuevoPedidoModal() {
  const panel = document.getElementById('carrito-panel');
  panel.style.display = 'block';
  carritoItems = [];
  const sel = document.getElementById('carrito-mesa');
  sel.innerHTML = state.mesas.filter(m=>m.estado==='ocupada').map(m=>`<option value="${m.id}">Mesa ${m.id}</option>`).join('');
  if(!sel.innerHTML) sel.innerHTML='<option value="0">Sin mesas ocupadas</option>';
  renderCarritoMenuList();
  renderCarritoItems();
}

function cancelarCarrito() {
  document.getElementById('carrito-panel').style.display='none';
  carritoItems=[];
}

function renderCarritoMenuList() {
  const list = document.getElementById('carrito-menu-list');
  list.innerHTML = state.menu.map(i=>`
    <div class="ms-item" onclick="addToCarrito(${i.id})">
      <span class="ms-name">${i.nombre}</span>
      <span class="ms-price">$${i.precio.toLocaleString('es')}</span>
    </div>
  `).join('');
}

function addToCarrito(menuId) {
  const existing = carritoItems.find(i=>i.menuId===menuId);
  if(existing) existing.qty++;
  else carritoItems.push({menuId, qty:1});
  renderCarritoItems();
}

function removeFromCarrito(menuId) {
  const existing = carritoItems.find(i=>i.menuId===menuId);
  if(!existing) return;
  if(existing.qty>1) existing.qty--;
  else carritoItems = carritoItems.filter(i=>i.menuId!==menuId);
  renderCarritoItems();
}

function renderCarritoItems() {
  const cont = document.getElementById('carrito-items');
  if(carritoItems.length===0){
    cont.innerHTML='<div class="carrito-empty">Sin items aún</div>';
    document.getElementById('carrito-total-val').textContent='$0';
    return;
  }
  let total = 0;
  cont.innerHTML = carritoItems.map(i=>{
    const m=state.menu.find(x=>x.id===i.menuId);
    if(!m) return '';
    total += m.precio*i.qty;
    return `<div class="carrito-item">
      <span style="flex:1;font-size:0.82rem">${m.nombre}</span>
      <div class="ci-qty-ctrl">
        <button class="qty-btn" onclick="removeFromCarrito(${m.id})">−</button>
        <span class="ci-qty">${i.qty}</span>
        <button class="qty-btn" onclick="addToCarrito(${m.id})">+</button>
      </div>
      <span style="font-size:0.8rem;color:var(--ember3);min-width:55px;text-align:right">$${(m.precio*i.qty).toLocaleString('es')}</span>
    </div>`;
  }).join('');
  document.getElementById('carrito-total-val').textContent = '$'+total.toLocaleString('es');
}

function confirmarPedido() {
  const mesaId = parseInt(document.getElementById('carrito-mesa').value);
  if(!mesaId||carritoItems.length===0) { alert('Seleccioná una mesa y agregá items.'); return; }
  const hora = new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});
  state.pedidos.push({
    id: state.nextPedidoId++,
    mesa: mesaId,
    estado: 'pendiente',
    items: [...carritoItems],
    hora
  });
  cancelarCarrito();
  renderPedidos();
}

function avanzarEstado(id) {
  const p = state.pedidos.find(x=>x.id===id);
  if(p && estadoNext[p.estado]) p.estado = estadoNext[p.estado];
  renderPedidos();
}

function eliminarPedido(id) {
  state.pedidos = state.pedidos.filter(p=>p.id!==id);
  renderPedidos();
}

function facturarPedido(id) {
  const p = state.pedidos.find(x=>x.id===id);
  if(!p) return;
  const total = p.items.reduce((s,i)=>{
    const m=state.menu.find(x=>x.id===i.menuId);
    return s+(m?m.precio*i.qty:0);
  },0);
  const itemsFactura = p.items.map(i=>{
    const m=state.menu.find(x=>x.id===i.menuId);
    return m?{nombre:m.nombre,qty:i.qty,precio:m.precio}:null;
  }).filter(Boolean);
  const metodo = 'Efectivo'; // default
  const num = '#'+String(state.nextFacturaId++).padStart(4,'0');
  state.facturas.push({
    id: num,
    mesa: p.mesa,
    total,
    metodo,
    hora: new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'}),
    items: itemsFactura
  });
  // liberar mesa
  const mesa = state.mesas.find(m=>m.id===p.mesa);
  if(mesa) { mesa.estado='libre'; mesa.nombre=''; mesa.hora=''; }
  state.pedidos = state.pedidos.filter(x=>x.id!==id);
  renderPedidos();
  updateBadges();
  mostrarTicket(state.facturas[state.facturas.length-1]);
}

// ========== CAJA ==========
function renderCaja() {
  const totalDia = state.facturas.reduce((s,f)=>s+f.total,0);
  const cantFacturas = state.facturas.length;
  const promedio = cantFacturas ? Math.round(totalDia/cantFacturas) : 0;
  const porMetodo = {};
  state.facturas.forEach(f=>{ porMetodo[f.metodo]=(porMetodo[f.metodo]||0)+f.total; });
  const metodoTop = Object.entries(porMetodo).sort((a,b)=>b[1]-a[1])[0];

  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total del día</div>
      <div class="stat-value ember">$${totalDia.toLocaleString('es')}</div>
      <div class="stat-sub">${cantFacturas} facturas emitidas</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ticket promedio</div>
      <div class="stat-value">$${promedio.toLocaleString('es')}</div>
      <div class="stat-sub">Por mesa</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Medio de pago top</div>
      <div class="stat-value green" style="font-size:1.1rem;padding-top:4px">${metodoTop?metodoTop[0]:'—'}</div>
      <div class="stat-sub">${metodoTop?'$'+metodoTop[1].toLocaleString('es'):''}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Mesas disponibles</div>
      <div class="stat-value">${state.mesas.filter(m=>m.estado==='libre').length}</div>
      <div class="stat-sub">de ${state.mesas.length} totales</div>
    </div>
  `;
  renderFacturas(state.facturas);
}

function renderFacturas(facturas) {
  const list = document.getElementById('factura-list');
  if(!facturas.length) { list.innerHTML='<div class="text-muted">No hay facturas aún.</div>'; return; }
  const metodoColor = {'Efectivo':'var(--green2)','Tarjeta':'var(--ember3)','QR/Transferencia':'var(--ember2)'};
  list.innerHTML = facturas.map(f=>`
    <div class="factura-row">
      <div class="factura-num">${f.id}</div>
      <div class="factura-info">
        <div class="factura-desc">Mesa ${f.mesa} · ${f.items.map(i=>i.nombre).join(', ').substring(0,50)}${f.items.map(i=>i.nombre).join('').length>50?'…':''}</div>
        <div class="factura-meta">${f.hora} · <span style="color:${metodoColor[f.metodo]||'var(--muted)'}">${f.metodo}</span></div>
      </div>
      <div class="factura-total">$${f.total.toLocaleString('es')}</div>
      <div class="factura-acciones">
        <button class="btn btn-ghost btn-sm" onclick='mostrarTicket(${JSON.stringify(f)})'>🧾 Ver</button>
      </div>
    </div>
  `).join('');
}

function filtrarFacturas(q) {
  const filtrado = state.facturas.filter(f=>
    f.id.toLowerCase().includes(q.toLowerCase()) ||
    String(f.mesa).includes(q) ||
    f.metodo.toLowerCase().includes(q.toLowerCase())
  );
  renderFacturas(filtrado);
}

function mostrarTicket(f) {
  const ahora = new Date().toLocaleDateString('es-UY');
  const itemsHtml = f.items.map(i=>`
    <div class="t-row"><span>${i.qty}x ${i.nombre}</span><span>$${(i.precio*i.qty).toLocaleString('es')}</span></div>
  `).join('');
  document.getElementById('ticket-content').innerHTML = `
    <div class="ticket">
      <h2>🔥 El Rancho</h2>
      <div class="t-sub">Parrillada & Restaurante</div>
      <div class="t-sub">${ahora} · Mesa ${f.mesa} · ${f.hora}</div>
      <hr>
      ${itemsHtml}
      <hr>
      <div class="t-row t-total"><span>TOTAL</span><span>$${f.total.toLocaleString('es')}</span></div>
      <div class="t-row"><span>Pago con</span><span>${f.metodo}</span></div>
      <hr>
      <div class="t-footer">¡Gracias por su visita!<br>Vuelva pronto 🥩</div>
    </div>
  `;
  document.getElementById('modal-ticket').classList.add('open');
}

function exportarResumen() {
  const total = state.facturas.reduce((s,f)=>s+f.total,0);
  const txt = `RESUMEN DE CAJA - ${new Date().toLocaleDateString('es-UY')}
==========================================
Facturas emitidas: ${state.facturas.length}
Total recaudado:   $${total.toLocaleString('es')}
==========================================
${state.facturas.map(f=>`${f.id} - Mesa ${f.mesa} - $${f.total.toLocaleString('es')} - ${f.metodo} - ${f.hora}`).join('\n')}
==========================================
`;
  const blob = new Blob([txt], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `resumen_caja_${new Date().toLocaleDateString('es-UY').replace(/\//g,'-')}.txt`;
  a.click();
}

// ========== BOLETAS ==========
let boletaItems = [];
let movTipo = 'entrada';

// Initial boletas state
state.boletas = [
  {id:'B-0001', tipo:'B', cliente:'Consumidor Final', rut:'', mesa:3, items:[{desc:'Vacío entero',qty:1,precio:1100},{desc:'Papas fritas',qty:1,precio:280},{desc:'Agua mineral',qty:2,precio:150}], subtotal:1680, descPct:0, recPct:0, total:1680, metodo:'Efectivo', hora:'18:20'},
  {id:'A-0001', tipo:'A', cliente:'Empresa SA', rut:'21-234567-8', mesa:7, items:[{desc:'Tira de asado',qty:2,precio:950},{desc:'Cerveza artesanal',qty:4,precio:450}], subtotal:3700, descPct:5, recPct:0, total:3515, metodo:'Tarjeta', hora:'19:10'},
];
state.nextBoletaId = {A:2, B:2, X:1};

function calcBoletaTotales() {
  const subtotal = boletaItems.reduce((s,i)=>s+i.precio*i.qty,0);
  const descPct = parseFloat(document.getElementById('bol-desc').value)||0;
  const recPct = parseFloat(document.getElementById('bol-rec').value)||0;
  const tipo = document.getElementById('bol-tipo').value;
  const descMonto = subtotal * descPct/100;
  const recMonto = (subtotal - descMonto) * recPct/100;
  const baseImp = subtotal - descMonto + recMonto;
  const iva = tipo === 'A' ? baseImp * 0.22 : 0;
  const total = baseImp + iva;
  return {subtotal, descPct, recPct, descMonto, recMonto, baseImp, iva, total, tipo};
}

function renderBoletaItemsList() {
  const cont = document.getElementById('boleta-items-list');
  if(!boletaItems.length) { cont.innerHTML='<div class="text-muted" style="padding:8px 0">Sin items. Agreguá desde el menú o manualmente.</div>'; renderBoletaPreview(); return; }
  cont.innerHTML = boletaItems.map((i,idx)=>`
    <div class="boleta-item-row">
      <span class="bi-name">${i.desc}</span>
      <span class="bi-qty">${i.qty}x</span>
      <span class="bi-precio">$${i.precio.toLocaleString('es')}</span>
      <span class="bi-subtotal">$${(i.precio*i.qty).toLocaleString('es')}</span>
      <button class="qty-btn" onclick="quitarItemBoleta(${idx})">✕</button>
    </div>
  `).join('');
  renderBoletaPreview();
}

function agregarItemBoleta() {
  const desc = document.getElementById('bi-desc').value.trim();
  const qty = parseInt(document.getElementById('bi-qty').value)||1;
  const precio = parseFloat(document.getElementById('bi-precio').value)||0;
  if(!desc||!precio) { alert('Completá descripción y precio.'); return; }
  const existing = boletaItems.find(i=>i.desc===desc);
  if(existing) existing.qty += qty;
  else boletaItems.push({desc, qty, precio});
  document.getElementById('bi-desc').value='';
  document.getElementById('bi-qty').value='1';
  document.getElementById('bi-precio').value='';
  renderBoletaItemsList();
}

function quitarItemBoleta(idx) {
  boletaItems.splice(idx,1);
  renderBoletaItemsList();
}

function cargarItemsDeMesa() {
  const mesaId = parseInt(document.getElementById('bol-mesa').value);
  if(!mesaId) return;
  const pedidosMesa = state.pedidos.filter(p=>p.mesa===mesaId);
  if(!pedidosMesa.length) { alert(`No hay comandas activas en Mesa ${mesaId}.`); return; }
  boletaItems = [];
  pedidosMesa.forEach(p=>{
    p.items.forEach(i=>{
      const m = state.menu.find(x=>x.id===i.menuId);
      if(!m) return;
      const ex = boletaItems.find(b=>b.desc===m.nombre);
      if(ex) ex.qty+=i.qty; else boletaItems.push({desc:m.nombre, qty:i.qty, precio:m.precio});
    });
  });
  renderBoletaItemsList();
}

function renderBoletaPreview() {
  const tipo = document.getElementById('bol-tipo').value;
  const cliente = document.getElementById('bol-cliente').value || 'Consumidor Final';
  const rut = document.getElementById('bol-rut').value;
  const metodo = document.getElementById('bol-pago').value;
  const c = calcBoletaTotales();
  const fecha = new Date().toLocaleDateString('es-UY');
  const hora = new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});
  const num = tipo+'-'+String(state.nextBoletaId[tipo]||1).padStart(4,'0');

  const tipoBadge = {A:'FACTURA A',B:'BOLETA B',X:'TICKET X'}[tipo]||tipo;
  const ivaLine = tipo==='A'?`<div class="bd-row"><span>IVA (22%)</span><span>$${c.iva.toLocaleString('es',{maximumFractionDigits:0})}</span></div>`:'';
  const itemsHtml = boletaItems.length
    ? boletaItems.map(i=>`<div class="bd-row"><span>${i.qty}x ${i.desc}</span><span>$${(i.precio*i.qty).toLocaleString('es')}</span></div>`).join('')
    : '<div class="bd-row" style="color:#999"><span>Sin items</span><span>—</span></div>';

  const descLine = c.descPct>0?`<div class="bd-row"><span>Descuento (${c.descPct}%)</span><span style="color:green">-$${c.descMonto.toLocaleString('es',{maximumFractionDigits:0})}</span></div>`:'';
  const recLine = c.recPct>0?`<div class="bd-row"><span>Recargo (${c.recPct}%)</span><span style="color:darkred">+$${c.recMonto.toLocaleString('es',{maximumFractionDigits:0})}</span></div>`:'';

  document.getElementById('boleta-doc-preview').innerHTML = `
    <div class="boleta-doc" id="boleta-doc-printable">
      <div class="bd-header">
        <div class="bd-title">🔥 EL RANCHO</div>
        <div class="bd-sub">Parrillada & Restaurante</div>
        <div class="bd-sub">RUT: 21-000000-1 | Tel: 2XXX-XXXX</div>
        <div style="margin:6px 0"><span class="bd-num">${tipoBadge}</span></div>
        <div class="bd-sub">N° ${num}</div>
      </div>
      <hr class="bd-divider">
      <div class="bd-row"><span>Fecha:</span><span>${fecha} ${hora}</span></div>
      <div class="bd-row"><span>Cliente:</span><span>${cliente}</span></div>
      ${rut?`<div class="bd-row"><span>RUT/CI:</span><span>${rut}</span></div>`:''}
      <hr class="bd-divider">
      <div class="bd-items-header"><span>Detalle</span><span>Subtotal</span></div>
      ${itemsHtml}
      <hr class="bd-divider">
      <div class="bd-row"><span>Subtotal</span><span>$${c.subtotal.toLocaleString('es')}</span></div>
      ${descLine}${recLine}${ivaLine}
      <div class="bd-row total"><span>TOTAL A PAGAR</span><span>$${c.total.toLocaleString('es',{maximumFractionDigits:0})}</span></div>
      <hr class="bd-divider">
      <div class="bd-row"><span>Medio de pago:</span><span>${metodo}</span></div>
      <div class="bd-footer">Gracias por su visita · Vuelva pronto 🥩<br>Este comprobante no tiene validez fiscal</div>
    </div>
  `;

  const c2 = calcBoletaTotales();
  document.getElementById('boleta-totales-calc').innerHTML = `
    <div class="bt-row"><span>Subtotal</span><span>$${c2.subtotal.toLocaleString('es')}</span></div>
    ${c2.descPct>0?`<div class="bt-row" style="color:var(--green2)"><span>Descuento (${c2.descPct}%)</span><span>-$${c2.descMonto.toLocaleString('es',{maximumFractionDigits:0})}</span></div>`:''}
    ${c2.recPct>0?`<div class="bt-row" style="color:var(--red2)"><span>Recargo (${c2.recPct}%)</span><span>+$${c2.recMonto.toLocaleString('es',{maximumFractionDigits:0})}</span></div>`:''}
    ${c2.iva>0?`<div class="bt-row"><span>IVA (22%)</span><span>$${c2.iva.toLocaleString('es',{maximumFractionDigits:0})}</span></div>`:''}
    <div class="bt-row total"><span>TOTAL</span><span>$${c2.total.toLocaleString('es',{maximumFractionDigits:0})}</span></div>
  `;
}

function emitirBoleta() {
  if(!boletaItems.length) { alert('Agregá al menos un ítem.'); return; }
  const tipo = document.getElementById('bol-tipo').value;
  const cliente = document.getElementById('bol-cliente').value || 'Consumidor Final';
  const rut = document.getElementById('bol-rut').value;
  const mesaId = parseInt(document.getElementById('bol-mesa').value)||0;
  const metodo = document.getElementById('bol-pago').value;
  const c = calcBoletaTotales();
  const num = tipo+'-'+String(state.nextBoletaId[tipo]||1).padStart(4,'0');
  state.nextBoletaId[tipo] = (state.nextBoletaId[tipo]||1)+1;
  const boleta = {
    id: num, tipo, cliente, rut, mesa: mesaId,
    items: boletaItems.map(i=>({...i})),
    subtotal: c.subtotal, descPct: c.descPct, recPct: c.recPct,
    total: Math.round(c.total), metodo,
    hora: new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'})
  };
  state.boletas.push(boleta);
  // Mover items de caja también
  state.facturas.push({id:num, mesa:mesaId||'—', total:Math.round(c.total), metodo, hora:boleta.hora, items:boletaItems.map(i=>({nombre:i.desc,qty:i.qty,precio:i.precio}))});
  if(mesaId) {
    const mesa = state.mesas.find(m=>m.id===mesaId);
    if(mesa) { mesa.estado='libre'; mesa.nombre=''; mesa.hora=''; }
    state.pedidos = state.pedidos.filter(p=>p.mesa!==mesaId);
  }
  document.getElementById('boleta-ok-content').innerHTML = document.getElementById('boleta-doc-preview').innerHTML;
  document.getElementById('modal-boleta-ok').classList.add('open');
  limpiarBoleta();
  renderBoletasHistorial(state.boletas);
  updateBadges();
}

function limpiarBoleta() {
  boletaItems = [];
  document.getElementById('bol-cliente').value='';
  document.getElementById('bol-rut').value='';
  document.getElementById('bol-desc').value='';
  document.getElementById('bol-rec').value='';
  document.getElementById('bol-mesa').value='';
  renderBoletaItemsList();
}

function imprimirBoleta() { window.print(); }

function renderBoletasHistorial(lista) {
  const cont = document.getElementById('boletas-historial');
  if(!lista.length) { cont.innerHTML='<div class="text-muted">Sin comprobantes emitidos.</div>'; return; }
  const tipoColor = {A:'var(--ember3)',B:'var(--ember2)',X:'var(--muted)'};
  cont.innerHTML = [...lista].reverse().map(b=>`
    <div class="factura-row">
      <span class="tipo-badge tipo-${b.tipo}">${b.tipo}</span>
      <div class="factura-num">${b.id}</div>
      <div class="factura-info">
        <div class="factura-desc">${b.cliente}${b.rut?' · '+b.rut:''}</div>
        <div class="factura-meta">${b.hora}${b.mesa?' · Mesa '+b.mesa:''} · ${b.metodo}</div>
      </div>
      <div class="factura-total">$${b.total.toLocaleString('es')}</div>
      <button class="btn btn-ghost btn-sm" onclick='verBoletaEmitida(${JSON.stringify(b)})'>🧾 Ver</button>
    </div>
  `).join('');
}

function filtrarBoletas(q) {
  const filtrado = state.boletas.filter(b=>
    b.id.toLowerCase().includes(q.toLowerCase())||
    b.cliente.toLowerCase().includes(q.toLowerCase())||
    b.metodo.toLowerCase().includes(q.toLowerCase())
  );
  renderBoletasHistorial(filtrado);
}

function verBoletaEmitida(b) {
  const fecha = new Date().toLocaleDateString('es-UY');
  const tipoBadge = {A:'FACTURA A',B:'BOLETA B',X:'TICKET X'}[b.tipo]||b.tipo;
  const ivaLine = b.tipo==='A'?`<div class="bd-row"><span>IVA (22%)</span><span>$${Math.round((b.total-b.subtotal*(1-b.descPct/100)*(1+b.recPct/100))).toLocaleString('es')}</span></div>`:'';
  const itemsHtml = b.items.map(i=>`<div class="bd-row"><span>${i.qty}x ${i.desc||i.nombre}</span><span>$${((i.precio)*(i.qty)).toLocaleString('es')}</span></div>`).join('');
  document.getElementById('boleta-ok-content').innerHTML = `
    <div class="boleta-doc">
      <div class="bd-header">
        <div class="bd-title">🔥 EL RANCHO</div>
        <div class="bd-sub">Parrillada & Restaurante</div>
        <div style="margin:6px 0"><span class="bd-num">${tipoBadge}</span></div>
        <div class="bd-sub">N° ${b.id}</div>
      </div>
      <hr class="bd-divider">
      <div class="bd-row"><span>Cliente:</span><span>${b.cliente}</span></div>
      ${b.rut?`<div class="bd-row"><span>RUT/CI:</span><span>${b.rut}</span></div>`:''}
      <hr class="bd-divider">
      ${itemsHtml}
      <hr class="bd-divider">
      ${b.descPct>0?`<div class="bd-row"><span>Descuento (${b.descPct}%)</span><span style="color:green">—</span></div>`:''}
      ${ivaLine}
      <div class="bd-row total"><span>TOTAL</span><span>$${b.total.toLocaleString('es')}</span></div>
      <hr class="bd-divider">
      <div class="bd-row"><span>Pago:</span><span>${b.metodo}</span></div>
      <div class="bd-footer">Gracias por su visita · Vuelva pronto 🥩</div>
    </div>
  `;
  document.getElementById('modal-boleta-ok').classList.add('open');
}

function initBoletasMesa() {
  const sel = document.getElementById('bol-mesa');
  sel.innerHTML = '<option value="">— Sin mesa —</option>'+state.mesas.filter(m=>m.estado==='ocupada').map(m=>`<option value="${m.id}">Mesa ${m.id}</option>`).join('');
}

// ========== INVENTARIO ==========
state.inventario = [
  {id:1, nombre:'Tira de asado', cat:'Carnes', unidad:'kg', stock:18, minimo:10},
  {id:2, nombre:'Vacío', cat:'Carnes', unidad:'kg', stock:12, minimo:8},
  {id:3, nombre:'Chorizo artesanal', cat:'Embutidos', unidad:'un', stock:45, minimo:20},
  {id:4, nombre:'Morcilla', cat:'Embutidos', unidad:'un', stock:30, minimo:15},
  {id:5, nombre:'Bondiola', cat:'Carnes', unidad:'kg', stock:6, minimo:5},
  {id:6, nombre:'Provoleta', cat:'Varios', unidad:'un', stock:8, minimo:6},
  {id:7, nombre:'Carbón', cat:'Varios', unidad:'kg', stock:50, minimo:20},
  {id:8, nombre:'Coca-Cola 500ml', cat:'Bebidas', unidad:'un', stock:24, minimo:12},
  {id:9, nombre:'Cerveza artesanal 500cc', cat:'Bebidas', unidad:'un', stock:3, minimo:12},
  {id:10, nombre:'Agua mineral', cat:'Bebidas', unidad:'un', stock:18, minimo:10},
  {id:11, nombre:'Aceite de oliva', cat:'Varios', unidad:'lt', stock:2, minimo:2},
  {id:12, nombre:'Sal gruesa', cat:'Varios', unidad:'kg', stock:8, minimo:3},
  {id:13, nombre:'Papa blanca', cat:'Verduras', unidad:'kg', stock:15, minimo:8},
  {id:14, nombre:'Tomate', cat:'Verduras', unidad:'kg', stock:4, minimo:5},
  {id:15, nombre:'Vino Malbec (botella)', cat:'Bebidas', unidad:'un', stock:6, minimo:4},
];
state.movimientos = [
  {tipo:'entrada', prod:'Tira de asado', qty:20, nota:'Compra semanal', hora:'08:00'},
  {tipo:'salida',  prod:'Chorizo artesanal', qty:5, nota:'Pedido Mesa 3', hora:'19:35'},
  {tipo:'entrada', prod:'Coca-Cola 500ml', qty:24, nota:'Reposición', hora:'10:00'},
  {tipo:'salida',  prod:'Cerveza artesanal 500cc', qty:9, nota:'Pedido Mesas', hora:'20:15'},
];
state.nextInvId = 16;
let invCatActiva = 'Todas';

function renderInventario() {
  const bajo = state.inventario.filter(i=>i.stock<=i.minimo).length;
  document.getElementById('badge-inv').textContent = bajo||'';
  document.getElementById('badge-inv').style.display = bajo?'':'none';

  // Stats
  const total = state.inventario.length;
  const criticos = state.inventario.filter(i=>i.stock<i.minimo*0.5).length;
  const categorias_inv = [...new Set(state.inventario.map(i=>i.cat))];
  document.getElementById('inv-stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Productos registrados</div>
      <div class="stat-value">${total}</div>
      <div class="stat-sub">${categorias_inv.length} categorías</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Stock bajo (⚠)</div>
      <div class="stat-value" style="color:var(--ember3)">${bajo}</div>
      <div class="stat-sub">Requieren atención</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Stock crítico (🚨)</div>
      <div class="stat-value" style="color:var(--red2)">${criticos}</div>
      <div class="stat-sub">Por debajo del 50% mínimo</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Movimientos hoy</div>
      <div class="stat-value">${state.movimientos.length}</div>
      <div class="stat-sub">Entradas y salidas</div>
    </div>
  `;

  // Category tabs
  const cats = ['Todas',...categorias_inv];
  document.getElementById('inv-cat-tabs').innerHTML = cats.map(c=>`
    <button class="cat-tab ${c===invCatActiva?'active':''}" onclick="setInvCat('${c}')">${getInvCatEmoji(c)} ${c}</button>
  `).join('');

  // Items grid
  const filtered = invCatActiva==='Todas' ? state.inventario : state.inventario.filter(i=>i.cat===invCatActiva);
  document.getElementById('inv-grid').innerHTML = filtered.map(i=>{
    const pct = Math.min(100, Math.round(i.stock/Math.max(i.minimo*2,1)*100));
    const critico = i.stock < i.minimo*0.5;
    const bajo = i.stock <= i.minimo && !critico;
    const barColor = critico ? 'var(--red2)' : bajo ? 'var(--ember3)' : 'var(--green2)';
    const cls = critico ? 'critico' : bajo ? 'bajo' : '';
    return `
      <div class="inv-item ${cls}">
        <div>
          <div class="inv-nombre">${i.nombre}</div>
          <div class="inv-cat">${i.cat}${critico?' 🚨':bajo?' ⚠️':''}</div>
        </div>
        <div class="inv-stock-area">
          <div class="inv-stock-num">${i.stock}</div>
          <div class="inv-stock-unit">${i.unidad}</div>
        </div>
        <div class="inv-progress">
          <div class="inv-progress-bar" style="width:${pct}%;background:${barColor}"></div>
        </div>
        <div class="inv-actions-row">
          <button class="btn btn-success btn-sm" style="flex:1;justify-content:center" onclick="quickMov(${i.id},'entrada')">+ Entrada</button>
          <button class="btn btn-ghost btn-sm" style="flex:1;justify-content:center" onclick="quickMov(${i.id},'salida')">− Salida</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarProdInv(${i.id})">✕</button>
        </div>
      </div>
    `;
  }).join('');

  // Movimientos
  document.getElementById('inv-movimientos').innerHTML = [...state.movimientos].reverse().map(m=>`
    <div class="mov-row">
      <div class="mov-icon">${m.tipo==='entrada'?'📥':'📤'}</div>
      <div class="mov-info">
        <div class="mov-desc">${m.prod}</div>
        <div class="mov-time">${m.hora}${m.nota?' · '+m.nota:''}</div>
      </div>
      <div class="mov-qty ${m.tipo}">${m.tipo==='entrada'?'+':'-'}${m.qty}</div>
    </div>
  `).join('');
}

function getInvCatEmoji(c) {
  return {Carnes:'🥩',Embutidos:'🌭',Bebidas:'🍺',Verduras:'🥗',Varios:'📦',Todas:'🗂'}[c]||'📦';
}

function setInvCat(c) { invCatActiva=c; renderInventario(); }

function openAddInvModal() { document.getElementById('modal-add-inv').classList.add('open'); }

function agregarProductoInv() {
  const nombre = document.getElementById('inv-nombre').value.trim();
  const cat = document.getElementById('inv-cat-sel').value;
  const unidad = document.getElementById('inv-unidad').value;
  const stock = parseInt(document.getElementById('inv-stock-ini').value)||0;
  const minimo = parseInt(document.getElementById('inv-stock-min').value)||5;
  if(!nombre) { alert('Ingresá el nombre.'); return; }
  state.inventario.push({id:state.nextInvId++, nombre, cat, unidad, stock, minimo});
  document.getElementById('inv-nombre').value='';
  closeModal('modal-add-inv');
  renderInventario();
}

function eliminarProdInv(id) {
  state.inventario = state.inventario.filter(i=>i.id!==id);
  renderInventario();
}

function openMovModal(tipo) {
  movTipo = tipo;
  document.getElementById('modal-mov-title').textContent = tipo==='entrada'?'📥 Entrada de stock':'📤 Salida de stock';
  document.getElementById('mov-producto').innerHTML = state.inventario.map(i=>`<option value="${i.id}">${i.nombre} (${i.stock} ${i.unidad})</option>`).join('');
  document.getElementById('modal-mov').classList.add('open');
}

function quickMov(invId, tipo) {
  movTipo = tipo;
  document.getElementById('modal-mov-title').textContent = tipo==='entrada'?'📥 Entrada de stock':'📤 Salida de stock';
  document.getElementById('mov-producto').innerHTML = state.inventario.map(i=>`<option value="${i.id}" ${i.id===invId?'selected':''}>${i.nombre} (${i.stock} ${i.unidad})</option>`).join('');
  document.getElementById('modal-mov').classList.add('open');
}

function confirmarMovimiento() {
  const id = parseInt(document.getElementById('mov-producto').value);
  const qty = parseInt(document.getElementById('mov-qty').value)||0;
  const nota = document.getElementById('mov-nota').value.trim();
  const prod = state.inventario.find(i=>i.id===id);
  if(!prod||!qty) { alert('Seleccioná producto y cantidad.'); return; }
  if(movTipo==='salida' && prod.stock < qty) { alert(`Stock insuficiente. Solo hay ${prod.stock} ${prod.unidad}.`); return; }
  if(movTipo==='entrada') prod.stock += qty;
  else prod.stock -= qty;
  state.movimientos.push({tipo:movTipo, prod:prod.nombre, qty, nota, hora:new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'})});
  document.getElementById('mov-qty').value='1';
  document.getElementById('mov-nota').value='';
  closeModal('modal-mov');
  renderInventario();
}


renderMesas();
updateBadges();
// Init inventory badge on load
setTimeout(()=>{ const b = document.getElementById('badge-inv'); if(b){ const n=state.inventario.filter(i=>i.stock<=i.minimo).length; b.textContent=n||''; b.style.display=n?'':'none'; }}, 0);