import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { GraduationCap, BookOpen, PauseCircle } from 'lucide-react';

interface StudentStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (status: 'Active' | 'Suspended' | 'Graduated') => void;
  studentCount: number;
}

export default function StudentStatusDialog({
  open,
  onClose,
  onConfirm,
  studentCount,
}: StudentStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Suspended' | 'Graduated' | null>(null);

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus);
      setSelectedStatus(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    onClose();
  };

  const statusOptions = [
    {
      value: 'Active' as const,
      label: 'กำลังศึกษาอยู่',
      description: 'นักศึกษายังคงศึกษาอยู่ในระบบ',
      icon: BookOpen,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      selectedColor: 'bg-green-100 border-green-500',
      iconColor: 'text-green-600',
    },
    {
      value: 'Suspended' as const,
      label: 'พักการศึกษา',
      description: 'นักศึกษาพักการศึกษาชั่วคราว',
      icon: PauseCircle,
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      selectedColor: 'bg-yellow-100 border-yellow-500',
      iconColor: 'text-yellow-600',
    },
    {
      value: 'Graduated' as const,
      label: 'จบการศึกษา',
      description: 'นักศึกษาจบการศึกษาและจะถูกย้ายไปเป็นศิษย์เก่า',
      icon: GraduationCap,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-500',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>เปลี่ยนสถานะนักศึกษา</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600">
            กรุณาเลือกสถานะสำหรับนักศึกษา {studentCount} คน
          </p>

          <div className="grid gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected ? option.selectedColor : option.color
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-white ${option.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-full h-full text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedStatus === 'Graduated' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>หมายเหตุ:</strong> นักศึกษาที่จบการศึกษาจะถูกย้ายไปยังระบบศิษย์เก่าและสามารถดูรายชื่อได้ที่หน้าศิษย์เก่า
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStatus}>
            ยืนยัน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
