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
  RefreshCw, CheckCircle2, ChevronDown, ChevronUp
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
  notes?: string;
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

  // Lọc chỉ hiển thị danh sách cán bộ, chỉ huy đội, bỏ chiến sĩ
  const activeOfficers = officers.filter(o => o.position !== 'Chiến sĩ');

  // Selected statistics subtab
  const [subTab, setSubTab] = useState<'plans' | 'kpi-class'>('plans');

  // Month-by-month statistics state
  const [selectedStatsYear, setSelectedStatsYear] = useState<number>(2026);
  const [selectedStatsMonth, setSelectedStatsMonth] = useState<number>(6);
  const [squadSelectedMonth, setSquadSelectedMonth] = useState<number>(0);
  const [statsViewMode, setStatsViewMode] = useState<'summary' | 'detail'>('summary');
  const [statsOfficerId, setStatsOfficerId] = useState<string>('');
  const [statsEValue, setStatsEValue] = useState<number>(30);
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ 6: true });

  const toggleMonth = (month: number) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  const expandAllMonths = () => {
    const all: Record<number, boolean> = {};
    for (let i = 1; i <= 12; i++) {
      all[i] = true;
    }
    setExpandedMonths(all);
  };

  const collapseAllMonths = () => {
    setExpandedMonths({});
  };

  // Chọn cán bộ hoạt động đầu tiên làm mặc định cho stats panel
  useEffect(() => {
    if (!statsOfficerId && activeOfficers.length > 0) {
      setStatsOfficerId(activeOfficers[0].id);
    }
  }, [activeOfficers, statsOfficerId]);

  // KPI Classification State Management
  const [selectedKpiOfficerId, setSelectedKpiOfficerId] = useState<string | null>(null);

  // Chọn cán bộ hoạt động đầu tiên làm mặc định nếu chưa chọn
  useEffect(() => {
    if (!selectedKpiOfficerId && activeOfficers.length > 0) {
      setSelectedKpiOfficerId(activeOfficers[0].id);
    }
  }, [activeOfficers, selectedKpiOfficerId]);
  const [kpiEValue, setKpiEValue] = useState<number>(30); // E.g., max 30 points as per guideline
  const [officerEValues, setOfficerEValues] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('pccc_officer_e_values');
    return cached ? JSON.parse(cached) : {};
  });

  useEffect(() => {
    localStorage.setItem('pccc_officer_e_values', JSON.stringify(officerEValues));
  }, [officerEValues]);

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

  const getKpiTasksForOfficer = (officerId: string, year?: number, month?: number): EvaluatedKpiTask[] => {
    const key = (year && month) ? `${officerId}-${year}-${month}` : officerId;
    if (officerKpiTasks[key] && officerKpiTasks[key].length > 0) {
      return officerKpiTasks[key];
    }
    // Fallback to just officerId if defined
    if (officerKpiTasks[officerId] && officerKpiTasks[officerId].length > 0) {
      return officerKpiTasks[officerId];
    }
    // Return standard default tasks representing Page 16 of guidance PDF / matching the image
    return [
      { id: '1', name: 'Nhiệm vụ 1', product: 'Công văn', scorePerProduct: 10, assignedQty: 5, completedQty: 5, qualityFactor: 1.0, speedFactor: 1.0, qualityNote: 'Đảm bảo', speedNote: 'Đảm bảo' },
      { id: '2', name: 'Nhiệm vụ 2', product: 'Báo cáo', scorePerProduct: 15, assignedQty: 3, completedQty: 3, qualityFactor: 1.0, speedFactor: 1.0, qualityNote: 'Đảm bảo', speedNote: 'Đảm bảo' },
      { id: '3', name: 'Nhiệm vụ 3', product: 'Tờ trình', scorePerProduct: 20, assignedQty: 3, completedQty: 3, qualityFactor: 1.1, speedFactor: 1.0, qualityNote: 'Đảm bảo vượt mức', speedNote: 'Đảm bảo' },
      { id: '4', name: 'Nhiệm vụ 4', product: 'Thông tư', scorePerProduct: 90, assignedQty: 1, completedQty: 1, qualityFactor: 1.0, speedFactor: 1.0, qualityNote: 'Đảm bảo', speedNote: 'Đảm bảo' },
      { id: '5', name: 'Nhiệm vụ 5', product: 'Quy định', scorePerProduct: 90, assignedQty: 1, completedQty: 1, qualityFactor: 0.75, speedFactor: 1.0, qualityNote: 'Chỉnh sửa 01 lần', speedNote: 'Đảm bảo' }
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
  const totalOfficers = activeOfficers.length;
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
  const officerKpiData = activeOfficers.map(o => ({
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
      activeOfficers.forEach(officer => {
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
      activeOfficers.forEach(officer => {
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

  // --- KPI Statistics Panel Helpers ---
  const handleUpdateTaskField = (officerId: string, year: number, month: number, taskId: string, field: keyof EvaluatedKpiTask, value: any) => {
    const key = `${officerId}-${year}-${month}`;
    const statsTasks = getKpiTasksForOfficer(officerId, year, month);
    const updatedTasks = statsTasks.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, [field]: value };
        // Auto update descriptions
        if (field === 'qualityFactor') {
          if (value === 1.1) updated.qualityNote = 'Đảm bảo vượt mức';
          else if (value === 1.0) updated.qualityNote = 'Đảm bảo';
          else if (value === 0.75) updated.qualityNote = 'Chỉnh sửa 01 lần';
          else if (value === 0.5) updated.qualityNote = 'Chỉnh sửa 02 lần';
          else if (value === 0.0) updated.qualityNote = 'Không đạt';
        }
        if (field === 'speedFactor') {
          if (value === 1.0) updated.speedNote = 'Đảm bảo';
          else if (value === 0.75) updated.speedNote = 'Chậm 01 lần';
          else if (value === 0.5) updated.speedNote = 'Chậm 02 lần';
          else if (value === 0.0) updated.speedNote = 'Trễ hạn';
        }
        return updated;
      }
      return t;
    });
    setOfficerKpiTasks(prev => ({
      ...prev,
      [key]: updatedTasks
    }));
  };

  const handleAddStatsTask = (officerId: string, year: number, month: number) => {
    const key = `${officerId}-${year}-${month}`;
    const statsTasks = getKpiTasksForOfficer(officerId, year, month);
    const newTask: EvaluatedKpiTask = {
      id: String(Date.now()),
      name: 'Nhiệm vụ mới ' + (statsTasks.length + 1),
      product: 'Báo cáo',
      scorePerProduct: 20,
      assignedQty: 1,
      completedQty: 1,
      qualityFactor: 1.0,
      speedFactor: 1.0,
      qualityNote: 'Đảm bảo',
      speedNote: 'Đảm bảo'
    };
    setOfficerKpiTasks(prev => ({
      ...prev,
      [key]: [...statsTasks, newTask]
    }));
  };

  const handleDeleteStatsTask = (officerId: string, year: number, month: number, taskId: string) => {
    const key = `${officerId}-${year}-${month}`;
    const statsTasks = getKpiTasksForOfficer(officerId, year, month);
    setOfficerKpiTasks(prev => ({
      ...prev,
      [key]: statsTasks.filter(t => t.id !== taskId)
    }));
  };

  const handleResetStatsTasks = (officerId: string, year: number, month: number) => {
    const key = `${officerId}-${year}-${month}`;
    setOfficerKpiTasks(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const getAnnualStatsForOfficer = (officerId: string, year: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthTasks = getKpiTasksForOfficer(officerId, year, month);

      let totalAssignedScore = 0;
      let totalQuantityScore = 0;
      let totalQualityScore = 0;
      let totalSpeedScore = 0;

      monthTasks.forEach(task => {
        const rowAssigned = task.assignedQty * task.scorePerProduct;
        const rowCompleted = task.completedQty * task.scorePerProduct;
        const rowQuality = rowCompleted * task.qualityFactor;
        const rowSpeed = rowCompleted * task.speedFactor;

        totalAssignedScore += rowAssigned;
        totalQuantityScore += rowCompleted;
        totalQualityScore += rowQuality;
        totalSpeedScore += rowSpeed;
      });

      const A = totalAssignedScore > 0 ? (totalQuantityScore / totalAssignedScore) : 1;
      const B = totalAssignedScore > 0 ? (totalQualityScore / totalAssignedScore) : 1;
      const C = totalAssignedScore > 0 ? (totalSpeedScore / totalAssignedScore) : 1;

      const kpiVal = totalAssignedScore > 0 ? (((A + B + C) / 3) * 100) : 100;
      const kpiRounded = parseFloat(kpiVal.toFixed(2));
      const eVal = 30; // general criterion score
      const totalScore = eVal + kpiRounded * 0.7;

      let classification = 'Không hoàn thành';
      if (totalScore >= 90) classification = 'Xuất sắc';
      else if (totalScore >= 70) classification = 'Tốt';
      else if (totalScore >= 50) classification = 'Hoàn thành';

      return {
        month,
        totalAssignedScore,
        totalQuantityScore,
        totalQualityScore,
        totalSpeedScore,
        A,
        B,
        C,
        kpi: kpiRounded,
        e: eVal,
        totalScore,
        classification
      };
    });
  };

  const getKpiForOfficerLocal = (officerId: string, year: number, month: number): number => {
    if (month === 0) {
      const annualData = getAnnualStatsForOfficer(officerId, year);
      if (annualData.length === 0) return 100;
      let totalKpiSum = 0;
      annualData.forEach(row => {
        totalKpiSum += row.kpi;
      });
      return parseFloat((totalKpiSum / annualData.length).toFixed(2));
    } else {
      const statsTasks = getKpiTasksForOfficer(officerId, year, month);
      let totalAssignedScore = 0;
      let totalQuantityScore = 0;
      let totalQualityScore = 0;
      let totalSpeedScore = 0;

      statsTasks.forEach(task => {
        const rowAssigned = task.assignedQty * task.scorePerProduct;
        const rowCompleted = task.completedQty * task.scorePerProduct;
        const rowQuality = rowCompleted * task.qualityFactor;
        const rowSpeed = rowCompleted * task.speedFactor;

        totalAssignedScore += rowAssigned;
        totalQuantityScore += rowCompleted;
        totalQualityScore += rowQuality;
        totalSpeedScore += rowSpeed;
      });

      const A = totalAssignedScore > 0 ? (totalQuantityScore / totalAssignedScore) : 1;
      const B = totalAssignedScore > 0 ? (totalQualityScore / totalAssignedScore) : 1;
      const C = totalAssignedScore > 0 ? (totalSpeedScore / totalAssignedScore) : 1;

      const computedKpi = ((A + B + C) / 3) * 100;
      return parseFloat(computedKpi.toFixed(2));
    }
  };


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
              Phân loại KPI
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
                  {activeOfficers.map(o => (
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
                      {activeOfficers.map(o => (
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
                  <strong className="text-emerald-800 font-mono text-2xl">{activeOfficers.filter(o => getKpiForOfficerLocal(o.id, selectedStatsYear, selectedStatsMonth) >= 70).length} Cán bộ</strong>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded font-mono text-[10px] font-bold">KPI 70 - 100</span>
              </div>
              <p className="text-[10.5px] text-emerald-700 mt-2 font-medium">Hoàn thành tốt nhiệm vụ, bảo đảm các tiêu chuẩn đề xuất xuất sắc.</p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl shadow-3xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase tracking-wider font-extrabold block">NHÓM 2: ĐÁP ỨNG YÊU CẦU</span>
                  <strong className="text-amber-800 font-mono text-2xl">{activeOfficers.filter(o => { const kpi = getKpiForOfficerLocal(o.id, selectedStatsYear, selectedStatsMonth); return kpi >= 50 && kpi < 70; }).length} Cán bộ</strong>
                </div>
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded font-mono text-[10px] font-bold">KPI 50 - 69</span>
              </div>
              <p className="text-[10.5px] text-amber-700 mt-2 font-medium">Đạt điều kiện hoàn thành công tác cần tiếp tục nỗ lực.</p>
            </div>

            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl shadow-3xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase tracking-wider font-extrabold block">NHÓM 3: CHƯA ĐÁP ỨNG</span>
                  <strong className="text-red-800 font-mono text-2xl">{activeOfficers.filter(o => getKpiForOfficerLocal(o.id, selectedStatsYear, selectedStatsMonth) < 50).length} Cán bộ</strong>
                </div>
                <span className="px-2 py-0.5 bg-red-500 text-white rounded font-mono text-[10px] font-bold">KPI &lt; 50</span>
              </div>
              <p className="text-[10.5px] text-red-700 mt-2 font-medium">Cần bồi dưỡng nghiệp vụ chuyên sâu, đôn đốc chấn chỉnh kỷ cương.</p>
            </div>
          </div>

      <div className="space-y-6 pt-6 border-t border-slate-100" id="reports-statistics-summary">
        {/* Header section with high-end typography and description */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-150 pb-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5.5 h-5.5 text-red-650" />
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">
                Thống kê & Tổng hợp Điểm KPI Cán bộ, Chỉ huy
              </h3>
            </div>
            <p className="text-slate-500 text-xs font-medium">
              Báo cáo hiệu suất công tác, chấm điểm tự động và tổng hợp xếp loại thi đua theo Hướng dẫn số 20-HD/ĐUCA
            </p>
          </div>
          
          {/* Main Selectors for Officer and Year */}
          <div className="flex flex-wrap items-center gap-3 no-print">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Cán bộ:</span>
              <select
                value={statsOfficerId}
                onChange={(e) => setStatsOfficerId(e.target.value)}
                className="p-1 text-xs bg-white border border-slate-200 rounded-md font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-red-500 min-w-[180px]"
              >
                {activeOfficers.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.position} - {o.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Năm:</span>
              <select
                value={selectedStatsYear}
                onChange={(e) => setSelectedStatsYear(parseInt(e.target.value))}
                className="p-1 text-xs bg-white border border-slate-200 rounded-md font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-red-500"
              >
                {Array.from({ length: 51 }, (_, i) => 2026 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Month Selector Buttons Bar */}
        <div className="no-print">
          <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Thời gian thống kê:</div>
          <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {/* Months 1 to 12 */}
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedStatsMonth(m)}
                className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  selectedStatsMonth === m
                    ? 'bg-red-650 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/50'
                }`}
              >
                Tháng {m}
              </button>
            ))}
            {/* Whole Year aggregation button */}
            <button
              onClick={() => setSelectedStatsMonth(0)}
              className={`py-2 text-xs font-extrabold rounded-lg cursor-pointer transition-all uppercase tracking-wide col-span-4 sm:col-span-2 lg:col-span-1 ${
                selectedStatsMonth === 0
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200'
              }`}
            >
              Cả Năm
            </button>
          </div>
        </div>

        {/* Selected Officer and Calculation View */}
        {(() => {
          const currentOfficer = activeOfficers.find(o => o.id === statsOfficerId) || activeOfficers[0];
          if (!currentOfficer) {
            return (
              <div className="bg-slate-50 p-8 rounded-xl text-center text-slate-500 font-medium">
                Vui lòng khởi tạo danh sách Cán bộ đội để xem thống kê.
              </div>
            );
          }

          if (selectedStatsMonth > 0) {
            // --- MONTHLY DETAILED KPI SHEET VIEW ---
            const statsTasks = getKpiTasksForOfficer(currentOfficer.id, selectedStatsYear, selectedStatsMonth);
            
            // Computations
            let totalAssignedScore = 0;
            let totalQuantityScore = 0;
            let totalQualityScore = 0;
            let totalSpeedScore = 0;
            let totalCompletedQty = 0;

            statsTasks.forEach(task => {
              const rowAssigned = task.assignedQty * task.scorePerProduct;
              const rowCompleted = task.completedQty * task.scorePerProduct;
              const rowQuality = rowCompleted * task.qualityFactor;
              const rowSpeed = rowCompleted * task.speedFactor;

              totalAssignedScore += rowAssigned;
              totalCompletedQty += task.completedQty;
              totalQuantityScore += rowCompleted;
              totalQualityScore += rowQuality;
              totalSpeedScore += rowSpeed;
            });

            const A = totalAssignedScore > 0 ? (totalQuantityScore / totalAssignedScore) : 1;
            const B = totalAssignedScore > 0 ? (totalQualityScore / totalAssignedScore) : 1;
            const C = totalAssignedScore > 0 ? (totalSpeedScore / totalAssignedScore) : 1;

            const computedKpi = ((A + B + C) / 3) * 100;
            const kpiRounded = parseFloat(computedKpi.toFixed(2));
            const totalScore = statsEValue + kpiRounded * 0.7;

            let classification = 'Không hoàn thành';
            let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            if (totalScore >= 90) {
              classification = 'Hoàn thành Xuất sắc';
              badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            } else if (totalScore >= 70) {
              classification = 'Hoàn thành Tốt';
              badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
            } else if (totalScore >= 50) {
              classification = 'Hoàn thành Nhiệm vụ';
              badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            // Exporter for single month
            const handleExportMonthlyKpiExcelLocal = () => {
              const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;
              
              let htmlContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style>
                  body { font-family: "Times New Roman", Times, serif; }
                  .main-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
                  .main-table th { border: 1px solid #000000; padding: 10px 6px; font-weight: bold; text-align: center; background-color: #f2f2f2; }
                  .main-table td { border: 1px solid #000000; padding: 8px 6px; vertical-align: middle; }
                </style>
                </head>
                <body>
                  <h2 style="text-align: center; text-transform: uppercase;">BẢNG ĐÁNH GIÁ CHỈ SỐ KPI THÁNG ${selectedStatsMonth}/${selectedStatsYear}</h2>
                  <h3 style="text-align: center;">Cán bộ đánh giá: ${currentOfficer.position} ${currentOfficer.fullName}</h3>
                  
                  <table class="main-table" border="1" style="border-collapse: collapse; border: 1px solid black; width: 100%;">
                    <thead>
                      <tr style="background-color: #f2f2f2;">
                        <th rowspan="2">STT</th>
                        <th rowspan="2">Nội dung nhiệm vụ</th>
                        <th rowspan="2">Sản phẩm công việc</th>
                        <th colspan="3">Giao nhiệm vụ</th>
                        <th colspan="8">Đánh giá</th>
                      </tr>
                      <tr style="background-color: #f2f2f2;">
                        <th>Điểm sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Tổng điểm giao</th>
                        <th>Số lượng hoàn thành</th>
                        <th>Điểm Số lượng (A)</th>
                        <th>Chất lượng vượt mức</th>
                        <th>Thiếu sót chỉnh sửa</th>
                        <th>Điểm Chất lượng (B)</th>
                        <th>Tiến độ vượt/đạt</th>
                        <th>Tiến độ chậm</th>
                        <th>Điểm Tiến độ (C)</th>
                      </tr>
                    </thead>
                    <tbody>
              `;

              statsTasks.forEach((task, idx) => {
                const rowAssigned = task.assignedQty * task.scorePerProduct;
                const rowCompleted = task.completedQty * task.scorePerProduct;
                const rowQuality = rowCompleted * task.qualityFactor;
                const rowSpeed = rowCompleted * task.speedFactor;

                const qOver = task.qualityFactor >= 1.0 ? (task.qualityFactor === 1.1 ? 'Vượt mức 10%' : 'Đảm bảo') : '-';
                const qUnder = task.qualityFactor < 1.0 ? `Chỉnh sửa (-${Math.round((1 - task.qualityFactor)*100)}%)` : '-';
                
                const sOver = task.speedFactor >= 1.0 ? 'Đảm bảo' : '-';
                const sUnder = task.speedFactor < 1.0 ? `Chậm trễ (-${Math.round((1 - task.speedFactor)*100)}%)` : '-';

                htmlContent += `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${task.name}</td>
                    <td>${task.product}</td>
                    <td style="text-align: center;">${task.scorePerProduct}</td>
                    <td style="text-align: center;">${task.assignedQty}</td>
                    <td style="text-align: center;">${rowAssigned}</td>
                    <td style="text-align: center;">${task.completedQty}</td>
                    <td style="text-align: center;">${rowCompleted}</td>
                    <td style="text-align: center;">${qOver}</td>
                    <td style="text-align: center;">${qUnder}</td>
                    <td style="text-align: center;">${rowQuality.toFixed(1)}</td>
                    <td style="text-align: center;">${sOver}</td>
                    <td style="text-align: center;">${sUnder}</td>
                    <td style="text-align: center;">${rowSpeed.toFixed(1)}</td>
                  </tr>
                `;
              });

              htmlContent += `
                    <tr style="font-weight: bold; background-color: #f9f9f9;">
                      <td colspan="5" style="text-align: right;">Tổng cộng:</td>
                      <td style="text-align: center;">${totalAssignedScore}</td>
                      <td style="text-align: center;">${totalCompletedQty}</td>
                      <td style="text-align: center;">${totalQuantityScore}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center;">${totalQualityScore.toFixed(1)}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center;">${totalSpeedScore.toFixed(1)}</td>
                    </tr>
                    <tr style="font-weight: bold; background-color: #f2f2f2;">
                      <td colspan="7" style="text-align: right; color: red;">Chỉ số thành phần (A, B, C):</td>
                      <td style="text-align: center; color: red;">A = ${A === 1 ? '01' : A.toFixed(3)}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center; color: red;">B = ${B.toFixed(3)}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center; color: red;">C = ${C === 1 ? '01' : C.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style="margin-top: 25px; font-size: 11pt; line-height: 1.5;">
                  <p><b>1. Chỉ số hiệu suất công việc (KPI):</b></p>
                  <p>KPI = (A + B + C) / 3 x 100 = (${A === 1 ? '01' : A.toFixed(3)} + ${B.toFixed(3)} + ${C === 1 ? '01' : C.toFixed(3)}) / 3 x 100 = <b>${kpiRounded}%</b></p>
                  <p><b>2. Tổng điểm xếp loại:</b></p>
                  <p>Tổng điểm đánh giá dùng trong xếp loại = Điểm tiêu chí chung (E) + KPI x 0,7 = ${statsEValue} + ${kpiRounded} x 0,7 = <b>${totalScore.toFixed(2)}</b></p>
                  <p><b>Phân loại: ${classification.toUpperCase()}</b></p>
                </div>

                <table style="width: 100%; border: none; margin-top: 45px; font-size: 11.5pt;">
                  <tr>
                    <td style="width: 50%; text-align: center; font-weight: bold; text-transform: uppercase; border: none;">
                      CHI HUY DUYỆT
                    </td>
                    <td style="width: 50%; text-align: center; font-style: italic; border: none;">
                      ${todayStrInVietnamese}<br/>
                      <b>CÁN BỘ ĐÁNH GIÁ</b>
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
              link.setAttribute('download', `KPI_Thang_${selectedStatsMonth}_${currentOfficer.fullName.replace(/\s+/g, '_')}.xls`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            const handleExportMonthlyKpiWordLocal = () => {
              const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;

              let htmlContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style>
                  @page {
                    size: A4 portrait;
                    margin: 1.5cm 1.5cm 1.5cm 1.5cm;
                  }
                  body { font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.3; }
                  .header-table { width: 100%; border: none !important; margin-bottom: 25px; }
                  .header-table td { border: none !important; padding: 2px; text-align: center; font-size: 10.5pt; vertical-align: top; }
                  .title-section { text-align: center; margin-bottom: 20px; }
                  .doc-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0; }
                  .doc-subtitle { font-size: 11.5pt; font-style: italic; margin-top: 5px; margin-bottom: 0; }
                  .info-p { font-size: 11pt; font-weight: bold; margin-top: 5px; margin-bottom: 15px; text-align: center; }
                  .main-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 15px; }
                  .main-table th { border: 1px solid #000000; padding: 6px 3px; font-weight: bold; text-align: center; background-color: #f2f2f2; }
                  .main-table td { border: 1px solid #000000; padding: 5px 3px; vertical-align: middle; }
                  .formula-box { margin-top: 20px; border: 1px dashed #777; padding: 10px; font-size: 11pt; background-color: #fafafa; }
                  .signature-table { width: 100%; border: none !important; margin-top: 35px; }
                  .signature-table td { border: none !important; text-align: center; vertical-align: top; font-size: 11pt; width: 50%; }
                </style>
                </head>
                <body>
                  <table class="header-table">
                    <tr>
                      <td style="width: 45%;">
                        <b>CÔNG AN TỈNH TÂY NINH</b><br/>
                        <b>PHÒNG CẢNH SÁT PCCC & CNCH</b><br/>
                        <span>ĐỘI CC & CNCH KV TÂN AN</span><br/>
                        <span>*</span>
                      </td>
                      <td style="width: 55%; font-weight: bold;">
                        <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
                        <span style="font-size: 11pt;">Độc lập - Tự do - Hạnh phúc</span><br/>
                        <span>---------------</span>
                      </td>
                    </tr>
                  </table>

                  <div class="title-section">
                    <h2 class="doc-title">BẢNG ĐÁNH GIÁ CHỈ SỐ KPI CHI TIẾT</h2>
                    <p class="doc-subtitle">Tháng ${selectedStatsMonth} năm ${selectedStatsYear}</p>
                    <p class="info-p">Cán bộ thực hiện: ${currentOfficer.position} ${currentOfficer.fullName}</p>
                  </div>

                  <table class="main-table">
                    <thead>
                      <tr style="background-color: #e6e6e6;">
                        <th rowspan="2" style="width: 30px;">STT</th>
                        <th rowspan="2">Nội dung nhiệm vụ</th>
                        <th rowspan="2" style="width: 100px;">Sản phẩm</th>
                        <th colspan="3">Giao nhiệm vụ</th>
                        <th colspan="8">Đánh giá kết quả thực hiện</th>
                      </tr>
                      <tr style="background-color: #f2f2f2;">
                        <th style="width: 45px;">Điểm SP</th>
                        <th style="width: 40px;">Số lượng</th>
                        <th style="width: 55px;">Tổng điểm</th>
                        <th style="width: 40px;">SL hoàn thành</th>
                        <th style="width: 55px;">Điểm SL (A)</th>
                        <th style="width: 80px;">Chất lượng vượt mức</th>
                        <th style="width: 80px;">Thiếu sót chỉnh sửa</th>
                        <th style="width: 55px;">Điểm CL (B)</th>
                        <th style="width: 80px;">Tiến độ vượt/đạt</th>
                        <th style="width: 80px;">Tiến độ chậm</th>
                        <th style="width: 55px;">Điểm TĐ (C)</th>
                      </tr>
                    </thead>
                    <tbody>
              `;

              statsTasks.forEach((task, idx) => {
                const rowAssigned = task.assignedQty * task.scorePerProduct;
                const rowCompleted = task.completedQty * task.scorePerProduct;
                const rowQuality = rowCompleted * task.qualityFactor;
                const rowSpeed = rowCompleted * task.speedFactor;

                const qOver = task.qualityFactor >= 1.0 ? (task.qualityFactor === 1.1 ? 'Vượt mức (+10%)' : 'Đảm bảo') : '-';
                const qUnder = task.qualityFactor < 1.0 ? `Chỉnh sửa (-${Math.round((1 - task.qualityFactor)*100)}%)` : '-';
                
                const sOver = task.speedFactor >= 1.0 ? 'Đảm bảo' : '-';
                const sUnder = task.speedFactor < 1.0 ? `Chậm trễ (-${Math.round((1 - task.speedFactor)*100)}%)` : '-';

                htmlContent += `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${task.name}</td>
                    <td>${task.product}</td>
                    <td style="text-align: center;">${task.scorePerProduct}</td>
                    <td style="text-align: center;">${task.assignedQty}</td>
                    <td style="text-align: center;">${rowAssigned}</td>
                    <td style="text-align: center;">${task.completedQty}</td>
                    <td style="text-align: center;">${rowCompleted}</td>
                    <td style="text-align: center;">${qOver}</td>
                    <td style="text-align: center;">${qUnder}</td>
                    <td style="text-align: center; font-weight: bold;">${rowQuality.toFixed(1)}</td>
                    <td style="text-align: center;">${sOver}</td>
                    <td style="text-align: center;">${sUnder}</td>
                    <td style="text-align: center; font-weight: bold;">${rowSpeed.toFixed(1)}</td>
                  </tr>
                `;
              });

              htmlContent += `
                    <tr style="font-weight: bold; background-color: #fafafa;">
                      <td colspan="3" style="text-align: right;">Cộng hệ số:</td>
                      <td colspan="2"></td>
                      <td style="text-align: center;">${totalAssignedScore}</td>
                      <td style="text-align: center;">${totalCompletedQty}</td>
                      <td style="text-align: center;">${totalQuantityScore}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center;">${totalQualityScore.toFixed(1)}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center;">${totalSpeedScore.toFixed(1)}</td>
                    </tr>
                    <tr style="font-weight: bold; background-color: #f2f2f2;">
                      <td colspan="7" style="text-align: right; color: #b91c1c;">Chỉ số thành phần (A, B, C):</td>
                      <td style="text-align: center; color: #b91c1c;">A = ${A === 1 ? '01' : A.toFixed(3)}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center; color: #b91c1c;">B = ${B.toFixed(3)}</td>
                      <td colspan="2"></td>
                      <td style="text-align: center; color: #b91c1c;">C = ${C === 1 ? '01' : C.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="formula-box">
                  <p style="margin: 0 0 8px 0;"><b>1. Hiệu suất công việc (KPI):</b></p>
                  <p style="margin: 0 0 12px 15px;">Công thức: KPI = (A + B + C) / 3 x 100</p>
                  <p style="margin: 0 0 12px 15px;">Kết quả thực tế: KPI = (${A === 1 ? '01' : A.toFixed(3)} + ${B.toFixed(3)} + ${C === 1 ? '01' : C.toFixed(3)}) / 3 x 100 = <b>${kpiRounded}%</b></p>
                  
                  <p style="margin: 0 0 8px 0;"><b>2. Tiêu chí đánh giá chung (E):</b> <b>${statsEValue} điểm</b> (Tối đa 30 điểm)</p>
                  
                  <p style="margin: 12px 0 8px 0;"><b>3. Tổng điểm đánh giá và xếp loại cá nhân:</b></p>
                  <p style="margin: 0 0 8px 15px;">Công thức: Tổng điểm = E + KPI x 0,7 = ${statsEValue} + ${kpiRounded} x 0,7 = <b>${totalScore.toFixed(2)} điểm</b></p>
                  <p style="margin: 0 0 0 15px;"><b>XẾP LOẠI CÁ NHÂN: <span style="color: #b91c1c; text-transform: uppercase;">${classification}</span></b></p>
                </div>

                <table class="signature-table">
                  <tr>
                    <td>
                      <b>CHỈ HUY DUYỆT</b><br/>
                      <span style="font-size: 9pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
                      <div style="height: 80px;"></div>
                    </td>
                    <td>
                      <span style="font-style: italic;">${todayStrInVietnamese}</span><br/>
                      <b>CÁN BỘ ĐÁNH GIÁ</b><br/>
                      <span style="font-size: 9pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
                      <div style="height: 80px;"></div>
                      <p style="margin: 0; font-weight: bold;">${currentOfficer.fullName}</p>
                    </td>
                  </tr>
                </table>
                </body>
                </html>
              `;

              const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `KPI_Thang_${selectedStatsMonth}_${currentOfficer.fullName.replace(/\s+/g, '_')}.doc`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="space-y-6">
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 no-print">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddStatsTask(currentOfficer.id, selectedStatsYear, selectedStatsMonth)}
                      className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm dòng nhiệm vụ
                    </button>
                    <button
                      onClick={() => handleResetStatsTasks(currentOfficer.id, selectedStatsYear, selectedStatsMonth)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Khôi phục mẫu chuẩn
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportMonthlyKpiExcelLocal}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Xuất Excel (XLS)
                    </button>
                    <button
                      id="export-monthly-kpi-word-btn"
                      onClick={handleExportMonthlyKpiWordLocal}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Xuất bảng đánh giá chi tiết ra định dạng Microsoft Word (.doc)"
                    >
                      <FileText className="w-3.5 h-3.5" /> Xuất Word (DOC)
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> In bảng đánh giá
                    </button>
                  </div>
                </div>

                {/* Print layout header */}
                <div className="hidden print:block text-center space-y-2 mb-4">
                  <div className="text-xs uppercase font-bold tracking-wide text-slate-500">
                    PHÒNG CẢNH SÁT PCCC VÀ CNCH - ĐỘI CHỮA CHÁY KV TÂN AN
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase">
                    BẢNG ĐÁNH GIÁ CHỈ SỐ KPI CHI TIẾT THÁNG {selectedStatsMonth}/{selectedStatsYear}
                  </h2>
                  <div className="text-sm text-slate-700 font-semibold">
                    Cán bộ thực hiện: {currentOfficer.position} {currentOfficer.fullName}
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm bg-white">
                  <table className="w-full text-left border-collapse font-sans text-xs min-w-[1200px]">
                    <thead>
                      {/* Level 1 Headers */}
                      <tr className="bg-slate-800 text-white font-bold border-b border-slate-300 text-center">
                        <th className="p-2 border-r border-slate-300 text-center w-12" rowSpan={2}>STT</th>
                        <th className="p-2 border-r border-slate-300 text-center" rowSpan={2}>Nội dung nhiệm vụ</th>
                        <th className="p-2 border-r border-slate-300 text-center w-28" rowSpan={2}>Sản phẩm</th>
                        <th className="p-2 border-r border-slate-300 text-center bg-slate-700/80" colSpan={3}>Giao nhiệm vụ</th>
                        <th className="p-2 border-r border-slate-300 text-center bg-emerald-950/85" colSpan={8}>Đánh giá</th>
                        <th className="p-2 text-center w-20 no-print" rowSpan={2}>Thao tác</th>
                      </tr>
                      {/* Level 2 Headers */}
                      <tr className="bg-slate-150 text-slate-700 font-bold border-b border-slate-300 text-center">
                        {/* Giao nhiem vu sub-columns */}
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-slate-100 w-20">Điểm SP</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-slate-100 w-16">Số lượng</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-slate-100 w-20">Tổng điểm</th>

                        {/* Danh gia sub-columns */}
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-16">SL hoàn thành</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-20">Điểm Số lượng (A)</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-32">Chất lượng vượt mức</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-32">Thiếu sót chỉnh sửa</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-24">Điểm Chất lượng (B)</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-28">Tiến độ vượt/đạt</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-28">Tiến độ chậm</th>
                        <th className="p-1.5 border-r border-slate-300 text-[10px] bg-emerald-50/60 w-24">Điểm Tiến độ (C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsTasks.map((task, idx) => {
                        const rowAssigned = task.assignedQty * task.scorePerProduct;
                        const rowCompleted = task.completedQty * task.scorePerProduct;
                        const rowQuality = rowCompleted * task.qualityFactor;
                        const rowSpeed = rowCompleted * task.speedFactor;

                        return (
                          <tr key={task.id} className="border-b border-slate-200 hover:bg-slate-50/50 font-medium">
                            <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-500 bg-slate-50/20">{idx + 1}</td>
                            
                            {/* Task Title */}
                            <td className="p-2 border-r border-slate-200 font-sans">
                              <input
                                type="text"
                                value={task.name}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'name', e.target.value)}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-sans text-xs font-semibold text-slate-850"
                              />
                            </td>

                            {/* Product */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                value={task.product}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'product', e.target.value)}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-bold text-slate-650"
                              />
                            </td>

                            {/* Score Per Product */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                min={0}
                                max={200}
                                value={task.scorePerProduct}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'scorePerProduct', parseInt(e.target.value) || 0)}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono font-extrabold text-slate-800"
                              />
                            </td>

                            {/* Assigned Qty */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={task.assignedQty}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'assignedQty', parseInt(e.target.value) || 1)}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono font-extrabold text-blue-800 bg-blue-50/15"
                              />
                            </td>

                            {/* Total Assigned points */}
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-800 bg-slate-50/30">
                              {rowAssigned}
                            </td>

                            {/* Completed Qty */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="number"
                                min={0}
                                max={task.assignedQty}
                                value={task.completedQty}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'completedQty', parseInt(e.target.value) || 0)}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono font-extrabold text-emerald-800 bg-emerald-50/15"
                              />
                            </td>

                            {/* Points for Quantity completed */}
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                              {rowCompleted}
                            </td>

                            {/* Quality factor: Exceeds */}
                            <td className="p-1 border-r border-slate-200 text-center">
                              <select
                                value={task.qualityFactor >= 1.0 ? task.qualityFactor : 1.0}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'qualityFactor', parseFloat(e.target.value))}
                                className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold text-slate-700 bg-white focus:outline-hidden"
                              >
                                <option value={1.1}>Vượt mức (+10%)</option>
                                <option value={1.0}>Đảm bảo (100%)</option>
                              </select>
                            </td>

                            {/* Quality factor: Deficiencies */}
                            <td className="p-1 border-r border-slate-200 text-center">
                              <select
                                value={task.qualityFactor < 1.0 ? task.qualityFactor : 1.0}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'qualityFactor', parseFloat(e.target.value))}
                                className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold text-slate-700 bg-white focus:outline-hidden"
                              >
                                <option value={1.0}>Không lỗi (100%)</option>
                                <option value={0.75}>Chỉnh sửa 1 lần (-25%)</option>
                                <option value={0.5}>Chỉnh sửa 2 lần (-50%)</option>
                                <option value={0.0}>Không đạt (0%)</option>
                              </select>
                            </td>

                            {/* Points for Quality B */}
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-extrabold text-teal-800 bg-teal-50/20">
                              {rowQuality.toFixed(1)}
                            </td>

                            {/* Speed factor: Exceeds/On time */}
                            <td className="p-1 border-r border-slate-200 text-center">
                              <select
                                value={task.speedFactor >= 1.0 ? task.speedFactor : 1.0}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'speedFactor', parseFloat(e.target.value))}
                                className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold text-slate-700 bg-white focus:outline-hidden"
                              >
                                <option value={1.0}>Đảm bảo (100%)</option>
                              </select>
                            </td>

                            {/* Speed factor: Delay */}
                            <td className="p-1 border-r border-slate-200 text-center">
                              <select
                                value={task.speedFactor < 1.0 ? task.speedFactor : 1.0}
                                onChange={(e) => handleUpdateTaskField(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id, 'speedFactor', parseFloat(e.target.value))}
                                className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold text-slate-700 bg-white focus:outline-hidden"
                              >
                                <option value={1.0}>Kịp thời (100%)</option>
                                <option value={0.75}>Chậm 01 lần (-25%)</option>
                                <option value={0.5}>Chậm 02 lần (-50%)</option>
                                <option value={0.0}>Trễ hạn (0%)</option>
                              </select>
                            </td>

                            {/* Points for Speed C */}
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-extrabold text-indigo-800 bg-indigo-50/20">
                              {rowSpeed.toFixed(1)}
                            </td>

                            {/* Actions */}
                            <td className="p-2 text-center no-print">
                              <button
                                onClick={() => handleDeleteStatsTask(currentOfficer.id, selectedStatsYear, selectedStatsMonth, task.id)}
                                className="p-1 hover:bg-red-50 text-red-550 hover:text-red-700 rounded-md transition-colors cursor-pointer"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* --- SUMMARY TOTALS ROW --- */}
                      <tr className="bg-slate-50 border-t border-b-2 border-slate-300 font-bold text-slate-800">
                        <td className="p-2.5 text-right border-r border-slate-300" colSpan={3}>Tổng cộng:</td>
                        <td className="p-2 text-center border-r border-slate-300 bg-slate-100/30" colSpan={2}>-</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-slate-900 bg-slate-100">{totalAssignedScore}</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-emerald-800 bg-emerald-100/20">{totalCompletedQty}</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-emerald-900 bg-emerald-100/30">{totalQuantityScore}</td>
                        <td className="p-2 text-center border-r border-slate-300" colSpan={2}>-</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-teal-900 bg-teal-100/30">{totalQualityScore.toFixed(1)}</td>
                        <td className="p-2 text-center border-r border-slate-300" colSpan={2}>-</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-indigo-900 bg-indigo-100/30">{totalSpeedScore.toFixed(1)}</td>
                        <td className="p-2 text-center no-print"></td>
                      </tr>

                      {/* --- COMPONENT SCORE (A, B, C) ROW --- */}
                      <tr className="bg-emerald-50/10 border-b border-slate-300 font-extrabold text-slate-800 text-[12px]">
                        <td className="p-3 text-right border-r border-slate-300 text-emerald-850 uppercase" colSpan={3}>Điểm các chỉ số (A, B, C):</td>
                        <td className="p-2 text-center border-r border-slate-300" colSpan={2}>-</td>
                        <td className="p-2 text-center border-r border-slate-300 bg-slate-100/10">-</td>
                        <td className="p-2 text-center border-r border-slate-300 bg-emerald-50/15">-</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-red-650 bg-rose-50 border-2 border-red-200">
                          A = {A === 1 ? '01' : A.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300" colSpan={2}>-</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-red-650 bg-rose-50 border-2 border-red-200">
                          B = {B.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300" colSpan={2}>-</td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-red-650 bg-rose-50 border-2 border-red-200">
                          C = {C === 1 ? '01' : C.toLocaleString('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                        </td>
                        <td className="p-2 text-center no-print"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Formula details and grading dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Detailed mathematical step card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-red-650 block tracking-wide">
                      📊 Công thức xác định chỉ số
                    </span>
                    <div className="space-y-3 font-sans text-xs text-slate-700 leading-relaxed">
                      <div>
                        <div className="font-extrabold text-slate-800 text-xs flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span>1. Hiệu suất công việc (KPI):</span>
                          <span className="text-red-650 font-mono text-sm">{kpiRounded}%</span>
                        </div>
                        <p className="mt-1.5 pl-2 text-slate-500 italic">
                          Công thức: KPI = (A + B + C) / 3 x 100
                        </p>
                        <p className="mt-1 pl-2 font-mono font-semibold text-slate-850">
                          KPI = ({A === 1 ? '01' : A.toFixed(3)} + {B.toFixed(3)} + {C === 1 ? '01' : C.toFixed(3)}) / 3 x 100 = {kpiRounded}%
                        </p>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-150">
                        <div className="flex items-center justify-between font-extrabold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span>2. Tiêu chí chung (E):</span>
                          <div className="flex items-center gap-1.5 no-print">
                            <input
                              type="range"
                              min={0}
                              max={30}
                              value={statsEValue}
                              onChange={(e) => setStatsEValue(parseInt(e.target.value))}
                              className="w-20 accent-red-650 cursor-pointer"
                            />
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={statsEValue}
                              onChange={(e) => setStatsEValue(parseInt(e.target.value) || 0)}
                              className="w-10 text-center font-mono font-bold border border-slate-250 rounded p-0.5"
                            />
                          </div>
                          <span className="hidden print:inline font-mono">{statsEValue} điểm</span>
                        </div>
                        <p className="mt-1 pl-2 text-slate-500 italic">
                          Tiêu chí đánh giá chung (tối đa 30 điểm). Hãy trượt thanh cuộn để điều chỉnh.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Final Class Badge card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-xs">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-slate-500 block tracking-wide">
                        🏆 Kết quả phân loại thi đua tháng {selectedStatsMonth}
                      </span>
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-600">
                          Tổng điểm dùng trong đánh giá, xếp loại đối với đồng chí <b>{currentOfficer.fullName}</b>:
                        </div>
                        <div className="font-mono text-3xl font-extrabold text-slate-800 flex items-baseline gap-1.5">
                          {totalScore.toFixed(2)}
                          <span className="text-xs text-slate-500 font-sans font-medium">điểm</span>
                        </div>
                        <div className="text-[11px] text-slate-450 italic mt-1 bg-slate-50 p-2 rounded-md border border-slate-100 font-mono">
                          Công thức: Điểm = E + KPI x 0,7 = {statsEValue} + {kpiRounded} x 0,7 = {totalScore.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Xếp loại cá nhân:</span>
                      <span className={`px-4 py-1 rounded-full font-extrabold text-xs uppercase tracking-wide border ${badgeColor}`}>
                        {classification}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            // --- ANNUAL COMPREHENSIVE KPI REPORT VIEW (selectedStatsMonth === 0) ---
            const annualData = getAnnualStatsForOfficer(currentOfficer.id, selectedStatsYear);
            
            // Annual aggregates
            let totalKpiSum = 0;
            let totalScoreSum = 0;
            annualData.forEach(row => {
              totalKpiSum += row.kpi;
              totalScoreSum += row.totalScore;
            });
            const annualAvgKpi = totalKpiSum / 12;
            const annualAvgScore = totalScoreSum / 12;

            let annualClassification = 'Không hoàn thành';
            let annualBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            if (annualAvgScore >= 90) {
              annualClassification = 'Hoàn thành Xuất sắc';
              annualBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            } else if (annualAvgScore >= 70) {
              annualClassification = 'Hoàn thành Tốt';
              annualBadgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
            } else if (annualAvgScore >= 50) {
              annualClassification = 'Hoàn thành Nhiệm vụ';
              annualBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            // Exporter for annual
            const handleExportAnnualKpiExcelLocal = () => {
              const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;

              let htmlContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style>
                  body { font-family: "Times New Roman", Times, serif; }
                  .main-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
                  .main-table th { border: 1px solid #000000; padding: 10px 6px; font-weight: bold; text-align: center; background-color: #f2f2f2; }
                  .main-table td { border: 1px solid #000000; padding: 8px 6px; text-align: center; vertical-align: middle; }
                </style>
                </head>
                <body>
                  <h2 style="text-align: center; text-transform: uppercase;">BẢNG TỔNG HỢP KPI CẢ NĂM ${selectedStatsYear}</h2>
                  <h3 style="text-align: center;">Cán bộ chiến sĩ: ${currentOfficer.position} ${currentOfficer.fullName}</h3>
                  
                  <table class="main-table" border="1" style="border-collapse: collapse; border: 1px solid black; width: 100%;">
                    <thead>
                      <tr style="background-color: #f2f2f2;">
                        <th>Tháng</th>
                        <th>Tổng điểm giao</th>
                        <th>Điểm hoàn thành</th>
                        <th>Chỉ số Số lượng (A)</th>
                        <th>Chỉ số Chất lượng (B)</th>
                        <th>Chỉ số Tiến độ (C)</th>
                        <th>Hiệu suất KPI (%)</th>
                        <th>Điểm tiêu chí (E)</th>
                        <th>Tổng điểm đánh giá</th>
                        <th>Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody>
              `;

              annualData.forEach(row => {
                htmlContent += `
                  <tr>
                    <td>Tháng ${row.month}</td>
                    <td>${row.totalAssignedScore}</td>
                    <td>${row.totalQuantityScore}</td>
                    <td>${row.A.toFixed(3)}</td>
                    <td>${row.B.toFixed(3)}</td>
                    <td>${row.C.toFixed(3)}</td>
                    <td style="font-weight: bold; color: green;">${row.kpi}%</td>
                    <td>${row.e}</td>
                    <td style="font-weight: bold; color: blue;">${row.totalScore.toFixed(2)}</td>
                    <td style="font-weight: bold;">${row.classification}</td>
                  </tr>
                `;
              });

              htmlContent += `
                  <tr style="background-color: #f9f9f9; font-weight: bold;">
                    <td>TRUNG BÌNH CẢ NĂM</td>
                    <td colspan="5"></td>
                    <td style="color: green;">${annualAvgKpi.toFixed(2)}%</td>
                    <td>30</td>
                    <td style="color: blue;">${annualAvgScore.toFixed(2)}</td>
                    <td>${annualClassification.toUpperCase()}</td>
                  </tr>
                </tbody>
                </table>

                <div style="margin-top: 25px; font-size: 11pt; line-height: 1.5;">
                  <p><b>TỔNG HỢP KẾT LUẬN CUỐI NĂM:</b></p>
                  <p>- Hiệu suất KPI bình quân năm ${selectedStatsYear}: <b>${annualAvgKpi.toFixed(2)}%</b></p>
                  <p>- Tổng điểm xếp loại bình quân năm ${selectedStatsYear}: <b>${annualAvgScore.toFixed(2)}</b></p>
                  <p>- Xếp loại cả năm: <b>${annualClassification.toUpperCase()}</b></p>
                </div>
                </body>
                </html>
              `;

              const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `KPI_CaNam_${selectedStatsYear}_${currentOfficer.fullName.replace(/\s+/g, '_')}.xls`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            const handleExportAnnualKpiWordLocal = () => {
              const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;

              let htmlContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style>
                  @page {
                    size: A4 portrait;
                    margin: 1.5cm 1.5cm 1.5cm 1.5cm;
                  }
                  body { font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.3; }
                  .header-table { width: 100%; border: none !important; margin-bottom: 25px; }
                  .header-table td { border: none !important; padding: 2px; text-align: center; font-size: 10.5pt; vertical-align: top; }
                  .title-section { text-align: center; margin-bottom: 20px; }
                  .doc-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0; }
                  .doc-subtitle { font-size: 11.5pt; font-style: italic; margin-top: 5px; margin-bottom: 0; }
                  .info-p { font-size: 11pt; font-weight: bold; margin-top: 5px; margin-bottom: 15px; text-align: center; }
                  .main-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 15px; }
                  .main-table th { border: 1px solid #000000; padding: 8px 4px; font-weight: bold; text-align: center; background-color: #f2f2f2; }
                  .main-table td { border: 1px solid #000000; padding: 7px 4px; text-align: center; vertical-align: middle; }
                  .summary-box { margin-top: 20px; border: 1px dashed #777; padding: 10px; font-size: 11pt; background-color: #fafafa; }
                  .signature-table { width: 100%; border: none !important; margin-top: 35px; }
                  .signature-table td { border: none !important; text-align: center; vertical-align: top; font-size: 11pt; width: 50%; }
                </style>
                </head>
                <body>
                  <table class="header-table">
                    <tr>
                      <td style="width: 45%;">
                        <b>CÔNG AN TỈNH TÂY NINH</b><br/>
                        <b>PHÒNG CẢNH SÁT PCCC & CNCH</b><br/>
                        <span>ĐỘI CC & CNCH KV TÂN AN</span><br/>
                        <span>*</span>
                      </td>
                      <td style="width: 55%; font-weight: bold;">
                        <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
                        <span style="font-size: 11pt;">Độc lập - Tự do - Hạnh phúc</span><br/>
                        <span>---------------</span>
                      </td>
                    </tr>
                  </table>

                  <div class="title-section">
                    <h2 class="doc-title">BẢNG TỔNG HỢP & PHÂN LOẠI KPI CẢ NĂM</h2>
                    <p class="doc-subtitle">Năm ${selectedStatsYear}</p>
                    <p class="info-p">Cán bộ chiến sĩ: ${currentOfficer.position} ${currentOfficer.fullName}</p>
                  </div>

                  <table class="main-table">
                    <thead>
                      <tr style="background-color: #f2f2f2;">
                        <th style="width: 80px;">Tháng</th>
                        <th>Tổng điểm giao</th>
                        <th>Điểm hoàn thành</th>
                        <th>Chỉ số Số lượng (A)</th>
                        <th>Chỉ số Chất lượng (B)</th>
                        <th>Chỉ số Tiến độ (C)</th>
                        <th>Hiệu suất KPI (%)</th>
                        <th>Điểm tiêu chí (E)</th>
                        <th>Tổng điểm đánh giá</th>
                        <th>Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody>
              `;

              annualData.forEach(row => {
                htmlContent += `
                  <tr>
                    <td><b>Tháng ${row.month}</b></td>
                    <td>${row.totalAssignedScore}</td>
                    <td>${row.totalQuantityScore}</td>
                    <td>${row.A.toFixed(3)}</td>
                    <td>${row.B.toFixed(3)}</td>
                    <td>${row.C.toFixed(3)}</td>
                    <td style="font-weight: bold; color: #16a34a;">${row.kpi}%</td>
                    <td>${row.e}</td>
                    <td style="font-weight: bold; color: #2563eb;">${row.totalScore.toFixed(2)}</td>
                    <td style="font-weight: bold;">${row.classification}</td>
                  </tr>
                `;
              });

              htmlContent += `
                    <tr style="background-color: #eeeeee; font-weight: bold;">
                      <td>TRUNG BÌNH</td>
                      <td colspan="5"></td>
                      <td style="color: #16a34a;">${annualAvgKpi.toFixed(2)}%</td>
                      <td>30</td>
                      <td style="color: #2563eb;">${annualAvgScore.toFixed(2)}</td>
                      <td style="text-transform: uppercase; color: #b91c1c;">${annualClassification}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="summary-box">
                  <p style="margin: 0 0 8px 0;"><b>TỔNG HỢP KẾT LUẬN CẢ NĂM ${selectedStatsYear}:</b></p>
                  <p style="margin: 0 0 8px 15px;">- Hiệu suất KPI bình quân cả năm: <b>${annualAvgKpi.toFixed(2)}%</b></p>
                  <p style="margin: 0 0 8px 15px;">- Tổng điểm đánh giá bình quân cả năm: <b>${annualAvgScore.toFixed(2)} điểm</b></p>
                  <p style="margin: 0 0 0 15px;">- Xếp loại thi đua năm ${selectedStatsYear}: <b><span style="color: #b91c1c; text-transform: uppercase;">${annualClassification.toUpperCase()}</span></b></p>
                </div>

                <table class="signature-table">
                  <tr>
                    <td>
                      <b>BAN CHỈ HUY ĐỘI PHÊ DUYỆT</b><br/>
                      <span style="font-size: 9pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
                      <div style="height: 80px;"></div>
                    </td>
                    <td>
                      <span style="font-style: italic;">${todayStrInVietnamese}</span><br/>
                      <b>CÁN BỘ LẬP BẢNG</b><br/>
                      <span style="font-size: 9pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
                      <div style="height: 80px;"></div>
                      <p style="margin: 0; font-weight: bold;">${currentOfficer.fullName}</p>
                    </td>
                  </tr>
                </table>
                </body>
                </html>
              `;

              const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `KPI_CaNam_${selectedStatsYear}_${currentOfficer.fullName.replace(/\s+/g, '_')}.doc`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="space-y-6">
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 no-print">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Chế độ xem tổng hợp:</span>
                    <button
                      onClick={() => setStatsViewMode('summary')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        statsViewMode === 'summary' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Bảng tổng hợp 12 tháng
                    </button>
                    <button
                      onClick={() => setStatsViewMode('detail')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        statsViewMode === 'detail' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Đồ thị trực quan KPI
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportAnnualKpiExcelLocal}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Xuất Excel Cả Năm
                    </button>
                    <button
                      id="export-annual-kpi-word-btn"
                      onClick={handleExportAnnualKpiWordLocal}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Xuất tổng hợp cả năm ra định dạng Microsoft Word (.doc)"
                    >
                      <FileText className="w-3.5 h-3.5" /> Xuất Word Cả Năm
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> In báo cáo năm
                    </button>
                  </div>
                </div>

                {/* print layout title */}
                <div className="hidden print:block text-center space-y-1 mb-4">
                  <div className="text-xs uppercase font-bold text-slate-500">
                    PHÒNG CẢNH SÁT PCCC VÀ CNCH - ĐỘI CHỮA CHÁY KV TÂN AN
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase">
                    BÁO CÁO TỔNG HỢP & PHÂN LOẠI KPI CẢ NĂM {selectedStatsYear}
                  </h2>
                  <div className="text-sm font-semibold text-slate-700">
                    Cán bộ chiến sĩ: {currentOfficer.position} {currentOfficer.fullName}
                  </div>
                </div>

                {/* Render either tabular or graphical view */}
                {statsViewMode === 'summary' ? (
                  /* TABULAR COMPREHENSIVE VIEW */
                  <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse font-sans text-xs min-w-[1000px]">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold border-b border-slate-300 text-center">
                          <th className="p-3 w-28 text-left pl-4">Tháng</th>
                          <th className="p-3 bg-slate-700">Tổng điểm giao</th>
                          <th className="p-3 bg-slate-700">Điểm hoàn thành</th>
                          <th className="p-3">Số lượng (A)</th>
                          <th className="p-3">Chất lượng (B)</th>
                          <th className="p-3">Tiến độ (C)</th>
                          <th className="p-3 bg-emerald-950/80">KPI (%)</th>
                          <th className="p-3">Điểm chung (E)</th>
                          <th className="p-3 bg-indigo-950/80">Tổng điểm đánh giá</th>
                          <th className="p-3">Xếp loại thi đua</th>
                        </tr>
                      </thead>
                      <tbody>
                        {annualData.map(row => (
                          <tr key={row.month} className="border-b border-slate-200 hover:bg-slate-50/50 font-medium text-center">
                            <td className="p-2.5 font-bold text-slate-700 bg-slate-50/40 text-left pl-4">Tháng {row.month}</td>
                            <td className="p-2.5 font-mono text-slate-600 bg-slate-100/10">{row.totalAssignedScore}</td>
                            <td className="p-2.5 font-mono text-slate-600 bg-slate-100/10">{row.totalQuantityScore}</td>
                            <td className="p-2.5 font-mono text-slate-800">{row.A.toFixed(3)}</td>
                            <td className="p-2.5 font-mono text-slate-800">{row.B.toFixed(3)}</td>
                            <td className="p-2.5 font-mono text-slate-800">{row.C.toFixed(3)}</td>
                            <td className="p-2.5 font-mono font-extrabold text-emerald-700 bg-emerald-50/20">{row.kpi}%</td>
                            <td className="p-2.5 font-mono text-slate-850">{row.e}</td>
                            <td className="p-2.5 font-mono font-extrabold text-indigo-700 bg-indigo-50/20">{row.totalScore.toFixed(2)}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.totalScore >= 90
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.totalScore >= 70
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : row.totalScore >= 50
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {row.totalScore >= 90 ? 'Xuất sắc' : row.totalScore >= 70 ? 'Tốt' : row.totalScore >= 50 ? 'Khá' : 'Yêu'}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Grand annual average row */}
                        <tr className="bg-slate-800 text-white font-extrabold text-center border-t border-slate-300">
                          <td className="p-3 text-left pl-4 uppercase">Bình quân cả năm:</td>
                          <td className="p-3" colSpan={5}>-</td>
                          <td className="p-3 font-mono text-emerald-300 text-sm bg-emerald-950/20">{annualAvgKpi.toFixed(2)}%</td>
                          <td className="p-3 font-mono">30</td>
                          <td className="p-3 font-mono text-indigo-300 text-sm bg-indigo-950/20">{annualAvgScore.toFixed(2)}</td>
                          <td className="p-3 text-xs uppercase tracking-wide text-amber-300">{annualClassification.replace('Hoàn thành ', '')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* GRAPHICAL KPI TREND CHART VIEW */
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase text-slate-600">📊 Biểu đồ so sánh Hiệu suất KPI (%) và Tổng điểm theo các tháng</span>
                      <div className="flex items-center gap-4 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Hiệu suất KPI (%)</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Tổng điểm xếp loại</span>
                      </div>
                    </div>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={annualData.map(row => ({
                            name: `T.${row.month}`,
                            'KPI (%)': row.kpi,
                            'Tổng điểm': parseFloat(row.totalScore.toFixed(2))
                          }))}
                          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                          <YAxis domain={[0, 110]} stroke="#64748b" fontSize={11} fontWeight="bold" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                            labelClassName="font-extrabold text-slate-800"
                          />
                          <Bar dataKey="KPI (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={35} />
                          <Bar dataKey="Tổng điểm" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={35} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Annual Classification Scoreboards card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-xs text-center flex flex-col justify-center py-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hiệu suất KPI Trung bình</div>
                    <div className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">{annualAvgKpi.toFixed(2)}%</div>
                    <p className="text-[11px] text-slate-500 font-medium">Bình quân hiệu năng công tác qua 12 tháng</p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-xs text-center flex flex-col justify-center py-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng điểm Trung bình năm</div>
                    <div className="text-4xl font-extrabold text-indigo-600 font-mono tracking-tight">{annualAvgScore.toFixed(2)}</div>
                    <p className="text-[11px] text-slate-500 font-medium">Điểm số trung bình cộng dùng xếp thi đua</p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-xs text-center flex flex-col justify-between py-6">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xếp loại cả năm</div>
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider border ${annualBadgeColor}`}>
                          {annualClassification}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-450 italic">Áp dụng cho thi đua danh hiệu chiến sĩ thi đua, chiến sĩ tiên tiến</p>
                  </div>
                </div>

                {/* Signatures simulation section for official look */}
                <div className="hidden print:block pt-12">
                  <table className="w-full text-center border-none font-sans text-sm">
                    <tbody>
                      <tr>
                        <td className="w-1/2 align-top font-bold uppercase py-4" style={{ border: 'none' }}>
                          BAN CHỈ HUY ĐỘI PHÊ DUYỆT<br/>
                          <span className="font-medium text-xs lowercase italic text-slate-400">(Ký và ghi rõ họ tên)</span>
                        </td>
                        <td className="w-1/2 align-top font-bold uppercase py-4" style={{ border: 'none' }}>
                          CÁN BỘ LẬP BẢNG<br/>
                          <span className="font-medium text-xs lowercase italic text-slate-400">(Ký và ghi rõ họ tên)</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="h-28" style={{ border: 'none' }}></td>
                        <td className="h-28" style={{ border: 'none' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }
        })()}
      </div>

          {/* Bảng tổng hợp tất cả nội dung của cán bộ theo từng tháng vào bảng theo mẫu này */}
          {/* Bảng tổng hợp tất cả nội dung của cán bộ theo từng tháng vào bảng theo mẫu này */}
          {/* Bảng tổng hợp tất cả nội dung của cán bộ theo từng tháng vào bảng theo mẫu này */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 font-sans" id="squad-monthly-kpi-summary">
            {(() => {
              if (activeOfficers.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Vui lòng khởi tạo danh sách Cán bộ Đội để xem và quản lý bảng tổng hợp nhiệm vụ tháng.
                  </div>
                );
              }

              const handleExportMonthlyKpiExcelLocal = () => {
                let html = `<html><head><meta charset="utf-8"/><style>table{border-collapse:collapse;font-family:"Times New Roman",serif;}th,td{border:1px solid #000;padding:6px;font-size:10pt;}th{background:#f2f2f2;font-weight:bold;}</style></head><body>`;
                html += `<h3 style="text-align:center;">BẢNG TỔNG HỢP KPI THÁNG ${selectedStatsMonth}/${selectedStatsYear} TOÀN ĐỘI</h3>`;
                html += `<table border="1"><thead><tr><th>STT</th><th>Đồng chí</th><th>Nội dung nhiệm vụ</th><th>Sản phẩm công việc</th><th>Điểm SP</th><th>Số lượng giao</th><th>Tổng điểm giao</th><th>SL hoàn thành</th><th>Điểm SL (A)</th><th>Chất lượng (B)</th><th>Tiến độ (C)</th><th>Điểm KPI (%)</th><th>Điểm E</th><th>Tổng điểm</th><th>Xếp loại</th></tr></thead><tbody>`;
                
                activeOfficers.forEach((off, oIdx) => {
                  const tasks = getKpiTasksForOfficer(off.id, selectedStatsYear, selectedStatsMonth);
                  const oE = officerEValues[off.id] !== undefined ? officerEValues[off.id] : 30;
                  
                  let sumAssigned = 0, sumCompletedQty = 0, sumCompletedScore = 0, sumQual = 0, sumSpeed = 0;
                  tasks.forEach(task => {
                    sumAssigned += task.assignedQty * task.scorePerProduct;
                    sumCompletedQty += task.completedQty;
                    sumCompletedScore += task.completedQty * task.scorePerProduct;
                    sumQual += task.completedQty * task.scorePerProduct * task.qualityFactor;
                    sumSpeed += task.completedQty * task.scorePerProduct * task.speedFactor;
                  });

                  const A = sumAssigned > 0 ? (sumCompletedScore / sumAssigned) : 1;
                  const B = sumAssigned > 0 ? (sumQual / sumAssigned) : 1;
                  const C = sumAssigned > 0 ? (sumSpeed / sumAssigned) : 1;

                  const kpiRounded = parseFloat((((A + B + C) / 3) * 100).toFixed(2));
                  const totalScore = oE + kpiRounded * 0.7;

                  let classification = 'Không hoàn thành';
                  if (totalScore >= 90) classification = 'Xuất sắc';
                  else if (totalScore >= 70) classification = 'Tốt';
                  else if (totalScore >= 50) classification = 'Nhiệm vụ';

                  if (tasks.length === 0) {
                    html += `<tr><td>${oIdx + 1}</td><td><b>${off.rank} ${off.fullName}</b></td><td colspan="13" style="text-align:center;color:#666;">Chưa thiết lập nhiệm vụ KPI cho tháng này</td></tr>`;
                  } else {
                    tasks.forEach((t, idx) => {
                      const rowAssigned = t.assignedQty * t.scorePerProduct;
                      const rowCompleted = t.completedQty * t.scorePerProduct;
                      const rowQuality = rowCompleted * t.qualityFactor;
                      const rowSpeed = rowCompleted * t.speedFactor;

                      const qStr = t.qualityFactor >= 1.1 ? 'Vượt mức (+10%)' : (t.qualityFactor < 1.0 ? `Thiếu sót (-${Math.round((1 - t.qualityFactor)*100)}%)` : 'Đảm bảo');
                      const sStr = t.speedFactor < 1.0 ? `Chậm (-${Math.round((1 - t.speedFactor)*100)}%)` : 'Đảm bảo';

                      html += `<tr>`;
                      if (idx === 0) {
                        html += `<td rowspan="${tasks.length}" style="vertical-align:middle;text-align:center;">${oIdx + 1}</td>`;
                        html += `<td rowspan="${tasks.length}" style="vertical-align:middle;font-weight:bold;">s${off.rank} ${off.fullName}</td>`;
                      }
                      html += `<td>${t.name}</td><td>s${t.product}</td><td style="text-align:center;">${t.scorePerProduct}</td><td style="text-align:center;">${t.assignedQty}</td><td style="text-align:center;">${rowAssigned}</td><td style="text-align:center;">${t.completedQty}</td><td style="text-align:center;">${rowCompleted}</td><td>${qStr}</td><td>${sStr}</td>`;
                      if (idx === 0) {
                        html += `<td rowspan="${tasks.length}" style="vertical-align:middle;text-align:center;font-weight:bold;background:#faf5ff;">${kpiRounded}%</td>`;
                        html += `<td rowspan="${tasks.length}" style="vertical-align:middle;text-align:center;font-weight:bold;background:#faf5ff;">${oE}</td>`;
                        html += `<td rowspan="${tasks.length}" style="vertical-align:middle;text-align:center;font-weight:bold;background:#f0fdf4;color:#166534;">${totalScore.toFixed(2)}</td>`;
                        html += `<td rowspan="${tasks.length}" style="vertical-align:middle;text-align:center;font-weight:bold;">${classification}</td>`;
                      }
                      html += `</tr>`;
                    });
                  }
                });
                
                html += `</tbody></table></body></html>`;
                const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `KPI_Tonghop_Thang_${selectedStatsMonth}_ToanDoi.xls`);
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
              };

              const handleExportMonthlyKpiWordSquadLocal = () => {
                const todayStrInVietnamese = `Tây Ninh, ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`;

                let htmlContent = `
                  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                  <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <style>
                    @page {
                      size: A4 landscape;
                      margin: 1.2cm 1.2cm 1.2cm 1.2cm;
                    }
                    body { font-family: "Times New Roman", Times, serif; font-size: 10pt; line-height: 1.3; }
                    .header-table { width: 100%; border: none !important; margin-bottom: 20px; }
                    .header-table td { border: none !important; padding: 2px; text-align: center; font-size: 10pt; vertical-align: top; }
                    .title-section { text-align: center; margin-bottom: 20px; }
                    .doc-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 0; }
                    .doc-subtitle { font-size: 11pt; font-style: italic; margin-top: 5px; margin-bottom: 0; }
                    .main-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 15px; }
                    .main-table th { border: 1px solid #000000; padding: 6px 3px; font-weight: bold; text-align: center; background-color: #f2f2f2; }
                    .main-table td { border: 1px solid #000000; padding: 5px 3px; vertical-align: middle; }
                    .signature-table { width: 100%; border: none !important; margin-top: 35px; }
                    .signature-table td { border: none !important; text-align: center; vertical-align: top; font-size: 10.5pt; width: 50%; }
                  </style>
                  </head>
                  <body>
                    <table class="header-table">
                      <tr>
                        <td style="width: 45%;">
                          <b>CÔNG AN TỈNH TÂY NINH</b><br/>
                          <b>PHÒNG CẢNH SÁT PCCC & CNCH</b><br/>
                          <span>ĐỘI CC & CNCH KV TÂN AN</span><br/>
                          <span>*</span>
                        </td>
                        <td style="width: 55%; font-weight: bold;">
                          <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
                          <span style="font-size: 10.5pt;">Độc lập - Tự do - Hạnh phúc</span><br/>
                          <span>---------------</span>
                        </td>
                      </tr>
                    </table>

                    <div class="title-section">
                      <h2 class="doc-title">BẢNG ĐÁNH GIÁ CHỈ SỐ KPI TỔNG HỢP TOÀN ĐỘI</h2>
                      <p class="doc-subtitle">Tháng ${selectedStatsMonth} năm ${selectedStatsYear}</p>
                    </div>

                    <table class="main-table" border="1">
                      <thead>
                        <tr style="background-color: #e6e6e6;">
                          <th style="width: 30px;">STT</th>
                          <th style="width: 130px;">Đồng chí</th>
                          <th>Nội dung nhiệm vụ</th>
                          <th style="width: 100px;">Sản phẩm công việc</th>
                          <th style="width: 45px;">Điểm SP</th>
                          <th style="width: 40px;">SL giao</th>
                          <th style="width: 50px;">Tổng điểm giao</th>
                          <th style="width: 40px;">SL đạt</th>
                          <th style="width: 50px;">Điểm số lượng</th>
                          <th style="width: 80px;">Chất lượng</th>
                          <th style="width: 80px;">Tiến độ</th>
                          <th style="width: 55px;">Điểm KPI</th>
                          <th style="width: 45px;">Điểm E</th>
                          <th style="width: 50px;">Tổng điểm</th>
                          <th style="width: 70px;">Xếp loại</th>
                        </tr>
                      </thead>
                      <tbody>
                `;

                activeOfficers.forEach((off, oIdx) => {
                  const tasks = getKpiTasksForOfficer(off.id, selectedStatsYear, selectedStatsMonth);
                  const oE = officerEValues[off.id] !== undefined ? officerEValues[off.id] : 30;
                  
                  let sumAssigned = 0, sumCompletedQty = 0, sumCompletedScore = 0, sumQual = 0, sumSpeed = 0;
                  tasks.forEach(task => {
                    sumAssigned += task.assignedQty * task.scorePerProduct;
                    sumCompletedQty += task.completedQty;
                    sumCompletedScore += task.completedQty * task.scorePerProduct;
                    sumQual += task.completedQty * task.scorePerProduct * task.qualityFactor;
                    sumSpeed += task.completedQty * task.scorePerProduct * task.speedFactor;
                  });

                  const A = sumAssigned > 0 ? (sumCompletedScore / sumAssigned) : 1;
                  const B = sumAssigned > 0 ? (sumQual / sumAssigned) : 1;
                  const C = sumAssigned > 0 ? (sumSpeed / sumAssigned) : 1;

                  const kpiRounded = parseFloat((((A + B + C) / 3) * 100).toFixed(2));
                  const totalScore = oE + kpiRounded * 0.7;

                  let classification = 'Không hoàn thành';
                  if (totalScore >= 90) classification = 'Xuất sắc';
                  else if (totalScore >= 70) classification = 'Tốt';
                  else if (totalScore >= 50) classification = 'Nhiệm vụ';

                  if (tasks.length === 0) {
                    htmlContent += `
                      <tr>
                        <td style="text-align: center;">${oIdx + 1}</td>
                        <td><b>${off.rank} ${off.fullName}</b></td>
                        <td colspan="13" style="text-align: center; color: #666; font-style: italic;">Chưa thiết lập nhiệm vụ KPI cho tháng này</td>
                      </tr>
                    `;
                  } else {
                    tasks.forEach((t, idx) => {
                      const rowAssigned = t.assignedQty * t.scorePerProduct;
                      const rowCompleted = t.completedQty * t.scorePerProduct;
                      
                      const qStr = t.qualityFactor >= 1.1 ? 'Vượt mức (+10%)' : (t.qualityFactor < 1.0 ? `Thiếu sót (-${Math.round((1 - t.qualityFactor)*100)}%)` : 'Đảm bảo');
                      const sStr = t.speedFactor < 1.0 ? `Chậm (-${Math.round((1 - t.speedFactor)*100)}%)` : 'Đảm bảo';

                      htmlContent += `<tr>`;
                      if (idx === 0) {
                        htmlContent += `<td rowspan="${tasks.length}" style="vertical-align: middle; text-align: center;">${oIdx + 1}</td>`;
                        htmlContent += `<td rowspan="${tasks.length}" style="vertical-align: middle; font-weight: bold;">${off.rank} ${off.fullName}</td>`;
                      }
                      htmlContent += `
                        <td>${t.name}</td>
                        <td>${t.product}</td>
                        <td style="text-align: center;">${t.scorePerProduct}</td>
                        <td style="text-align: center;">${t.assignedQty}</td>
                        <td style="text-align: center;">${rowAssigned}</td>
                        <td style="text-align: center;">${t.completedQty}</td>
                        <td style="text-align: center;">${rowCompleted}</td>
                        <td>${qStr}</td>
                        <td>${sStr}</td>
                      `;
                      if (idx === 0) {
                        htmlContent += `
                          <td rowspan="${tasks.length}" style="vertical-align: middle; text-align: center; font-weight: bold; background-color: #faf5ff;">${kpiRounded}%</td>
                          <td rowspan="${tasks.length}" style="vertical-align: middle; text-align: center; font-weight: bold; background-color: #faf5ff;">${oE}</td>
                          <td rowspan="${tasks.length}" style="vertical-align: middle; text-align: center; font-weight: bold; background-color: #f0fdf4; color: #166534;">${totalScore.toFixed(2)}</td>
                          <td rowspan="${tasks.length}" style="vertical-align: middle; text-align: center; font-weight: bold;">${classification}</td>
                        `;
                      }
                      htmlContent += `</tr>`;
                    });
                  }
                });

                htmlContent += `
                    </tbody>
                  </table>

                  <table class="signature-table">
                    <tr>
                      <td>
                        <b>BAN CHỈ HUY ĐỘI</b><br/>
                        <span style="font-size: 8.5pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
                        <div style="height: 75px;"></div>
                      </td>
                      <td>
                        <span style="font-style: italic;">${todayStrInVietnamese}</span><br/>
                        <b>NGƯỜI TỔNG HỢP</b><br/>
                        <span style="font-size: 8.5pt; font-style: italic;">(Ký, ghi rõ họ tên)</span>
                        <div style="height: 75px;"></div>
                      </td>
                    </tr>
                  </table>
                  </body>
                  </html>
                `;

                const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `KPI_Tonghop_Thang_${selectedStatsMonth}_ToanDoi.doc`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              };

              return (
                <div className="space-y-6">
                  {/* Tools Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3 no-print">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg shadow-3xs">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">Tháng thống kê:</span>
                        <select
                          value={selectedStatsMonth}
                          onChange={(e) => setSelectedStatsMonth(parseInt(e.target.value))}
                          className="text-xs font-extrabold text-slate-700 bg-transparent border-none cursor-pointer p-0 focus:ring-0"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>Tháng {m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportMonthlyKpiExcelLocal}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Xuất Excel Tổng Hợp (XLS)
                      </button>
                      <button
                        id="export-squad-monthly-kpi-word-btn"
                        onClick={handleExportMonthlyKpiWordSquadLocal}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs"
                        title="Xuất bảng tổng hợp toàn đội ra định dạng Microsoft Word (.doc)"
                      >
                        <FileText className="w-3.5 h-3.5" /> Xuất Word Tổng Hợp (DOC)
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> In Tổng Hợp
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-300 p-5 rounded-xl bg-white space-y-4">
                    <h2 className="text-center text-sm font-extrabold text-slate-900 uppercase tracking-tight my-2">
                      BẢNG ĐÁNH GIÁ CHỈ SỐ KPI TỔNG HỢP TOÀN ĐỘI THÁNG {selectedStatsMonth}/{selectedStatsYear}
                    </h2>

                    <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-3xs">
                      <table className="w-full text-left border-collapse font-sans text-[11px] min-w-[1500px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-400 text-center uppercase text-[10px]">
                            <th className="p-2 border border-slate-300 w-12" rowSpan={2}>TT</th>
                            <th className="p-2 border border-slate-300 w-48" rowSpan={2}>Đồng chí</th>
                            <th className="p-2 border border-slate-300 w-64" rowSpan={2}>Nội dung nhiệm vụ</th>
                            <th className="p-2 border border-slate-300 w-32" rowSpan={2}>Sản phẩm công việc</th>
                            <th className="p-2 border border-slate-300 bg-slate-250 w-64" colSpan={3}>Giao nhiệm vụ</th>
                            <th className="p-2 border border-slate-300 bg-emerald-50/40" colSpan={8}>Đánh giá</th>
                            <th className="p-2 border border-slate-300 bg-purple-50/30 w-96" colSpan={4}>Xếp loại & KPI</th>
                            <th className="p-2 border border-slate-300 w-28" rowSpan={2}>Ghi chú</th>
                            <th className="p-2 border border-slate-300 w-16 no-print" rowSpan={2}>Xóa</th>
                          </tr>
                          <tr className="bg-slate-55 text-slate-700 font-bold border-b border-slate-300 text-center text-[9px]">
                            <th className="p-1 border border-slate-300">Điểm SP</th>
                            <th className="p-1 border border-slate-300 w-14">SL giao</th>
                            <th className="p-1 border border-slate-300 w-20">Tổng điểm giao</th>
                            <th className="p-1 border border-slate-300 w-14">SL đạt</th>
                            <th className="p-1 border border-slate-300 w-20">Điểm số lượng</th>
                            <th className="p-1 border border-slate-300 w-24">Vượt mức B</th>
                            <th className="p-1 border border-slate-300 w-24">Thiếu sót B</th>
                            <th className="p-1 border border-slate-300 w-20">Điểm Chất lượng</th>
                            <th className="p-1 border border-slate-300 w-24">Đảm bảo C</th>
                            <th className="p-1 border border-slate-300 w-24">Chậm trễ C</th>
                            <th className="p-1 border border-slate-300 w-20">Điểm Tiến độ</th>
                            <th className="p-1 border border-slate-300 w-24 bg-purple-50/20">KPI (%)</th>
                            <th className="p-1 border border-slate-300 w-24 bg-purple-50/20">Điểm E</th>
                            <th className="p-1 border border-slate-300 w-24 bg-purple-50/20">Tổng điểm</th>
                            <th className="p-1 border border-slate-300 w-28 bg-purple-50/20">Xếp loại</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeOfficers.map((officer, oIdx) => {
                            const tasks = getKpiTasksForOfficer(officer.id, selectedStatsYear, selectedStatsMonth);
                            const oE = officerEValues[officer.id] !== undefined ? officerEValues[officer.id] : 30;

                            let sumAssigned = 0, sumCompletedQty = 0, sumCompletedScore = 0, sumQual = 0, sumSpeed = 0;
                            tasks.forEach(task => {
                              sumAssigned += task.assignedQty * task.scorePerProduct;
                              sumCompletedQty += task.completedQty;
                              sumCompletedScore += task.completedQty * task.scorePerProduct;
                              sumQual += task.completedQty * task.scorePerProduct * task.qualityFactor;
                              sumSpeed += task.completedQty * task.scorePerProduct * task.speedFactor;
                            });

                            const A = sumAssigned > 0 ? (sumCompletedScore / sumAssigned) : 1;
                            const B = sumAssigned > 0 ? (sumQual / sumAssigned) : 1;
                            const C = sumAssigned > 0 ? (sumSpeed / sumAssigned) : 1;

                            const kpiRounded = parseFloat((((A + B + C) / 3) * 100).toFixed(2));
                            const totalScore = oE + kpiRounded * 0.7;

                            let classification = 'Không hoàn thành';
                            let badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                            if (totalScore >= 90) {
                              classification = 'Hoàn thành Xuất sắc';
                              badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                            } else if (totalScore >= 70) {
                              classification = 'Hoàn thành Tốt';
                              badgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                            } else if (totalScore >= 50) {
                              classification = 'Hoàn thành Nhiệm vụ';
                              badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                            }

                            const groupRowSpan = tasks.length > 0 ? tasks.length + 1 : 1;

                            if (tasks.length === 0) {
                              return (
                                <tr key={officer.id} className="border-b border-slate-300 hover:bg-slate-50/40">
                                  <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-500 align-middle">
                                    {oIdx + 1}
                                  </td>
                                  <td className="p-2 border border-slate-300 bg-slate-50/50 font-semibold text-slate-900 align-middle">
                                    <div className="space-y-1.5">
                                      <div className="font-bold text-slate-900 leading-tight">{officer.rank} {officer.fullName}</div>
                                      <div className="text-[10px] text-slate-500 leading-tight font-medium">{officer.position}</div>
                                      <div className="flex flex-col gap-1 pt-1 no-print">
                                        <button
                                          onClick={() => handleAddStatsTask(officer.id, selectedStatsYear, selectedStatsMonth)}
                                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold flex items-center justify-center gap-0.5 transition-colors cursor-pointer shadow-3xs"
                                        >
                                          <Plus className="w-2.5 h-2.5" /> Thêm nhiệm vụ
                                        </button>
                                        <button
                                          onClick={() => handleResetStatsTasks(officer.id, selectedStatsYear, selectedStatsMonth)}
                                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                                        >
                                          <RefreshCw className="w-2.5 h-2.5" /> Khởi tạo mẫu
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 border border-slate-300 text-center text-slate-400 italic font-medium align-middle bg-slate-50/20" colSpan={13}>
                                    Chưa thiết lập nhiệm vụ cho cán bộ này. Hãy nhấn "Thêm nhiệm vụ" hoặc "Khởi tạo mẫu" để bắt đầu.
                                  </td>
                                  <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-400 bg-rose-55/10 align-middle">
                                    0.00%
                                  </td>
                                  <td className="p-2 border border-slate-300 text-center align-middle">
                                    <div className="flex flex-col items-center gap-1.5 justify-center">
                                      <input
                                        type="number" min={0} max={30} value={oE}
                                        onChange={(e) => setOfficerEValues({...officerEValues, [officer.id]: parseInt(e.target.value) || 0})}
                                        className="w-10 text-center font-mono font-bold border border-slate-300 rounded p-0.5 text-[10px] bg-white focus:ring-1 focus:ring-red-500"
                                      />
                                      <input
                                        type="range" min={0} max={30} value={oE}
                                        onChange={(e) => setOfficerEValues({...officerEValues, [officer.id]: parseInt(e.target.value)})}
                                        className="w-12 accent-red-650 cursor-pointer no-print"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-2 border border-slate-300 text-center font-mono font-bold text-emerald-800 bg-emerald-50/10 align-middle">
                                    {totalScore.toFixed(2)}
                                  </td>
                                  <td className="p-2 border border-slate-300 text-center align-middle">
                                    <span className={`inline-block px-1.5 py-1 text-[9px] font-black rounded-md border text-center whitespace-normal leading-tight w-24 ${badgeClass}`}>
                                      {classification}
                                    </span>
                                  </td>
                                  <td className="p-2 border border-slate-300"></td>
                                  <td className="p-2 border border-slate-300 text-center no-print">-</td>
                                </tr>
                              );
                            }

                            return (
                              <React.Fragment key={officer.id}>
                                {tasks.map((task, idx) => {
                                  const rowAssigned = task.assignedQty * task.scorePerProduct;
                                  const rowCompleted = task.completedQty * task.scorePerProduct;
                                  const rowQuality = rowCompleted * task.qualityFactor;
                                  const rowSpeed = rowCompleted * task.speedFactor;

                                  return (
                                    <tr key={task.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                      {idx === 0 && (
                                        <>
                                          <td rowSpan={groupRowSpan} className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-500 align-middle">
                                            {oIdx + 1}
                                          </td>
                                          <td rowSpan={groupRowSpan} className="p-2 border border-slate-300 font-semibold text-slate-900 align-middle bg-slate-50/40">
                                            <div className="space-y-1.5">
                                              <div className="font-bold text-slate-900 leading-tight">{officer.rank} {officer.fullName}</div>
                                              <div className="text-[10px] text-slate-500 leading-tight font-medium">{officer.position}</div>
                                              <div className="flex flex-col gap-1 pt-1 no-print">
                                                <button
                                                  onClick={() => handleAddStatsTask(officer.id, selectedStatsYear, selectedStatsMonth)}
                                                  className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[9px] font-bold flex items-center justify-center gap-0.5 transition-colors cursor-pointer shadow-3xs"
                                                >
                                                  <Plus className="w-2.5 h-2.5" /> Thêm nhiệm vụ
                                                </button>
                                                <button
                                                  onClick={() => handleResetStatsTasks(officer.id, selectedStatsYear, selectedStatsMonth)}
                                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                                                >
                                                  <RefreshCw className="w-2.5 h-2.5" /> Khởi tạo mẫu
                                                </button>
                                              </div>
                                            </div>
                                          </td>
                                        </>
                                      )}

                                      <td className="p-1 border border-slate-300">
                                        <input
                                          type="text"
                                          value={task.name}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'name', e.target.value)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-semibold text-slate-850"
                                        />
                                      </td>
                                      <td className="p-1 border border-slate-300">
                                        <input
                                          type="text"
                                          value={task.product}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'product', e.target.value)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-bold text-slate-650 text-xs"
                                        />
                                      </td>
                                      <td className="p-1 border border-slate-300 bg-slate-50/20">
                                        <input
                                          type="number"
                                          value={task.scorePerProduct}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'scorePerProduct', parseInt(e.target.value) || 0)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono font-extrabold text-slate-855"
                                        />
                                      </td>
                                      <td className="p-1 border border-slate-300 bg-slate-50/20">
                                        <input
                                          type="number"
                                          value={task.assignedQty}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'assignedQty', parseInt(e.target.value) || 1)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono font-extrabold text-blue-800"
                                        />
                                      </td>
                                      <td className="p-2 border border-slate-300 text-center font-mono font-bold bg-slate-100/10">{rowAssigned}</td>
                                      <td className="p-1 border border-slate-300 bg-emerald-50/5">
                                        <input
                                          type="number"
                                          value={task.completedQty}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'completedQty', parseInt(e.target.value) || 0)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-center font-mono font-extrabold text-emerald-800"
                                        />
                                      </td>
                                      <td className="p-2 border border-slate-300 text-center font-mono font-bold bg-emerald-50/10 text-emerald-900">{rowCompleted}</td>
                                      <td className="p-1 border border-slate-300 text-center bg-emerald-50/5">
                                        <select
                                          value={task.qualityFactor >= 1.0 ? task.qualityFactor : 1.0}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'qualityFactor', parseFloat(e.target.value))}
                                          className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold bg-white cursor-pointer focus:outline-hidden"
                                        >
                                          <option value={1.1}>Vượt mức (+10%)</option>
                                          <option value={1.0}>Đảm bảo</option>
                                        </select>
                                      </td>
                                      <td className="p-1 border border-slate-300 text-center bg-emerald-50/5">
                                        <select
                                          value={task.qualityFactor < 1.0 ? task.qualityFactor : 1.0}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'qualityFactor', parseFloat(e.target.value))}
                                          className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold bg-white cursor-pointer focus:outline-hidden"
                                        >
                                          <option value={1.0}>Không lỗi</option>
                                          <option value={0.75}>Lỗi 1 lần (-25%)</option>
                                          <option value={0.5}>Lỗi 2 lần (-50%)</option>
                                          <option value={0.0}>Không đạt</option>
                                        </select>
                                      </td>
                                      <td className="p-2 border border-slate-300 text-center font-mono font-bold text-teal-800 bg-teal-50/5">{rowQuality.toFixed(1)}</td>
                                      <td className="p-1 border border-slate-300 text-center bg-emerald-50/5">
                                        <select
                                          value={task.speedFactor >= 1.0 ? task.speedFactor : 1.0}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'speedFactor', parseFloat(e.target.value))}
                                          className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold bg-white cursor-pointer focus:outline-hidden"
                                        >
                                          <option value={1.0}>Kịp thời</option>
                                        </select>
                                      </td>
                                      <td className="p-1 border border-slate-300 text-center bg-emerald-50/5">
                                        <select
                                          value={task.speedFactor < 1.0 ? task.speedFactor : 1.0}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'speedFactor', parseFloat(e.target.value))}
                                          className="text-[10px] p-0.5 border border-slate-200 rounded-sm font-semibold bg-white cursor-pointer focus:outline-hidden"
                                        >
                                          <option value={1.0}>Không trễ</option>
                                          <option value={0.75}>Chậm 1 lần (-25%)</option>
                                          <option value={0.5}>Chậm 2 lần (-50%)</option>
                                          <option value={0.0}>Trễ hạn</option>
                                        </select>
                                      </td>
                                      <td className="p-2 border border-slate-300 text-center font-mono font-bold text-indigo-800 bg-indigo-50/5">{rowSpeed.toFixed(1)}</td>

                                      {idx === 0 && (
                                        <>
                                          <td rowSpan={groupRowSpan} className="p-2 border border-slate-300 text-center font-mono font-bold text-purple-800 bg-purple-50/20 align-middle">
                                            <div className="space-y-0.5">
                                              <div className="text-sm font-extrabold text-purple-950">{kpiRounded}%</div>
                                              <div className="text-[9px] text-slate-500 font-medium space-y-0.5">
                                                <div>A = {A === 1 ? '1.0' : A.toFixed(3)}</div>
                                                <div>B = {B.toFixed(3)}</div>
                                                <div>C = {C === 1 ? '1.0' : C.toFixed(3)}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td rowSpan={groupRowSpan} className="p-2 border border-slate-300 text-center align-middle bg-slate-50/10">
                                            <div className="flex flex-col items-center gap-1.5 justify-center">
                                              <input
                                                type="number" min={0} max={30} value={oE}
                                                onChange={(e) => setOfficerEValues({...officerEValues, [officer.id]: parseInt(e.target.value) || 0})}
                                                className="w-10 text-center font-mono font-bold border border-slate-300 rounded p-0.5 text-[10px] bg-white focus:ring-1 focus:ring-red-500"
                                              />
                                              <input
                                                type="range" min={0} max={30} value={oE}
                                                onChange={(e) => setOfficerEValues({...officerEValues, [officer.id]: parseInt(e.target.value)})}
                                                className="w-12 accent-red-650 cursor-pointer no-print"
                                              />
                                            </div>
                                          </td>
                                          <td rowSpan={groupRowSpan} className="p-2 border border-slate-300 text-center font-mono font-bold text-emerald-800 bg-emerald-50/25 align-middle">
                                            <div className="text-xs font-black text-emerald-950">{totalScore.toFixed(2)}</div>
                                            <div className="text-[8px] text-slate-400 font-medium">E + KPIx0.7</div>
                                          </td>
                                          <td rowSpan={groupRowSpan} className="p-2 border border-slate-300 text-center align-middle">
                                            <span className={`inline-block px-1.5 py-1 text-[9px] font-black rounded-md border text-center whitespace-normal leading-tight w-24 ${badgeClass}`}>
                                              {classification}
                                            </span>
                                          </td>
                                        </>
                                      )}

                                      <td className="p-1 border border-slate-300">
                                        <input
                                          type="text"
                                          value={task.notes || ''}
                                          onChange={(e) => handleUpdateTaskField(officer.id, selectedStatsYear, selectedStatsMonth, task.id, 'notes', e.target.value)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-700 text-center text-xs"
                                          placeholder="Ghi chú..."
                                        />
                                      </td>
                                      <td className="p-2 border border-slate-300 text-center no-print">
                                        <button
                                          onClick={() => handleDeleteStatsTask(officer.id, selectedStatsYear, selectedStatsMonth, task.id)}
                                          className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}

                                <tr className="bg-slate-100/55 border-t border-b border-slate-300 font-extrabold text-slate-900 text-center text-[10px]">
                                  <td className="p-2 font-bold text-right text-slate-700 bg-slate-50/30" colSpan={2}>CỘNG:</td>
                                  <td className="p-2 border border-slate-300 bg-slate-100/10">-</td>
                                  <td className="p-2 border border-slate-300 bg-slate-100/10">-</td>
                                  <td className="p-2 border border-slate-300 font-mono text-slate-900 bg-slate-100">{sumAssigned}</td>
                                  <td className="p-2 border border-slate-300 font-mono text-emerald-800 bg-emerald-50/30">{sumCompletedQty}</td>
                                  <td className="p-2 border border-slate-300 font-mono text-emerald-950 bg-emerald-100">{sumCompletedScore}</td>
                                  <td className="p-2 border border-slate-300 bg-slate-100/10" colSpan={2}>-</td>
                                  <td className="p-2 border border-slate-300 font-mono text-teal-950 bg-teal-100">{sumQual.toFixed(1)}</td>
                                  <td className="p-2 border border-slate-300 bg-slate-100/10" colSpan={2}>-</td>
                                  <td className="p-2 border border-slate-300 font-mono text-indigo-950 bg-indigo-100">{sumSpeed.toFixed(1)}</td>
                                  <td className="p-2 border border-slate-300 bg-slate-100/10">-</td>
                                  <td className="p-2 border border-slate-300 no-print bg-slate-100/10"></td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 no-print">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">🏆 Quy chuẩn phân loại thi đua theo Hướng dẫn số 20-HD/ĐUCA</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[9px] text-slate-600 font-bold uppercase">
                        <div className="text-center p-1.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">Xuất sắc: &gt;= 90 điểm</div>
                        <div className="text-center p-1.5 bg-indigo-50 text-indigo-800 rounded border border-indigo-100">Tốt / Khá: 70 - 89.99 điểm</div>
                        <div className="text-center p-1.5 bg-amber-50 text-amber-800 rounded border border-amber-100">Đạt yêu cầu: 50 - 69.99 điểm</div>
                        <div className="text-center p-1.5 bg-rose-50 text-rose-850 rounded border border-rose-100">Không hoàn thành: &lt; 50 điểm</div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>

    </div>
  )}
</div>
);
}
