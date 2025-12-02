
// store data & pricing logic (safe for GitHub — no secrets)
const CATALOG = [
  { id: 'pulsa', name: 'Pulsa', basePricePerUnit: 100 }, // base price per unit (used for demo)
  { id: 'kuota', name: 'Kuota', basePricePerUnit: 1000 },
  { id: 'ff', name: 'Diamond Free Fire', basePricePerUnit: 1000 },
  { id: 'ml', name: 'Diamond Mobile Legends', basePricePerUnit: 1000 },
  { id: 'pubg', name: 'UC PUBG', basePricePerUnit: 1200 },
  { id: 'robux', name: 'Robux Roblox', basePricePerUnit: 10 }
];

// pricing rules
const RULES = {
  pulsaLowFee: 2000, // for 5k-10k nominal (we interpret nominal as thousands when needed in demo)
  pulsaHighFee: 4000, // for >10k
  gameFee: 3000,
  robuxFee: 4000,
  robuxMin: 100
};

function findProduct(id){ return CATALOG.find(x=>x.id===id); }

function calculateFinalPriceForDisplay(productId, nominalInput){
  // nominalInput is a user input; interpret for demo: if product==pulsa, nominal in thousands (like 5 = 5k)
  const prod = findProduct(productId);
  let nominal = Number(nominalInput) || 0;
  let base = 0;
  if(productId==='pulsa'){
    // interpret nominal as thousands if >0; allow entering full rupiah too
    if(nominal < 1000){ // treat as '5' => 5k
      base = nominal * 1000;
    } else base = nominal;
  } else if(productId==='robux'){
    // nominal is number of robux
    if(nominal < RULES.robuxMin) nominal = RULES.robuxMin;
    base = nominal * prod.basePricePerUnit; // demo base unit
  } else {
    base = nominal * prod.basePricePerUnit;
  }

  let fee = 0;
  if(productId==='pulsa'){
    if(base >= 5000 && base <= 10000) fee = RULES.pulsaLowFee;
    else if(base > 10000) fee = RULES.pulsaHighFee;
  } else if(productId==='robux'){
    fee = RULES.robuxFee;
  } else {
    fee = RULES.gameFee;
  }

  return { nominal: nominal, base: base, fee: fee, final: base + fee };
}

// UI wiring
document.addEventListener('DOMContentLoaded', ()=>{
  const sel = document.getElementById('productSelect');
  CATALOG.forEach(p=>{
    const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; sel.appendChild(opt);
  });

  document.getElementById('btnCalc').addEventListener('click', ()=>{
    const pid = document.getElementById('productSelect').value;
    const nom = document.getElementById('nominalInput').value.trim();
    const res = calculateFinalPriceForDisplay(pid, nom);
    const out = document.getElementById('priceResult');
    out.innerHTML = '<div><b>Harga akhir:</b> Rp ' + Number(res.final).toLocaleString() + '</div>' +
                    '<div>Fee: Rp '+ Number(res.fee).toLocaleString() +'</div>' +
                    '<div>Nominal (diproses): '+ res.nominal +'</div>';
  });

  document.getElementById('btnOrder').addEventListener('click', ()=>{
    const pid = document.getElementById('productSelect').value;
    const nom = document.getElementById('nominalInput').value.trim();
    const target = document.getElementById('targetInput').value.trim();
    if(!target){ alert('Isi target'); return; }
    const res = calculateFinalPriceForDisplay(pid, nom);
    const orders = JSON.parse(localStorage.getItem('sarx_orders')||'[]');
    const id = 'ORD'+Date.now().toString().slice(-6).toUpperCase();
    const order = { id: id, product: pid, target: target, nominal: res.nominal, price: res.final, created: Date.now(), status: 'PENDING' };
    orders.push(order);
    localStorage.setItem('sarx_orders', JSON.stringify(orders));
    alert('Pesanan dibuat. Kode: '+id);
    // show result
    document.getElementById('priceResult').innerHTML += '<div style="margin-top:8px">Kode pesanan: <b>'+id+'</b></div>';
  });

});
