import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { toast } from 'sonner';
import { User, Mail, Shield, GraduationCap, Building2, BookOpen, Phone, Calendar, Hash, MapPin, Pencil, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const roleLabels = {
    admin: 'ผู้ดูแลระบบ',
    student: 'นักศึกษา',
    teacher: 'อาจารย์',
    alumni: 'ศิษย์เก่า',
  };

  const yearLabels: Record<number, string> = {
    1: 'ชั้นปีที่ 1',
    2: 'ชั้นปีที่ 2',
    3: 'ชั้นปีที่ 3',
    4: 'ชั้นปีที่ 4',
    5: 'ชั้นปีที่ 5',
    6: 'ชั้นปีที่ 6',
    7: 'ชั้นปีที่ 7',
    8: 'ชั้นปีที่ 8',
  };

  const startEditing = () => {
    setEditData({
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(editData);
      if (res.success) {
        updateUser({
          email: editData.email,
          phone: editData.phone,
          address: editData.address,
        });
        toast.success('บันทึกข้อมูลสำเร็จ');
        setIsEditing(false);
      } else {
        toast.error('ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">โปรไฟล์</h1>
          <p className="text-gray-600">ข้อมูลผู้ใช้งานของคุณ</p>
        </div>
        {isStudent && !isEditing && (
          <button
            onClick={startEditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            แก้ไขข้อมูล
          </button>
        )}
        {isStudent && isEditing && (
          <div className="flex gap-2">
            <button
              onClick={cancelEditing}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl mb-1">{user?.name || user?.username}</h2>
            <p className="text-gray-600">{user && roleLabels[user.role]}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* ชื่อ-นามสกุล — แสดงแยกสำหรับนักศึกษา */}
          {user?.role === 'student' && user?.first_name && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</p>
                <p className="text-gray-900">{user.first_name} {user.last_name}</p>
              </div>
            </div>
          )}

          {/* รหัสนักศึกษา */}
          {user?.role === 'student' && user?.student_id && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">รหัสนักศึกษา</p>
                <p className="text-gray-900">{user.student_id}</p>
              </div>
            </div>
          )}

          {/* อีเมล */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">อีเมล</p>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user?.email || 'ยังไม่ได้ระบุ'}</p>
              )}
            </div>
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0812345678"
                />
              ) : (
                <p className="text-gray-900">{user?.phone || 'ยังไม่ได้ระบุ'}</p>
              )}
            </div>
          </div>

          {/* บทบาท */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 mb-1">บทบาท</p>
              <p className="text-gray-900">{user && roleLabels[user.role]}</p>
            </div>
          </div>

          {/* คณะ */}
          {user?.faculty && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">คณะ</p>
                <p className="text-gray-900">{user.faculty}</p>
              </div>
            </div>
          )}

          {/* สาขา */}
          {user?.department && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">{user.role === 'teacher' ? 'สาขาที่สอน' : 'สาขาวิชา'}</p>
                <p className="text-gray-900">{user.department}</p>
              </div>
            </div>
          )}

          {/* ที่อยู่ — เฉพาะนักศึกษา */}
          {user?.role === 'student' && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">ที่อยู่</p>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="ที่อยู่ปัจจุบัน"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-line">{user.address || 'ยังไม่ได้ระบุ'}</p>
                )}
              </div>
            </div>
          )}

          {/* ชั้นปี — เฉพาะนักศึกษา */}
          {user?.role === 'student' && user?.year && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">ชั้นปี</p>
                <p className="text-gray-900">{yearLabels[user.year] || `ชั้นปีที่ ${user.year}`}</p>
              </div>
            </div>
          )}

          {/* ชื่อผู้ใช้งาน */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 mb-1">ชื่อผู้ใช้งาน</p>
              <p className="text-gray-900">{user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
