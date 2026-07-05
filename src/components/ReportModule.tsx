import React, { useState, useEffect } from 'react';
import { PCCCStoreType } from '../lib/store';
import { formatDateDMY } from '../lib/dateUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  FileDown, Printer, ShieldCheck, Flame, Users, Calendar, 
  AlertTriangle, CheckSquare, Award, BookOpen, Search,
  Plus, Edit, Trash2, Save, FileText, ClipboardList, TrendingUp, X,
  RefreshCw, CheckCircle2
} from 'lucide-react';

interface ReportModuleProps {
  store: PCCCStoreType;
}

// Interfaces for our custom plans and reports
interface WorkPlan {
  id: string;
  planNumber: string;
  title: string;
  date: string;
  creatorId: string;
  type: string;
  target: string;
  status: 'Chờ phê duyệt' | 'Đã phê duyệt' | 'Đang triển khai' | 'Đã hoàn thành';
  description?: string;
}

interface WorkReport {
  id: string;
  reportNumber: string;
  title: string;
  date: string;
  authorId: string;
  category: string;
  content: string;
  status: 'Chờ duyệt' | 'Đã gửi' | 'Đã phê duyệt';
}

interface PersonalPlan {
  id: string;
  date: string;
  timeSlot: string;
  title: string;
  location: string;
  officerId: string;
  description: string;
  status: 'Chưa thực hiện' | 'Đang thực hiện' | 'Đã hoàn thành';
  resultReport: string;
}

interface EvaluatedKpiTask {
  id: string;
  name: string;
  product: string;
  scorePerProduct: number;
  assignedQty: number;
  completedQty: number;
  qualityFactor: number; // e.g. 1.0 = Đảm bảo (100%), 1.1 = 110% Vượt mức, 0.75 = 75% Chỉnh sửa 1 lần, 0.5 = 50%
  speedFactor: number;   // e.g. 1.0 = Đảm bảo (100%), 0.75 = 75% Trễ hạn/Nhắc nhở 1 lần, 0.5 = 50%
  qualityNote: string;   // e.g. "Đảm bảo", "Đảm bảo vượt mức", etc.
  speedNote: string;     // e.g. "Đảm bảo", "Chậm 01 lần", etc.
}

const DEFAULT_PERSONAL_PLANS: PersonalPlan[] = [
  {
    id: 'P-PLAN-001',
    date: '2026-06-15',
    timeSlot: '08:00 - 11:30',
    title: 'Kiểm tra đột xuất công tác trực ban, phương án phòng ngừa hỏa hoạn tại kho bãi vật tư xây dựng',
    location: 'Tổng kho vật tư số 4, Phường Tam Phú',
    officerId: 'OFF_001',
    description: 'Rà soát giấy phép, bể nước chữa cháy dự phòng và kỹ năng thao tác lăng phun của lực lượng tự quản.',
    status: 'Đang thực hiện',
    resultReport: 'Đã hoàn thành kiểm tra hiện trường vòng 1. Phát hiện 02 điểm tủ điện hở, đã yêu cầu kỹ thuật khắc phục ngay lập tức.'
  },
  {
    id: 'P-PLAN-002',
    date: '2026-06-15',
    timeSlot: '14:00 - 16:30',
    title: 'Huấn luyện nghiệp vụ an toàn PCCC cứu hộ cơ sở cho đội ngũ nhân viên trung tâm Anh ngữ',
    location: 'Trụ sở Anh ngữ quốc tế, Phường Hiệp Bình Chánh',
    officerId: 'OFF_002',
    description: 'Thực hành dập tắt khay xăng bằng bình chữa cháy xách tay, diễn tập sơ tán khẩn cấp trẻ em học sinh.',
    status: 'Chưa thực hiện',
    resultReport: ''
  },
  {
    id: 'P-PLAN-003',
    date: '2026-06-16',
    timeSlot: '09:00 - 11:00',
    title: 'Thẩm duyệt bổ sung thiết kế PCCC chung cư mini tái định cư mới bàn giao khách hàng',
    location: 'Chung cư mini Skyline, Phường Linh Đông',
    officerId: 'OFF_003',
    description: 'Kiểm duyệt hệ thống đầu phun tự động sprinklers, màng ngăn cháy dốc hầm xe của ban đầu tư quản lý.',
    status: 'Chưa thực hiện',
    resultReport: ''
  }
];

const DEFAULT_WORK_PLANS: WorkPlan[] = [
  {
    id: 'PLAN-001',
    planNumber: '12/KH-PCCC-2026',
    title: 'Kế hoạch kiểm tra an toàn PCCC các cơ sở karaoke, vũ trường trên địa bàn mùa hè 2026',
    date: '2026-06-10',
    creatorId: 'OFF_001',
    type: 'Kế hoạch kiểm tra',
    target: '32 cơ sở karaoke, vũ trường thuộc địa bàn quản lý kiểm soát',
    status: 'Đang triển khai',
    description: 'Thành lập tổ công tác đặc biệt triển khai kiểm tra đột xuất giấy phép thiết kế PCCC, lối thoát hiểm sơ cứu, và hệ thống báo cháy tự động tại toàn bộ tụ điểm karaoke.'
  },
  {
    id: 'PLAN-002',
    planNumber: '15/KH-PCCC-2026',
    title: 'Kế hoạch tổ chức huấn luyện, thực tập phương án chữa cháy khu chung cư cao tầng',
    date: '2026-06-12',
    creatorId: 'OFF_002',
    type: 'Kế hoạch diễn tập',
    target: 'Cư dân block A, B và ban quản lý chung cư Golden Land',
    status: 'Đã phê duyệt',
    description: 'Phối hợp với Ban quản lý chung cư dựng tình huống phát hỏa tại tầng hầm, triển khai xe thang cứu hộ, hướng dẫn kỹ năng thoát hiểm cho hơn 300 hộ dân bám trực.'
  },
  {
    id: 'PLAN-003',
    planNumber: '18/KH-PCCC-2026',
    title: 'Kế hoạch tuyên truyền phổ biến kiến thức PCCC dịp cao điểm nắng nóng năm 2026',
    date: '2026-06-25',
    creatorId: 'OFF_003',
    type: 'Kế hoạch tuyên truyền',
    target: '15 trường học và 3 đơn vị hành chính sự nghiệp thuộc địa phương',
    status: 'Chờ phê duyệt',
    description: 'Biên tập tờ rơi hướng dẫn tủ điện, cẩm nang phòng cháy thiết thực, trực tiếp tuyên truyền trong các buổi chào cờ sáng thứ Hai.'
  }
];

const DEFAULT_WORK_REPORTS: WorkReport[] = [
  {
    id: 'REP-001',
    reportNumber: '45/BC-PCCC-2026',
    title: 'Báo cáo kết quả tuần tra, xử lý vi phạm trật tự PCCC tuần 24',
    date: '2026-06-08',
    authorId: 'OFF_004',
    category: 'Báo cáo tuần',
    content: 'Đã tổ chức kiểm tra 12 lượt cơ sở sản xuất, lập biên bản xử phạt vi phạm hành chính đối với 03 cơ sở không bảo dưỡng hệ thống bình bọt chữa cháy CO2 đúng thời hạn kíp trực. Tổng tiền phạt: 15.000.000 VNĐ. Nhắc nhở nghiêm túc các chủ hộ khắc phục trong 07 ngày.',
    status: 'Đã phê duyệt'
  },
  {
    id: 'REP-002',
    reportNumber: '48/BC-PCCC-2026',
    title: 'Báo cáo sơ kết công tác phòng cháy chữa cháy và CNCH 6 tháng đầu năm 2026',
    date: '2026-06-11',
    authorId: 'OFF_002',
    category: 'Báo cáo định kỳ',
    content: 'Tổ chức thành công 08 buổi tuyên truyền cộng đồng quy mô lớn. Hoàn thành diễn tập thực binh phương án dập tắt hỏa hoạn nhà xưởng dệt tại khu công nghiệp mini. Ghi nhận số lượng đám cháy giảm 15% so với cùng kỳ 2025. Duy trì kỷ cương kỷ luật bám trực của cán bộ chiến sĩ đạt chuẩn tốt.',
    status: 'Đã gửi'
  },
  {
    id: 'REP-003',
    reportNumber: '52/BC-PCCC-2026',
    title: 'Báo cáo nhanh kết quả chữa cháy vụ việc cháy bãi phế liệu tại chân cầu đường sắt',
    date: '2026-06-13',
    authorId: 'OFF_005',
    category: 'Báo cáo đột xuất',
    content: 'Nhận tin báo cháy lúc 14h15 ngày 13/06. Xuất bến 3 xe chữa cháy chuyên dụng phối hợp cùng lực lượng dân phòng địa bàn. Khống chế đám cháy hoàn toàn lúc 14h45, ngăn chặn cháy lan sang kho gỗ lân cận. Không ghi nhận thương vong về người. Tài sản hao hụt nhỏ ước tính khoảng 5.000.000 đồng.',
    status: 'Chờ duyệt'
  }
];

