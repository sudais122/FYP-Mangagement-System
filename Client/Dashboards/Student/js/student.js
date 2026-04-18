/* ══════════════════════════════════
   STATE
══════════════════════════════════ */
const STATE = {
  studentId: 'STD-2026-' + (Math.floor(Math.random() * 9000) + 1000),
  studentName: 'Ahmed Saeed',
  teamId: null,
  teamName: null,
  projectTitle: null,
  members: [],             // [{id,name,initials}]
  requestedSupervisor: null,
  teamCreated: false,
};

/* ── Fake user database ── */
const FAKE_USERS = [
  { id:'STD-2026-1234', name:'Bilal Khan',      initials:'BK' },
  { id:'STD-2026-5678', name:'Sara Noor',        initials:'SN' },
  { id:'STD-2026-9012', name:'Usman Tariq',      initials:'UT' },
  { id:'STD-2026-3456', name:'Ayesha Malik',     initials:'AM' },
  { id:'STD-2026-7890', name:'Hassan Raza',      initials:'HR' },
  { id:'STD-2026-2345', name:'Fatima Zaidi',     initials:'FZ' },
  { id:'STD-2026-6789', name:'Zain Ahmed',       initials:'ZA' },
  { id:'STD-2026-0123', name:'Nadia Iqbal',      initials:'NI' },
];

/* ── Supervisors ── */
const SUPERVISORS = [
  { id:'SUP-001', name:'Dr. Aftab Ahmad',    dept:'FYP Coordinator',      tags:['AI','Machine Learning','Computer Vision'],  slots:3 },
  { id:'SUP-002', name:'Dr. Nadeem Iqbal',   dept:'Head, CS Department',  tags:['Networks','Security','IoT'],               slots:2 },
  { id:'SUP-003', name:'Dr. Sara Khan',      dept:'Assistant Professor',  tags:['Web Dev','Cloud','Software Eng'],           slots:4 },
  { id:'SUP-004', name:'Dr. Bilal Hussain',  dept:'Associate Professor',  tags:['Data Science','Big Data','Analytics'],      slots:2 },
  { id:'SUP-005', name:'Dr. Zara Mahmood',   dept:'Lecturer, CS',         tags:['Mobile Dev','Flutter','Android'],           slots:3 },
  { id:'SUP-006', name:'Dr. Faisal Mehmood', dept:'Associate Professor',  tags:['Cybersecurity','Cryptography'],             slots:1 },
];

/* ══ Tab navigation ══ */
const titles={overview:'Dashboard',team:'My Team',project:'My Project',supervisor:'Supervisor',feedback:'Feedback',deadlines:'Deadlines',notifications:'Notifications'};
const subs={overview:"Welcome back — here's your project overview",team:'Manage your FYP team and members',project:'AI-Based Exam Proctoring System',supervisor:'Dr. Aftab Ahmad — FYP Coordinator',feedback:'Comments and reviews from your supervisor',deadlines:'All submission and evaluation dates',notifications:'Your recent alerts and updates'};

