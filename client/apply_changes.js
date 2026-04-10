const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'OnboardingWizard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(
  'import DateOfBirthPicker from "./DateOfBirthPicker";',
  'import DateOfBirthPicker from "./DateOfBirthPicker";\nimport { supabase } from "../lib/supabase";'
);

// State
content = content.replace(
  /const \[step, setStep\] = useState\(1\);[\s\S]*?const navigate = useNavigate\(\);/,
  `const [step, setStep] = useState(1);
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
  const [heightUnit, setHeightUnit] = useState("cm");`
);

// Handlers
const handlers = `
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
`;

content = content.replace(
  /const nextStep = \(\) => setStep\(step \+ 1\);\n\s*const prevStep = \(\) => setStep\(step - 1\);\n\s*const completeOnboarding = \(\) => setIsCompleted\(true\);/,
  `const prevStep = () => setStep(step - 1);\n${handlers}`
);

content = content.replace(
  /const handleGoalChange =[\s\S]*?\};\n/,
  `const handleGoalChange = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((item) => item !== goal)
        : [...prev.goals, goal]
    }));
  };
`
);

// Step 1 UI
content = content.replace(
  /<DateOfBirthPicker\s+value=\{dob\}\s+onChange=\{\(date\) => setDob\(date\)\}\s+\/>/,
  `<DateOfBirthPicker
    value={formData.dateOfBirth}
    onChange={(date) => setFormData(prev => ({...prev, dateOfBirth: date}))}
  />
  {fieldErrors.dateOfBirth && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.dateOfBirth}</p>}`
);

content = content.replace(
  /<select/g,
  '<select'
);

content = content.replace(
  /<select\n*\s*onChange=\{\(e\) => setSex\(e\.target\.value\)\}/,
  `<select
    value={formData.sex}
    onChange={(e) => setFormData(prev => ({...prev, sex: e.target.value}))}`
);
content = content.replace(
  /<\/select>\s+<\/div>/,
  `</select>\n{fieldErrors.sex && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.sex}</p>}\n</div>`
);

content = content.replace(
  /<input\n*\s*type="number"\n*\s*placeholder=\{heightUnit === "cm" \? "175" : "5\.8"\}\n*\s*className="block/g,
  `<input
    type="number"
    value={formData.height}
    onChange={(e) => setFormData(prev => ({...prev, height: e.target.value}))}
    placeholder={heightUnit === "cm" ? "175" : "5.8"}
    className="block`
);
content = content.replace(
  /<\/select>\s+<\/div>\s+<\/div>/,
  `</select>\n</div>\n{fieldErrors.height && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.height}</p>}\n</div>`
);

content = content.replace(
  /<input\n*\s*type="number"\n*\s*placeholder="70"\n*\s*className="mt-1 block/g,
  `<input
    type="number"
    value={formData.weight}
    onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
    placeholder="70"
    className="mt-1 block`
);


// Step 2 UI
content = content.replace(
  /<input\n*\s*type="checkbox"\n*\s*className="h-4 w-4 rounded border-\[#A8CECC\] text-\[#16AFA2\] focus:ring-\[#16AFA2\]"\n*\s*\/>/g,
  `<input
    type="checkbox"
    checked={formData.conditions.includes(item)}
    onChange={(e) => {
      if (e.target.checked) setFormData(p => ({...p, conditions: [...p.conditions, item]}));
      else setFormData(p => ({...p, conditions: p.conditions.filter(i => i !== item)}));
    }}
    className="h-4 w-4 rounded border-[#A8CECC] text-[#16AFA2] focus:ring-[#16AFA2]"
  />`
);

content = content.replace(
  /<textarea\n*\s*rows="3"\n*\s*className="mt-1/g,
  `<textarea
    rows="3"
    value={noMedications ? 'None' : formData.medications.join(', ')}
    disabled={noMedications}
    onChange={(e) => {
      const val = e.target.value;
      setFormData(p => ({...p, medications: val ? val.split(',').map(s=>s.trim()).filter(Boolean) : []}))
    }}
    className="mt-1`
);
content = content.replace(
  /placeholder="List medications you take regularly\.\.\."\n*\s*\/>/,
  `placeholder="List medications you take regularly..."
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
  {fieldErrors.medications && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.medications}</p>}`
);

// Step 3 UI
content = content.replace(
  /checked=\{selectedGoals\.includes\(goal\)\}/g,
  `checked={formData.goals && formData.goals.includes(goal)}`
);

content = content.replace(
  /<\/label>\n*\s*\)\)}\n*\s*<\/div>\n*\s*<\/div>\n*\s*\)}/,
  `</label>
      ))}
      <div className="mt-1">
        {fieldErrors.goals && <p style={{fontSize:'12px', color:'#DC2626', marginTop:'4px'}}>{fieldErrors.goals}</p>}
      </div>
      
      <div className="mt-8">
        <label className="block text-sm font-medium text-[#0A5C58]">Test Frequency</label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {["Monthly", "Quarterly", "Yearly", "Rarely"].map((freq) => (
            <label key={freq} className={\`cursor-pointer rounded-xl border p-3 transition-colors \${formData.testFrequency === freq ? 'border-[#16AFA2] bg-[#D0F4F2]' : 'border-[#D0F4F2] hover:bg-[#D0F4F2]'}\`}>
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
)}`
);

