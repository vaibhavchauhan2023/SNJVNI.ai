import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, MessageCircle, Download, AlertTriangle, 
  TrendingUp, TrendingDown, Minus, Leaf, Lightbulb, Calendar, 
  Send, X, Flame, FileHeart
} from 'lucide-react';

/* 
dashboardData = {
  user: {
    firstName: string,
    lastName: string,
    avatarUrl: string | null,
    healthScore: number | null,
    healthStatus: "normal" | "needs_attention" | "critical" | null,
    streakCount: number,
  },
  latestReport: {
    id: string,
    date: string,
    type: string,
    overallScore: number,
    status: "normal" | "needs_attention" | "critical",
    flaggedCount: number,
    totalMarkers: number,
  } | null,
  flaggedMarkers: [
    {
      id: string,
      name: string,
      plainName: string,
      value: string,
      unit: string,
      status: "low" | "high" | "critical" | "normal",
      trend: "improving" | "worsening" | "stable" | null,
      trendDelta: string | null,
      bodySystem: string,
      reportId: string,
    }
  ],
  insights: [
    {
      id: string,
      type: "habit" | "trend_alert" | "health_tip" | "test_reminder",
      title: string,
      body: string,
      relatedMarker: string | null,
      severity: "info" | "warning" | "danger",
      actionLabel: string | null,
      actionRoute: string | null,
    }
  ],
  hasReports: boolean,
}
*/

