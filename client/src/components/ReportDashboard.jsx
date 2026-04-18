import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Share2, Send, Clock, Coffee, Sun, Leaf,
  AlertCircle, TrendingUp, ChevronDown, ChevronUp, Check, ArrowUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Status style helper ---
const getStatusStyle = (status) => {
  switch (status) {
    case 'critical':
      return {
        pill: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]',
        text: 'text-[#DC2626]',
        bar: 'bg-[#DC2626]',
        dot: '#DC2626',
        border: 'border-l-[#DC2626]',
        label: 'Critical',
      };
    case 'high':
      return {
        pill: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
        text: 'text-[#D97706]',
        bar: 'bg-[#D97706]',
        dot: '#D97706',
        border: 'border-l-[#D97706]',
        label: 'High',
      };
    case 'low':
      return {
        pill: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
        text: 'text-[#D97706]',
        bar: 'bg-[#D97706]',
        dot: '#D97706',
        border: 'border-l-[#D97706]',
        label: 'Low',
      };
    case 'normal':
    default:
      return {
        pill: 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
        text: 'text-[#0F172A]',
        bar: 'bg-[#0F6E56]',
        dot: '#94A3B8',
        border: 'border-l-[#E2E8F0]',
        label: 'Normal',
      };
  }
};

const getRiskColor = (score) => {
  if (score >= 7) return { text: 'text-[#DC2626]', bar: 'bg-[#DC2626]' };
  if (score >= 4) return { text: 'text-[#D97706]', bar: 'bg-[#D97706]' };
  return { text: 'text-[#0F6E56]', bar: 'bg-[#0F6E56]' };
};

const getHealthStatusColor = (status) => {
  switch (status) {
    case 'critical': return '#DC2626';
    case 'needs_attention': return '#D97706';
    case 'normal': return '#0F6E56';
    default: return '#D97706';
  }
};

const getHealthStatusText = (status) => {
  switch (status) {
    case 'critical': return 'Critical';
    case 'needs_attention': return 'Needs Attention';
    case 'normal': return 'Normal';
    default: return 'Warning';
  }
};

const getHealthBadgeBg = (status) => {
  switch (status) {
    case 'critical': return 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]';
    case 'needs_attention': return 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]';
    case 'normal': return 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]';
    default: return 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]';
  }
};

const getSeverityDotColor = (severity) => {
  switch (severity) {
    case 'critical': return '#DC2626';
    case 'warning': return '#D97706';
    case 'muted': return '#991B1B';
    default: return '#94A3B8';
  }
};

const getSeverityTextColor = (severity) => {
  switch (severity) {
    case 'critical': return 'text-[#DC2626]';
    case 'warning': return 'text-[#D97706]';
    case 'muted': return 'text-[#991B1B]';
    default: return 'text-[#94A3B8]';
  }
};

const habitIconMap = {
  clock: Clock,
  coffee: Coffee,
  sun: Sun,
  leaf: Leaf,
};

const insightIconMap = {
  'alert-circle': AlertCircle,
  'trending-up': TrendingUp,
};

// ============================================
// Resizable panel drag hook
// ============================================
const useResizable = (initialWidth, min, max, storageKey) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Math.min(max, Math.max(min, parseInt(saved, 10))) : initialWidth;
  });
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
  const direction = useRef(1);

  const persistWidth = useCallback((w) => {
    localStorage.setItem(storageKey, String(w));
  }, [storageKey]);

  const onMouseDown = useCallback((e, dir = 1) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    direction.current = dir;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev) => {
      if (!isDragging.current) return;
      const delta = (ev.clientX - startX.current) * direction.current;
      const next = Math.min(max, Math.max(min, startW.current + delta));
      setWidth(next);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setWidth((w) => { persistWidth(w); return w; });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width, min, max, persistWidth]);

  return { width, onMouseDown };
};

const ReportDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchReport = async () => {
      try {
        setLoading(true)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          return
        }

        if (!session || !session.user) {
          console.log('No session yet — waiting for auth')
          return
        }
        
        console.log('Fetching report:', id)
        console.log('API URL:', import.meta.env.VITE_API_URL)
        
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reports/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        console.log('Response status:', res.status)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('Fetch failed:', errorText)
          setError(`Failed to load report: ${res.status}`)
          setLoading(false)
          return
        }
        
        const data = await res.json()
        console.log('Report data received:', data)
        
        setReportData(data)
        setLoading(false)
        
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load report')
        setLoading(false)
      }
    }
    
    if (id) fetchReport()
  }, [id, user, authLoading])

  // --- Resizable panels ---
  const left = useResizable(220, 180, 340, 'snjvni_left_width');
  const right = useResizable(240, 200, 360, 'snjvni_right_width');

  // --- ION Chat state ---
  const [ionMessages, setIonMessages] = useState([]);
  const [ionInput, setIonInput] = useState('');
  const [ionLoading, setIonLoading] = useState(false);
  const ionEndRef = useRef(null);

  // --- Glossary expand state ---
  const [expandedTerm, setExpandedTerm] = useState(null);

  // --- Share state ---
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    ionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ionMessages, ionLoading]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const { data } = await supabase
          .from('ion_conversations')
          .select('messages')
          .eq('report_id', id)
          .single()
        
        if (data?.messages?.length > 0) {
          setIonMessages(data.messages)
        }
      } catch (err) {
        // No existing conversation — that is fine
        console.log('No existing ION conversation')
      }
    }
    
    if (id) loadChatHistory()
  }, [id])

  // Handle loading and null data gracefully after hooks
  if (authLoading || loading || !reportData) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-white">
              <div className="w-[40px] h-[40px] rounded-full border-4 border-[#F0FDFA] border-t-[#0D9488] animate-spin"></div>
          </div>
      );
  }

  const { patient, report, biomarkers, riskMagnitude, futureProjection, habits, glossary, insights } = reportData;

  const toggleTerm = (idx) => {
    setExpandedTerm((prev) => (prev === idx ? null : idx));
  };

  const sendIonMessage = async () => {
    if (!ionInput.trim() || ionLoading) return
    
    const userMessage = { 
      role: 'user', 
      content: ionInput.trim() 
    }
    
    setIonMessages(prev => [...prev, userMessage])
    const currentInput = ionInput.trim()
    setIonInput('')
    setIonLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ion/chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: currentInput,
            reportId: id,
            history: ionMessages
          })
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Chat failed')
      }

      const { reply } = await res.json()
      
      setIonMessages(prev => [...prev, {
        role: 'ion',
        content: reply
      }])

    } catch (error) {
      console.error('ION chat error:', error)
      setIonMessages(prev => [...prev, {
        role: 'ion',
        content: 'Sorry, I had trouble responding. Please try again.'
      }])
    } finally {
      setIonLoading(false)
    }
  }

  const handleShare = async () => {
    // TODO: Replace with real API call
    // const res = await fetch(`/api/reports/${report.id}/share`, { method: 'POST' })
    // const { shareUrl } = await res.json()
    const mockUrl = `https://snjvni.ai/shared/${report.id}`;
    navigator.clipboard.writeText(mockUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="antialiased overflow-hidden bg-white text-[#0F172A] min-h-screen relative font-body">
      <style dangerouslySetInnerHTML={{ __html: `
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        .custom-height { height: 100vh; }
        .text-primary-dark { color: #0F172A; }
        .text-secondary-slate { color: #475569; }
        .text-muted-slate { color: #94A3B8; }
        .bg-brand-teal { background-color: #0D9488; }
        .text-brand-teal { color: #0D9488; }
        .bg-dark-teal { background-color: #0F6E56; }
        .text-dark-teal { color: #0F6E56; }
        .bg-teal-light { background-color: #F0FDFA; }
        .border-slate-200 { border-color: #E2E8F0; }
        .drag-handle { transition: background-color 0.15s ease; }
        .drag-handle:hover { background-color: #0D9488 !important; }
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}} />

      {/* Main Content Layout */}
      <main className="flex w-full custom-height overflow-hidden bg-white">

        {/* ========== COLUMN 1: Left Panel (Glossary + Chat) ========== */}
        <aside
          className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden"
          style={{ width: `${left.width}px` }}
        >

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer" style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E2E8F0', marginBottom: '4px' }} onClick={() => navigate('/dashboard')}>
            <Heart size={20} className="text-brand-teal shrink-0" fill="#0D9488" />
            <span className="text-[15px] font-bold text-[#0F172A]" style={{ letterSpacing: '-0.3px' }}>SNJVNI.ai</span>
          </div>

          {/* Unified scrollable area: Glossary + Chat messages */}
          <div className="flex-1 overflow-y-auto flex flex-col px-4 pb-3 pt-4">
            {/* Glossary */}
            <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest pl-1 mb-3">Glossary</h3>
            <div className="space-y-1">
              {glossary.map((item, idx) => (
                <div key={idx} className="cursor-pointer group flex flex-col pt-1.5 pb-2 px-3 hover:bg-[#F8FAFC] rounded-xl transition-all" onClick={() => toggleTerm(idx)}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[12px] font-bold transition-colors ${expandedTerm === idx ? 'text-[#0F6E56]' : 'text-[#0F172A] group-hover:text-[#0D9488]'}`}>{item.term}</p>
                    {expandedTerm === idx
                      ? <ChevronUp size={14} className="text-[#0F6E56] shrink-0" />
                      : <ChevronDown size={14} className="text-[#94A3B8] group-hover:text-[#0D9488] shrink-0" />
                    }
                  </div>
                  {expandedTerm === idx && (
                    <div className="mt-2 text-[11px] text-[#475569] leading-[1.6] bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-2.5">
                      {item.definition}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat messages (flow directly below glossary) */}
            <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest pl-1 mt-6 mb-3 border-t border-[#E2E8F0] pt-4">ION Chat</h3>
            <div className="flex flex-col gap-3 px-1">
              {ionMessages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === 'user'
                      ? 'self-end bg-[#0F6E56] text-white rounded-[14px_14px_4px_14px] px-[14px] py-[10px] text-[12px] leading-[1.5] max-w-[90%] shadow-sm'
                      : 'self-start bg-white border border-[#E2E8F0] shadow-sm text-[#0F172A] rounded-[14px_14px_14px_4px] px-[14px] py-[10px] text-[12px] leading-[1.5] max-w-[90%]'
                  }
                >
                  {msg.content}
                </div>
              ))}
              {ionLoading && (
                <div className="self-start bg-white border border-[#E2E8F0] shadow-sm rounded-[14px] px-[16px] py-[14px] flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0.4s' }}></div>
                </div>
              )}
              <div ref={ionEndRef} />
            </div>
          </div>

          {/* Chat input (fixed at bottom of left panel) */}
          <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex gap-2 items-center shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <input
              className="flex-1 h-[40px] bg-white border border-[#E2E8F0] shadow-sm rounded-xl px-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 transition-all"
              placeholder="Ask SNJVNI..."
              type="text"
              value={ionInput}
              onChange={(e) => setIonInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendIonMessage(); } }}
            />
            <button
              onClick={sendIonMessage}
              disabled={!ionInput.trim()}
              className={`w-[40px] h-[40px] shadow-sm rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                ionInput.trim()
                  ? 'bg-[#0D9488] text-white hover:bg-[#0b7a70] cursor-pointer'
                  : 'bg-white border border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </aside>

        {/* Left drag handle */}
        <div
          className="drag-handle flex-shrink-0 cursor-col-resize"
          style={{ width: '4px', backgroundColor: '#E2E8F0' }}
          onMouseDown={(e) => left.onMouseDown(e, 1)}
        />

        {/* ========== COLUMN 2: Center Panel (Analysis) ========== */}
        <section className="flex-1 overflow-y-auto bg-white min-w-0">
          <div className="max-w-4xl mx-auto p-10">

            {/* CHANGE 3 — Patient Info Bar (moved from left panel) */}
            <div className="flex items-center justify-between pb-[14px] border-b border-[#E2E8F0] mb-5">
              {/* Left: avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-full bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[13px] font-semibold text-[#0F6E56]">
                  {patient.initials}
                </div>
                <div>
                  <p className="text-[16px] font-bold text-[#0F172A]">{patient.name}</p>
                  <p className="text-[12px] text-[#94A3B8] mt-[2px]">{patient.age} • {patient.sex}</p>
                </div>
              </div>

              {/* Right: health score + flagged markers */}
              <div className="flex bg-white rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-1.5 items-center gap-3">
                {/* Score Badge */}
                <div
                  className="w-[52px] h-[52px] rounded-[12px] flex flex-col items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${getHealthStatusColor(patient.healthStatus)}15`,
                    color: getHealthStatusColor(patient.healthStatus),
                  }}
                >
                  <span className="text-[20px] font-extrabold leading-none tracking-tight">{patient.healthScore}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-80 mt-1">Score</span>
                </div>

                {/* Status Block */}
                <div className="flex flex-col items-start gap-1 pr-3 py-1">
                  <div className={`px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.05em] rounded-[6px] ${getHealthBadgeBg(patient.healthStatus)}`}>
                    {getHealthStatusText(patient.healthStatus)}
                  </div>
                  <span className="text-[11px] text-[#64748B] font-medium leading-tight mt-[1px]">
                    <strong className="text-[#0F172A] font-semibold">{report.flaggedCount}</strong> flags out of {report.totalMarkers}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Header */}
            <header className="mb-8 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-brand-teal tracking-widest uppercase mb-1">
                  {report.type}
                </p>
                <h1 className="text-xl font-bold text-primary-dark tracking-tight">
                  {report.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-slate uppercase mb-1">Report Date</p>
                <p className="text-sm font-semibold text-primary-dark">{report.date}</p>
              </div>
            </header>

            {/* Risk Alert Banner — only when critical */}
            {report.hasCritical && (
              <div className="bg-[#FFFBEB] border-l-[3px] border-[#D97706] p-4 rounded-r-lg mb-8 flex items-start gap-3">
                <AlertCircle size={20} className="text-[#D97706] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#92400E]">{report.criticalMessage}</p>
                  <p className="text-xs text-[#B45309] mt-0.5 leading-relaxed">{report.criticalDetail}</p>
                </div>
              </div>
            )}

            {/* Biomarker Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-8 bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-muted-slate uppercase tracking-wider">Biomarker</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-muted-slate uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-muted-slate uppercase tracking-wider">Range</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-muted-slate uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {biomarkers.map((marker) => {
                    const style = getStatusStyle(marker.status);
                    return (
                      <tr key={marker.id} className="h-[56px] bg-white">
                        <td className="px-6">
                          <p className="text-[13px] font-semibold text-primary-dark">{marker.name}</p>
                          <p className="text-[10px] text-muted-slate">{marker.system}</p>
                        </td>
                        <td className={`px-6 text-[13px] font-bold ${style.text}`}>
                          {marker.value} {marker.unit}
                        </td>
                        <td className="px-6 text-[11px] text-secondary-slate">{marker.range}</td>
                        <td className="px-6 text-right">
                          <span className={`px-2 py-0.5 ${style.pill} text-[10px] font-bold rounded uppercase`}>
                            {style.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* In-depth Insights */}
            <div className="grid grid-cols-2 gap-6 pb-12">
              {insights.map((insight) => {
                const IconComp = insightIconMap[insight.icon] || AlertCircle;
                const iconBg = insight.severity === 'critical' ? '#FEF2F2' : '#FFFBEB';
                const iconColor = insight.severity === 'critical' ? '#DC2626' : '#D97706';
                const borderColor = insight.severity === 'critical' ? '#DC2626' : '#D97706';

                return (
                  <div key={insight.id} className="p-5 bg-white border-y border-r border-slate-200 rounded-r-lg" style={{ borderLeft: `3px solid ${borderColor}` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: iconBg }}>
                        <IconComp size={18} color={iconColor} />
                      </div>
                      <h4 className="text-[13px] font-semibold text-primary-dark">{insight.title}</h4>
                    </div>
                    <p className="text-[12px] text-secondary-slate leading-relaxed">{insight.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right drag handle */}
        <div
          className="drag-handle flex-shrink-0 cursor-col-resize"
          style={{ width: '4px', backgroundColor: '#E2E8F0' }}
          onMouseDown={(e) => right.onMouseDown(e, -1)}
        />

        {/* ========== COLUMN 3: Right Panel (Predictions & Lifestyle) ========== */}
        <aside
          className="flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-y-auto"
          style={{ width: `${right.width}px` }}
        >

          {/* Share + User row */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '12px 16px 14px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
            <button
              onClick={handleShare}
              className="flex items-center gap-[6px] rounded-lg text-[12px] font-semibold text-white transition-colors hover:bg-[#085041] cursor-pointer"
              style={{ background: '#0F6E56', padding: '7px 14px' }}
            >
              {shareCopied ? <Check size={13} /> : <Share2 size={13} />}
              <span>{shareCopied ? 'Copied!' : 'Share'}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#0F172A]">
                {patient.name.split(' ')[0]}
              </span>
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[11px] font-semibold" style={{ background: '#0F6E56' }}>
                {patient.initials}
              </div>
            </div>
          </div>

          {/* Visual Risk Stack */}
          <div className="px-5">
            <h3 className="text-[11px] font-bold text-[#0F172A] mb-4">Risk Magnitude</h3>
            <div className="space-y-4">
              {riskMagnitude.map((risk, idx) => {
                const color = getRiskColor(risk.score);
                return (
                  <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wide">{risk.system}</span>
                      <span className={`text-[12px] font-bold px-2 py-[2px] rounded uppercase bg-white border border-[#E2E8F0] shadow-sm ${color.text}`}>{risk.score}/10</span>
                    </div>
                    <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className={`h-full ${color.bar} rounded-full transition-all duration-500`} style={{ width: `${risk.score * 10}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Future Consequences Timeline */}
          <div className="px-5 mt-8">
            <h3 className="text-[11px] font-bold text-[#0F172A] mb-4">Future Projection</h3>
            <div className="relative ml-2 space-y-7 border-l-2 border-[#E2E8F0] pb-2">
              {futureProjection.map((proj, idx) => (
                <div key={idx} className="relative pl-5">
                  <div
                    className="absolute -left-[5px] top-1 w-[8px] h-[8px] rounded-full border border-white box-content shadow-sm"
                    style={{ backgroundColor: getSeverityDotColor(proj.severity) }}
                  ></div>
                  <p className={`text-[11px] font-extrabold uppercase mb-1 tracking-wide ${getSeverityTextColor(proj.severity)}`}>
                    {proj.timeframe}
                  </p>
                  <p className="text-[11px] text-secondary-slate">{proj.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Habit Prescriptions */}
          <div className="px-5 mt-8 pb-8">
            <h3 className="text-[11px] font-bold text-[#0F172A] mb-4">Precision Habits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {habits.map((habit) => {
                const IconComp = habitIconMap[habit.icon] || Leaf;
                return (
                  <div key={habit.id} className="p-3 bg-white border border-[#E2E8F0] shadow-sm rounded-xl flex flex-col items-center text-center transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5">
                    <div className="w-[36px] h-[36px] bg-[#F0FDFA] rounded-full flex items-center justify-center mb-3">
                      <IconComp size={16} className="text-[#0D9488]" />
                    </div>
                    <p className="text-[10px] font-bold text-[#0F172A] leading-relaxed uppercase tracking-wide">{habit.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ReportDashboard;
