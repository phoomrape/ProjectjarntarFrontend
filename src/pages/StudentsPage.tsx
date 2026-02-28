import { useState, useMemo } from 'react';
import { useData, Student } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Download, Upload, Filter, GraduationCap, Eye } from 'lucide-react';
import { toast } from 'sonner';
import StudentDialog from '../components/StudentDialog';
import StudentStatusDialog from '../components/StudentStatusDialog';
import StudentDetailDialog from '../components/StudentDetailDialog';
import DeleteDialog from '../components/DeleteDialog';

export default function StudentsPage() {
  const { students, deleteStudent, graduateStudents, updateStudentStatus } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Get unique faculties
  const faculties = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.faculty)));
  }, [students]);

  // Get unique years
  const years = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.year))).sort((a, b) => a - b);
  }, [students]);

  // Filter students - teachers only see students in their department
  const filteredStudents = useMemo(() => {
    let baseStudents = students;

    if (user?.role === 'teacher' && user.department) {
      baseStudents = students.filter((s) => s.department === user.department);
    }

    return baseStudents.filter((student) => {
      const matchesSearch =
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id.includes(searchQuery);

      const matchesFaculty = !filterFaculty || student.faculty === filterFaculty;
      const matchesStatus = !filterStatus || student.status === filterStatus;
      const matchesYear = !filterYear || student.year === parseInt(filterYear);

      return matchesSearch && matchesFaculty && matchesStatus && matchesYear;
    });
  }, [students, searchQuery, filterFaculty, filterStatus, filterYear, user]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedStudent) {
      deleteStudent(selectedStudent.id);
      toast.success('ลบข้อมูลนักศึกษาสำเร็จ');
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleGraduate = () => {
    if (selectedStudentIds.length === 0) {
      toast.error('กรุณาเลือกนักศึกษาที่ต้องการเปลี่ยนสถานะ');
      return;
    }

    setStatusDialogOpen(true);
  };

  const handleStatusChange = (status: Student['status']) => {
    if (status === 'Graduated') {
      // Convert to alumni and remove from students
      graduateStudents(selectedStudentIds);
      toast.success(`นักศึกษาจบการศึกษาสำเร็จ ${selectedStudentIds.length} คน และย้ายไปยังระบบศิษย์เก่าแล้ว`);
    } else {
      // Just update status
      updateStudentStatus(selectedStudentIds, status);
      const statusLabels = {
        Active: 'กำลังศึกษา',
        Suspended: 'พักการศึกษา',
        Graduated: 'จบการศึกษา',
      };
      toast.success(`เปลี่ยนสถานะเป็น "${statusLabels[status]}" สำเร็จ ${selectedStudentIds.length} คน`);
    }
    setSelectedStudentIds([]);
  };

  const handleExport = () => {
    const csv = [
      ['รหัสนักศึกษา', 'ชื่อ', 'นามสกุล', 'คณะ', 'สาขา', 'ชั้นปี', 'อีเมล', 'เบอร์โทร', 'ที่อยู่', 'สถานะ'],
      ...filteredStudents.map((s) => [
        s.student_id,
        s.first_name,
        s.last_name,
        s.faculty,
        s.department,
        s.year,
        s.email,
        s.phone,
        s.address || '',
        s.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('ส่งออกข้อมูลสำเร็จ');
  };

  const canManage = user?.role === 'admin';
  const canView = user?.role === 'admin' || user?.role === 'teacher';

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">จัดการข้อมูลนักศึกษา</h1>
          <p className="text-gray-600">
            ทั้งหมด {filteredStudents.length} คน
            {searchQuery || filterFaculty || filterStatus || filterYear ? ` (กรองแล้ว)` : ''}
            {selectedStudentIds.length > 0 && ` | เลือกแล้ว ${selectedStudentIds.length} คน`}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2 flex-wrap">
            {selectedStudentIds.length > 0 && (
              <button
                onClick={handleGraduate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                จบการศึกษา ({selectedStudentIds.length})
              </button>
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">ส่งออก</span>
            </button>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setDialogOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มนักศึกษา
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ นามสกุล หรือรหัสนักศึกษา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 lg:w-auto w-full justify-center"
          >
            <Filter className="w-4 h-4" />
            ตัวกรอง
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm mb-2 text-gray-700">คณะ</label>
              <select
                value={filterFaculty}
                onChange={(e) => setFilterFaculty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">ชั้นปี</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    ปี {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">สถานะ</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="Active">กำลังศึกษา</option>
                <option value="Graduated">จบการศึกษา</option>
                <option value="Suspended">พักการศึกษา</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {canManage && (
                  <th className="text-left px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="text-left px-6 py-4">รหัสนักศึกษา</th>
                <th className="text-left px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="text-left px-6 py-4">คณะ</th>
                <th className="text-left px-6 py-4">สาขา</th>
                <th className="text-left px-6 py-4">ชั้นปี</th>
                <th className="text-left px-6 py-4">สถานะ</th>
                {(canManage || canView) && <th className="text-left px-6 py-4">จัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={(canManage || canView) ? 8 : 6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    ไม่พบข้อมูลนักศึกษา
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {canManage && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">{student.student_id}</td>
                    <td className="px-6 py-4">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.faculty}</td>
                    <td className="px-6 py-4 text-gray-600">{student.department}</td>
                    <td className="px-6 py-4 text-gray-600">ปี {student.year}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.status} />
                    </td>
                    {(canManage || canView) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(student)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="ดูข้อมูล"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => handleEdit(student)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(student)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={confirmDelete}
        title="ลบข้อมูลนักศึกษา"
        description={`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${selectedStudent?.first_name} ${selectedStudent?.last_name}?`}
      />

      <StudentDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

      <StudentStatusDialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
        }}
        onConfirm={handleStatusChange}
        studentCount={selectedStudentIds.length}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: Student['status'] }) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Graduated: 'bg-blue-100 text-blue-700',
    Suspended: 'bg-yellow-100 text-yellow-700',
  };

  const labels = {
    Active: 'กำลังศึกษา',
    Graduated: 'จบการศึกษา',
    Suspended: 'พักการศึกษา',
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}