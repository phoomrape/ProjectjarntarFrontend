import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { studentsApi, alumniApi, advisorsApi, projectsApi } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  department: string;
  year: number;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Graduated' | 'Suspended';
}

export interface EducationEntry {
  years: string;
  institution: string;
  address: string;
  grade: string;
}

export interface ExperienceEntry {
  years: string;
  company: string;
  position: string;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface Alumni {
  id: string;
  alumni_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  department: string;
  graduation_year: number;
  workplace: string;
  position: string;
  contact_info: string;
  portfolio: string;
  photo_url: string;
  employment_status: 'employed' | 'seeking';
  // New portfolio fields
  about_me: string;
  email: string;
  address: string;
  phone: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  custom_fields: CustomField[];
}

export interface ProjectComment {
  id: string;
  projectId: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface Project {
  id: string;
  project_id: string;
  title_th: string;
  title_en: string;
  description: string;
  advisor: string;
  year: number;
  members: string[];
  document_url: string;
  tags: string[];
  status: 'Draft' | 'Approved' | 'Completed';
  type: 'individual' | 'group';
  has_award: boolean;
  comments?: ProjectComment[];
  createdBy?: string;
}

export interface Advisor {
  id: string;
  advisor_id: string;
  name: string;
  faculty: string;
  department: string;
  email: string;
  phone: string;
}

interface DataContextType {
  students: Student[];
  alumni: Alumni[];
  projects: Project[];
  advisors: Advisor[];
  refreshAllData: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  graduateStudents: (studentIds: string[]) => Promise<void>;
  updateStudentStatus: (studentIds: string[], status: 'Active' | 'Suspended' | 'Graduated') => Promise<void>;
  addAlumni: (alumni: Omit<Alumni, 'id'>) => Promise<void>;
  updateAlumni: (id: string, alumni: Partial<Alumni>) => Promise<void>;
  deleteAlumni: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addProjectComment: (projectId: string, authorName: string, authorRole: string, message: string) => Promise<void>;
  addAdvisor: (advisor: Omit<Advisor, 'id'>) => Promise<void>;
  updateAdvisor: (id: string, advisor: Partial<Advisor>) => Promise<void>;
  deleteAdvisor: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─── Helper: map backend row → frontend interfaces ───────────────
function mapStudent(row: Record<string, unknown>): Student {
  return {
    id: String(row.id),
    student_id: String(row.student_id || ''),
    first_name: String(row.first_name || ''),
    last_name: String(row.last_name || ''),
    faculty: String(row.faculty || ''),
    department: String(row.department || ''),
    year: Number(row.year || 1),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    status: (row.status as Student['status']) || 'Active',
  };
}

function mapAlumni(row: Record<string, unknown>): Alumni {
  return {
    id: String(row.id),
    alumni_id: String(row.alumni_id || ''),
    first_name: String(row.first_name || ''),
    last_name: String(row.last_name || ''),
    faculty: String(row.faculty || ''),
    department: String(row.department || ''),
    graduation_year: Number(row.graduation_year || 0),
    workplace: String(row.workplace || ''),
    position: String(row.position || ''),
    contact_info: String(row.contact_info || ''),
    portfolio: String(row.portfolio || ''),
    photo_url: String(row.photo_url || ''),
    employment_status: (row.employment_status as Alumni['employment_status']) || 'seeking',
    about_me: String(row.about_me || ''),
    email: String(row.email || ''),
    address: String(row.address || ''),
    phone: String(row.phone || ''),
    skills: Array.isArray(row.skills) ? row.skills : typeof row.skills === 'string' && row.skills ? JSON.parse(row.skills as string) : [],
    education: Array.isArray(row.education) ? row.education : typeof row.education === 'string' && row.education ? JSON.parse(row.education as string) : [],
    experience: Array.isArray(row.experience) ? row.experience : typeof row.experience === 'string' && row.experience ? JSON.parse(row.experience as string) : [],
    custom_fields: Array.isArray(row.custom_fields) ? row.custom_fields : typeof row.custom_fields === 'string' && row.custom_fields ? JSON.parse(row.custom_fields as string) : [],
  };
}

function mapProject(row: Record<string, unknown>): Project {
  const comments = Array.isArray(row.comments)
    ? row.comments
    : typeof row.comments === 'string' && row.comments
      ? JSON.parse(row.comments as string)
      : [];
  const members = Array.isArray(row.members)
    ? row.members
    : typeof row.members === 'string' && row.members
      ? JSON.parse(row.members as string)
      : [];
  const tags = Array.isArray(row.tags)
    ? row.tags
    : typeof row.tags === 'string' && row.tags
      ? JSON.parse(row.tags as string)
      : [];

  return {
    id: String(row.id),
    project_id: String(row.project_id || ''),
    title_th: String(row.title_th || ''),
    title_en: String(row.title_en || ''),
    description: String(row.description || ''),
    advisor: String(row.advisor || ''),
    year: Number(row.year || 0),
    members,
    document_url: String(row.document_url || ''),
    tags,
    status: (row.status as Project['status']) || 'Draft',
    type: (row.type as Project['type']) || 'individual',
    has_award: Boolean(row.has_award),
    comments,
    createdBy: row.created_by ? String(row.created_by as string) : (row.createdBy ? String(row.createdBy) : undefined),
  };
}

function mapAdvisor(row: Record<string, unknown>): Advisor {
  return {
    id: String(row.id),
    advisor_id: String(row.advisor_id || ''),
    name: String(row.name || ''),
    faculty: String(row.faculty || ''),
    department: String(row.department || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);

  // ─── Fetch helpers ─────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentsApi.getAll({ limit: '1000' });
      setStudents(res.data.map(mapStudent));
    } catch {
      // silently fail — user may not be logged in yet
    }
  }, []);

