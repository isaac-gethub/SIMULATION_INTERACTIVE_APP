
const SUPABASE_URL='https://blfgwysgekfqhcafofhe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_ThLetpd4hj49fjce-kXoFA_v4ghwIqV';
const BUILD_VERSION='2026-10-07-G6-JS-SYNTAX-FIX-3';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
function el(id){return document.getElementById(id)}
function setAuthMessage(msg){const x=el('authMsg'); if(x)x.textContent=msg||'';}
const ENROLLMENT_COURSE='TIB-PM-CONTROLS-LEAD';
const APP_COURSE_ID='pm_to_controls_lead';
const MATERIALS_BUCKET='academy-materials';
const SUBMISSIONS_BUCKET='academy-submissions';
let currentUser=null,data,ai=0,si=0;const stageNames=['SEE','LISTEN','OBSERVE','BUILD','COMPARE','CONNECT'];
async function init(){
 data=await fetch('course-content.json').then(r=>r.json());
 window.activityMaterialMap=await fetch('activity-material-map.json').then(r=>r.json()).catch(()=>({activity_mapping:{}}));
 window.audioManifest=await fetch('audio-manifest.json').then(r=>r.json()).catch(()=>({activities:{}}));
 const {data:{session}}=await sb.auth.getSession();
 if(session){await enterAcademy(session.user)}
}
async function signIn(){
 const msg=el('authMsg'), emailEl=el('loginEmail'), passwordEl=el('loginPassword'), btn=el('signInBtn');
 msg.textContent='Signing in…';
 try{
   const email=emailEl.value.trim(), password=passwordEl.value;
   if(!email||!password){msg.textContent='Enter both email and password.';return;}
   btn.disabled=true; btn.textContent='Signing in…';
   const result=await Promise.race([
     sb.auth.signInWithPassword({email,password}),
     new Promise((_,reject)=>setTimeout(()=>reject(new Error('Authentication request timed out after 15 seconds.')),15000))
   ]);
   const {data:login,error}=result;
   if(error){msg.textContent='Sign-in failed: '+error.message;return;}
   msg.textContent='Signed in. Verifying course access…';
   await enterAcademy(login.user);
 }catch(err){msg.textContent='Login diagnostic: '+(err?.message||String(err));}
 finally{btn.disabled=false;btn.textContent='Sign In';}
}
async function enterAcademy(user){
 currentUser=user;el('userChip').textContent=user.email||'Signed in';
 const {data:enroll,error}=await sb.from('enrollments').select('course,is_active,start_date,expiry_date').eq('user_id',user.id).eq('course',ENROLLMENT_COURSE).eq('is_active',true).maybeSingle();
 if(error){setAuthMessage('Unable to verify course access: '+error.message);return}
 if(!enroll){setAuthMessage('Your account is valid, but LEARN TO LEAD is not currently assigned to this account.');return}
 el('authGate').style.display='none';
 const {data:rows}=await sb.from('academy_progress').select('item_id,status,progress_percent,data').eq('user_id',user.id).eq('app_course_id',APP_COURSE_ID);
 window.remoteProgress=rows||[];
 const resume=(rows||[]).filter(x=>x.data&&x.data.current_project_stage).sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at))[0];
 if(resume){const idx=data.activities.findIndex(x=>x.id===resume.item_id);if(idx>=0){ai=idx;localStorage.setItem('tib_ila_activity',String(ai));}}
 const {data:mats}=await sb.from('academy_materials').select('id,item_id,category,title,filename,storage_path,material_type,sort_order').eq('app_course_id',APP_COURSE_ID).eq('audience','trainee').eq('is_active',true).order('sort_order');
 window.courseMaterials=mats||[];
 const {data:subs}=await sb.from('academy_submissions').select('id,item_id,original_filename,status,score,reviewer_comments,submitted_at').eq('user_id',user.id).eq('app_course_id',APP_COURSE_ID).order('submitted_at',{ascending:false});
 window.mySubmissions=subs||[];
 let saved=(rows||[]).find(x=>x.data&&x.data.current_project_stage);
 if(saved){let x=data.activities.findIndex(a=>a.projectStage===saved.data.current_project_stage);if(x>=0)ai=x}
 if(!(window.remoteProgress||[]).length){const savedAi=Number(localStorage.getItem('tib_ila_activity'));if(Number.isInteger(savedAi)&&savedAi>=0&&savedAi<data.activities.length)ai=savedAi;}
 render();
 // Course Overview is the application entrance page for every authenticated course entry.
 // It is orientation, not an activity, and does not alter progress or the saved resume position.
 setTimeout(openCourseOverview,150);
}
async function saveRemoteProgress(item,status,percent,extra={}){
 if(!currentUser)return;
 await sb.from('academy_progress').upsert({user_id:currentUser.id,app_course_id:APP_COURSE_ID,item_id:item,status,progress_percent:percent,data:extra,updated_at:new Date().toISOString()},{onConflict:'user_id,app_course_id,item_id'});
}
function render(){
 const a=data.activities[ai], pct=Math.round((ai/data.activities.length)*100);
 activityTitle.textContent=a.title;projectStage.textContent=a.projectStage;crumb.textContent='My Courses / '+data.course.title+' / '+a.projectStage;
 current.textContent=a.projectStage+' · '+stageNames[si];document.getElementById('pct').textContent=pct+'%';bar.style.width=pct+'%';progressText.textContent='Course progress · '+pct+'%';
 map.innerHTML='';data.activities.forEach((x,i)=>{let b=document.createElement('button');b.textContent=(i<ai?'✓ ':'')+x.projectStage;b.className=i===ai?'active':(i<ai?'done':'');b.onclick=()=>{ai=i;si=0;render()};map.appendChild(b)});
 stages.innerHTML='';stageNames.forEach((x,i)=>{let b=document.createElement('button');b.className='stage '+(i===si?'active':'');b.textContent=x;b.onclick=()=>{si=i;render()};stages.appendChild(b)});
 renderStage(a);
}
function missing(a,what){return `<div class="kicker">${stageNames[si]}</div><h2>${a.projectStage}</h2><p class="body">This activity is ready in the reusable learning engine. ${what} has not yet been populated in the course-content model.</p><div class="flow">Content Admin → add approved content → the trainee player loads it here automatically.</div>`}

