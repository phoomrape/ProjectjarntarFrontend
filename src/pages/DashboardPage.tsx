import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, GraduationCap, FolderKanban, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const { students, alumni, projects } = useData();
  const { user } = useAuth();

  // Calculate statistics
  const totalStudents = students.length;
  const graduatedStudents = students.filter((s) => s.status === 'Graduated').length;
  const totalAlumni = alumni.length;
  const totalProjects = projects.length;
  const awardProjects = projects.filter((p) => p.has_award).length;

  // Department distribution for alumni
  const departmentCounts = alumni.reduce((acc, a) => {
    const dept = a.department || 'ไม่ระบุ';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alumniDepartmentData = Object.entries(departmentCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Projects by year
  const projectsByYear = projects.reduce((acc, p) => {
    acc[p.year] = (acc[p.year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const projectYearData = Object.entries(projectsByYear)
    .map(([year, count]) => ({
      year: parseInt(year),
      จำนวน: count,
    }))
    .sort((a, b) => a.year - b.year);

  // Alumni by graduation year
  const alumniByYear = alumni.reduce((acc, a) => {
    acc[a.graduation_year] = (acc[a.graduation_year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const alumniYearData = Object.entries(alumniByYear)
    .map(([year, count]) => ({
      year: parseInt(year),
      จำนวน: count,
    }))
    .sort((a, b) => a.year - b.year);

  // Students by department
  const studentsByDepartment = students.reduce((acc, s) => {
    const dept = s.department || 'ไม่ระบุ';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const studentDepartmentData = Object.entries(studentsByDepartment).map(([name, count]) => ({
    department: name,
    จำนวน: count,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Recent alumni updates (mock - last 5)
  const recentAlumni = alumni.slice(0, 5);

  // Award-winning projects
  const awardProjectsList = projects.filter((p) => p.has_award).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">แดชบอร์ด</h1>
        <p className="text-gray-600">
          ยินดีต้อนรับ, {user?.name} ({user?.role === 'admin' ? 'ผู้ดูแลระบบ' : user?.role === 'student' ? 'นักศึกษา' : user?.role === 'teacher' ? 'อาจารย์' : 'ศิษย์เก่า'})
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="นักศึกษาทั้งหมด"
          value={totalStudents}
          color="blue"
        />
        <StatCard
          icon={GraduationCap}
          label="นักศึกษาจบการศึกษา"
          value={graduatedStudents}
          subtitle={`${((graduatedStudents / totalStudents) * 100).toFixed(1)}% ของทั้งหมด`}
          color="purple"
        />
        <StatCard
          icon={GraduationCap}
          label="ศิษย์เก่าทั้งหมด"
          value={totalAlumni}
          color="pink"
        />
        <StatCard
          icon={FolderKanban}
          label="โปรเจคจบทั้งหมด"
          value={totalProjects}
          color="orange"
        />
      </div>

      {/* Award Projects */}
      {awardProjects > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl">โปรเจคที่ได้รับรางวัล</h2>
            <span className="ml-auto text-2xl text-yellow-600">{awardProjects}</span>
          </div>
          <div className="space-y-2">
            {awardProjectsList.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
              >
                <Award className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{project.title_th}</p>
                  <p className="text-sm text-gray-600">
                    ปี {project.year} - {project.advisor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4">จำนวนนักศึกษาแบ่งตามสาขา</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentDepartmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="จำนวน" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alumni by Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4">สัดส่วนศิษย์เก่าตามสาขา</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={alumniDepartmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {alumniDepartmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Year */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4">โปรเจคจบตามปีการศึกษา</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="จำนวน" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alumni by Year */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4">สถิติศิษย์เก่าตามปีที่จบ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={alumniYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="จำนวน"
                stroke="#ec4899"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alumni Updates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl">ศิษย์เก่าที่อัปเดตข้อมูลล่าสุด</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr className="text-left">
                <th className="pb-3 px-2">ชื่อ-นามสกุล</th>
                <th className="pb-3 px-2">คณะ</th>
                <th className="pb-3 px-2">สาขา</th>
                <th className="pb-3 px-2">ปีที่จบ</th>
                <th className="pb-3 px-2">สถานที่ทำงาน</th>
              </tr>
            </thead>
            <tbody>
              {recentAlumni.map((alumni) => (
                <tr key={alumni.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">
                    {alumni.first_name} {alumni.last_name}
                  </td>
                  <td className="py-3 px-2 text-gray-600">{alumni.faculty}</td>
                  <td className="py-3 px-2 text-gray-600">{alumni.department}</td>
                  <td className="py-3 px-2 text-gray-600">{alumni.graduation_year}</td>
                  <td className="py-3 px-2 text-gray-600">{alumni.workplace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subtitle?: string;
  color: 'blue' | 'purple' | 'pink' | 'orange';
}

function StatCard({ icon: Icon, label, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
