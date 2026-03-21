import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Heart, Settings, Shield, AlertTriangle, Camera, ArrowLeft, 
  Check, Info, Eye, EyeOff, Trash2, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('snjvni-name') || 'Vaibhav';
  
  // -- STATES --
  const [activeSection, setActiveSection] = useState('personal');
  const [editMode, setEditMode] = useState({
    personal: false, health: false, preferences: false, security: false
  });
  const [saving, setSaving] = useState({
    personal: false, health: false, preferences: false, security: false
  });
  const [saved, setSaved] = useState({
    personal: false, health: false, preferences: false, security: false
  });
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // -- FORM DATA --
  const [data, setData] = useState({
    firstName: userName,
    lastName: 'Chauhan',
    email: 'vaibhav@example.com',
    dob: '1982-06-15',
    sex: 'Male',
    height: '175',
    heightUnit: 'cm',
    weight: '72',
    weightUnit: 'kg',
    ethnicity: 'South Asian',

    conditions: ['Hypertension'],
    medications: ['Amlodipine'],
    allergies: 'None',
    pregnant: false,
    familyHistory: ['Diabetes', 'Heart Disease'],

    language: 'English',
    units: 'Metric',
    visibility: 'Only me',
    emailNotifs: true,
    weeklyDigest: true,
  });

  // -- UI STATES --
  const [medInput, setMedInput] = useState('');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [modals, setModals] = useState({ reports: false, account: false });
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // -- SCROLL SPY --
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" });

    document.querySelectorAll('section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // -- HANDLERS --
  const handleSave = (section) => {
    setSaving(p => ({ ...p, [section]: true }));
    setTimeout(() => {
      setSaving(p => ({ ...p, [section]: false }));
      setSaved(p => ({ ...p, [section]: true }));
      setEditMode(p => ({ ...p, [section]: false }));
      showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
      setTimeout(() => setSaved(p => ({ ...p, [section]: false })), 2000);
    }, 1000);
  };

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 3000);
  };

  const handleArrayToggle = (key, val) => {
    if (!editMode.health) return;
    setData(prev => {
      const arr = prev[key];
      if (val === 'None') return { ...prev, [key]: ['None'] };
      const newArr = arr.includes(val) ? arr.filter(i => i !== val) : [...arr.filter(i => i !== 'None'), val];
      return { ...prev, [key]: newArr.length ? newArr : ['None'] };
    });
  };

  const addMedication = (med) => {
    if (!editMode.health) return;
    if (med && !data.medications.includes(med)) {
      setData(p => ({ ...p, medications: [...p.medications, med] }));
    }
    setMedInput('');
  };

  const removeMedication = (med) => {
    if (!editMode.health) return;
    setData(p => ({ ...p, medications: p.medications.filter(m => m !== med) }));
  };

  // -- PASSWORD STRENGTH --
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-[#E5E7EB]' };
    let c = 0;
    if (pass.length >= 8) c++;
    if (/[A-Z]/.test(pass)) c++;
    if (/\d/.test(pass)) c++;
    if (/[^A-Za-z0-9]/.test(pass)) c++;
    if (c <= 1) return { score: 1, label: 'Weak', color: 'bg-[#DC2626]' };
    if (c === 2) return { score: 2, label: 'Fair', color: 'bg-[#D97706]' };
    if (c === 3) return { score: 3, label: 'Good', color: 'bg-[#0D9488]' };
    return { score: 4, label: 'Strong', color: 'bg-[#0F6E56]' };
  };
  const pwdStrength = getStrength(passwords.new);

  // -- REUSABLE COMPONENTS --
  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => scrollTo(id)}
      className={`w-full h-[38px] rounded-[8px] px-3 flex items-center gap-[10px] text-[13px] transition-all duration-150 outline-none
      ${activeSection === id ? 'bg-[#F0FDFA] text-[#0F6E56] font-semibold border-l-2 border-[#0F6E56]' : 'bg-transparent text-[#475569] font-medium hover:bg-[#F8FFFE] hover:text-[#0D9488]'}`}
    >
      <Icon size={16} className={activeSection === id ? 'text-[#0F6E56]' : 'text-[#94A3B8] group-hover:text-[#0D9488]'} />
      {label}
    </button>
  );

  const SectionHeader = ({ id, icon: Icon, title }) => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-[10px]">
        <Icon size={20} className="text-[#0D9488]" />
        <h2 className="text-[16px] font-semibold text-[#0F172A]">{title}</h2>
      </div>
      <div className="flex gap-2">
        {editMode[id] ? (
          <>
            <button onClick={() => setEditMode(p => ({ ...p, [id]: false }))} className="bg-white border border-[#E2E8F0] rounded-[6px] px-[14px] py-[5px] text-[13px] font-medium text-[#475569] hover:border-[#0D9488] hover:text-[#0D9488] transition-colors">
              Cancel
            </button>
            <button onClick={() => handleSave(id)} disabled={saving[id]} className="bg-[#0F6E56] text-white rounded-[6px] px-[16px] py-[5px] text-[13px] font-semibold hover:bg-[#085041] transition-colors flex items-center gap-2 disabled:opacity-80">
              {saving[id] ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : saved[id] ? <><Check size={14} /> Saved!</> : 'Save changes'}
            </button>
          </>
        ) : (
          <button onClick={() => setEditMode(p => ({ ...p, [id]: true }))} className="bg-white border border-[#E2E8F0] rounded-[6px] px-[14px] py-[5px] text-[13px] font-medium text-[#475569] hover:border-[#0D9488] hover:text-[#0D9488] transition-colors outline-none">
            Edit
          </button>
        )}
      </div>
    </div>
  );

  const Field = ({ label, id, value, onChange, type = "text", section, isSelect, options }) => {
    const editing = editMode[section];
    return (
      <div className="flex flex-col gap-[6px]">
        <label className="text-[12px] font-medium text-[#475569]">{label}</label>
        {isSelect ? (
          <select
            disabled={!editing}
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full rounded-[8px] px-3 py-[10px] text-[14px] appearance-none outline-none transition-all
            ${editing ? 'bg-white border border-[#D1D5DB] text-[#0F172A] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10 cursor-pointer' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] pointer-events-none'}`}
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            readOnly={!editing}
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full rounded-[8px] px-3 py-[10px] text-[14px] outline-none transition-all
            ${editing ? 'bg-white border border-[#D1D5DB] text-[#0F172A] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] pointer-events-none'}`}
          />
        )}
      </div>
    );
  };

  const Toggle = ({ checked, onChange, disabled }) => (
    <button 
      type="button" 
      disabled={disabled}
      onClick={() => onChange(!checked)} 
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 outline-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${checked ? 'bg-[#D97706]' : 'bg-[#E2E8F0]'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200 shadow-sm ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FFFFFF] font-body overflow-hidden">
      
      {/* -- ANIMATIONS -- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (prefers-reduced-motion: no-preference) {
          .anim-sidebar { animation: slideInX 0.3s ease-out forwards; }
          .anim-card { animation: slideInY 0.35s ease-out forwards; opacity: 0; }
          .anim-modal { animation: popIn 0.2s ease-out forwards; }
          .anim-toast { animation: slideUpToast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          
          @keyframes slideInX { from { transform: translateX(-16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes slideInY { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes popIn { from { transform: translate(-50%, -46%) scale(0.95); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
          @keyframes slideUpToast { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        }
      `}} />

      {/* -- LEFT SIDEBAR (Desktop) -- */}
      <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-[#E2E8F0] bg-white p-6 pt-24 anim-sidebar">
        {/* User Block */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group w-16 h-16 rounded-full bg-[#F0FDFA] border-2 border-[#CCFBF1] flex items-center justify-center mb-3">
            <span className="text-[22px] font-bold text-[#0F6E56]">{data.firstName.charAt(0)}</span>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera size={16} className="text-white" />
            </div>
          </div>
          <span className="text-[14px] font-semibold text-[#0F172A]">{data.firstName} {data.lastName}</span>
          <span className="text-[11px] text-[#94A3B8] mt-0.5">{data.email}</span>
          <div className="inline-flex items-center gap-1 bg-[#F0FDFA] border border-[#CCFBF1] rounded-full px-2.5 py-0.5 mt-2">
            <Heart size={10} className="text-[#0F6E56]" />
            <span className="text-[11px] font-medium text-[#0F6E56]">Score: 8.2/10</span>
          </div>
        </div>

        <div className="w-full h-px bg-[#E2E8F0] my-5"></div>

        {/* Navigation */}
        <nav className="flex flex-col gap-[2px]">
          <NavItem id="personal" icon={User} label="Personal details" />
          <NavItem id="health" icon={Heart} label="Health context" />
          <NavItem id="preferences" icon={Settings} label="Preferences" />
          <NavItem id="security" icon={Shield} label="Security" />
          <NavItem id="danger" icon={AlertTriangle} label="Danger zone" />
        </nav>

        <button onClick={() => navigate('/dashboard')} className="mt-auto flex items-center justify-center gap-2 w-full border border-[#E2E8F0] bg-white text-[#475569] text-[12px] font-medium rounded-[8px] py-2 hover:border-[#0D9488] hover:text-[#0D9488] transition-colors outline-none">
          <ArrowLeft size={14} /> Dashboard
        </button>
      </aside>

      {/* -- MOBILE TABS -- */}
      <div className="md:hidden fixed top-[64px] left-0 w-full bg-white border-b border-[#E2E8F0] px-4 flex overflow-x-auto z-40 hide-scrollbar">
        {[{id:'personal', l:'Personal'},{id:'health', l:'Health'},{id:'preferences', l:'Prefs'},{id:'security', l:'Security'},{id:'danger', l:'Danger'}].map(t => (
          <button key={t.id} onClick={() => scrollTo(t.id)} className={`px-4 py-3 text-[13px] whitespace-nowrap transition-colors outline-none ${activeSection === t.id ? 'text-[#0F6E56] font-semibold border-b-2 border-[#0F6E56]' : 'text-[#6B7280]'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* -- RIGHT CONTENT -- */}
      <main className="flex-1 overflow-y-auto w-full pt-[124px] pb-24 md:pt-24 px-4 sm:px-8 md:px-12 scroll-smooth">
        <div className="max-w-[860px] mx-auto w-full flex flex-col gap-5">

          {/* 1. PERSONAL DETAILS */}
          <section id="personal" className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] anim-card scroll-mt-20 shrink-0" style={{ animationDelay: '0.0s' }}>
            <SectionHeader id="personal" icon={User} title="Personal details" />
            <div className="w-full h-px bg-[#E2E8F0] my-4"></div>
            
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#F0FDFA] border-2 border-[#CCFBF1] flex items-center justify-center text-[28px] font-bold text-[#0F6E56] shrink-0">
                {data.firstName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[#0F172A]">Profile photo</span>
                <span className="text-[11px] text-[#94A3B8] mt-0.5">JPG or PNG, max 2MB</span>
                <div className="flex items-center gap-2 mt-2">
                  <button disabled={!editMode.personal} className="border border-[#0D9488] text-[#0D9488] bg-white rounded-[6px] px-3 py-1 text-[12px] font-medium disabled:opacity-50">Upload photo</button>
                  <button disabled={!editMode.personal} className="text-[#DC2626] text-[12px] font-medium bg-transparent px-2 disabled:opacity-50">Remove</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-5">
              <Field label="First Name" section="personal" value={data.firstName} onChange={v => setData({...data, firstName: v})} />
              <Field label="Last Name" section="personal" value={data.lastName} onChange={v => setData({...data, lastName: v})} />
              <div className="sm:col-span-2">
                <Field label="Email" section="personal" type="email" value={data.email} onChange={v => setData({...data, email: v})} />
              </div>
              <Field label="Date of Birth" section="personal" type="date" value={data.dob} onChange={v => setData({...data, dob: v})} />
              <Field label="Biological Sex" section="personal" isSelect options={['Male', 'Female', 'Prefer not to say']} value={data.sex} onChange={v => setData({...data, sex: v})} />
              
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium text-[#475569]">Height</label>
                <div className="flex gap-2">
                  <input type="text" readOnly={!editMode.personal} value={data.height} onChange={e => setData({...data, height: e.target.value})} className={`w-full rounded-[8px] px-3 py-[10px] text-[14px] outline-none transition-all ${editMode.personal ? 'bg-white border border-[#D1D5DB] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`} />
                  <div className="flex bg-[#F1F5F9] p-0.5 rounded-[6px] shrink-0">
                    <button disabled={!editMode.personal} onClick={() => setData({...data, heightUnit:'cm'})} className={`px-2 py-0.5 text-[11px] rounded-[4px] font-medium ${data.heightUnit==='cm' ? 'bg-[#0F6E56] text-white' : 'text-[#6B7280]'}`}>cm</button>
                    <button disabled={!editMode.personal} onClick={() => setData({...data, heightUnit:'ft'})} className={`px-2 py-0.5 text-[11px] rounded-[4px] font-medium ${data.heightUnit==='ft' ? 'bg-[#0F6E56] text-white' : 'text-[#6B7280]'}`}>ft</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium text-[#475569]">Weight</label>
                <div className="flex gap-2">
                  <input type="text" readOnly={!editMode.personal} value={data.weight} onChange={e => setData({...data, weight: e.target.value})} className={`w-full rounded-[8px] px-3 py-[10px] text-[14px] outline-none transition-all ${editMode.personal ? 'bg-white border border-[#D1D5DB] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`} />
                  <div className="flex bg-[#F1F5F9] p-0.5 rounded-[6px] shrink-0">
                    <button disabled={!editMode.personal} onClick={() => setData({...data, weightUnit:'kg'})} className={`px-2 py-0.5 text-[11px] rounded-[4px] font-medium ${data.weightUnit==='kg' ? 'bg-[#0F6E56] text-white' : 'text-[#6B7280]'}`}>kg</button>
                    <button disabled={!editMode.personal} onClick={() => setData({...data, weightUnit:'lbs'})} className={`px-2 py-0.5 text-[11px] rounded-[4px] font-medium ${data.weightUnit==='lbs' ? 'bg-[#0F6E56] text-white' : 'text-[#6B7280]'}`}>lbs</button>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <Field label="Ethnicity (Optional)" section="personal" isSelect options={['South Asian', 'East Asian', 'African', 'Hispanic', 'White', 'Mixed', 'Prefer not to say']} value={data.ethnicity} onChange={v => setData({...data, ethnicity: v})} />
              </div>
            </div>
          </section>

          {/* 2. HEALTH CONTEXT */}
          <section id="health" className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] anim-card scroll-mt-20 shrink-0" style={{ animationDelay: '0.08s' }}>
            <SectionHeader id="health" icon={Heart} title="Health context" />
            <div className="w-full h-px bg-[#E2E8F0] my-4"></div>

            {/* A. Conditions */}
            <div className="pb-5 border-b border-[#F1F5F9] mb-5">
              <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-1">Existing Conditions</span>
              <span className="block text-[11px] text-[#94A3B8] mb-3">Affects your biomarker reference ranges</span>
              <div className="flex flex-wrap gap-2">
                {['Type 2 Diabetes', 'Type 1 Diabetes', 'Hypertension', 'Hypothyroidism', 'Hyperthyroidism', 'High Cholesterol', 'Anaemia', 'PCOS', 'Asthma', 'Kidney Disease', 'Liver Disease', 'Heart Disease', 'None'].map(cond => {
                  const active = data.conditions.includes(cond);
                  return (
                    <button key={cond} disabled={!editMode.health} onClick={() => handleArrayToggle('conditions', cond)} className={`px-[14px] py-[6px] text-[12px] rounded-[20px] transition-colors border outline-none disabled:opacity-80 ${active ? 'bg-[#F0FDFA] border-[#0D9488] text-[#0F6E56] font-medium' : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-[#F8FFFE]'}`}>
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Medications */}
            <div className="pb-5 border-b border-[#F1F5F9] mb-5">
              <div className="flex items-center gap-1.5 mb-3 group relative w-max">
                <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">Current Medications</span>
                <Info size={12} className="text-[#94A3B8] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[200px] bg-[#0F172A] text-white text-[11px] p-2.5 rounded-[8px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center pointer-events-none">
                  Medications can affect test results — we use this for more accurate analysis
                </div>
              </div>
              <div className={`w-full min-h-[44px] rounded-[8px] p-1.5 flex flex-wrap gap-1.5 items-center transition-all ${editMode.health ? 'bg-white border border-[#D1D5DB] focus-within:border-[#0D9488] focus-within:ring-[3px] focus-within:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`}>
                {data.medications.map(med => (
                  <div key={med} className="flex items-center gap-1 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F6E56] text-[12px] px-2 py-0.5 rounded-[6px]">
                    {med} {editMode.health && <X size={12} className="text-[#0D9488] cursor-pointer hover:text-[#0F6E56]" onClick={() => removeMedication(med)} />}
                  </div>
                ))}
                {editMode.health && (
                  <input type="text" value={medInput} onChange={e => setMedInput(e.target.value)} onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); addMedication(medInput); } }} placeholder="Type and press Enter" className="flex-1 min-w-[120px] bg-transparent text-[13px] text-[#0F172A] outline-none px-1" />
                )}
              </div>
              <div className="flex items-center flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-[#94A3B8] mr-1">Common:</span>
                {['Metformin', 'Levothyroxine', 'Atorvastatin', 'Aspirin', 'Omeprazole'].map(med => (
                  <button key={med} disabled={!editMode.health} onClick={() => addMedication(med)} className="border border-dashed border-[#D1D5DB] bg-white text-[#6B7280] px-2 py-0.5 rounded-[4px] text-[11px] hover:border-[#0D9488] hover:text-[#0D9488] transition-colors disabled:opacity-50">
                    {med}
                  </button>
                ))}
              </div>
            </div>

            {/* C. Allergies */}
            <div className="pb-5 border-b border-[#F1F5F9] mb-5">
              <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-2">Allergies</span>
              <input type="text" placeholder="e.g. Penicillin, Sulfa drugs, Latex" readOnly={!editMode.health} value={data.allergies} onChange={e => setData({...data, allergies: e.target.value})} className={`w-full rounded-[8px] px-3 py-[10px] text-[14px] outline-none transition-all ${editMode.health ? 'bg-white border border-[#D1D5DB] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`} />
            </div>

            {/* D. Pregnancy (Female only) */}
            {data.sex === 'Female' && (
              <div className="pb-5 border-b border-[#F1F5F9] mb-5">
                <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-2">Pregnancy Status</span>
                <div className="flex items-center justify-between p-3 sm:px-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-[10px]">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#0F172A]">Currently pregnant</span>
                    <span className="text-[11px] text-[#94A3B8]">Significantly affects reference ranges</span>
                  </div>
                  <Toggle checked={data.pregnant} onChange={v => setData({...data, pregnant: v})} disabled={!editMode.health} />
                </div>
                {data.pregnant && (
                  <div className="mt-3 bg-[#FFFBEB] border border-[#FDE68A] p-2.5 rounded-[8px] flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[#D97706]" />
                    <span className="text-[12px] text-[#92400E]">Your analysis will be adjusted for pregnancy.</span>
                  </div>
                )}
              </div>
            )}

            {/* E. Family History */}
            <div>
              <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-3">Family History (Optional)</span>
              <div className="flex flex-wrap gap-2">
                {['Diabetes', 'Heart Disease', 'Cancer', 'Hypertension', 'Thyroid disorders', 'Stroke', 'None'].map(cond => {
                  const active = data.familyHistory.includes(cond);
                  return (
                    <button key={cond} disabled={!editMode.health} onClick={() => handleArrayToggle('familyHistory', cond)} className={`px-[14px] py-[6px] text-[12px] rounded-[20px] transition-colors border outline-none disabled:opacity-80 ${active ? 'bg-[#F0FDFA] border-[#0D9488] text-[#0F6E56] font-medium' : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-[#F8FFFE]'}`}>
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. PREFERENCES */}
          <section id="preferences" className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] anim-card scroll-mt-20 shrink-0" style={{ animationDelay: '0.16s' }}>
            <SectionHeader id="preferences" icon={Settings} title="Preferences" />
            <div className="w-full h-px bg-[#E2E8F0] my-4"></div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center py-3.5 border-b border-[#F1F5F9]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">AI output language</span>
                  <span className="text-[12px] text-[#94A3B8] mt-0.5 hidden sm:block">Reports will be explained in this language</span>
                </div>
                <select disabled={!editMode.preferences} value={data.language} onChange={e=>setData({...data, language:e.target.value})} className={`w-[120px] sm:w-[160px] rounded-[8px] px-3 py-2 text-[13px] outline-none ${editMode.preferences ? 'bg-white border border-[#D1D5DB] cursor-pointer' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`}>
                  {['English', 'हिंदी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी', 'ગુજરાતી'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex justify-between items-center py-3.5 border-b border-[#F1F5F9]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Measurement units</span>
                  <span className="text-[12px] text-[#94A3B8] mt-0.5 hidden sm:block">Height, weight, and lab values</span>
                </div>
                <div className="flex bg-[#F1F5F9] p-0.5 rounded-[8px]">
                  <button disabled={!editMode.preferences} onClick={() => setData({...data, units:'Metric'})} className={`px-3 py-1 text-[11px] rounded-[6px] font-medium ${data.units==='Metric' ? 'bg-[#0F6E56] text-white' : 'text-[#6B7280]'}`}>Metric · kg, cm</button>
                  <button disabled={!editMode.preferences} onClick={() => setData({...data, units:'Imperial'})} className={`px-3 py-1 text-[11px] rounded-[6px] font-medium ${data.units==='Imperial' ? 'bg-[#0F6E56] text-white' : 'text-[#6B7280]'}`}>Imperial · lbs, ft</button>
                </div>
              </div>

              <div className="flex justify-between items-center py-3.5 border-b border-[#F1F5F9]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Report sharing</span>
                  <span className="text-[12px] text-[#94A3B8] mt-0.5 hidden sm:block">Who can open your shared report links</span>
                </div>
                <select disabled={!editMode.preferences} value={data.visibility} onChange={e=>setData({...data, visibility:e.target.value})} className={`w-[140px] sm:w-[160px] rounded-[8px] px-3 py-2 text-[13px] outline-none ${editMode.preferences ? 'bg-white border border-[#D1D5DB] cursor-pointer' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`}>
                  <option value="Only me">Only me</option>
                  <option value="Anyone with link">Anyone with link</option>
                  <option value="doctor" disabled>My doctor (soon)</option>
                </select>
              </div>

              <div className="flex justify-between items-center py-3.5 border-b border-[#F1F5F9]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Email notifications</span>
                  <span className="text-[12px] text-[#94A3B8] mt-0.5 hidden sm:block">Reminders and health alerts via email</span>
                </div>
                <Toggle checked={data.emailNotifs} onChange={v => setData({...data, emailNotifs:v})} disabled={!editMode.preferences} />
              </div>

              <div className="flex justify-between items-center py-3.5">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Weekly health digest</span>
                  <span className="text-[12px] text-[#94A3B8] mt-0.5 hidden sm:block">Health summary every Sunday morning</span>
                </div>
                <Toggle checked={data.weeklyDigest} onChange={v => setData({...data, weeklyDigest:v})} disabled={!editMode.preferences} />
              </div>
            </div>
          </section>

          {/* 4. SECURITY */}
          <section id="security" className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] anim-card scroll-mt-20 shrink-0" style={{ animationDelay: '0.24s' }}>
            <SectionHeader id="security" icon={Shield} title="Security" />
            <div className="w-full h-px bg-[#E2E8F0] my-4"></div>

            <div className="mb-6">
              <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-4">Change Password</span>
              <div className="flex flex-col gap-3 max-w-sm">
                <div className="relative">
                  <input type={showPassword.current ? "text" : "password"} placeholder="Current password" disabled={!editMode.security} value={passwords.current} onChange={e=>setPasswords({...passwords, current: e.target.value})} className={`w-full rounded-[8px] px-3 py-[9px] text-[13px] outline-none pr-10 ${editMode.security ? 'bg-white border border-[#D1D5DB] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`} />
                  <button disabled={!editMode.security} onClick={()=>setShowPassword({...showPassword, current: !showPassword.current})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    {showPassword.current ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                <div>
                  <div className="relative">
                    <input type={showPassword.new ? "text" : "password"} placeholder="New password" disabled={!editMode.security} value={passwords.new} onChange={e=>setPasswords({...passwords, new: e.target.value})} className={`w-full rounded-[8px] px-3 py-[9px] text-[13px] outline-none pr-10 ${editMode.security ? 'bg-white border border-[#D1D5DB] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`} />
                    <button disabled={!editMode.security} onClick={()=>setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      {showPassword.new ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  {editMode.security && passwords.new.length > 0 && (
                    <div className="mt-1.5 flex gap-1 items-center">
                      <div className="flex gap-[3px] flex-1 h-[3px]">
                        {[1,2,3,4].map(i => <div key={i} className={`flex-1 rounded-[2px] transition-colors ${pwdStrength.score >= i ? pwdStrength.color : 'bg-[#E5E7EB]'}`} />)}
                      </div>
                      <span className={`text-[11px] font-medium ml-1 flex-shrink-0 min-w-[36px] ${pwdStrength.color.replace('bg-', 'text-')}`}>{pwdStrength.label}</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input type={showPassword.confirm ? "text" : "password"} placeholder="Confirm new password" disabled={!editMode.security} value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm: e.target.value})} className={`w-full rounded-[8px] px-3 py-[9px] text-[13px] outline-none pr-10 ${editMode.security ? 'bg-white border border-[#D1D5DB] focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10' : 'bg-[#F8FAFC] border border-[#E2E8F0] pointer-events-none'}`} />
                  <button disabled={!editMode.security} onClick={()=>setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    {showPassword.confirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                {editMode.security && (
                  <button className="bg-[#0F6E56] text-white rounded-[8px] py-[9px] text-[13px] font-semibold w-fit px-5 mt-2 hover:bg-[#085041] transition-colors">
                    Update password
                  </button>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-[#E2E8F0] my-6"></div>

            <div>
              <span className="block text-[12px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-4">Connected Accounts</span>
              <div className="flex items-center justify-between p-3 sm:px-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-[10px]">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-[20px] h-[20px]">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.2 7l6.2 5.2C39.2 36.7 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#0F172A]">Google</span>
                    <span className="text-[12px] text-[#94A3B8] hidden sm:block">vaibhav@example.com</span>
                  </div>
                </div>
                <button className="text-[12px] text-[#DC2626] font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
                  Disconnect
                </button>
              </div>
            </div>
          </section>

          {/* 5. DANGER ZONE */}
          <section id="danger" className="bg-[#FFFFFF] border border-[#FECACA] rounded-[16px] p-5 sm:p-7 md:p-8 anim-card scroll-mt-20 shrink-0" style={{ animationDelay: '0.32s' }}>
            <div className="flex items-center gap-[10px]">
              <AlertTriangle size={20} className="text-[#DC2626]" />
              <h2 className="text-[16px] font-semibold text-[#DC2626]">Danger zone</h2>
            </div>
            <div className="w-full h-px bg-[#FEE2E2] my-4"></div>

            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-[#FEE2E2]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Download all my data</span>
                  <span className="text-[12px] text-[#6B7280] mt-0.5">Export all reports as ZIP (GDPR)</span>
                </div>
                <button className="bg-white border border-[#E2E8F0] text-[#475569] rounded-[8px] px-3.5 py-[7px] text-[12px] font-medium hover:border-[#0D9488] hover:text-[#0D9488] transition-colors w-fit sm:w-auto">
                  Download ZIP
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-[#FEE2E2]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Log out everywhere</span>
                  <span className="text-[12px] text-[#6B7280] mt-0.5">End all active sessions on all devices</span>
                </div>
                <button onClick={() => { localStorage.removeItem('snjvni-token'); window.dispatchEvent(new Event('storage')); navigate('/'); }} className="bg-white border border-[#E2E8F0] text-[#475569] rounded-[8px] px-3.5 py-[7px] text-[12px] font-medium hover:border-[#0D9488] hover:text-[#0D9488] transition-colors w-fit sm:w-auto">
                  Log out devices
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-[#FEE2E2]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#0F172A]">Delete all reports</span>
                  <span className="text-[12px] text-[#6B7280] mt-0.5">Permanently removes all reports. Cannot be undone.</span>
                </div>
                <button onClick={() => setModals({...modals, reports: true})} className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-[8px] px-3.5 py-[7px] text-[12px] font-medium hover:bg-[#FEE2E2] transition-colors w-fit sm:w-auto">
                  Delete reports
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#DC2626]">Delete account</span>
                  <span className="text-[12px] text-[#6B7280] mt-0.5">Deletes your account and all data forever.</span>
                </div>
                <button onClick={() => setModals({...modals, account: true})} className="bg-[#DC2626] text-white rounded-[8px] px-4 py-[7px] text-[12px] font-semibold hover:bg-[#B91C1C] transition-colors w-fit sm:w-auto outline-none">
                  Delete account
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* -- MODALS -- */}
      {modals.reports && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-8 max-w-[420px] w-[90%] flex flex-col items-center shadow-[0_20px_60px_rgba(0,0,0,0.15)] anim-modal absolute top-1/2 left-1/2">
            <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-[#DC2626]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0F172A] text-center">Delete all reports?</h3>
            <p className="text-[14px] text-[#475569] text-center mt-3 mb-6 leading-relaxed">
              This will permanently delete all your reports and analysis. This cannot be undone.
            </p>
            <div className="w-full flex flex-col gap-2.5">
              <button onClick={() => setModals({...modals, reports: false})} className="w-full bg-[#DC2626] text-white rounded-[8px] py-2.5 text-[14px] font-semibold hover:bg-[#B91C1C] transition-colors outline-none">
                Yes, delete all reports
              </button>
              <button onClick={() => setModals({...modals, reports: false})} className="w-full bg-white border border-[#E2E8F0] text-[#475569] rounded-[8px] py-2.5 text-[14px] font-medium hover:bg-gray-50 transition-colors outline-none">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-[16px] p-8 max-w-[420px] w-[90%] flex flex-col items-center shadow-[0_20px_60px_rgba(0,0,0,0.15)] anim-modal absolute top-1/2 left-1/2">
            <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-[#DC2626]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0F172A] text-center">Delete account?</h3>
            <p className="text-[14px] text-[#475569] text-center mt-3 mb-4 leading-relaxed">
              This will permanently delete your account and all data.
            </p>
            <div className="w-full mb-6">
              <span className="text-[12px] text-[#94A3B8] font-medium block mb-1.5">Type DELETE to confirm</span>
              <input 
                type="text" 
                placeholder="Type DELETE" 
                value={deleteConfirm} 
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-[8px] px-3 py-[10px] text-[14px] bg-white border border-[#D1D5DB] focus:border-[#DC2626] focus:ring-[3px] focus:ring-[#DC2626]/10 outline-none transition-all text-[#0F172A]"
              />
            </div>
            <div className="w-full flex flex-col gap-2.5">
              <button 
                disabled={deleteConfirm !== 'DELETE'}
                onClick={() => { setModals({...modals, account: false}); localStorage.removeItem('snjvni-token'); navigate('/'); }} 
                className="w-full text-white rounded-[8px] py-2.5 text-[14px] font-semibold transition-colors disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed bg-[#DC2626] hover:bg-[#B91C1C] outline-none"
              >
                Delete my account
              </button>
              <button onClick={() => {setModals({...modals, account: false}); setDeleteConfirm('');}} className="w-full bg-white border border-[#E2E8F0] text-[#475569] rounded-[8px] py-2.5 text-[14px] font-medium hover:bg-gray-50 transition-colors outline-none">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- TOAST -- */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white rounded-[10px] px-4 py-3 flex items-center gap-2 shadow-lg anim-toast">
          <div className={`w-2 h-2 rounded-full ${toast.isError ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`}></div>
          <span className="text-[13px] font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Profile;
