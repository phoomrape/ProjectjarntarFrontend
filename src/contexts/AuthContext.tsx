import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { authApi, setToken, removeToken, getToken } from '../services/api';

type UserRole = 'admin' | 'student' | 'teacher' | 'alumni';

interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  student_id?: string;
  alumni_id?: string;
  first_name?: string;
  last_name?: string;
  faculty?: string;
  department?: string;
  phone?: string;
  year?: number;
  advisor_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend role → frontend role
function mapRole(backendRole: string): UserRole {
  if (backendRole === 'advisor') return 'teacher';
  return backendRole as UserRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = getToken();
    if (savedUser && savedToken) {
      return JSON.parse(savedUser);
    }
    // Clear stale data
    localStorage.removeItem('user');
    removeToken();
    return null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(username, password);

      if (res.success) {
        const { token, user: backendUser } = res.data;
        setToken(token);

        // Build frontend user object
        const frontendUser: User = {
          id: String(backendUser.id),
          username: backendUser.username,
          role: mapRole(backendUser.role),
          name: backendUser.username,
          email: '',
        };

        // Optionally fetch full profile to get extra fields
        try {
          const profileRes = await authApi.getProfile();
          if (profileRes.success && profileRes.data) {
            const p = profileRes.data as Record<string, unknown>;
            frontendUser.name = (p.name as string) || (p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : '') || backendUser.username;
            frontendUser.email = (p.email as string) || '';
            frontendUser.faculty = (p.faculty as string) || '';
            frontendUser.department = (p.department as string) || '';
            frontendUser.phone = (p.phone as string) || '';
            if (p.first_name) frontendUser.first_name = String(p.first_name);
            if (p.last_name) frontendUser.last_name = String(p.last_name);
            if (p.student_id) frontendUser.student_id = String(p.student_id);
            if (p.advisor_id) frontendUser.advisor_id = String(p.advisor_id);
            if (p.year) frontendUser.year = Number(p.year);
            // Detect alumni: backend returns is_alumni flag for users with alumni record
            if (p.is_alumni) {
              frontendUser.role = 'alumni';
              frontendUser.alumni_id = String(p.alumni_id || '');
            }
          }
        } catch {
          // Profile fetch failed — continue with basic info
        }

        setUser(frontendUser);
        localStorage.setItem('user', JSON.stringify(frontendUser));
        toast.success('เข้าสู่ระบบสำเร็จ');
        return true;
      }

      toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    removeToken();
    toast.success('ออกจากระบบสำเร็จ');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
