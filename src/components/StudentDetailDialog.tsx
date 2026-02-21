import { X, Mail, Phone, BookOpen, Building2, Hash, User } from 'lucide-react';
import { Student } from '../contexts/DataContext';

interface StudentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDetailDialog({ open, onClose, student }: StudentDetailDialogProps) {
  if (!open || !student) return null;

  const statusStyles = {
    Active: 'bg-green-100 text-green-700',
    Graduated: 'bg-blue-100 text-blue-700',
    Suspended: 'bg-yellow-100 text-yellow-700',
  };

  const statusLabels = {
    Active: 'กำลังศึกษา',
    Graduated: 'จบการศึกษา',
    Suspended: 'พักการศึกษา',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl">ข้อมูลนักศึกษา</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {student.first_name} {student.last_name}
              </h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm ${statusStyles[student.status]}`}>
                {statusLabels[student.status]}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            <InfoRow
              icon={<Hash className="w-4 h-4 text-gray-400" />}
              label="รหัสนักศึกษา"
              value={student.student_id}
            />
            <InfoRow
              icon={<Building2 className="w-4 h-4 text-gray-400" />}
              label="คณะ"
              value={student.faculty}
            />
            <InfoRow
              icon={<BookOpen className="w-4 h-4 text-gray-400" />}
              label="สาขา"
              value={student.department}
            />
            <InfoRow
              icon={<BookOpen className="w-4 h-4 text-gray-400" />}
              label="ชั้นปี"
              value={`ปี ${student.year}`}
            />
            <InfoRow
              icon={<Mail className="w-4 h-4 text-gray-400" />}
              label="อีเมล"
              value={student.email}
              isLink={`mailto:${student.email}`}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4 text-gray-400" />}
              label="เบอร์โทร"
              value={student.phone}
              isLink={`tel:${student.phone}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        {isLink ? (
          <a href={isLink} className="text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-gray-900 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}