// TODO: Replace with API call to GET /api/dashboard
const mockData = {
  user: {
    firstName: localStorage.getItem('snjvni-name') || "Vaibhav",
    lastName: "Chauhan",
    avatarUrl: null,
    healthScore: 6.4,
    healthStatus: "needs_attention",
    streakCount: 2,
  },
  latestReport: {
    id: "rep_123",
    date: "Mar 19, 2026",
    type: "Blood Panel + Thyroid",
    overallScore: 6.4,
    status: "needs_attention",
    flaggedCount: 3,
    totalMarkers: 34,
  },
  flaggedMarkers: [
    {
      id: "mk_1",
      name: "TSH",
      plainName: "Thyroid stimulating hormone",
      value: "6.8",
      unit: "mIU/L",
      status: "high",
      trend: "worsening",
      trendDelta: "+1.2 since last report",
      bodySystem: "Thyroid",
      reportId: "rep_123",
    },
    {
      id: "mk_2",
      name: "Haemoglobin",
      plainName: "Iron-rich protein in red blood cells",
      value: "11.2",
      unit: "g/dL",
      status: "low",
      trend: "stable",
      trendDelta: "No change",
      bodySystem: "Blood",
      reportId: "rep_123",
    },
    {
      id: "mk_3",
      name: "Vitamin D",
      plainName: "Calcifediol",
      value: "18",
      unit: "ng/mL",
      status: "critical",
      trend: "improving",
      trendDelta: "+4 since last report",
      bodySystem: "Bone Health",
      reportId: "rep_123",
    }
  ],
  insights: [
    {
      id: "in_1",
      type: "trend_alert",
      title: "TSH levels are rising",
      body: "Your TSH has increased outside the optimal range. This might indicate an underactive thyroid (hypothyroidism).",
      relatedMarker: "TSH",
      severity: "warning",
      actionLabel: "Read more",
      actionRoute: "/report/rep_123#tsh",
    },
    {
      id: "in_2",
      type: "habit",
      title: "Boost your Iron absorption",
      body: "Since your Haemoglobin is low, try combining iron-rich foods (like spinach) with Vitamin C to increase absorption by up to 30%.",
      relatedMarker: "Haemoglobin",
      severity: "info",
      actionLabel: "View diet shifts",
      actionRoute: "/habits",
    }
  ],
  hasReports: true,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ION Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // TODO: Connect to actual API
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Hello";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return '#0F6E56';
      case 'needs_attention': return '#D97706';
      case 'critical': return '#DC2626';
      default: return '#0F6E56';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'normal': return 'All good';
      case 'needs_attention': return 'Needs attention';
      case 'critical': return 'Critical — see doctor';
      default: return 'All good';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'normal': return 'bg-[#F0FDFA] border-[#CCFBF1] text-[#0F6E56]';
      case 'needs_attention': return 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]';
      case 'critical': return 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]';
      default: return 'bg-[#F0FDFA] border-[#CCFBF1] text-[#0F6E56]';
    }
  };

  // Chat logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const handleSendChat = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    // TODO: Replace with real API call
    // POST /api/ion/chat
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'ion', 
        content: `I can see your markers might be elevated. This is often associated with recent lifestyle changes. [Connect to AI API to get real insights]` 
      }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-20 font-body overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @media (prefers-reduced-motion: no-preference) {
          .fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .fade-up { animation: fadeUp 0.35s ease-out forwards; opacity: 0; }
          .shimmer {
            background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        }
      `}} />

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 pt-[100px] md:pt-[120px] pb-6 md:pb-8 flex flex-col gap-7">

        {loading ? (
          // --- SKELETON LOADER ---
          <div className="w-full">
            <div className="flex justify-between items-center mb-10 w-full">
              <div className="flex flex-col gap-3">
                <div className="w-[180px] h-[28px] rounded-[8px] shimmer"></div>
                <div className="w-[240px] h-[16px] rounded-[6px] shimmer"></div>
              </div>
              <div className="w-[140px] h-[72px] rounded-[36px] shimmer"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10">
              {[1,2,3,4].map(i => <div key={i} className="h-[140px] rounded-[14px] shimmer"></div>)}
            </div>
          </div>
        ) : (
          <>
            {/* --- SECTION 1: GREETING + STATUS --- */}
            <section className="w-full fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                {/* Left */}
                <div>
                  <h1 className="text-[26px] font-bold text-[#0F172A] leading-tight">
                    {getGreeting()}, {data.user.firstName}
                  </h1>
                  {data.hasReports && data.latestReport ? (
                    <p className="text-[13px] text-[#94A3B8] mt-1">
                      Last report: {data.latestReport.type} · {data.latestReport.date}
                    </p>
                  ) : (
                    <p className="text-[13px] text-[#94A3B8] mt-1">
                      Upload your first report to get started
                    </p>
                  )}
                </div>

                {/* Right */}
                {data.hasReports && data.latestReport ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      {/* Score Circle */}
                      <div 
                        className="w-[72px] h-[72px] rounded-full border-[3px] flex flex-col items-center justify-center shrink-0"
                        style={{ borderColor: getStatusColor(data.latestReport.status) }}
                      >
                        <span className="text-[22px] font-bold leading-none" style={{ color: getStatusColor(data.latestReport.status) }}>
                          {data.latestReport.overallScore}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] leading-none mt-0.5">/10</span>
                      </div>
                      
                      {/* Status Block */}
                      <div className="flex flex-col items-start gap-1">
                        <div className={`px-3 py-1 text-[12px] font-semibold rounded-[20px] border ${getStatusBg(data.latestReport.status)}`}>
                          {getStatusText(data.latestReport.status)}
                        </div>
                        <span className="text-[12px] text-[#94A3B8]">
                          {data.latestReport.flaggedCount} markers flagged · {data.latestReport.totalMarkers} total
                        </span>
                      </div>
                    </div>

                    {/* Streak Pill */}
                    {data.user.streakCount > 0 && (
                      <div className="hidden lg:flex items-center gap-1.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-[20px] px-3.5 py-1.5 h-fit ml-2">
                        <Flame size={16} className="text-[#D97706]" />
                        <span className="text-[12px] font-medium text-[#0F6E56]">{data.user.streakCount} reports this year</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => navigate('/analyze')} className="bg-[#0F6E56] text-white rounded-[10px] px-6 py-3 text-[14px] font-semibold hover:bg-[#085041] hover:-translate-y-[1px] transition-all shadow-md shrink-0">
                    Upload report
                  </button>
                )}
              </div>

              {/* CRITICAL ALERT BANNER */}
              {data.hasReports && data.latestReport?.status === 'critical' && (
                <div className="mt-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] p-3.5 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                  <div className="flex items-start sm:items-center gap-3">
                    <AlertTriangle size={18} className="text-[#DC2626] shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-[14px] font-medium text-[#DC2626] leading-snug">
                      One or more of your markers require urgent attention. Please consult your doctor as soon as possible.
                    </span>
                  </div>
                  <button onClick={() => navigate(`/report/${data.latestReport.id}`)} className="bg-[#DC2626] text-white rounded-[8px] px-4 py-[7px] text-[13px] font-semibold hover:bg-[#B91C1C] transition-colors shrink-0 outline-none">
                    View report
                  </button>
                </div>
              )}
            </section>

            {/* --- SECTION 2: QUICK ACTIONS --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
              {/* Upload Card */}
              <div 
                onClick={() => navigate('/analyze')}
                className="bg-[#F0FDFA] border-[1.5px] border-[#0D9488] rounded-[14px] p-5 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] hover:-translate-y-[1px] flex flex-col fade-up"
                style={{ animationDelay: '0.06s' }}
              >
                <div className="w-[44px] h-[44px] rounded-full bg-[#CCFBF1] flex items-center justify-center shrink-0">
                  <UploadCloud size={24} className="text-[#0F6E56]" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#0F172A] mt-3">Upload report</h3>
                <p className="text-[12px] text-[#94A3B8] mt-1">Add a new medical report</p>
                <span className="text-[12px] font-bold text-[#0D9488] mt-3">→</span>
              </div>

              {/* My Reports */}
              <div 
                onClick={() => navigate('/history')}
                className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 cursor-pointer transition-all duration-200 hover:border-[#0D9488] hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] hover:-translate-y-[1px] flex flex-col fade-up"
                style={{ animationDelay: '0.12s' }}
              >
                <div className="w-[44px] h-[44px] rounded-full bg-[#F8FFFE] flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-[#0D9488]" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#0F172A] mt-3">My reports</h3>
                <p className="text-[12px] text-[#94A3B8] mt-1">View all past reports</p>
              </div>

              {/* Ask ION */}
              <div 
                onClick={() => setIsChatOpen(true)}
                className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 cursor-pointer transition-all duration-200 hover:border-[#0D9488] hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] hover:-translate-y-[1px] flex flex-col fade-up"
                style={{ animationDelay: '0.18s' }}
              >
                <div className="relative w-[44px] h-[44px] rounded-full bg-[#F8FFFE] flex items-center justify-center shrink-0">
                  <MessageCircle size={24} className="text-[#0D9488]" />
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></div>
                </div>
                <h3 className="text-[14px] font-semibold text-[#0F172A] mt-3">Ask ION</h3>
                <p className="text-[12px] text-[#94A3B8] mt-1">Chat about your results</p>
              </div>

              {/* Doctor Export */}
              <div 
                onClick={() => data.hasReports && navigate('/export')}
                title={!data.hasReports ? "Upload a report first" : undefined}
                className={`bg-white border border-[#E2E8F0] rounded-[14px] p-5 flex flex-col fade-up 
                  ${data.hasReports ? 'cursor-pointer hover:border-[#0D9488] hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] hover:-translate-y-[1px] transition-all duration-200' : 'opacity-50 cursor-not-allowed'}`}
                style={{ animationDelay: '0.24s' }}
              >
                <div className="w-[44px] h-[44px] rounded-full bg-[#F8FFFE] flex items-center justify-center shrink-0">
                  <Download size={24} className="text-[#0D9488]" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#0F172A] mt-3">Doctor export</h3>
                <p className="text-[12px] text-[#94A3B8] mt-1">Print-ready PDF summary</p>
              </div>
            </section>

            {data.hasReports ? (
              <>
                {/* --- SECTION 3: FLAGGED MARKERS --- */}
                {data.flaggedMarkers.length > 0 && (
                  <section className="w-full mt-2">
                    <div className="flex justify-between items-end mb-4 px-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        <h2 className="text-[16px] font-semibold text-[#0F172A]">Flagged markers</h2>
                        <span className="text-[12px] text-[#94A3B8]">From your latest report · {data.latestReport.date}</span>
                      </div>
                      <span onClick={() => navigate(`/report/${data.latestReport.id}`)} className="text-[13px] text-[#0D9488] font-medium hover:underline cursor-pointer shrink-0">
                        View full report →
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {data.flaggedMarkers.slice(0, 3).map((marker, idx) => {
                        const statusColor = marker.status === 'low' || marker.status === 'high' ? '#D97706' : marker.status === 'critical' ? '#DC2626' : '#0F6E56';
                        return (
                          <div 
                            key={marker.id}
                            onClick={() => navigate(`/report/${marker.reportId}#${marker.id}`)}
                            className="bg-white border border-[#E2E8F0] rounded-[14px] p-[18px] cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all fade-up will-change-transform"
                            style={{ borderLeft: `3px solid ${statusColor}`, animationDelay: `${0.3 + (idx * 0.08)}s` }}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="bg-[#F0FDFA] text-[#0F6E56] rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                {marker.bodySystem}
                              </span>
                              <span className={`text-[11px] font-semibold rounded-[10px] px-2 py-0.5 border capitalize
                                ${marker.status === 'low' || marker.status === 'high' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' : marker.status === 'critical' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#F0FDFA] text-[#0F6E56] border-[#CCFBF1]'}`}
                              >
                                {marker.status}
                              </span>
                            </div>

                            <div className="mt-3">
                              <h3 className="text-[15px] font-semibold text-[#0F172A]">{marker.name}</h3>
                              <p className="text-[11px] text-[#94A3B8] mt-0.5">{marker.plainName}</p>
                            </div>

                            <div className="flex items-baseline gap-1.5 mt-3">
                              <span className="text-[24px] font-bold leading-none" style={{ color: statusColor }}>{marker.value}</span>
                              <span className="text-[12px] text-[#94A3B8] leading-none">{marker.unit}</span>
                            </div>

                            {marker.trend && (
                              <div className="flex items-center gap-1.5 mt-2">
                                {marker.trend === 'improving' && <TrendingDown size={14} className="text-[#16A34A]" />}
                                {marker.trend === 'worsening' && <TrendingUp size={14} className="text-[#DC2626]" />}
                                {marker.trend === 'stable' && <Minus size={14} className="text-[#94A3B8]" />}
                                <span className={`text-[11px] ${marker.trend === 'improving' ? 'text-[#16A34A]' : marker.trend === 'worsening' ? 'text-[#DC2626]' : 'text-[#94A3B8]'}`}>
                                  {marker.trendDelta || marker.trend}
                                </span>
                              </div>
                            )}

                            <div className="text-[11px] text-[#0D9488] font-medium mt-3">
                              View in report →
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* --- SECTION 4: INSIGHTS FEED --- */}
                {data.insights.length > 0 && (
                  <section className="w-full mt-2">
                    <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4 px-1">Insights & recommendations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {data.insights.map((insight, idx) => {
                        let Icon = Lightbulb, iconBg = '#F0FDFA', iconColor = '#0D9488';
                        if (insight.type === 'habit') { Icon = Leaf; iconColor = '#0F6E56'; }
                        if (insight.type === 'trend_alert') {
                          if (insight.severity === 'warning') { Icon = TrendingUp; iconBg = '#FFFBEB'; iconColor = '#D97706'; }
                          else if (insight.severity === 'danger') { Icon = AlertTriangle; iconBg = '#FEF2F2'; iconColor = '#DC2626'; }
                        }
                        if (insight.type === 'test_reminder') { Icon = Calendar; iconBg = '#EFF6FF'; iconColor = '#2563EB'; }

                        return (
                          <div 
                            key={insight.id}
                            className="bg-white border border-[#E2E8F0] rounded-[14px] p-[18px] sm:px-[20px] flex gap-[14px] items-start fade-up"
                            style={{ animationDelay: `${0.5 + (idx * 0.08)}s` }}
                          >
                            <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                              <Icon size={20} color={iconColor} />
                            </div>
                            <div className="flex flex-col">
                              <h3 className="text-[13px] font-semibold text-[#0F172A]">{insight.title}</h3>
                              <p className="text-[12px] text-[#475569] leading-[1.6] mt-1 pr-2">{insight.body}</p>
                              
                              {insight.relatedMarker && (
                                <div className="mt-2 w-fit bg-[#F0FDFA] text-[#0F6E56] border border-[#CCFBF1] rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase">
                                  {insight.relatedMarker}
                                </div>
                              )}
                              
                              {insight.actionLabel && insight.actionRoute && (
                                <span onClick={() => navigate(insight.actionRoute)} className="mt-2.5 text-[12px] text-[#0D9488] font-medium hover:underline cursor-pointer w-fit">
                                  {insight.actionLabel} →
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            ) : (
              // --- SECTION 5: EMPTY STATE ---
              <section className="w-full bg-white border-[1.5px] border-dashed border-[#CCFBF1] rounded-[20px] px-6 py-14 flex flex-col items-center text-center fade-in">
                <div className="w-[80px] h-[80px] rounded-full bg-[#F0FDFA] flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M12 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                  </svg>
                </div>
                <h2 className="text-[20px] font-bold text-[#0F172A]">No reports yet</h2>
                <p className="text-[14px] text-[#6B7280] max-w-[400px] mt-3 leading-[1.7]">
                  Upload your first medical report to get plain-English insights, risk scores, and personalized health recommendations.
                </p>
                <button 
                  onClick={() => navigate('/analyze')}
                  className="mt-7 bg-[#0F6E56] text-white rounded-[10px] px-7 py-3 text-[15px] font-semibold hover:bg-[#085041] hover:-translate-y-[1px] transition-all shadow-[0_6px_16px_rgba(15,110,86,0.25)] flex items-center gap-2"
                >
                  <UploadCloud size={16} /> Upload your first report
                </button>
                <span onClick={() => navigate('/sample')} className="mt-4 text-[13px] text-[#0D9488] font-medium cursor-pointer hover:underline">
                  Or explore a sample report →
                </span>
              </section>
            )}
          </>
        )}
      </div>

      {/* --- ION CHAT PANEL --- */}
      <div 
        className={`fixed top-[64px] right-0 md:w-[380px] w-full h-[calc(100vh-64px)] bg-white border-l border-[#E2E8F0] shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-40 flex flex-col transition-transform duration-300 ${isChatOpen ? 'translate-x-0 md:translate-y-0 translate-y-0' : 'translate-x-full md:translate-y-0 translate-y-[100%]'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></div>
            <span className="text-[16px] font-bold text-[#0F172A]">ION</span>
            <span className="text-[11px] text-[#94A3B8] ml-1">AI health assistant</span>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors outline-none bg-transparent p-1">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 relative bg-[#FFFFFF]">
          {messages.length === 0 ? (
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex flex-col px-5">
              <span className="text-[11px] text-[#94A3B8] mb-2 font-medium">Ask me anything about your results</span>
              <div className="flex flex-wrap gap-1.5">
                {(data?.flaggedMarkers || []).slice(0, 3).map(m => (
                  <button key={m.id} onClick={() => handleSendChat(`What does high ${m.name} mean?`)} className="bg-[#F8FFFE] border border-[#E2E8F0] text-[#475569] text-[11px] px-3 py-1.5 rounded-[20px] text-left hover:border-[#0D9488] hover:text-[#0D9488] transition-colors">
                    What does high {m.name} mean?
                  </button>
                ))}
                <button onClick={() => handleSendChat(`What tests should I do next?`)} className="bg-[#F8FFFE] border border-[#E2E8F0] text-[#475569] text-[11px] px-3 py-1.5 rounded-[20px] text-left hover:border-[#0D9488] hover:text-[#0D9488] transition-colors">
                  What tests should I do next?
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`px-3.5 py-2.5 text-[13px] leading-[1.6] max-w-[85%] ${msg.role === 'user' ? 'self-end bg-[#0F6E56] text-white rounded-[12px_12px_4px_12px]' : 'self-start bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F172A] rounded-[12px_12px_12px_4px]'}`}>
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div className="self-start bg-[#F0FDFA] border border-[#CCFBF1] rounded-[12px_12px_12px_4px] px-3.5 py-3.5 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-[#0D9488] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#0D9488] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#0D9488] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-white flex items-end gap-2 pb-6 md:pb-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={chatInput}
            onChange={e => { setChatInput(e.target.value); autoResizeTextarea(); }}
            onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(chatInput); } }}
            placeholder="Ask ION about your results..."
            className="flex-1 min-h-[40px] max-h-[120px] bg-white border border-[#E2E8F0] rounded-[10px] px-3 py-2.5 text-[13px] text-[#0F172A] resize-none outline-none focus:border-[#0D9488] focus:ring-[3px] focus:ring-[#0D9488]/10 hide-scrollbar"
          />
          <button 
            disabled={!chatInput.trim()} 
            onClick={() => handleSendChat(chatInput)}
            className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${chatInput.trim() ? 'bg-[#0F6E56] text-white hover:bg-[#085041]' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}
          >
            <Send size={16} className={chatInput.trim() ? "translate-x-[-1px] translate-y-[1px]" : ""} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