function switchTab(tab, el){
  document.querySelectorAll('.dash-subpage').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById('tab-'+tab);
  if(t) t.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
  if(el) el.classList.add('active');
  document.getElementById('page-title').textContent=titles[tab]||tab;
  document.getElementById('page-sub').textContent=subs[tab]||'';
  if(tab==='team') renderTeamTab();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ══ Setup flow ══ */
function openSetup(){
  document.getElementById('setup-overlay').style.display='flex';
  // Pre-fill student info
  const sid=STATE.studentId;
  const sname=STATE.studentName;
  document.getElementById('display-student-id').textContent=sid;
  document.getElementById('leader-std-id').textContent=sid;
  document.getElementById('leader-name').textContent=sname;
  document.getElementById('leader-av').textContent=initials(sname);
  // Show step 1
  showStep(1);
}

function closeSteup(){
  document.getElementById('setup-overlay').style.display='none';
  renderTeamTab();
  updateBannerForTeam();
}

function showStep(n){
  [1,2,3,'done'].forEach(s=>document.getElementById('setup-step-'+s).style.display='none');
  document.getElementById('setup-step-'+n).style.display='block';
}

function goStep2(){
  const proj=document.getElementById('s1-proj').value.trim();
  const team=document.getElementById('s1-team').value.trim();
  if(!proj||!team){ toast('Please fill in Project Title and Team Name','red'); return; }
  STATE.projectTitle=proj;
  STATE.teamName=team;
  STATE.teamId='TEAM-'+(new Date().getFullYear())+'-'+(Math.floor(Math.random()*9000)+1000);
  document.getElementById('display-team-id').textContent=STATE.teamId;
  // Reset members
  STATE.members=[];
  renderMemberSlots();
  clearSearch();
  showStep(2);
}

function backStep1(){ showStep(1); }

function goStep3(){
  renderSupervisors('');
  showStep(3);
}

function backStep2(){ showStep(2); }

function finishSetup(){
  STATE.teamCreated=true;
  const reqSup=SUPERVISORS.find(s=>s.id===STATE.requestedSupervisor);

  // Summary chips
  const chips=[
    {icon:'team',text:'Team: '+STATE.teamName},
    {icon:'id',text:STATE.teamId},
    {icon:'proj',text:STATE.projectTitle.length>28?STATE.projectTitle.slice(0,28)+'…':STATE.projectTitle},
    {icon:'members',text:(STATE.members.length+1)+' member'+(STATE.members.length!==0?'s':'')},
  ];
  if(reqSup) chips.push({icon:'sup',text:'Requested: '+reqSup.name});

  const svgMap={
    team:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
    id:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>`,
    proj:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    members:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
    sup:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  };
  document.getElementById('summary-chips').innerHTML=chips.map(c=>`<div class="s-chip">${svgMap[c.icon]}${c.text}</div>`).join('');
  showStep('done');
}

/* ══ Member search ══ */
let searchDebounce;
function searchMember(val){
  clearTimeout(searchDebounce);
  searchDebounce=setTimeout(()=>_doSearch(val.trim()),220);
}

function _doSearch(val){
  const res=document.getElementById('search-result');
  if(!val){ res.classList.remove('show'); return; }
  if(!val.startsWith('STD-')){ res.innerHTML='<div class="sr-error">⚠ Format must be STD-YEAR-####</div>'; res.classList.add('show'); return; }
  if(val===STATE.studentId){ res.innerHTML='<div class="sr-error">This is your own ID</div>'; res.classList.add('show'); return; }
  if(STATE.members.find(m=>m.id===val)){ res.innerHTML='<div class="sr-error">Member already added</div>'; res.classList.add('show'); return; }
  const user=FAKE_USERS.find(u=>u.id===val);
  if(!user){ res.innerHTML='<div class="sr-empty">No student found with this ID</div>'; res.classList.add('show'); return; }
  if(STATE.members.length>=2){ res.innerHTML='<div class="sr-error">Team is full (max 2 additional members)</div>'; res.classList.add('show'); return; }
  res.innerHTML=`<div class="sr-item">
    <div class="sr-avatar">${user.initials}</div>
    <div class="sr-info"><strong>${user.name}</strong><small>${user.id}</small></div>
    <button class="sr-add" onclick="addMember('${user.id}','${user.name}','${user.initials}')">+ Add</button>
  </div>`;
  res.classList.add('show');
}

function addMember(id,name,ini){
  if(STATE.members.length>=2){ toast('Team is full — max 2 additional members','red'); return; }
  STATE.members.push({id,name,initials:ini});
  document.getElementById('member-search').value='';
  document.getElementById('search-result').classList.remove('show');
  renderMemberSlots();
  toast(name+' added to team ✓');
}

function removeMember(idx){
  const removed=STATE.members[idx].name;
  STATE.members.splice(idx,1);
  renderMemberSlots();
  toast(removed+' removed');
}

function clearSearch(){
  document.getElementById('member-search').value='';
  document.getElementById('search-result').classList.remove('show');
}

function renderMemberSlots(){
  const list=document.getElementById('members-list');
  // Keep leader row
  const leaderHTML=`<div class="tm-item">
    <div class="tm-av" id="leader-av">${initials(STATE.studentName)}</div>
    <div><div class="tm-name">${STATE.studentName}</div><div class="tm-id">${STATE.studentId}</div></div>
    <span class="tm-role tm-lead">Team Leader</span>
  </div>`;
  const membersHTML=STATE.members.map((m,i)=>`<div class="tm-item" style="margin-top:8px">
    <div class="tm-av">${m.initials}</div>
    <div><div class="tm-name">${m.name}</div><div class="tm-id">${m.id}</div></div>
    <span class="tm-role tm-member">Member</span>
    <button class="tm-remove" onclick="removeMember(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  </div>`).join('');
  list.innerHTML=leaderHTML+membersHTML;

  // Slots
  const slot1=document.getElementById('slot-1');
  const slot2=document.getElementById('slot-2');
  slot1.style.display=STATE.members.length<1?'flex':'none';
  slot2.style.display=STATE.members.length<2?'flex':'none';
}

/* ══ Supervisor rendering ══ */
function renderSupervisors(filter){
  const list=document.getElementById('sup-list');
  let sups=SUPERVISORS;
  if(filter) sups=SUPERVISORS.filter(s=>s.tags.some(t=>t.toLowerCase().includes(filter.toLowerCase())));
  list.innerHTML=sups.map(s=>{
    const isReq=STATE.requestedSupervisor===s.id;
    const hasReq=!!STATE.requestedSupervisor;
    return`<div class="sup-list-item ${isReq?'requested':''}">
      <div class="sl-avatar">${initials(s.name)}</div>
      <div class="sl-info">
        <div class="sl-name">${s.name}</div>
        <div class="sl-dept">${s.dept}</div>
        <div class="sl-tags">${s.tags.map(t=>`<span class="sl-tag">${t}</span>`).join('')}</div>
        <div class="sl-slots"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>${s.slots} slot${s.slots!==1?'s':''} available</div>
      </div>
      <button class="btn-request ${isReq?'sent':''}" ${isReq?'disabled':''} ${hasReq&&!isReq?'disabled':''} onclick="requestSupervisor('${s.id}','${s.name}')">
        ${isReq?'✓ Requested':'Send Request'}
      </button>
    </div>`;
  }).join('') || '<div style="padding:24px;text-align:center;color:var(--text-mute)">No supervisors match this filter</div>';
}

function filterSupervisors(val){ renderSupervisors(val); }

function requestSupervisor(id,name){
  if(STATE.requestedSupervisor&&STATE.requestedSupervisor!==id){ toast('You already sent a request — wait for response','red'); return; }
  STATE.requestedSupervisor=id;
  renderSupervisors('');
  toast('Request sent to '+name+' ✓','gold');
}

/* ══ Render team tab ══ */
function renderTeamTab(){
  const tn=document.getElementById('team-tab-name');
  const ti=document.getElementById('team-tab-id');
  const tp=document.getElementById('team-tab-proj');
  if(STATE.teamName){ tn.textContent=STATE.teamName; ti.textContent=STATE.teamId; tp.textContent=STATE.projectTitle; }

  const display=document.getElementById('team-members-display');
  if(!STATE.teamCreated){
    display.innerHTML=`<div style="text-align:center;padding:36px 20px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" style="margin:0 auto 16px;color:var(--border)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h4 style="font-size:1rem;font-weight:700;color:var(--text-soft);margin-bottom:8px">No Team Created Yet</h4>
      <p style="font-size:.84rem;color:var(--text-mute);margin-bottom:20px">Create your team to start your FYP journey.</p>
      <button class="btn btn-primary" onclick="openSetup()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Team
      </button>
    </div>`;
    return;
  }

  const allMembers=[{id:STATE.studentId,name:STATE.studentName,initials:initials(STATE.studentName),role:'Team Leader'},...STATE.members.map(m=>({...m,role:'Member'}))];
  display.innerHTML=allMembers.map(m=>`<div class="tm-item" style="margin-bottom:8px">
    <div class="tm-av">${m.initials}</div>
    <div>
      <div class="tm-name">${m.name}${m.role==='Team Leader'?' (You)':''}</div>
      <div class="tm-id">${m.id}</div>
    </div>
    <span class="tm-role ${m.role==='Team Leader'?'tm-lead':'tm-member'}">${m.role}</span>
  </div>`).join('');
}

function updateBannerForTeam(){
  if(STATE.teamName){
    document.getElementById('banner-team-name').textContent=STATE.teamName;
    document.getElementById('banner-team-id').textContent=STATE.teamId;
    document.getElementById('ov-team-name').textContent=STATE.teamName;
    document.getElementById('ov-team-id').textContent=STATE.teamId;
    document.getElementById('team-tab-name').textContent=STATE.teamName;
    document.getElementById('team-tab-id').textContent=STATE.teamId;
    document.getElementById('team-tab-proj').textContent=STATE.projectTitle;
  }
}

/* ══ Helpers ══ */
function initials(name){ return(name||'').split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase(); }

let toastTimer;
function toast(msg, type){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className='toast'+(type==='red'?' red':type==='gold'?' gold':'')+' show';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

/* ══ Init ══ */
// Set student ID in navbar
document.getElementById('nav-std-id').textContent=STATE.studentId;
// Show setup on first load (simulate first-time login)
setTimeout(()=>openSetup(), 500);
