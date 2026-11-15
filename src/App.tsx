import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, Bell, CalendarDays, Check, ClipboardList, Heart, HeartPulse, Home, LogOut, MessageCircle, Pause, Play, RotateCcw, Ruler, Save, Scale, Search, ShieldCheck, UserRound, Users, Weight, Wind } from 'lucide-react';
import astronautData from './data/astronauts.json';

type Page = 'Dashboard' | 'Health profile' | 'Report' | 'Messages' | 'Astronautes';
type AstronautRecord = { id: string; name: string; role: string; mission: string; missionDay: number; healthScore: number; healthStatus: string; weightKg: number; heightCm: number; diuresisMl24h: number; breathingFrequency: number; heartRate: number; bodyTemperatureC: number; oxygenSaturation: number; systolicBloodPressure: number; diastolicBloodPressure: number };
type Role = 'Astronaut' | 'Doctor';
type Vitals = { weight: string; height: string; diuresis: string };
const blank: Vitals = { weight: '', height: '', diuresis: '' };
function loadProfile(): Vitals { try { return { ...blank, ...JSON.parse(localStorage.getItem('astrocardia-profile') || '{}') }; } catch { return blank; } }
function loadRole(): Role | null { const role = localStorage.getItem('astrocardia-role'); return role === 'Astronaut' || role === 'Doctor' ? role : null; }
const astronauts = astronautData as AstronautRecord[];
// Demo thresholds are configurable and illustrative, not validated medical standards.
const DEMO_THRESHOLDS = {
  heartRate: { normal: 100, critical: 120 },
  breathing: { normal: 22, critical: 30 },
  temperature: { normal: 37.8, critical: 39 },
  oxygen: { normalMinimum: 95, criticalMinimum: 90 },
  systolic: { normal: 129, critical: 160 },
  diastolic: { normal: 84, critical: 100 },
};
type SimVitals = { elapsed: number; progress: number; heartRate: number; breathing: number; temperature: number; oxygen: number; systolic: number; diastolic: number };
function simulateVitals(elapsed: number): SimVitals {
  const progress = Math.min(elapsed / 10, 1);
  return {
    elapsed, progress,
    heartRate: 72 + progress * 52 + Math.sin(elapsed * 1.2) * 1.5,
    breathing: 16 + progress * 12 + Math.sin(elapsed * 1.5) * .4,
    temperature: 36.6 + progress * 2.8 + Math.sin(elapsed * 1.1) * .06,
    oxygen: 98 - progress * 13 + Math.sin(elapsed) * .25,
    systolic: 118 + progress * 32 + Math.sin(elapsed * 1.3) * 2,
    diastolic: 76 + progress * 18 + Math.sin(elapsed * 1.1) * 1.5,
  };
}
function indicatorStatus(kind: keyof typeof DEMO_THRESHOLDS, value: number): 'Normal' | 'Attention' | 'Critical' {
  if (kind === 'oxygen') { const t = DEMO_THRESHOLDS.oxygen; return value < t.criticalMinimum ? 'Critical' : value < t.normalMinimum ? 'Attention' : 'Normal'; }
  if (kind === 'systolic' || kind === 'diastolic') { const t = DEMO_THRESHOLDS[kind]; return value >= t.critical ? 'Critical' : value > t.normal ? 'Attention' : 'Normal'; }
  const t = DEMO_THRESHOLDS[kind];
  return value > t.critical ? 'Critical' : value > t.normal ? 'Attention' : 'Normal';
}
function overallStatus(v: SimVitals): 'Healthy' | 'Attention' | 'Critical' {
  const states = [indicatorStatus('heartRate', v.heartRate), indicatorStatus('breathing', v.breathing), indicatorStatus('temperature', v.temperature), indicatorStatus('oxygen', v.oxygen), indicatorStatus('systolic', v.systolic), indicatorStatus('diastolic', v.diastolic)];
  return states.includes('Critical') ? 'Critical' : states.includes('Attention') ? 'Attention' : 'Healthy';
}
function healthReply(status: 'Healthy' | 'Attention' | 'Critical') {
  if (status === 'Critical') return 'Critical health indicators detected. Please contact your medical officer immediately.';
  if (status === 'Attention') return 'Some health indicators require attention. Please be aware and contact your medical officer if necessary.';
  return 'Your health indicators are within the normal range. Your health status is GOOD.';
}

