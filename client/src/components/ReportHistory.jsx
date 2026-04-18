import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { 
  Filter, Calendar, TrendingUp, TrendingDown, Minus, 
  Search, ChevronDown, FileText, CheckSquare, Square, 
  BarChart2, Flame, ArrowUpDown, UploadCloud, X
} from 'lucide-react';

export default function ReportHistory() {
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    totalReports: 0,
    mostFlagged: null,
    healthTrend: null,
    longestStreak: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls state
  const [filterType, setFilterType] = useState("All types");
  const [dateRange, setDateRange] = useState("All time");
  const [sortOrder, setSortOrder] = useState("Newest first");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("List view");
  
  // Compare state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [maxSelectWarning, setMaxSelectWarning] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Not logged in');
        return;
      }

      console.log('Fetching reports from backend...');

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch reports');
      }

      const data = await res.json();
      console.log('Reports received:', data);

      setReports(data.reports || []);
      setSummary(data.summary || {});

    } catch (err) {
      console.error('Fetch reports error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    return reports
      .filter(r => {
        if (filterType !== 'All types' && 
            !r.type?.toLowerCase().includes(filterType.toLowerCase())) 
          return false
        
        if (dateRange === 'Last 3 months') {
          const threeMonthsAgo = new Date()
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
          return new Date(r.created_at) >= threeMonthsAgo
        }
        if (dateRange === 'Last 1 year') {
          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          return new Date(r.created_at) >= oneYearAgo
        }
        return true
      })
      .filter(r => {
        if (!searchQuery) return true
        return r.flaggedMarkers?.some(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || r.title?.toLowerCase().includes(
          searchQuery.toLowerCase()
        )
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return sortOrder === 'Newest first' 
          ? dateB - dateA 
          : dateA - dateB
      });
  }, [reports, filterType, dateRange, sortOrder, searchQuery]);

  // Handlers
  const toggleSelection = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      setMaxSelectWarning(false);
    } else {
      if (selectedIds.length >= 2) {
        setMaxSelectWarning(true);
        setTimeout(() => setMaxSelectWarning(false), 3000);
      } else {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const navigateToReport = (id) => {
    if (!isComparing) {
      navigate(`/report/${id}`);
    }
  };

  // UI Helpers
  const getStatusColors = (status) => {
    switch (status) {
      case 'normal': return { bg: 'bg-[#F0FDFA]', border: 'border-[#CCFBF1]', text: 'text-[#0F6E56]', line: 'border-l-[#16A34A]' };
      case 'needs_attention': return { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#D97706]', line: 'border-l-[#D97706]' };
      case 'critical': return { bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', text: 'text-[#DC2626]', line: 'border-l-[#DC2626]' };
      default: return { bg: 'bg-[#F8FFFE]', border: 'border-[#E2E8F0]', text: 'text-[#94A3B8]', line: 'border-l-[#94A3B8]' };
    }
  };

  const getStatusLabel = (status) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const typeOptions = ["All types", "Blood Panel", "Thyroid", "Lipid Profile", "Complete Blood Count", "Urine Analysis", "MRI"];

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6 max-w-6xl mx-auto font-sans mt-[64px]">
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .fade-up { opacity: 0; animation: fadeUp 0.35s ease-out forwards; }
        .shimmer {
          background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 fade-in">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F172A]">Report History</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">All past reports · Filter · Compare · Track over time</p>
        </div>
        <button onClick={() => navigate('/analyze')} className="mt-4 md:mt-0 flex items-center gap-2 bg-[#0F6E56] text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold hover:bg-[#085041] hover:-translate-y-[1px] transition-all">
          <UploadCloud size={18} />
          Upload new report
        </button>
      </header>

      {/* 2. Summary Strip */}
      {!isLoading && !error && reports.length > 0 && (
        <div className="bg-[#F0FDFA] rounded-[14px] p-4 flex flex-col md:flex-row gap-6 mb-8 fade-up border border-[#CCFBF1]">
          <div className="flex-1 border-b md:border-b-0 md:border-r border-[#CCFBF1] pb-4 md:pb-0">
            <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Total Reports</p>
            <p className="text-[18px] font-bold text-[#0D9488]">{summary.totalReports}</p>
          </div>
          <div className="flex-1 border-b md:border-b-0 md:border-r border-[#CCFBF1] pb-4 md:pb-0">
            <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Longest Streak</p>
            <p className="text-[18px] font-bold text-[#0F172A] flex items-center gap-2">
              <Flame size={16} className="text-[#D97706]" />
              No streak yet
            </p>
          </div>
          <div className="flex-1 border-b md:border-b-0 md:border-r border-[#CCFBF1] pb-4 md:pb-0">
            <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Most Flagged</p>
            <p className="text-[18px] font-bold text-[#0F172A]">{summary.mostFlagged || 'None yet'}</p>
          </div>
          <div className="flex-1 flex items-center">
            {summary.healthTrend === 'improving' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-[20px]">
                <TrendingUp size={16} className="text-[#16A34A]" />
                <span className="text-[13px] font-semibold text-[#16A34A]">Health is improving</span>
              </div>
            ) : summary.healthTrend === 'worsening' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FEF2F2] border border-[#FECACA] rounded-[20px]">
                <TrendingDown size={16} className="text-[#DC2626]" />
                <span className="text-[13px] font-semibold text-[#DC2626]">Needs attention</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FFFE] border border-[#E2E8F0] rounded-[20px]">
                <Minus size={16} className="text-[#94A3B8]" />
                <span className="text-[13px] font-semibold text-[#94A3B8]">Stable</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Header Controls */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 fade-up items-start xl:items-center justify-between" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Type Filter */}
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white border border-[#E2E8F0] rounded-[8px] pl-3 pr-8 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0D9488] cursor-pointer"
            >
              {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Date Range Toggle */}
          <div className="flex border border-[#E2E8F0] rounded-[8px] overflow-hidden bg-white">
            {["Last 3 months", "Last 1 year", "All time"].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-2 text-[13px] transition-colors border-r border-[#E2E8F0] last:border-r-0 ${
                  dateRange === range ? 'bg-[#0F6E56] text-white font-medium' : 'text-[#475569] hover:bg-[#F8FFFE]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Sort Toggle */}
          <div className="flex border border-[#E2E8F0] rounded-[8px] overflow-hidden bg-white">
            {["Newest first", "Oldest first"].map(order => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className={`px-3 py-2 text-[13px] transition-colors border-r border-[#E2E8F0] last:border-r-0 ${
                  sortOrder === order ? 'bg-[#0F6E56] text-white font-medium' : 'text-[#475569] hover:bg-[#F8FFFE]'
                }`}
              >
                {order}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative flex-1 xl:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search by marker e.g. TSH" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[8px] pl-9 pr-3 py-2 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0D9488]"
            />
          </div>

          {/* Compare Button */}
          {selectedIds.length === 2 && !isComparing && (
            <button 
              onClick={() => setIsComparing(true)}
              className="flex items-center gap-2 bg-[#0D9488] text-white rounded-[10px] px-4 py-2 text-[13px] font-semibold hover:bg-[#0b7a70] transition-colors fade-in whitespace-nowrap"
            >
              <BarChart2 size={16} />
              Compare
            </button>
          )}

          {/* View Toggle */}
          <div className="flex border border-[#E2E8F0] rounded-[8px] overflow-hidden bg-white">
             {["List view", "Timeline view"].map(view => (
              <button
                key={view}
                onClick={() => setViewMode(view)}
                className={`px-3 py-2 text-[13px] transition-colors border-r border-[#E2E8F0] last:border-r-0 ${
                  viewMode === view ? 'bg-[#0D9488] text-white font-medium' : 'text-[#475569] hover:bg-[#F8FFFE]'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      {maxSelectWarning && (
        <div className="mb-4 text-[13px] text-[#DC2626] font-medium bg-[#FEF2F2] px-4 py-2 rounded-[8px] inline-block fade-in">
          You can compare up to 2 reports.
        </div>
      )}

      {/* 6. Compare Mode Section */}
      {isComparing && (
        <div className="mb-8 p-6 bg-white border border-[#0D9488] rounded-[14px] shadow-[0_4px_12px_rgba(13,148,136,0.08)] fade-in relative">
          <button 
            onClick={() => setIsComparing(false)}
            className="absolute top-4 right-4 text-[#DC2626] flex items-center gap-1 text-[13px] font-semibold hover:opacity-80"
          >
            <X size={16} /> Close compare
          </button>
          
          <h2 className="text-[18px] font-bold text-[#0F172A] mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-[#0D9488]" /> Comparing Reports
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {selectedIds.map(id => {
              const rep = reports.find(r => r.id === id);
              if (!rep) return null;
              const statusColors = getStatusColors(rep.health_status || rep.status);
              
              return (
                <div key={`compare-${rep.id}`} className="flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                    <div>
                      <p className="text-[12px] text-[#94A3B8]">{new Date(rep.report_date || rep.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <h3 className="text-[16px] font-semibold text-[#0F172A]">{rep.title}</h3>
                    </div>
                    <div className={`px-3 py-1 text-[12px] font-semibold rounded-[20px] ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                      {getStatusLabel(rep.health_status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center text-[20px] font-bold ${statusColors.border} ${statusColors.text}`}>
                      {rep.overall_score?.toFixed(1)}
                    </div>
                    <div>
                      <p className="text-[13px] text-[#475569] font-medium">Overall Score</p>
                      <p className="text-[12px] text-[#94A3B8] mt-1">{rep.flagged_count} markers flagged out of {rep.total_markers}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-[#0F172A] mb-3 border-b border-[#E2E8F0] pb-2">Flagged Markers</p>
                    {rep.flaggedMarkers?.length > 0 ? (
                      <ul className="space-y-2">
                        {rep.flaggedMarkers.map((flag, idx) => {
                           const flagColors = getStatusColors(flag.status);
                           return (
                             <li key={idx} className="flex justify-between items-center bg-[#F8FFFE] p-2 rounded-[8px] border border-[#E2E8F0]">
                               <span className="text-[13px] font-medium text-[#0F172A]">{flag.name}</span>
                               <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-[10px] ${flagColors.bg} ${flagColors.text} border ${flagColors.border}`}>
                                 {flag.status}
                               </span>
                             </li>
                           );
                        })}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-[#94A3B8] italic">No flagged markers in this report.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 & 5. Main Report View */}
      {!isComparing && (
        <div className={viewMode === "Timeline view" ? "relative ml-[60px] md:ml-[130px] pl-6 md:pl-8 border-l-2 border-[#E2E8F0]" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
          
          {isLoading ? (
            // Skeleton Loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 h-[160px] shimmer fade-in" style={{ animationDelay: `${i * 0.06}s` }}></div>
            ))
          ) : error ? (
            <div className="col-span-full py-12 text-center fade-in">
              <div className="w-[80px] h-[80px] rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-6">
                <FileText size={36} className="text-[#DC2626]" />
              </div>
              <p className="text-[16px] font-semibold text-[#0F172A] mb-2">{error}</p>
              <button 
                onClick={fetchReports}
                className="bg-[#DC2626] text-white rounded-[10px] px-6 py-2.5 text-[14px] font-semibold hover:bg-[#B91C1C] transition-all"
              >
                Try again
              </button>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            // Empty state
            <div className="col-span-full py-12 text-center fade-in">
              <FileText size={48} className="mx-auto text-[#E2E8F0] mb-4" />
              <p className="text-[16px] font-semibold text-[#0F172A]">No reports yet</p>
              <p className="text-[13px] text-[#94A3B8] mt-1 mb-6">Upload your first report to see your health history here.</p>
              <button 
                onClick={() => navigate('/analyze')}
                className="bg-[#0F6E56] text-white rounded-[10px] px-6 py-2.5 text-[14px] font-semibold hover:bg-[#085041] transition-all inline-block"
              >
                Upload report
              </button>
            </div>
          ) : (
            // Render Items
            filteredAndSorted.map((report, index) => {
              const statusColors = getStatusColors(report.health_status || report.status);
              const isSelected = selectedIds.includes(report.id);
              const delay = `${index * 0.06}s`;

              if (viewMode === "Timeline view") {
                return (
                  <div key={report.id} className="relative mb-8 fade-up group" style={{ animationDelay: delay }}>
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[41px] top-4 w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm ${statusColors.bg.replace('bg-', 'bg-').replace('100', '500')}`} style={{backgroundColor: statusColors.text.replace('text-[', '').replace(']', '')}}></div>
                    
                    {/* Date label (desktop left side of timeline) */}
                    <div className="absolute right-[100%] mr-[48px] top-3 hidden md:flex flex-col items-end w-24">
                       <p className="text-[14px] font-bold text-[#0F172A] whitespace-nowrap">{new Date(report.report_date || report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                       <p className="text-[11px] font-bold text-[#0D9488] bg-[#EAF7F4] px-2 py-0.5 rounded-md mt-1">{new Date(report.report_date || report.created_at).getFullYear()}</p>
                    </div>

                    <div 
                      onClick={() => navigateToReport(report.id)}
                      className={`bg-white border border-[#E2E8F0] border-l-[3px] ${statusColors.line} rounded-[14px] p-4 cursor-pointer hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] hover:-translate-y-[1px] transition-all`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                           <div 
                              onClick={(e) => toggleSelection(e, report.id)}
                              className="text-[#94A3B8] hover:text-[#0D9488] cursor-pointer"
                              title="Select to compare"
                            >
                              {isSelected ? <CheckSquare size={18} className="text-[#0D9488]" /> : <Square size={18} />}
                            </div>
                           <h3 className="text-[14px] font-semibold text-[#0F172A]">{report.title}</h3>
                        </div>
                        <p className="text-[12px] text-[#94A3B8] md:hidden">{new Date(report.report_date || report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full border-[2px] flex items-center justify-center text-[13px] font-bold ${statusColors.border} ${statusColors.text}`}>
                          {report.overall_score?.toFixed(1)}
                        </div>
                        <div>
                          <div className={`inline-block px-2.5 py-0.5 rounded-[20px] text-[11px] font-semibold border ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                            {getStatusLabel(report.health_status)}
                          </div>
                          {report.flaggedMarkers?.length > 0 && (
                            <p className="text-[12px] text-[#94A3B8] mt-1">
                              Flags: {report.flaggedMarkers.map(f => f.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // List View Card (Grid)
              return (
                <div 
                  key={report.id} 
                  onClick={() => navigateToReport(report.id)}
                  className={`bg-white border border-[#E2E8F0] border-l-[3px] ${statusColors.line} rounded-[14px] p-5 cursor-pointer hover:shadow-[0_4px_12px_rgba(13,148,136,0.08)] hover:-translate-y-[1px] transition-all fade-up group flex flex-col`}
                  style={{ animationDelay: delay }}
                >
                  {/* Top row */}
                  <div className="flex items-center mb-4">
                    <div 
                      onClick={(e) => toggleSelection(e, report.id)}
                      className="text-[#94A3B8] hover:text-[#0D9488] cursor-pointer mr-3"
                      title="Select to compare"
                    >
                      {isSelected ? <CheckSquare size={18} className="text-[#0D9488]" /> : <Square size={18} />}
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#0F172A] line-clamp-1">{report.title}</h3>
                    <span className="text-[12px] text-[#94A3B8] ml-auto shrink-0">{new Date(report.report_date || report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* Middle row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full border-[2px] flex items-center justify-center text-[13px] font-bold shrink-0 ${statusColors.border} ${statusColors.text}`}>
                      {report.overall_score?.toFixed(1)}
                    </div>
                    <div>
                      <div className={`inline-block px-2.5 py-0.5 rounded-[20px] text-[11px] font-semibold mb-1 border ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                        {getStatusLabel(report.health_status)}
                      </div>
                      <p className="text-[12px] text-[#94A3B8] leading-tight">
                        {report.flagged_count} markers flagged · {report.total_markers} total
                      </p>
                    </div>
                  </div>

                  {/* Flagged Chips */}
                  <div className="flex flex-wrap gap-2 mb-4 flex-1">
                    {report.flaggedMarkers?.slice(0, 2).map((flag, idx) => {
                      const flagColor = getStatusColors(flag.status);
                      return (
                        <div key={idx} className={`px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase border ${flagColor.bg} ${flagColor.text} ${flagColor.border}`}>
                          {flag.name}
                        </div>
                      )
                    })}
                  </div>

                  {/* Bottom row */}
                  <div className="mt-auto border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                    <span className="text-[#0D9488] text-[12px] font-medium group-hover:underline">View report →</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
