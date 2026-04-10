import sys

file_path = r"d:\Projects\SNJVNI.ai\client\src\components\Profile.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace data with profileData
content = content.replace("data.", "profileData.")
content = content.replace("setData(", "setProfileData(")

# Now fix the saveProfileSection and handleSave logic as requested by user
# We need to insert savePersonalDetails

save_personal = """
  const savePersonalDetails = async () => {
    try {
      setSaving(prev => ({...prev, personal: true}))
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const fullName = f"{profileData.firstName} {profileData.lastName}".replace('f"', '`').replace('"', '`').strip() 
      // Workaround for python string formatting vs javascript template literals:
      const javascriptFullName = `${profileData.firstName} ${profileData.lastName}`.trim()

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: javascriptFullName,
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
        data: { full_name: javascriptFullName }
      })

      console.log('Personal details saved successfully')
      setEditMode(prev => ({ ...prev, personal: false }))
      
      // Show success toast
      showToast('Personal details updated successfully')
      setTimeout(() => setSaved(p => ({ ...p, personal: false })), 2000);

    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(prev => ({...prev, personal: false}))
    }
  }

"""

# Insert savePersonalDetails before saveProfileSection
content = content.replace(
    "const saveProfileSection = async (sectionData) => {",
    save_personal.replace('f"', '`').replace('"', '"') + "\n  const saveProfileSection = async (sectionData) => {"
)

# And fix the fetch session inside saveProfileSection which will have been broken to { profileData: { session } }
content = content.replace(
    "const { profileData: { session } } = await supabase.auth.getSession()",
    "const { data: { session } } = await supabase.auth.getSession()"
)
content = content.replace(
    "const { profileData, error } = await supabase",
    "const { data, error } = await supabase"
)
content = content.replace(
    "const { profileData: profileData, error } = await",
    "const { data: profileData, error } = await"
)

# Replacing handleSave
handleSaveReplacement = """
  const handleSave = async (section) => {
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
      showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
      setTimeout(() => setSaved(p => ({ ...p, [section]: false })), 2000);
    } else {
      showToast('Update failed: ' + (error?.message || 'Unknown error'), true);
    }
  };
"""

import re
content = re.sub(r'const handleSave = async \(section\) => \{.*?(?=\n\s*const showToast)', handleSaveReplacement.strip() + '\n', content, flags=re.DOTALL)

# Avatar replacements
content = content.replace(
    "{userName?.charAt(0)}", 
    "{(profileData.firstName?.[0] || '') + (profileData.lastName?.[0] || '') || profileData.email?.[0]?.toUpperCase() || 'U'}"
)

# Wait, there's another replace for userName the main name
content = content.replace(
    "<h3>{userName}</h3>",
    "<h3>{profileData.firstName || profileData.email?.split('@')[0] || 'User'}</h3>"
)

# Score replace
content = re.sub(
    r'Score: \d+/\d+',
    "{typeof latestScore !== 'undefined' ? `Score: ${latestScore}/10` : 'No reports yet'}",
    content
)

# Fix back the session object renaming
content = content.replace("const { profileData: { session }, error: sessionError }", "const { data: { session }, error: sessionError }")
content = content.replace("const { profileData: profile, error: profileError }", "const { data: profile, error: profileError }")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("done")