const THEORY_REFS={
 'risks':[['B1','Risk Types','foundation-b1.html']],
 'controls':[['B2','Control Types','foundation-b2.html'],['B3','Control Nature','foundation-b3.html'],['B4','Why Controls Matter','foundation-b4.html']],
 'testing':[['B8','Testing Decisions','foundation-b8.html']],
 'lead-04':[['B6','S/4HANA Lifecycle','foundation-b6.html']],
 'lead-05':[['B8','Testing Decisions','foundation-b8.html']],
 'lead-06':[['B8','Testing Decisions','foundation-b8.html']],
 'lead-07':[['B9','AI in Controls','foundation-b9.html']],
 'lead-08':[['B10','Practitioner Capstone','foundation-b10.html']]
};
function openStaticHtmlPage(path,title){
 showLibraryBack(false);currentViewerUrl=path;currentViewerMaterial={title,filename:path};viewerTitle.textContent=title;viewerBody.classList.add('htmlPage');viewerBody.innerHTML=`<iframe src="${path}" style="display:block;width:100%;height:100%;border:0;background:#fff" title="${esc(title)}"></iframe>`;document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';viewer.style.display='flex';viewer.classList.add('open');
}
function openJobMarketAlignment(){openStaticHtmlPage('job-market-alignment.html','Why This Course Matches the Job');}
function openCourseOverview(){openStaticHtmlPage('course-overview.html','TIB ILA Course Overview');}
function openFoundation(){openStaticHtmlPage('foundation.html','FOUNDATION · Controls Theory');}
function theoryReferenceCards(a){const xs=THEORY_REFS[a.id]||[];if(!xs.length)return '';return `<div style="margin-top:16px;padding:14px;border:1px solid var(--line);border-radius:12px;background:#f8fafc"><b style="color:var(--navy)">Theory Reference</b><div class="docs" style="margin-top:8px">${xs.map(x=>`<div class="doc"><b>${x[0]} — ${x[1]}</b><button class="btn" style="float:right;padding:6px 9px" onclick="openEnhancement('${x[2]}','${x[0]} — ${x[1]}')">Open</button></div>`).join('')}</div></div>`;}