// Buttons
content = content.replace(
  /<button\n*\s*onClick=\{step === 3 \? completeOnboarding : nextStep\}\n*\s*className="text-sm font-semibold text-\[#7AB8B5\] hover:text-\[#4A9B97\]"\n*\s*>\n*\s*Skip for now\n*\s*<\/button>/,
  `{step === 1 && (
    <button
      onClick={handleSkip}
      className="text-sm font-semibold text-[#7AB8B5] hover:text-[#4A9B97]"
    >
      Skip for now
    </button>
  )}`
);

content = content.replace(
  /<button\n*\s*onClick=\{step === 3 \? completeOnboarding : nextStep\}\n*\s*className="rounded-xl bg-\[#16AFA2\]/g,
  `<button
    onClick={() => step === 1 ? handleStep1Next() : step === 2 ? handleStep2Next() : handleStep3Complete()}
    className="rounded-xl bg-[#16AFA2]`
);

// Fix field errors display in step 1 & 2
content = content.replace(
  /placeholder="70"\n*\s*className="mt-1 block/g,
  `placeholder="70"\n                className="mt-1 block`
);

fs.writeFileSync(filePath, content, 'utf8');

// Also do Profile setup script
const profilePath = path.join(__dirname, 'src', 'components', 'Profile.jsx');
let profileContent = fs.readFileSync(profilePath, 'utf8');

profileContent = profileContent.replace(
  'import { useNavigate } from \'react-router-dom\';',
  'import { useNavigate } from \'react-router-dom\';\nimport { supabase } from \'../lib/supabase\';'
);

profileContent = profileContent.replace(
  /const \[data, setData\] = useState\(\{[\s\S]*?weeklyDigest: true,\n\s*\}\);/,
  `const [data, setData] = useState({
    firstName: userName,
    lastName: '',
    email: '',
    dob: '',
    sex: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    ethnicity: '',

    conditions: [],
    medications: [],
    allergies: 'None',
    pregnant: false,
    familyHistory: [],

    language: 'English',
    units: 'Metric',
    visibility: 'Only me',
    emailNotifs: true,
    weeklyDigest: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        console.error('Profile fetch error:', error)
        return
      }
      
      if (profile) {
        // Populate all form fields with saved data
        setData(prev => ({
          ...prev,
          firstName: profile.full_name?.split(' ')[0] || session.user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: profile.full_name?.split(' ').slice(1).join(' ') || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: session.user.email || '',
          dob: profile.date_of_birth || '',
          sex: profile.sex || '',
          height: profile.height || '',
          weight: profile.weight || '',
          conditions: profile.conditions || [],
          medications: profile.medications || [],
          allergies: profile.allergies || '',
          language: profile.language || 'English',
          units: profile.units || 'metric',
          pregnant: profile.pregnant || false,
          familyHistory: profile.family_history || []
        }))
      }
    }
    
    fetchProfile()
  }, [])`
);

profileContent = profileContent.replace(
  /const handleSave = \(section\) => \{\n\s*setSaving\(p => \(\{ \.\.\.p, \[section\]: true \}\)\);\n\s*setTimeout\(\(\) => \{\n\s*setSaving\(p => \(\{ \.\.\.p, \[section\]: false \}\)\);\n\s*setSaved\(p => \(\{ \.\.\.p, \[section\]: true \}\)\);\n\s*setEditMode\(p => \(\{ \.\.\.p, \[section\]: false \}\)\);\n\s*showToast\(\`\$\{section.charAt\(0\).toUpperCase\(\) \+ section.slice\(1\)\} updated successfully\`\);\n\s*setTimeout\(\(\) => setSaved\(p => \(\{ \.\.\.p, \[section\]: false \}\)\), 2000\);\n\s*\}, 1000\);\n\s*\};/,
  `const saveProfileSection = async (sectionData) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { success: false }
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        ...sectionData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    
    if (error) {
      console.error('Save error:', error)
      return { success: false, error }
    }
    
    return { success: true }
  }

  const handleSave = async (section) => {
    setSaving(p => ({ ...p, [section]: true }));
    
    let sectionData = {};
    if (section === 'personal') {
      sectionData = {
        full_name: \`\${data.firstName} \${data.lastName}\`.trim(),
        sex: data.sex,
        height: parseFloat(data.height) || null,
        weight: parseFloat(data.weight) || null,
      };
    } else if (section === 'health') {
      sectionData = {
        conditions: data.conditions,
        medications: data.medications,
        allergies: data.allergies,
      };
    } else if (section === 'preferences') {
      sectionData = {
        language: data.language,
        units: data.units,
      };
    }

    const { success, error } = await saveProfileSection(sectionData);

    setSaving(p => ({ ...p, [section]: false }));
    
    if (success) {
      setSaved(p => ({ ...p, [section]: true }));
      setEditMode(p => ({ ...p, [section]: false }));
      showToast(\`\${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully\`);
      setTimeout(() => setSaved(p => ({ ...p, [section]: false })), 2000);
    } else {
      showToast('Update failed: ' + (error?.message || 'Unknown error'), true);
    }
  };`
);

fs.writeFileSync(profilePath, profileContent, 'utf8');
