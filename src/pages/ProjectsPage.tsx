import { useState, useMemo } from 'react';
import { useData, Project } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Download, Filter, FileText, Award, Users, User, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import ProjectDialog from '../components/ProjectDialog';
import DeleteDialog from '../components/DeleteDialog';

export default function ProjectsPage() {
  const { projects, deleteProject, addProjectComment, advisors } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const years = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.year))).sort((a, b) => b - a);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let baseProjects = projects;

    // Non-admin users only see projects whose advisor is in the same department
    if (user?.role !== 'admin' && user?.department) {
      const advisorNamesInDept = advisors
        .filter((a) => a.department === user.department)
        .map((a) => a.name);
      baseProjects = projects.filter((p) => advisorNamesInDept.includes(p.advisor));
    }

    return baseProjects.filter((project) => {
      const matchesSearch =
        project.title_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesYear = !filterYear || project.year === parseInt(filterYear);
      const matchesStatus = !filterStatus || project.status === filterStatus;
      const matchesType = !filterType || project.type === filterType;

      return matchesSearch && matchesYear && matchesStatus && matchesType;
    });
  }, [projects, searchQuery, filterYear, filterStatus, filterType, user, advisors]);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      toast.success('ลบข้อมูลโปรเจคสำเร็จ');
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ['รหัสโปรเจค', 'ชื่อ (TH)', 'ชื่อ (EN)', 'อาจารย์ที่ปรึกษา', 'ปี', 'ประเภท', 'สถานะ', 'รางวัล'],
      ...filteredProjects.map((p) => [
        p.project_id,
        p.title_th,
        p.title_en,
        p.advisor,
        p.year,
        p.type === 'group' ? 'กลุ่ม' : 'เดี่ยว',
        p.status,
        p.has_award ? 'ได้รับรางวัล' : '-',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projects_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('ส่งออกข้อมูลสำเร็จ');
  };

  const canManage = user?.role === 'admin' || user?.role === 'student';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">โปรเจคจบ</h1>
          <p className="text-gray-600">
            ทั้งหมด {filteredProjects.length} โปรเจค
            {searchQuery || filterYear || filterStatus || filterType ? ` (กรองแล้ว)` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">ส่งออก</span>
            </button>
          )}
          {canManage && (
            <button
              onClick={() => {
                setSelectedProject(null);
                setDialogOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มโปรเจค
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
              placeholder="ค้นหาด้วยชื่อโปรเจคหรือแท็ก..."
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
              <label className="block text-sm mb-2 text-gray-700">ปีการศึกษา</label>
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
            <div>
              <label className="block text-sm mb-2 text-gray-700">สถานะ</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">ประเภท</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="individual">เดี่ยว</option>
                <option value="group">กลุ่ม</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            ไม่พบข้อมูลโปรเจค
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg truncate">{project.title_th}</h3>
                    {project.has_award && (
                      <Award className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{project.title_en}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <UserCog className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{project.advisor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {project.type === 'group' ? (
                    <Users className="w-4 h-4 text-gray-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-600">
                    {project.type === 'group'
                      ? `กลุ่ม (${project.members.length} คน)`
                      : 'เดี่ยว'}
                    {project.members.length > 0 && `: ${project.members.join(', ')}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">ปีการศึกษา {project.year}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                {project.document_url ? (
                  <a
                    href={project.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    ดูไฟล์ผลงาน
                  </a>
                ) : (
                  <div className="flex-1 px-3 py-2 text-center text-gray-400 text-sm">
                    ยังไม่มีไฟล์ผลงานในระบบ
                  </div>
                )}
                {canManage && (
                  <>
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(project)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Comments Section */}
              {(user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'student') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [project.id]: !prev[project.id],
                      }))
                    }
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2 w-full"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>ความคิดเห็นอาจารย์ ({project.comments?.length || 0})</span>
                    {expandedComments[project.id] ? (
                      <ChevronUp className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    )}
                  </button>

                  {expandedComments[project.id] && (
                    <div className="space-y-3">
                      {/* Comments list */}
                      {(!project.comments || project.comments.length === 0) ? (
                        <p className="text-sm text-gray-400 italic">ยังไม่มีความคิดเห็น</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {project.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {comment.authorName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(comment.createdAt).toLocaleDateString('th-TH', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment - teacher/admin only */}
                      {(user?.role === 'teacher' || user?.role === 'admin') && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="เขียนความคิดเห็น..."
                            value={commentTexts[project.id] || ''}
                            onChange={(e) =>
                              setCommentTexts((prev) => ({
                                ...prev,
                                [project.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && commentTexts[project.id]?.trim()) {
                                addProjectComment(
                                  project.id,
                                  user?.name || 'ไม่ระบุชื่อ',
                                  user?.role || '',
                                  commentTexts[project.id].trim()
                                );
                                setCommentTexts((prev) => ({ ...prev, [project.id]: '' }));
                                toast.success('เพิ่มความคิดเห็นสำเร็จ');
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => {
                              if (commentTexts[project.id]?.trim()) {
                                addProjectComment(
                                  project.id,
                                  user?.name || 'ไม่ระบุชื่อ',
                                  user?.role || '',
                                  commentTexts[project.id].trim()
                                );
                                setCommentTexts((prev) => ({ ...prev, [project.id]: '' }));
                                toast.success('เพิ่มความคิดเห็นสำเร็จ');
                              }
                            }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={confirmDelete}
        title="ลบข้อมูลโปรเจค"
        description={`คุณแน่ใจหรือไม่ที่จะลบโปรเจค "${selectedProject?.title_th}"?`}
      />
    </div>
  );
}

function UserCog({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="15" r="3" />
      <circle cx="9" cy="7" r="4" />
      <path d="M10 15H6a4 4 0 0 0-4 4v2" />
      <path d="m21.7 16.4-.9-.3" />
      <path d="m15.2 13.9-.9-.3" />
      <path d="m16.6 18.7.3-.9" />
      <path d="m19.1 12.2.3-.9" />
      <path d="m19.6 18.7-.4-1" />
      <path d="m16.8 12.3-.4-1" />
      <path d="m14.3 16.6 1-.4" />
      <path d="m20.7 13.8 1-.4" />
    </svg>
  );
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const styles = {
    Draft: 'bg-gray-100 text-gray-700',
    Approved: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${styles[status]}`}>
      {status}
    </span>
  );
}
