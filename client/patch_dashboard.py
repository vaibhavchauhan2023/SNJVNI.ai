import sys, re, os

def fix_dashboard(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add imports to top
    if "import { supabase }" not in content:
        content = content.replace("import { useNavigate } from 'react-router-dom';", 
            "import { useNavigate } from 'react-router-dom';\nimport { supabase } from '../lib/supabase.js';")
    
    if "import { useAuth }" not in content:
        content = content.replace("import { supabase }", "import { useAuth } from '../context/AuthContext';\nimport { supabase }")

    # 2. Add auth hook inside component
    if "const { user, loading: authLoading } = useAuth()" not in content:
        content = content.replace("const [data, setData] = useState(null);", 
            "const [data, setData] = useState(null);\n  const { user, loading: authLoading } = useAuth();")

    # 3. Modify fetch logic
    fetch_replacement = """  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          return
        }
        
        if (!session || !session.user) {
          console.log('No session yet — waiting for auth')
          return
        }
        
        const userId = session.user.id
        console.log('Dashboard loading for user:', userId)

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (res.ok) {
           const dbData = await res.json()
           setData(dbData)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user, authLoading]);"""

    # remove old useEffect entirely
    content = re.sub(r"  useEffect\(\(\) => \{\n    const fetchDashboard = async \(\) => \{.+?fetchDashboard\(\)\n  \}, \[\]\);", fetch_replacement, content, flags=re.DOTALL)

    # 4. Add Loading Screen
    loading_screen = """  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg) } }`}} />
        <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTop: '3px solid #0D9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return ("""
    
    content = content.replace("  return (\n    <div className=\"min-h-screen", loading_screen + "\n    <div className=\"min-h-screen")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

base_dir = r"d:\Projects\SNJVNI.ai\client\src"

fix_dashboard(os.path.join(base_dir, "components", "Dashboard.jsx"))

def fix_imports(file_path):
    if not os.path.exists(file_path): return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    needs_save = False
    
    # Needs supabase?
    if ("supabase.from" in content or "supabase.auth" in content) and "import { supabase }" not in content:
        # Determine relative path depth
        depth = file_path.replace(base_dir, "").count(os.sep)
        prefix = "../" if depth > 1 else "./"
        if depth > 2: prefix = "../../"
        import_str = f"\nimport {{ supabase }} from '{prefix}lib/supabase.js';\n"
        content = content.replace("import React", "import React" + import_str, 1) if "import React" in content else import_str + content
        needs_save = True

    if needs_save:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)


files_to_check = [
    os.path.join(base_dir, "components", "ReportDashboard.jsx"),
    os.path.join(base_dir, "components", "Profile.jsx"),
    os.path.join(base_dir, "pages", "History.jsx"), # Guessing path
    os.path.join(base_dir, "pages", "Trends.jsx"),  # Guessing path
    os.path.join(base_dir, "components", "History.jsx"),
    os.path.join(base_dir, "components", "Trends.jsx")
]

for p in files_to_check:
    fix_imports(p)

print("done")
