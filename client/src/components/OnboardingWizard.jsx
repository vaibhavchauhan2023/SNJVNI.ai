import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateOfBirthPicker from "./DateOfBirthPicker";
import { supabase } from '../lib/supabase';

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    sex: "",
    height: "",
    weight: "",
    language: "English",
    conditions: [],
    medications: [],
    allergies: "",
    goals: [],
    testFrequency: "",
    units: "metric"
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [noMedications, setNoMedications] = useState(false);
  const [showOtherCondition, setShowOtherCondition] = useState(false);
  const [otherCondition, setOtherCondition] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");

  const saveToProfile = async (data) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      if (error) {
        console.error('Profile save error:', error)
      } else {
        console.log('Profile saved:', data)
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const handleStep1Next = async () => {
    const errors = {}
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Required'
    if (!formData.sex) errors.sex = 'Required'
    if (!formData.height) errors.height = 'Required'
    if (!formData.weight) errors.weight = 'Required'
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    
    const dob = new Date(formData.dateOfBirth)
    const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000))
    
    await saveToProfile({
      age: age,
      sex: formData.sex,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      language: formData.language || 'English'
    })
    
    setStep(2)
  }

  const handleStep2Next = async () => {
    let finalConditions = [...formData.conditions];
    if (showOtherCondition && otherCondition) {
      if (!finalConditions.includes(otherCondition)) {
        finalConditions.push(otherCondition);
      }
    }
    const errors = {}
    
    if (finalConditions.length === 0) {
      errors.conditions = 'Please select at least one option'
    }
    
    if (!formData.medications || formData.medications.length === 0) {
      errors.medications = 'Please add medications or select None'
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors({...errors, ...{conditions: errors.conditions ? errors.conditions : undefined}})
      return
    }
    setFieldErrors({})
    
    await saveToProfile({
      conditions: finalConditions,
      medications: formData.medications,
      allergies: formData.allergies || null
    })
    
    setStep(3)
  }

  const handleStep3Complete = async () => {
    const errors = {}
    
    if (!formData.goals || formData.goals.length === 0) {
      errors.goals = 'Please select at least one goal'
    }
    
    if (!formData.testFrequency) {
      errors.testFrequency = 'Please select how often you test'
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    
    await saveToProfile({
      units: formData.units || 'metric',
      language: formData.language || 'English'
    })
    
    window.location.href = '/dashboard'
  }

  const handleSkip = () => {
    setStep(2)
  }

  const completeOnboarding = handleStep3Complete;
  const prevStep = () => setStep(step - 1);

  const handleGoalChange = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((item) => item !== goal)
        : [...prev.goals, goal]
    }));
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
                  value={formData.dateOfBirth}
                  onChange={(date) => setFormData(prev => ({...prev, dateOfBirth: date}))}
                />
                {fieldErrors.dateOfBirth && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Biological Sex
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData(prev => ({...prev, sex: e.target.value}))}
                  className="mt-1 block w-full rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="intersex">Intersex</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {fieldErrors.sex && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.sex}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Height
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({...prev, height: e.target.value}))}
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
                {fieldErrors.height && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.height}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A5C58]">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                  placeholder="70"
                  className="mt-1 block w-full rounded-xl border border-[#A8CECC] bg-white p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                />
                {fieldErrors.weight && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.weight}</p>}
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
                          checked={formData.conditions.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) setFormData(p => ({...p, conditions: [...p.conditions, item]}));
                            else setFormData(p => ({...p, conditions: p.conditions.filter(i => i !== item)}));
                          }}
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
              {fieldErrors.conditions && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.conditions}</p>}

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

              {formData.sex === "female" && (
                <div className="flex items-center justify-between rounded-xl border border-[#D0F4F2] bg-[#D0F4F2] p-4">
                  <span className="text-sm font-medium text-[#0A5C58]">
                    Are you currently pregnant?
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.isPregnant}
                    onChange={(e) => setFormData(p => ({...p, isPregnant: e.target.checked}))}
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
                  value={noMedications ? 'None' : formData.medications.join(', ')}
                  disabled={noMedications}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(p => ({...p, medications: val ? val.split(',').map(s=>s.trim()).filter(Boolean) : []}))
                  }}
                  className="mt-1 block w-full rounded-xl border border-[#A8CECC] p-3 shadow-sm outline-none transition focus:border-[#16AFA2]"
                  placeholder="List medications you take regularly..."
                />
                <label className="flex items-center mt-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={noMedications} 
                    onChange={(e) => {
                       setNoMedications(e.target.checked);
                       if (e.target.checked) setFormData(p => ({...p, medications: ['None']}));
                       else setFormData(p => ({...p, medications: []}));
                    }} 
                    className="h-4 w-4 rounded border-[#A8CECC] text-[#16AFA2] focus:ring-[#16AFA2]" 
                  />
                  <span className="ml-2 text-sm text-[#0A5C58]">No current medications</span>
                </label>
                {fieldErrors.medications && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.medications}</p>}
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
                    formData.goals && formData.goals.includes(goal)
                      ? "border-[#16AFA2] bg-[#D0F4F2]"
                      : "border-[#D0F4F2] hover:border-[#16AFA2] hover:bg-[#D0F4F2]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.goals && formData.goals.includes(goal)}
                    onChange={() => handleGoalChange(goal)}
                    className="h-4 w-4 rounded border-[#A8CECC] text-[#16AFA2] focus:ring-[#16AFA2]"
                  />
                  <span className="ml-3 font-medium text-[#0A5C58]">
                    {goal}
                  </span>
                </label>
              ))}
              <div className="mt-1">
                {fieldErrors.goals && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.goals}</p>}
              </div>
              
              <div className="mt-8">
                <label className="block text-sm font-medium text-[#0A5C58]">Test Frequency</label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {["Monthly", "Quarterly", "Yearly", "Rarely"].map((freq) => (
                    <label key={freq} className={`cursor-pointer rounded-xl border p-3 transition-colors ${formData.testFrequency === freq ? 'border-[#16AFA2] bg-[#D0F4F2]' : 'border-[#D0F4F2] hover:bg-[#D0F4F2]'}`}>
                      <div className="flex items-center">
                        <input type="radio" checked={formData.testFrequency === freq} onChange={() => setFormData(p => ({...p, testFrequency: freq}))} className="h-4 w-4 text-[#16AFA2]" />
                        <span className="ml-2 text-sm text-[#0A5C58]">{freq}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {fieldErrors.testFrequency && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.testFrequency}</p>}
              </div>

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
            {step === 1 && (
              <button
                onClick={handleSkip}
                className="text-sm font-semibold text-[#7AB8B5] hover:text-[#4A9B97]"
              >
                Skip for now
              </button>
            )}

            <button
              onClick={() => step === 1 ? handleStep1Next() : step === 2 ? handleStep2Next() : handleStep3Complete()}
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