  const fetchAlumni = useCallback(async () => {
    try {
      const res = await alumniApi.getAll({ limit: '1000' });
      setAlumni(res.data.map(mapAlumni));
    } catch {
      // silently fail
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectsApi.getAll({ limit: '1000' });
      setProjects(res.data.map(mapProject));
    } catch {
      // silently fail
    }
  }, []);

  const fetchAdvisors = useCallback(async () => {
    try {
      const res = await advisorsApi.getAll({ limit: '1000' });
      setAdvisors(res.data.map(mapAdvisor));
    } catch {
      // silently fail
    }
  }, []);

  // Refresh all data helper
  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchStudents(), fetchAlumni(), fetchProjects(), fetchAdvisors()]);
  }, [fetchStudents, fetchAlumni, fetchProjects, fetchAdvisors]);

  // Load data when authenticated, clear when logged out
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    } else {
      setStudents([]);
      setAlumni([]);
      setProjects([]);
      setAdvisors([]);
    }
  }, [isAuthenticated, refreshAllData]);

  // ─── CRUD operations ──────────────────────────────────────────

  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      await studentsApi.create(student as unknown as Record<string, unknown>);
      toast.success('เพิ่มนักศึกษาสำเร็จ');
      await fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถเพิ่มนักศึกษาได้');
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    try {
      await studentsApi.update(id, student as unknown as Record<string, unknown>);
      toast.success('แก้ไขข้อมูลนักศึกษาสำเร็จ');
      await fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถแก้ไขข้อมูลนักศึกษาได้');
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await studentsApi.delete(id);
      toast.success('ลบนักศึกษาสำเร็จ');
      await fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถลบนักศึกษาได้');
    }
  };

  const graduateStudents = async (studentIds: string[]) => {
    try {
      await studentsApi.graduate(studentIds);
      toast.success('สำเร็จการศึกษาเรียบร้อย');
      await fetchStudents();
      await fetchAlumni();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถดำเนินการได้');
    }
  };

  const updateStudentStatus = async (studentIds: string[], status: 'Active' | 'Suspended' | 'Graduated') => {
    try {
      await studentsApi.batchUpdateStatus(studentIds, status);
      toast.success('อัปเดตสถานะสำเร็จ');
      await fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const addAlumni = async (alumniData: Omit<Alumni, 'id'>) => {
    try {
      await alumniApi.create(alumniData as unknown as Record<string, unknown>);
      toast.success('เพิ่มศิษย์เก่าสำเร็จ');
      await fetchAlumni();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถเพิ่มศิษย์เก่าได้');
    }
  };

  const updateAlumni = async (id: string, alumniData: Partial<Alumni>) => {
    try {
      await alumniApi.update(id, alumniData as unknown as Record<string, unknown>);
      toast.success('แก้ไขข้อมูลศิษย์เก่าสำเร็จ');
      await fetchAlumni();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถแก้ไขข้อมูลศิษย์เก่าได้');
    }
  };

  const deleteAlumni = async (id: string) => {
    try {
      await alumniApi.delete(id);
      toast.success('ลบศิษย์เก่าสำเร็จ');
      await fetchAlumni();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถลบศิษย์เก่าได้');
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      await projectsApi.create(project as unknown as Record<string, unknown>);
      toast.success('เพิ่มโครงงานสำเร็จ');
      await fetchProjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถเพิ่มโครงงานได้');
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      await projectsApi.update(id, project as unknown as Record<string, unknown>);
      toast.success('แก้ไขโครงงานสำเร็จ');
      await fetchProjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถแก้ไขโครงงานได้');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsApi.delete(id);
      toast.success('ลบโครงงานสำเร็จ');
      await fetchProjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถลบโครงงานได้');
    }
  };

  const addProjectComment = async (projectId: string, authorName: string, authorRole: string, message: string) => {
    try {
      await projectsApi.addComment(projectId, { author_name: authorName, author_role: authorRole, message });
      toast.success('เพิ่มความคิดเห็นสำเร็จ');
      await fetchProjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถเพิ่มความคิดเห็นได้');
    }
  };

  const addAdvisor = async (advisor: Omit<Advisor, 'id'>) => {
    try {
      await advisorsApi.create(advisor as unknown as Record<string, unknown>);
      toast.success('เพิ่มอาจารย์ที่ปรึกษาสำเร็จ');
      await fetchAdvisors();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถเพิ่มอาจารย์ที่ปรึกษาได้');
    }
  };

  const updateAdvisor = async (id: string, advisor: Partial<Advisor>) => {
    try {
      await advisorsApi.update(id, advisor as unknown as Record<string, unknown>);
      toast.success('แก้ไขข้อมูลอาจารย์ที่ปรึกษาสำเร็จ');
      await fetchAdvisors();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถแก้ไขข้อมูลอาจารย์ที่ปรึกษาได้');
    }
  };

  const deleteAdvisor = async (id: string) => {
    try {
      await advisorsApi.delete(id);
      toast.success('ลบอาจารย์ที่ปรึกษาสำเร็จ');
      await fetchAdvisors();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ไม่สามารถลบอาจารย์ที่ปรึกษาได้');
    }
  };

  return (
    <DataContext.Provider
      value={{
        students,
        alumni,
        projects,
        advisors,
        refreshAllData,
        addStudent,
        updateStudent,
        deleteStudent,
        graduateStudents,
        updateStudentStatus,
        addAlumni,
        updateAlumni,
        deleteAlumni,
        addProject,
        updateProject,
        deleteProject,
        addProjectComment,
        addAdvisor,
        updateAdvisor,
        deleteAdvisor,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}