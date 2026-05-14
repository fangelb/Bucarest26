import { useState, useEffect, useRef, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { fbGet, fbSet, fbPatch, hasFirebase, lsGet, lsSet } from './firebase.js';

const GROUP_PATH   = 'bucarest_2026';
const APP_PASSWORD = 'Bucarest_2026_';

// ─── DADES: LLOCS ───
const PLACES = [
  { id:'t1', cat:'turisme', emoji:'🏛️', name:'Palau del Parlament', desc:'El segon edifici administratiu més gran del món. Tours guiats amb reserves prèvies. Interior opulent i història del règim comunista.', address:'Calea 13 Septembrie 1', hours:'Dl–Dg 10h–16h', tip:'Reserva el tour online. Sense reserva, cua de fins a 1h' },
  { id:'t2', cat:'turisme', emoji:'🏘️', name:'Old Town (Lipscani)', desc:'El cor historic de Bucarest: carrers empedrats, esglésies del s.XVIII i la vida de bar més animada de la ciutat.', address:'Lipscani, Bucarest', hours:'24h', tip:'Millor explorar de tarda. Tota la vida nocturna comença aquí' },
  { id:'t3', cat:'turisme', emoji:'⛪', name:'Església Stavropoleos', desc:'Petita església ortodoxa del 1724 amb frescos increïbles i un pati ocult tranquil·líssim. Una joia amagada.', address:'Strada Stavropoleos 4', hours:'8h–20h', tip:"Entrada gratuïta. 5 min a peu del Caru' cu Bere" },
  { id:'t4', cat:'turisme', emoji:'🎭', name:'Ateneu Romanès', desc:'Sala de concerts neoclàssica inaugurada el 1888. Símbol cultural de Romania. Interior amb fresc monumental.', address:'Str. Benjamin Franklin 1', hours:'Dl–Dv 10h–17h', tip:'La façana és espectacular fins i tot per fora' },
  { id:'t5', cat:'turisme', emoji:'📚', name:'Cărturești Carusel', desc:'Llibreria icònica en un edifici restaurat del s.XIX. Sis plantes de llibres, art i un cafè a dalt.', address:'Strada Lipscani 55', hours:'Dl–Dg 10h–22h', tip:'No cal consum. Molt instagramable' },
  { id:'t6', cat:'turisme', emoji:'🏗️', name:'Passatge Macca-Villacrosse', desc:'Passatge cobert en forma de Y del s.XIX. Bars de narguile, restaurants i ambient nocturn únic.', address:'Calea Victoriei 16', hours:'24h', tip:'Molt fotogràfic de nit' },
  { id:'t7', cat:'turisme', emoji:'🌳', name:'Parc Herăstrău', desc:'Gran parc al voltant del llac Herăstrău. Museu del Poble a prop. Ideal per desconnectar.', address:'Șoseaua Nordului', hours:'24h', tip:'Perfecte diumenge matí si no hi ha ressaca' },
  { id:'t8', cat:'turisme', emoji:'♨️', name:'Therme Bucharest', desc:"Balneari i spa d'aigues termals. L'atracció turística nº1 de Romania. Piscines, saunes i zones de relax.", address:'Calea Bucureștilor 240', hours:'8h–23h', tip:'Compra entrada online. A 30 min del centre amb Bolt' },
  { id:'r1', cat:'restaurant', emoji:'🍺', name:"Caru' cu Bere", desc:'La cerveceria més antiga de Bucarest (1879). Interior neo-gòtic espectacular. Cuina romanesa i espectacle de dansa.', address:'Strada Stavropoleos 5', hours:'Dl–Dg 10h–0h', tip:'⭐ RESERVAT DISSABTE 22H · Dress code decent', rating:'4.6★', reserved:true },
  { id:'r2', cat:'restaurant', emoji:'🍽️', name:"Hanu' lui Manuc", desc:'Restaurant en un pati historic del 1808. Aquí es van signar els preliminars del Tractat de Bucarest. Música en viu.', address:'Strada Franceză 62-64', hours:'Dl–Dg 10h–2h', tip:'Reserva per cap de setmana. ~60-80 lei el principal', rating:'4.4★' },
  { id:'r3', cat:'restaurant', emoji:'🥘', name:'Vatra', desc:'On van els locals de veritat. Fora del circuit turístic, excel·lent i econòmic. Cuina romanesa contemporània.', address:'Str. Actor Ion Brezoianu 19', hours:'Dl–Dg 12h–23:30h', tip:"Reserva obligatòria, s'omple. ~40-60 lei el principal", rating:'4.5★' },
  { id:'r4', cat:'restaurant', emoji:'🫕', name:'Taverna Covaci', desc:"Romanès tradicional al cor de l'Old Town. Menys turístic que d'altres del carrer, bones racions.", address:'Strada Covaci 6', hours:'Dg–Dj 11h–23h · Dv–Ds 12h–23h', tip:'Bon rapport qualitat/preu', rating:'4.3★' },
  { id:'r5', cat:'restaurant', emoji:'⭐', name:'Lacrimi și Sfinți', desc:'El preferit dels foodies locals. Concepte modern i creatiu, noms originals per a cada plat, cuina de temporada.', address:'Str. Ion Câmpineanu 19', hours:'Dl–Dg 12h–0h', tip:'Reserva imprescindible', rating:'4.5★' },
  { id:'b1', cat:'bar', emoji:'🌅', name:'Nomad Skybar', desc:"Rooftop al cor de l'Old Town. Còctels excel·lents, vistes panoràmiques i sessions de DJ a la nit.", address:'Strada Smârdan 2', hours:'Dl–Dg 12h–2h', tip:'Arriba ~22h per veure la transformació de restaurant a club', rating:'4.4★' },
  { id:'b2', cat:'bar', emoji:'🌙', name:'Linea / Closer to the Moon', desc:"Rooftop al límit de l'Old Town. Perfecte per veure la posta de sol. Ambient relaxat.", address:'Strada Lipscani 2', hours:'Dl–Dg 12h–1h', tip:'Millor al capvespre per la posta de sol', rating:'4.3★' },
  { id:'b3', cat:'bar', emoji:'💜', name:'Amethyst Sky Bar', desc:"Rooftop de luxe a l'Union Plaza Hotel. Vistes espectaculars al Palau del Parlament.", address:'Calea 13 Septembrie 90', hours:'Dl–Dg 14h–1h', tip:'Un dels millors panoràmics de la ciutat', rating:'4.4★' },
  { id:'c1', cat:'club', emoji:'💎', name:'Kristal Club', desc:'La catedral del techno a Romania. Top 50 DJ Mag. Richie Hawtin, Nina Kraviz, Chris Liebing han tocat aquí.', address:'Bvd Regina Elisabeta 34', hours:'Ds 23h–7h', tip:'Comprova el cartell setmanal a Instagram. Entrada ~100 lei', rating:'4.1★' },
  { id:'c2', cat:'club', emoji:'🔊', name:'Guesthouse', desc:'Underground pur. Sistema Funktion-One. Minimal techno sense concessions. Obre fins al migdia del diumenge.', address:'Splaiul Unirii 160', hours:'Ds 23h – Dg 12h', tip:'El lloc on va la gent que de veritat entén la música', rating:'3.8★' },
  { id:'c3', cat:'club', emoji:'🎛️', name:'Control Club', desc:'Clàssic underground des del 2001. Dues sales + terrassa exterior. Techno i electrònica alternativa.', address:'Strada Constantin Mille 4', hours:'Dv–Ds 12h–6h', tip:'Entrada des de ~8€. Terrassa ideal per descansar entre sets', rating:'4.1★' },
  { id:'c4', cat:'club', emoji:'🌀', name:'Nook Club', desc:'Disseny futurista, so impecable. Techno i deep house. Aforo petit i molt cuidat. Obre fins les 8h.', address:'Strada Constantin Mille 18', hours:'Dv–Ds 21h–8h', tip:"Petit i íntim. Arriba d'hora o et quedes fora", rating:'4.0★' },
  { id:'c5', cat:'club', emoji:'🏭', name:'Expirat', desc:'Industrial, assequible i sense dress code estricte. El lloc còmode de Bucarest. Sessió de tarda el diumenge.', address:'Str. Dr. Constantin Istrati 1', hours:'Dv–Ds 20h–6h · Dg 13h–21h', tip:'Sessió de tarda diumenge: ideal per rematar el cap de setmana', rating:'4.3★' },
];

const CATS = [
  { id:'tots', label:'Tots', emoji:'🌍' },
  { id:'turisme', label:'Turisme', emoji:'🏛️' },
  { id:'restaurant', label:'Menjar', emoji:'🍽️' },
  { id:'bar', label:'Bars', emoji:'🍹' },
  { id:'club', label:'Clubs', emoji:'🎧' },
];

const CC = {
  turisme:    { bg:'rgba(0,229,255,0.12)',   bd:'rgba(0,229,255,0.4)',   tx:'#00e5ff' },
  restaurant: { bg:'rgba(244,162,97,0.12)',  bd:'rgba(244,162,97,0.4)',  tx:'#f4a261' },
  bar:        { bg:'rgba(167,139,250,0.12)', bd:'rgba(167,139,250,0.4)', tx:'#c4b5fd' },
  club:       { bg:'rgba(233,30,140,0.12)',  bd:'rgba(233,30,140,0.4)',  tx:'#ff69b4' },
};
const CAT_C = { turisme:'#00e5ff', restaurant:'#f4a261', bar:'#a78bfa', club:'#e91e8c' };

const LOCKED = [
  { id:'fl1', day:'12/06', time:'08:55', title:'✈️ Vol BCN → OTP',         notes:'W4 3176 · T2 El Prat · Arriba Henri Coandă 13:10',                   color:'#e91e8c', locked:true },
  { id:'ci1', day:'12/06', time:'14:00', title:'🏠 Check-in Green Apt. 36', notes:'Bucarest centre',                                                     color:'#00e5ff', locked:true },
  { id:'rs1', day:'13/06', time:'22:00', title:"🍺 Sopar Caru' cu Bere",    notes:'RESERVAT · Strada Stavropoleos 5 · 7 persones',                       color:'#f4a261', locked:true, reserved:true },
  { id:'fl2', day:'14/06', time:'18:20', title:'✈️ Vol OTP → BCN',           notes:"W4 3177 · Arriba T2 Barcelona 20:40 · Sortir cap aeroport ~15:30",   color:'#e91e8c', locked:true },
];
const LOCKED_IDS = new Set(LOCKED.map(a => a.id));
const DAYS = { '12/06':'🟢 Divendres 12 Juny', '13/06':'🟡 Dissabte 13 Juny', '14/06':'🔴 Diumenge 14 Juny' };

// ─── LIQUIDACIÓ ───
function settle(members, expenses) {
  const b = {};
  members.forEach(m => b[m] = 0);
  expenses.forEach(e => {
    const ps = e.participants?.length ? e.participants : members;
    const sh = e.amount / ps.length;
    if (b[e.payer] !== undefined) b[e.payer] += e.amount;
    ps.forEach(p => { if (b[p] !== undefined) b[p] -= sh; });
  });
  const cr = members.filter(m => b[m] >  0.005).map(m => ({ n:m, a: b[m] })).sort((a,x) => x.a - a.a);
  const db = members.filter(m => b[m] < -0.005).map(m => ({ n:m, a:-b[m] })).sort((a,x) => x.a - a.a);
  const tx = [];
  let ci=0, di=0;
  while (ci<cr.length && di<db.length) {
    const a = Math.min(cr[ci].a, db[di].a);
    if (a > 0.005) tx.push({ from:db[di].n, to:cr[ci].n, amount:Math.round(a*100)/100 });
    cr[ci].a -= a; db[di].a -= a;
    if (cr[ci].a < 0.005) ci++;
    if (db[di].a < 0.005) di++;
  }
  return { b, tx };
}

// ─── PANTALLA LOGIN ───
function LoginScreen({ onLogin }) {
  const [name, setName]   = useState('');
  const [pw, setPw]       = useState('');
  const [eye, setEye]     = useState(false);
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);

  const go = async () => {
    if (!name.trim())       { setErr('Escriu el teu nom per continuar'); return; }
    if (pw !== APP_PASSWORD){ setErr("Contrasenya incorrecta. Revisa la clau d'accés."); return; }
    setBusy(true);
    await onLogin(name.trim());
    setBusy(false);
  };

  return (
    <div style={L.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#070711;overscroll-behavior:none;}
        input,button{font-family:inherit;outline:none;}
        input::placeholder{color:#252540;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={L.g1}/><div style={L.g2}/>

      <div style={L.wrap}>
        {/* Cap */}
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={L.icon}><span style={{fontSize:36}}>✈️</span></div>
          <div style={L.eyebrow}>GUIA DE VIATGE COL·LABORATIVA</div>
          <h1 style={L.title}>BUCAREST '26</h1>
          <p style={L.sub}>12–14 Juny · 7 persones · 🎂 40 anys</p>
          {/* Bandera */}
          <div style={L.flag}>
            <div style={{flex:1,background:'#002B7F',borderRadius:'4px 0 0 4px'}}/>
            <div style={{flex:1,background:'#FCD116'}}/>
            <div style={{flex:1,background:'#CE1126',borderRadius:'0 4px 4px 0'}}/>
          </div>
        </div>

        {/* Formulari */}
        <div style={L.box}>
          <h2 style={L.boxTitle}>Benvingut/da al grup</h2>
          <p style={L.boxDesc}>Escull el teu nom i introdueix la clau d'accés del viatge. Tot quedarà sincronitzat amb la resta.</p>

          <label style={L.lbl}>EL TEU NOM</label>
          <input style={{...L.inp, borderColor: err&&!name.trim()?'#e91e8c':'#1a1a2e'}}
            placeholder="Ex: Ferran" value={name} autoFocus autoComplete="given-name"
            onChange={e=>{setName(e.target.value);setErr('');}}
            onKeyDown={e=>e.key==='Enter'&&go()}/>

          <label style={L.lbl}>CLAU D'ACCÉS</label>
          <div style={{position:'relative',marginBottom:16}}>
            <input style={{...L.inp, paddingRight:46, marginBottom:0, borderColor: err&&name.trim()?'#e91e8c':'#1a1a2e'}}
              type={eye?'text':'password'} placeholder="••••••••••••••" value={pw} autoComplete="current-password"
              onChange={e=>{setPw(e.target.value);setErr('');}}
              onKeyDown={e=>e.key==='Enter'&&go()}/>
            <button style={L.eye} onClick={()=>setEye(!eye)}>{eye?'🙈':'👁️'}</button>
          </div>

          {err && <div style={L.err}><span>⚠️</span><span>{err}</span></div>}

          <button style={{...L.btn, opacity:busy?.65:1}} onClick={go} disabled={busy}>
            {busy
              ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><span style={L.spin}/>Entrant...</span>
              : 'Entrar al viatge →'}
          </button>
          <p style={L.hint}>Tots 7 useu la mateixa clau · Les dades es sincronitzen automàticament</p>
        </div>
      </div>
    </div>
  );
}

// ─── EDITOR MEMBRES ───
function MembersEditor({ initial, onSave }) {
  const [ns, setNs] = useState([...initial]);
  return (
    <div>
      {ns.map((n,i)=>(
        <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'#444',width:18}}>{i+1}.</span>
          <input style={{...S.inp,flex:1,marginBottom:0}} value={n} placeholder={`Persona ${i+1}`}
            onChange={e=>{const u=[...ns];u[i]=e.target.value;setNs(u);}}/>
        </div>
      ))}
      <button style={{...S.savBtn,marginTop:8,width:'100%'}} onClick={()=>onSave(ns.filter(n=>n.trim()))}>Guardar ✓</button>
    </div>
  );
}

