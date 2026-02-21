import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData, Project } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function ProjectDialog({ open, onClose, project }: ProjectDialogProps) {
  const { addProject, updateProject, advisors } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    project_id: '',
    title_th: '',
    title_en: '',
    description: '',
    advisor: '',
    year: new Date().getFullYear(),
    members: [''],
    document_url: '',
    tags: [],
    status: 'Draft',
    type: 'individual',
    has_award: false,
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        project_id: project.project_id,
        title_th: project.title_th,
        title_en: project.title_en,
        description: project.description,
        advisor: project.advisor,
        year: project.year,
        members: project.members.length > 0 ? project.members : [''],
        document_url: project.document_url,
        tags: project.tags,
        status: project.status,
        type: project.type,
        has_award: project.has_award,
      });
    } else {
      setFormData({
        project_id: '',
        title_th: '',
        title_en: '',
        description: '',
        advisor: '',
        year: new Date().getFullYear(),
        members: [''],
        document_url: '',
        tags: [],
        status: 'Draft',
        type: 'individual',
        has_award: false,
      });
    }
    setErrors({});
    setNewTag('');
  }, [project, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_id.trim()) {
      newErrors.project_id = 'กรุณาระบุรหัสโครงงาน';
    }

    if (formData.title_th.length < 5) {
      newErrors.title_th = 'ชื่อโปรเจคต้องมีความยาวอย่างน้อย 5 ตัวอักษร';
    }

    if (!formData.advisor) {
      newErrors.advisor = 'กรุณาเลือกอาจารย์ที่ปรึกษา';
    }

    if (!formData.description) {
      newErrors.description = 'กรุณากรอกรายละเอียดโปรเจค';
    }

    if (formData.type === 'group' && formData.members.filter(m => m.trim()).length < 2) {
      newErrors.members = 'โปรเจคกลุ่มต้องมีสมาชิกอย่างน้อย 2 คน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้อง');
      return;
    }

    const cleanMembers = formData.members.filter(m => m.trim() !== '');
    const projectData = { ...formData, members: cleanMembers };

    if (project) {
      updateProject(project.id, projectData);
      toast.success('อัปเดตข้อมูลโปรเจคสำเร็จ');
    } else {
      addProject({ ...projectData, createdBy: user?.id, created_by: user?.id } as Omit<Project, 'id'> & { created_by?: string });
      toast.success('เพิ่มข้อมูลโปรเจคสำเร็จ');
    }

    onClose();
  };

  const handleAddMember = () => {
    setFormData({ ...formData, members: [...formData.members, ''] });
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: newMembers.length > 0 ? newMembers : [''] });
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData({ ...formData, members: newMembers });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  if (!open) return null;

  const availableTags = [
    'Web Application',
    'Mobile App',
    'AI/ML',
    'IoT',
    'Data Science',
    'Blockchain',
    'Game Development',
    'Cloud Computing',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">
            {project ? 'แก้ไขข้อมูลโปรเจค' : 'เพิ่มโปรเจคใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">ประเภทโปรเจค *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="individual"
                  checked={formData.type === 'individual'}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      type: e.target.value as 'individual' | 'group',
                      members: [''],
                    });
                  }}
                  className="w-4 h-4"
                />
                <span>เดี่ยว</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="group"
                  checked={formData.type === 'group'}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      type: e.target.value as 'individual' | 'group',
                      members: ['', ''],
                    });
                  }}
                  className="w-4 h-4"
                />
                <span>กลุ่ม</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">รหัสโครงงาน *</label>
            <input
              type="text"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.project_id ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="เช่น PRJ-2568-001"
            />
            {errors.project_id && (
              <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">ชื่อโปรเจค (ภาษาไทย) *</label>
            <input
              type="text"
              value={formData.title_th}
              onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title_th ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ระบบจัดการข้อมูลนักศึกษา"
            />
            {errors.title_th && (
              <p className="text-red-500 text-sm mt-1">{errors.title_th}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">ชื่อโปรเจค (ภาษาอังกฤษ)</label>
            <input
              type="text"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Student Management System"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">รายละเอียด *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="อธิบายรายละเอียดโปรเจค..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">อาจารย์ที่ปรึกษา *</label>
              <select
                value={formData.advisor}
                onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.advisor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกอาจารย์</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.name}>
                    {advisor.name}
                  </option>
                ))}
              </select>
              {errors.advisor && (
                <p className="text-red-500 text-sm mt-1">{errors.advisor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">ปีการศึกษา *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={2020}
                max={2030}
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              สมาชิก {formData.type === 'group' && '*'}
            </label>
            <div className="space-y-2">
              {formData.members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`สมาชิกคนที่ ${index + 1}`}
                  />
                  {(formData.type === 'group' && formData.members.length > 1) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {formData.type === 'group' && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มสมาชิก
                </button>
              )}
            </div>
            {errors.members && (
              <p className="text-red-500 text-sm mt-1">{errors.members}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">แท็ก</label>
            <div className="flex gap-2 mb-2">
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกแท็ก</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                เพิ่ม
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">ลิงก์เอกสาร/ไฟล์ผลงาน</label>
            <input
              type="url"
              value={formData.document_url}
              onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">สถานะ *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Project['status'] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_award}
                onChange={(e) => setFormData({ ...formData, has_award: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">ได้รับรางวัล</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {project ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มโปรเจค'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
