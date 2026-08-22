function state(){
 const ids=['firstParty','firstCR','firstRep','secondParty','secondCR','secondRep','projectName','projectLocation','contractDate','startBasis','priceM2','areaM2','duration','vat','advance','retention','delayRate','delayCap','performanceBond','advanceGuarantee','warranty','insurance','finishGrade','standardPrice','deluxePrice','supplyMode','claimNotice','detailNotice','variationAuthority','approver','measurement','dispute','amicableDays','jurisdictionCity','specialNotes','pageTarget'];
 const fields={};ids.forEach(id=>fields[id]=$(id).value);
 const modules={};document.querySelectorAll('.switch').forEach(x=>modules[x.dataset.module]=x.checked);
 return {contractType,depth,profile,fields,modules,scopes:selectedScopes()};
}
function save(){
 try{localStorage.setItem('araak-contract-builder-v2',JSON.stringify(state()));alert('تم حفظ الإعدادات على هذا المتصفح.')}catch(e){alert('تعذر الحفظ في هذا المتصفح.')}
}
function load(){
 try{
  const raw=localStorage.getItem('araak-contract-builder-v2');if(!raw){alert('لا توجد إعدادات محفوظة.');return}
  const s=JSON.parse(raw);contractType=s.contractType||'structure';depth=Number(s.depth)||2;profile=s.profile||'balanced';
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.type===contractType));
  document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('active',Number(b.dataset.depth)===depth));
  document.querySelectorAll('.profile').forEach(b=>b.classList.toggle('active',b.dataset.profile===profile));
  $('finishPanel').style.display=contractType==='finishing'?'block':'none';renderScopes();renderModules(false);
  Object.entries(s.fields||{}).forEach(([k,v])=>{if($(k))$(k).value=v});
  if(Array.isArray(s.scopes)) document.querySelectorAll('#scopeChecks input').forEach(x=>x.checked=s.scopes.includes(x.dataset.scope));
  if(s.modules) document.querySelectorAll('.switch').forEach(x=>{if(x.dataset.module in s.modules)x.checked=!!s.modules[x.dataset.module]});
  build();
 }catch(e){alert('تعذر استعادة الإعدادات المحفوظة.')}
}
function download(){
 const name=contractType==='structure'?'عقد-اعمال-العظم-اراك-المتقدم.html':'عقد-التشطيبات-اراك-المتقدم.html';
 const body=$('paper').outerHTML.replace('contenteditable="true"','contenteditable="false"');
 const css=[...document.styleSheets].map(sheet=>{try{return [...sheet.cssRules].map(r=>r.cssText).join('\n')}catch(e){return ''}}).join('\n');
 const out=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>${css} body{display:block}.panel,.toolbar,.alerts,.refs{display:none!important}.workspace{padding:0}.paper{box-shadow:none;margin:0 auto}</style></head><body><main class="workspace">${body}</main></body></html>`;
 const blob=new Blob([out],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{contractType=b.dataset.type;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));$('finishPanel').style.display=contractType==='finishing'?'block':'none';renderScopes();build()}));
document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>{depth=Number(b.dataset.depth);document.querySelectorAll('.preset').forEach(x=>x.classList.toggle('active',x===b));renderModules(false);build()}));
document.querySelectorAll('.profile').forEach(b=>b.addEventListener('click',()=>{profile=b.dataset.profile;document.querySelectorAll('.profile').forEach(x=>x.classList.toggle('active',x===b));renderModules(false);build()}));
$('regenerate').addEventListener('click',build);$('printBtn').addEventListener('click',()=>window.print());$('downloadBtn').addEventListener('click',download);$('saveBtn').addEventListener('click',save);$('loadBtn').addEventListener('click',load);
$('resetBtn').addEventListener('click',()=>{if(confirm('إعادة النموذج بالكامل إلى الإعدادات الافتراضية؟')){localStorage.removeItem('araak-contract-builder-v2');location.reload()}});
document.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('change',()=>{score()}));
renderScopes();renderModules(false);build();
