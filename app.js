/* Siap Natal — logika bersama semua halaman */
const $=id=>document.getElementById(id);
const rp=n=>"Rp"+Math.round(n).toLocaleString("id-ID");
const cityInfo=n=>CITIES.find(c=>c[0]===n);
const byId=id=>P.find(p=>p.id===id);
const K={city:"sn_city",budget:"sn_budget",list:"sn_list"};
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let city=ls.get(K.city,"Gresik"),budget=ls.get(K.budget,500000),list=ls.get(K.list,[]);
if(!cityInfo(city))city="Gresik";
if(!(budget>=0))budget=500000;
/* st: todo | open (sudah dibuka di Shopee, menunggu konfirmasi) | done */
list=(Array.isArray(list)?list:[]).filter(x=>x&&byId(x.id)).map(x=>{
 if(x.st==="done"||x.done)return{id:x.id,st:"done",paid:typeof x.paid==="number"?x.paid:byId(x.id).h};
 return{id:x.id,st:x.st==="open"?"open":"todo"}});
const spent=()=>list.filter(x=>x.st==="done").reduce((a,x)=>a+x.paid,0);
const planned=()=>list.filter(x=>x.st!=="done").reduce((a,x)=>a+byId(x.id).h,0);
const room=()=>budget-spent()-planned();
const up10=n=>Math.ceil(n/10000)*10000;
const save=()=>{ls.set(K.city,city);ls.set(K.budget,budget);ls.set(K.list,list)};
const inList=id=>list.find(x=>x.id===id);
function tier(p){const u=cityInfo(city),s=cityInfo(p.c);if(p.c===city)return 0;if(!u||!s)return 3;if(u[1]===s[1])return 1;if(u[2]===s[2])return 2;return 3}
const TL=["Satu kota denganmu","Satu provinsi","Satu pulau","Beda pulau, ongkir bisa mahal"];
const REL="sponsored noopener noreferrer";
const PAGE=document.body.dataset.page;
const thumb=(p,c)=>`<div class="th ${c}" data-e="${p.e}"><img src="${IMGBASE}${p.img}" alt="${p.n.replace(/"/g,"")}" loading="lazy" referrerpolicy="no-referrer"></div>`;
document.addEventListener("error",e=>{const t=e.target;if(t.tagName==="IMG"&&t.parentNode&&t.parentNode.dataset.e){t.parentNode.textContent=t.parentNode.dataset.e}},true);
/* ---------- header, footer, dialog ---------- */
function chrome(){
 const nav=[["index.html","Beranda","index"],["paket.html","Paket","paket"],["daftar.html","Daftar","daftar"]];
 document.body.insertAdjacentHTML("afterbegin",`<header class="top"><div class="wrap"><a class="brand" href="index.html">Siap Natal</a><nav aria-label="Menu utama">${nav.map(n=>`<a href="${n[0]}" ${PAGE===n[2]?'aria-current="page"':""}>${n[1]}${n[2]==="daftar"?'<span class="badge" id="badge"></span>':""}</a>`).join("")}</nav></div></header>`);
 const f=document.querySelector("footer.foot");
 if(f)f.innerHTML=`<p class="stale">Harga, stok, dan rating terakhir dicek <b>${UPDATED}</b>. <b>Harga bisa berubah</b> sewaktu-waktu di Shopee, cek lagi sebelum membayar.</p><p>Kami afiliasi Shopee dan bisa mendapat komisi kecil kalau kamu belanja lewat tombol ke Shopee. Harga untukmu tidak bertambah. <a href="info.html">Selengkapnya: keterbukaan afiliasi dan privasi</a>. Situs ini tidak dibuat atau didukung oleh Shopee.</p>`;
 document.body.insertAdjacentHTML("beforeend",`<dialog id="dlg" aria-labelledby="dt"><h2 id="dt" style="font-size:20px"></h2><p id="dm" style="margin:8px 0"></p><label class="f" id="dl">x<input type="number" id="dnew" inputmode="numeric"></label><p id="derr" role="alert" class="note" style="color:var(--berry);margin:6px 0 0"></p><div class="acts" style="justify-content:flex-end"><button type="button" class="btn" id="dcancel">Batal</button><button type="button" class="btn pri" id="dok"></button></div></dialog>`);
 let dOk=null;
 window.openDlg=o=>{$("dt").textContent=o.title;$("dm").textContent=o.msg;$("dl").firstChild.textContent=o.label;const i=$("dnew");i.value=o.value;i.min=o.min;$("derr").textContent="";$("dok").textContent=o.okText;
  dOk=()=>{const v=parseInt(i.value,10);if(isNaN(v)||v<o.min){$("derr").textContent="Isi angka minimal "+rp(o.min)+".";return}$("dlg").close();o.onOk(v)};$("dlg").showModal();i.focus();i.select()};
 $("dok").onclick=()=>dOk&&dOk();$("dcancel").onclick=()=>$("dlg").close();
 $("dlg").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();dOk&&dOk()}});
}
/* ---------- aksi ---------- */
function needRaise(short,then){openDlg({title:"Budget belum cukup",msg:"Kurang "+rp(short)+". Kalau mau tambah barang ini, naikkan budget dulu.",label:"Budget baru (Rp)",value:up10(budget+short),min:budget+short,okText:"Naikkan budget dan lanjut",onOk:v=>{budget=v;save();then()}})}
function add(id){const p=byId(id);if(inList(id))return;if(p.h<=room()){list.push({id,st:"todo"});save();render()}else needRaise(p.h-room(),()=>add(id))}
function addPaket(){const miss=P.filter(p=>p.paket&&!inList(p.id)),need=miss.reduce((a,p)=>a+p.h,0);
 if(!miss.length){location.href="daftar.html";return}
 const go=()=>{miss.forEach(p=>list.push({id:p.id,st:"todo"}));save();location.href="daftar.html"};
 if(need<=room())go();else needRaise(need-room(),()=>go())}
