import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, GraduationCap, Building2, BookOpen, Phone, Calendar, Hash } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">โปรไฟล์</h1>
        <p className="text-gray-600">ข้อมูลผู้ใช้งานของคุณ</p>
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
          {user?.email && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
          )}

          {/* เบอร์โทรศัพท์ */}
          {user?.phone && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</p>
                <p className="text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}

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
