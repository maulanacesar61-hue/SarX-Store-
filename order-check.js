
// auto-detect order code & show status (uses localStorage sarx_orders + order_status_db)
(function(){
  function sp(v){ try{ return JSON.parse(v); }catch(e){ return null; } }
  function attach(){
    const input = document.getElementById('orderCode');
    if(!input) return;
    input.addEventListener('input', function(){
      const code = (this.value||'').trim();
      if(code.length < 3) { document.getElementById('order_check_result').innerHTML=''; return; }
      let orders = sp(localStorage.getItem('sarx_orders')) || [];
      let found = orders.find(o=> (o.id||'').toString().toLowerCase() === code.toLowerCase());
      if(!found){
        const db = sp(localStorage.getItem('order_status_db'))||{};
        if(db[code]) found = { id: code, status: db[code].status };
        else if(window.autoOrders && window.autoOrders[code]) found = window.autoOrders[code];
      }
      const out = document.getElementById('order_check_result');
      if(!found){ out.innerHTML = '<div style="padding:10px;background:#fee;border-radius:6px">Kode tidak ditemukan</div>'; return; }
      const status = (found.status||'PENDING').toString().toUpperCase();
      const color = status==='SUCCESS' ? 'green' : status==='PENDING' ? 'orange' : 'red';
      out.innerHTML = '<div style="padding:10px;border-radius:6px;background:#111;color:#fff">' +
                      '<div><b>Kode:</b> '+found.id+'</div>' +
                      '<div><b>Produk:</b> '+(found.product||'-')+'</div>' +
                      '<div><b>Target:</b> '+(found.target||'-')+'</div>' +
                      '<div><b>Nominal:</b> '+(found.nominal||'-')+'</div>' +
                      '<div><b>Status:</b> <span style="color:'+color+'">'+status+'</span></div>' +
                      '</div>';
    });
  }
  if(document.readyState !== 'loading') attach(); else document.addEventListener('DOMContentLoaded', attach);
})();
