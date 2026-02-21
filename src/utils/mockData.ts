import { Student, Alumni, Project, Advisor } from '../contexts/DataContext';

export function generateMockData() {
  const faculties = [
    'คณะวิทยาศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะบริหารธุรกิจ',
  ];

  const departments: Record<string, string[]> = {
    'คณะวิทยาศาสตร์': ['เคมี', 'ฟิสิกส์', 'คณิตศาสตร์', 'ชีววิทยา'],
    'คณะวิศวกรรมศาสตร์': [
      'วิศวกรรมไฟฟ้า',
      'วิศวกรรมเครื่องกล',
      'วิศวกรรมโยธา',
      'วิศวกรรมคอมพิวเตอร์',
    ],
    'คณะเทคโนโลยีสารสนเทศ': [
      'วิทยาการคอมพิวเตอร์',
      'เทคโนโลยีสารสนเทศ',
      'วิศวกรรมซอฟต์แวร์',
    ],
    'คณะบริหารธุรกิจ': ['การจัดการ', 'การตลาด', 'การเงิน', 'การบัญชี'],
  };

  const firstNames = [
    'สมชาย',
    'สมหญิง',
    'วิชัย',
    'วิภา',
    'ประเสริฐ',
    'ประภา',
    'สุรชัย',
    'สุดารัตน์',
    'นิรันดร์',
    'นภัสวรรณ',
    'ธนากร',
    'ธนาภรณ์',
    'ชัยวัฒน์',
    'ชนิดา',
    'พงศ์พัฒน์',
    'พรรณี',
  ];

  const lastNames = [
    'สมบูรณ์',
    'ใจดี',
    'รักษาสิทธิ์',
    'เจริญสุข',
    'พัฒนากิจ',
    'วิริยะ',
    'สุขสวัสดิ์',
    'มั่นคง',
    'เพียรทำการ',
    'ชำนาญกิจ',
  ];

  const workplaces = [
    'บริษัท ไทยเบฟเวอเรจ จำกัด',
    'บริษัท ปตท. จำกัด (มหาชน)',
    'ธนาคารกสิกรไทย',
    'บริษัท กูเกิล (ประเทศไทย)',
    'บริษัท ไมโครซอฟท์ (ประเทศไทย)',
    'บริษัท ซีพี ออลล์ จำกัด',
    'บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น',
    'สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ',
  ];

  const positions = [
    'Software Engineer',
    'Data Analyst',
    'Project Manager',
    'Business Analyst',
    'UX/UI Designer',
    'Marketing Manager',
    'Financial Analyst',
    'Research Scientist',
  ];

  const projectTags = [
    'Web Application',
    'Mobile App',
    'AI/ML',
    'IoT',
    'Data Science',
    'Blockchain',
    'Game Development',
    'Cloud Computing',
  ];

  // Generate students
  const students: Student[] = [];
  for (let i = 0; i < 50; i++) {
    const faculty = faculties[Math.floor(Math.random() * faculties.length)];
    const department =
      departments[faculty][
        Math.floor(Math.random() * departments[faculty].length)
      ];
    const year = Math.floor(Math.random() * 4) + 1;
    const status: Student['status'] =
      Math.random() > 0.1 ? 'Active' : Math.random() > 0.5 ? 'Graduated' : 'Suspended';

    students.push({
      id: `S${i + 1}`,
      student_id: `6${(610000 + i).toString().slice(1)}`,
      first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
      last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
      faculty,
      department,
      year,
      email: `student${i + 1}@university.ac.th`,
      phone: `08${Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0')}`,
      status,
    });
  }

  // Generate alumni
  const alumni: Alumni[] = [];
  for (let i = 0; i < 30; i++) {
    const faculty = faculties[Math.floor(Math.random() * faculties.length)];
    const department =
      departments[faculty][
        Math.floor(Math.random() * departments[faculty].length)
      ];
    const graduationYear = 2018 + Math.floor(Math.random() * 7);

    const sampleSkills = [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'Java',
      'SQL',
      'MongoDB',
      'Git',
      'Docker',
      'AWS',
      'Azure',
      'Figma',
      'Adobe XD',
    ];

    alumni.push({
      id: `A${i + 1}`,
      alumni_id: `6${(610000 + i).toString().slice(1)}`,
      first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
      last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
      faculty,
      department,
      graduation_year: graduationYear,
      workplace: workplaces[Math.floor(Math.random() * workplaces.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      contact_info: `alumni${i + 1}@email.com`,
      portfolio: `https://portfolio${i + 1}.com`,
      photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      employment_status: Math.random() > 0.2 ? 'employed' : 'seeking',
      // New portfolio fields
      about_me:
        i % 3 === 0
          ? `ฉันเป็นศิษย์เก่าที่หลงใหลในการพัฒนาเทคโนโลยีและนวัตกรรมใหม่ๆ มีประสบการณ์ในการทำงานกับทีมที่หลากหลายและมุ่งมั่นในการสร้างสรรค์ผลงานที่มีคุณภาพ`
          : '',
      email: `alumni${i + 1}@email.com`,
      address:
        i % 2 === 0
          ? '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110'
          : '',
      phone: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      skills:
        i % 2 === 0
          ? sampleSkills.slice(0, 3 + Math.floor(Math.random() * 4))
          : [],
      education:
        i % 3 === 0
          ? [
              {
                years: '2011-2015',
                institution: 'โรงเรียนศรีสะเกษวิทยาลัย',
                address: '319 หมู่5 ถนนวันลูกเสือ เมืองศรีสะเกษ ศรีสะเกษ 33000',
                grade: '3.65',
              },
              {
                years: `${graduationYear - 4}-${graduationYear}`,
                institution: 'มหาวิทยาลัยราชภัฏศรีสะเกษ',
                address:
                  '319 ถนนไทยพันทา ตำบลโพธิ์ อำเภอเมืองศรีสะเกษ ศรีสะเกษ 33000',
                grade: '3.74',
              },
            ]
          : [],
      experience:
        i % 2 === 0
          ? [
              {
                years: `${graduationYear}-${graduationYear + 3}`,
                company: workplaces[Math.floor(Math.random() * workplaces.length)],
                position: positions[Math.floor(Math.random() * positions.length)],
              },
            ]
          : [],
      custom_fields:
        i % 4 === 0
          ? [
              { label: 'รางวัลที่ได้รับ', value: 'รางวัลนักศึกษาดีเด่น ประจำปี 2020' },
              { label: 'งานอดิเรก', value: 'การเขียนโปรแกรม, การอ่านหนังสือ' },
            ]
          : [],
    });
  }

  // Generate advisors
  const advisors: Advisor[] = [];
  faculties.forEach((faculty, fIndex) => {
    departments[faculty].forEach((department, dIndex) => {
      const advisorCount = 2;
      for (let i = 0; i < advisorCount; i++) {
        advisors.push({
          id: `ADV${fIndex}${dIndex}${i}`,
          advisor_id: `T${(1000 + advisors.length).toString()}`,
          name: `อาจารย์ ${
            firstNames[Math.floor(Math.random() * firstNames.length)]
          } ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          faculty,
          department,
          email: `advisor${advisors.length + 1}@university.ac.th`,
          phone: `02${Math.floor(Math.random() * 10000000)
            .toString()
            .padStart(7, '0')}`,
        });
      }
    });
  });

  // Generate projects
  const projects: Project[] = [];
  for (let i = 0; i < 40; i++) {
    const isGroup = Math.random() > 0.3;
    const year = 2020 + Math.floor(Math.random() * 5);
    const advisor = advisors[Math.floor(Math.random() * advisors.length)];
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const selectedTags = Array.from(
      { length: tagCount },
      () => projectTags[Math.floor(Math.random() * projectTags.length)]
    );

    const memberCount = isGroup ? Math.floor(Math.random() * 3) + 2 : 1;
    const members = Array.from(
      { length: memberCount },
      (_, idx) =>
        `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
          lastNames[Math.floor(Math.random() * lastNames.length)]
        }`
    );

    projects.push({
      id: `P${i + 1}`,
      project_id: `PRJ${(2024000 + i).toString()}`,
      title_th: `โครงงาน${
        isGroup ? 'กลุ่ม' : 'เดี่ยว'
      }เกี่ยวกับ ${selectedTags[0]} ปี ${year}`,
      title_en: `${isGroup ? 'Group' : 'Individual'} Project about ${
        selectedTags[0]
      } ${year}`,
      description: `นี่คือโครงงานที่พัฒนาขึ้นเพื่อแก้ปัญหาในด้าน ${selectedTags.join(
        ', '
      )} โดยใช้เทคโนโลยีสมัยใหม่และมีการประยุกต์ใช้ในชีวิตจริง`,
      advisor: advisor.name,
      year,
      members,
      document_url:
        Math.random() > 0.3
          ? `https://docs.example.com/project${i + 1}.pdf`
          : '',
      tags: selectedTags,
      status:
        Math.random() > 0.2
          ? 'Completed'
          : Math.random() > 0.5
          ? 'Approved'
          : 'Draft',
      type: isGroup ? 'group' : 'individual',
      has_award: Math.random() > 0.8,
    });
  }

  return { students, alumni, projects, advisors };
}