import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Lock, Info, UploadCloud, Cpu, FileText, 
  HeartPulse, Activity, List, AlertTriangle, TrendingUp, 
  CheckCircle, BookOpen, Star, ChevronRight
} from 'lucide-react';

// --- ANIMATION WRAPPER ---
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function SnjvniLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-body overflow-x-hidden">
      {/* --- INJECTED STYLES FOR FONTS & ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');
        .font-heading { font-family: 'Poppins', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- 1. NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-[#D0F4F2]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <HeartPulse className="w-8 h-8 text-[#16AFA2]" />
            <span className="font-heading font-bold text-2xl text-[#16AFA2] tracking-tight">
              SNJVNI.ai
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-slate-600 hover:text-[#16AFA2] font-medium transition-colors">Home</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-[#16AFA2] font-medium transition-colors">How it Works</a>
            <a href="#sample" className="text-slate-600 hover:text-[#16AFA2] font-medium transition-colors">Sample Report</a>
            <button className="bg-[#16AFA2] hover:bg-[#0D7A75] text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-[#16AFA2]/20">
              Analyze Report
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#D0F4F2] px-6 py-4 flex flex-col gap-4 shadow-xl">
            <a href="#home" className="text-slate-600 font-medium py-2 border-b border-slate-50">Home</a>
            <a href="#how-it-works" className="text-slate-600 font-medium py-2 border-b border-slate-50">How it Works</a>
            <a href="#sample" className="text-slate-600 font-medium py-2 border-b border-slate-50">Sample Report</a>
            <button className="bg-[#16AFA2] text-white px-6 py-3 rounded-xl font-medium mt-2">
              Analyze Report
            </button>
          </div>
        )}
      </nav>

      {/* --- 2. HERO --- */}
      <section id="home" className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D0F4F2] text-[#0A5C58] font-semibold text-sm mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16AFA2] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16AFA2]"></span>
              </span>
              AI-Powered Medical Insights
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#073E3B] leading-tight mb-6">
              Understand your medical report — <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16AFA2] to-[#3EBFB9]">in plain English</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Upload your report, understand it in seconds. We analyze blood, urine, MRI, thyroid, and lipid reports to give you structured, AI-generated clarity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="w-full sm:w-auto bg-[#16AFA2] hover:bg-[#0D7A75] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-[#16AFA2]/30 flex items-center justify-center gap-2">
                Analyze My Report <ChevronRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto bg-white border-2 border-[#16AFA2] text-[#16AFA2] hover:bg-[#D0F4F2] px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center">
                See a Sample Report
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Right Content - Mock UI Card */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg relative">
          <FadeIn delay={200}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#A0E4E1] to-[#3EBFB9] rounded-3xl transform rotate-3 scale-105 opacity-50 blur-lg"></div>
            <div className="relative bg-white border border-[#D0F4F2] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              {/* Mock Header */}
              <div className="bg-[#0A5C58] px-6 py-4 flex items-center justify-between">
                <span className="text-white font-heading font-semibold">Report Analysis</span>
                <span className="bg-[#16AFA2] text-white text-xs px-2 py-1 rounded">Complete</span>
              </div>
              
              {/* Mock Body */}
              <div className="p-6 space-y-5 bg-slate-50/50">
                {/* 01 Patient Snapshot */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="bg-[#D0F4F2] p-2 rounded-lg text-[#0A5C58]"><Activity className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">01 • Patient Snapshot</h4>
                    <p className="text-sm font-semibold text-[#073E3B]">Male, 42 yrs | Complete Blood Count (CBC)</p>
                  </div>
                </div>

                {/* 02 Health Score */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">02 • Health Score</h4>
                    <span className="font-heading font-bold text-[#16AFA2] text-xl">82<span className="text-sm text-slate-400">/100</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#16AFA2] w-[82%] h-full rounded-full"></div>
                  </div>
                </div>

                {/* 03 Biomarker Breakdown */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">03 • Biomarkers (Alerts)</h4>
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 mb-2">
                    <span className="text-slate-600">Hemoglobin</span>
                    <span className="text-[#0D7A75] font-semibold">14.2 g/dL (Normal)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">LDL Cholesterol</span>
                    <span className="text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded">145 mg/dL (High)</span>
                  </div>
                </div>

                {/* 04 Risk Dashboard */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                    <span className="block text-xs text-slate-400 mb-1">Heart Risk</span>
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mb-1"></span>
                    <span className="block text-xs font-semibold text-slate-700">Moderate</span>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                    <span className="block text-xs text-slate-400 mb-1">Liver Info</span>
                    <span className="inline-block w-3 h-3 rounded-full bg-[#16AFA2] mb-1"></span>
                    <span className="block text-xs font-semibold text-slate-700">Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- 3. TRUST SIGNALS BAR --- */}
      <section className="bg-[#D0F4F2] py-6 border-y border-[#A0E4E1]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center gap-2">
            {['Blood Test', 'Urine Test', 'Thyroid', 'Lipid Profile', 'MRI', 'CBC', 'HbA1c'].map((badge) => (
              <span key={badge} className="bg-white text-[#0A5C58] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#A0E4E1]">
                {badge}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-medium text-[#0A5C58]">
            <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Your data is never shared or stored
            </span>
            <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full">
              <Info className="w-3.5 h-3.5" /> Not a substitute for medical advice
            </span>
          </div>
        </div>
      </section>

      {/* --- 4. HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#073E3B] mb-4">
                From report to clarity in 3 steps
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">We've simplified the process of understanding complex medical jargon so you can focus on your health.</p>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#6ECFCA] to-transparent -translate-y-1/2 z-0"></div>
            
            <div className="flex flex-col md:flex-row gap-12 relative z-10">
              {/* Step 1 */}
              <FadeIn delay={100} className="flex-1">
                <div className="bg-white border-2 border-[#D0F4F2] rounded-2xl p-8 text-center shadow-lg hover:border-[#16AFA2] transition-colors relative h-full">
                  <div className="w-16 h-16 bg-[#16AFA2] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-heading font-bold shadow-lg shadow-[#16AFA2]/30">
                    1
                  </div>
                  <UploadCloud className="w-10 h-10 text-[#3EBFB9] mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-[#0A5C58] text-xl mb-2">Upload your report</h3>
                  <p className="text-slate-600 text-sm">Securely upload your medical report as a PDF, image, or scan. We support most standard formats.</p>
                </div>
              </FadeIn>

              {/* Step 2 */}
              <FadeIn delay={300} className="flex-1">
                <div className="bg-white border-2 border-[#D0F4F2] rounded-2xl p-8 text-center shadow-lg hover:border-[#16AFA2] transition-colors relative h-full">
                  <div className="w-16 h-16 bg-[#16AFA2] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-heading font-bold shadow-lg shadow-[#16AFA2]/30">
                    2
                  </div>
                  <Cpu className="w-10 h-10 text-[#3EBFB9] mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-[#0A5C58] text-xl mb-2">AI Analyzes Everything</h3>
                  <p className="text-slate-600 text-sm">Our medical AI instantly reads every value, compares it to optimal ranges, and cross-references indicators.</p>
                </div>
              </FadeIn>

              {/* Step 3 */}
              <FadeIn delay={500} className="flex-1">
                <div className="bg-white border-2 border-[#D0F4F2] rounded-2xl p-8 text-center shadow-lg hover:border-[#16AFA2] transition-colors relative h-full">
                  <div className="w-16 h-16 bg-[#16AFA2] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-heading font-bold shadow-lg shadow-[#16AFA2]/30">
                    3
                  </div>
                  <FileText className="w-10 h-10 text-[#3EBFB9] mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-[#0A5C58] text-xl mb-2">Get Plain Insights</h3>
                  <p className="text-slate-600 text-sm">Receive a beautifully structured, easy-to-read dashboard with personalized insights and recommendations.</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. OUTPUT SECTIONS PREVIEW --- */}
      <section id="sample" className="py-24 bg-[#F8FDFD] px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#073E3B] mb-4">
                What you get in every report
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Our 7-part structured output turns overwhelming data into actionable health intelligence.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Patient Snapshot', desc: 'A quick summary of patient demographics and report scope.', icon: Activity },
              { num: '02', title: 'Overall Health Score', desc: 'A calculated 0-100 score based on your vital biomarkers.', icon: HeartPulse },
              { num: '03', title: 'Biomarker Breakdown', desc: 'Table format of every tested value with simple explanations.', icon: List },
              { num: '04', title: 'Visual Risk Dashboard', desc: 'Color-coded indicators for organ and system health risks.', icon: AlertTriangle },
              { num: '05', title: 'Future Consequences', desc: 'Understand long-term impacts if markers remain unchecked.', icon: TrendingUp },
              { num: '06', title: 'Daily Habit Recs', desc: 'Actionable diet, sleep, and exercise tips based on results.', icon: CheckCircle },
              { num: '07', title: 'Glossary & Disclaimer', desc: 'Definitions of medical terms and important medical disclaimers.', icon: BookOpen },
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 100} className={i === 6 ? "md:col-span-2 lg:col-span-3 xl:col-span-1" : ""}>
                <div className="group bg-white p-6 rounded-2xl border border-[#D0F4F2] h-full transition-all duration-300 hover:shadow-xl hover:shadow-[#16AFA2]/10 hover:border-l-4 hover:border-l-[#16AFA2] border-l-4 border-l-transparent cursor-default">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#A0E4E1] font-heading font-bold text-2xl group-hover:text-[#16AFA2] transition-colors">{feature.num}</span>
                    <div className="bg-[#E6FAFA] p-3 rounded-xl group-hover:bg-[#16AFA2] transition-colors">
                      <feature.icon className="w-6 h-6 text-[#16AFA2] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-[#073E3B] text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. TESTIMONIALS --- */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="font-heading text-3xl font-bold text-center text-[#073E3B] mb-12">
              Trusted by patients worldwide
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { init: 'AK', name: 'Arjun K.', quote: "I finally understand my lipid profile without having to anxiously wait for my next doctor's appointment." },
              { init: 'SM', name: 'Sarah M.', quote: "The daily habit recommendations based on my thyroid levels were spot on and incredibly helpful." },
              { init: 'RP', name: 'Rahul P.', quote: "My parents' reports are always in medical jargon. SNJVNI explains it in Hindi perfectly for them." }
            ].map((test, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="bg-[#F0FAF9] p-8 rounded-2xl border border-[#D0F4F2] relative">
                  <div className="flex text-amber-400 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-slate-600 mb-6 italic">"{test.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#16AFA2] rounded-full flex items-center justify-center text-white font-bold font-heading text-sm">
                      {test.init}
                    </div>
                    <span className="font-bold text-[#0A5C58]">{test.name}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- 7. FINAL CTA --- */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#16AFA2] to-[#3EBFB9] z-0"></div>
        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#073E3B]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to understand your health?
            </h2>
            <p className="text-[#D0F4F2] text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Stop guessing. Upload your medical report today and get clear, structured, plain-English insights in seconds.
            </p>
            <button className="bg-white text-[#16AFA2] hover:bg-slate-50 px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto">
              <UploadCloud className="w-6 h-6" /> Upload Your Report Now
            </button>
            <p className="mt-6 text-sm text-[#A0E4E1]">No credit card required. Secure and private.</p>
          </FadeIn>
        </div>
      </section>

      {/* --- 8. FOOTER --- */}
      <footer className="bg-[#073E3B] text-slate-300 py-12 px-6 border-t-4 border-[#16AFA2]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-[#0A5C58] pb-8 mb-8">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-[#16AFA2]" />
              <span className="font-heading font-bold text-2xl text-white tracking-tight">
                SNJVNI.ai
              </span>
            </div>
            <p className="text-sm text-[#A0E4E1]">AI-powered medical clarity.</p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact/Support</a>
            
            <div className="relative mt-2 md:mt-0">
              <select className="appearance-none bg-[#0A5C58] border border-[#16AFA2] text-white rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ECFCA] cursor-pointer">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="bn">Bengali</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#A0E4E1]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-xs text-center md:text-left text-[#7AB8B5]">
          <p>© {new Date().getFullYear()} SNJVNI.ai. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center md:justify-start gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 
            <strong>Disclaimer:</strong> This tool is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
          </p>
        </div>
      </footer>
    </div>
  );
}
