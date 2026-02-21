import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Download, Code, Lightbulb, Calendar, Building2, TrendingUp, Globe } from 'lucide-react';
import { Alumni } from '../contexts/DataContext';
import { useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface AlumniPortfolioViewProps {
  open: boolean;
  onClose: () => void;
  alumni: Alumni | null;
}

export default function AlumniPortfolioView({ open, onClose, alumni }: AlumniPortfolioViewProps) {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    // If we pushed a history state, go back to remove it
    if (window.history.state?.portfolioOpen) {
      window.history.back();
    }
    onClose();
    // Reset after a short delay
    setTimeout(() => { isClosingRef.current = false; }, 100);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    // Push a new history state so pressing Back closes the modal
    window.history.pushState({ portfolioOpen: true }, '');

    const handlePopState = () => {
      // Browser back was pressed — close the modal without navigating
      if (!isClosingRef.current) {
        isClosingRef.current = true;
        onClose();
        setTimeout(() => { isClosingRef.current = false; }, 100);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, onClose]);

  if (!open || !alumni) return null;

  const handleDownload = async () => {
    if (!portfolioRef.current) return;
    
    try {
      toast.loading('กำลังสร้างรูปภาพ...');
      
      const canvas = await html2canvas(portfolioRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `Portfolio_${alumni.first_name}_${alumni.last_name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.dismiss();
      toast.success('ดาวน์โหลดรูปภาพสำเร็จ');
    } catch (error) {
      toast.dismiss();
      toast.error('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative my-8 w-full max-w-[1200px]">
        {/* Action Buttons - Floating Top */}
        <div className="absolute -top-4 right-0 z-10 flex gap-2">
          <button
            onClick={handleDownload}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center gap-2 px-5"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-medium">ดาวน์โหลด</span>
          </button>
          <button
            onClick={handleClose}
            className="p-3 bg-white hover:bg-gray-100 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Portfolio Infographic - 4:5 Ratio */}
        <div
          ref={portfolioRef}
          className="bg-white mx-auto"
          style={{ width: '1000px', aspectRatio: '4/5' }}
        >
          {/* Header Section with Gradient Background */}
          <div className="relative h-[25%] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
            {/* Decorative Patterns */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-36 -mb-36"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Header Content */}
            <div className="relative h-full flex items-center justify-between px-16 py-10">
              <div className="flex items-center gap-8">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-white p-2 shadow-2xl">
                    <img
                      src={alumni.photo_url}
                      alt={`${alumni.first_name} ${alumni.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {/* Status Badge */}
                  <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                    alumni.employment_status === 'employed' 
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {alumni.employment_status === 'employed' ? '✓ มีงานทำ' : '◷ หางาน'}
                  </div>
                </div>

                {/* Name & Basic Info */}
                <div className="text-white">
                  <h1 className="text-5xl font-bold mb-2 tracking-tight">
                    {alumni.first_name} {alumni.last_name}
                  </h1>
                  <p className="text-2xl text-blue-100 mb-4 font-light">
                    {alumni.position || 'ศิษย์เก่า'}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-blue-200">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <span className="font-medium">{alumni.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">จบปี {alumni.graduation_year}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder / Logo Area */}
              <div className="text-right text-white">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2">
                  <Award className="w-12 h-12" />
                </div>
                <p className="text-xs text-blue-200">Portfolio</p>
                <p className="text-sm font-bold">{alumni.alumni_id}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="h-[75%] grid grid-cols-3 gap-0">
            {/* Left Sidebar - Contact & Skills */}
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 space-y-6 border-r-4 border-blue-600">
              {/* Contact Information */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-600">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">ติดต่อ</h3>
                </div>
                <div className="space-y-3">
                  {alumni.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">อีเมล</p>
                        <p className="text-xs text-gray-900 break-all leading-tight">{alumni.email}</p>
                      </div>
                    </div>
                  )}
                  {alumni.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">เบอร์โทร</p>
                        <p className="text-xs text-gray-900">{alumni.phone}</p>
                      </div>
                    </div>
                  )}
                  {alumni.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">ที่อยู่</p>
                        <p className="text-xs text-gray-900 leading-tight">{alumni.address}</p>
                      </div>
                    </div>
                  )}
                  {alumni.portfolio && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">เว็บไซต์</p>
                        <p className="text-xs text-blue-600 break-all leading-tight">{alumni.portfolio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {alumni.skills && alumni.skills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-purple-600">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">ทักษะ</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alumni.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-xs font-semibold shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {alumni.custom_fields && alumni.custom_fields.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-pink-600">
                    <div className="p-2 bg-pink-600 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">รางวัล</h3>
                  </div>
                  <div className="space-y-2">
                    {alumni.custom_fields.slice(0, 3).map((field, index) => (
                      <div key={index} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold mb-0.5">{field.label}</p>
                        <p className="text-xs text-gray-900 leading-tight">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Main Details */}
            <div className="col-span-2 p-8 space-y-6">
              {/* About Me */}
              {alumni.about_me && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-600">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">เกี่ยวกับฉัน</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{alumni.about_me}</p>
                </div>
              )}

              {/* Current Employment */}
              {alumni.workplace && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-emerald-600">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">การทำงานปัจจุบัน</h3>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-l-4 border-emerald-600">
                    <p className="text-base font-bold text-gray-900 mb-1">{alumni.position}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <p className="text-sm">{alumni.workplace}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Education */}
                {alumni.education && alumni.education.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-orange-600">
                      <div className="p-2 bg-orange-600 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-gray-800">การศึกษา</h3>
                    </div>
                    <div className="space-y-3">
                      {alumni.education.slice(0, 2).map((edu, index) => (
                        <div key={index} className="border-l-4 border-orange-400 pl-3 bg-orange-50 py-2 px-2 rounded-r-lg">
                          <p className="text-sm font-bold text-gray-900 leading-tight">{edu.institution}</p>
                          <p className="text-xs text-gray-600 leading-tight">{edu.address}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">{edu.years}</p>
                            {edu.grade && (
                              <span className="px-2 py-0.5 bg-orange-600 text-white rounded-full text-xs font-bold">
                                {edu.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Experience */}
                {alumni.experience && alumni.experience.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-cyan-600">
                      <div className="p-2 bg-cyan-600 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-gray-800">ประสบการณ์</h3>
                    </div>
                    <div className="space-y-3">
                      {alumni.experience.slice(0, 2).map((exp, index) => (
                        <div key={index} className="border-l-4 border-cyan-400 pl-3 bg-cyan-50 py-2 px-2 rounded-r-lg">
                          <p className="text-sm font-bold text-gray-900 leading-tight">{exp.position}</p>
                          <p className="text-xs text-gray-600 leading-tight">{exp.company}</p>
                          <p className="text-xs text-gray-500 mt-1">{exp.years}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with branding */}
              <div className="absolute bottom-8 right-8 text-right">
                <p className="text-xs text-gray-400">ระบบจัดการข้อมูลศิษย์เก่า</p>
                <p className="text-xs text-gray-500 font-semibold">Updated: {new Date().toLocaleDateString('th-TH')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