export default function App() {
  const [page, setPage] = useState<Page>('Dashboard');
  const [role, setRole] = useState<Role | null>(loadRole);
  const [selectedRole, setSelectedRole] = useState<Role>('Astronaut');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<Vitals>(loadProfile);
  const [lastRecordedAt, setLastRecordedAt] = useState(() => localStorage.getItem('astrocardia-last-profile-entry') || '');
  const [clock, setClock] = useState(Date.now());
  const [simElapsed, setSimElapsed] = useState(0);
  const [simRunning, setSimRunning] = useState(true);
  const [simResetKey, setSimResetKey] = useState(0);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [detail, setDetail] = useState<string | null>(null);
  const [chatWithAI, setChatWithAI] = useState(false);
  const [message, setMessage] = useState('');
  const [doctorMessages, setDoctorMessages] = useState<string[]>(['Thanks, I will update my health profile today.']);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [aiChecking, setAiChecking] = useState(false);
  const messages = chatWithAI ? aiMessages : doctorMessages;
  const [physicalSent, setPhysicalSent] = useState(false);
  const [psychSent, setPsychSent] = useState(false);
  function signIn(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('astrocardia-role', selectedRole);
    setRole(selectedRole);
    setPage('Dashboard');
  }
  function useDemoAccount(demoRole: Role) {
    setSelectedRole(demoRole);
    setEmail(demoRole === 'Astronaut' ? 'astronaut@astrocardia.demo' : 'doctor@astrocardia.demo');
    setPassword(demoRole === 'Astronaut' ? 'Astro2026!' : 'Doctor2026!');
  }
  function logOut() {
    localStorage.removeItem('astrocardia-role');
    setRole(null);
    setSelectedRole('Astronaut');
    setPage('Dashboard');
    setPassword('');
  }
  const nav: Page[] = role === 'Astronaut' ? ['Dashboard', 'Health profile', 'Report', 'Messages'] : ['Dashboard', 'Astronautes'];
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!simRunning || role !== 'Astronaut' || page !== 'Dashboard') return;
    const startedAt = Date.now() - simElapsed * 1000;
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      if (elapsed >= 10) { setSimElapsed(10); setSimRunning(false); }
      else setSimElapsed(elapsed);
    }, 100);
    return () => window.clearInterval(timer);
  }, [simRunning, simResetKey, role, page]);
  const simVitals = simulateVitals(simElapsed);
  const missionStatus = overallStatus(simVitals);
  const healthScore = Math.max(22, Math.round(87 - simVitals.progress * 65));
  const pressureState = [indicatorStatus('systolic', simVitals.systolic), indicatorStatus('diastolic', simVitals.diastolic)].includes('Critical') ? 'Critical' : [indicatorStatus('systolic', simVitals.systolic), indicatorStatus('diastolic', simVitals.diastolic)].includes('Attention') ? 'Attention' : 'Normal';
  const update = (key: keyof Vitals, value: string) => { setProfile(old => ({ ...old, [key]: value })); setSaved(false); };
  const lastEntryTime = Date.parse(lastRecordedAt);
  const nextEntryAt = Number.isFinite(lastEntryTime) ? lastEntryTime + 24 * 60 * 60 * 1000 : 0;
  const entryDue = !lastRecordedAt || !Number.isFinite(lastEntryTime) || clock >= nextEntryAt;
  const minutesUntilEntry = entryDue ? 0 : Math.ceil((nextEntryAt - clock) / 60_000);
  const dueLabel = entryDue ? 'Daily entry is due' : `Next entry in ${Math.floor(minutesUntilEntry / 60)}h ${minutesUntilEntry % 60}m`;
  function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!entryDue) return;
    const recordedAt = new Date().toISOString();
    localStorage.setItem('astrocardia-profile', JSON.stringify(profile));
    localStorage.setItem('astrocardia-last-profile-entry', recordedAt);
    setLastRecordedAt(recordedAt);
    setClock(Date.now());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }
  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || aiChecking) return;
    const text = message.trim();
    if (chatWithAI) {
      if (text.toLowerCase() !== 'is my health good?') return;
      setAiMessages(old => [...old, text]);
      setAiChecking(true);
      try {
        const { predictDemoHealthStatus } = await import('./services/healthModel');
        const status = await predictDemoHealthStatus({ heartRate: simVitals.heartRate, breathing: simVitals.breathing, temperature: simVitals.temperature, oxygen: simVitals.oxygen, systolic: simVitals.systolic, diastolic: simVitals.diastolic });
        setAiMessages(old => [...old, healthReply(status)]);
      } catch {
        setAiMessages(old => [...old, healthReply(overallStatus(simVitals))]);
      } finally { setAiChecking(false); }
    } else setDoctorMessages(old => [...old, text]);
    setMessage('');
  }
  const shownCrew = astronauts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) && (filter === 'All statuses' || a.healthStatus === filter));
  const crewCounts = {
    total: astronauts.length,
    healthy: astronauts.filter(a => a.healthStatus === 'Healthy').length,
    attention: astronauts.filter(a => a.healthStatus === 'Attention').length,
    critical: astronauts.filter(a => a.healthStatus === 'Critical').length,
  };
  const selectedAstronaut = detail ? astronauts.find(a => a.name === detail) : undefined;
  const todayLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (!role) return <div className="login-shell">
    <div className="login-brand"><span className="brand-symbol"><AstroLogo /></span><span>Astrocardia<small>MISSION HEALTH SYSTEM</small></span></div>
    <section className="login-card">
      <div className="login-eyebrow"><ShieldCheck/> SECURE MISSION ACCESS</div>
      <h1>Welcome aboard</h1>
      <p className="login-intro">Sign in to your Astrocardia workspace.</p>
      <form onSubmit={signIn}>
        <fieldset className="role-picker"><legend>Choose your role</legend>
          <button type="button" className={'role-option '+(selectedRole === 'Doctor' ? 'selected' : '')} onClick={() => setSelectedRole('Doctor')}><HeartPulse/><span><b>Doctor</b><small>Medical team workspace</small></span><i/></button>
          <button type="button" className={'role-option '+(selectedRole === 'Astronaut' ? 'selected' : '')} onClick={() => setSelectedRole('Astronaut')}><UserRound/><span><b>Astronaut</b><small>Personal health workspace</small></span><i/></button>
        </fieldset>
        <label className="login-label">Email address<input type="email" autoComplete="email" placeholder="you@mission.org" value={email} onChange={e => setEmail(e.target.value)} required/></label>
        <label className="login-label">Password<input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required/></label>
        <button className="primary-btn login-submit" type="submit">Sign in to Astrocardia <span>→</span></button>
      </form>
      <div className="demo-accounts">
        <div className="demo-accounts-heading"><span>DEMO ACCOUNTS</span><small>For presentation use</small></div>
        <div className="demo-account"><div><b>Astronaut</b><code>astronaut@astrocardia.demo</code><code>Astro2026!</code></div><button type="button" onClick={() => useDemoAccount('Astronaut')}>Use</button></div>
        <div className="demo-account"><div><b>Doctor</b><code>doctor@astrocardia.demo</code><code>Doctor2026!</code></div><button type="button" onClick={() => useDemoAccount('Doctor')}>Use</button></div>
      </div>
      <div className="login-demo"><ShieldCheck/> Demo only. Sample credentials fill the form; any non-empty password works.</div>
    </section>
    <p className="login-footer">Astrocardia · Health support for every mission</p>
  </div>;

  return <div className="shell">
    <aside className="sidebar">
      <a className="brand"><span className="brand-symbol"><AstroLogo /></span><span>Astrocardia<small>MISSION HEALTH</small></span></a>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item} className={'nav-item ' + (page === item ? 'active' : '')} onClick={() => { setPage(item); setDetail(null); }}>
        {item === 'Dashboard' ? <Home/> : item === 'Health profile' ? <UserRound/> : item === 'Report' ? <ClipboardList/> : item === 'Messages' ? <MessageCircle/> : <Users/>}{item}
      </button>)}</nav>
      <div className="sidebar-profile"><div className="avatar">{role === 'Astronaut' ? 'AM' : 'SM'}</div><div><b>{role === 'Astronaut' ? 'Alex Morgan' : 'Dr. Sarah Mitchell'}</b><small>{role === 'Astronaut' ? 'Pilot · Mars Mission' : 'Chief Medical Officer'}</small></div></div>
      <button className="logout" onClick={logOut}><LogOut/> Log out</button>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">Mission workspace <span>/</span> {detail || page}</div><div className="top-right"><span className="demo-tag"><i/> DEMO DATA</span><button className="bell" aria-label="Notifications"><Bell/><b>1</b></button><div className="avatar small">{role === 'Astronaut' ? 'AM' : 'SM'}</div></div></header>
      <div className={'content '+(page === 'Dashboard' && role === 'Astronaut' ? 'astronaut-dashboard-page' : '')}>
        {page === 'Dashboard' && role === 'Astronaut' && <>
          <div className="page-heading"><div><h1>Welcome back, Commander!</h1><p>Your health. Your mission. Your future.</p></div><div className="date-pill"><CalendarDays/>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>
          <div className="simulation-bar"><span className={'sim-live '+(simRunning?'':simElapsed>=10?'complete':'paused')}><i/>{simRunning?'LIVE':simElapsed>=10?'COMPLETE':'PAUSED'} SIMULATION</span><span className="sim-description">Indicator values update every 0.1s · healthy to critical over 10s</span><div className="sim-progress"><span style={{width: `${simVitals.progress * 100}%`}}/></div><time>00:{String(Math.floor(simElapsed%60)).padStart(2,'0')}</time><button type="button" aria-label={simRunning?'Pause simulation':simElapsed>=10?'Replay simulation':'Resume simulation'} onClick={() => { if (simElapsed >= 10) { setSimElapsed(0); setSimResetKey(key => key + 1); setSimRunning(true); } else setSimRunning(running => !running); }}>{simRunning?<Pause/>:<Play/>}</button><button type="button" aria-label="Restart simulation" onClick={() => { setSimElapsed(0); setSimResetKey(key => key + 1); setSimRunning(true); }}><RotateCcw/></button></div>
          <div className="vitals-layout">
            <section className={'scan-card scan-'+missionStatus.toLowerCase()}>
              <div className="scan-card-heading"><div><span className="scan-kicker">CREW TELEMETRY</span><h2>Astronaut scan</h2></div><span className="scan-live"><i/> LIVE</span></div>
              <div className="scan-stage"><div className="scan-rings"><i/><i/><i/></div><div className="scan-crosshair xhair-one"/><div className="scan-crosshair xhair-two"/><AstronautIllustration/><div className="scan-beam"/><div className="scan-corner corner-a"/><div className="scan-corner corner-b"/><div className="scan-corner corner-c"/><div className="scan-corner corner-d"/>
                <div className="scan-readout readout-left"><span>HEART RATE</span><b>{Math.round(simVitals.heartRate)}</b><small>BPM</small></div><div className="scan-readout readout-right"><span>O₂ SATURATION</span><b>{simVitals.oxygen.toFixed(1)}<small>%</small></b></div>
              </div>
              <div className="scan-caption"><div><b>Alex Morgan</b><span>Pilot · Mars Mission · Day 142</span></div><span className="scan-sync"><i/> TELEMETRY SYNCED</span></div>
            </section>
            <div className="dashboard-right">
              <section className="score-compact"><div className="score-compact-top"><div><div className="metric-title"><span className="metric-icon red"><HeartPulse/></span><h2>Health Score</h2></div><div className="score-inline"><strong>{healthScore}</strong><span>/100</span><Status status={missionStatus}/></div></div><div className="score-emblem"><HeartPulse/></div></div><div className="score-meter"><span style={{width: `${healthScore}%`}}/></div><p>{missionStatus === 'Healthy' ? 'Current indicators are looking stable.' : missionStatus === 'Attention' ? 'Some indicators need attention.' : 'Critical demo readings detected.'}</p></section>
              <div className="metric-grid"><Vital icon={<Wind/>} label="Breathing Frequency" value={simVitals.breathing.toFixed(1)} unit="/min" state={indicatorStatus('breathing', simVitals.breathing)} color="blue"/><Vital icon={<Heart/>} label="Heart Rate" value={String(Math.round(simVitals.heartRate))} unit="bpm" state={indicatorStatus('heartRate', simVitals.heartRate)} color="pink"/><Vital icon={<Activity/>} label="Body Temperature" value={simVitals.temperature.toFixed(1)} unit="°C" state={indicatorStatus('temperature', simVitals.temperature)} color="orange"/><Vital icon={<Activity/>} label="Blood Oxygen" value={simVitals.oxygen.toFixed(1)} unit="%" state={indicatorStatus('oxygen', simVitals.oxygen)} color="purple"/><Vital icon={<Activity/>} label="Blood Pressure" value={`${Math.round(simVitals.systolic)}/${Math.round(simVitals.diastolic)}`} unit="mmHg" state={pressureState} color="green"/><Vital icon={<Weight/>} label="Current Weight" value={profile.weight || String(astronauts[0].weightKg)} unit="kg" state={profile.weight ? 'Logged' : 'Demo data'} color="blue"/></div>
            </div>
          </div>
          <div className="recommendation"><span className="bulb">✦</span><div><b>Simulation status</b><p>{missionStatus === 'Healthy' ? 'The demo readings are within their configured normal ranges.' : missionStatus === 'Attention' ? 'Some demo readings are moving outside their configured normal ranges.' : 'The simulation has reached critical demo readings. Restart to begin again.'}</p></div><button onClick={() => { setSimElapsed(0); setSimResetKey(key => key + 1); setSimRunning(true); }}>Restart simulation <span>→</span></button></div>
          <div className="disclaimer"><ShieldCheck/> Demonstration readings only. Thresholds are configurable and are not validated medical standards.</div>
        </>}
        {page === 'Dashboard' && role === 'Doctor' && <>
          <div className="page-heading"><div><h1>Doctor Dashboard</h1><p>Monitor. Care. Support.</p></div><div className="date-pill"><CalendarDays/>{todayLabel}</div></div>
          <div className="doctor-top"><div className="doctor-card"><div className="doctor-avatar">SM</div><div><h2>Dr. Sarah Mitchell</h2><p>Chief Medical Officer</p><span>✚ Mission Support Team</span></div></div><div className="total-card"><span>Total Astronautes</span><strong>{crewCounts.total}</strong><Users/></div></div>
          <div className="doctor-grid"><section className="card overview"><h2><HeartPulse/> Mission Health Overview</h2><div className="overview-body"><div className="donut"><b>{Math.round(crewCounts.healthy / crewCounts.total * 100)}<small>%</small></b><span>Healthy<br/>crew</span></div><div className="legend"><p><i className="green-dot"/>Healthy <b>{crewCounts.healthy}</b></p><p><i className="amber-dot"/>Needs attention <b>{crewCounts.attention}</b></p><p><i className="red-dot"/>Critical <b>{crewCounts.critical}</b></p></div></div></section>
            <section className="card mini-roster"><div className="roster-heading"><div><h2><Users/> Astronautes</h2><p>Manage and monitor {crewCounts.total} demo records</p></div><button className="text-button" onClick={() => setPage('Astronautes')}>View all →</button></div>{astronauts.slice(0, 4).map(a => <button className="roster-row" key={a.id} onClick={() => { setPage('Astronautes'); setDetail(a.name); }}><div className="avatar">{initials(a.name)}</div><span><b>{a.name}</b><small>{a.role} · Day {a.missionDay}</small></span><Status status={a.healthStatus}/></button>)}</section></div>
        </>}
        {page === 'Health profile' && <>
          <div className="page-heading"><div><div className="eyebrow"><Activity/> PERSONAL HEALTH RECORD</div><h1>Health profile</h1><p>Keep your personal health details current for your medical team.</p></div><div className="date-pill"><CalendarDays/>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>
          <div className="notice"><ShieldCheck/><span><b>Your information stays in this demo.</b> These measurements are saved in this browser only.</span></div>
          <div className="notice daily-cadence"><CalendarDays/><span><b>Daily check-in</b> Enter weight, height, and diuresis once every 24 hours.</span><strong>{dueLabel}</strong></div>
          <form onSubmit={saveProfile}>
            <section className="card"><PanelTitle icon={<Scale/>} title="24-hour health measurements" subtitle="Record the three measurements for this daily check-in."/><div className="field-grid daily-fields">
              <label>Current weight <em>*</em><div className="input-wrap"><Weight/><input required disabled={!entryDue} type="number" min="1" max="500" step="0.1" placeholder="e.g. 72.5" value={profile.weight} onChange={e => update('weight', e.target.value)}/><span>kg</span></div></label>
              <label>Height <em>*</em><div className="input-wrap"><Ruler/><input required disabled={!entryDue} type="number" min="50" max="250" step="0.1" placeholder="e.g. 175" value={profile.height} onChange={e => update('height', e.target.value)}/><span>cm</span></div></label>
              <label>Diuresis (urine output over 24 hours) <em>*</em><div className="input-wrap"><Activity/><input required disabled={!entryDue} type="number" min="0" max="20000" step="1" placeholder="Enter total urine output" value={profile.diuresis} onChange={e => update('diuresis', e.target.value)}/><span>mL / 24h</span></div></label>
            </div></section>
            {lastRecordedAt && <div className="last-entry">Last recorded {new Date(lastRecordedAt).toLocaleString()}</div>}
            <div className="form-actions"><span><ShieldCheck/> Saved only in this browser</span><button className="primary-btn" type="submit" disabled={!entryDue}>{saved ? <Check/> : <Save/>}{saved ? 'Saved' : entryDue ? 'Save daily check-in' : 'Next entry in 24 hours'}</button></div>
          </form>
        </>}
        {page === 'Astronautes' && !detail && <>
          <div className="page-heading"><div><h1>Astronautes</h1><p>Manage and monitor all astronauts.</p></div><div className="astronaut-page-actions"><a className="outline-btn download-data" href="/data/astrocardia-demo-astronauts.xlsx" download>Download Excel data</a><div className="date-pill"><CalendarDays/>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div></div></div>
          <div className="summary-row"><Summary value={String(crewCounts.total)} label="Total Astronautes"/><Summary value={String(crewCounts.healthy)} label="In Good Health" green/><Summary value={String(crewCounts.attention)} label="Needs Attention" amber/><Summary value={String(crewCounts.critical)} label="Critical" red/></div>
          <div className="search-filter"><div className="search-box"><Search/><input placeholder="Search astronaut..." value={search} onChange={e => setSearch(e.target.value)}/></div><select value={filter} onChange={e => setFilter(e.target.value)}><option>All statuses</option><option>Healthy</option><option>Attention</option><option>Critical</option></select></div>
          <div className="table-wrap"><table><thead><tr><th>Astronaut</th><th>Role</th><th>Mission Day</th><th>Health Status</th><th>Health Score</th><th>Actions</th></tr></thead><tbody>{shownCrew.map(a => <tr key={a.id}><td><div className="person-cell"><div className="avatar">{initials(a.name)}</div><b>{a.name}</b></div></td><td>{a.role}</td><td>Day {a.missionDay}</td><td><Status status={a.healthStatus}/></td><td><b>{a.healthScore}</b> / 100</td><td><button className="outline-btn" onClick={() => setDetail(a.name)}>View details</button></td></tr>)}</tbody></table>{shownCrew.length === 0 && <div className="empty">No astronauts match your search.</div>}</div>
        </>}
        {page === 'Astronautes' && detail && selectedAstronaut && <><button className="back" onClick={() => setDetail(null)}>← Back to Astronautes</button><div className="page-heading"><div><h1>{selectedAstronaut.name}</h1><p>{selectedAstronaut.mission} · Day {selectedAstronaut.missionDay} · Health score {selectedAstronaut.healthScore}/100</p></div><Status status={selectedAstronaut.healthStatus}/></div><div className="metric-grid detail-vitals"><Vital icon={<Wind/>} label="Breathing Frequency" value={String(selectedAstronaut.breathingFrequency)} unit="/min" state={selectedAstronaut.healthStatus === 'Healthy' ? 'Normal' : selectedAstronaut.healthStatus} color="blue"/><Vital icon={<Heart/>} label="Heart Rate" value={String(selectedAstronaut.heartRate)} unit="bpm" state={selectedAstronaut.healthStatus === 'Healthy' ? 'Normal' : selectedAstronaut.healthStatus} color="pink"/><Vital icon={<Activity/>} label="Body Temperature" value={selectedAstronaut.bodyTemperatureC.toFixed(1)} unit="°C" state={selectedAstronaut.healthStatus === 'Healthy' ? 'Normal' : selectedAstronaut.healthStatus} color="orange"/><Vital icon={<Activity/>} label="Blood Pressure" value={`${selectedAstronaut.systolicBloodPressure}/${selectedAstronaut.diastolicBloodPressure}`} unit="mmHg" state={selectedAstronaut.healthStatus === 'Healthy' ? 'Normal' : selectedAstronaut.healthStatus} color="green"/><Vital icon={<Activity/>} label="Blood Oxygen" value={String(selectedAstronaut.oxygenSaturation)} unit="%" state={selectedAstronaut.healthStatus === 'Healthy' ? 'Normal' : selectedAstronaut.healthStatus} color="purple"/><Vital icon={<Weight/>} label="Current Weight" value={String(selectedAstronaut.weightKg)} unit="kg" state="Demo data" color="blue"/><Vital icon={<Ruler/>} label="Height" value={String(selectedAstronaut.heightCm)} unit="cm" state="Demo data" color="blue"/><Vital icon={<Activity/>} label="Diuresis (24h)" value={String(selectedAstronaut.diuresisMl24h)} unit="mL" state="Demo data" color="green"/></div><section className="card reports"><PanelTitle icon={<ClipboardList/>} title="Submitted health reports" subtitle="Latest reports from this astronaut."/><p className="empty">No health reports submitted yet.</p></section></>}
        {page === 'Report' && <><div className="page-heading"><div><h1>Health reports</h1><p>Share how you are feeling with your medical team.</p></div><div className="date-pill"><CalendarDays/>{todayLabel}</div></div><div className="report-grid"><ReportForm title="Physical health report" subtitle="Tell us about any physical symptoms." sent={physicalSent} onSubmit={() => setPhysicalSent(true)} questions={['Breathing difficulties','Chest pain','Any other pain','Dizziness','Unusually tired','Fever','Nausea']}/><ReportForm title="Psychological health report" subtitle="Let us know how you are feeling mentally." sent={psychSent} onSubmit={() => setPsychSent(true)} questions={['Feeling stressed','Experiencing anxiety','Feeling isolated or lonely','Sleeping difficulties','Changes in your mood','Feeling sad or depressed','Feeling emotionally supported']}/></div></>}
        {page === 'Messages' && <><div className="page-heading"><div><h1>Messages</h1><p>Communicate with your medical team.</p></div><div className="date-pill"><CalendarDays/>Nov 14, 2026</div></div><div className="chat-layout"><section className="chat-list"><div className="chat-list-head">Conversations <span>Contacts</span></div><button className={'chat-person '+(!chatWithAI?'chosen':'')} onClick={() => setChatWithAI(false)}><div className="avatar">SM</div><div><b>Dr. Sarah Mitchell</b><small>Assigned medical officer</small></div><i className="online"/></button><button className={'chat-person '+(chatWithAI?'chosen':'')} onClick={() => setChatWithAI(true)}><div className="bot-avatar">✦</div><div><b>AstroCare AI</b><small>Health status checker</small></div></button></section><section className="chat"><div className="chat-head"><div className={chatWithAI?'bot-avatar':'avatar'}>{chatWithAI?'✦':'SM'}</div><div><b>{chatWithAI?'AstroCare AI':'Dr. Sarah Mitchell'}</b><small>{chatWithAI?'Health status checker · Demo':<>Medical Officer · <i className="online"/> Online</>}</small></div></div><div className="chat-history">{chatWithAI ? <div className="bubble received">Ask “Is my health good?” to check your latest demo vital status.<small>AstroCare AI</small></div> : <div className="bubble received">Welcome aboard. How are you feeling today?<small>9:15 AM</small></div>}{messages.map((m,i) => <div className={'bubble '+(chatWithAI && i%2===1?'received':'sent')} key={i}>{m}<small>{chatWithAI && i%2===1?'AstroCare AI':'9:18 AM · Demo'}</small></div>)}</div><form className="composer" onSubmit={sendMessage}><input value={message} onChange={e => setMessage(e.target.value)} placeholder={chatWithAI?'Ask: Is my health good?':'Type your message...'}/><button aria-label="Send message">➤</button></form></section></div></>}
      </div>
    </main>
  </div>;
}

