import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, AlertCircle, Loader2, CheckCircle2, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ReportUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // status: 'idle' | 'selected' | 'uploading' | 'processing' | 'error'
  const [status, setStatus] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const resetState = () => {
    setStatus('idle');
    setSelectedFile(null);
    setErrorMessage('');
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Please upload a PDF, JPEG, PNG, or WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 10 MB.';
    }
    return null;
  };

  const selectFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }
    setSelectedFile(file);
    setErrorMessage('');
    setStatus('selected');
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  }, []);

  const handleUpload = async (file) => {
    setStatus('processing');

    const formData = new FormData();
    formData.append('report', file);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setErrorMessage('You must be logged in to upload a report.');
      setStatus('error');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/reports/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Upload failed (${res.status})`);
      }

      const { reportId } = await res.json();

      // Poll for completion
      const checkStatus = setInterval(async () => {
        const { data } = await supabase
          .from('reports')
          .select('status')
          .eq('id', reportId)
          .single();

        if (data?.status === 'complete') {
          clearInterval(checkStatus);
          navigate(`/report/${reportId}`);
        }
        if (data?.status === 'failed') {
          clearInterval(checkStatus);
          setErrorMessage('Report analysis failed. Please try again with a clearer image.');
          setStatus('error');
        }
      }, 2000);

      // Safety timeout — stop polling after 3 minutes
      setTimeout(() => {
        clearInterval(checkStatus);
      }, 180000);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-body flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          80%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pulse-ring { animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .spin-slow { animation: spin-slow 1.2s linear infinite; }
      `}} />

      {/* Top bar */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E2E8F0]">
        <Heart size={20} className="text-[#0D9488]" fill="#0D9488" />
        <span
          className="text-[15px] font-bold text-[#0F172A] cursor-pointer"
          style={{ letterSpacing: '-0.3px' }}
          onClick={() => navigate('/dashboard')}
        >
          SNJVNI.ai
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px]">

          {/* Header text */}
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#0F172A] mb-2">Upload your report</h1>
            <p className="text-[14px] text-[#94A3B8]">
              Upload a medical report as PDF or image. We'll analyze it in seconds.
            </p>
          </div>

          {/* ── IDLE / SELECTED ── */}
          {(status === 'idle' || status === 'selected') && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative rounded-[16px] border-2 border-dashed cursor-pointer
                  transition-all duration-200
                  ${isDragOver
                    ? 'border-[#0D9488] bg-[#F0FDFA] scale-[1.01]'
                    : 'border-[#E2E8F0] bg-[#FAFAFA] hover:border-[#0D9488] hover:bg-[#F0FDFA]'
                  }
                  ${selectedFile ? 'p-5' : 'p-10'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  onChange={onFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-[56px] h-[56px] rounded-full bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center">
                      <UploadCloud size={24} className="text-[#0D9488]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-semibold text-[#0F172A]">
                        Drag and drop your report here
                      </p>
                      <p className="text-[12px] text-[#94A3B8] mt-1">
                        or <span className="text-[#0D9488] font-medium">browse files</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-[#CBD5E1]">
                      PDF, JPEG, PNG, WebP · Max 10 MB
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-[#0D9488]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); resetState(); }}
                      className="w-[28px] h-[28px] rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Upload button */}
              {selectedFile && (
                <button
                  onClick={() => handleUpload(selectedFile)}
                  className="w-full mt-4 bg-[#0F6E56] text-white rounded-[12px] py-[14px] text-[15px] font-semibold hover:bg-[#085041] transition-all shadow-[0_4px_12px_rgba(15,110,86,0.2)] flex items-center justify-center gap-2"
                >
                  <UploadCloud size={18} />
                  Analyze report
                </button>
              )}
            </>
          )}

          {/* ── PROCESSING ── */}
          {status === 'processing' && (
            <div className="flex flex-col items-center text-center py-12">
              <div className="relative mb-6">
                <div className="w-[72px] h-[72px] rounded-full bg-[#F0FDFA] border-2 border-[#CCFBF1] flex items-center justify-center">
                  <Loader2 size={28} className="text-[#0D9488] spin-slow" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#0D9488] pulse-ring"></div>
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Analyzing your report...</h2>
              <p className="text-[13px] text-[#94A3B8] max-w-[340px] leading-relaxed">
                Our AI is reading and understanding every value in your report.
                This usually takes 15–30 seconds.
              </p>

              {/* Progress steps */}
              <div className="mt-8 w-full max-w-[280px] flex flex-col gap-3">
                {[
                  { label: 'Uploading file', done: true },
                  { label: 'Extracting data', done: false },
                  { label: 'AI analysis', done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.done ? (
                      <CheckCircle2 size={16} className="text-[#0D9488] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#E2E8F0] shrink-0"></div>
                    )}
                    <span className={`text-[13px] ${step.done ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-[56px] h-[56px] rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-[#DC2626]" />
              </div>
              <h2 className="text-[16px] font-bold text-[#0F172A] mb-1">Upload failed</h2>
              <p className="text-[13px] text-[#94A3B8] max-w-[340px] mb-6">
                {errorMessage}
              </p>
              <button
                onClick={resetState}
                className="bg-[#0F6E56] text-white rounded-[10px] px-6 py-[10px] text-[14px] font-semibold hover:bg-[#085041] transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Supported formats note */}
          {(status === 'idle' || status === 'selected') && (
            <div className="mt-6 flex items-start gap-2 px-1">
              <AlertCircle size={14} className="text-[#CBD5E1] mt-[2px] shrink-0" />
              <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                We support blood tests, thyroid panels, lipid profiles, urine tests, CBC, HbA1c, and most standard diagnostic reports.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportUpload;
