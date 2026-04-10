const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Profile.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace all occurrences of data. with profileData. 
// AND setData( with setProfileData(
content = content.replace(/\bdata\./g, 'profileData.');
content = content.replace(/\bsetData\(/g, 'setProfileData(');
content = content.replace(/\bdata,/g, 'profileData,');

// 2. Fix savePersonalDetails
const savePersonalDetailsCode = `const savePersonalDetails = async () => {
    try {
      setSaving(prev => ({...prev, personal: true}))
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const fullName = \`\${profileData.firstName || ''} \${profileData.lastName || ''}\`.trim()

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          date_of_birth: profileData.dateOfBirth || null,
          sex: profileData.biologicalSex || null,
          height: profileData.height ? Number(profileData.height) : null,
          weight: profileData.weight ? Number(profileData.weight) : null,
          height_unit: profileData.heightUnit || 'cm',
          weight_unit: profileData.weightUnit || 'kg',
          ethnicity: profileData.ethnicity || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (profileError) {
        console.error('Save error:', profileError)
        return
      }

      // Update display name in auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      console.log('Personal details saved successfully')
      setEditMode(prev => ({ ...prev, personal: false }))
      
      // Show success toast
      showToast('Personal details updated successfully')

    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(prev => ({...prev, personal: false}))
    }
  }`;

// Inject savePersonalDetails
content = content.replace(
  /const saveProfileSection = async \(sectionData\) => \{/,
  savePersonalDetailsCode + '\n\n  const saveProfileSection = async (sectionData) => {'
);
content = content.replace(
  /    const \{ data: \{ session \} \} = await supabase.auth.getSession\(\)\n    if \(!session\) return \{ success: false \}/,
  `    const { data: { session } } = await supabase.auth.getSession()\n    if (!session) return { success: false }`
);

// We need to also patch handleSave to call savePersonalDetails if section === 'personal'
content = content.replace(
  /const handleSave = async \(section\) => \{[\s\S]*?showToast\('Update failed: ' \+ \(error\?\.message \|\| 'Unknown error'\), true\);\n\s*\}\n\s*\};/,
  `const handleSave = async (section) => {
    if (section === 'personal') {
      await savePersonalDetails();
      return;
    }

    setSaving(p => ({ ...p, [section]: true }));

    let sectionData = {};
    if (section === 'health') {
      sectionData = {
        conditions: profileData.conditions,
        medications: profileData.medications,
        allergies: profileData.allergies,
      };
    } else if (section === 'preferences') {
      sectionData = {
        language: profileData.language,
        units: profileData.units,
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

// 3. Fix the sidebar avatar and name
// V is usually first char of userName, replace that chunk
content = content.replace(
  /\{userName\?\.charAt\(0\)\}/g,
  `{(profileData.firstName?.[0] || '') + (profileData.lastName?.[0] || '') || profileData.email?.[0]?.toUpperCase() || 'U'}`
);

content = content.replace(
  /\{userName\}/g,
  `{profileData.firstName || profileData.email?.split('@')[0] || 'User'}`
);

// 4. Score display
content = content.replace(
  /Score: [^\<]+/g,
  `{typeof latestScore !== 'undefined' && latestScore ? \`Score: \${latestScore}/10\` : 'No reports yet'}`
);

fs.writeFileSync(filePath, content, 'utf8');
