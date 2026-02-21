import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData, Advisor } from '../contexts/DataContext';
import { toast } from 'sonner';

interface AdvisorDialogProps {
  open: boolean;
  onClose: () => void;
  advisor: Advisor | null;
}

export default function AdvisorDialog({ open, onClose, advisor }: AdvisorDialogProps) {
  const { addAdvisor, updateAdvisor } = useData();
  const [formData, setFormData] = useState<Omit<Advisor, 'id'>>({
    advisor_id: '',
    name: '',
    faculty: '',
    department: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (advisor) {
      setFormData({
        advisor_id: advisor.advisor_id,
        name: advisor.name,
        faculty: advisor.faculty,
        department: advisor.department,
        email: advisor.email,
        phone: advisor.phone,
      });
    } else {
      setFormData({
        advisor_id: '',
        name: '',
        faculty: '',
        department: '',
        email: '',
        phone: '',
      });
    }
    setErrors({});
  }, [advisor, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'กรุณากรอกชื่ออาจารย์';
    }

    if (!formData.faculty) {
      newErrors.faculty = 'กรุณาเลือกคณะ';
    }

    if (!formData.department) {
      newErrors.department = 'กรุณาเลือกภาควิชา';
    }

    if (!/^[^\s@]+@university\.ac\.th$/.test(formData.email)) {
      newErrors.email = 'อีเมลต้องเป็นของมหาวิทยาลัย (@university.ac.th)';
    }

    if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0';
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

    if (advisor) {
      updateAdvisor(advisor.id, formData);
      toast.success('อัปเดตข้อมูลอาจารย์สำเร็จ');
    } else {
      addAdvisor(formData);
      toast.success('เพิ่มข้อมูลอาจารย์สำเร็จ');
    }

    onClose();
  };

  if (!open) return null;

  const faculties = [
    'คณะวิทยาศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะบริหารธุรกิจ',
  ];

  const departments: Record<string, string[]> = {
    'คณะวิทยาศาสตร์': ['เคมี', 'ฟิสิกส์', 'คณิตศาสตร์', 'ชีววิทยา'],
    'คณะวิศวกรรมศาสตร์': [
      'วิศวกรรมไฟฟ้า',
      'วิศวกรรมเครื่องกล',
      'วิศวกรรมโยธา',
      'วิศวกรรมคอมพิวเตอร์',
    ],
    'คณะเทคโนโลยีสารสนเทศ': [
      'วิทยาการคอมพิวเตอร์',
      'เทคโนโลยีสารสนเทศ',
      'วิศวกรรมซอฟต์แวร์',
    ],
    'คณะบริหารธุรกิจ': ['การจัดการ', 'การตลาด', 'การเงิน', 'การบัญชี'],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">
            {advisor ? 'แก้ไขข้อมูลอาจารย์' : 'เพิ่มอาจารย์ใหม่'}
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
            <label className="block text-sm mb-2 text-gray-700">
              ชื่อ-นามสกุลอาจารย์ *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="อาจารย์ สมชาย ใจดี"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">คณะ *</label>
              <select
                value={formData.faculty}
                onChange={(e) =>
                  setFormData({ ...formData, faculty: e.target.value, department: '' })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.faculty ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกคณะ</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">ภาควิชา *</label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.faculty}
              >
                <option value="">เลือกภาควิชา</option>
                {formData.faculty &&
                  departments[formData.faculty]?.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">อีเมล *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="advisor@university.ac.th"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">เบอร์โทรศัพท์ *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0212345678"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
              {advisor ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มอาจารย์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
