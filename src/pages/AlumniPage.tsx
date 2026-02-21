import { useState, useMemo } from 'react';
import { useData, Alumni } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Download, Filter, Briefcase, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import AlumniDialog from '../components/AlumniDialog';
import AlumniPortfolioView from '../components/AlumniPortfolioView';
import DeleteDialog from '../components/DeleteDialog';

export default function AlumniPage() {
  const { alumni, deleteAlumni } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const isAlumni = user?.role === 'alumni';
  const isAdmin = user?.role === 'admin';

  // Alumni can only see their own department; admin/others see all
  const departmentFilteredAlumni = useMemo(() => {
    if (isAlumni && user?.department) {
      return alumni.filter((a) => a.department === user.department);
    }
    return alumni;
  }, [alumni, isAlumni, user?.department]);

  const faculties = useMemo(() => {
    return Array.from(new Set(departmentFilteredAlumni.map((a) => a.faculty)));
  }, [departmentFilteredAlumni]);

  const years = useMemo(() => {
    return Array.from(new Set(departmentFilteredAlumni.map((a) => a.graduation_year))).sort((a, b) => b - a);
  }, [departmentFilteredAlumni]);

  const filteredAlumni = useMemo(() => {
    return departmentFilteredAlumni.filter((alum) => {
      const matchesSearch =
        alum.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.workplace.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFaculty = !filterFaculty || alum.faculty === filterFaculty;
      const matchesYear =
        !filterYear || alum.graduation_year === parseInt(filterYear);

      return matchesSearch && matchesFaculty && matchesYear;
    });
  }, [departmentFilteredAlumni, searchQuery, filterFaculty, filterYear]);

  // Check if a given alumni record belongs to the logged-in user
  const isOwnRecord = (alum: Alumni) => {
    return isAlumni && user?.alumni_id === alum.alumni_id;
  };

  const handleEdit = (alum: Alumni) => {
    // Alumni can only edit their own record
    if (isAlumni && !isOwnRecord(alum)) return;
    setSelectedAlumni(alum);
    setDialogOpen(true);
  };

  const handleDelete = (alum: Alumni) => {
    setSelectedAlumni(alum);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAlumni) {
      deleteAlumni(selectedAlumni.id);
      toast.success('ลบข้อมูลศิษย์เก่าสำเร็จ');
      setDeleteDialogOpen(false);
      setSelectedAlumni(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ['รหัส', 'ชื่อ', 'นามสกุล', 'คณะ', 'สาขา', 'ปีที่จบ', 'สถานที่ทำงาน', 'ตำแหน่ง', 'ติดต่อ'],
      ...filteredAlumni.map((a) => [
        a.alumni_id,
        a.first_name,
        a.last_name,
        a.faculty,
        a.department,
        a.graduation_year,
        a.workplace,
        a.position,
        a.contact_info,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alumni_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('ส่งออกข้อมูลสำเร็จ');
  };

  const canManage = isAdmin;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">
            {isAlumni ? 'พอร์ตโฟลิโอศิษย์เก่า' : 'ข้อมูลศิษย์เก่า'}
          </h1>
          <p className="text-gray-600">
            {isAlumni && user?.department ? `สาขา${user.department} — ` : ''}
            ทั้งหมด {filteredAlumni.length} คน
            {searchQuery || filterFaculty || filterYear ? ` (กรองแล้ว)` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">ส่งออก</span>
            </button>
          )}
          {isAlumni && (() => {
            const myRecord = departmentFilteredAlumni.find((a) => a.alumni_id === user?.alumni_id);
            return myRecord ? (
              <button
                onClick={() => handleEdit(myRecord)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                แก้ไขพอร์ตโฟลิโอของฉัน
              </button>
            ) : null;
          })()}
          {canManage && (
            <button
              onClick={() => {
                setSelectedAlumni(null);
                setDialogOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มศิษย์เก่า
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ นามสกุล หรือสถานที่ทำงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              ตัวกรอง
            </button>
            <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                กริด
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 border-l border-gray-300 ${
                  viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                ตาราง
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
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
              <label className="block text-sm mb-2 text-gray-700">ปีที่จบ</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              ไม่พบข้อมูลศิษย์เก่า
            </div>
          ) : (
            filteredAlumni.map((alum) => (
              <div
                key={alum.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={alum.photo_url}
                      alt={`${alum.first_name} ${alum.last_name}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg mb-1 truncate">
                        {alum.first_name} {alum.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{alum.department}</p>
                      <p className="text-sm text-gray-500">จบปี {alum.graduation_year}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{alum.position}</p>
                        <p className="text-sm text-gray-600 truncate">{alum.workplace}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    {alum.portfolio && (
                      <a
                        href={alum.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        ลิงก์ภายนอก
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAlumni(alum);
                        setPortfolioOpen(true);
                      }}
                      className="flex-1 px-3 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      ดูพอร์ตโฟลิโอ
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleEdit(alum)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(alum)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    {/* Alumni can edit their own portfolio only */}
                    {isAlumni && isOwnRecord(alum) && (
                      <button
                        onClick={() => handleEdit(alum)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="แก้ไขพอร์ตโฟลิโอของคุณ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4">ชื่อ-นามสกุล</th>
                  <th className="text-left px-6 py-4">คณะ</th>
                  <th className="text-left px-6 py-4">สาขา</th>
                  <th className="text-left px-6 py-4">ปีที่จบ</th>
                  <th className="text-left px-6 py-4">สถานที่ทำงาน</th>
                  <th className="text-left px-6 py-4">ตำแหน่ง</th>
                  <th className="text-left px-6 py-4">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      ไม่พบข้อมูลศิษย์เก่า
                    </td>
                  </tr>
                ) : (
                  filteredAlumni.map((alum) => (
                    <tr key={alum.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {alum.first_name} {alum.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{alum.faculty}</td>
                      <td className="px-6 py-4 text-gray-600">{alum.department}</td>
                      <td className="px-6 py-4 text-gray-600">{alum.graduation_year}</td>
                      <td className="px-6 py-4 text-gray-600">{alum.workplace}</td>
                      <td className="px-6 py-4 text-gray-600">{alum.position}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAlumni(alum);
                              setPortfolioOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="ดูพอร์ตโฟลิโอ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(isAdmin || isOwnRecord(alum)) && (
                            <button
                              onClick={() => handleEdit(alum)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(alum)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlumniDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedAlumni(null);
        }}
        alumni={selectedAlumni}
      />

      <AlumniPortfolioView
        open={portfolioOpen}
        onClose={() => {
          setPortfolioOpen(false);
          setSelectedAlumni(null);
        }}
        alumni={selectedAlumni}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedAlumni(null);
        }}
        onConfirm={confirmDelete}
        title="ลบข้อมูลศิษย์เก่า"
        description={`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${selectedAlumni?.first_name} ${selectedAlumni?.last_name}?`}
      />
    </div>
  );
}