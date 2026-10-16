(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];let db,direction="pemasukan",category="pupuk",saving=false;const say=(t,c="")=>{const e=$("#form-message");if(e){e.textContent=t;e.className="message "+c}};const parse=(v)=>{let s=String(v??"").trim().replace(/\s/g,"");if(!s)return NaN;if(s.includes(",")){s=s.replace(/\./g,"").replace(",",".")}else if(/^\d{1,3}(\.\d{3})+$/.test(s)){s=s.replace(/\./g,"")}return Number(s)};const parseMoney=v=>{const s=String(v??"").replace(/\D/g,"");return s?Number(s):NaN};const formatMoney=v=>{const digits=String(v??"").replace(/\D/g,"");return digits?Number(digits).toLocaleString("id-ID"): ""};function bindMoney(name){const e=$('[name="'+name+'"]');e.addEventListener("input",()=>{const pos=e.selectionStart,old=e.value;e.value=formatMoney(old);const delta=e.value.length-old.length;try{e.setSelectionRange(Math.max(0,(pos||0)+delta),Math.max(0,(pos||0)+delta))}catch{}})}function updateCategoryOptions(){const s=$("#category-select");s.innerHTML="";const opts=direction==="pemasukan"?[["pupuk","Penjualan Pupuk"],["lainnya","Pemasukan Lainnya"]]:[["pupuk","Pembelian/Penebusan Pupuk"],["lainnya","Pengeluaran Lainnya"]];opts.forEach(([v,t])=>{const o=document.createElement("option");o.value=v;o.textContent=t;s.append(o)});category=s.value;choose(category)}function choose(c){category=c;$("#category-select").value=c;$("#fertilizer-fields").classList.toggle("hidden",c!=="pupuk");$("#other-fields").classList.toggle("hidden",c!=="lainnya");$("#description-label").firstChild.textContent=direction==="pemasukan"?"Keterangan pemasukan":"Keterangan pengeluaran";["product_name","unit","quantity","unit_price"].forEach(n=>{const e=$('[name="'+n+'"]');e.required=c==="pupuk";e.disabled=c!=="pupuk"});["description","amount"].forEach(n=>{const e=$('[name="'+n+'"]');e.required=c==="lainnya";e.disabled=c!=="lainnya"})}function clearForm(){const f=$("#transaction-form");f.reset();["product_name","unit","quantity","unit_price","description","amount"].forEach(n=>{$('[name="'+n+'"]').value=""});say("")}async function init(){
const details=$("#transaction-details");
const updateDirectionUI=()=>{
 details.classList.remove("hidden");
 $("#form-title").textContent=direction==="pemasukan"?"Pemasukan":"Pengeluaran";
 $("#section-indicator").textContent=direction==="pemasukan"?"＋":"−";
 $("#section-indicator").style.background=direction==="pemasukan"?"#e5f5eb":"#fff0ed";
 $("#section-indicator").style.color=direction==="pemasukan"?"#176b52":"#b44738";
};
const formHasUnclearedData=()=>{
 return ["product_name","unit","quantity","unit_price","description","amount"]
  .some(name=>String($('[name="'+name+'"]').value||"").trim()!=="");
};
$$("[data-direction]").forEach(b=>b.addEventListener("click",()=>{
 const requestedDirection=b.dataset.direction;
 if(requestedDirection===direction){updateDirectionUI();return;}
 if(saving){
  say("Transaksi sedang disimpan. Tunggu sampai proses selesai sebelum mengganti jenis transaksi.","error");
  return;
 }
 if(formHasUnclearedData()){
  say("Rincian transaksi masih berisi data yang belum disimpan. Simpan transaksi terlebih dahulu atau tekan Kosongkan formulir sebelum berpindah ke "+(requestedDirection==="pemasukan"?"Pemasukan":"Pengeluaran")+".","error");
  return;
 }
 direction=requestedDirection;
 $$("[data-direction]").forEach(x=>{
  x.classList.toggle("selected",x===b);
  x.setAttribute("aria-pressed",String(x===b));
 });
 updateDirectionUI();
 updateCategoryOptions();
 say("");
}));
$("#category-select").addEventListener("change",()=>{choose($("#category-select").value);say("")});
bindMoney("unit_price");
bindMoney("amount");
$$("[data-direction]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.direction===direction)));
choose(category);
$("#transaction-form").addEventListener("reset",e=>{
 if(saving){e.preventDefault();return}
 setTimeout(()=>{
  ["product_name","unit","quantity","unit_price","description","amount"].forEach(n=>{$('[name="'+n+'"]').value=""});
  choose(category);say("");
 },0);
});
$("#transaction-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(saving)return;
 if(!db){say("Belum dapat menyimpan: konfigurasi Supabase belum siap. Periksa assets/config.js.", "error");return}
 const f=new FormData(e.currentTarget),r={direction,category,description:"",product_name:null,unit:null,quantity:null,unit_price:null,amount:0};
 if(category==="pupuk"){
  r.product_name=String(f.get("product_name")||"").trim();
  r.unit=String(f.get("unit")||"").trim();
  r.quantity=parse(f.get("quantity"));
  r.unit_price=parseMoney(f.get("unit_price"));
  r.description=r.product_name+" ("+r.quantity+" "+r.unit+")";
  r.amount=Math.round(r.quantity*r.unit_price);
  if(!r.product_name||!r.unit||!Number.isFinite(r.quantity)||r.quantity<=0||!Number.isFinite(r.unit_price)||r.unit_price<=0){say("Isi nama pupuk, satuan, jumlah, dan harga dengan benar.","error");return}
 }else{
  r.description=String(f.get("description")||"").trim();
  r.amount=parseMoney(f.get("amount"));
  if(!r.description||!Number.isFinite(r.amount)||r.amount<=0){say("Isi keterangan dan jumlah rupiah dengan benar.","error");return}
 }
 saving=true;
 const b=$("#save-button");b.disabled=true;$("#clear-button").disabled=true;
 const {data:userResult,error:userError}=await db.auth.getUser();if(userError||!userResult.user){saving=false;b.disabled=false;$("#clear-button").disabled=false;say("Sesi login tidak ditemukan. Silakan masuk kembali.","error");return;}r.created_by=userResult.user.id;const {error}=await db.from("tani_transaksi").insert(r);
 saving=false;b.disabled=false;$("#clear-button").disabled=false;
 if(error){say("Gagal menyimpan transaksi: "+error.message+" (periksa tabel dan kebijakan akses anon Supabase).","error");return}
 clearForm();say("Transaksi berhasil disimpan.","success");
});
if(!window.isSupabaseConfigured||!isSupabaseConfigured()){
 say("Formulir siap digunakan, tetapi penyimpanan belum aktif. Periksa konfigurasi Supabase.","error");
 return;
}
if(!window.KT_AUTH){say("Sesi login belum siap. Muat ulang halaman setelah masuk.", "error");return;}const authenticated=await window.KT_AUTH.ready;if(!authenticated)return;db=window.KT_AUTH.client;
}
init()})();