// ─── APP PRINCIPAL ───
export default function App() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [prompt, setPrompt]   = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  useEffect(()=>{
    const h=e=>{e.preventDefault();setPrompt(e);setShowAdd(true);};
    window.addEventListener('beforeinstallprompt',h);
    return ()=>window.removeEventListener('beforeinstallprompt',h);
  },[]);

  const [user, setUser]       = useState(()=>lsGet('b26_user',null));
  const [tab, setTab]         = useState('llocs');
  const [view, setView]       = useState('llista');
  const [cat, setCat]         = useState('tots');
  const [search, setSearch]   = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [members, setMembers]     = useState(['Ferran','Amic 2','Amic 3','Amic 4','Amic 5','Amic 6','Amic 7']);
  const [favs, setFavs]           = useState(new Set());
  const [agenda, setAgenda]       = useState(LOCKED);
  const [expenses, setExpenses]   = useState([]);
  const [editMem, setEditMem]     = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [lastSync, setLastSync]   = useState(null);
  const [noFB]                    = useState(!hasFirebase());
  const poll                      = useRef(null);

  const [addEv, setAddEv]   = useState(false);
  const [nEv, setNEv]       = useState({day:'12/06',time:'',title:'',notes:''});
  const [addEx, setAddEx]   = useState(false);
  const [nEx, setNEx]       = useState({payer:'',amount:'',desc:'',parts:[]});

  const sync = useCallback(async (spin=true) => {
    if(spin) setSyncing(true);
    const d = await fbGet(`groups/${GROUP_PATH}`);
    if(d){
      if(d.members)   setMembers(d.members);
      if(d.favorites) setFavs(new Set(d.favorites));
      if(d.expenses)  setExpenses(d.expenses);
      if(d.agenda)    setAgenda([...LOCKED,...d.agenda.filter(a=>!LOCKED_IDS.has(a.id))]);
      else            setAgenda(LOCKED);
      setLastSync(new Date());
    }
    if(spin) setSyncing(false);
  },[]);

  const push = useCallback((patch)=>{
    if(!noFB) fbPatch(`groups/${GROUP_PATH}`,patch).catch(()=>{});
  },[noFB]);

  const login = async (name) => {
    setSyncing(true);
    const ex = await fbGet(`groups/${GROUP_PATH}`);
    if(!ex){
      await fbSet(`groups/${GROUP_PATH}`,{
        members:[name,'Amic 2','Amic 3','Amic 4','Amic 5','Amic 6','Amic 7'],
        favorites:[], expenses:[], agenda:[],
      });
    }
    lsSet('b26_user',name);
    setUser(name);
    await sync(false);
    setSyncing(false);
  };

  const logout = () => {
    lsSet('b26_user',null); setUser(null);
    clearInterval(poll.current);
    setFavs(new Set()); setAgenda(LOCKED); setExpenses([]);
  };

  useEffect(()=>{ if(user) sync(); },[]);// eslint-disable-line
  useEffect(()=>{
    if(!user) return;
    poll.current = setInterval(()=>sync(false),20000);
    return ()=>clearInterval(poll.current);
  },[user,sync]);

  const toggleFav = (id) => {
    const nf=new Set(favs); nf.has(id)?nf.delete(id):nf.add(id);
    setFavs(nf); push({favorites:[...nf]});
  };
  const saveAg = (updated) => {
    const nl=updated.filter(a=>!LOCKED_IDS.has(a.id));
    setAgenda([...LOCKED,...nl]); push({agenda:nl});
  };
  const addToAg = (p) => saveAg([...agenda,{id:`ag_${Date.now()}`,day:'13/06',time:'',title:`${p.emoji} ${p.name}`,notes:p.address,color:CAT_C[p.cat]||'#888',addedBy:user}]);
  const saveMem = (m) => { setMembers(m); setEditMem(false); push({members:m}); };
  const addExp = () => {
    if(!nEx.payer||!nEx.amount||!nEx.desc) return;
    const e={id:`exp_${Date.now()}`,desc:nEx.desc,amount:parseFloat(nEx.amount),payer:nEx.payer,participants:nEx.parts.length?nEx.parts:[...members],date:new Date().toLocaleDateString('ca-ES'),addedBy:user};
    const up=[...expenses,e]; setExpenses(up); push({expenses:up});
    setNEx({payer:'',amount:'',desc:'',parts:[]}); setAddEx(false);
  };
  const delExp = (id) => { const up=expenses.filter(e=>e.id!==id); setExpenses(up); push({expenses:up}); };

  const list = PLACES.filter(p => {
    if(cat!=='tots'&&p.cat!==cat) return false;
    if(onlyFavs&&!favs.has(p.id)) return false;
    if(search){const q=search.toLowerCase();return p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q);}
    return true;
  });

  const {b:bal,tx} = settle(members,expenses);
  const tot = expenses.reduce((s,e)=>s+e.amount,0);
  const byDay={};
  ['12/06','13/06','14/06'].forEach(d=>{
    byDay[d]=agenda.filter(a=>a.day===d).sort((a,x)=>{
      if(!a.time&&!x.time)return 0;if(!a.time)return 1;if(!x.time)return -1;
      return a.time.localeCompare(x.time);
    });
  });

  if(!user) return <LoginScreen onLogin={login}/>;

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#070711;overscroll-behavior:none;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#e91e8c;border-radius:2px;}
        button{cursor:pointer;border:none;font-family:inherit;}button:active{opacity:.7;}
        input,select{font-family:inherit;outline:none;}a{text-decoration:none;color:inherit;}
        input::placeholder{color:#252540;}select option{background:#0d0d1e;color:#e0e0f0;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {needRefresh[0]&&<div style={S.banner}><span>🔄 Nova versió disponible!</span><button style={S.bBtn} onClick={()=>updateServiceWorker(true)}>Actualitzar ara</button></div>}
      {showAdd&&<div style={S.banner}><span>📲 Instal·la l'app al teu mòbil</span><button style={S.bBtn} onClick={async()=>{if(prompt){await prompt.prompt();setShowAdd(false);}  }}>Instal·lar</button><button style={{...S.bBtn,background:'transparent',border:'1px solid rgba(255,255,255,0.15)'}} onClick={()=>setShowAdd(false)}>✕</button></div>}
      {noFB&&<div style={{...S.banner,background:'rgba(244,162,97,0.12)',borderColor:'rgba(244,162,97,0.35)'}}><span style={{fontSize:12,color:'#f4a261'}}>⚠️ Firebase no configurat — mode local. Consulta el README.</span></div>}

      {/* HEADER */}
      <header style={S.hd}>
        <div style={S.g1}/><div style={S.g2}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
          <div>
            <div style={S.hLbl}>GUIA DE VIATGE</div>
            <h1 style={S.hTit}>BUCAREST '26</h1>
            <div style={S.hSub}>12–14 Juny · 7 persones · 🎂 40 anys</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {[{r:'BCN → OTP',t:'12/06 · 08:55',n:'W4 3176'},{r:'OTP → BCN',t:'14/06 · 18:20',n:'W4 3177'}].map((f,i)=>(
              <div key={i} style={S.fTag}><span style={S.fIco}>✈</span><div><div style={S.fR}>{f.r}</div><div style={S.fT}>{f.t} · {f.n}</div></div></div>
            ))}
          </div>
        </div>
        <div style={S.statusRow}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{...S.dot,background:syncing?'#f4a261':'#00e5ff'}}/>
            <span style={S.syncTxt}>{syncing?'Sincronitzant...':lastSync?`Sync ${lastSync.toLocaleTimeString('ca-ES',{hour:'2-digit',minute:'2-digit'})}`:'Connectat'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <div style={S.uBadge}><span>👤</span><span>{user}</span></div>
            <button style={S.logoutBtn} onClick={logout} title="Tancar sessió">↩</button>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={S.nav}>
        {[{id:'llocs',ico:'🗺️',l:'Llocs'},{id:'agenda',ico:'📅',l:'Agenda'},{id:'despeses',ico:'💸',l:'Despeses'}].map(t=>(
          <button key={t.id} style={{...S.nBtn,...(tab===t.id?S.nAct:{})}} onClick={()=>setTab(t.id)}>
            <span style={{fontSize:19}}>{t.ico}</span><span style={S.nLbl}>{t.l}</span>
            {tab===t.id&&<div style={S.nBar}/>}
          </button>
        ))}
      </nav>

      <div style={S.main}>

        {/* ══ LLOCS ══ */}
        {tab==='llocs'&&(
          <div>
            <div style={S.tb}>
              <div style={S.sb}><span style={{opacity:.4,fontSize:13}}>🔍</span><input style={S.si} placeholder="Cerca llocs..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button style={{background:'transparent',color:'#446',fontSize:12,padding:2}} onClick={()=>setSearch('')}>✕</button>}</div>
              <button style={{...S.fTog,...(onlyFavs?S.fTogA:{})}} onClick={()=>setOnlyFavs(!onlyFavs)}>{onlyFavs?'❤️':'🤍'}</button>
            </div>
            <div style={S.cats}>{CATS.map(c=><button key={c.id} style={{...S.catB,...(cat===c.id?S.catA:{})}} onClick={()=>setCat(c.id)}>{c.emoji} {c.label}</button>)}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'#444466'}}>{list.length} llocs</span>
              <div style={S.vTog}><button style={{...S.vB,...(view==='llista'?S.vA:{})}} onClick={()=>setView('llista')}>📋 Llista</button><button style={{...S.vB,...(view==='mapa'?S.vA:{})}} onClick={()=>setView('mapa')}>🗺️ Mapa</button></div>
            </div>
            {view==='mapa'&&(
              <div>
                <div style={{borderRadius:12,overflow:'hidden',border:'1px solid #1a1a30',marginBottom:10}}>
                  <iframe title="Mapa" width="100%" height="260" style={{border:'none',display:'block'}} loading="lazy"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=26.07%2C44.40%2C26.13%2C44.48&layer=mapnik"/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {list.map(p=>{const c=CC[p.cat];return(
                    <a key={p.id} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+', Bucharest')}`} target="_blank" rel="noopener noreferrer" style={S.mI}>
                      <span style={{...S.pill,background:c.bg,border:`1px solid ${c.bd}`,color:c.tx}}>{p.cat}</span>
                      <span style={{fontSize:18}}>{p.emoji}</span>
                      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'#f0f0ff'}}>{p.name}</div><div style={{fontSize:10,color:'#444466',fontFamily:"'DM Mono',monospace"}}>{p.address}</div></div>
                      <span style={{color:'#e91e8c',fontSize:15}}>↗</span>
                    </a>
                  );})}
                </div>
              </div>
            )}
            {view==='llista'&&(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {list.map(p=>{const c=CC[p.cat],iF=favs.has(p.id);return(
                  <div key={p.id} style={{...S.card,...(p.reserved?{border:'1px solid rgba(244,162,97,0.45)',background:'linear-gradient(135deg,#111128 0%,#1a1208 100%)'}:{})}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{...S.pill,background:c.bg,border:`1px solid ${c.bd}`,color:c.tx}}>{p.cat}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {p.rating&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'#ffd700'}}>{p.rating}</span>}
                        <button style={{background:'transparent',fontSize:20,padding:0,lineHeight:1}} onClick={()=>toggleFav(p.id)}>{iF?'❤️':'🤍'}</button>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <span style={{fontSize:24}}>{p.emoji}</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:'#f0f0ff',lineHeight:1.2}}>{p.name}</span>
                    </div>
                    <p style={{fontSize:13,color:'#7777a0',lineHeight:1.55,marginBottom:8}}>{p.desc}</p>
                    {p.hours&&<div style={{fontSize:11,color:'#444466',fontFamily:"'DM Mono',monospace",marginBottom:7}}>🕐 {p.hours}</div>}
                    {p.tip&&<div style={{display:'flex',gap:7,fontSize:12,color:'#00e5ff',background:'rgba(0,229,255,0.07)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:8,padding:'7px 10px',marginBottom:10,lineHeight:1.45}}><span style={{flexShrink:0}}>💡</span><span>{p.tip}</span></div>}
                    <div style={{display:'flex',gap:7}}>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+', Bucharest')}`} target="_blank" rel="noopener noreferrer" style={S.aL}>🗺️ Google Maps</a>
                      <button style={S.aB} onClick={()=>addToAg(p)}>📅 Afegir</button>
                    </div>
                  </div>
                );})}
                {list.length===0&&<div style={S.empty}><div style={{fontSize:40,marginBottom:10}}>🔍</div><div>Cap lloc trobat</div></div>}
              </div>
            )}
          </div>
        )}

        {/* ══ AGENDA ══ */}
        {tab==='agenda'&&(
          <div>
            {['12/06','13/06','14/06'].map(day=>(
              <div key={day} style={{marginBottom:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,paddingBottom:8,borderBottom:'1px solid #1a1a2e'}}>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:'#f0f0ff'}}>{DAYS[day]}</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'#333355'}}>{byDay[day].length} events</span>
                </div>
                <div>
                  {byDay[day].length===0&&<div style={{fontSize:12,color:'#333355',padding:'8px 0',fontStyle:'italic'}}>Dia lliure ✨</div>}
                  {byDay[day].map((ev,i)=>(
                    <div key={ev.id} style={{display:'flex',gap:8,marginBottom:2}}>
                      <div style={{width:42,flexShrink:0,paddingTop:3}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'#445'}}>{ev.time||'–'}</span></div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:14,flexShrink:0}}>
                        <div style={{width:10,height:10,borderRadius:'50%',flexShrink:0,marginTop:4,background:ev.color||'#888',boxShadow:`0 0 7px ${ev.color||'#888'}`}}/>
                        {i<byDay[day].length-1&&<div style={{width:2,flex:1,minHeight:18,background:'#1a1a2e',borderRadius:1,margin:'3px 0'}}/>}
                      </div>
                      <div style={{flex:1,paddingBottom:14}}>
                        <div style={{fontSize:13,fontWeight:500,color:'#f0f0ff',marginBottom:2}}>{ev.title}</div>
                        {ev.notes&&<div style={{fontSize:11,color:'#445566',fontFamily:"'DM Mono',monospace",lineHeight:1.4}}>{ev.notes}</div>}
                        {ev.reserved&&<span style={{display:'inline-block',marginTop:4,fontSize:9,background:'rgba(244,162,97,0.15)',border:'1px solid rgba(244,162,97,0.4)',color:'#f4a261',borderRadius:4,padding:'1px 6px',fontFamily:"'DM Mono',monospace"}}>✅ RESERVAT</span>}
                        {ev.addedBy&&<span style={{display:'inline-block',marginTop:4,marginLeft:4,fontSize:9,color:'#2a2a40',fontFamily:"'DM Mono',monospace"}}>· {ev.addedBy}</span>}
                      </div>
                      {!ev.locked&&<button style={{background:'transparent',color:'#2a2a40',fontSize:11,padding:4,flexShrink:0,marginTop:2}} onClick={()=>saveAg(agenda.filter(a=>a.id!==ev.id))}>✕</button>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {addEv?(
              <div style={S.form}>
                <h3 style={S.fTit}>+ Nou event</h3>
                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  <select style={{...S.sel,flex:1}} value={nEv.day} onChange={e=>setNEv({...nEv,day:e.target.value})}><option value="12/06">Dv 12 Juny</option><option value="13/06">Ds 13 Juny</option><option value="14/06">Dg 14 Juny</option></select>
                  <input style={{...S.inp,flex:1,marginBottom:0}} type="time" value={nEv.time} onChange={e=>setNEv({...nEv,time:e.target.value})}/>
                </div>
                <input style={{...S.inp,width:'100%'}} placeholder="Títol" value={nEv.title} onChange={e=>setNEv({...nEv,title:e.target.value})}/>
                <input style={{...S.inp,width:'100%',marginBottom:12}} placeholder="Notes (opcional)" value={nEv.notes} onChange={e=>setNEv({...nEv,notes:e.target.value})}/>
                <div style={{display:'flex',gap:8}}>
                  <button style={S.canBtn} onClick={()=>setAddEv(false)}>Cancel·la</button>
                  <button style={S.savBtn} onClick={()=>{if(!nEv.title.trim())return;saveAg([...agenda,{id:`ag_${Date.now()}`,...nEv,color:'#00e5ff',addedBy:user}]);setAddEv(false);setNEv({day:'12/06',time:'',title:'',notes:''});}}>Afegir</button>
                </div>
              </div>
            ):(
              <button style={S.dBtn} onClick={()=>setAddEv(true)}>+ Afegir event manualment</button>
            )}
          </div>
        )}

        {/* ══ DESPESES ══ */}
        {tab==='despeses'&&(
          <div>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              {[{v:`${tot.toFixed(2)}€`,l:'Total gastat'},{v:`${expenses.length}`,l:'Despeses'},{v:`${(tot/members.length).toFixed(2)}€`,l:'Per persona'}].map((s,i)=>(
                <div key={i} style={{flex:1,background:'#111128',border:'1px solid #1a1a2e',borderRadius:12,padding:'11px 8px',textAlign:'center'}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:'#e91e8c'}}>{s.v}</div>
                  <div style={{fontSize:9,color:'#444466',fontFamily:"'DM Mono',monospace",marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{...S.card,marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600,color:'#f0f0ff'}}>👥 Membres ({members.length})</span>
                <button style={{background:'transparent',border:'1px solid #1a1a2e',borderRadius:6,padding:'3px 9px',fontSize:11,color:'#888',fontFamily:"'DM Mono',monospace"}} onClick={()=>setEditMem(!editMem)}>{editMem?'Tancar':'✏️ Editar'}</button>
              </div>
              {editMem?(
                <MembersEditor initial={members} onSave={saveMem}/>
              ):(
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {members.map((m,i)=>(
                    <div key={i} style={{background:m===user?'rgba(233,30,140,0.12)':'rgba(0,229,255,0.07)',border:`1px solid ${m===user?'rgba(233,30,140,0.35)':'rgba(0,229,255,0.2)'}`,borderRadius:20,padding:'4px 10px',fontSize:12,color:m===user?'#e91e8c':'#00e5ff',fontFamily:"'DM Mono',monospace"}}>
                      {m===user?`★ ${m}`:m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:'flex',gap:8,marginBottom:12}}>
              <button style={{...S.dBtn,flex:1,marginBottom:0}} onClick={()=>setAddEx(!addEx)}>{addEx?'✕ Cancel·lar':'+ Afegir despesa'}</button>
              <button style={{background:'#111128',border:'1px solid #1a1a2e',borderRadius:12,padding:'0 14px',fontSize:16,color:'#555577'}} onClick={()=>sync()} title="Refresca">🔄</button>
            </div>

            {addEx&&(
              <div style={S.form}>
                <h3 style={S.fTit}>Nova despesa</h3>
                <input style={{...S.inp,width:'100%'}} placeholder="Descripció (Sopar, Taxis, Entrades...)" value={nEx.desc} onChange={e=>setNEx({...nEx,desc:e.target.value})}/>
                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  <input style={{...S.inp,flex:1,marginBottom:0}} type="number" placeholder="Import €" value={nEx.amount} onChange={e=>setNEx({...nEx,amount:e.target.value})}/>
                  <select style={{...S.sel,flex:1}} value={nEx.payer} onChange={e=>setNEx({...nEx,payer:e.target.value})}><option value="">Qui ha pagat?</option>{members.map(m=><option key={m} value={m}>{m}</option>)}</select>
                </div>
                <div style={{fontSize:11,color:'#444466',fontFamily:"'DM Mono',monospace",marginBottom:7}}>Dividir entre (buit = tots):</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                  {members.map(m=>{const s=nEx.parts.includes(m);return(
                    <button key={m} style={{background:s?'rgba(233,30,140,0.15)':'#0d0d1e',border:`1px solid ${s?'#e91e8c':'#1a1a2e'}`,borderRadius:20,padding:'5px 12px',fontSize:12,color:s?'#e91e8c':'#888',fontFamily:"'DM Mono',monospace"}}
                      onClick={()=>{const p=s?nEx.parts.filter(x=>x!==m):[...nEx.parts,m];setNEx({...nEx,parts:p});}}>
                      {m}
                    </button>
                  );})}
                </div>
                <div style={{display:'flex',gap:8}}><button style={S.canBtn} onClick={()=>setAddEx(false)}>Cancel·la</button><button style={S.savBtn} onClick={addExp}>Afegir despesa</button></div>
              </div>
            )}

            {expenses.length>0&&(
              <div style={{marginBottom:20}}>
                <h3 style={S.sTit}>📋 Historial</h3>
                {[...expenses].reverse().map(e=>{
                  const pp=e.amount/(e.participants?.length||members.length);
                  return(
                    <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',background:'#111128',border:'1px solid #1a1a2e',borderRadius:10,padding:'10px 12px',marginBottom:6}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:'#f0f0ff',marginBottom:2}}>{e.desc}</div>
                        <div style={{fontSize:11,color:'#444466',fontFamily:"'DM Mono',monospace",marginBottom:2}}>Pagat per <strong style={{color:'#e91e8c'}}>{e.payer}</strong> · {e.date}</div>
                        <div style={{fontSize:10,color:'#333355',fontFamily:"'DM Mono',monospace"}}>{(e.participants||members).join(' · ')} <span style={{color:'#404060'}}>({pp.toFixed(2)}€/p.)</span></div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:'#00e5ff'}}>{e.amount.toFixed(2)}€</div>
                        <button style={{background:'transparent',color:'#2a2a40',fontSize:11,padding:2}} onClick={()=>delExp(e.id)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {expenses.length>0&&(
              <div style={{marginBottom:20}}>
                <h3 style={S.sTit}>⚖️ Balanç per persona</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {members.map(m=>{const b=bal[m]||0,p=b>0.005,n=b<-0.005;return(
                    <div key={m} style={{background:'#111128',border:`1px solid ${p?'rgba(0,229,255,0.35)':n?'rgba(233,30,140,0.35)':'#1a1a2e'}`,borderRadius:12,padding:'11px 12px',textAlign:'center'}}>
                      <div style={{fontSize:12,color:'#7777a0',fontFamily:"'DM Mono',monospace",marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m}{m===user?' ★':''}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:17,fontWeight:700,color:p?'#00e5ff':n?'#e91e8c':'#444466'}}>{b>0?'+':''}{b.toFixed(2)}€</div>
                      <div style={{fontSize:9,color:'#333355',marginTop:2}}>{p?'🔼 li deuen':n?'🔽 ha de pagar':'✅ pau'}</div>
                    </div>
                  );})}
                </div>
              </div>
            )}

            {tx.length>0&&(
              <div style={{marginBottom:20}}>
                <h3 style={S.sTit}>💳 Com liquidar els deutes</h3>
                {tx.map((t,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'#111128',border:'1px solid rgba(233,30,140,0.2)',borderRadius:10,padding:'12px 14px',marginBottom:6}}>
                    <span style={{flex:1,fontSize:13,color:'#e91e8c',fontFamily:"'DM Mono',monospace",fontWeight:500}}>{t.from}</span>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                      <div style={{fontSize:13,color:'#2a2a3e'}}>→</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:'#00e5ff',background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.2)',borderRadius:6,padding:'2px 9px'}}>{t.amount.toFixed(2)}€</div>
                    </div>
                    <span style={{flex:1,fontSize:13,color:'#00e5ff',fontFamily:"'DM Mono',monospace",fontWeight:500,textAlign:'right'}}>{t.to}</span>
                  </div>
                ))}
              </div>
            )}

            {expenses.length===0&&<div style={S.empty}><div style={{fontSize:44,marginBottom:10}}>🧾</div><div>Cap despesa registrada</div><div style={{fontSize:12,color:'#333355',marginTop:6}}>Afegiu la primera despesa!</div></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STYLES LOGIN ───
const L = {
  root:{minHeight:'100dvh',background:'#070711',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:"'DM Sans',sans-serif",position:'relative',overflow:'hidden'},
  g1:{position:'fixed',top:-120,right:-80,width:380,height:380,background:'radial-gradient(circle,rgba(233,30,140,0.22) 0%,transparent 70%)',pointerEvents:'none'},
  g2:{position:'fixed',bottom:-120,left:-80,width:300,height:300,background:'radial-gradient(circle,rgba(0,229,255,0.12) 0%,transparent 70%)',pointerEvents:'none'},
  wrap:{width:'100%',maxWidth:400,position:'relative',zIndex:1},
  icon:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:76,height:76,background:'#0d0d1e',border:'2px solid rgba(233,30,140,0.4)',borderRadius:20,marginBottom:14,boxShadow:'0 0 30px rgba(233,30,140,0.15)'},
  eyebrow:{fontSize:9,letterSpacing:3,color:'#e91e8c',fontFamily:"'DM Mono',monospace",marginBottom:7,textTransform:'uppercase'},
  title:{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:800,color:'#fff',letterSpacing:-2,lineHeight:1},
  sub:{fontSize:13,color:'#6666a0',marginTop:7},
  flag:{display:'flex',gap:3,height:5,borderRadius:4,overflow:'hidden',marginTop:16,marginBottom:0},
  box:{background:'#111128',border:'1px solid #1a1a2e',borderRadius:18,padding:'24px',marginTop:22},
  boxTitle:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:'#f0f0ff',marginBottom:8},
  boxDesc:{fontSize:13,color:'#7777a0',lineHeight:1.6,marginBottom:22},
  lbl:{display:'block',fontSize:10,color:'#555577',fontFamily:"'DM Mono',monospace",marginBottom:7,letterSpacing:.8,textTransform:'uppercase'},
  inp:{width:'100%',background:'#0a0a16',border:'1px solid #1a1a2e',borderRadius:10,padding:'13px 14px',fontSize:15,color:'#e0e0f0',display:'block',marginBottom:16},
  eye:{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',color:'#555',fontSize:17,padding:4,cursor:'pointer'},
  err:{display:'flex',alignItems:'center',gap:8,background:'rgba(233,30,140,0.1)',border:'1px solid rgba(233,30,140,0.3)',borderRadius:10,padding:'10px 12px',fontSize:13,color:'#e91e8c',marginBottom:16},
  btn:{width:'100%',background:'linear-gradient(135deg,#e91e8c,#c2185b)',border:'none',borderRadius:12,padding:'15px',fontSize:15,color:'#fff',fontFamily:"'Syne',sans-serif",fontWeight:700,cursor:'pointer'},
  spin:{display:'inline-block',width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .6s linear infinite'},
  hint:{textAlign:'center',fontSize:11,color:'#2a2a44',marginTop:14,fontFamily:"'DM Mono',monospace",lineHeight:1.5},
};

// ─── STYLES APP ───
const S = {
  root:{fontFamily:"'DM Sans',sans-serif",background:'#070711',minHeight:'100dvh',color:'#e0e0f0',maxWidth:500,margin:'0 auto',paddingBottom:'env(safe-area-inset-bottom)'},
  banner:{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(233,30,140,0.15)',borderBottom:'1px solid rgba(233,30,140,0.3)',fontSize:12,flexWrap:'wrap'},
  bBtn:{background:'#e91e8c',border:'none',borderRadius:6,padding:'4px 12px',fontSize:11,color:'#fff',fontFamily:"'DM Mono',monospace"},
  hd:{background:'linear-gradient(140deg,#0a0a1e 0%,#160820 100%)',padding:'16px 16px 10px',position:'relative',overflow:'hidden',borderBottom:'1px solid rgba(233,30,140,0.25)'},
  g1:{position:'absolute',top:-70,right:-70,width:220,height:220,background:'radial-gradient(circle,rgba(233,30,140,0.28) 0%,transparent 70%)',pointerEvents:'none'},
  g2:{position:'absolute',bottom:-40,left:-40,width:150,height:150,background:'radial-gradient(circle,rgba(0,229,255,0.1) 0%,transparent 70%)',pointerEvents:'none'},
  hLbl:{fontSize:9,letterSpacing:3.5,color:'#e91e8c',fontFamily:"'DM Mono',monospace",marginBottom:5,textTransform:'uppercase'},
  hTit:{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:'#fff',lineHeight:1,letterSpacing:-1.5},
  hSub:{fontSize:12,color:'#6666a0',marginTop:5},
  fTag:{display:'flex',alignItems:'center',gap:6,background:'rgba(233,30,140,0.09)',border:'1px solid rgba(233,30,140,0.25)',borderRadius:8,padding:'5px 8px'},
  fIco:{fontSize:12,color:'#e91e8c',transform:'rotate(45deg)',display:'inline-block'},
  fR:{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:'#fff',letterSpacing:.8},
  fT:{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#666680'},
  statusRow:{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,position:'relative',zIndex:1},
  dot:{width:6,height:6,borderRadius:'50%',flexShrink:0},
  syncTxt:{fontFamily:"'DM Mono',monospace",fontSize:10,color:'#444466'},
  uBadge:{display:'flex',alignItems:'center',gap:5,background:'rgba(233,30,140,0.1)',border:'1px solid rgba(233,30,140,0.25)',borderRadius:20,padding:'3px 10px',fontSize:12,color:'#e91e8c',fontFamily:"'DM Mono',monospace"},
  logoutBtn:{background:'transparent',border:'1px solid #1a1a2e',borderRadius:8,padding:'4px 8px',fontSize:14,color:'#444466'},
  nav:{display:'flex',background:'#0a0a1a',borderBottom:'1px solid #151530',position:'sticky',top:0,zIndex:100},
  nBtn:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'10px 8px',background:'transparent',color:'#444460',position:'relative'},
  nAct:{color:'#e91e8c'},
  nLbl:{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:.5,textTransform:'uppercase'},
  nBar:{position:'absolute',bottom:0,left:'20%',right:'20%',height:2,background:'#e91e8c',borderRadius:'2px 2px 0 0'},
  main:{padding:'14px 14px 48px'},
  tb:{display:'flex',gap:8,marginBottom:11},
  sb:{flex:1,display:'flex',alignItems:'center',background:'#111128',border:'1px solid #1a1a30',borderRadius:10,padding:'8px 12px',gap:8},
  si:{flex:1,background:'transparent',border:'none',color:'#e0e0f0',fontSize:14},
  fTog:{background:'#111128',border:'1px solid #1a1a30',borderRadius:10,padding:'8px 12px',fontSize:19},
  fTogA:{borderColor:'#e91e8c',background:'rgba(233,30,140,0.1)'},
  cats:{display:'flex',gap:6,marginBottom:11,overflowX:'auto',paddingBottom:3},
  catB:{background:'#111128',border:'1px solid #1a1a30',borderRadius:20,padding:'6px 12px',fontSize:12,color:'#6666a0',whiteSpace:'nowrap'},
  catA:{background:'rgba(233,30,140,0.12)',borderColor:'rgba(233,30,140,0.5)',color:'#e91e8c'},
  vTog:{display:'flex',gap:3,background:'#111128',border:'1px solid #1a1a30',borderRadius:8,padding:3},
  vB:{background:'transparent',border:'none',borderRadius:5,padding:'4px 10px',fontSize:11,color:'#444466',fontFamily:"'DM Mono',monospace"},
  vA:{background:'#e91e8c',color:'#fff'},
  mI:{display:'flex',alignItems:'center',gap:8,background:'#111128',border:'1px solid #1a1a30',borderRadius:10,padding:'10px 12px'},
  pill:{borderRadius:4,padding:'2px 8px',fontSize:9,fontFamily:"'DM Mono',monospace",textTransform:'uppercase',letterSpacing:.5,whiteSpace:'nowrap'},
  card:{background:'#111128',border:'1px solid #1a1a30',borderRadius:14,padding:'13px'},
  aL:{flex:1,display:'block',textAlign:'center',background:'rgba(0,229,255,0.07)',border:'1px solid rgba(0,229,255,0.18)',color:'#00e5ff',borderRadius:8,padding:'7px 0',fontSize:12,fontFamily:"'DM Mono',monospace"},
  aB:{flex:1,background:'rgba(233,30,140,0.07)',border:'1px solid rgba(233,30,140,0.18)',color:'#e91e8c',borderRadius:8,padding:'7px 0',fontSize:12,fontFamily:"'DM Mono',monospace"},
  form:{background:'#111128',border:'1px solid #1a1a30',borderRadius:14,padding:'15px',marginBottom:14},
  fTit:{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:'#f0f0ff',marginBottom:12},
  inp:{background:'#0a0a16',border:'1px solid #1a1a30',borderRadius:8,padding:'9px 12px',fontSize:13,color:'#e0e0f0',marginBottom:8,display:'block'},
  sel:{background:'#0a0a16',border:'1px solid #1a1a30',borderRadius:8,padding:'9px 12px',fontSize:13,color:'#e0e0f0',marginBottom:8,display:'block'},
  canBtn:{flex:1,background:'transparent',border:'1px solid #1a1a30',borderRadius:8,padding:'9px',fontSize:12,color:'#555570',fontFamily:"'DM Mono',monospace"},
  savBtn:{flex:1,background:'#e91e8c',border:'none',borderRadius:8,padding:'9px',fontSize:12,color:'#fff',fontFamily:"'DM Mono',monospace",fontWeight:600},
  dBtn:{width:'100%',background:'transparent',border:'1px dashed #1a1a30',borderRadius:12,padding:'13px',fontSize:13,color:'#444466',fontFamily:"'DM Mono',monospace"},
  sTit:{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:'#f0f0ff',marginBottom:10},
  empty:{textAlign:'center',padding:'40px 20px',color:'#2a2a40',fontSize:14,fontFamily:"'DM Mono',monospace"},
};