function rm(id){list=list.filter(x=>x.id!==id||x.st==="done");save();render()}
function toTodo(id){const x=inList(id);if(x&&x.st==="open"){x.st="todo";save();render()}}
function markDone(id){const p=byId(id),x=inList(id);if(!x||x.st==="done")return;
 openDlg({title:"Sudah dibeli di Shopee?",msg:p.n,label:"Harga yang kamu bayar (Rp)",value:p.h,min:1,okText:"Ya, tandai sudah dibeli",onOk:v=>{x.st="done";x.paid=v;save();render()}})}
function undo(id){const x=inList(id);if(!x||x.st!=="done")return;const was=x.paid;x.st="todo";delete x.paid;if(room()<0){const short=-room();x.st="done";x.paid=was;needRaise(short,()=>undo(id));return}save();render()}
function setBudget(v){const min=spent()+planned(),m=$("bmsg");
 if(isNaN(v)||v<0){$("budget").value=budget;if(m)m.textContent="Isi budget dengan angka.";return}
 if(v<min&&v<budget){$("budget").value=budget;if(m)m.textContent="Budget tidak boleh di bawah "+rp(min)+" (sudah dibelanjakan + isi daftar). Hapus barang dari daftar dulu kalau mau menurunkan.";return}
 if(m)m.textContent="";budget=v;save();render()}
/* ---------- komponen ---------- */
function settings(){return `<div class="panel"><div class="row"><label class="f">Kota kamu<select id="city">${CITIES.map(c=>`<option ${c[0]===city?"selected":""}>${c[0]}</option>`).join("")}</select></label><label class="f">Budget (Rp)<input type="number" id="budget" inputmode="numeric" min="0" step="10000" value="${budget}"></label></div><p class="note" role="status" id="bmsg" style="margin:8px 0 0;color:var(--berry)"></p><p class="note" style="margin:6px 0 0">Kota dipakai untuk mengurutkan penjual terdekat. Kota, budget, dan daftar hanya tersimpan di perangkatmu.</p></div>`}
function bindSettings(){const c=$("city"),b=$("budget");if(c)c.onchange=()=>{city=c.value;save();render()};if(b)b.onchange=()=>setBudget(parseInt(b.value,10))}
function strip(){const r=room();return `<a class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:10px;text-decoration:none;color:inherit;margin-top:12px"><span class="note" style="margin:0">Budget ${rp(budget)} · Dibelanjakan ${rp(spent())}</span><b style="color:${r>=0?"var(--pri)":"var(--berry)"}">${r>=0?"Sisa "+rp(r):"Lebih "+rp(-r)}</b></a>`.replace("<a ",'<a href="daftar.html" ')}
function meter(){const sp=spent(),pl=planned(),r=room(),sw=budget>0?Math.min(100,sp/budget*100):0,pw=budget>0?Math.min(100-sw,pl/budget*100):0;
 return `<div class="row" style="justify-content:space-between;align-items:baseline"><span class="note">Dibelanjakan <b>${rp(sp)}</b> · Di daftar <b>${rp(pl)}</b> · Budget ${rp(budget)}</span><b style="color:${r>=0?"var(--pri)":"var(--berry)"}">${r>=0?"Sisa "+rp(r):"Lebih "+rp(-r)}</b></div><div class="bar${r<0?" over":""}"><i style="width:${sw}%"></i><i class="pl" style="width:${pw}%"></i></div>`}
