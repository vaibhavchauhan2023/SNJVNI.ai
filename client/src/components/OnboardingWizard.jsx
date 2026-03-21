import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateOfBirthPicker from "./DateOfBirthPicker";

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sex, setSex] = useState("");
  const [dob, setDob] = useState();
  const [heightUnit, setHeightUnit] = useState("cm");
  const [showOtherCondition, setShowOtherCondition] = useState(false);
  const [otherCondition, setOtherCondition] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const navigate = useNavigate();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const completeOnboarding = () => setIsCompleted(true);

  const handleGoalChange = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((item) => item !== goal)
        : [...prev, goal]
    );
  };

  if (isCompleted) {
    const userName = localStorage.getItem('snjvni-name') || '';
    const welcomeText = userName ? `Welcome to SNJVNI.ai, ${userName}` : "Welcome to SNJVNI.ai";

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0FDF9] p-4 sm:p-6 text-center font-body relative overflow-hidden">
        {/* Radial glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(29, 158, 117, 0.06) 0%, rgba(29, 158, 117, 0) 60%)' }}></div>
        
        {/* CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (prefers-reduced-motion: no-preference) {
            .anim-fade-up {
              animation: fadeUp 0.5s ease-out forwards;
              opacity: 0;
            }
            .anim-scale-in {
              animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              opacity: 0;
              transform: scale(0.8);
            }
            .anim-draw-check {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              animation: drawCheck 0.6s ease-out forwards;
            }
            .anim-pulse-ring {
              animation: pulseRing 0.3s ease-out forwards;
            }
            .anim-fade-in {
              animation: fadeIn 0.4s ease-out forwards;
              opacity: 0;
            }
            
            @keyframes fadeUp {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes scaleIn {
              0% { opacity: 0; transform: scale(0.8); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes drawCheck {
              0% { stroke-dashoffset: 100; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes pulseRing {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          }
        `}} />

        <div 
          className="relative z-10 w-full max-w-[480px] bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-6 py-8 sm:px-10 sm:py-12 flex flex-col items-center mx-4 anim-fade-up"
          style={{ animationDelay: '0s' }}
        >
          {/* Checkmark Sequence */}
          <div 
            className="w-24 h-24 rounded-full bg-[#E1F5EE] border-2 border-[#1D9E75] flex items-center justify-center mb-6 anim-scale-in"
            style={{ animationDelay: '0.3s' }}
            onAnimationEnd={(e) => {
              if (e.animationName === 'scaleIn') {
                e.currentTarget.classList.add('anim-pulse-ring');
                e.currentTarget.style.animationDelay = '0.6s';
              }
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 24L20 32L36 16" 
                stroke="#0F6E56" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="anim-draw-check"
                style={{ animationDelay: '0.4s' }}
              />
            </svg>
          </div>

          <div className="anim-fade-in text-center w-full" style={{ animationDelay: '0.7s' }}>
            <p className="text-[14px] text-[#6B7280] mb-1">{welcomeText}</p>
            <h2 className="text-[32px] font-bold text-[#0F6E56] font-heading leading-tight mb-2">
              You're all set!
            </h2>
            <p className="text-[16px] text-[#1D9E75] font-medium mb-8">
              Your Personal AI Health Assistant
            </p>
          </div>

          <div className="w-full space-y-3 mb-10 text-left">
            {[
              "Upload any medical report — blood, thyroid, lipid, urine, MRI",
              "Get plain-English insights with risk scores in seconds",
              "Ask ION, your AI health assistant, anything about your results"
            ].map((text, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 anim-fade-up"
                style={{ animationDelay: `${0.9 + i * 0.1}s` }}
              >
                <div className="mt-1 flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.75 9L7.5 12.75L14.25 5.25" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[15px] text-[#374151] leading-[1.8]">{text}</span>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center anim-fade-in" style={{ animationDelay: '1.2s' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full max-w-[320px] bg-[#0F6E56] hover:bg-[#085041] hover:-translate-y-[1px] text-white text-[16px] font-semibold rounded-[10px] px-6 py-[14px] flex items-center justify-center gap-2 transition-all duration-200 shadow-none hover:shadow-[0_6px_16px_rgba(15,110,86,0.3)]"
            >
              Go to Dashboard
              <span className="text-xl leading-none">→</span>
            </button>
          </div>

          <div className="anim-fade-in mt-4 text-center w-full" style={{ animationDelay: '1.3s' }}>
            <button 
              onClick={() => navigate('/')} 
              className="text-[13px] text-[#1D9E75] hover:underline cursor-pointer bg-transparent border-none p-0 inline-block font-medium"
            >
              Or upload your first report now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12 font-body">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#D0F4F2] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-widest text-[#7AB8B5]">
            <span>Step {step} of 3</span>
            <span>
              {step === 1
                ? "Basic Info"
                : step === 2
                ? "Health Context"
                : "Personal Goals"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#D0F4F2]">
            <div
              className="h-full bg-[#16AFA2] transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#073E3B] font-heading">
              Let&apos;s get the basics
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <DateOfBirthPicker
                  value={dob}
                  onChange={(date) => setDob(date)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Biological Sex
                </label>
                <select
                  onChange={(e) => setSex(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="intersex">Intersex</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Height
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    placeholder={heightUnit === "cm" ? "175" : "5.8"}
                    className="block w-full rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                  />
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value)}
                    className="w-24 rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="70"
                  className="mt-1 block w-full rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#073E3B] font-heading">
              Your Health History
            </h3>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#0A5C58]">
                Existing Conditions
              </label>

              <div className="grid grid-cols-2 gap-3">
                {["Diabetes", "Hypertension", "Thyroid", "PCOS", "None"].map(
                  (item) => (
                    <label
                      key={item}
                      className="cursor-pointer rounded-xl border border-[#D0F4F2] p-3 transition-colors hover:bg-[#D0F4F2]"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#A8CECC] text-[#16AFA2] focus:ring-[#16AFA2]"
                        />
                        <span className="ml-2 text-sm text-[#0A5C58]">
                          {item}
                        </span>
                      </div>
                    </label>
                  )
                )}

                <label className="cursor-pointer rounded-xl border border-[#D0F4F2] p-3 transition-colors hover:bg-[#D0F4F2]">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showOtherCondition}
                      onChange={(e) => {
                        setShowOtherCondition(e.target.checked);
                        if (!e.target.checked) setOtherCondition("");
                      }}
                      className="h-4 w-4 rounded border-[#A8CECC] text-[#16AFA2] focus:ring-[#16AFA2]"
                    />
                    <span className="ml-2 text-sm text-[#0A5C58]">Other</span>
                  </div>
                </label>
              </div>

              {showOtherCondition && (
                <div>
                  <label className="block text-sm font-medium text-[#0A5C58]">
                    Please mention other condition
                  </label>
                  <input
                    type="text"
                    value={otherCondition}
                    onChange={(e) => setOtherCondition(e.target.value)}
                    placeholder="Enter condition"
                    className="mt-1 block w-full rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                  />
                </div>
              )}

              {sex === "female" && (
                <div className="flex items-center justify-between rounded-xl border border-[#D0F4F2] bg-[#D0F4F2] p-4">
                  <span className="text-sm font-medium text-[#0A5C58]">
                    Are you currently pregnant?
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-full text-[#16AFA2] focus:ring-[#16AFA2]"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Current Medications
                </label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full rounded-xl border border-[#A8CECC] p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                  placeholder="List medications you take regularly..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#073E3B] font-heading">
              What are your health goals?
            </h3>

            <div className="space-y-4">
              {[
                "Monitor Health",
                "Track Report",
                "Improve Immunity",
                "General Wellness",
              ].map((goal) => (
                <label
                  key={goal}
                  className={`flex cursor-pointer items-center rounded-2xl border p-4 transition-all ${
                    selectedGoals.includes(goal)
                      ? "border-[#16AFA2] bg-[#D0F4F2]"
                      : "border-[#D0F4F2] hover:border-[#16AFA2] hover:bg-[#D0F4F2]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={() => handleGoalChange(goal)}
                    className="h-4 w-4 rounded border-[#A8CECC] text-[#16AFA2] focus:ring-[#16AFA2]"
                  />
                  <span className="ml-3 font-medium text-[#0A5C58]">
                    {goal}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-[#D0F4F2] pt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`text-sm font-semibold text-[#4A9B97] hover:text-[#0A5C58] ${
              step === 1 ? "invisible" : ""
            }`}
          >
            Back
          </button>

          <div className="flex space-x-4">
            <button
              onClick={step === 3 ? completeOnboarding : nextStep}
              className="text-sm font-semibold text-[#7AB8B5] hover:text-[#4A9B97]"
            >
              Skip for now
            </button>

            <button
              onClick={step === 3 ? completeOnboarding : nextStep}
              className="rounded-xl bg-[#16AFA2] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D7A75]"
            >
              {step === 3 ? "Finish" : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