function AstroLogo() { return <svg className="astro-logo" viewBox="0 0 64 64" role="img" aria-label="Earth with an orbital heartbeat">
  <defs>
    <linearGradient id="earth-fill" x1=".15" y1="0" x2=".85" y2="1"><stop stopColor="#123a78"/><stop offset=".58" stopColor="#0877c9"/><stop offset="1" stopColor="#071a42"/></linearGradient>
    <clipPath id="earth-clip"><circle cx="32" cy="32" r="17"/></clipPath>
  </defs>
  <ellipse className="logo-orbit-back" cx="32" cy="32" rx="28" ry="11" transform="rotate(-28 32 32)"/>
  <circle className="logo-earth" cx="32" cy="32" r="17" fill="url(#earth-fill)"/>
  <g className="logo-land" clipPath="url(#earth-clip)"><path d="M20 20l7-3 4 3-2 4 4 2-2 4-5 1-2 6-4 2-2-6-4-3 2-5-1-4zM39 30l5-3 6 3 2 5-4 2-1 5-5 3-3-5-4-2 1-5z"/></g>
  <path className="logo-pulse" d="M5 34h15l4-6 5 13 6-19 5 15 4-7 4 4h16"/>
  <path className="logo-orbit-front" d="M8 43c8 5 19 7 30 4 12-3 20-10 23-17"/>
  <circle className="logo-star" cx="54" cy="12" r="2"/>
</svg>; }
function AstronautIllustration() { return <svg className="astronaut-illustration" viewBox="0 0 240 330" role="img" aria-label="Astronaut in a spacesuit being scanned">
  <defs>
    <linearGradient id="suit-shell" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5fcff"/><stop offset=".5" stopColor="#a9cbe3"/><stop offset="1" stopColor="#51799e"/></linearGradient>
    <linearGradient id="visor-glass" x1=".15" y1="0" x2=".9" y2="1"><stop stopColor="#173c6b"/><stop offset=".48" stopColor="#07172f"/><stop offset="1" stopColor="#03101f"/></linearGradient>
    <linearGradient id="visor-glint" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#92efff" stopOpacity=".78"/><stop offset="1" stopColor="#35aaff" stopOpacity="0"/></linearGradient>
    <filter id="suit-glow" x="-.3" y="-.2" width="1.6" height="1.5"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse cx="120" cy="310" rx="67" ry="10" fill="#0aaeff" opacity=".16"/>
  <path d="M82 211l-4 72q0 12 13 13l17 1 8-75M158 211l4 72q0 12-13 13l-17 1-8-75" fill="url(#suit-shell)" stroke="#92deff" strokeWidth="2"/>
  <path d="M76 282q-12 9-10 20l4 8q20 4 39-3l2-10-8-9M164 282q12 9 10 20l-4 8q-20 4-39-3l-2-10 8-9" fill="#7fa8c9" stroke="#b7ebff" strokeWidth="2"/>
  <rect x="49" y="143" width="38" height="92" rx="17" fill="#597a9a" stroke="#80dcff" strokeWidth="2"/>
  <path d="M86 145q-28 6-34 34l-9 50q-3 15 8 18 10 2 15-12l16-34M154 145q28 6 34 34l9 50q3 15-8 18-10 2-15-12l-16-34" fill="url(#suit-shell)" stroke="#9ce5ff" strokeWidth="2.5"/>
  <circle cx="47" cy="243" r="13" fill="#b8d3e6" stroke="#52d9ff" strokeWidth="2"/><circle cx="193" cy="243" r="13" fill="#b8d3e6" stroke="#52d9ff" strokeWidth="2"/>
  <path d="M76 150q44-26 88 0l13 66q-57 34-114 0z" fill="url(#suit-shell)" stroke="#b9edff" strokeWidth="2"/>
  <path d="M92 151h56l8 17H84z" fill="#6489a9" stroke="#c9f3ff" strokeWidth="2"/>
  <rect x="91" y="172" width="58" height="44" rx="9" fill="#102e4e" stroke="#6ce5ff" strokeWidth="2" filter="url(#suit-glow)"/>
  <path d="M97 196h12l4-8 6 17 7-23 6 17 4-7 5 4h3" fill="none" stroke="#aaffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="102" cy="182" r="2" fill="#4ef0ff"/><circle cx="138" cy="205" r="2" fill="#4ef0ff"/>
  <circle cx="120" cy="84" r="58" fill="#7f9fb9" stroke="#d5f7ff" strokeWidth="3" filter="url(#suit-glow)"/>
  <circle cx="120" cy="84" r="49" fill="#142c48" stroke="#49dfff" strokeWidth="2"/>
  <circle cx="120" cy="84" r="42" fill="url(#visor-glass)" stroke="#8feaff" strokeWidth="1.5"/>
  <path d="M91 77q15-27 43-24 13 2 22 12-22-8-42 1-12 5-23 16z" fill="url(#visor-glint)" opacity=".8"/>
  <path d="M91 99q13 12 28 13" fill="none" stroke="#50dfff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"/>
  <path d="M74 125q46 25 92 0" fill="none" stroke="#dbf7ff" strokeWidth="4"/>
  <path d="M82 151l-9 14 16 5 9-17M158 153l9 12-16 5-9-17" fill="#d9edf7" stroke="#8ce7ff" strokeWidth="2"/>
  <path d="M57 186l13 4-4 15-14-2zM170 186l13 4 4 13-14 2z" fill="#167fc3" stroke="#83e9ff" strokeWidth="1.5"/>
</svg>; }