function tags(p){const t=tier(p);return `<div><span class="tag t${t}">${TL[t]}</span>${p.promo?`<span class="tag tp">${p.promo}</span>`:""}<span class="meta">${p.c}</span></div>`}
function stat(p){return `<div class="meta">★ ${String(p.r).replace(".",",")} dari ${p.rc.toLocaleString("id-ID")}${p.rc>=1500?"+":""} penilaian · terjual ${p.s.toLocaleString("id-ID")}${p.s>=1000?"+":""}</div>`}
function addBtn(p){const x=inList(p.id);return x?(x.st==="done"?`<span class="doneTag">✓ Sudah dibeli</span>`:`<a class="btn out" href="daftar.html">Sudah di daftar · lihat</a>`):`<button class="btn out" data-add="${p.id}">Tambah ke daftar</button>`}
function card(p){const x=inList(p.id);return `<article class="card${x&&x.st==="done"?" dim":""}">${thumb(p,"l")}<div class="b"><h3><a href="produk.html?id=${p.id}">${p.n}</a></h3><div class="price">${rp(p.h)}</div>${p.hn?`<div class="meta">${p.hn}</div>`:""}${stat(p)}${tags(p)}${p.thin?`<div class="meta">Penilaian masih sedikit (di bawah 100).</div>`:""}<div class="acts">${addBtn(p)}<a class="btn" href="produk.html?id=${p.id}">Detail</a></div></div></article>`}
const BANNERS=[
 {c:"s1",k:"Paket hemat",t:()=>`Paket Natal Hemat ${rp(P.filter(p=>p.paket).reduce((a,p)=>a+p.h,0))}`,d:"Pohon, lampu, bola, kertas kado, toples. Semua rating 4,8+.",cta:"Lihat paket",href:"paket.html",img:"pvc150"},
 {c:"s2",k:"Promo terpantau",t:()=>"Party popper diskon sampai 50%",d:"Untuk malam Tahun Baru. Harga coret terlihat di Shopee saat dicek 24 Nov, bisa berubah.",cta:"Lihat produk",href:"produk.html?id=popper",img:"popper"},
 {c:"s3",k:"Ongkir lebih ringan",t:()=>`Penjual terdekat dari ${city}`,d:"Urutan produk mengikuti kotamu, supaya ongkir tidak bengkak.",cta:"Lihat pilihan",href:"index.html#produk",img:"toples6"}];
function banner(){return `<div class="ban" role="region" aria-label="Promo dan pilihan unggulan" tabindex="0">${BANNERS.map(b=>`<a class="slide ${b.c}" href="${b.href}"><div class="tx"><div><div class="k">${b.k}</div><h3>${b.t()}</h3><div class="fine" style="font-size:13px;margin-top:4px">${b.d}</div></div><span class="cta">${b.cta} →</span></div>${thumb(byId(b.img),"").replace('class="th "','class="im th"')}</a>`).join("")}</div>`}
/* ---------- halaman ---------- */
function pageIndex(){
 const cats=["Semua",...new Set(P.map(p=>p.k))];window.__cat=window.__cat||"Semua";
 $("main").innerHTML=`<div class="hero"><h1>Perlengkapan Natal, sudah dipilihkan.</h1><p>Rating 4,8 ke atas. Muat di budgetmu. Penjual terdekat tampil lebih dulu.</p></div>${banner()}${settings()}${strip()}
 <section id="paketsec"><h2>Paket Natal Hemat</h2><div class="paket" id="pk"></div></section>
 <section id="produk"><h2>Semua pilihan</h2><div class="row"><label class="f" style="flex:2">Cari<input type="search" id="q" placeholder="mis. lampu, toples"></label><label class="f">Harga maksimal<select id="maxp"><option value="0">Semua</option><option value="50000">sampai Rp50.000</option><option value="100000">sampai Rp100.000</option><option value="250000">sampai Rp250.000</option></select></label></div><div class="chips" id="cats" role="group" aria-label="Kategori">${cats.map(c=>`<button class="chip" aria-pressed="${c===window.__cat}" data-cat="${c}">${c}</button>`).join("")}</div><div id="list" aria-live="polite"></div></section>`;
 bindSettings();$("q").oninput=renderCat;$("maxp").onchange=renderCat;renderCat();renderPaketTeaser()}
