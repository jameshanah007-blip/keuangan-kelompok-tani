(()=> {
const $=s=>document.querySelector(s);
let db,rows=[],opening=0,appliedStartMonth=0,appliedEndMonth=0,appliedYear=0;
const months=["JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI","JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"];
const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const monthRangeOf=r=>{const raw=String(r.periode_semester||"").trim();const names=months.map(m=>m.toLocaleLowerCase("id-ID"));const parts=raw.split(/\s*[-–—]\s*/).map(v=>v.trim().toLocaleLowerCase("id-ID"));if(parts.length===2){const start=names.indexOf(parts[0])+1,end=names.indexOf(parts[1])+1;if(start>0&&end>=start)return {start,end}}if(parts.length===1){const idx=names.indexOf(parts[0])+1;if(idx>0)return {start:idx,end:idx}}if(raw==="1")return {start:1,end:6};if(raw==="2")return {start:7,end:12};const d=new Date(r.created_at);const m=Number.isFinite(d.getTime())?d.getMonth()+1:1;return {start:m,end:m}};
const monthOf=r=>monthRangeOf(r).start;
const yearOf=r=>{const y=Number(r.periode_tahun);return Number.isInteger(y)&&y>1900?y:new Date(r.created_at).getFullYear()};
const periodOrder=r=>yearOf(r)*12+monthOf(r)-1;
const amountOf=r=>Number(r.amount||0);
const isSaldo=r=>/saldo/i.test(String(r.description||""))||/saldo/i.test(String(r.product_name||""));
const isPupuk=r=>r.category==="pupuk"&&r.direction==="pengeluaran"&&!isSaldo(r);
const isIncome=r=>r.direction==="pemasukan"&&!isSaldo(r);
const isExpense=r=>r.direction==="pengeluaran"&&r.category!=="pupuk"&&!isSaldo(r);
function setupYears(){const field=$("#report-year");field.value=String(new Date().getFullYear());$("#start-month").value="";$("#end-month").value="";appliedStartMonth=0;appliedEndMonth=0;appliedYear=Number(field.value)}
function periodBounds(){return {year:appliedYear||new Date().getFullYear(),startMonth:appliedStartMonth,endMonth:appliedEndMonth}}
function updateHeading(){const p=periodBounds(),label=p.startMonth&&p.endMonth?months[p.startMonth-1]+" - "+months[p.endMonth-1]+" "+p.year:"PILIH RENTANG BULAN DAN TAHUN";const title="PERIODE "+label;$("#period-heading").textContent=title;$("#attachment-period").textContent=title;document.title="Laporan Keuangan Kelompok Tani - "+label}
function cell(tr,value,cls){const td=document.createElement("td");td.textContent=value??"";if(cls)td.className=cls;tr.append(td);return td}
function addRow(tbody,{no="",description="",income="",expense="",balance="",kind=""}){const tr=document.createElement("tr");if(kind)tr.className=kind;cell(tr,no);cell(tr,description);cell(tr,income===""?"":money(income),"number");cell(tr,expense===""?"":money(expense),"number");cell(tr,["total-row","section-row","ending-row"].includes(kind)&&balance!==""?money(balance):"","number");tbody.append(tr)}
function qty(v){const n=Number(v);return Number.isFinite(n)?new Intl.NumberFormat("id-ID",{maximumFractionDigits:3}).format(n):String(v??"")}
function unitPrice(r){return Number(r.unit_price||0)}
function fertilizerLabel(r){return (r.product_name||r.description||"Pupuk")+" "+qty(r.quantity)+" "+(r.unit||"unit")+" @ "+money(unitPrice(r))}
function itemLabel(r){return r.category==="pupuk"?fertilizerLabel(r):(r.description||"Transaksi")}
function currentRows(){const p=periodBounds();if(!p.startMonth||!p.endMonth||p.startMonth>p.endMonth)return [];return rows.filter(r=>{const range=monthRangeOf(r);return yearOf(r)===p.year&&range.start===p.startMonth&&range.end===p.endMonth}).sort((a,b)=>String(a.created_at||"").localeCompare(String(b.created_at||"")))}
function renderMain(){updateHeading();const p=periodBounds();if(!p.startMonth||!p.endMonth||p.startMonth>p.endMonth){$("#report-details").innerHTML='<p class="report-empty-note">Pilih bulan mulai, bulan sampai, dan tahun, lalu tekan Pilih Periode. Bulan mulai tidak boleh melewati bulan sampai.</p>';return}const currentOrder=p.year*12+p.startMonth-1,valid=rows.filter(r=>Number.isFinite(yearOf(r))&&Number.isFinite(monthOf(r))&&Number.isFinite(new Date(r.created_at).getTime())),prior=valid.filter(r=>periodOrder(r)<currentOrder&&!isSaldo(r)).reduce((s,r)=>s+(r.direction==="pemasukan"?amountOf(r):-amountOf(r)),0),priorSaldo=valid.filter(r=>periodOrder(r)<currentOrder&&isSaldo(r)).reduce((s,r)=>s+amountOf(r),0),list=currentRows(),saldoRows=list.filter(isSaldo),pupukOut=list.filter(isPupuk),incomeRows=list.filter(isIncome),expenseRows=list.filter(isExpense);const saldoMT=saldoRows.reduce((s,r)=>s+amountOf(r),0),periodOpening=opening+prior+priorSaldo+saldoMT,totalPupuk=pupukOut.reduce((s,r)=>s+amountOf(r),0),totalIn=incomeRows.reduce((s,r)=>s+amountOf(r),0),totalOut=expenseRows.reduce((s,r)=>s+amountOf(r),0);let balance=periodOpening;const table=document.createElement("table");table.className="formal-report-table";const thead=document.createElement("thead"),head=document.createElement("tr");["NO","KETERANGAN","PEMASUKAN","PENGELUARAN","SALDO"].forEach(v=>cell(head,v));thead.append(head);table.append(thead);const body=document.createElement("tbody");
addRow(body,{no:"I",description:"Saldo Awal "+months[p.startMonth-1]+" "+p.year,balance:periodOpening,kind:"section-row"});
addRow(body,{no:"II",description:"PENEBUSAN PUPUK :",kind:"section-row"});let letter=0;for(const r of pupukOut){letter++;balance-=amountOf(r);addRow(body,{no:String.fromCharCode(64+((letter-1)%26)+1),description:itemLabel(r),expense:amountOf(r),balance,kind:"detail-row"})}addRow(body,{no:"TOTAL",description:"",expense:totalPupuk,balance,kind:"total-row"});
addRow(body,{no:"III",description:"PEMASUKAN",kind:"section-row"});letter=0;for(const r of incomeRows){letter++;balance+=amountOf(r);addRow(body,{no:String.fromCharCode(64+((letter-1)%26)+1),description:itemLabel(r),income:amountOf(r),balance,kind:"detail-row"})}addRow(body,{no:"TOTAL",description:"",income:totalIn,balance,kind:"total-row"});
addRow(body,{no:"IV",description:"PENGELUARAN",kind:"section-row"});letter=0;for(const r of expenseRows){letter++;balance-=amountOf(r);addRow(body,{no:String.fromCharCode(64+((letter-1)%26)+1),description:itemLabel(r),expense:amountOf(r),balance,kind:"detail-row"})}addRow(body,{no:"TOTAL",description:"",expense:totalOut,balance,kind:"total-row"});
addRow(body,{no:"",description:"SALDO AKHIR "+months[p.endMonth-1].toUpperCase()+" "+p.year,balance:periodOpening-totalPupuk+totalIn-totalOut,kind:"ending-row"});
table.append(body);$("#report-details").replaceChildren(table);if(!list.length){const note=document.createElement("p");note.className="report-empty-note";note.textContent="Belum ada transaksi pada periode ini.";$("#report-details").prepend(note)}}
function canonicalProduct(r){const n=String(r.product_name||r.description||"").toLowerCase();if(n.includes("ponska"))return "Ponska";if(n.includes("urea"))return "Urea";if(n.includes("vayego"))return "Vayego";if(n.includes("za plus")||n.includes("za plus"))return "ZA Plus";return ""}
function buildAttachment(){
const list=currentRows(),profitRows=[];
const incomePupuk=list.filter(r=>r.direction==="pemasukan"&&r.category==="pupuk"&&!isSaldo(r));
const expensePupuk=list.filter(r=>r.direction==="pengeluaran"&&r.category==="pupuk"&&!isSaldo(r));
const productKey=r=>String(r.product_name||r.description||"").trim().toLocaleLowerCase("id-ID").replace(/\s+/g," ");
const productName=r=>String(r.product_name||r.description||"Pupuk").trim();
const groups=new Map();
for(const r of incomePupuk){
 const key=productKey(r);
 if(!key)continue;
 if(!groups.has(key))groups.set(key,{name:productName(r),income:[],expense:[]});
 groups.get(key).income.push(r);
}
for(const r of expensePupuk){
 const key=productKey(r);
 if(groups.has(key))groups.get(key).expense.push(r);
}
for(const group of groups.values()){
 const inTotal=group.income.reduce((s,r)=>s+amountOf(r),0);
 const outTotal=group.expense.reduce((s,r)=>s+amountOf(r),0);
 const quantity=group.income.reduce((s,r)=>s+Number(r.quantity||0),0);
 const unit=group.income.find(r=>r.unit)?.unit||"unit";
 let amount,label;
 if(group.expense.length){
  amount=inTotal-outTotal;
  if(amount<=0)continue;
  const unitProfit=quantity?amount/quantity:0;
  label=group.name+" "+qty(quantity)+" "+unit+" x "+money(unitProfit);
 }else{
  amount=inTotal;
  if(amount<=0)continue;
  const unitPrice=quantity?amount/quantity:0;
  label=quantity?group.name+" "+qty(quantity)+" "+unit+" @ "+money(unitPrice):group.name;
 }
 profitRows.push({label,amount});
}

const total=profitRows.reduce((s,r)=>s+r.amount,0);
const table=document.createElement("table");table.className="attachment-table";const body=document.createElement("tbody");
function row(no,label,amount="",kind=""){const tr=document.createElement("tr");if(kind)tr.className=kind;cell(tr,no);cell(tr,label);cell(tr,amount===""?"":money(amount),"number");body.append(tr)}
row("I","KEUNTUNGAN KELOMPOK :","","section-row");
profitRows.forEach((r,i)=>row(String(i+1),r.label,r.amount));
row("","Total",total,"total-row");
row("II","PEMBAGIAN KEUNTUNGAN : "+money(total),"","section-row");
row("1","40 % Pengurus",total*.4);row("2","40% Pengembangan Kelompok",total*.4);row("3","20% Operasional",total*.2);
table.append(body);$("#attachment-details").replaceChildren(table)
}
function render(){renderMain();const p=periodBounds();if(p.startMonth&&p.endMonth&&p.startMonth<=p.endMonth)buildAttachment();else $("#attachment-details").innerHTML='<p class="report-empty-note">Pilih rentang bulan dan tahun, lalu tekan Pilih Periode.</p>'}
async function load(){const settings=await db.from("tani_pengaturan").select("saldo_awal").eq("id",1).maybeSingle();if(settings.error){$("#report-details").textContent="Gagal membaca saldo awal: "+settings.error.message;return}opening=Number(settings.data?.saldo_awal??0);const result=await db.from("tani_transaksi").select("*").order("created_at",{ascending:true});if(result.error){$("#report-details").textContent="Tidak dapat memuat laporan: "+result.error.message+" (periksa akses akun dan kebijakan RLS Supabase).";return}rows=result.data||[];render()}
function validYear(){const raw=String($("#report-year").value||"").trim();if(!/^\d{4}$/.test(raw)||Number(raw)<1900||Number(raw)>9999){alert("Masukkan tahun dengan 4 angka, misalnya 2026.");$("#report-year").focus();return null}return Number(raw)}
async function downloadPdf(){
 const button=document.getElementById("download-pdf");
 if(button.disabled)return;
 button.disabled=true;
 const oldLabel=button.textContent;
 button.textContent="Menyiapkan PDF…";
 try{
  const JsPDF=window.jspdf&&window.jspdf.jsPDF;
  if(typeof JsPDF!=="function")throw new Error("Pustaka PDF belum termuat. Periksa koneksi internet, lalu muat ulang halaman.");
  const mainTable=document.querySelector("#report-details table");
  const attachmentTable=document.querySelector("#attachment-details table");
  if(!mainTable||!attachmentTable)throw new Error("Tabel laporan atau lampiran belum selesai dimuat.");
  const rowsToData=table=>Array.from(table.querySelectorAll("tbody tr")).map(tr=>Array.from(tr.querySelectorAll("th,td")).map(td=>td.textContent.trim()));
  const data=rowsToData(mainTable);
  const attachmentData=rowsToData(attachmentTable);
  const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  if(typeof doc.autoTable!=="function")throw new Error("Komponen tabel PDF belum termuat. Periksa koneksi internet dan coba lagi.");
  const pageWidth=doc.internal.pageSize.getWidth();
  doc.setFont("helvetica","bold");doc.setFontSize(12);
  doc.text("LAPORAN PERTANGGUNGJAWABAN KEUANGAN",pageWidth/2,22,{align:"center"});
  doc.setFontSize(10);
  doc.text("KELOMPOK TANI USAHA PANGAN II",pageWidth/2,17,{align:"center"});
  doc.setFontSize(10);
  doc.text(document.getElementById("period-heading").textContent,pageWidth/2,27,{align:"center"});
  doc.autoTable({startY:33,head:[["NO","KETERANGAN","PEMASUKAN","PENGELUARAN","SALDO"]],body:data,theme:"grid",margin:{left:12,right:12,top:15,bottom:15},tableWidth: "auto",styles:{fontSize:9.5,cellPadding:2,textColor:[0,0,0],overflow:"linebreak",valign:"middle",lineWidth:0.8,lineColor:[0,0,0]},headStyles:{fillColor:[23,107,82],textColor:[255,255,255],fontStyle:"bold",halign:"center",lineWidth:0.8,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:16,halign:"center"},1:{cellWidth:68},2:{cellWidth:34,halign:"right"},3:{cellWidth:34,halign:"right"},4:{cellWidth:34,halign:"right"}},rowPageBreak:"avoid",didParseCell:d=>{d.cell.styles.lineWidth=0.8;d.cell.styles.lineColor=[0,0,0];const row=data[d.row.index];if(d.section==="body"&&row&&["I","II","III","IV","TOTAL"].includes(row[0]))d.cell.styles.fontStyle="bold"}});
  let y=(doc.lastAutoTable&&doc.lastAutoTable.finalY||45)+8;
  if(y+29>282){throw new Error("Laporan utama melebihi satu halaman A4. Kurangi rentang periode atau jumlah baris agar tanda tangan tetap di halaman pertama.")}
  doc.setFont("helvetica","normal");doc.setFontSize(9);
  doc.text("Mengetahui",47,y);doc.text("Bendahara",pageWidth-47,y+7);
  doc.text("Ketua",47,y+7);
  doc.text("..................................",35,y+25);
  doc.text("..................................",pageWidth-59,y+25);
  doc.addPage("a4","portrait");
  doc.setFont("helvetica","bold");doc.setFontSize(15);doc.text("LAMPIRAN",12,18);
  doc.setFontSize(11);doc.text(document.getElementById("attachment-period").textContent,12,25);
  doc.autoTable({startY:33,head:[],body:attachmentData,theme:"grid",margin:{left:12,right:12,top:15,bottom:15},tableWidth:"auto",styles:{fontSize:11,cellPadding:{top:1.6,right:2.5,bottom:1.6,left:2.5},textColor:[0,0,0],overflow:"linebreak",valign:"middle",lineWidth:0.8,lineColor:[0,0,0]},columnStyles:{0:{cellWidth:18,halign:"center"},1:{cellWidth:123},2:{cellWidth:45,halign:"right"}},didParseCell:d=>{d.cell.styles.lineWidth=0.8;d.cell.styles.lineColor=[0,0,0];const row=attachmentData[d.row.index];if(d.section==="body"&&row&&(row[0]==="I"||row[0]==="II"||row[1]==="Total"))d.cell.styles.fontStyle="bold"}});
  if(doc.internal.getNumberOfPages()!==2)throw new Error("Hasil PDF tidak tepat dua halaman A4. Periksa jumlah baris laporan dan lampiran.");
  const p=periodBounds();doc.save("Laporan-Keuangan-"+p.year+"-"+months[p.startMonth-1]+"-sampai-"+months[p.endMonth-1]+".pdf");
 }catch(error){
  console.error("Gagal membuat PDF laporan:",error);
  alert("Download PDF gagal: "+(error&&error.message?error.message:"kesalahan tidak diketahui")+".");
 }finally{button.disabled=false;button.textContent=oldLabel}
}
async function init(){setupYears();$("#apply-period").addEventListener("click",()=>{const year=validYear();if(year===null)return;const startMonth=Number($("#start-month").value),endMonth=Number($("#end-month").value);if(!Number.isInteger(startMonth)||startMonth<1||startMonth>12){alert("Pilih bulan mulai.");$("#start-month").focus();return}if(!Number.isInteger(endMonth)||endMonth<1||endMonth>12){alert("Pilih bulan sampai.");$("#end-month").focus();return}if(startMonth>endMonth){alert("Bulan mulai tidak boleh melewati bulan sampai.");$("#start-month").focus();return}appliedStartMonth=startMonth;appliedEndMonth=endMonth;appliedYear=year;render()});$("#report-year").addEventListener("keydown",e=>{if(e.key==="Enter")$("#apply-period").click()});$("#download-pdf").addEventListener("click",downloadPdf);updateHeading();render();if(!window.isSupabaseConfigured||!isSupabaseConfigured()){$("#report-details").textContent="Konfigurasi Supabase belum lengkap. Periksa assets/config.js.";return}if(!window.KT_AUTH){$("#report-details").textContent="Sesi login belum siap. Silakan masuk kembali.";return}const authenticated=await window.KT_AUTH.ready;if(!authenticated){$("#report-details").textContent="Sesi login tidak aktif atau akses akun belum terverifikasi. Silakan masuk kembali.";$("#attachment-details").textContent="Lampiran belum dapat dimuat karena sesi login belum aktif.";return}db=window.KT_AUTH.client;await load()}
init().catch(error=>{console.error("Gagal menginisialisasi laporan:",error);const main=document.getElementById("report-details");const attachment=document.getElementById("attachment-details");if(main)main.textContent="Laporan gagal dimuat: "+(error?.message||"kesalahan tidak diketahui")+". Muat ulang halaman atau masuk kembali.";if(attachment)attachment.textContent="Lampiran belum dapat dimuat."});
})();