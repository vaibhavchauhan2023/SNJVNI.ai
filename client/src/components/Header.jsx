import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, Menu, X, UploadCloud, Bell, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('snjvni-token') === 'true'
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const notifRef = useRef(null);
  const avatarRef = useRef(null);

  // Scroll effect for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync token changes from other tabs if needed, though simple state works here
  useEffect(() => {
    const handleStorage = () => setIsAuthenticated(localStorage.getItem('snjvni-token') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Handlers for mock auth
  const handleLogin = () => {
    navigate('/login');
    setIsMobileOpen(false);
  };

  const handleSignup = () => {
    navigate('/signup');
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('snjvni-token');
    setIsAuthenticated(false);
    setAvatarOpen(false);
    setIsMobileOpen(false);
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Component pieces for reuse
  const Logo = ({ href }) => (
    <a href={href} className="flex flex-col cursor-pointer shrink-0">
      <div className="flex items-center gap-2">
        <HeartPulse className="w-8 h-8 text-[#0F6E56]" />
        <span className="font-heading font-bold text-2xl text-[#0F6E56] tracking-tight">
          SNJVNI.ai
        </span>
      </div>
    </a>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-[64px] bg-white border-b border-[#e5e7eb] z-50 flex flex-col justify-center transition-shadow duration-200 ${
        isScrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* --- LEFT: LOGO --- */}
        <div className="flex items-center">
          <Logo href={isAuthenticated ? "/dashboard" : "/"} />
        </div>

        {/* --- CENTER: NAV LINKS (DESKTOP) --- */}
        <nav className="hidden md:flex items-center gap-8">
          {!isAuthenticated ? (
            <>
              {['How it Works', 'Sample Report', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-[15px] font-medium text-[#374151] hover:text-[#0F6E56] transition-colors"
                >
                  {item}
                </a>
              ))}
            </>
          ) : (
            <>
              {['Dashboard', 'My Reports', 'Trends'].map((item) => {
                const isActive = currentPath === `/${item.toLowerCase().replace(/ /g, '-')}`;
                return (
                  <a
                    key={item}
                    href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                    className={`text-[15px] font-medium transition-colors py-[21px] ${
                      isActive 
                        ? 'text-[#0F6E56] border-b-2 border-[#0F6E56]' 
                        : 'text-[#374151] hover:text-[#0F6E56] border-b-2 border-transparent'
                    }`}
                  >
                    {item}
                  </a>
                );
              })}
              <a
                href="/ask-ion"
                className="text-[15px] font-medium text-[#374151] hover:text-[#0F6E56] transition-colors py-[21px] flex items-center border-b-2 border-transparent"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse mr-1.5"></span>
                Ask ION
              </a>
            </>
          )}
        </nav>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-5">
          {!isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={handleLogin}
                  className="bg-transparent border-none text-[#374151] font-medium hover:text-[#0F6E56] transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={handleSignup}
                  className="bg-[#0F6E56] text-white rounded-lg px-[20px] py-[10px] font-semibold hover:bg-[#085041] transition duration-200 shadow-sm"
                >
                  Sign up free
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Upload Button */}
              <button className="flex items-center gap-2 bg-[#0F6E56] text-white rounded-lg px-[18px] py-[10px] font-semibold hover:bg-[#085041] transition duration-200 shadow-sm">
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Report</span>
                <span className="sm:hidden">Upload</span>
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <Bell className="w-[22px] h-[22px] text-[#6B7280]" />
                  {/* Badge */}
                  <span className="absolute top-1 right-1 w-[10px] h-[10px] rounded-full bg-[#E24B4A] border-2 border-white"></span>
                </button>
                
                {notifOpen && (
                  <div className="absolute top-[130%] right-[-10px] w-[280px] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-slate-100 py-3 flex flex-col z-50">
                    <span className="px-4 pb-2 text-sm font-semibold text-slate-700 border-b border-slate-100">Notifications</span>
                    <span className="px-4 py-4 text-xs text-slate-500 text-center">No new alerts</span>
                  </div>
                )}
              </div>

              {/* Avatar Dropdown */}
              <div className="relative flex items-center" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="w-[36px] h-[36px] bg-[#0F6E56] rounded-full flex items-center justify-center text-white font-semibold text-[14px] hover:ring-2 ring-offset-2 ring-[#0F6E56] transition-all"
                >
                  V
                </button>

                {avatarOpen && (
                  <div className="absolute top-[120%] right-0 w-[200px] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-slate-100 py-2 flex flex-col z-50">
                    <div className="px-4 py-3 border-b border-slate-100 flex flex-col mb-1">
                      <span className="font-bold text-slate-800 text-sm">Vaibhav Chauhan</span>
                      <span className="text-xs text-slate-500 truncate">vaibhav@example.com</span>
                    </div>
                    {['My Profile', 'Settings', 'Doctor Export', 'Help'].map((item) => (
                      <a key={item} href={`/${item.toLowerCase().replace(/ /g, '-')}`} className="px-4 py-2 text-sm text-[#374151] hover:bg-slate-50 hover:text-[#0F6E56] transition-colors">
                        {item}
                      </a>
                    ))}
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-left text-[#E24B4A] hover:bg-red-50 transition-colors w-full"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-slate-800 p-1"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* --- MOBILE DRAWER DROPDOWN --- */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-[64px] left-0 w-full bg-white border-b border-[#e5e7eb] shadow-lg flex flex-col py-4 px-6 z-40">
          {!isAuthenticated ? (
            <>
              {['How it Works', 'Sample Report', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="py-3 text-[15px] font-medium text-[#374151] border-b border-slate-50 hover:text-[#0F6E56]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <button onClick={handleLogin} className="w-full bg-white border border-[#e5e7eb] text-[#374151] rounded-lg py-3 font-medium hover:bg-slate-50 transition-colors">
                  Log in
                </button>
                <button onClick={handleSignup} className="w-full bg-[#0F6E56] text-white rounded-lg py-3 font-semibold hover:bg-[#085041] transition-colors shadow-sm">
                  Sign up free
                </button>
              </div>
            </>
          ) : (
            <>
              {['Dashboard', 'My Reports', 'Trends'].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                  className="py-3 text-[15px] font-medium text-[#374151] border-b border-slate-50 hover:text-[#0F6E56]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a
                href="/ask-ion"
                onClick={() => setIsMobileOpen(false)}
                className="py-3 text-[15px] font-medium text-[#374151] border-b border-slate-50 hover:text-[#0F6E56] flex items-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse mr-2"></span>
                Ask ION
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