function renderPaketTeaser(){const it=P.filter(p=>p.paket),tot=it.reduce((a,p)=>a+p.h,0);
 $("pk").innerHTML=`<p style="margin:0">${it.length} kebutuhan utama, dari penjual di Jakarta Barat.</p><div class="thumbs">${it.map(p=>thumb(p,"m")).join("")}</div><div class="tot"><span>Total paket</span><b>${rp(tot)}</b></div><a class="btn pri full" href="paket.html">Lihat isi paket</a>`}
function renderCat(){const q=$("q").value.trim().toLowerCase(),mx=+$("maxp").value,cat=window.__cat;
 let a=P.filter(p=>(cat==="Semua"||p.k===cat)&&(!mx||p.h<=mx)&&(!q||(p.n+" "+p.k).toLowerCase().includes(q)));
 a.sort((x,y)=>tier(x)-tier(y)||y.r-x.r||y.s-x.s);
 $("list").innerHTML=a.length?a.map(card).join(""):`<div class="empty">Belum ada yang cocok. Coba ganti kategori atau harga maksimal.</div>`}
function pagePaket(){const it=P.filter(p=>p.paket),tot=it.reduce((a,p)=>a+p.h,0),miss=it.filter(p=>!inList(p.id)),mt=miss.reduce((a,p)=>a+p.h,0);
 $("main").innerHTML=`<a class="back" href="index.html">← Beranda</a><div class="hero" style="padding-top:0"><h1>Paket Natal Hemat</h1><p>${it.length} kebutuhan utama, semua rating 4,8 ke atas. Tidak cocok? Buka detailnya untuk melihat alternatif.</p></div>
 <div class="paket">${it.map(p=>`<div class="card" style="margin-top:8px;background:#fff">${thumb(p,"m")}<div class="b"><h3><a href="produk.html?id=${p.id}">${p.n}</a></h3><div class="price">${rp(p.h)}</div><div class="meta">★ ${String(p.r).replace(".",",")} · ${p.c}</div><a class="lnk" style="padding:0;min-height:36px" href="produk.html?id=${p.id}">Lihat alternatif</a></div></div>`).join("")}
 <div class="tot"><span>Total paket</span><b>${rp(tot)}</b></div><div class="note" style="margin-bottom:10px">${!miss.length?"Semua isi paket sudah ada di daftarmu.":mt<=room()?`Muat di budgetmu. Sisa setelah ditambahkan ${rp(room()-mt)}.`:`Kurang ${rp(mt-room())} dari budgetmu. Naikkan budget dulu untuk menambahkan.`}</div><button class="btn pri full" data-paket="1">${miss.length?"Tambah semua ke daftar belanja":"Lihat daftar belanja"}</button></div>${strip()}`}
function pageProduk(){const id=new URLSearchParams(location.search).get("id"),p=byId(id);
 if(!p){$("main").innerHTML=`<a class="back" href="index.html">← Beranda</a><div class="empty">Produk tidak ditemukan.</div>`;return}
 const alt=P.filter(o=>o.k===p.k&&o.id!==p.id).sort((x,y)=>tier(x)-tier(y)||y.r-x.r);
 document.title=p.n+" — Siap Natal";
 $("main").innerHTML=`<a class="back" href="index.html">← Semua pilihan</a>${thumb(p,"xl")}<h1 style="font-size:22px;margin-top:12px">${p.n}</h1><div class="price" style="font-size:22px">${rp(p.h)}</div>${p.hn?`<div class="meta">${p.hn}</div>`:""}${stat(p)}${tags(p)}${p.thin?`<div class="meta">Penilaian masih sedikit (di bawah 100).</div>`:""}<p class="why" style="font-size:15px">${p.w}</p><div class="acts">${addBtn(p)}</div><p class="note">Kamu membeli dari daftar belanja, supaya budgetmu terpantau.</p>${strip()}
 <section><h2>Alternatif ${p.k.toLowerCase()}</h2>${alt.length?alt.map(card).join(""):`<div class="empty">Belum ada alternatif untuk kategori ini.</div>`}</section>`}
