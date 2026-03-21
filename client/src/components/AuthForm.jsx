import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Lock, HeartPulse, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const AuthForm = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(window.location.pathname === '/signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignup(window.location.pathname === '/signup');
  }, [window.location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const passwordInput = e.target.password.value;
    const confirmPassword = e.target.confirmPassword?.value;

    setPasswordError("");
    setConfirmError("");
    
    if (isSignup) {
      let hasError = false;
      if (!passwordRegex.test(passwordInput)) {
        setPasswordError("Password must be 8+ characters, including upper, lower, number, and special character.");
        hasError = true;
      }

      if (passwordInput !== confirmPassword) {
        setConfirmError("Passwords do not match.");
        hasError = true;
      }
      
      if (hasError) return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('snjvni-token', 'true');
      const firstName = e.target.firstName?.value;
      if (firstName) {
        localStorage.setItem('snjvni-name', firstName);
      }
      window.dispatchEvent(new Event('storage'));
      
      if (isSignup) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
      
      if (onLogin) onLogin();
    }, 1000);
  };

  const getStrength = () => {
    if (!password) return { segments: 0, label: "" };
    let criteria = 0;
    if (password.length >= 8) criteria++;
    if (/[a-z]/.test(password)) criteria++;
    if (/[A-Z]/.test(password)) criteria++;
    if (/\d/.test(password)) criteria++;
    if (/[^A-Za-z0-9]/.test(password)) criteria++;

    if (criteria <= 2) return { segments: 1, label: "Weak", color: "bg-[#E24B4A]", textColor: "text-[#E24B4A]" };
    if (criteria === 3) return { segments: 2, label: "Fair", color: "bg-[#BA7517]", textColor: "text-[#BA7517]" };
    if (criteria === 4) return { segments: 3, label: "Good", color: "bg-[#1D9E75]", textColor: "text-[#1D9E75]" };
    return { segments: 4, label: "Strong", color: "bg-[#0F6E56]", textColor: "text-[#0F6E56]" };
  };

  const strength = getStrength();

  return (
    <div className="flex min-h-screen bg-white font-body">
      
      {/* --- LEFT COLUMN --- */}
      <div className="hidden md:flex md:w-[40%] bg-[#0F6E56] flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 z-10 cursor-pointer" onClick={() => navigate('/')}>
          <HeartPulse className="w-8 h-8 text-white" />
          <span className="font-heading font-bold text-2xl text-white tracking-tight">SNJVNI.ai</span>
        </div>

        {/* Feature Highlights */}
        <div className="z-10 mt-12 mb-auto">
          <h2 className="text-[26px] font-bold text-white font-heading leading-tight mb-4">
            Your health report, finally explained.
          </h2>
          <p className="text-white/85 text-[15px] leading-[1.7] mb-8 pr-4">
            Upload any medical report and get plain-English insights, 
            risk scores, and daily habit recommendations — powered by AI.
          </p>
          <div className="flex flex-col gap-[10px]">
            {[
              "7-part structured analysis",
              "Ask ION — your AI health assistant",
              "Track trends across multiple reports"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/12 rounded-[8px] px-4 py-[10px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M3.33334 8L6.66668 11.3333L13.3333 4.66667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white text-[13px] font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="z-10 mt-12 w-full">
          <span className="text-white/70 text-[12px] font-medium block w-full text-center md:text-left">
            Trusted by patients across India
          </span>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/5 blur-3xl rounded-full z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0A5C58]/40 blur-3xl rounded-full z-0 pointer-events-none"></div>
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="w-full md:w-[60%] flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-[420px] mx-auto bg-white">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <HeartPulse className="w-8 h-8 text-[#0F6E56]" />
            <span className="font-heading font-bold text-2xl text-[#0F6E56] tracking-tight">SNJVNI.ai</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-[#0F6E56] font-heading leading-tight mb-2">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              {isSignup ? "Join thousands understanding their health better" : "Sign in to access your health reports"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex w-full mb-8 relative">
            <button 
              type="button" 
              onClick={() => setIsSignup(false)}
              className={`flex-1 pb-3 text-center text-[15px] transition-colors relative z-10 
              ${!isSignup ? 'text-[#0F6E56] font-semibold border-b-2 border-[#0F6E56]' : 'text-[#9CA3AF] font-normal hover:text-[#374151]'}`}
            >
              Log in
            </button>
            <button 
              type="button" 
              onClick={() => setIsSignup(true)}
              className={`flex-1 pb-3 text-center text-[15px] transition-colors relative z-10 
              ${isSignup ? 'text-[#0F6E56] font-semibold border-b-2 border-[#0F6E56]' : 'text-[#9CA3AF] font-normal hover:text-[#374151]'}`}
            >
              Sign up
            </button>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#E5E7EB] z-0"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[14px]">
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                {/* First Name */}
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] pl-10 pr-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all focus:border-[#0F6E56] focus:ring-[3px] focus:ring-[#0F6E56]/10 bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] pl-10 pr-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all focus:border-[#0F6E56] focus:ring-[3px] focus:ring-[#0F6E56]/10 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] pl-10 pr-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all focus:border-[#0F6E56] focus:ring-[3px] focus:ring-[#0F6E56]/10 bg-white"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`h-[44px] w-full rounded-[8px] border outline-none transition-all pl-10 pr-10 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] bg-white
                    ${passwordError ? "border-[#E24B4A] focus:ring-[3px] focus:ring-[#E24B4A]/10" : "border-[#D1D5DB] focus:border-[#0F6E56] focus:ring-[3px] focus:ring-[#0F6E56]/10"}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#374151] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {isSignup && (
                <div className="mt-2">
                  <div className="flex gap-[4px] h-[3px]">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-[2px] transition-colors duration-300 ${
                          strength.segments >= i ? strength.color : 'bg-[#E5E7EB]'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <div className={`mt-1 text-[11px] font-medium ${strength.textColor}`}>
                      {strength.label}
                    </div>
                  )}
                </div>
              )}

              {passwordError && (
                <p className="mt-1 text-[13px] text-[#E24B4A]">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            {isSignup && (
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    className={`h-[44px] w-full rounded-[8px] border outline-none transition-all pl-10 pr-3 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] bg-white
                      ${confirmError ? "border-[#E24B4A] focus:ring-[3px] focus:ring-[#E24B4A]/10" : "border-[#D1D5DB] focus:border-[#0F6E56] focus:ring-[3px] focus:ring-[#0F6E56]/10"}`}
                    required
                  />
                </div>
                {confirmError && (
                  <p className="mt-1 text-[13px] text-[#E24B4A]">{confirmError}</p>
                )}
              </div>
            )}

            {/* Extras (Remember me / Forgot pass) */}
            {!isSignup && (
              <div className="flex items-center justify-between text-[13px] pt-1 pb-2">
                <label className="flex items-center gap-2 text-[#374151] cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-4 h-4 border-[1.5px] border-[#D1D5DB] rounded-[4px] bg-white transition-colors peer-checked:bg-[#0F6E56] peer-checked:border-[#0F6E56]"></div>
                    <svg className="absolute w-2.5 h-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="select-none text-[#374151]">Remember me</span>
                </label>
                <a href="#" className="font-medium text-[#0F6E56] hover:underline">
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Terms & Conditions */}
            {isSignup && (
              <label className="flex items-start gap-2 pt-2 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input 
                    type="checkbox" 
                    required 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only" 
                  />
                  <div className="w-4 h-4 border-[1.5px] border-[#D1D5DB] rounded-[4px] bg-white transition-colors peer-checked:bg-[#0F6E56] peer-checked:border-[#0F6E56]"></div>
                  <svg className="absolute w-2.5 h-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[13px] text-[#374151] leading-tight mt-[1px]">
                  I agree to the <a href="#" className="text-[#0F6E56] hover:underline whitespace-nowrap">Terms of Service</a> and <a href="#" className="text-[#0F6E56] hover:underline whitespace-nowrap">Privacy Policy</a>
                </span>
              </label>
            )}

            {/* Primary CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[46px] rounded-[10px] bg-[#0F6E56] text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#085041] hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(15,110,86,0.3)] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-[18px] h-[18px] mr-2" />
                    {isSignup ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  isSignup ? "Create Account" : "Log in"
                )}
              </button>
            </div>
          </form>

          {/* OR Divider */}
          <div className="my-6 relative flex items-center justify-center">
            <div className="absolute w-full h-px bg-[#E5E7EB]"></div>
            <span className="relative bg-white px-3 text-[12px] text-[#9CA3AF] font-medium tracking-wide">OR</span>
          </div>

          {/* Social Auth */}
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('snjvni-token', 'true');
              window.dispatchEvent(new Event('storage'));
              navigate('/dashboard');
              if (onLogin) onLogin();
            }}
            className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-[#D1D5DB] h-[46px] text-[14px] font-medium text-[#374151] transition-all hover:bg-[#F9FAFB] active:scale-[0.99]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-[18px] w-[18px]">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.2 7l6.2 5.2C39.2 36.7 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
            </svg>
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  );
};

export default AuthForm;