function enhancementCards(a){
 const xs=a.enhancementMaterials||[];
 if(!xs.length)return '';
 return `<h3 style="color:var(--navy);margin-top:20px">TIB Controls Lead Readiness Enhancements</h3><div class="docs">${xs.map((x,i)=>`<div class="doc"><b>${esc(x.title)}</b><br><span class="muted">Integrated into this existing activity</span><button class="btn" style="float:right;padding:6px 9px" onclick="openEnhancement('${x.file}','${esc(x.title).replace(/'/g,"&#39;")}')">Open</button></div>`).join('')}</div>`;
}
async function openEnhancement(path,title){
 showLibraryBack(false);currentViewerUrl=path;currentViewerMaterial={title:title,filename:path};viewerTitle.textContent=title;await renderLocalFile(path,title);
}
function renderStage(a){
 if(si===0){
 let pref=((window.activityMaterialMap.activity_mapping||{})[a.id]||{}).preferred||[];
 let selected=(window.courseMaterials||[]).map((m,i)=>({...m,_idx:i})).filter(m=>pref.includes(m.title));
 let real=selected.map(m=>`<div class="doc"><b>${m.title}</b><br><span class="muted">${m.category} · ${m.material_type}</span> <button class="btn" style="float:right;padding:6px 9px" onclick="openMaterial(${m._idx})">Open</button></div>`).join('');
 content.innerHTML=a.leadershipAddon?`<div class="kicker">SEE · LEADERSHIP OUTCOME</div><h2>${a.title}</h2><p class="body"><b>Scenario:</b> ${a.scenario}</p><div class="flow"><b>Your leadership output:</b> ${a.artifact}</div><p class="body">${a.purpose}</p><p><a class="btn" style="display:inline-block;text-decoration:none" href="lead-templates.xlsx" download>↓ Open Leadership Template Workbook</a></p>`:`<div class="kicker">SEE · FINISHED PRODUCT</div><h2>${a.title}</h2><p class="body">Before doing the work, see the finished work product and understand where it fits in the controls project.</p><div class="flow">${data.course.projectMap.join(' → ')}</div><h3 style="color:var(--navy);margin-top:20px">Materials for This Project Activity</h3><div class="docs">${real||'<div class="doc">No activity-specific material has been mapped yet.</div>'}</div>
<details style="margin-top:14px"><summary style="cursor:pointer;font-weight:800;color:var(--navy)">View complete LEARN TO LEAD material library</summary>
<div class="docs" style="margin-top:10px">${(window.courseMaterials||[]).map((m,i)=>`<div class="doc">${m.title} <button class="btn" style="float:right;padding:5px 8px" onclick="openMaterial(${i})">Open</button></div>`).join('')}</div></details>`;
}
 if(si===1){
 const am=(window.audioManifest.activities||{})[a.id]||{};
 content.innerHTML=a.narration?`<div class="kicker">LISTEN · PROJECT STORY</div><h2>${a.narrationTitle||a.title}</h2>
 <p class="body" id="narrationText">${a.narration}</p>
 <div class="audio"><audio id="prodAudio" controls style="width:100%;display:${am.storage_path?'block':'none'}"></audio>
 <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px">
 <button class="btn" onclick="playNarration()">▶ Play</button><button class="btn" onclick="pauseNarration()">Ⅱ Pause</button><button class="btn" onclick="restartNarration()">↺ Replay</button>
 <select id="speed" onchange="setNarrationSpeed(this.value)" style="padding:8px;border:1px solid var(--line);border-radius:8px"><option>.75</option><option selected>1</option><option>1.25</option><option>1.5</option></select>
 </div><div class="muted" id="audioStatus" style="margin-top:8px">${am.storage_path?'Production audio configured':'Production audio pending · browser voice fallback available'}</div></div>`:missing(a,'First-person narration');
 if(a.narration && am.storage_path)setTimeout(()=>bindProductionAudio(am.storage_path),0);
}
 if(si===2){
 let pref=((window.activityMaterialMap.activity_mapping||{})[a.id]||{}).preferred||[];
 let mapped=(window.courseMaterials||[]).map((m,i)=>({...m,_idx:i})).filter(m=>pref.includes(m.title));
 let cards=mapped.map(m=>`<div class="doc"><b>${m.title}</b><br><span class="muted">${m.filename}</span><button class="btn" style="float:right;padding:6px 9px" onclick="openMaterial(${m._idx})">SHOW ME</button></div>`).join('');
 content.innerHTML=a.leadershipAddon?`<div class="kicker">OBSERVE · LEADERSHIP JUDGMENT</div><h2>Watch the Controls Lead Think</h2><p class="body">Review the leadership task before you perform it. Focus on the management decision represented by the artifact—not clerical completion.</p><div class="docs">${(a.observePrompts||[]).map((q,i)=>`<div class="doc"><b>${i+1}. ${q}</b></div>`).join('')}</div><div class="flow">Ask: What do I own? What do I delegate? What must I review? What must I challenge? What requires approval or escalation?</div><p><a class="btn" style="display:inline-block;text-decoration:none" href="lead-templates.xlsx" download>↓ Review Leadership Template Workbook · ${a.templateSheet}</a></p>`:`<div class="kicker">OBSERVE · REAL TIB MATERIALS</div><h2>Now Look at the Work Products</h2><p class="body">Open the materials mapped to this project activity. Word documents now open directly inside TIB ILA; original files remain available when you need them.</p><div class="docs">${cards||'<div class="doc">No real artifact has been mapped to this activity yet.</div>'}</div><div class="flow">Use the full learning area to review the project material before continuing.</div>`;
}
 if(si===3){
 let docs=(a.sourceDocuments||[]).map(x=>`<div class="doc">▤ ${x}</div>`).join('');
 content.innerHTML=`<div class="kicker">BUILD · YOUR TURN</div><h2>You Are Now the Controls Lead</h2><p class="body">${a.exercise||'Use only the supplied client information. Do not invent missing facts; leave unsupported information outstanding.'}</p>${a.leadershipAddon?`<div class="flow"><b>Use template sheet:</b> ${a.templateSheet} · <b>Required output:</b> ${a.artifact}</div>`:''}<div class="docs">${docs}</div>${a.blankWorkbook?`<p><a class="btn" style="display:inline-block;text-decoration:none" href="${a.blankWorkbook}" download>↓ Download Blank Workbook</a></p>`:''}<div class="audio"><b>Submit your completed workbook</b><br><input id="submissionFile" type="file" accept=".xlsx,.xls,.csv,.docx,.pdf" style="margin:10px 0"><br><button class="btn maroon" onclick="uploadSubmission()">Upload to TIB Academy</button><div class="muted" id="uploadMsg" style="margin-top:8px"></div></div>${submissionStatusHtml(a.id)}`;
}
 if(si===4){
 let saved=JSON.parse(localStorage.getItem('tib_ila_review_'+a.id)||'{}');
 let qs=(a.reviewQuestions||[]).map((q,i)=>`<div class="mini"><b>${i+1}. ${q}</b><textarea id="review_${i}" oninput="saveReview('${a.id}',${i},this.value)">${saved[i]||''}</textarea><div class="answerSaved">Saved in this browser</div></div>`).join('');
 content.innerHTML=qs?`<div class="kicker">COMPARE · SELF-REVIEW</div><h2>Your Work ⇄ TIB Completed Example</h2><p class="body">Compare for judgment, evidence and completeness—not simply wording. Your answers become your preparation for instructor review.</p><div class="grid2">${qs}</div>${submissionStatusHtml(a.id)}<div class="assessBox"><button class="btn maroon" onclick="completeCompare()">Complete Self-Review</button><span class="muted" id="compareMsg" style="margin-left:8px"></span></div>`:missing(a,'Comparison questions');
}
 if((si===0||si===2||si===3) && (a.enhancementMaterials||[]).length){content.insertAdjacentHTML('beforeend',enhancementCards(a));}
 if(si===5){let c=a.connect||{};content.innerHTML=c.buildNext?`<div class="kicker">CONNECT</div><h2>Why Does the Next Workbook Exist?</h2><div class="grid2"><div class="mini"><b>WHAT I NOW KNOW</b><p>${c.nowKnow||''}</p></div><div class="mini"><b>WHAT I STILL NEED TO KNOW</b><p>${c.stillNeed||''}</p></div></div><div class="next"><b>WHAT I BUILD NEXT</b><p>${c.buildNext}</p></div>${a.nextActivity?'<button class="btn maroon" onclick="nextActivity()">Start Next Activity →</button>':''}`:missing(a,'CONNECT reasoning')}
}
let activeUtterance=null,narrationRate=1;
async function bindProductionAudio(path){
 const {data:signed,error}=await sb.storage.from(MATERIALS_BUCKET).createSignedUrl(path,1800);
 if(error){audioStatus.textContent='Production audio unavailable · browser voice fallback available';return}
 prodAudio.src=signed.signedUrl;prodAudio.style.display='block';
}
function playNarration(){
 const am=(window.audioManifest.activities||{})[data.activities[ai].id]||{};
 if(am.storage_path && document.getElementById('prodAudio') && prodAudio.src){prodAudio.playbackRate=narrationRate;prodAudio.play();return}
 if(!('speechSynthesis'in window))return alert('Narration playback is unavailable in this browser.');
 if(speechSynthesis.paused){speechSynthesis.resume();return}
 speechSynthesis.cancel();activeUtterance=new SpeechSynthesisUtterance(data.activities[ai].narration||'');activeUtterance.rate=narrationRate;speechSynthesis.speak(activeUtterance);
}
function pauseNarration(){if(document.getElementById('prodAudio')&&!prodAudio.paused)prodAudio.pause();if('speechSynthesis'in window)speechSynthesis.pause()}
function restartNarration(){if(document.getElementById('prodAudio')&&prodAudio.src){prodAudio.currentTime=0;prodAudio.playbackRate=narrationRate;prodAudio.play();return}if('speechSynthesis'in window){speechSynthesis.cancel();playNarration()}}
function setNarrationSpeed(v){narrationRate=Number(v);if(document.getElementById('prodAudio'))prodAudio.playbackRate=narrationRate;if(activeUtterance&&speechSynthesis.speaking){speechSynthesis.cancel();playNarration()}}
async function nextActivity(){
 const old=data.activities[ai],n=data.activities.findIndex(x=>x.id===old.nextActivity);
 if(n>=0){
   await saveRemoteProgress(old.id,'completed',100,{current_project_stage:data.activities[n].projectStage});
   ai=n;si=0;render();
 }
}