function pageDaftar(){const todo=list.filter(x=>x.st==="todo"),open=list.filter(x=>x.st==="open"),done=list.filter(x=>x.st==="done");
 const head=`<div class="hero" style="padding-top:12px"><h1>Daftar belanjaku</h1></div>`;
 const notice=open.length?`<div class="notice" role="status" id="opennote"><b>Kamu tadi membuka ${open.length} barang di Shopee.</b> Kalau sudah dibayar, konfirmasi di kartu kuning di bawah supaya budgetmu terpotong.</div>`:"";
 const irow=p=>`<div class="irow">${thumb(p,"m")}<div style="flex:1;min-width:0"><div class="nm">${p.n}</div><div class="price" style="font-size:15px">${rp(p.h)}</div><div class="meta">${p.c}</div></div></div>`;
 const todoH=todo.map(x=>{const p=byId(x.id);return `<div class="item st-todo">${irow(p)}<div class="step">Langkah 1 dari 2 · Beli</div><a class="btn pri full" data-buy="${p.id}" href="${p.l}" target="_blank" rel="${REL}">Buka di Shopee dan beli</a><div class="sub"><button class="lnk" data-mark="${p.id}">Sudah beli sebelumnya</button><button class="lnk" data-rm="${p.id}">Hapus dari daftar</button></div></div>`}).join("");
 const openH=open.map(x=>{const p=byId(x.id);return `<div class="item st-open" id="it-${p.id}">${irow(p)}<div class="step">Langkah 2 dari 2 · Konfirmasi</div><div class="stat">⏳ Menunggu konfirmasimu</div><div>Sudah selesai bayar di Shopee?</div><div class="two"><button class="btn pri" data-mark="${p.id}">Ya, sudah dibeli</button><button class="btn" data-back="${p.id}">Belum jadi</button></div><div class="sub"><a class="lnk" data-buy="${p.id}" href="${p.l}" target="_blank" rel="${REL}">Buka Shopee lagi</a></div></div>`}).join("");
 const doneH=done.length?`<details><summary>Sudah dibeli (${done.length}) · ${rp(spent())}</summary>${done.map(x=>{const p=byId(x.id);return `<div class="item done"><div class="irow">${thumb(p,"m")}<div style="flex:1;min-width:0"><div class="nm">✓ ${p.n}</div><div class="meta">Dibayar ${rp(x.paid)}</div></div><button class="lnk" data-undo="${p.id}">Batalkan</button></div></div>`}).join("")}</details>`:"";
 const empty=!(todo.length||open.length)?`<div class="empty">${done.length?"Semua barang di daftar sudah dibeli.":"Daftarmu masih kosong."} <a href="index.html">Pilih barang</a> atau <a href="paket.html">lihat paket</a>.</div>`:"";
 $("main").innerHTML=`${head}${notice}${settings()}<div class="panel">${meter()}<p class="note" style="margin:8px 0 0">Harga di daftar adalah harga terendah per varian. Saat konfirmasi, isi harga yang sebenarnya kamu bayar.</p></div>${openH}${todoH}${empty}${doneH}<p class="note" style="margin-top:16px">Tanda sudah dibeli kamu isi sendiri. Kami tidak tahu pembelianmu di Shopee. Pembayaran dan pengiriman diurus Shopee.</p>`;
 bindSettings()}
function render(){
 const n=list.filter(x=>x.st!=="done").length;const b=$("badge");if(b)b.textContent=n||"";
 const keepQ=PAGE==="index"&&$("q")?{q:$("q").value,m:$("maxp").value}:null;
 if(PAGE==="index"){if($("q")){renderCat();renderPaketTeaser();const s=document.querySelector("a.panel[href='daftar.html']");if(s)s.outerHTML=strip();const bi=$("budget");if(bi&&document.activeElement!==bi)bi.value=budget;const ch=$("cats");ch&&ch.querySelectorAll("[data-cat]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.cat===window.__cat))}else pageIndex()}
 else if(PAGE==="paket")pagePaket();else if(PAGE==="produk")pageProduk();else if(PAGE==="daftar")pageDaftar()}
function init(){
 chrome();
 document.addEventListener("click",e=>{const t=e.target.closest("button,a");if(!t)return;const d=t.dataset;
  if(d.cat){window.__cat=d.cat;document.querySelectorAll("[data-cat]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.cat===d.cat));renderCat()}
  else if(d.add)add(d.add);else if(d.paket)addPaket();else if(d.rm)rm(d.rm);else if(d.mark)markDone(d.mark);else if(d.back)toTodo(d.back);else if(d.undo)undo(d.undo);
  else if(d.buy){const x=inList(d.buy);if(x&&x.st==="todo"){x.st="open";save();setTimeout(render,400)}}});
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&PAGE==="daftar"){render();const o=document.querySelector(".st-open");if(o){o.scrollIntoView({behavior:"smooth",block:"center"});o.classList.add("pulse")}}});
 render();
}
window.addEventListener("storage",()=>{});
init();
