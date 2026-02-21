import { useState, useMemo } from 'react';
import { useData, Advisor } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import AdvisorDialog from '../components/AdvisorDialog';
import DeleteDialog from '../components/DeleteDialog';

export default function AdvisorsPage() {
  const { advisors, deleteAdvisor } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);

  const faculties = useMemo(() => {
    return Array.from(new Set(advisors.map((a) => a.faculty)));
  }, [advisors]);

  const filteredAdvisors = useMemo(() => {
    return advisors.filter((advisor) => {
      const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFaculty = !filterFaculty || advisor.faculty === filterFaculty;
      return matchesSearch && matchesFaculty;
    });
  }, [advisors, searchQuery, filterFaculty]);

  const handleEdit = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setDialogOpen(true);
  };

  const handleDelete = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAdvisor) {
      deleteAdvisor(selectedAdvisor.id);
      toast.success('ลบข้อมูลอาจารย์สำเร็จ');
      setDeleteDialogOpen(false);
      setSelectedAdvisor(null);
    }
  };

  const canManage = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">อาจารย์ที่ปรึกษา</h1>
          <p className="text-gray-600">ทั้งหมด {filteredAdvisors.length} ท่าน</p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setSelectedAdvisor(null);
              setDialogOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่มอาจารย์
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่ออาจารย์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกคณะ</option>
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvisors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            ไม่พบข้อมูลอาจารย์
          </div>
        ) : (
          filteredAdvisors.map((advisor) => (
            <div
              key={advisor.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg mb-1">{advisor.name}</h3>
                <p className="text-sm text-gray-600">{advisor.faculty}</p>
                <p className="text-sm text-gray-500">{advisor.department}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${advisor.email}`}
                    className="text-blue-600 hover:underline truncate"
                  >
                    {advisor.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{advisor.phone}</span>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(advisor)}
                    className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(advisor)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AdvisorDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedAdvisor(null);
        }}
        advisor={selectedAdvisor}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedAdvisor(null);
        }}
        onConfirm={confirmDelete}
        title="ลบข้อมูลอาจารย์"
        description={`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${selectedAdvisor?.name}?`}
      />
    </div>
  );
}
