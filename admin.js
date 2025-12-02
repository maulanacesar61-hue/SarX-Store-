
// admin.js - safe local admin (no credentials in repo)
// stores {user, passHash} in localStorage under key 'sar_admin'
async function sha256(text){
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map(b=>b.toString(16).padStart(2,'0')).join('');
}
function getAdmin(){
  try{ return JSON.parse(localStorage.getItem('sar_admin')||'null'); }catch(e){ return null; }
}
async function setAdmin(user, pass){
  const h = await sha256(pass);
  localStorage.setItem('sar_admin', JSON.stringify({user:user, passHash:h}));
  localStorage.setItem('isAdmin','true'); // keep login after setup
  localStorage.setItem('admin_logged', 'true');
  return true;
}
async function checkLogin(user, pass){
  const adm = getAdmin();
  if(!adm) return false;
  const h = await sha256(pass);
  return adm.user === user && adm.passHash === h;
}
async function initAdminUI(){
  const adm = getAdmin();
  const setupArea = document.getElementById('setupArea');
  const loginArea = document.getElementById('loginArea');
  const panel = document.getElementById('adminPanel');
  if(!adm){
    setupArea.style.display = 'block';
    loginArea.style.display = 'none';
  } else {
    setupArea.style.display = 'none';
    loginArea.style.display = 'block';
  }

  document.getElementById('btnSetup').addEventListener('click', async ()=>{
    const u = document.getElementById('setupUser').value.trim();
    const p = document.getElementById('setupPass').value;
    if(!u||!p){ alert('Isi user & pass'); return; }
    await setAdmin(u,p);
    alert('Admin disimpan (lokal). Kamu otomatis login.');
    showPanel(u);
  });

  document.getElementById('btnLogin').addEventListener('click', async ()=>{
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const ok = await checkLogin(u,p);
    if(!ok){ document.getElementById('loginMsg').innerText = 'Username atau password salah'; return; }
    document.getElementById('loginMsg').innerText = '';
    localStorage.setItem('isAdmin','true');
    localStorage.setItem('admin_logged','true');
    showPanel(u);
  });

  document.getElementById('btnLogout').addEventListener('click', ()=>{
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('admin_logged');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginArea').style.display = 'block';
  });

  function showPanel(user){
    document.getElementById('adminName').innerText = user;
    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('setupArea').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    renderOrdersTable();
  }

  // auto-fill default username if user selected earlier
  const admStored = getAdmin();
  if(admStored) document.getElementById('loginUser').value = admStored.user || '';
}

function renderOrdersTable(){
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';
  const orders = JSON.parse(localStorage.getItem('sarx_orders')||'[]');
  orders.forEach(o=>{
    const tr = document.createElement('tr');
    const status = o.status || 'PENDING';
    tr.innerHTML = '<td>'+o.id+'</td><td>'+o.product+'</td><td>'+o.target+'</td><td>'+o.nominal+'</td><td>Rp '+Number(o.price).toLocaleString()+'</td>' +
      '<td><select data-order-id="'+o.id+'"><option value="PENDING" '+(status==='PENDING'?'selected':'')+'>PENDING</option><option value="SUCCESS" '+(status==='SUCCESS'?'selected':'')+'>SUCCESS</option><option value="GAGAL" '+(status==='GAGAL'?'selected':'')+'>GAGAL</option></select></td>' +
      '<td><button class="btn-del" data-id="'+o.id+'">Hapus</button></td>';
    tbody.appendChild(tr);
  });
  // attach events
  tbody.querySelectorAll('select').forEach(s=>{
    s.addEventListener('change', function(){
      if(!(localStorage.getItem('isAdmin')==='true' || localStorage.getItem('admin_logged')==='true')){ alert('Hanya admin yang bisa mengubah status'); this.value = this.getAttribute('data-prev') || this.options[0].value; return; }
      const id = this.getAttribute('data-order-id');
      const newS = this.value;
      assistantSetOrderStatus(id, newS);
      this.setAttribute('data-prev', this.value);
      renderOrdersTable();
    });
  });
  tbody.querySelectorAll('.btn-del').forEach(b=>{
    b.addEventListener('click', function(){
      if(!confirm('Hapus order '+this.dataset.id+'?')) return;
      let arr = JSON.parse(localStorage.getItem('sarx_orders')||'[]');
      arr = arr.filter(x=> x.id !== this.dataset.id);
      localStorage.setItem('sarx_orders', JSON.stringify(arr));
      renderOrdersTable();
    });
  });
}

async function assistantSetOrderStatus(id, status){
  // check admin flag first
  if(!(localStorage.getItem('isAdmin')==='true' || localStorage.getItem('admin_logged')==='true')){ alert('Hanya admin'); return; }
  try{
    let arr = JSON.parse(localStorage.getItem('sarx_orders')||'[]');
    let found=false;
    for(let i=0;i<arr.length;i++){
      if(arr[i].id === id){
        arr[i].status = status; found=true; break;
      }
    }
    if(found) localStorage.setItem('sarx_orders', JSON.stringify(arr));
    else {
      let db = JSON.parse(localStorage.getItem('order_status_db')||'{}');
      db[id] = {status: status};
      localStorage.setItem('order_status_db', JSON.stringify(db));
    }
    // log
    const logs = JSON.parse(localStorage.getItem('admin_logs')||'[]');
    logs.unshift({t:Date.now(), m: 'Admin set '+status+' for '+id});
    localStorage.setItem('admin_logs', JSON.stringify(logs));
    alert('Status diperbarui');
  }catch(e){ console.error(e); alert('Gagal update'); }
}

document.addEventListener('DOMContentLoaded', initAdminUI);
