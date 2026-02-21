import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData, Alumni, EducationEntry, ExperienceEntry, CustomField } from '../contexts/DataContext';
import { toast } from 'sonner';

interface AlumniDialogProps {
  open: boolean;
  onClose: () => void;
  alumni: Alumni | null;
}

export default function AlumniDialog({ open, onClose, alumni }: AlumniDialogProps) {
  const { addAlumni, updateAlumni } = useData();
  const [activeTab, setActiveTab] = useState<'basic' | 'portfolio'>('basic');
  const [formData, setFormData] = useState<Omit<Alumni, 'id'>>({
    alumni_id: '',
    first_name: '',
    last_name: '',
    faculty: '',
    department: '',
    graduation_year: new Date().getFullYear(),
    workplace: '',
    position: '',
    contact_info: '',
    portfolio: '',
    photo_url: '',
    employment_status: 'employed',
    about_me: '',
    email: '',
    address: '',
    phone: '',
    skills: [],
    education: [],
    experience: [],
    custom_fields: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (alumni) {
      setFormData({
        alumni_id: alumni.alumni_id,
        first_name: alumni.first_name,
        last_name: alumni.last_name,
        faculty: alumni.faculty,
        department: alumni.department,
        graduation_year: alumni.graduation_year,
        workplace: alumni.workplace,
        position: alumni.position,
        contact_info: alumni.contact_info,
        portfolio: alumni.portfolio,
        photo_url: alumni.photo_url,
        employment_status: alumni.employment_status,
        about_me: alumni.about_me || '',
        email: alumni.email || '',
        address: alumni.address || '',
        phone: alumni.phone || '',
        skills: alumni.skills || [],
        education: alumni.education || [],
        experience: alumni.experience || [],
        custom_fields: alumni.custom_fields || [],
      });
    } else {
      setFormData({
        alumni_id: '',
        first_name: '',
        last_name: '',
        faculty: '',
        department: '',
        graduation_year: new Date().getFullYear(),
        workplace: '',
        position: '',
        contact_info: '',
        portfolio: '',
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        employment_status: 'employed',
        about_me: '',
        email: '',
        address: '',
        phone: '',
        skills: [],
        education: [],
        experience: [],
        custom_fields: [],
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [alumni, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!/^[ก-๙a-zA-Z\s]+$/.test(formData.first_name)) {
      newErrors.first_name = 'ชื่อต้องเป็นตัวอักษรเท่านั้น';
    }

    if (!/^[ก-๙a-zA-Z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = 'นามสกุลต้องเป็นตัวอักษรเท่านั้น';
    }

    if (!formData.faculty) {
      newErrors.faculty = 'กรุณาเลือกคณะ';
    }

    if (!formData.department) {
      newErrors.department = 'กรุณาเลือกสาขา';
    }

    if (
      formData.graduation_year < 1990 ||
      formData.graduation_year > new Date().getFullYear()
    ) {
      newErrors.graduation_year = 'ปีที่จบไม่ถูกต้อง';
    }

    if (formData.employment_status === 'employed' && !formData.workplace) {
      newErrors.workplace = 'กรุณากรอกสถานที่ทำงาน';
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

    if (alumni) {
      updateAlumni(alumni.id, formData);
      toast.success('อัปเดตข้อมูลศิษย์เก่าสำเร็จ');
    } else {
      addAlumni(formData);
      toast.success('เพิ่มข้อมูลศิษย์เก่าสำเร็จ');
    }

    onClose();
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { years: '', institution: '', address: '', grade: '' },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData({ ...formData, education: newEducation });
  };

  const removeEducation = (index: number) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { years: '', company: '', position: '' }],
    });
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const removeExperience = (index: number) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) });
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      custom_fields: [...formData.custom_fields, { label: '', value: '' }],
    });
  };

  const updateCustomField = (index: number, field: keyof CustomField, value: string) => {
    const newCustomFields = [...formData.custom_fields];
    newCustomFields[index] = { ...newCustomFields[index], [field]: value };
    setFormData({ ...formData, custom_fields: newCustomFields });
  };

  const removeCustomField = (index: number) => {
    setFormData({
      ...formData,
      custom_fields: formData.custom_fields.filter((_, i) => i !== index),
    });
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">
            {alumni ? 'แก้ไขข้อมูลศิษย์เก่า' : 'เพิ่มศิษย์เก่าใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ข้อมูลพื้นฐาน
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              พอร์ตโฟลิโอ
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {activeTab === 'basic' && (
            <>
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
                <label className="block text-sm mb-2 text-gray-700">
                  ปีที่สำเร็จการศึกษา *
                </label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) =>
                    setFormData({ ...formData, graduation_year: parseInt(e.target.value) })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.graduation_year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={1990}
                  max={new Date().getFullYear()}
                />
                {errors.graduation_year && (
                  <p className="text-red-500 text-sm mt-1">{errors.graduation_year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  สถานะการทำงาน *
                </label>
                <select
                  value={formData.employment_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employment_status: e.target.value as 'employed' | 'seeking',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employed">มีงานทำ</option>
                  <option value="seeking">กำลังหางาน</option>
                </select>
              </div>

              {formData.employment_status === 'employed' && (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      สถานที่ทำงาน *
                    </label>
                    <input
                      type="text"
                      value={formData.workplace}
                      onChange={(e) =>
                        setFormData({ ...formData, workplace: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.workplace ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="บริษัท ABC จำกัด"
                    />
                    {errors.workplace && (
                      <p className="text-red-500 text-sm mt-1">{errors.workplace}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">ตำแหน่งงาน</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Software Engineer"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm mb-2 text-gray-700">พอร์ตโฟลิโอ (URL)</label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://portfolio.com"
                />
              </div>
            </>
          )}

          {activeTab === 'portfolio' && (
            <>
              {/* About Me */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">เกี่ยวกับฉัน</label>
                <textarea
                  value={formData.about_me}
                  onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="แนะนำตัวเอง ประสบการณ์ และความสนใจ..."
                />
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg mb-4">ข้อมูลติดต่อ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">อีเมล</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">เบอร์โทร</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0812345678"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm mb-2 text-gray-700">ที่อยู่</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="123 ถนน... แขวง... เขต... จังหวัด... รหัสไปรษณีย์..."
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg mb-4">ทักษะ</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เพิ่มทักษะ เช่น JavaScript, Python"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">ประวัติการศึกษา</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่ม
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm text-gray-600">การศึกษา #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">ปี (เช่น 2011-2015)</label>
                          <input
                            type="text"
                            value={edu.years}
                            onChange={(e) => updateEducation(index, 'years', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="2011-2015"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">เกรดเฉลี่ย</label>
                          <input
                            type="text"
                            value={edu.grade}
                            onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="3.65"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm mb-1 text-gray-700">สถาบัน</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(index, 'institution', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="โรงเรียน / มหาวิทยาลัย"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm mb-1 text-gray-700">ที่อยู่</label>
                          <input
                            type="text"
                            value={edu.address}
                            onChange={(e) => updateEducation(index, 'address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="ที่อยู่สถาบัน"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Experience */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">ประสบการณ์ทำงาน</h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่ม
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm text-gray-600">ประสบการณ์ #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">ปี (เช่น 2020-2023)</label>
                          <input
                            type="text"
                            value={exp.years}
                            onChange={(e) => updateExperience(index, 'years', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="2020-2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">บริษัท/องค์กร</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="บริษัท ไมโครซอฟต์"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">ตำแหน่ง</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="โปรแกรมเมอร์"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">ข้อมูลเพิ่มเติม (กำหนดเอง)</h3>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มข้อมูล
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.custom_fields.map((field, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm text-gray-600">ฟิลด์ #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">หัวข้อ</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              updateCustomField(index, 'label', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="เช่น รางวัลที่ได้รับ, งานอดิเรก"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">ข้อมูล</label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) =>
                              updateCustomField(index, 'value', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="รายละเอียด"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
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
              {alumni ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มศิษย์เก่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