export default function ReportModule({ store }: ReportModuleProps) {
  const { 
    officers, setOfficers, facilities, inspections, 
    equipment, plans, incomingDocs, outgoingDocs, tasks, schedules
  } = store;


  // Selected statistics subtab (replaces original reportType)
  const [reportType, setReportType] = useState<'kpi' | 'facilities' | 'rescue' | 'documents'>('kpi');
  const [subTab, setSubTab] = useState<'plans' | 'kpi-class'>('plans');

  // KPI Classification State Management
  const [selectedKpiOfficerId, setSelectedKpiOfficerId] = useState<string | null>(null);
  const [kpiEValue, setKpiEValue] = useState<number>(30); // E.g., max 30 points as per guideline
  const [officerKpiTasks, setOfficerKpiTasks] = useState<Record<string, EvaluatedKpiTask[]>>(() => {
    const cached = localStorage.getItem('pccc_officer_kpi_tasks');
    return cached ? JSON.parse(cached) : {};
  });

  // KPI dialog / creation states
  const [isAddingKpiRow, setIsAddingKpiRow] = useState(false);
  const [newKpiRowForm, setNewKpiRowForm] = useState<Omit<EvaluatedKpiTask, 'id'>>({
    name: '',
    product: 'Công văn',
    scorePerProduct: 10,
    assignedQty: 1,
    completedQty: 1,
    qualityFactor: 1.0,
    speedFactor: 1.0,
    qualityNote: 'Đảm bảo',
    speedNote: 'Đảm bảo'
  });

  // Sync officer custom kpi tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pccc_officer_kpi_tasks', JSON.stringify(officerKpiTasks));
  }, [officerKpiTasks]);

  const getKpiTasksForOfficer = (officerId: string): EvaluatedKpiTask[] => {
    if (officerKpiTasks[officerId] && officerKpiTasks[officerId].length > 0) {
      return officerKpiTasks[officerId];
    }
    // Return standard default tasks representing Page 16 of guidance PDF
    return [
      { id: '1', name: 'Họp đội định kỳ, báo kết quả thực hiện công tác trong tuần', product: 'Công văn', scorePerProduct: 10, assignedQty: 5, completedQty: 5, qualityFactor: 1.0, speedFactor: 1.0, qualityNote: 'Đảm bảo', speedNote: 'Đảm bảo' },
      { id: '2', name: 'Đi học bổ túc nghiệp vụ PCCC & CNCH ban đêm', product: 'Báo cáo', scorePerProduct: 15, assignedQty: 3, completedQty: 3, qualityFactor: 1.0, speedFactor: 1.0, qualityNote: 'Đảm bảo', speedNote: 'Đảm bảo' },
      { id: '3', name: 'Huấn luyện nghiệp vụ an toàn PCCC, rà soát kết quả', product: 'Tờ trình', scorePerProduct: 20, assignedQty: 3, completedQty: 3, qualityFactor: 1.1, speedFactor: 1.0, qualityNote: 'Đảm bảo vượt mức', speedNote: 'Đảm bảo' },
      { id: '4', name: 'Xây dựng phương án phòng chống cháy nổ bãi xe', product: 'Thông tư', scorePerProduct: 90, assignedQty: 1, completedQty: 1, qualityFactor: 1.0, speedFactor: 1.0, qualityNote: 'Đảm bảo', speedNote: 'Đảm bảo' },
      { id: '5', name: 'Số hóa, sắp xếp hồ sơ an toàn PCCC các cơ sở địa bàn', product: 'Quyết định', scorePerProduct: 90, assignedQty: 1, completedQty: 1, qualityFactor: 0.75, speedFactor: 1.0, qualityNote: 'Chỉnh sửa 01 lần', speedNote: 'Đảm bảo' }
    ];
  };

  // Work plans state management (with persistence)
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>(() => {
    const cached = localStorage.getItem('pccc_work_plans');
    return cached ? JSON.parse(cached) : DEFAULT_WORK_PLANS;
  });

  // Daily Personal plans state management (with persistence)
  const [personalPlans, setPersonalPlans] = useState<PersonalPlan[]>(() => {
    const cached = localStorage.getItem('pccc_personal_daily_plans');
    return cached ? JSON.parse(cached) : DEFAULT_PERSONAL_PLANS;
  });

  // Sync back to localstorage
  useEffect(() => {
    localStorage.setItem('pccc_work_plans', JSON.stringify(workPlans));
  }, [workPlans]);

  useEffect(() => {
    localStorage.setItem('pccc_personal_daily_plans', JSON.stringify(personalPlans));
  }, [personalPlans]);

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu báo cáo thống kê và lịch công tác...');
      setTimeout(() => {
        localStorage.setItem('pccc_work_plans', JSON.stringify(workPlans));
        localStorage.setItem('pccc_personal_daily_plans', JSON.stringify(personalPlans));
        localStorage.setItem('pccc_officer_kpi_tasks', JSON.stringify(officerKpiTasks));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ báo cáo thống kê thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  // Form states - Personal Plan
  const [editingPersonalPlan, setEditingPersonalPlan] = useState<PersonalPlan | null>(null);
  const [isAddingPersonalPlan, setIsAddingPersonalPlan] = useState(false);
  const [personalPlanForm, setPersonalPlanForm] = useState<Omit<PersonalPlan, 'id'>>({
    date: '2026-06-15',
    timeSlot: '',
    title: '',
    location: '',
    officerId: 'OFF_001',
    description: '',
    status: 'Chưa thực hiện',
    resultReport: ''
  });

  // Filter States - Personal Plan
  const [personalPlanSearch, setPersonalPlanSearch] = useState('');
  const [personalPlanStartDateFilter, setPersonalPlanStartDateFilter] = useState('');
  const [personalPlanEndDateFilter, setPersonalPlanEndDateFilter] = useState('');
  const [personalPlanOfficerFilter, setPersonalPlanOfficerFilter] = useState('');
  const [personalPlanStatusFilter, setPersonalPlanStatusFilter] = useState('All');
  const [personalPlanSingleDateExport, setPersonalPlanSingleDateExport] = useState('2026-06-15');
  const [exportRangeStart, setExportRangeStart] = useState('2026-06-15');
  const [exportRangeEnd, setExportRangeEnd] = useState('2026-06-21');

  // Quick Report inline states
  const [reportingPlanId, setReportingPlanId] = useState<string | null>(null);
  const [tempResultReport, setTempResultReport] = useState<string>('');

  // Form states - Work Plan
  const [editingPlan, setEditingPlan] = useState<WorkPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [planForm, setPlanForm] = useState<Omit<WorkPlan, 'id'>>({
    planNumber: '',
    title: '',
    date: '2026-06-13',
    creatorId: 'OFF_001',
    type: 'Kế hoạch kiểm tra',
    target: '',
    status: 'Chờ phê duyệt',
    description: ''
  });

  // Preview details
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<WorkPlan | null>(null);

  // Search and Filter states
  const [planSearch, setPlanSearch] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState('All');

  // Deletion confirmation state variables
  const [personalPlanIdToDelete, setPersonalPlanIdToDelete] = useState<string | null>(null);

  // Computations for overall summary dashboard counters
  const totalOfficers = officers.length;
  const activeInspections = inspections.length;
  const totalCompletedTasks = tasks.filter(t => t.status === 'Hoàn thành').length;
  const overduedTasks = tasks.filter(t => t.status === 'Quá hạn').length;
  const successRate = tasks.length > 0 ? Math.round((totalCompletedTasks / tasks.length) * 100) : 100;

  // CSV Exporter for stats tab
  const handleExportCSV = (type: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    
    if (type === 'general') {
      csvContent += 'Đề mục Thống kê,Số liệu\n';
      csvContent += `"Tổng số cán bộ chiến sĩ","${totalOfficers}"\n`;
      csvContent += `"Cơ sở thuộc diện quản lý","${facilities.length}"\n`;
      csvContent += `"Số cuộc kiểm tra an toàn","${activeInspections}"\n`;
      csvContent += `"Phương án chữa cháy hoạt động","${plans.length}"\n`;
      csvContent += `"Văn bản đến nhận sách","${incomingDocs.length}"\n`;
      csvContent += `"Văn bản đi phê chuẩn","${outgoingDocs.length}"\n`;
      csvContent += `"Tỷ lệ giải quyết công việc","${successRate}%"\n`;
    } else if (type === 'facilities') {
      csvContent += 'Mã cơ sở,Tên cơ sở,Địa chỉ,Lĩnh vực,Ngành nghề,Phân loại Phụ lục II,Trạng thái\n';
      facilities.forEach(f => {
        csvContent += `"${f.id}","${f.name}","${f.address}","${f.sector || ''}","${f.industry || ''}","${f.dangerLevel}","${f.status}"\n`;
      });
    } else {
      csvContent += 'Mã kiểm tra,Tên cơ sở,Ngày kiểm tra,Hình thức,Kết quả\n';
      inspections.forEach(i => {
        const fac = facilities.find(f => f.id === i.facilityId)?.name || 'N/A';
        csvContent += `"${i.id}","${fac}","${i.date}","${i.type}","${i.result}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Báo cáo Thống kê PCCC 2026_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Recharts calculations
  const officerKpiData = officers.map(o => ({
    name: o.fullName.split(' ').pop(),
    'Điểm KPI': o.kpi,
    'Số công việc': tasks.filter(t => t.assigneeId === o.id).length
  })).sort((a,b) => b['Điểm KPI'] - a['Điểm KPI']);

  const wardDistribution = facilities.reduce((acc, f) => {
    acc[f.ward] = (acc[f.ward] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wardPieData = Object.keys(wardDistribution).map(w => ({
    name: `p. ${w}`,
    value: wardDistribution[w]
  }));

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

  // Plan actions
  const handleSavePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.title || !planForm.planNumber) {
      alert('Vui lòng điền đầy đủ tiêu đề và số hiệu kế hoạch');
      return;
    }

    if (editingPlan) {
      setWorkPlans(workPlans.map(p => p.id === editingPlan.id ? { ...p, ...planForm } : p));
      setEditingPlan(null);
    } else {
      const newPlan: WorkPlan = {
        id: `WORK-PLAN-${Date.now()}`,
        ...planForm
      };
      setWorkPlans([newPlan, ...workPlans]);
      setIsAddingPlan(false);
    }
    
    // Reset form
    setPlanForm({
      planNumber: '',
      title: '',
      date: '2026-06-13',
      creatorId: 'OFF_001',
      type: 'Kế hoạch kiểm tra',
      target: '',
      status: 'Chờ phê duyệt',
      description: ''
    });
  };

  const handleOpenEditPlan = (p: WorkPlan) => {
    setEditingPlan(p);
    setPlanForm({
      planNumber: p.planNumber,
      title: p.title,
      date: p.date,
      creatorId: p.creatorId,
      type: p.type,
      target: p.target,
      status: p.status,
      description: p.description || ''
    });
    setIsAddingPlan(true);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kế hoạch này không?')) {
      setWorkPlans(workPlans.filter(p => p.id !== id));
      if (selectedPlanDetail?.id === id) {
        setSelectedPlanDetail(null);
      }
    }
  };



  // Personal Plan Actions
  const handleSavePersonalPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalPlanForm.date) {
      alert('Vui lòng điền đầy đủ ngày thực hiện');
      return;
    }

    if (editingPersonalPlan) {
      setPersonalPlans(personalPlans.map(p => p.id === editingPersonalPlan.id ? { ...p, ...personalPlanForm } : p));
      setEditingPersonalPlan(null);
    } else {
      const newPlan: PersonalPlan = {
        id: `P-PLAN-${Date.now()}`,
        ...personalPlanForm
      };
      setPersonalPlans([newPlan, ...personalPlans]);
    }
    setIsAddingPersonalPlan(false);
    // Reset Form
    setPersonalPlanForm({
      date: '2026-06-15',
      timeSlot: '',
      title: '',
      location: '',
      officerId: 'OFF_001',
      description: '',
      status: 'Chưa thực hiện',
      resultReport: ''
    });
  };

  const handleOpenEditPersonalPlan = (p: PersonalPlan) => {
    setEditingPersonalPlan(p);
    setPersonalPlanForm({
      date: p.date,
      timeSlot: p.timeSlot || '',
      title: p.title || '',
      location: p.location,
      officerId: p.officerId,
      description: p.description,
      status: p.status,
      resultReport: p.resultReport || ''
    });
    setIsAddingPersonalPlan(true);
  };

  const handleDeletePersonalPlan = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kế hoạch cá nhân này không?')) {
      setPersonalPlans(personalPlans.filter(p => p.id !== id));
    }
  };

  const handleExportWeeklyExcel = () => {
    // Determine the export date list based on selected start and end dates
    const exportDates: string[] = [];
    
    if (personalPlanStartDateFilter && personalPlanEndDateFilter) {
      // Both filters are set, generate dates between them (inclusive)
      const start = new Date(personalPlanStartDateFilter);
      const end = new Date(personalPlanEndDateFilter);
      const cur = new Date(start);
      // Ensure we don't accidentally get stuck in an infinite loop
      let iterations = 0;
      while (cur <= end && iterations < 366) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        exportDates.push(`${yyyy}-${mm}-${dd}`);
        cur.setDate(cur.getDate() + 1);
        iterations++;
      }
    } else if (personalPlanStartDateFilter) {
      // Only start date is set, generate 7 days from start date
      const start = new Date(personalPlanStartDateFilter);
      for (let i = 0; i < 7; i++) {
        const cur = new Date(start);
        cur.setDate(start.getDate() + i);
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        exportDates.push(`${yyyy}-${mm}-${dd}`);
      }
    } else if (personalPlanEndDateFilter) {
      // Only end date is set, generate 7 days leading to end date
      const end = new Date(personalPlanEndDateFilter);
      for (let i = 6; i >= 0; i--) {
        const cur = new Date(end);
        cur.setDate(end.getDate() - i);
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        exportDates.push(`${yyyy}-${mm}-${dd}`);
      }
    } else {
      // Default behavior: find first personal plan's date or current date and build Monday to Sunday week
      const refDateStr = personalPlans && personalPlans.length > 0 ? personalPlans[0].date : '2026-06-15';
      const dateObj = new Date(refDateStr);
      const day = dateObj.getDay(); // 0: Sun, 1: Mon, ...
      const diffToMonday = dateObj.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(dateObj.setDate(diffToMonday));
      
      for (let i = 0; i < 7; i++) {
        const tempDate = new Date(monday);
        tempDate.setDate(monday.getDate() + i);
        const yyyy = tempDate.getFullYear();
        const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
        const dd = String(tempDate.getDate()).padStart(2, '0');
        exportDates.push(`${yyyy}-${mm}-${dd}`);
      }
    }

    if (exportDates.length === 0) {
      alert("Không tìm thấy khoảng thời gian hợp lệ để xuất báo cáo.");
      return;
    }

    const startDateStr = formatDateDMY(exportDates[0]);
    const endDateStr = formatDateDMY(exportDates[exportDates.length - 1]);
    const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;

    // Officer short name formatting helper
    const getOfficerShortName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        const last = parts[parts.length - 1];
        const prev = parts[parts.length - 2];
        if (['hoàng', 'quốc', 'minh', 'đình', 'văn', 'thị', 'thành', 'hồng', 'đức', 'ngọc', 'trọng', 'thế', 'hoài', 'kim'].includes(prev.toLowerCase())) {
          return `${prev} ${last}`;
        }
        return last;
      }
      return fullName;
    };

    // Get HTML content
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        body { font-family: "Times New Roman", Times, serif; }
        .header-table { width: 100%; border: none; font-size: 11pt; margin-bottom: 20px; }
        .header-table td { border: none; padding: 2px; text-align: center; vertical-align: top; }
        .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
        .doc-subtitle { text-align: center; font-size: 11.5pt; font-weight: bold; font-style: italic; margin-bottom: 25px; }
        
        .main-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
        .main-table th { border: 1px solid #000000; padding: 10px 6px; font-weight: bold; text-align: center; background-color: #f2f2f2; text-transform: uppercase; }
        .main-table td { border: 1px solid #000000; padding: 8px 6px; vertical-align: middle; }
        
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .text-red { color: #ff0000; font-weight: bold; }
        .signature-table { width: 100%; border: none; font-size: 11pt; margin-top: 30px; }
        .signature-table td { border: none; padding: 5px; text-align: center; width: 50%; vertical-align: top; }
      </style>
      </head>
      <body>
        
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              PHÒNG CẢNH SÁT PCCC VÀ CNCH<br/>
              <span style="text-decoration: underline;">ĐỘI CHỮA CHÁY VÀ CNCH KV TÂN AN</span>
            </td>
            <td style="width: 55%; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
              <span style="text-decoration: underline;">Độc lập – Tự do – Hạnh phúc</span><br/>
              <span style="font-weight: normal; font-style: italic; font-size: 10pt;">${todayStrInVietnamese}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 25px; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              PHÊ DUYỆT CỦA LÃNH ĐẠO
            </td>
            <td></td>
          </tr>
        </table>

        <div class="doc-title" style="text-align: center; font-weight: bold; font-size: 14pt;">KẾ HOẠCH CÔNG TÁC TUẦN</div>
        <div class="doc-subtitle" style="text-align: center; font-style: italic; font-size: 11pt; font-weight: bold; margin-bottom: 20px;">(Từ ngày ${startDateStr} đến ${endDateStr})</div>

        <table class="main-table" border="1" style="border-collapse: collapse; border: 1px solid black; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th scope="col" style="width: 15%; border: 1px solid black; font-weight: bold; text-align: center;">THỨ NGÀY</th>
              <th scope="col" style="width: 50%; border: 1px solid black; font-weight: bold; text-align: center;">NỘI DUNG CÔNG VIỆC</th>
              <th scope="col" style="width: 15%; border: 1px solid black; font-weight: bold; text-align: center;">NGƯỜI THỰC HIỆN</th>
              <th scope="col" style="width: 20%; border: 1px solid black; font-weight: bold; text-align: center;">GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Populate week rows
    exportDates.forEach((dateStr) => {
      const dayPlans = personalPlans.filter(p => p.date === dateStr);
      
      const executorGroups: Array<{
        executorId: string;
        isAllTeam: boolean;
        name: string;
        plans: any[];
      }> = [];

      // 1. Group "Toàn đội" first
      const allTeamPlans = dayPlans.filter(p => !p.officerId);
      if (allTeamPlans.length > 0) {
        executorGroups.push({
          executorId: '',
          isAllTeam: true,
          name: 'Toàn đội',
          plans: allTeamPlans
        });
      }

      // 2. Individual officers in order of store.officers list
      officers.forEach(officer => {
        const officerPlans = dayPlans.filter(p => p.officerId === officer.id);
        if (officerPlans.length > 0) {
          executorGroups.push({
            executorId: officer.id,
            isAllTeam: false,
            name: `Đ/c ${getOfficerShortName(officer.fullName)}`,
            plans: officerPlans
          });
        }
      });

      // 3. Leftover plans (officerId not in store.officers)
      const groupedOfficerIds = executorGroups.map(g => g.executorId);
      const leftoverPlans = dayPlans.filter(p => p.officerId && !groupedOfficerIds.includes(p.officerId));
      if (leftoverPlans.length > 0) {
        const uniqueLeftoverIds: string[] = Array.from(new Set(leftoverPlans.map(p => (p.officerId || '') as string)));
        uniqueLeftoverIds.forEach(oid => {
          const oPlans = leftoverPlans.filter(p => p.officerId === oid);
          executorGroups.push({
            executorId: oid,
            isAllTeam: false,
            name: `Đ/c Cán bộ #${oid.slice(-3)}`,
            plans: oPlans
          });
        });
      }

      // 4. Default fallback if no plans at all
      if (executorGroups.length === 0) {
        executorGroups.push({
          executorId: '',
          isAllTeam: true,
          name: 'Toàn đội',
          plans: [
            {
              id: `DFT-${dateStr}-1`,
              title: 'Trực chiến đấu bảo đảm an toàn PCCC & CNCH địa bàn; Bảo quản, bảo dưỡng phương tiện thiết bị',
              officerId: '',
              location: '',
              description: '',
              status: 'Đã hoàn thành',
              resultReport: ''
            }
          ]
        });
      }

      const totalRowsForDay = executorGroups.length;
      const dateObjTemp = new Date(dateStr);
      const isSunday = dateObjTemp.getDay() === 0;
      const dayName = isSunday ? 'Chủ nhật' : `Thứ ${dateObjTemp.getDay() + 1}`;
      const dayDisplay = `<b>${dayName}</b><br/>${formatDateDMY(dateStr)}`;

      executorGroups.forEach((group, idx) => {
        htmlContent += '<tr>';

        // Column 1: Date (rowspanned)
        if (idx === 0) {
          htmlContent += `<td rowspan="${totalRowsForDay}" style="border: 1px solid black; text-align: center; vertical-align: middle; background-color: #fafafa; font-size: 11pt; padding: 10px 4px;">${dayDisplay}</td>`;
        }

        // Column 2: Content (bullet lists)
        let plansHtml = '';
        group.plans.forEach((plan, pIdx) => {
          let text = plan.title;
          if (plan.location) {
            text += ` tại ${plan.location}`;
          }
          if (plan.description) {
            // Append description if available
            text += ` (${plan.description})`;
          }
          plansHtml += `${pIdx > 0 ? '<br/>' : ''}- ${text}`;
        });

        htmlContent += `<td style="border: 1px solid black; text-align: left; padding: 8px 10px; font-size: 11pt; line-height: 1.4;">${plansHtml}</td>`;

        // Column 3: Executor
        const colorStyle = group.isAllTeam ? 'color: #ff0000; font-weight: bold;' : '';
        htmlContent += `<td style="border: 1px solid black; text-align: center; vertical-align: middle; padding: 8px 6px; font-size: 11pt; ${colorStyle}">${group.name}</td>`;

        // Column 4: GHI CHÚ
        htmlContent += `<td style="border: 1px solid black; text-align: center; vertical-align: middle; padding: 8px 6px; font-size: 11pt;"></td>`;

        htmlContent += '</tr>';
      });
    });

    htmlContent += `
          </tbody>
        </table>

        <table class="signature-table" style="width: 100%; border: none; margin-top: 40px; font-size: 11pt;">
          <tr>
            <td style="width: 50%; text-align: center; border: none; font-weight: bold; text-transform: uppercase;">
              CHI HUY ĐỘI<br/>
            </td>
            <td style="width: 50%; text-align: center; border: none; font-weight: bold; text-transform: uppercase;">
              CÁN BỘ LẬP<br/>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KeHoachCongTacTuan_${startDateStr.replace(/\//g, '-')}_${endDateStr.replace(/\//g, '-')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDateRangeExcel = () => {
    if (!exportRangeStart || !exportRangeEnd) {
      alert("Vui lòng nhập ngày chọn Từ và ngày chọn Đến.");
      return;
    }

    const start = new Date(exportRangeStart);
    const end = new Date(exportRangeEnd);

    if (start > end) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    const exportDates: string[] = [];
    const cur = new Date(start);
    let iterations = 0;
    while (cur <= end && iterations < 366) {
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      exportDates.push(`${yyyy}-${mm}-${dd}`);
      cur.setDate(cur.getDate() + 1);
      iterations++;
    }

    if (exportDates.length === 0) {
      alert("Không tìm thấy khoảng thời gian hợp lệ để xuất báo cáo.");
      return;
    }

    const startDateStr = formatDateDMY(exportDates[0]);
    const endDateStr = formatDateDMY(exportDates[exportDates.length - 1]);
    const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;

    // Officer short name formatting helper
    const getOfficerShortName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        const last = parts[parts.length - 1];
        const prev = parts[parts.length - 2];
        if (['hoàng', 'quốc', 'minh', 'đình', 'văn', 'thị', 'thành', 'hồng', 'đức', 'ngọc', 'trọng', 'thế', 'hoài', 'kim'].includes(prev.toLowerCase())) {
          return `${prev} ${last}`;
        }
        return last;
      }
      return fullName;
    };

    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        body { font-family: "Times New Roman", Times, serif; }
        .header-table { width: 100%; border: none; font-size: 11pt; margin-bottom: 20px; }
        .header-table td { border: none; padding: 2px; text-align: center; vertical-align: top; }
        .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
        .doc-subtitle { text-align: center; font-size: 11.5pt; font-weight: bold; font-style: italic; margin-bottom: 25px; }
        
        .main-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
        .main-table th { border: 1px solid #000000; padding: 10px 6px; font-weight: bold; text-align: center; background-color: #f2f2f2; text-transform: uppercase; }
        .main-table td { border: 1px solid #000000; padding: 8px 6px; vertical-align: middle; }
        
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .text-red { color: #ff0000; font-weight: bold; }
        .signature-table { width: 100%; border: none; font-size: 11pt; margin-top: 30px; }
        .signature-table td { border: none; padding: 5px; text-align: center; width: 50%; vertical-align: top; }
      </style>
      </head>
      <body>
        
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              PHÒNG CẢNH SÁT PCCC VÀ CNCH<br/>
              <span style="text-decoration: underline;">ĐỘI CHỮA CHÁY VÀ CNCH KV TÂN AN</span>
            </td>
            <td style="width: 55%; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
              <span style="text-decoration: underline;">Độc lập – Tự do – Hạnh phúc</span><br/>
              <span style="font-weight: normal; font-style: italic; font-size: 10pt;">${todayStrInVietnamese}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 25px; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              PHÊ DUYỆT CỦA LÃNH ĐẠO
            </td>
            <td></td>
          </tr>
        </table>

        <div class="doc-title" style="text-align: center; font-weight: bold; font-size: 14pt;">KẾ HOẠCH CÔNG TÁC</div>
        <div class="doc-subtitle" style="text-align: center; font-style: italic; font-size: 11pt; font-weight: bold; margin-bottom: 20px;">(Từ ngày ${startDateStr} đến ${endDateStr})</div>

        <table class="main-table" border="1" style="border-collapse: collapse; border: 1px solid black; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th scope="col" style="width: 15%; border: 1px solid black; font-weight: bold; text-align: center;">THỨ NGÀY</th>
              <th scope="col" style="width: 50%; border: 1px solid black; font-weight: bold; text-align: center;">NỘI DUNG CÔNG VIỆC</th>
              <th scope="col" style="width: 15%; border: 1px solid black; font-weight: bold; text-align: center;">NGƯỜI THỰC HIỆN</th>
              <th scope="col" style="width: 20%; border: 1px solid black; font-weight: bold; text-align: center;">GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
    `;

    exportDates.forEach((dateStr) => {
      const dayPlans = personalPlans.filter(p => p.date === dateStr);
      
      const executorGroups: Array<{
        executorId: string;
        isAllTeam: boolean;
        name: string;
        plans: any[];
      }> = [];

      // 1. Group "Toàn đội" first
      const allTeamPlans = dayPlans.filter(p => !p.officerId);
      if (allTeamPlans.length > 0) {
        executorGroups.push({
          executorId: '',
          isAllTeam: true,
          name: 'Toàn đội',
          plans: allTeamPlans
        });
      }

      // 2. Individual officers in order of store.officers list
      officers.forEach(officer => {
        const officerPlans = dayPlans.filter(p => p.officerId === officer.id);
        if (officerPlans.length > 0) {
          executorGroups.push({
            executorId: officer.id,
            isAllTeam: false,
            name: `Đ/c ${getOfficerShortName(officer.fullName)}`,
            plans: officerPlans
          });
        }
      });

      // 3. Leftover plans (officerId not in store.officers)
      const groupedOfficerIds = executorGroups.map(g => g.executorId);
      const leftoverPlans = dayPlans.filter(p => p.officerId && !groupedOfficerIds.includes(p.officerId));
      if (leftoverPlans.length > 0) {
        const uniqueLeftoverIds: string[] = Array.from(new Set(leftoverPlans.map(p => (p.officerId || '') as string)));
        uniqueLeftoverIds.forEach(oid => {
          const oPlans = leftoverPlans.filter(p => p.officerId === oid);
          executorGroups.push({
            executorId: oid,
            isAllTeam: false,
            name: `Đ/c Cán bộ #${oid.slice(-3)}`,
            plans: oPlans
          });
        });
      }

      // 4. Default fallback if no plans at all
      if (executorGroups.length === 0) {
        executorGroups.push({
          executorId: '',
          isAllTeam: true,
          name: 'Toàn đội',
          plans: [
            {
              id: `DFT-${dateStr}-1`,
              title: 'Trực chiến đấu bảo đảm an toàn PCCC & CNCH địa bàn; Bảo quản, bảo dưỡng phương tiện thiết bị',
              officerId: '',
              location: '',
              description: '',
              status: 'Đã hoàn thành',
              resultReport: ''
            }
          ]
        });
      }

      const totalRowsForDay = executorGroups.length;
      const dateObjTemp = new Date(dateStr);
      const isSunday = dateObjTemp.getDay() === 0;
      const dayName = isSunday ? 'Chủ nhật' : `Thứ ${dateObjTemp.getDay() + 1}`;
      const dayDisplay = `<b>${dayName}</b><br/>${formatDateDMY(dateStr)}`;

      executorGroups.forEach((group, idx) => {
        htmlContent += '<tr>';

        // Column 1: Date (rowspanned)
        if (idx === 0) {
          htmlContent += `<td rowspan="${totalRowsForDay}" style="border: 1px solid black; text-align: center; vertical-align: middle; background-color: #fafafa; font-size: 11pt; padding: 10px 4px;">${dayDisplay}</td>`;
        }

        // Column 2: Content (bullet lists)
        let plansHtml = '';
        group.plans.forEach((plan, pIdx) => {
          let text = plan.title;
          if (plan.location) {
            text += ` tại ${plan.location}`;
          }
          if (plan.description) {
            text += ` (${plan.description})`;
          }
          plansHtml += `${pIdx > 0 ? '<br/>' : ''}- ${text}`;
        });

        htmlContent += `<td style="border: 1px solid black; text-align: left; padding: 8px 10px; font-size: 11pt; line-height: 1.4;">${plansHtml}</td>`;

        // Column 3: Executor
        const colorStyle = group.isAllTeam ? 'color: #ff0000; font-weight: bold;' : '';
        htmlContent += `<td style="border: 1px solid black; text-align: center; vertical-align: middle; padding: 8px 6px; font-size: 11pt; ${colorStyle}">${group.name}</td>`;

        // Column 4: GHI CHÚ
        htmlContent += `<td style="border: 1px solid black; text-align: center; vertical-align: middle; padding: 8px 6px; font-size: 11pt;"></td>`;

        htmlContent += '</tr>';
      });
    });

    htmlContent += `
          </tbody>
        </table>

        <table class="signature-table" style="width: 100%; border: none; margin-top: 40px; font-size: 11pt;">
          <tr>
            <td style="width: 50%; text-align: center; border: none; font-weight: bold; text-transform: uppercase;">
              CHI HUY ĐỘI<br/>
            </td>
            <td style="width: 50%; text-align: center; border: none; font-weight: bold; text-transform: uppercase;">
              CÁN BỘ LẬP<br/>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KeHoachCongTac_${startDateStr.replace(/\//g, '-')}_${endDateStr.replace(/\//g, '-')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDailyExcel = () => {
    const targetDateStr = personalPlanSingleDateExport || '2026-06-15';
    const dayPlans = personalPlans.filter(p => p.date === targetDateStr);
    
    const hasPlans = dayPlans.length > 0;
    const displayPlans = hasPlans ? dayPlans : [
      {
        id: `DFT-${targetDateStr}-1`,
        title: 'Trực chiến đấu bảo đảm an toàn PCCC & CNCH địa bàn; Bảo quản, bảo dưỡng phương tiện thiết bị',
        officerId: '',
        location: '',
        description: 'Tình hình đơn vị an toàn, phương tiện sẵn sàng chiến đấu',
        status: 'Đã hoàn thành' as const,
        resultReport: 'Đã hoàn thành công tác trực ban, túc trực sẵn sàng chiến đấu 24/24h bảo đảm an toàn địa bàn quản lý. Phương tiện kỹ thuật, thiết bị chữa cháy và cứu nạn cứu hộ được bảo quản, bảo dưỡng vận hành tốt.'
      }
    ];

    const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;
    const formattedTargetDate = formatDateDMY(targetDateStr);

    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        body { font-family: "Times New Roman", Times, serif; }
        .header-table { width: 100%; border: none; font-size: 11pt; margin-bottom: 20px; }
        .header-table td { border: none; padding: 2px; text-align: center; vertical-align: top; }
        .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin-top: 15px; margin-bottom: 25px; text-transform: uppercase; }
        
        .main-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
        .main-table th { border: 1px solid #000000; padding: 10px 6px; font-weight: bold; text-align: center; background-color: #f2f2f2; text-transform: uppercase; }
        .main-table td { border: 1px solid #000000; padding: 8px 6px; vertical-align: middle; }
        
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .signature-table { width: 100%; border: none; font-size: 11pt; margin-top: 40px; }
        .signature-table td { border: none; padding: 5px; text-align: center; width: 50%; vertical-align: top; }
      </style>
      </head>
      <body>
        
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              PHÒNG CẢNH SÁT PCCC VÀ CNCH<br/>
              <span style="text-decoration: underline;">ĐỘI CHỮA CHÁY VÀ CNCH KV TÂN AN</span>
            </td>
            <td style="width: 55%; text-align: center; font-weight: bold; font-size: 11pt; line-height: 1.3;">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
              <span style="text-decoration: underline;">Độc lập – Tự do – Hạnh phúc</span><br/>
              <span style="font-weight: normal; font-style: italic; font-size: 10pt;">${todayStrInVietnamese}</span>
            </td>
          </tr>
        </table>

        <div class="doc-title" style="text-align: center; font-weight: bold; font-size: 14pt;">BÁO CÁO KẾT QUẢ THỰC HIỆN NGÀY ${formattedTargetDate}</div>

        <table class="main-table" border="1" style="border-collapse: collapse; border: 1px solid black; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th scope="col" style="width: 8%; border: 1px solid black; font-weight: bold; text-align: center; height: 35px;">STT</th>
              <th scope="col" style="width: 15%; border: 1px solid black; font-weight: bold; text-align: center;">Ngày</th>
              <th scope="col" style="width: 47%; border: 1px solid black; font-weight: bold; text-align: center;">Kết quả thực hiện</th>
              <th scope="col" style="width: 18%; border: 1px solid black; font-weight: bold; text-align: center;">Cán bộ</th>
              <th scope="col" style="width: 12%; border: 1px solid black; font-weight: bold; text-align: center;">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
    `;

    displayPlans.forEach((plan, idx) => {
      let officerNameHtml = 'Toàn đội';
      if (plan.officerId) {
        const assignedOff = officers.find(o => o.id === plan.officerId);
        if (assignedOff) {
          officerNameHtml = `${assignedOff.rank} ${assignedOff.fullName}`;
        }
      }

      // Lấy trực tiếp từ nội dung kết quả thực hiện
      const resultText = plan.resultReport || 'Đang triển khai thực hiện, đảm bảo tiến độ yêu cầu';

      const noteText = plan.description || '';

      htmlContent += `
        <tr>
          <td style="border: 1px solid black; text-align: center; height: 40px;">${idx + 1}</td>
          <td style="border: 1px solid black; text-align: center;">${formattedTargetDate}</td>
          <td style="border: 1px solid black; text-align: left; padding: 6px 10px; line-height: 1.4;">${resultText}</td>
          <td style="border: 1px solid black; text-align: center; ${officerNameHtml === 'Toàn đội' ? 'color: #ff0000; font-weight: bold;' : ''}">${officerNameHtml}</td>
          <td style="border: 1px solid black; text-align: left; padding: 6px; font-style: italic; font-size: 10pt;">${noteText}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>

        <table class="signature-table" style="width: 100%; border: none; margin-top: 40px; font-size: 11pt;">
          <tr>
            <td style="width: 50%; text-align: center; border: none; font-weight: bold; text-transform: uppercase;">
              KT. ĐỘI TRƯỞNG<br/>
              PHÓ ĐỘI TRƯỞNG<br/><br/><br/><br/><br/>
              Thiếu tá Hồ Trung Kiên
            </td>
            <td style="width: 50%; text-align: center; border: none; font-weight: bold; text-transform: uppercase;">
              CÁN BỘ LẬP<br/><br/><br/><br/><br/><br/>
              Đại úy Cao Văn Hiền
            </td>
          </tr>
        </table>

      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCaoKetQuaNgay_${targetDateStr.replace(/\//g, '-')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCyclePersonalPlanStatus = (id: string) => {
    setPersonalPlans(prev => prev.map(p => {
      if (p.id === id) {
        let nextStatus: PersonalPlan['status'] = 'Chưa thực hiện';
        if (p.status === 'Chưa thực hiện') nextStatus = 'Đang thực hiện';
        else if (p.status === 'Đang thực hiện') nextStatus = 'Đã hoàn thành';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleSaveInlineResultReport = (id: string, text: string) => {
    setPersonalPlans(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          resultReport: text,
          status: text.trim() ? 'Đã hoàn thành' : p.status
        };
      }
      return p;
    }));
    setReportingPlanId(null);
    setTempResultReport('');
  };

  // Filter lists
  const filteredPersonalPlans = personalPlans.filter(p => {
    const matchedOfficer = officers.find(o => o.id === p.officerId);
    const officerName = matchedOfficer ? matchedOfficer.fullName : '';
    const matchesSearch = p.title.toLowerCase().includes(personalPlanSearch.toLowerCase()) ||
                          p.location.toLowerCase().includes(personalPlanSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(personalPlanSearch.toLowerCase()) ||
                          officerName.toLowerCase().includes(personalPlanSearch.toLowerCase());
    
    const matchesStartDate = !personalPlanStartDateFilter || p.date >= personalPlanStartDateFilter;
    const matchesEndDate = !personalPlanEndDateFilter || p.date <= personalPlanEndDateFilter;
    const matchesDate = matchesStartDate && matchesEndDate;
    const matchesOfficer = !personalPlanOfficerFilter || p.officerId === personalPlanOfficerFilter;
    const matchesStatus = personalPlanStatusFilter === 'All' || p.status === personalPlanStatusFilter;
    
    return matchesSearch && matchesDate && matchesOfficer && matchesStatus;
  });

  // Filter lists
  const filteredWorkPlans = workPlans.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(planSearch.toLowerCase()) || 
                          p.planNumber.toLowerCase().includes(planSearch.toLowerCase()) ||
                          p.target.toLowerCase().includes(planSearch.toLowerCase());
    const matchesStatus = planStatusFilter === 'All' || p.status === planStatusFilter;
    return matchesSearch && matchesStatus;
  });



  return (
    <div className="space-y-6" id="reports-module">
      {/* Visual Navigation Banner - Top Title banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-red-650" />
            Kế hoạch - Báo cáo
          </h2>
          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>

        {/* Tab selection for Kế hoạch & Báo cáo & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          {/* Auto update status indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[10.5px] font-bold shadow-3xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Tự động cập nhật: BẬT</span>
          </div>

          <button
            id="manual-sync-btn"
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer ${isSyncing ? 'opacity-85 pointer-events-none' : ''}`}
            title="Nhấn để chủ động cập nhật lưu trữ và kiểm tra đồng bộ dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'ĐANG LƯU DỮ LIỆU...' : 'CẬP NHẬT & LƯU'}
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200" id="report-subtab-container">
            <button
              id="report-subtab-plans-btn"
              onClick={() => setSubTab('plans')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === 'plans' 
                  ? 'bg-red-650 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Kế hoạch
            </button>

            <button
              id="report-subtab-kpi-class-btn"
              onClick={() => setSubTab('kpi-class')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === 'kpi-class' 
                  ? 'bg-red-650 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Phân loại theo KPI
            </button>
          </div>
        </div>
      </div>

      {subTab === 'plans' && (
        <div className="space-y-6">
          {/* VIEWPORT 1.5: Kế hoạch cá nhân theo ngày */}
          <div className="space-y-4" id="personal-plans-viewport">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">Kế hoạch cá nhân theo ngày</h3>
          </div>
          <span className="text-slate-400 font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded no-print">
            Cập nhật thường nhật
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / center column: Filter panel & List cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters panel */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-wrap gap-3 items-center justify-between no-print">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="personal-plan-search-input"
                    type="text"
                    placeholder="Tìm tiêu đề, địa điểm..."
                    value={personalPlanSearch}
                    onChange={(e) => setPersonalPlanSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Start Date filter */}
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-[10px] font-bold text-slate-400 pointer-events-none">Từ:</span>
                  <input
                    id="personal-plan-start-date-filter"
                    type="date"
                    value={personalPlanStartDateFilter}
                    onChange={(e) => setPersonalPlanStartDateFilter(e.target.value)}
                    className="w-full pl-8 pr-1 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-semibold"
                  />
                </div>

                {/* End Date filter */}
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-[10px] font-bold text-slate-400 pointer-events-none">Đến:</span>
                  <input
                    id="personal-plan-end-date-filter"
                    type="date"
                    value={personalPlanEndDateFilter}
                    onChange={(e) => setPersonalPlanEndDateFilter(e.target.value)}
                    className="w-full pl-8 pr-1 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-semibold"
                  />
                </div>

                {/* Officer select filter */}
                <select
                  id="personal-plan-officer-filter"
                  value={personalPlanOfficerFilter}
                  onChange={(e) => setPersonalPlanOfficerFilter(e.target.value)}
                  className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-semibold"
                >
                  <option value="">Tất cả cán bộ</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.rank} {o.fullName}
                    </option>
                  ))}
                </select>

                {/* Status select filter */}
                <select
                  id="personal-plan-status-filter"
                  value={personalPlanStatusFilter}
                  onChange={(e) => setPersonalPlanStatusFilter(e.target.value)}
                  className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-semibold"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="Chưa thực hiện">Chưa thực hiện</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                </select>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {(personalPlanSearch || personalPlanStartDateFilter || personalPlanEndDateFilter || personalPlanOfficerFilter || personalPlanStatusFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setPersonalPlanSearch('');
                      setPersonalPlanStartDateFilter('');
                      setPersonalPlanEndDateFilter('');
                      setPersonalPlanOfficerFilter('');
                      setPersonalPlanStatusFilter('All');
                    }}
                    className="px-2 py-1.5 hover:bg-slate-100 text-slate-500 rounded border hover:text-red-600 text-xs font-bold transition-all"
                  >
                    Xóa lọc
                  </button>
                )}
                
                {/* Single Date Export Selector cell */}
                <div className="flex items-center gap-1 bg-emerald-50/50 border border-emerald-100 rounded-lg p-1 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-800 px-1 uppercase tracking-wider">Ngày xuất:</span>
                  <input
                    id="personal-plan-single-date-export-input"
                    type="date"
                    value={personalPlanSingleDateExport}
                    onChange={(e) => setPersonalPlanSingleDateExport(e.target.value)}
                    className="p-1 text-xs border border-emerald-200 rounded-md bg-white font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    id="export-daily-excel-btn"
                    onClick={handleExportDailyExcel}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider shadow-xs"
                    title="Xuất file Excel báo cáo kết quả thực hiện của ngày đã chọn"
                  >
                    <FileDown className="w-3 h-3" /> Xuất báo cáo ngày
                  </button>
                </div>

                <button
                  id="export-weekly-excel-btn"
                  onClick={handleExportWeeklyExcel}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap transition-all uppercase tracking-wider"
                  title="Xuất kế hoạch công tác theo khoảng thời gian lọc"
                >
                  <FileDown className="w-3.5 h-3.5" /> Xuất kế hoạch tuần
                </button>

                {/* Date Range Export Selector cell */}
                <div className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-100 rounded-lg p-1 shadow-xs">
                  <span className="text-[10px] font-bold text-blue-800 px-1 uppercase tracking-wider">Từ ngày:</span>
                  <input
                    id="export-range-start-input"
                    type="date"
                    value={exportRangeStart}
                    onChange={(e) => setExportRangeStart(e.target.value)}
                    className="p-1 text-xs border border-blue-200 rounded-md bg-white font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] font-bold text-blue-800 px-1 uppercase tracking-wider">Đến:</span>
                  <input
                    id="export-range-end-input"
                    type="date"
                    value={exportRangeEnd}
                    onChange={(e) => setExportRangeEnd(e.target.value)}
                    className="p-1 text-xs border border-blue-200 rounded-md bg-white font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    id="export-date-range-excel-btn"
                    onClick={handleExportDateRangeExcel}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider shadow-xs"
                    title="Xuất kế hoạch công tác từ ngày đến ngày"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Xuất kế hoạch từ ngày đến ngày
                  </button>
                </div>

              </div>
            </div>

            {/* List block */}
            <div className="space-y-3">
              {filteredPersonalPlans.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 py-16 text-xs">
                  Không tìm thấy kế hoạch cá nhân nào khớp với tiêu chí lọc của ban trực.
                </div>
              ) : (
                filteredPersonalPlans.map(p => {
                  const assignedOff = officers.find(o => o.id === p.officerId);
                  return (
                    <div
                      key={p.id}
                      className={`bg-white p-4 rounded-xl border hover:shadow-xs transition-all border-slate-100 ${
                        p.status === 'Đã hoàn thành' ? 'bg-emerald-50/10' :
                        p.status === 'Đang thực hiện' ? 'bg-blue-50/10 border-blue-105' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-50 pb-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              📅 {formatDateDMY(p.date)}
                            </span>
                            <span className="text-xs text-slate-650 font-bold flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              {assignedOff ? `${assignedOff.rank} ${assignedOff.fullName} (${assignedOff.unit})` : 'Chưa phân công'}
                            </span>
                          </div>
                          {/* Title element removed as requested */}
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-start">
                          <button
                            onClick={() => handleCyclePersonalPlanStatus(p.id)}
                            title="Click để chuyển nhanh trạng thái"
                            className="text-[10.5px] font-bold text-slate-500 hover:text-red-655 transition-colors cursor-pointer mr-1 bg-slate-100 px-2 py-0.5 rounded text-xs"
                          >
                            Đôi trạng thái
                          </button>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase whitespace-nowrap shadow-3xs ${
                            p.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'Đang thực hiện' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-2">
                        {/* Plan & Location section */}
                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/40 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-red-650 block tracking-wide">
                            📋 Nội dung kế hoạch
                          </span>
                          <div className="font-extrabold text-slate-800 text-sm mt-0.5 mb-1.5 leading-snug bg-white/60 p-2 rounded border border-slate-100">
                            {p.title}
                          </div>
                          {p.location && (
                            <div className="flex items-start gap-1 font-sans text-xs">
                              <span className="text-slate-400 shrink-0 font-bold">📍 Vị trí:</span>
                              <span className="font-semibold text-slate-700">{p.location}</span>
                            </div>
                          )}
                          {p.description && (
                            <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-100 whitespace-pre-line italic">
                              {p.description}
                            </div>
                          )}
                        </div>

                        {/* Result Report block */}
                        <div className="space-y-1.5 text-xs bg-emerald-50/15 p-2.5 rounded-lg border border-emerald-100/60">
                          <div className="flex items-center justify-between border-b border-emerald-100/40 pb-1 mb-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                              🎯 Kết quả thực hiện nhiệm vụ
                            </span>
                            {p.resultReport ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/50 px-1.5 py-0.2 rounded-full">
                                Đã ghi nhận
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                                Chờ báo cáo kết quả
                              </span>
                            )}
                          </div>
                          
                          {p.resultReport ? (
                            <div className="text-[11px] text-slate-700 leading-relaxed bg-white p-2 rounded border border-emerald-100 whitespace-pre-line font-medium text-emerald-900 bg-emerald-50/50">
                              {p.resultReport}
                            </div>
                          ) : (
                            <p className="text-[10.5px] text-slate-400 italic bg-white p-2 rounded border border-dashed border-slate-200">
                              Chưa cập nhật kết quả công tác thường nhật. Nhấn nút "Báo cáo kết quả" bên dưới để bổ sung.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Inline reporting form */}
                      {reportingPlanId === p.id && (
                        <div className="mt-3 p-3 bg-red-50/20 rounded-lg border border-red-200/60 space-y-2 no-print">
                          <label className="block text-[11px] font-bold text-red-750 uppercase tracking-wide">
                            Ghi nhận tiến trình & Kết quả thực tế
                          </label>
                          <textarea
                            rows={3}
                            value={tempResultReport}
                            onChange={(e) => setTempResultReport(e.target.value)}
                            placeholder="Mô tả cụ thể kết quả công vụ đã gặt hái, số liệu kiểm tra, biên bản xử phạt hành chính (nếu có)..."
                            className="w-full p-2 border border-slate-200 rounded-md text-xs font-sans bg-white focus:ring-1 focus:ring-red-500"
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              onClick={() => handleSaveInlineResultReport(p.id, tempResultReport)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md cursor-pointer transition-colors text-[10.5px]"
                            >
                              Lưu kết quả
                            </button>
                            <button
                              onClick={() => {
                                setReportingPlanId(null);
                                setTempResultReport('');
                              }}
                              className="px-3 py-1 bg-slate-250 hover:bg-slate-300 text-slate-700 font-bold rounded-md cursor-pointer transition-colors text-[10.5px]"
                            >
                              Hủy bỏ
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-dashed border-slate-100 no-print">
                        <button
                          onClick={() => {
                            setReportingPlanId(p.id);
                            setTempResultReport(p.resultReport || '');
                          }}
                          className="px-2.5 py-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> Báo cáo kết quả
                        </button>
                        <button
                          onClick={() => handleOpenEditPersonalPlan(p)}
                          className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" /> Sửa
                        </button>
                        {personalPlanIdToDelete === p.id ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-[10px] text-red-700 font-bold">Xác nhận?</span>
                            <button
                              onClick={() => {
                                setPersonalPlans(personalPlans.filter(pPlan => pPlan.id !== p.id));
                                setPersonalPlanIdToDelete(null);
                              }}
                              className="px-2 py-0.5 bg-red-650 hover:bg-red-755 text-white rounded text-[10px] font-bold cursor-pointer transition-colors bg-red-600 hover:bg-red-700"
                            >
                              Có
                            </button>
                            <button
                              onClick={() => setPersonalPlanIdToDelete(null)}
                              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Không
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPersonalPlanIdToDelete(p.id)}
                            className="px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: Form Block */}
          <div className="lg:col-span-1">
            {isAddingPersonalPlan ? (
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4 no-print relative">
                <button
                  onClick={() => setIsAddingPersonalPlan(false)}
                  className="absolute right-3 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 border cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-red-600" />
                    {editingPersonalPlan ? 'Hiệu chỉnh kế hoạch cá nhân' : 'Phát thảo kế hoạch cá nhân'}
                  </h4>
                  <p className="text-slate-500 text-[11px]">Điều hành lịch bám công tác chi tiết của từng cán bộ trong ngày.</p>
                </div>

                <form onSubmit={handleSavePersonalPlanSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Cán bộ lập kế hoạch *
                    </label>
                    <select
                      value={personalPlanForm.officerId}
                      onChange={(e) => setPersonalPlanForm({ ...personalPlanForm, officerId: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                      required
                    >
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.rank} {o.fullName} ({o.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Ngày thực hiện *
                    </label>
                    <input
                      type="date"
                      value={personalPlanForm.date}
                      onChange={(e) => setPersonalPlanForm({ ...personalPlanForm, date: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Địa điểm công tác
                    </label>
                    <input
                      type="text"
                      placeholder="Địa chỉ cơ sở v.v."
                      value={personalPlanForm.location}
                      onChange={(e) => setPersonalPlanForm({ ...personalPlanForm, location: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Trạng thái hiện trạng
                    </label>
                    <select
                      value={personalPlanForm.status}
                      onChange={(e) => setPersonalPlanForm({ ...personalPlanForm, status: e.target.value as PersonalPlan['status'] })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Chưa thực hiện">Chưa thực hiện</option>
                      <option value="Đang thực hiện">Đang thực hiện</option>
                      <option value="Đã hoàn thành">Đã hoàn thành</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Nội dung chi tiết & Ghi chú
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Phân tích nội dung kiểm tra, chỉ đạo chuẩn..."
                      value={personalPlanForm.description}
                      onChange={(e) => setPersonalPlanForm({ ...personalPlanForm, description: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Báo cáo kết quả (Cán bộ chiến sĩ lập)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả kết quả công vụ thực tế đã gặt hái được..."
                      value={personalPlanForm.resultReport}
                      onChange={(e) => setPersonalPlanForm({ ...personalPlanForm, resultReport: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-sans bg-emerald-50/10 focus:ring-1 focus:ring-emerald-505"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 text-white bg-red-650 hover:bg-red-755 font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs bg-red-600 hover:bg-red-700"
                    >
                      <Save className="w-3.5 h-3.5" /> Lưu kế hoạch
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingPersonalPlan(false)}
                      className="px-3 py-2 border hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50/50 p-5 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 py-12 text-xs space-y-4 shadow-3xs">
                <Calendar className="w-8 h-8 text-slate-350 mx-auto" />
                <div>
                  <h4 className="font-black text-slate-700 mb-1">Quản lý lịch bám ca linh hoạt</h4>
                  <p className="text-slate-450 leading-relaxed text-[11px]">
                    Hệ thống ghi nhận tức thời kế hoạch công vụ chi tiết của từng chiến sĩ. Bạn có thể thêm, sửa, đổi trạng thái thực hiện trực tiếp để giữ dữ liệu hành chính chuẩn xác nhất.
                  </p>
                </div>
                <button
                  id="add-personal-plan-start-btn"
                  onClick={() => setIsAddingPersonalPlan(true)}
                  className="px-3 py-1.5 bg-[#f40b0b] hover:bg-[#d60a0a] text-white rounded-lg text-[11.5px] font-extrabold shadow-3xs inline-flex items-center gap-1 cursor-pointer transition-all border border-transparent"
                >
                  <Plus className="w-3 h-3 text-white" /> Tạo nhanh kế hoạch hành sự
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      )}

      {subTab === 'kpi-class' && (
        <div className="space-y-6 pt-6 border-t border-slate-100" id="kpi-classification-viewport">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-150 pb-3 gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Award className="w-5 h-5 text-red-650" />
                Báo cáo đánh giá & Phân loại theo chỉ số KPI
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-sans">
                Theo Hướng dẫn số 20-HD/ĐUCA của Đảng ủy Công an Trung ương phục vụ phân nhóm và bình xét cán bộ chiến sĩ CAND.
              </p>
            </div>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1.5 bg-slate-100 text-[#1e293b] hover:bg-slate-200 text-xs font-bold rounded cursor-pointer border flex items-center gap-1 no-print shadow-3xs"
            >
              <Printer className="w-3.5 h-3.5 text-red-600" />
              In báo cáo tổng hợp
            </button>
          </div>

          {/* Group summary stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl shadow-3xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase tracking-wider font-extrabold block">NHÓM 1: ĐÁP ỨNG TỐT TRỞ LÊN</span>
                  <strong className="text-emerald-800 font-mono text-2xl">{officers.filter(o => (o.kpi || 0) >= 70).length} Cán bộ</strong>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded font-mono text-[10px] font-bold">KPI 70 - 100</span>
              </div>
              <p className="text-[10.5px] text-emerald-700 mt-2 font-medium">Hoàn thành tốt nhiệm vụ, bảo đảm các tiêu chuẩn đề xuất xuất sắc.</p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl shadow-3xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase tracking-wider font-extrabold block">NHÓM 2: ĐÁP ỨNG YÊU CẦU</span>
                  <strong className="text-amber-800 font-mono text-2xl">{officers.filter(o => (o.kpi || 0) >= 50 && (o.kpi || 0) < 70).length} Cán bộ</strong>
                </div>
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded font-mono text-[10px] font-bold">KPI 50 - 69</span>
              </div>
              <p className="text-[10.5px] text-amber-700 mt-2 font-medium">Đạt điều kiện hoàn thành công tác cần tiếp tục nỗ lực.</p>
            </div>

            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl shadow-3xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase tracking-wider font-extrabold block">NHÓM 3: CHƯA ĐÁP ỨNG</span>
                  <strong className="text-red-800 font-mono text-2xl">{officers.filter(o => (o.kpi || 0) < 50).length} Cán bộ</strong>
                </div>
                <span className="px-2 py-0.5 bg-red-500 text-white rounded font-mono text-[10px] font-bold">KPI &lt; 50</span>
              </div>
              <p className="text-[10.5px] text-red-700 mt-2 font-medium">Cần bồi dưỡng nghiệp vụ chuyên sâu, đôn đốc chấn chỉnh kỷ cương.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Interactive lists of officers with KPI classification */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">QUÂN SỐ ĐƠN VỊ & CHỈ SỐ KPI</h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {officers.map(off => {
                  const kpiVal = off.kpi || 0;
                  const isExcellent = kpiVal >= 70;
                  const isAverage = kpiVal >= 50 && kpiVal < 70;
                  
                  let groupLabel = 'Nhóm 3 (Chưa đạt)';
                  let groupColor = 'bg-red-50 border-red-200 text-red-750';
                  if (isExcellent) {
                    groupLabel = 'Nhóm 1 (Tốt trở lên)';
                    groupColor = 'bg-emerald-50 border-emerald-250 text-emerald-800';
                  } else if (isAverage) {
                    groupLabel = 'Nhóm 2 (Đạt yêu cầu)';
                    groupColor = 'bg-amber-50 border-amber-250 text-amber-800';
                  }

                  const matchesSelected = selectedKpiOfficerId === off.id;

                  return (
                    <div
                      key={off.id}
                      onClick={() => {
                        setSelectedKpiOfficerId(off.id);
                        setIsAddingKpiRow(false);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-all ${
                        matchesSelected ? 'border-red-500 ring-2 ring-red-500/10 bg-red-50/5' : 'border-slate-150 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <strong className="text-sm font-extrabold text-slate-800 tracking-tight">{off.fullName}</strong>
                          <span className="text-[11px] text-slate-500 dev-details block mt-0.5">{off.rank} • {off.position}</span>
                          <span className="text-[11px] text-slate-400 block">{off.unit}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black font-mono text-red-650 block">{kpiVal}%</span>
                          <span className="text-[10px] text-slate-400 font-medium block">Hệ số KPI</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50">
                        <span className={`px-2 py-0.5 border text-[9.5px] font-bold rounded uppercase ${groupColor}`}>
                          {groupLabel}
                        </span>
                        <span className="text-blue-600 hover:text-blue-700 text-[11px] font-extrabold flex items-center gap-0.5">
                          Chi tiết đánh giá &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Dynamic evaluated spreadsheet representing page 16 sample */}
            <div className="lg:col-span-2">
              {selectedKpiOfficerId ? (
                (() => {
                  const targetOfficer = officers.find(o => o.id === selectedKpiOfficerId);
                  if (!targetOfficer) return null;

                  const tasksList = getKpiTasksForOfficer(targetOfficer.id);

                  // Calculate exact parameters
                  let totalAssignedScore = 0;
                  let totalQuantityScore = 0;
                  let totalQualityScore = 0;
                  let totalSpeedScore = 0;

                  tasksList.forEach(task => {
                    const rowAssigned = task.assignedQty * task.scorePerProduct;
                    const rowCompleted = task.completedQty * task.scorePerProduct;
                    const rowQuality = rowCompleted * task.qualityFactor;
                    const rowSpeed = rowCompleted * task.speedFactor;

                    totalAssignedScore += rowAssigned;
                    totalQuantityScore += rowCompleted;
                    totalQualityScore += rowQuality;
                    totalSpeedScore += rowSpeed;
                  });

                  // Coefficients
                  const A = totalAssignedScore > 0 ? (totalQuantityScore / totalAssignedScore) : 0;
                  const B = totalAssignedScore > 0 ? (totalQualityScore / totalAssignedScore) : 0;
                  const C = totalAssignedScore > 0 ? (totalSpeedScore / totalAssignedScore) : 0;

                  const computedKpiPercent = ((A + B + C) / 3) * 100;
                  const stableKpiRounded = parseFloat(computedKpiPercent.toFixed(2));

                  // Standard static score E out of 30 parsed stable from officer if needed, or editable kpiEValue
                  const totalEvaluationScore = kpiEValue + (stableKpiRounded * 0.7);

                  const isLeader = targetOfficer.position.includes('Đội trưởng') || targetOfficer.position.includes('Phó đội trưởng');
                  const formulaLabel = isLeader ? 'Công thức chỉ huy (H = E + KPI x 0,7)' : 'Công thức chiến sĩ (G = E + KPI x 0,7)';

                  return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 no-print" id="kpi-evaluation-details-sheet">
                      <div className="flex justify-between items-start border-b pb-3 leading-tight flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-red-650 uppercase">B. Chấm điểm chi tiết thực hiện nhiệm vụ</span>
                          <h3 className="font-extrabold text-sm text-slate-800 leading-snug uppercase mt-1">
                            BẢNG CHẤM ĐIỂM CHUYÊN MÔN: {targetOfficer.fullName}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm('Khôi phục danh mục nhiệm vụ đánh giá chuẩn theo mẫu Page 16 của Hướng dẫn?')) {
                                const updated = { ...officerKpiTasks };
                                delete updated[targetOfficer.id];
                                setOfficerKpiTasks(updated);
                                setOfficers(officers.map(o => o.id === targetOfficer.id ? { ...o, kpi: 97.97 } : o));
                              }
                            }}
                            className="p-1 px-2.5 border hover:bg-slate-50 text-slate-600 rounded text-[11px] font-bold cursor-pointer"
                          >
                            Thiết lập lại mẫu chuẩn
                          </button>
                        </div>
                      </div>

                      {/* Spreadsheet view according to Page 16 PDF */}
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-[11px] text-slate-700 min-w-[700px] border-collapse bg-white">
                          <thead>
                            <tr className="bg-slate-100 text-[10px] text-slate-800 font-extrabold uppercase border-b border-slate-200">
                              <th className="p-2 text-center border-r w-8">STT</th>
                              <th className="p-2 border-r w-40">Nhiệm vụ công tác chuyên môn</th>
                              <th className="p-2 text-center border-r w-21">Sản phẩm</th>
                              <th className="p-2 text-center border-r w-14">Điểm sp</th>
                              <th className="p-2 text-center border-r w-12">Yêu cầu</th>
                              <th className="p-2 text-center border-r w-14 bg-blue-50/50">SL hoàn thành</th>
                              <th className="p-2 border-r bg-emerald-50/30">Chất lượng (Đánh giá)</th>
                              <th className="p-2 bg-amber-50/30">Tiến độ (Đánh giá)</th>
                              <th className="p-2 text-center w-8">Xóa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-semibold">
                            {tasksList.map((task, idx) => {
                              const rowAssigned = task.assignedQty * task.scorePerProduct;
                              const rowCompleted = task.completedQty * task.scorePerProduct;
                              
                              return (
                                <tr key={task.id} className="hover:bg-slate-50/30">
                                  <td className="p-2 text-center border-r font-mono text-slate-400">{idx + 1}</td>
                                  <td className="p-2 border-r leading-tight text-slate-800 font-extrabold">
                                    <input 
                                      type="text" 
                                      value={task.name} 
                                      onChange={(e) => {
                                        const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, name: e.target.value } : t);
                                        const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                        setOfficerKpiTasks(newTasksMap);
                                      }}
                                      className="w-full p-1 bg-transparent hover:bg-slate-100/70 focus:bg-white text-xs border border-transparent focus:border-slate-300 rounded font-normal leading-normal"
                                    />
                                  </td>
                                  <td className="p-2 text-center border-r">
                                    <select
                                      value={task.product}
                                      onChange={(e) => {
                                        const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, product: e.target.value } : t);
                                        const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                        setOfficerKpiTasks(newTasksMap);
                                      }}
                                      className="p-1 text-[11px] bg-transparent hover:bg-slate-100 rounded focus:bg-white"
                                    >
                                      <option value="Công văn">Công văn</option>
                                      <option value="Báo cáo">Báo cáo</option>
                                      <option value="Tờ trình">Tờ trình</option>
                                      <option value="Thông tư">Thông tư</option>
                                      <option value="Quyết định">Quyết định</option>
                                      <option value="Chỉ thị">Chỉ thị</option>
                                      <option value="Kế hoạch">Kế hoạch</option>
                                    </select>
                                  </td>
                                  <td className="p-2 text-center border-r">
                                    <input 
                                      type="number" 
                                      value={task.scorePerProduct} 
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, scorePerProduct: val } : t);
                                        const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                        setOfficerKpiTasks(newTasksMap);
                                      }}
                                      className="w-12 p-1 text-center bg-transparent border border-transparent focus:border-slate-300 rounded hover:bg-slate-100/70 text-right font-mono"
                                    />
                                  </td>
                                  <td className="p-2 text-center border-r font-mono">
                                    <input 
                                      type="number" 
                                      value={task.assignedQty} 
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, assignedQty: val } : t);
                                        const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                        setOfficerKpiTasks(newTasksMap);
                                      }}
                                      className="w-10 p-1 text-center bg-transparent border border-transparent focus:border-slate-300 rounded hover:bg-slate-100/70 text-right font-mono"
                                    />
                                  </td>
                                  <td className="p-2 text-center border-r font-mono bg-blue-50/20">
                                    <input 
                                      type="number" 
                                      value={task.completedQty} 
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, completedQty: val } : t);
                                        const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                        setOfficerKpiTasks(newTasksMap);
                                      }}
                                      className="w-10 p-1 text-center bg-transparent border border-transparent focus:border-slate-300 rounded hover:bg-slate-100/70 text-right font-mono text-blue-700 font-bold"
                                    />
                                  </td>
                                  <td className="p-2 border-r bg-emerald-50/10">
                                    <div className="flex flex-col gap-1">
                                      <select
                                        value={task.qualityFactor}
                                        onChange={(e) => {
                                          const factor = parseFloat(e.target.value);
                                          const note = factor === 1.1 ? 'Đảm bảo vượt mức' :
                                                       factor === 1.0 ? 'Đảm bảo' :
                                                       factor === 0.75 ? 'Chỉnh sửa 1 lần' :
                                                       factor === 0.5 ? 'Thiếu sót nhẹ' : 'Không đạt';
                                          const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, qualityFactor: factor, qualityNote: note } : t);
                                          const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                          setOfficerKpiTasks(newTasksMap);
                                        }}
                                        className="p-0.5 text-[10px] bg-slate-100 text-slate-800 rounded font-semibold border-none max-w-[130px]"
                                      >
                                        <option value="1.1">🌟 Vượt mức (110%)</option>
                                        <option value="1.0">✅ Đảm bảo (100%)</option>
                                        <option value="0.75">⚠️ Chỉnh sửa 1 lần (75%)</option>
                                        <option value="0.5">❌ Thiếu sót nhẹ (50%)</option>
                                        <option value="0.0">🛑 Không đạt (0%)</option>
                                      </select>
                                      <span className="text-[10px] text-emerald-700 italic block mt-0.5 font-medium">
                                        Điểm: {rowCompleted * task.qualityFactor} / {rowAssigned}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-2 bg-amber-50/10">
                                    <div className="flex flex-col gap-1">
                                      <select
                                        value={task.speedFactor}
                                        onChange={(e) => {
                                          const factor = parseFloat(e.target.value);
                                          const note = factor === 1.2 ? 'Vượt tiến độ' :
                                                       factor === 1.0 ? 'Đảm bảo' :
                                                       factor === 0.75 ? 'Nhắc nhở 1 lần' :
                                                       factor === 0.5 ? 'Nhắc nhở 2 lần' : 'Quá hạn trễ';
                                          const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, speedFactor: factor, speedNote: note } : t);
                                          const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                          setOfficerKpiTasks(newTasksMap);
                                        }}
                                        className="p-0.5 text-[10px] bg-slate-100 text-slate-800 rounded font-semibold border-none max-w-[130px]"
                                      >
                                        <option value="1.2">⚡ Vượt tiến độ (120%)</option>
                                        <option value="1.0">✅ Đúng hạn (100%)</option>
                                        <option value="0.75">⚠️ Nhắc nhở 1 lần (75%)</option>
                                        <option value="0.5">⚠️ Nhắc nhở 2 lần (50%)</option>
                                        <option value="0.0">🛑 Trễ hạn hoàn toàn (0%)</option>
                                      </select>
                                      <span className="text-[10px] text-amber-700 italic block mt-0.5 font-medium">
                                        Điểm: {rowCompleted * task.speedFactor} / {rowAssigned}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (tasksList.length <= 1) {
                                          alert('Phải có ít nhất một nhiệm vụ để chấm điểm.');
                                          return;
                                        }
                                        const updatedTasks = tasksList.filter(t => t.id !== task.id);
                                        const newTasksMap = { ...officerKpiTasks, [targetOfficer.id]: updatedTasks };
                                        setOfficerKpiTasks(newTasksMap);
                                      }}
                                      className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Aggregates Row */}
                            <tr className="bg-slate-50 font-black text-slate-800 text-[11px] border-t border-slate-300">
                              <td colSpan={3} className="p-3 text-right">TỔNG CỘNG:</td>
                              <td colSpan={2} className="p-3 text-center font-mono">Điểm giao: {totalAssignedScore}</td>
                              <td className="p-3 text-center font-mono bg-blue-50/50">Hoàn thành: {totalQuantityScore}</td>
                              <td className="p-3 bg-emerald-50/30 font-mono">Đạt chất lượng: {totalQualityScore}</td>
                              <td className="p-3 bg-amber-50/30 font-mono" colSpan={2}>Đạt tiến độ: {totalSpeedScore}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Add Custom evaluated Task inline trigger button */}
                      {isAddingKpiRow ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2 space-y-3 font-sans">
                          <h4 className="font-bold text-slate-800 text-xs uppercase text-red-650">Thêm nhiệm vụ chấm điểm mới</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-slate-600 text-[10px] font-bold mb-1">Tên nhiệm vụ công tác chuyên môn</label>
                              <input 
                                type="text"
                                value={newKpiRowForm.name}
                                onChange={(e) => setNewKpiRowForm({ ...newKpiRowForm, name: e.target.value })}
                                placeholder="Nhập tên nhiệm vụ cụ thể..."
                                className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-slate-850 font-normal"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-600 text-[10px] font-bold mb-1">Sản phẩm công việc</label>
                              <select
                                value={newKpiRowForm.product}
                                onChange={(e) => setNewKpiRowForm({ ...newKpiRowForm, product: e.target.value })}
                                className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-slate-850 font-semibold"
                              >
                                <option value="Công văn">Công văn</option>
                                <option value="Báo cáo">Báo cáo</option>
                                <option value="Tờ trình">Tờ trình</option>
                                <option value="Thông tư">Thông tư</option>
                                <option value="Quyết định">Quyết định</option>
                                <option value="Chỉ thị">Chỉ thị</option>
                                <option value="Kế hoạch">Kế hoạch</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-slate-600 text-[10px] font-bold mb-1">Điểm một sản phẩm</label>
                              <input 
                                type="number"
                                value={newKpiRowForm.scorePerProduct}
                                onChange={(e) => setNewKpiRowForm({ ...newKpiRowForm, scorePerProduct: parseInt(e.target.value) || 10 })}
                                className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-slate-850 font-mono font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-600 text-[10px] font-bold mb-1">Tổng SL được giao</label>
                              <input 
                                type="number"
                                value={newKpiRowForm.assignedQty}
                                onChange={(e) => setNewKpiRowForm({ ...newKpiRowForm, assignedQty: parseInt(e.target.value) || 1 })}
                                className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-slate-850 font-mono font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-600 text-[10px] font-bold mb-1">SL hoàn thành thực tế</label>
                              <input 
                                type="number"
                                value={newKpiRowForm.completedQty}
                                onChange={(e) => setNewKpiRowForm({ ...newKpiRowForm, completedQty: parseInt(e.target.value) || 1 })}
                                className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-slate-850 font-mono font-semibold"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newKpiRowForm.name.trim()) {
                                    alert('Vui lòng điền nội dung nhiệm vụ!');
                                    return;
                                  }
                                  const newRow: EvaluatedKpiTask = {
                                    id: `TASK-${Date.now()}`,
                                    ...newKpiRowForm
                                  };
                                  const updatedTasks = [...tasksList, newRow];
                                  setOfficerKpiTasks({ ...officerKpiTasks, [targetOfficer.id]: updatedTasks });
                                  setIsAddingKpiRow(false);
                                  setNewKpiRowForm({
                                    name: '',
                                    product: 'Công văn',
                                    scorePerProduct: 10,
                                    assignedQty: 1,
                                    completedQty: 1,
                                    qualityFactor: 1.0,
                                    speedFactor: 1.0,
                                    qualityNote: 'Đảm bảo',
                                    speedNote: 'Đảm bảo'
                                  });
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-3xs"
                              >
                                Thêm hàng
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAddingKpiRow(false)}
                                className="px-3 py-1.5 bg-slate-205 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold cursor-pointer"
                              >
                                Đóng
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingKpiRow(true)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-250 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer mt-1"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" /> soạn thêm dòng nhiệm vụ đánh giá bổ sung
                        </button>
                      )}

                      {/* Calculations Panel matching exactly the formulas outlined on Page 7-8 of the guidance PDF */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 font-sans">
                        <h4 className="font-extrabold text-slate-800 text-[11.5px] uppercase tracking-wide border-b pb-1.5 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          Kết quả đo lường và tính điểm chi tiết
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11.5px]">
                          <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <strong>A. Chỉ số số lượng (A):</strong>
                            <div className="font-mono text-slate-800 text-sm font-extrabold mt-1">
                              {(A * 100).toFixed(2)}% ({A.toFixed(3)})
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{totalQuantityScore} / {totalAssignedScore} Điểm</span>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <strong>B. Chỉ số chất lượng (B):</strong>
                            <div className="font-mono text-slate-800 text-sm font-extrabold mt-1">
                              {(B * 100).toFixed(2)}% ({B.toFixed(3)})
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{totalQualityScore.toFixed(1)} / {totalAssignedScore} Điểm</span>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <strong>C. Chỉ số hoàn thành tiến độ (C):</strong>
                            <div className="font-mono text-slate-800 text-sm font-extrabold mt-1">
                              {(C * 100).toFixed(2)}% ({C.toFixed(3)})
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{totalSpeedScore} / {totalAssignedScore} Điểm</span>
                          </div>
                        </div>

                        {/* Interactive E Value input (Page 8 E indicator) */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-sans gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">Điểm tiêu chí chung (E) [Tối đa 30]:</span>
                            <input 
                              type="number"
                              min={0}
                              max={30}
                              value={kpiEValue}
                              onChange={(e) => {
                                const val = Math.min(30, Math.max(0, parseInt(e.target.value) || 0));
                                setKpiEValue(val);
                              }}
                              className="w-12 p-1 border border-slate-300 rounded font-mono text-center text-slate-850 font-bold focus:ring-2 focus:ring-red-500/10"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono italic">*{formulaLabel}</span>
                        </div>

                        {/* Total Score output matching slide 8 formulas exactly */}
                        <div className="bg-red-50/50 p-4 rounded-lg border border-red-105 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5">
                          <div>
                            <span className="text-slate-500 text-[10.5px] uppercase tracking-wider font-extrabold block">TỔNG ĐIỂM CHUNG TÍNH KPI</span>
                            <strong className="text-slate-805 text-sm block mt-1 font-extrabold">
                              KPI = (A + B + C) / 3 = ({A.toFixed(2)} + {B.toFixed(2)} + {C.toFixed(2)}) / 3 = <span className="text-red-650 font-mono">{stableKpiRounded}%</span>
                            </strong>
                            <span className="text-[11px] text-slate-650 block mt-1">
                              Điểm đánh giá xếp loại cuối: E + (KPI x 0,7) = <span className="font-mono font-bold text-slate-800">{kpiEValue} + ({stableKpiRounded} x 0,7) = {totalEvaluationScore.toFixed(3)} Điểm</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setOfficers(officers.map(o => o.id === targetOfficer.id ? { ...o, kpi: stableKpiRounded } : o));
                              setOfficerKpiTasks({ ...officerKpiTasks, [targetOfficer.id]: tasksList });
                              alert(`Lưu đánh giá thành công! Chỉ số KPI của Đ/c ${targetOfficer.fullName.split(' ').pop()} đã được cập nhật thành ${stableKpiRounded}%`);
                            }}
                            className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                          >
                            <Save className="w-4 h-4" />
                            Ghi kết quả lưu trữ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-205 text-center text-slate-400 py-32 text-xs shadow-xs no-print flex flex-col justify-center items-center">
                  <Award className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="font-extrabold text-slate-800 text-sm uppercase">Bảng chấm điểm KPI Chi tiết</p>
                  <p className="text-slate-500 text-[11px] mt-1 max-w-sm">
                    Hãy bấm chọn từng cán bộ chiến sĩ ở danh sách bên để chấm điểm chi tiết chuyên môn theo sản phẩm công tác mẫu của Hướng dẫn số 20-HD/ĐUCA.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEWPORT 3: Thống kê nghiệp vụ (Original charts & tables logic) */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">Thống kê & Biểu đồ</h3>
        </div>
        <div className="space-y-6" id="reports-statistics-summary">
          {/* Statistics summary metric grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 card-print shadow-xs">
              <div className="p-3 rounded-lg bg-red-50 text-red-650">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wider font-extrabold block">Công tác kiểm tra</span>
                <strong className="text-slate-800 font-mono text-xl">{activeInspections} cuộc</strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 card-print shadow-xs">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wider font-extrabold block">KPI quân binh trung vị</span>
                <strong className="text-slate-800 font-mono text-xl">88.5% Điểm tốt</strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 card-print shadow-xs">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-405 text-xs uppercase tracking-wider font-extrabold block">Khắc phục xong đề xuất</span>
                <strong className="text-slate-800 font-mono text-xl">{successRate}% Chỉ tiêu</strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 card-print shadow-xs">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-405 text-xs uppercase tracking-wider font-extrabold block">Công việc tồn đọng</span>
                <strong className="text-slate-800 font-mono text-xl text-red-600">{overduedTasks} Việc trễ hạn</strong>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-105 rounded-xl shadow-xs overflow-hidden">
            {/* Sub-navigation of stats list */}
            <div className="bg-slate-50 border-b border-slate-105 p-3 flex gap-2 no-print overflow-x-auto text-xs">
              <button
                id="rep-tab-kpi"
                onClick={() => setReportType('kpi')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-slate-100 ${reportType === 'kpi' ? 'bg-white text-red-650 border border-slate-200 shadow-sm' : 'text-slate-500'}`}
              >
                Thống kê Hiệu suất (KPI)
              </button>
              <button
                id="rep-tab-facilities"
                onClick={() => setReportType('facilities')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-slate-100 ${reportType === 'facilities' ? 'bg-white text-red-650 border border-slate-200 shadow-sm' : 'text-slate-500'}`}
              >
                Thống kê Cơ sở & Kiểm tra
              </button>
              <button
                id="rep-tab-rescue"
                onClick={() => setReportType('rescue')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-slate-100 ${reportType === 'rescue' ? 'bg-white text-red-650 border border-slate-200 shadow-sm' : 'text-slate-500'}`}
              >
                Thống kê Thiết bị & Phương án
              </button>
              <button
                id="rep-tab-documents"
                onClick={() => setReportType('documents')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-slate-100 ${reportType === 'documents' ? 'bg-white text-red-650 border border-slate-200 shadow-sm' : 'text-slate-500'}`}
              >
                Thống kê Văn thư Đến/Đi
              </button>
            </div>

            <div className="p-6 space-y-6 flex flex-col justify-start text-xs">
              {reportType === 'kpi' && (
                <div className="space-y-6" id="report-kpi-subpanel">
                  <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                        Xếp hạng KPI chỉ số năng lực của Cán bô, Chiến Sĩ PCCC 2026
                      </h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">Biểu đồ tổng hòa điểm KPI và số lượng đầu việc bám trực của từng quân số.</p>
                    </div>
                    <button
                      id="print-kpi-details"
                      onClick={handlePrint}
                      className="px-2.5 py-1 bg-slate-100 text-[#1e293b] text-xs font-bold hover:bg-slate-202 rounded no-print cursor-pointer border shadow-3xs"
                    >
                      In bảng hiệu suất
                    </button>
                  </div>

                  {/* Chart */}
                  <div className="h-64 pt-2 no-print">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={officerKpiData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                        <Bar dataKey="Điểm KPI" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Printable Table */}
                  <div className="overflow-hidden border border-slate-150 rounded" id="kpi-printable-table">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-[10px] text-slate-450 uppercase font-black tracking-wider border-b">
                        <tr>
                          <th className="p-3">Họ và Tên cán bộ</th>
                          <th className="p-3">Cấp bậc / Đơn vị</th>
                          <th className="p-3 text-center">Xử lý đầu việc</th>
                          <th className="p-3 text-right">Điểm KPI gặt hái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {officers.map(off => (
                          <tr key={off.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-extrabold text-slate-850">{off.fullName}</td>
                            <td className="p-3 text-slate-500">{off.rank} | {off.unit}</td>
                            <td className="p-3 text-center font-mono">{tasks.filter(t => t.assigneeId === off.id).length} việc</td>
                            <td className="p-3 text-right font-mono text-red-650 font-extrabold">{off.kpi}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'facilities' && (
                <div className="space-y-6" id="report-facilities-subpanel">
                  <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                        Phân phối mật độ Cơ Sở quản lý & Công tác Tuần tra
                      </h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">Biểu đồ tổng hòa phân vùng địa bàn và chất lượng kiểm tra của cán bộ.</p>
                    </div>
                    <button
                      id="export-fac-csv"
                      onClick={() => handleExportCSV('facilities')}
                      className="px-2.5 py-1 bg-slate-100 text-[#1e293b] text-xs font-bold rounded no-print hover:bg-slate-200 border cursor-pointer"
                    >
                      Xuất danh sách CSV
                    </button>
                  </div>

                  {/* Pie and stats logic side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-60 no-print">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={wardPieData}
                            cx="55%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {wardPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2.5 font-sans">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Phân tích theo Phường/Xã địa phương</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {wardPieData.map((w, idx) => (
                          <div key={idx} className="p-2 border border-slate-100 hover:border-slate-205 rounded bg-slate-50/35 flex justify-between items-center">
                            <div className="flex items-center gap-1.5 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className="text-slate-655 truncate text-[11px]">{w.name}</span>
                            </div>
                            <strong className="font-mono text-slate-800">{w.value} cơ sở</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Table list inspects print */}
                  <div className="border border-slate-150 rounded overflow-hidden" id="inspections-printable-table">
                    <table className="w-full text-left text-xs font-semibold text-slate-700">
                      <thead className="bg-slate-50 border-b uppercase text-[9.5px] font-black text-slate-450 tracking-wider font-sans">
                        <tr>
                          <th className="p-3">Cơ sở thụ kiểm</th>
                          <th className="p-3">Ngày kiểm tra</th>
                          <th className="p-3">Đoàn Đặc trách</th>
                          <th className="p-3 text-right">Biên bản kết luận</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {inspections.map(insp => {
                          const fac = facilities.find(f => f.id === insp.facilityId);
                          return (
                            <tr key={insp.id}>
                              <td className="p-3 font-extrabold text-slate-850">{fac ? fac.name : 'Vùng ngoài'}</td>
                              <td className="p-3 font-mono text-slate-500">{formatDateDMY(insp.date)}</td>
                              <td className="p-3 text-slate-600 truncate max-w-[150px]">{insp.inspectors.join(', ')}</td>
                              <td className="p-3 text-right font-sans">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  insp.result === 'Đạt yêu cầu' ? 'text-emerald-700 bg-emerald-50' : 'text-red-750 bg-red-50'
                                }`}>{insp.result}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'rescue' && (
                <div className="space-y-6" id="report-rescue-subpanel">
                  <div className="border-b pb-2">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                      Kiểm kê Khí đài trực chiến & Phủ phương án tác chiến khẩn cấp
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Thống kê phương tiện cơ giới bám ca trực và mức độ phủ diễn tập phương án dập lửa.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                    <div className="space-y-3 p-4 border rounded-xl bg-slate-50/50">
                      <h5 className="font-extrabold text-slate-800 text-xs uppercase text-red-650">Kế hoạch phê chuẩn & thực binh diễn tập</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Tổng phương án đã soạn thảo:</span>
                          <strong className="font-mono text-slate-855 bg-white border px-2 py-0.2 rounded shadow-2xs">{plans.length} phương án</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Đã phối hợp thực binh diễn tập:</span>
                          <strong className="font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.2 rounded shadow-2xs">
                            {plans.filter(p => !!p.rehearsalDate).length} phương án
                          </strong>
                        </div>
                        <div className="flex justify-between text-slate-455">
                          <span>Thời lượng huấn luyện trung binh:</span>
                          <strong className="font-mono text-slate-800">22 giờ / phương án</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-xl bg-slate-50/50">
                      <h5 className="font-extrabold text-slate-800 text-xs uppercase text-blue-600">Trạng thái trang thiết bị khí tài cứu hỏa</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Thiết bị đạt yêu cầu vận hành (Tốt):</span>
                          <strong className="font-mono text-emerald-600">{equipment.filter(e => e.status === 'Tốt').length} thiết bị</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Đang đưa vào trạm bảo dưỡng:</span>
                          <strong className="font-mono text-amber-700">{equipment.filter(e => e.status === 'Đang bảo dưỡng').length} thiết bị</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Hao mòn chờ thanh lý/Cần sửa chữa:</span>
                          <strong className="font-mono text-red-600">{equipment.filter(e => e.status === 'Hỏng hóc' || e.status === 'Cần sửa chữa').length} thiết bị</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'documents' && (
                <div className="space-y-6" id="report-documents-subpanel">
                  <div className="border-b pb-2">
                    <h4 className="font-extrabold text-[#1a202c] uppercase tracking-wide">
                      Lưu lượng văn thư liên ngành Đến/Đi năm 2026
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Giám sát mức độ thâm nhập thông tin chỉ đạo và hiệu suất làm văn bản báo cáo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold font-sans">
                    <div className="space-y-3 p-4 border rounded-xl">
                      <span className="font-black text-slate-400 block text-[10px] uppercase tracking-wider">Công văn Đến nhận</span>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tổng công văn đến:</span>
                          <span className="font-mono font-bold text-slate-800">{incomingDocs.length} nhận</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Đang thụ lý chưa ký kết:</span>
                          <span className="font-mono text-blue-600 font-bold bg-blue-50 px-1.5 rounded">{incomingDocs.filter(d => d.status === 'Đang xử lý').length} văn bản</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Đã báo cáo hoàn tất:</span>
                          <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">{incomingDocs.filter(d => d.status === 'Đã hoàn thành').length} văn bản</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-xl">
                      <span className="font-black text-slate-400 block text-[10px] uppercase tracking-wider">Công văn Đi ban hành</span>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tổng quyết định, báo cáo ban hành:</span>
                          <span className="font-mono font-bold text-slate-800">{outgoingDocs.length} văn bản</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Soạn thảo bởi đại diện cán bộ:</span>
                          <span className="font-mono font-bold">{officers.filter(o => o.tasksCount > 2).length} cán bộ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trung vị xét duyệt của Trưởng ban:</span>
                          <span className="font-mono font-bold bg-slate-100 px-1.5 rounded">1.5 ngày / văn bản</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
