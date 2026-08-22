const $=id=>document.getElementById(id);
let contractType='structure', depth=2, profile='balanced';
const depthNames={1:'مختصر',2:'متوازن',3:'متقدم',4:'احترافي'};
const profileNames={balanced:'متوازن سعودي',employer:'حماية أعلى لأراك',international:'ممارسة مشاريع احترافية',lean:'مقاولات صغيرة سريعة'};

const scopes={
 structure:['الحفر والردم','الأساسات والقواعد','الميدات والجسور','الأعمدة','الأسقف','السلالم','الحديد والخرسانة','أعمال البلوك','العزل الإنشائي','الفتحات والتأسيسات الإنشائية'],
 finishing:['اللياسة','الجبس والأسقف','الدهانات','الأرضيات والبلاط','الرخام','الأبواب والنجارة','الألمنيوم والزجاج','الأعمال الصحية النهائية','الأعمال الكهربائية النهائية','الإنارة والمفاتيح','الأدوات الصحية','التنظيف والتسليم']
};
const moduleDefs=[
 ['definitions','التعريفات وتفسير المستندات','يقلل الخلاف حول المصطلحات والأولوية',3],
 ['siteReview','إقرار المعاينة وفحص المستندات','يثبت اطلاع المقاول على الموقع والوثائق',2],
 ['earlyWarning','الإنذار المبكر بالمخاطر','إشعار فوري قبل تفاقم التأخير أو التكلفة',3],
 ['variations','أوامر التغيير وتسعيرها','تغيير مكتوب + أولوية تسعير واضحة',2],
 ['eot','تمديد المدة والمطالبات','أسباب الاستحقاق ومهل الإشعار والتوثيق',2],
 ['records','سجلات الموقع والتقارير','تقارير تقدم ومحاضر وصور وسجلات العمالة',3],
 ['materialsRisk','ملكية المواد ومخاطرها','ينظم المواد المدفوعة وغير المركبة بالمشروع',3],
 ['hiddenWorks','الأعمال المخفية والفحوصات','عدم الإغلاق قبل المعاينة والاعتماد',2],
 ['subcontract','المقاولون من الباطن','موافقة مسبقة مع بقاء مسؤولية المقاول',2],
 ['safety','السلامة والتأمين','سلامة الموقع والمسؤولية والتأمينات',2],
 ['defects','العيوب والاستلام والضمان','قائمة ملاحظات وتصحيح وضمانات نظامية',1],
 ['suspension','تعليق الأعمال','ينظم حق الإيقاف وآثاره وإعادة المباشرة',3],
 ['breach','الإخلال بالالتزامات','إشعار وتصحيح الإخلال وآثاره قبل الإنهاء',2],
 ['termination','الإنهاء والاستكمال','إنهاء العقد وحصر الأعمال والاستكمال على الحساب',2],
 ['liability','المسؤولية والتعويضات','ضبط المسؤولية مع عدم إعفاء الغش والخطأ الجسيم',4],
 ['confidentiality','السرية والوثائق','حماية مخططات وبيانات المشروع',4],
 ['compliance','الامتثال والتراخيص','التراخيص والكود والاشتراطات النظامية',2],
 ['notices','الإشعارات الرسمية','قنوات وصلاحية الإشعارات والاعتمادات',3]
];

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function num(v,min=0,max=1e9){v=Number(v);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):0}
function val(id){return esc($(id).value.trim()||'________')}
function money(v){return new Intl.NumberFormat('ar-SA',{maximumFractionDigits:2}).format(v)}
function renderScopes(){
 const h=$('scopeChecks');h.innerHTML='';
 scopes[contractType].forEach((s,i)=>{const l=document.createElement('label');l.className='check';l.innerHTML=`<input type="checkbox" data-scope="${esc(s)}" ${i<8?'checked':''}> <span>${esc(s)}</span>`;h.appendChild(l)});
}
function moduleDefault(key,minDepth){
 if(profile==='lean') return ['defects','variations','eot','breach','termination','compliance'].includes(key) && depth>=Math.min(minDepth,2);
 if(profile==='employer') return depth>=Math.max(1,minDepth-1);
 if(profile==='international') return depth>=Math.max(2,minDepth-1);
 return depth>=minDepth;
}
function renderModules(preserve=false){
 const existing={}; if(preserve) document.querySelectorAll('.switch').forEach(x=>existing[x.dataset.module]=x.checked);
 const h=$('modules');h.innerHTML='';
 moduleDefs.forEach(([key,title,desc,minDepth])=>{
  const row=document.createElement('label');row.className='module';
  const checked=preserve && key in existing ? existing[key] : moduleDefault(key,minDepth);
  row.innerHTML=`<span class="txt"><b>${title}</b><span>${desc}</span></span><input class="switch" type="checkbox" data-module="${key}" ${checked?'checked':''}>`;
  h.appendChild(row);
 });
 h.querySelectorAll('.switch').forEach(x=>x.addEventListener('change',()=>{build();score()}));
}
function selectedScopes(){return [...document.querySelectorAll('#scopeChecks input:checked')].map(x=>x.dataset.scope)}
function enabled(k){const e=document.querySelector(`.switch[data-module="${k}"]`);return !!(e&&e.checked)}
function collect(){
 return {
  firstParty:val('firstParty'),firstCR:val('firstCR'),firstRep:val('firstRep'),secondParty:val('secondParty'),secondCR:val('secondCR'),secondRep:val('secondRep'),
  projectName:val('projectName'),projectLocation:val('projectLocation'),date:$('contractDate').value||'__/__/____',startBasis:val('startBasis'),
  price:num($('priceM2').value),area:num($('areaM2').value),duration:val('duration'),vat:val('vat'),advance:num($('advance').value,0,100),
  retention:num($('retention').value,0,100),delayRate:num($('delayRate').value,0,100),delayCap:num($('delayCap').value,0,100),
  performanceBond:num($('performanceBond').value,0,100),advanceGuarantee:val('advanceGuarantee'),warranty:val('warranty'),insurance:val('insurance'),
  supplyMode:val('supplyMode'),measurement:val('measurement'),claimNotice:num($('claimNotice').value,1,365),detailNotice:num($('detailNotice').value,1,365),
  variationAuthority:val('variationAuthority'),approver:val('approver'),dispute:val('dispute'),amicable:val('amicableDays'),jurisdiction:val('jurisdictionCity'),
  notes:$('specialNotes').value.trim(),finishGrade:$('finishGrade').value,standardPrice:num($('standardPrice').value),deluxePrice:num($('deluxePrice').value),
  scopes:selectedScopes(),pageTarget:$('pageTarget').value
 }
}
function clause(n,title,body){return `<section class="clause"><h3><span>${n}.</span><span>${title}</span></h3>${body}</section>`}
function p(t){return `<p>${t}</p>`}
