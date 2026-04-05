import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Share2, Send, Clock, Coffee, Sun, Leaf,
  AlertCircle, TrendingUp, ChevronDown, ChevronUp, Check, ArrowUp
} from 'lucide-react';

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
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (!id || !session?.access_token) return;

    async function fetchReport() {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/reports/${id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const result = await res.json();
            
            // Map DB format to Dashboard UI format
            
            // Calculate Risk Magnitude
            const riskMagnitudeMap = {};
            (result.biomarkers || []).forEach(b => {
                const sys = b.body_system || 'General';
                if (!riskMagnitudeMap[sys] || b.risk_score > riskMagnitudeMap[sys]) {
                    riskMagnitudeMap[sys] = b.risk_score || 0;
                }
            });
            const riskMagnitude = Object.entries(riskMagnitudeMap)
                .map(([system, score]) => ({ system, score }))
                .sort((a,b) => b.score - a.score);

            setReportData({
                patient: {
                    ...result.patient,
                    healthScore: result.healthScore?.score || 0,
                    healthStatus: result.healthScore?.status || 'normal'
                },
                report: result.report,
                biomarkers: (result.biomarkers || []).map(b => ({
                    ...b,
                    system: b.body_system,
                    range: b.reference_range,
                    riskScore: b.risk_score
                })),
                riskMagnitude,
                futureProjection: (result.futureRisks || []).map(r => ({
                    timeframe: r.timeframe,
                    severity: r.severity,
                    text: r.body
                })),
                habits: (result.habits || []).map(h => ({
                    id: h.id,
                    label: h.body, // action from Gemini
                    icon: h.title?.toLowerCase().includes('sleep') ? 'clock' : 'leaf',
                    relatedMarker: h.related_marker
                })),
                glossary: result.glossary || [],
                insights: (result.insights || []).map(i => ({
                    ...i,
                    icon: i.severity === 'critical' ? 'alert-circle' : 'trending-up'
                })),
                ionMessages: []
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    
    fetchReport();
  }, [id, session]);

  if (loading || !reportData) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-white">
              <div className="w-[40px] h-[40px] rounded-full border-4 border-[#F0FDFA] border-t-[#0D9488] animate-spin"></div>
          </div>
      );
  }

  const { patient, report, biomarkers, riskMagnitude, futureProjection, habits, glossary, insights } = reportData;

  // --- Resizable panels ---
  const left = useResizable(220, 180, 340, 'snjvni_left_width');
  const right = useResizable(240, 200, 360, 'snjvni_right_width');

  // --- ION Chat state ---
  const [ionMessages, setIonMessages] = useState(reportData.ionMessages || []);
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

  const toggleTerm = (idx) => {
    setExpandedTerm((prev) => (prev === idx ? null : idx));
  };

  const sendIonMessage = async () => {
    if (!ionInput.trim()) return;
    const userMessage = { role: 'user', content: ionInput };
    setIonMessages((prev) => [...prev, userMessage]);
    setIonInput('');
    setIonLoading(true);

    // TODO: Replace with real API call
    // POST /api/ion/chat
    // Body: { message: ionInput, reportId: report.id,
    //         history: ionMessages, patientContext: patient }
    setTimeout(() => {
      setIonMessages((prev) => [
        ...prev,
        {
          role: 'ion',
          content: `Based on your report, I can see your ${ionInput.toLowerCase().includes('tsh') ? 'TSH' : 'markers'} need attention. Would you like me to explain what this means for your daily routine?`,
        },
      ]);
      setIonLoading(false);
    }, 1200);
  };

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
            <h3 className="text-[9px] font-bold text-muted-slate uppercase mb-4" style={{ letterSpacing: '0.08em' }}>Glossary</h3>
            <div className="space-y-3">
              {glossary.map((item, idx) => (
                <div key={idx} className="cursor-pointer" onClick={() => toggleTerm(idx)}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-primary-dark mb-0.5">{item.term}</p>
                    {expandedTerm === idx
                      ? <ChevronUp size={12} className="text-muted-slate shrink-0" />
                      : <ChevronDown size={12} className="text-muted-slate shrink-0" />
                    }
                  </div>
                  {expandedTerm === idx && (
                    <p className="text-[11px] text-muted-slate leading-normal mt-1">{item.definition}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Chat messages (flow directly below glossary) */}
            <div className="flex flex-col gap-[10px] mt-4">
              {ionMessages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === 'user'
                      ? 'self-end bg-[#0F6E56] text-white rounded-[12px_12px_4px_12px] px-3 py-2 text-[12px] leading-[1.5] max-w-[85%]'
                      : 'self-start bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F172A] rounded-[12px_12px_12px_4px] px-3 py-2 text-[12px] leading-[1.5] max-w-[85%]'
                  }
                >
                  {msg.content}
                </div>
              ))}
              {ionLoading && (
                <div className="self-start bg-[#F0FDFA] border border-[#CCFBF1] rounded-[12px] px-[14px] py-[10px] flex gap-1 items-center">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#0D9488]" style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0s' }}></div>
                  <div className="w-[5px] h-[5px] rounded-full bg-[#0D9488]" style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0.2s' }}></div>
                  <div className="w-[5px] h-[5px] rounded-full bg-[#0D9488]" style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0.4s' }}></div>
                </div>
              )}
              <div ref={ionEndRef} />
            </div>
          </div>

          {/* Chat input (fixed at bottom of left panel) */}
          <div className="px-3 py-[10px] border-t border-slate-200 bg-white flex gap-2 items-center shrink-0">
            <input
              className="flex-1 h-[36px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-[10px] text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0D9488] focus:shadow-[0_0_0_2px_rgba(13,148,136,0.1)] transition-all"
              placeholder="Ask SNJVNI..."
              type="text"
              value={ionInput}
              onChange={(e) => setIonInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendIonMessage(); } }}
            />
            <button
              onClick={sendIonMessage}
              disabled={!ionInput.trim()}
              className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                ionInput.trim()
                  ? 'bg-[#0F6E56] text-white hover:bg-[#085041] cursor-pointer'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <ArrowUp size={14} />
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
              <div className="flex items-center gap-4">
                {/* Health score block */}
                <div className="flex items-center gap-[10px]">
                  <div
                    className="w-[44px] h-[44px] rounded-full border-2 flex flex-col items-center justify-center"
                    style={{ borderColor: getHealthStatusColor(patient.healthStatus) }}
                  >
                    <span className="text-[15px] font-bold leading-none" style={{ color: getHealthStatusColor(patient.healthStatus) }}>
                      {patient.healthScore}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] leading-none mt-[1px]">/10</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#94A3B8] uppercase" style={{ letterSpacing: '0.08em' }}>Health Score</p>
                    <div className={`mt-[2px] inline-block rounded-[10px] px-2 py-[2px] text-[10px] font-semibold ${getHealthBadgeBg(patient.healthStatus)}`}>
                      {getHealthStatusText(patient.healthStatus)}
                    </div>
                  </div>
                </div>

                {/* Report meta block */}
                <div className="border-l border-[#E2E8F0] pl-4">
                  <p className="text-[9px] font-bold text-[#94A3B8] uppercase" style={{ letterSpacing: '0.08em' }}>Flagged markers</p>
                  <p className="text-[13px] font-semibold text-[#0F172A] mt-[1px]">
                    {report.flaggedCount} of {report.totalMarkers}
                  </p>
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
          <div className="px-6">
            <h3 className="text-[10px] font-bold text-muted-slate uppercase tracking-widest mb-5">Risk Magnitude</h3>
            <div className="space-y-5">
              {riskMagnitude.map((risk, idx) => {
                const color = getRiskColor(risk.score);
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-primary-dark uppercase">{risk.system}</span>
                      <span className={color.text}>{risk.score}/10</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full">
                      <div className={`h-full ${color.bar} rounded-full`} style={{ width: `${risk.score * 10}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Future Consequences Timeline */}
          <div className="px-6 mt-8">
            <h3 className="text-[10px] font-bold text-muted-slate uppercase tracking-widest mb-5">Future Projection</h3>
            <div className="relative ml-1 space-y-6">
              {futureProjection.map((proj, idx) => (
                <div key={idx} className="relative pl-6">
                  <div
                    className="absolute left-0 top-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: getSeverityDotColor(proj.severity) }}
                  ></div>
                  <p className={`text-[10px] font-bold mb-0.5 uppercase ${getSeverityTextColor(proj.severity)}`}>
                    {proj.timeframe}
                  </p>
                  <p className="text-[11px] text-secondary-slate">{proj.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Habit Prescriptions */}
          <div className="px-6 mt-8 pb-6">
            <h3 className="text-[10px] font-bold text-muted-slate uppercase tracking-widest mb-4">Daily Precision Habits</h3>
            <div className="grid grid-cols-2 gap-3">
              {habits.map((habit) => {
                const IconComp = habitIconMap[habit.icon] || Leaf;
                return (
                  <div key={habit.id} className="p-3 bg-[#F8FAFC] rounded-lg flex flex-col items-center text-center">
                    <div className="w-8 h-8 bg-[#F0FDFA] rounded-full flex items-center justify-center mb-2">
                      <IconComp size={14} className="text-brand-teal" />
                    </div>
                    <p className="text-[9px] font-bold text-primary-dark leading-tight uppercase">{habit.label}</p>
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
