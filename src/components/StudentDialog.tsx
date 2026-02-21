import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData, Student } from '../contexts/DataContext';
import { toast } from 'sonner';

interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDialog({ open, onClose, student }: StudentDialogProps) {
  const { addStudent, updateStudent } = useData();
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    student_id: '',
    first_name: '',
    last_name: '',
    faculty: '',
    department: '',
    year: 1,
    email: '',
    phone: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        faculty: student.faculty,
        department: student.department,
        year: student.year,
        email: student.email,
        phone: student.phone,
        status: student.status,
      });
    } else {
      setFormData({
        student_id: '',
        first_name: '',
        last_name: '',
        faculty: '',
        department: '',
        year: 1,
        email: '',
        phone: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [student, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!/^\d{8}$/.test(formData.student_id)) {
      newErrors.student_id = 'รหัสนักศึกษาต้องเป็นตัวเลข 8 หลัก';
    }

    if (!/^[ก-๙a-zA-Z\s]+$/.test(formData.first_name)) {
      newErrors.first_name = 'ชื่อต้องเป็นตัวอักษรเท่านั้น';
    }

    if (!/^[ก-๙a-zA-Z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = 'นามสกุลต้องเป็นตัวอักษรเท่านั้น';
    }

    if (!/^[^\s@]+@university\.ac\.th$/.test(formData.email)) {
      newErrors.email = 'อีเมลต้องเป็นของมหาวิทยาลัย (@university.ac.th)';
    }

    if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0';
    }

    if (formData.year < 1 || formData.year > 5) {
      newErrors.year = 'ชั้นปีต้องอยู่ระหว่าง 1-5';
    }

    if (!formData.faculty) {
      newErrors.faculty = 'กรุณาเลือกคณะ';
    }

    if (!formData.department) {
      newErrors.department = 'กรุณาเลือกสาขา';
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

    if (student) {
      updateStudent(student.id, formData);
      toast.success('อัปเดตข้อมูลนักศึกษาสำเร็จ');
    } else {
      addStudent(formData);
      toast.success('เพิ่มข้อมูลนักศึกษาสำเร็จ');
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
            {student ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                รหัสนักศึกษา *
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) =>
                  setFormData({ ...formData, student_id: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.student_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="66123456"
              />
              {errors.student_id && (
                <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">สถานะ *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Student['status'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">กำลังศึกษา</option>
                <option value="Graduated">จบการศึกษา</option>
                <option value="Suspended">พักการศึกษา</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">ชื่อ *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="สมชาย"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">นามสกุล *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ใจดี"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>
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
              <label className="block text-sm mb-2 text-gray-700">สาขา *</label>
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
                <option value="">เลือกสาขา</option>
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
            <label className="block text-sm mb-2 text-gray-700">ชั้นปี *</label>
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={1}>ปี 1</option>
              <option value={2}>ปี 2</option>
              <option value={3}>ปี 3</option>
              <option value={4}>ปี 4</option>
              <option value={5}>ปี 5</option>
            </select>
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
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
              placeholder="student@university.ac.th"
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
              placeholder="0812345678"
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
              {student ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มนักศึกษา'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