let currentViewerUrl='',currentViewerMaterial=null;

function xmlTextDecode(v){
 const ta=document.createElement('textarea');
 ta.innerHTML=String(v||'').replace(/&apos;/g,"&#39;");
 return ta.value;
}
function extractRunsNoParser(xml){
 return [...String(xml||'').matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
   .map(m=>xmlTextDecode(m[1].replace(/<[^>]+>/g,''))).join('');
}
async function renderDocxSafeFallback(buffer,host){
 // Last-resort reader intentionally avoids DOM/XML parsers. This allows TIB ILA
 // to display readable Word content even when malformed custom XML breaks normal renderers.
 const zip=await JSZip.loadAsync(buffer);
 const entry=zip.file('word/document.xml');
 if(!entry)throw new Error('The Word document package does not contain word/document.xml.');
 const xml=await entry.async('string');
 const body=(xml.match(/<w:body[\s\S]*?<\/w:body>/)||[xml])[0];
 const blocks=[];
 const tokenRe=/<w:tbl[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
 let m;
 while((m=tokenRe.exec(body))){
   const b=m[0];
   if(b.startsWith('<w:tbl')){
     const rows=[];
     for(const rm of b.matchAll(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g)){
       const cells=[];
       for(const cm of rm[0].matchAll(/<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g)){
         cells.push(extractRunsNoParser(cm[0]));
       }
       if(cells.length)rows.push(cells);
     }
     if(rows.length){
       const table=document.createElement('table');
       rows.forEach(row=>{
         const tr=document.createElement('tr');
         row.forEach(val=>{const td=document.createElement('td');td.textContent=val;tr.appendChild(td)});
         table.appendChild(tr);
       });
       blocks.push(table);
     }
   }else{
     const txt=extractRunsNoParser(b);
     if(txt.trim()){const para=document.createElement('p');para.textContent=txt;blocks.push(para)}
   }
 }
 host.innerHTML='';
 let textBlockIndex=0;
 blocks.forEach(el=>{
   if(el.tagName==='P'){
     const t=(el.textContent||'').trim();
     // Presentation-only hierarchy for recovered reading mode.
     if(textBlockIndex===0 || /^(Building the |Training Manual\b)/i.test(t)) el.classList.add('rm-title');
     else if(/^(From |Running case:)/i.test(t)) el.classList.add('rm-subtitle');
     else if(/^(Session\s+\d+\b|Contents$)/i.test(t)) el.classList.add('rm-heading');
     else if(/^\d+(?:\.\d+)+\s+/.test(t)) el.classList.add('rm-subheading');
     textBlockIndex++;
   }
   host.appendChild(el);
 });
 if(!blocks.length)throw new Error('No readable Word content could be recovered.');
}


async function renderXlsxInline(buffer){
 if(!window.XLSX) throw new Error('Excel viewer library did not load.');
 const book=XLSX.read(buffer,{type:'array',cellDates:true});
 if(!book.SheetNames.length) throw new Error('This workbook contains no visible worksheets.');
 viewerBody.innerHTML='<div class="xlsxView"><div id="xlsxTabs" class="xlsxTabs"></div><div id="xlsxTableWrap" class="xlsxTableWrap"></div></div>';
 const tabs=document.getElementById('xlsxTabs'), wrap=document.getElementById('xlsxTableWrap');
 function showSheet(name){
   [...tabs.children].forEach(b=>b.classList.toggle('active',b.dataset.sheet===name));
   const ws=book.Sheets[name];
   wrap.innerHTML=XLSX.utils.sheet_to_html(ws,{editable:false});
 }
 book.SheetNames.forEach((name,i)=>{
   const b=document.createElement('button'); b.type='button'; b.dataset.sheet=name; b.textContent=name;
   b.onclick=()=>showSheet(name); tabs.appendChild(b);
 });
 showSheet(book.SheetNames[0]);
}


const CORVANE_SAMPLE_DOCUMENTS=[{"title":"01 Landscape and System Overview","filename":"sample-01-landscape.docx","path":"sample-01-landscape.docx"},{"title":"02 Hosting and Data Centre Details","filename":"sample-02-hosting.docx","path":"sample-02-hosting.docx"},{"title":"03 Transport and Change Management Procedure","filename":"sample-03-change.docx","path":"sample-03-change.docx"},{"title":"04 Interface List and Integration Design","filename":"sample-04-interfaces.docx","path":"sample-04-interfaces.docx"},{"title":"05 Organisation and Process Owner List","filename":"sample-05-owners.docx","path":"sample-05-owners.docx"},{"title":"06 Process Narrative P2P","filename":"sample-06-p2p.docx","path":"sample-06-p2p.docx"},{"title":"07 Access Management and Leaver Procedure","filename":"sample-07-access.docx","path":"sample-07-access.docx"},{"title":"08 Emergency Access Procedure","filename":"sample-08-firefighter.docx","path":"sample-08-firefighter.docx"},{"title":"09 Job and Interface Monitoring Procedure","filename":"sample-09-monitoring.docx","path":"sample-09-monitoring.docx"},{"title":"10 Backup and Recovery Policy","filename":"sample-10-backup.docx","path":"sample-10-backup.docx"},{"title":"11 Financial Close and Journal Policy","filename":"sample-11-close.docx","path":"sample-11-close.docx"},{"title":"12 Service Provider Assurance Review","filename":"sample-12-provider.docx","path":"sample-12-provider.docx"},{"title":"13 Trial Balance and Chart of Accounts","filename":"sample-13-tb-coa.xlsx","path":"sample-13-tb-coa.xlsx"},{"title":"14 Existing Risk and Control Matrix","filename":"sample-14-rcm.xlsx","path":"sample-14-rcm.xlsx"},{"title":"15 Prior Year Testing","filename":"sample-15-testing.xlsx","path":"sample-15-testing.xlsx"},{"title":"16 Prior Year Findings","filename":"sample-16-findings.xlsx","path":"sample-16-findings.xlsx"},{"title":"17 SoD Rules and Mitigations","filename":"sample-17-sod.xlsx","path":"sample-17-sod.xlsx"},{"title":"18 Key Report Inventory","filename":"sample-18-reports.xlsx","path":"sample-18-reports.xlsx"},{"title":"19 Materiality and Audit Scoping","filename":"sample-19-scoping.xlsx","path":"sample-19-scoping.xlsx"},{"title":"20 Close Calendar and Key People","filename":"sample-20-calendar.xlsx","path":"sample-20-calendar.xlsx"},{"title":"21 Evidence Request and Index","filename":"sample-21-evidence.xlsx","path":"sample-21-evidence.xlsx"},{"title":"22 Test Workpaper and Sample Log","filename":"sample-22-workpaper.xlsx","path":"sample-22-workpaper.xlsx"}];
function showLibraryBack(show){const b=document.getElementById('libraryBackBtn');if(b)b.style.display=show?'inline-block':'none';}
function openSampleDocumentLibrary(){
 showLibraryBack(false);
 currentViewerUrl='sample-00-index.xlsx'; currentViewerMaterial={title:'Corvane Sample Document Library',filename:'sample-00-index.xlsx'};
 viewerTitle.textContent='Corvane Sample Document Library'; viewer.style.display='flex';
 const cards=CORVANE_SAMPLE_DOCUMENTS.map((m,i)=>`<div class="fileCard"><div class="kicker">CORVANE TRAINING SAMPLE</div><h3>${esc(m.title)}</h3><p>${esc(m.filename)}</p><button onclick="openLocalSample(${i})">Open Sample</button></div>`).join('');
 viewerBody.innerHTML=`<div style="padding:18px 20px 48px;max-width:1200px;margin:0 auto;"><h1>Corvane Sample Document Library</h1><p>Original fictitious TIB client documents showing what common controls-project inputs and workpapers can look like.</p><p><button onclick="openLocalNamed('sample-00-sources.xlsx','Real-World Source Map')">Real-World Source Map</button> <button onclick="openLocalNamed('sample-00-index.xlsx','Sample Library Index')">Library Index</button></p><div class="materialsGrid">${cards}</div><p style="margin-top:30px"><button onclick="courseHome()">← Course Home</button></p></div>`;
}
async function openLocalNamed(path,title){showLibraryBack(true);currentViewerUrl=path;currentViewerMaterial={title,filename:path.split('/').pop()};viewerTitle.textContent=title;await renderLocalFile(path,title);}
async function openLocalSample(i){showLibraryBack(true);const m=CORVANE_SAMPLE_DOCUMENTS[i];if(!m)return;currentViewerUrl=m.path;currentViewerMaterial={title:m.title,filename:m.filename};viewerTitle.textContent=m.title;await renderLocalFile(m.path,m.title);}
async function renderLocalFile(path,title){
 viewer.style.display='flex';viewerBody.innerHTML='<div class="viewerLoading"><b>Opening sample document…</b></div>';
 try{const ext=path.split('.').pop().toLowerCase();const response=await fetch(path);if(!response.ok)throw new Error('The sample document could not be retrieved.');const buffer=await response.arrayBuffer();
  if(ext==='docx'){viewerBody.innerHTML='<div id="docxPreviewHost" class="docxPreviewHost"></div>';const host=document.getElementById('docxPreviewHost');try{if(!window.docx||typeof window.docx.renderAsync!=='function')throw new Error('Word viewer unavailable');await window.docx.renderAsync(buffer,host,null,{className:'docx',inWrapper:true,ignoreWidth:false,ignoreHeight:false,ignoreFonts:false,breakPages:true,renderHeaders:true,renderFooters:true,renderFootnotes:true});}catch(e1){try{const result=await mammoth.convertToHtml({arrayBuffer:buffer});viewerBody.innerHTML=`<div class="docxView"><article class="docxPaper">${result.value}</article></div>`;}catch(e2){viewerBody.innerHTML='<div class="safeDocx"><article id="safeDocxPaper" class="safeDocxPaper"></article></div>';await renderDocxSafeFallback(buffer,document.getElementById('safeDocxPaper'));}}}
  else if(['xlsx','xls'].includes(ext)){await renderXlsxInline(buffer);} else {viewerBody.innerHTML=`<iframe class="viewerFrame" src="${path}" title="${esc(title)}"></iframe>`;}
 }catch(e){viewerBody.innerHTML=`<div class="viewerError"><h2>Sample document could not be opened</h2><p>${esc(e.message||'Unable to open sample.')}</p><p>Select <b>Download Original</b> or return to the course.</p></div>`;}
}

async 
function openCorvaneSAP(scenario){
 const sid=scenario||'CORV-SIM-01';
 const url='tibsap://corvane?scenario='+encodeURIComponent(sid);
 const box=document.createElement('div');
 box.style.cssText='position:fixed;inset:0;background:#0008;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
 box.innerHTML=`<div style="max-width:650px;background:#fff;border-radius:14px;padding:24px;color:#1c2431"><h2 style="color:#122a4a">Open Corvane SAP Simulator</h2><p>TIB ILA will hand this activity to the Windows TIB SAP Training Assistant.</p><p><b>Scenario:</b> ${sid}</p><p><a class="btn" href="${url}" style="display:inline-block;text-decoration:none">OPEN WINDOWS SIMULATOR</a> <button class="btn maroon" id="closeCorvaneHandoff">Cancel</button></p><p class="muted">First use only: extract the Windows trainee package and run REGISTER_TIB_ILA_HANDOFF.bat once. Your browser may ask permission to open TIB SAP Training Assistant.</p></div>`;
 document.body.appendChild(box);
 box.querySelector('#closeCorvaneHandoff').onclick=()=>box.remove();
}

async function openCorvaneReference(){
 showLibraryBack(false);
 const filename='corvane-reference.xlsx';
 currentViewerUrl=filename;
 currentViewerMaterial={title:'Corvane Project Reference',filename};
 viewerTitle.textContent='Corvane Project Reference';
 viewer.style.display='flex';
 viewerBody.innerHTML='<div class="viewerLoading"><b>Opening Corvane project reference…</b></div>';
 try{
   const response=await fetch(filename);
   if(!response.ok)throw new Error('The Corvane project reference workbook could not be retrieved.');
   const buffer=await response.arrayBuffer();
   await renderXlsxInline(buffer);
   const intro=document.createElement('div');
   intro.className='refIntro';
   intro.innerHTML='<b>Corvane Energy Group — Controls Project Reference</b><br>Use the worksheet tabs to look up people, systems, interfaces, business processes, risks, controls, owners, evidence, meetings, documents, project workbooks, testing and the complete relationship map.';
   const view=viewerBody.querySelector('.xlsxView'); if(view)view.insertBefore(intro,view.firstChild);
 }catch(e){
   viewerBody.innerHTML=`<div class="viewerError"><h2>Corvane Project Reference could not be opened</h2><p>${esc(e.message||'The workbook could not be opened.')}</p><p>Select <b>Download Original</b> or <b>← Course Home</b>.</p></div>`;
 }
}

async function openMaterial(index){
 showLibraryBack(false);
 const m=(window.courseMaterials||[])[index]; if(!m||!m.storage_path)return;
 const {data,error}=await sb.storage.from(MATERIALS_BUCKET).createSignedUrl(m.storage_path,1800);
 if(error)return alert('Unable to open this course material: '+error.message);
 currentViewerUrl=data.signedUrl;currentViewerMaterial=m;viewerTitle.textContent=m.title;
 const ext=(m.filename||'').split('.').pop().toLowerCase();
 viewer.style.display='flex';
 viewerBody.innerHTML='<div class="viewerLoading"><b>Opening course material…</b></div>';
 try{
   if(ext==='docx'){
     const response=await fetch(currentViewerUrl);
     if(!response.ok)throw new Error('The document could not be retrieved.');
     const buffer=await response.arrayBuffer();

     // Primary renderer: docx-preview. It renders WordprocessingML directly and
     // is more tolerant of complex Word documents/tables than HTML conversion.
     viewerBody.innerHTML='<div id="docxPreviewHost" class="docxPreviewHost"></div>';
     const host=document.getElementById('docxPreviewHost');
     try{
       if(!window.docx || typeof window.docx.renderAsync!=='function') throw new Error('Word viewer library did not load.');
       await window.docx.renderAsync(buffer,host,null,{
         className:'docx',
         inWrapper:true,
         ignoreWidth:false,
         ignoreHeight:false,
         ignoreFonts:false,
         breakPages:true,
         renderHeaders:true,
         renderFooters:true,
         renderFootnotes:true
       });
     }catch(primaryError){
       // Secondary renderer. Some DOCX files contain malformed/custom XML that
       // can upset an XML-to-HTML converter, so failure here is handled cleanly.
       try{
         const result=await mammoth.convertToHtml({arrayBuffer:buffer});
         viewerBody.innerHTML=`<div class="docxView"><article class="docxPaper">${result.value}</article></div>`;
       }catch(secondaryError){
         // Third renderer: safe reading-mode extraction. It never parses Word XML as DOM,
         // so malformed custom XML/tag names cannot trigger the previous parser failure.
         viewerBody.innerHTML='<div class="safeDocx"><article id="safeDocxPaper" class="safeDocxPaper"></article></div>';
         await renderDocxSafeFallback(buffer,document.getElementById('safeDocxPaper'));
       }
     }
   }else if(['xlsx','xls'].includes(ext)){
     const response=await fetch(currentViewerUrl);
     if(!response.ok)throw new Error('The workbook could not be retrieved.');
     const buffer=await response.arrayBuffer();
     await renderXlsxInline(buffer);
   }else if(['pdf','png','jpg','jpeg','webp','gif','txt'].includes(ext)){
     viewerBody.innerHTML=`<iframe class="viewerFrame" src="${currentViewerUrl}" title="${esc(m.title)}"></iframe>`;
   }else{
     viewerBody.innerHTML=`<div class="viewerFallback"><div class="fileCard"><div class="kicker">TIB COURSE MATERIAL</div><h2>${esc(m.title)}</h2><p class="body"><b>${esc(m.filename)}</b></p><p>This file should be opened in its original application. Select <b>Download Original</b> above.</p></div></div>`;
   }
 }catch(e){
   viewerBody.innerHTML=`<div class="viewerError"><h2>This document could not be opened</h2><p>${esc(e.message||'The browser viewer could not open this file.')}</p><p>Select <b>Download Original</b> to open the source file, or <b>← Course Home</b> to continue.</p></div>`;
 }
}
function courseHome(){ closeViewer(); window.scrollTo({top:0,behavior:'smooth'}); }
function closeViewer(){
 showLibraryBack(false);
 viewer.style.display='none';viewerBody.innerHTML='';viewerBody.classList.remove('htmlPage');document.documentElement.style.overflow='';document.body.style.overflow='';
 // Course remains exactly where the trainee left it (for example Environment · OBSERVE).
}
async function downloadViewerOriginal(){
 if(!currentViewerUrl||!currentViewerMaterial)return;
 try{
   const r=await fetch(currentViewerUrl); if(!r.ok)throw new Error('Download failed');
   const blob=await r.blob(); const u=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=u;a.download=currentViewerMaterial.filename||'TIB-course-material';
   document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
 }catch(e){window.open(currentViewerUrl,'_blank','noopener')}
}
function viewerFullscreen(){if(viewer.requestFullscreen)viewer.requestFullscreen()}

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function saveReview(activityId,i,value){
 let x=JSON.parse(localStorage.getItem('tib_ila_review_'+activityId)||'{}');x[i]=value;localStorage.setItem('tib_ila_review_'+activityId,JSON.stringify(x));
}
function submissionStatusHtml(itemId){
 const x=(window.mySubmissions||[]).find(s=>s.item_id===itemId);if(!x)return '<div class="submissionCard"><b>Submission status:</b> Not yet submitted</div>';
 let score=x.score!=null?` <span class="scoreBadge">Score ${x.score}</span>`:'';
 let comments=x.reviewer_comments?`<p><b>Instructor feedback:</b> ${esc(x.reviewer_comments)}</p>`:'';
 return `<div class="submissionCard"><b>Submission:</b> ${esc(x.original_filename)}<br><span class="muted">Status: ${esc(x.status)}</span>${score}${comments}</div>`;
}
async function completeCompare(){
 const a=data.activities[ai], qs=a.reviewQuestions||[], saved=JSON.parse(localStorage.getItem('tib_ila_review_'+a.id)||'{}');
 const missing=qs.some((_,i)=>!(saved[i]||'').trim());
 if(missing){compareMsg.textContent='Answer every review question before completing.';return}
 await saveRemoteProgress(a.id,'completed',100,{current_project_stage:a.projectStage,self_review:saved});
 compareMsg.textContent='✓ Self-review completed and progress saved.';
}

async function uploadSubmission(){
 const input=document.getElementById('submissionFile'),msg=document.getElementById('uploadMsg');
 const file=input&&input.files&&input.files[0]; if(!file){msg.textContent='Choose your completed workbook first.';return}
 msg.textContent='Uploading securely…';
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
 const item=data.activities[ai].id;
 const path=`${currentUser.id}/${APP_COURSE_ID}/${item}/${Date.now()}_${safe}`;
 const {error:upErr}=await sb.storage.from(SUBMISSIONS_BUCKET).upload(path,file,{upsert:false});
 if(upErr){msg.textContent='Upload failed: '+upErr.message;return}
 const {error:dbErr}=await sb.from('academy_submissions').insert({
   user_id:currentUser.id,app_course_id:APP_COURSE_ID,item_id:item,
   submission_type:'assignment',storage_path:path,original_filename:file.name,status:'submitted'
 });
 if(dbErr){msg.textContent='File uploaded, but submission record failed: '+dbErr.message;return}
 await saveRemoteProgress(item,'submitted',75,{current_project_stage:data.activities[ai].projectStage,submission_path:path});
 window.mySubmissions=[{item_id:item,original_filename:file.name,status:'submitted',score:null,reviewer_comments:null,submitted_at:new Date().toISOString()},...(window.mySubmissions||[])];
 msg.textContent='✓ Submitted securely to TIB Academy.';
}

init();