function Vital({ icon, label, value, unit, state, color }: { icon: ReactNode; label: string; value: string; unit: string; state: string; color: string }) { const stateClass = state === 'Normal' ? 'good' : state === 'Critical' ? 'danger' : state === 'Demo data' ? 'info' : 'warn'; return <div className="vital-card"><div className="vital-title"><span className={'metric-icon '+color}>{icon}</span><b>{label}</b></div><div className="vital-value">{value}<small>{unit}</small></div><div className={'vital-state '+stateClass}><i/>{state}</div><div className={'spark '+color}><span/></div></div>; }
function PanelTitle({ icon, title, subtitle, optional }: { icon: ReactNode; title: string; subtitle: string; optional?: boolean }) { return <div className="panel-title"><span className="panel-icon">{icon}</span><div><h2>{title}</h2><p>{subtitle}</p></div>{optional && <small>OPTIONAL</small>}</div>; }
function Status({ status }: { status: string }) { return <span className={'status-pill '+(status === 'Healthy' ? 'healthy' : status === 'Critical' ? 'critical' : 'attention')}><i/>{status}</span>; }
function initials(name: string) { return name.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join(''); }
function Summary({ value, label, green, amber, red }: { value: string; label: string; green?: boolean; amber?: boolean; red?: boolean }) { return <div className={'summary '+(green?'sum-green':amber?'sum-amber':red?'sum-red':'')}><strong>{value}</strong><span>{label}</span></div>; }
function ReportForm({ title, subtitle, questions, sent, onSubmit }: { title: string; subtitle: string; questions: string[]; sent: boolean; onSubmit: () => void }) { return <form className="card report-form" onSubmit={e => { e.preventDefault(); onSubmit(); }}><PanelTitle icon={<HeartPulse/>} title={title} subtitle={subtitle}/>{questions.map((q,i) => <div className="question" key={q}><div><b>{q}?</b>{(i===2 || i===0) && <small>How severe? <select><option>Select severity</option><option>Mild</option><option>Moderate</option><option>Severe</option></select></small>}</div><div className="radios"><label><input type="radio" name={title+q} required/> Yes</label><label><input type="radio" name={title+q}/> No</label></div></div>)}<button className="primary-btn">{sent ? <Check/> : <ClipboardList/>}{sent ? 'Report submitted' : 'Submit report'}</button></form>; }
