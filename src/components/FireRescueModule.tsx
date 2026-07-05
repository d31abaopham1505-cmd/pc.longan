import { useState, useMemo } from 'react';
import { PCCCStoreType } from '../lib/store';
import { FireProtectionPlan, FireEquipment } from '../types';
import { 
  ShieldAlert, Sparkles, Plus, Trash2, Edit2, Wrench, Search, 
  Settings, FileDown, CalendarDays, CheckCircle2, AlertCircle, X, CheckSquare, RotateCcw,
  RefreshCw, Building2
} from 'lucide-react';

interface FireRescueProps {
  store: PCCCStoreType;
}

export default function FireRescueModule({ store }: FireRescueProps) {
  const { plans, setPlans, equipment, setEquipment, facilities } = store;

  // Tabs inside Rescue module
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'equipment' | 'drafting'>('plans');

  // Draft Scenario States
  const [drafts, setDrafts] = useState<any[]>(() => {
    const cached = localStorage.getItem('pccc_scenario_drafts');
    return cached ? JSON.parse(cached) : [
      {
        id: "SD_001",
        title: "Phương án giả định cháy nổ xe điện tại hầm chung cư T&T",
        facilityId: "FAC_001",
        address: "Số 120 Vĩnh Hưng, Hoàng Mai, Hà Nội",
        planNumber: "12/PA-PCCC",
        approvalDate: "2026-05-12",
        revisionDate: "2026-06-15",
        revisionAuthor: "Đại úy Nguyễn Trung Đức",
        planType: "Phương án chữa cháy, cứu nạn, cứu hộ của cơ quan Công an (Mẫu số PC08)",
        fireSource: "Khu vực sạc xe máy điện tại tầng hầm B1",
        dangerLevel: "Cao (Nhóm I)",
        forcesMobilized: "3 xe chữa cháy, 2 xe CNCH, 25 chiến sĩ, 1 tổ y tế phường",
        tactics: "Triển khai hệ thống thông gió hầm, dùng bọt foam chữa cháy dập tắt pin lithium, kết hợp kìm thủy lực phá dỡ thoát khói.",
        steps: [
          { desc: "Báo động khẩn cấp toàn đội, xuất 2 xe chữa cháy 1 xe CNCH", done: true },
          { desc: "Ngắt toàn bộ nguồn điện trạm sạc hầm B1", done: true },
          { desc: "Hướng dẫn hướng thoát nạn qua lối cầu bọc bộ mặt đất", done: true },
          { desc: "Triển khai lăng phun bọt chặn cháy lan sang hàng xe lân cận", done: false },
          { desc: "Thông khói và cứu hộ 3 nạn nhân bị ngạt khói", done: false }
        ],
        createdBy: "Đại úy Nguyễn Trung Đức",
        updatedAt: "2026-06-15 09:30"
      },
      {
        id: "SD_002",
        title: "Phương án cứu nạn sự cố mắc kẹt thang máy tại Tòa nhà Viễn thông",
        facilityId: "FAC_002",
        address: "Số 88 Láng Hạ, Đống Đa, Hà Nội",
        planNumber: "88/PA-CNCH",
        approvalDate: "2026-06-01",
        revisionDate: "2026-06-14",
        revisionAuthor: "Thượng tá Hoàng Minh Hải",
        planType: "Phương án cứu nạn, cứu hộ của cơ quan Công an (Mẫu số PC09)",
        fireSource: "Mất điện đột ngột gây kẹt cabin tầng 5 cháy nổ phòng kỹ thuật",
        dangerLevel: "Trung bình",
        forcesMobilized: "1 xe CNCH, 8 chiến sĩ, 1 kíp thợ bảo trì thang máy",
        tactics: "Sử dụng khóa mở cabin khẩn cấp, đưa cáng cứu thương tiếp cận từ giếng thang.",
        steps: [
          { desc: "Tiếp cận hiện trường, thiết lập đàm thoại trấn an người bị kẹt", done: true },
          { desc: "Sử dụng thiết bị tời cáp và kìm thủy lực kích nâng cabin phòng ngừa tụt dốc", done: true },
          { desc: "Mở cửa phòng thang tầng gần nhất để đưa khí tươi", done: true },
          { desc: "Di chuyển 4 hành khách ra ngoài an toàn", done: false }
        ],
        createdBy: "Thượng tá Hoàng Minh Hải",
        updatedAt: "2026-06-14 15:45"
      }
    ];
  });

  // Keep saved state synchronized
  useState(() => {
    // Make sure we're in sync
    const cached = localStorage.getItem('pccc_scenario_drafts');
    if (!cached) {
      localStorage.setItem('pccc_scenario_drafts', JSON.stringify(drafts));
    }
  });

  const saveDraftsToStorage = (updated: any[]) => {
    setDrafts(updated);
    localStorage.setItem('pccc_scenario_drafts', JSON.stringify(updated));
  };

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu phương án cứu hộ cứu nạn...');
      setTimeout(() => {
        localStorage.setItem('pccc_scenario_drafts', JSON.stringify(drafts));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ phương án thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  // Statistical data for building firefighting plans
  const statsByType = useMemo(() => {
    const categoryGroupMap: Record<string, {
      total: number;
      hasPlan: number;
      noPlan: number;
      facilityNamesWithPlan: string[];
      facilityNamesWithoutPlan: string[];
    }> = {};

    facilities.forEach(fac => {
      const cat = fac.category || 'Chưa phân loại';
      if (!categoryGroupMap[cat]) {
        categoryGroupMap[cat] = {
          total: 0,
          hasPlan: 0,
          noPlan: 0,
          facilityNamesWithPlan: [],
          facilityNamesWithoutPlan: []
        };
      }
      
      const hasPlanForFac = 
        plans.some(p => p.facilityId === fac.id) || 
        drafts.some(d => d.facilityId === fac.id);

      categoryGroupMap[cat].total++;
      if (hasPlanForFac) {
        categoryGroupMap[cat].hasPlan++;
        categoryGroupMap[cat].facilityNamesWithPlan.push(fac.name);
      } else {
        categoryGroupMap[cat].noPlan++;
        categoryGroupMap[cat].facilityNamesWithoutPlan.push(fac.name);
      }
    });

    return Object.entries(categoryGroupMap).map(([category, data]) => ({
      category,
      ...data,
      percent: data.total > 0 ? Math.round((data.hasPlan / data.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [facilities, plans, drafts]);

  // Search in Drafting
  const [draftSearch, setDraftSearch] = useState('');
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [draftOfficerFilter, setDraftOfficerFilter] = useState('');
  const [draftPlanTypeFilter, setDraftPlanTypeFilter] = useState('');

  // Delete confirmation states to bypass iframe confirm dialog limits and look amazing!
  const [deleteConfirmDraftId, setDeleteConfirmDraftId] = useState<string | null>(null);
  const [deleteConfirmPlanId, setDeleteConfirmPlanId] = useState<string | null>(null);
  const [deleteConfirmEqId, setDeleteConfirmEqId] = useState<string | null>(null);

  // Form states for Drafting
  const [editingDraft, setEditingDraft] = useState<any | null>(null);
  const [isAddingDraft, setIsAddingDraft] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftFacilityId, setDraftFacilityId] = useState('');
  const [draftAddress, setDraftAddress] = useState('');
  const [draftPlanNumber, setDraftPlanNumber] = useState('');
  const [draftApprovalDate, setDraftApprovalDate] = useState('');
  const [draftRevisionDate, setDraftRevisionDate] = useState('');
  const [draftRevisionAuthor, setDraftRevisionAuthor] = useState('');
  const [draftPlanType, setDraftPlanType] = useState('Phương án chữa cháy, cứu nạn, cứu hộ của phương tiện giao thông (Mẫu số PC07)');
  const [draftSource, setDraftSource] = useState('');
  const [draftDanger, setDraftDanger] = useState('Cao (Nhóm I)');
  const [draftForces, setDraftForces] = useState('');
  const [draftTactics, setDraftTactics] = useState('');
  const [draftStepText, setDraftStepText] = useState('');
  const [draftStepsList, setDraftStepsList] = useState<{desc: string, done: boolean}[]>([]);
  const [draftAuthor, setDraftAuthor] = useState('Nguyễn Trung Đức');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftSaveSuccess, setDraftSaveSuccess] = useState(false);

  // Draft operations
  const handleOpenAddDraft = () => {
    setEditingDraft(null);
    setDraftTitle('');
    setDraftFacilityId('');
    setDraftAddress('');
    setDraftPlanNumber('');
    setDraftApprovalDate('');
    setDraftRevisionDate('');
    setDraftRevisionAuthor('');
    setDraftPlanType('Phương án chữa cháy, cứu nạn, cứu hộ của phương tiện giao thông (Mẫu số PC07)');
    setDraftSource('');
    setDraftDanger('Cao (Nhóm I)');
    setDraftForces('');
    setDraftTactics('');
    setDraftStepText('');
    setDraftStepsList([]);
    setDraftAuthor('');
    setDraftNotes('');
    setDraftSaveSuccess(false);
    setIsAddingDraft(true);
  };

  const handleOpenEditDraft = (draft: any) => {
    setEditingDraft(draft);
    setDraftTitle(draft.title);
    setDraftFacilityId(draft.facilityId);
    setDraftAddress(draft.address || '');
    setDraftPlanNumber(draft.planNumber || '');
    setDraftApprovalDate(draft.approvalDate || '');
    setDraftRevisionDate(draft.revisionDate || '');
    setDraftRevisionAuthor(draft.revisionAuthor || '');
    setDraftPlanType(draft.planType || 'Phương án chữa cháy, cứu nạn, cứu hộ của phương tiện giao thông (Mẫu số PC07)');
    setDraftSource(draft.fireSource);
    setDraftDanger(draft.dangerLevel);
    setDraftForces(draft.forcesMobilized);
    setDraftTactics(draft.tactics);
    setDraftStepText('');
    setDraftStepsList(draft.steps || []);
    setDraftAuthor(draft.createdBy || 'Cán bộ phụ trách');
    setDraftNotes(draft.notes || '');
    setDraftSaveSuccess(false);
    setIsAddingDraft(false);
  };

  const handleSaveDraft = (e: any) => {
    e.preventDefault();
    if (!draftTitle.trim()) return alert('Vui lòng điền tên phương án giả định');

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const body = {
      title: draftTitle,
      facilityId: draftFacilityId,
      address: draftAddress,
      planNumber: draftPlanNumber,
      approvalDate: draftApprovalDate,
      revisionDate: draftRevisionDate,
      revisionAuthor: draftRevisionAuthor,
      planType: draftPlanType,
      fireSource: draftSource,
      dangerLevel: draftDanger,
      forcesMobilized: draftForces,
      tactics: draftTactics,
      steps: draftStepsList,
      createdBy: draftAuthor,
      notes: draftNotes,
      updatedAt: nowStr
    };

    let updatedList;
    if (isAddingDraft) {
      updatedList = [...drafts, { id: `SD_${Date.now()}`, ...body }];
    } else if (editingDraft) {
      updatedList = drafts.map(d => d.id === editingDraft.id ? { ...d, ...body } : d);
    } else {
      return;
    }

    saveDraftsToStorage(updatedList);
    setDraftSaveSuccess(true);
    setTimeout(() => {
      setDraftSaveSuccess(false);
      setEditingDraft(null);
      setIsAddingDraft(false);
    }, 1500);
  };

  const handleDeleteDraft = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phương án tác chiến giả định này: ${title}?`)) {
      const updatedList = drafts.filter(d => d.id !== id);
      saveDraftsToStorage(updatedList);
    }
  };

  const handleDeleteStep = (draftId: string, stepIndex: number) => {
    const updatedList = drafts.map(d => {
      if (d.id === draftId) {
        const nextSteps = (d.steps || []).filter((_, i) => i !== stepIndex);
        return { ...d, steps: nextSteps };
      }
      return d;
    });
    saveDraftsToStorage(updatedList);
  };

  const handleToggleStep = (draftId: string, stepIndex: number) => {
    const updatedList = drafts.map(d => {
      if (d.id === draftId) {
        const nextSteps = [...(d.steps || [])];
        if (nextSteps[stepIndex]) {
          nextSteps[stepIndex] = { ...nextSteps[stepIndex], done: !nextSteps[stepIndex].done };
        }
        return { ...d, steps: nextSteps };
      }
      return d;
    });
    saveDraftsToStorage(updatedList);
  };

  const handleAddStepToForm = () => {
    if (!draftStepText.trim()) return;
    setDraftStepsList([...draftStepsList, { desc: draftStepText.trim(), done: false }]);
    setDraftStepText('');
  };

  const handleRemoveStepFromForm = (index: number) => {
    setDraftStepsList(draftStepsList.filter((_, i) => i !== index));
  };

  // Search & Filters
  const [planSearch, setPlanSearch] = useState('');
  const [planFromDate, setPlanFromDate] = useState('');
  const [planToDate, setPlanToDate] = useState('');
  const [eqSearch, setEqSearch] = useState('');
  const [eqCategory, setEqCategory] = useState('All');

  // Form Plans states
  const [editingPlan, setEditingPlan] = useState<FireProtectionPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  const [planName, setPlanName] = useState('');
  const [planFacilityId, setPlanFacilityId] = useState('');
  const [planCreatedDate, setPlanCreatedDate] = useState('2026-06-13');
  const [planApprovedDate, setPlanApprovedDate] = useState('2026-06-13');
  const [planRehearsalDate, setPlanRehearsalDate] = useState('');
  const [planParticipants, setPlanParticipants] = useState('');
  const [planEvaluation, setPlanEvaluation] = useState('');
  const [planAddress, setPlanAddress] = useState('');
  const [planCommander, setPlanCommander] = useState('');
  const [planVehiclesCount, setPlanVehiclesCount] = useState<number | ''>('');
  const [planPersonnelCount, setPlanPersonnelCount] = useState<number | ''>('');

  // Form Equipment states
  const [editingEq, setEditingEq] = useState<FireEquipment | null>(null);
  const [isAddingEq, setIsAddingEq] = useState(false);

  const [eqName, setEqName] = useState('');
  const [eqCat, setEqCat] = useState<'Phương tiện chữa cháy' | 'Thiết bị CNCH' | 'Thiết bị bảo hộ' | 'Khác'>('Phương tiện chữa cháy');
  const [eqQty, setEqQty] = useState(1);
  const [eqStatus, setEqStatus] = useState<'Tốt' | 'Cần sửa chữa' | 'Đang bảo dưỡng' | 'Hỏng hóc'>('Tốt');
  const [eqInspectionDate, setEqInspectionDate] = useState('2026-06-13');
  const [eqMaintenanceDate, setEqMaintenanceDate] = useState('2026-06-13');

  // Plan actions
  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    const defaultFac = facilities[0];
    setPlanName('');
    setPlanFacilityId(defaultFac?.name || '');
    setPlanAddress(defaultFac?.address || '');
    setPlanCreatedDate('2026-06-13');
    setPlanApprovedDate('2026-06-13');
    setPlanRehearsalDate('2026-06-13');
    setPlanParticipants('');
    setPlanEvaluation('Đạt yêu cầu');
    setPlanCommander('');
    setPlanVehiclesCount('');
    setPlanPersonnelCount('');
    setIsAddingPlan(true);
  };

  const handleOpenEditPlan = (plan: FireProtectionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    const resolvedFacility = facilities.find(f => f.id === plan.facilityId);
    setPlanFacilityId(resolvedFacility ? resolvedFacility.name : plan.facilityId);
    setPlanAddress(plan.address || '');
    setPlanCreatedDate(plan.createdDate);
    setPlanApprovedDate(plan.approvedDate);
    setPlanRehearsalDate(plan.rehearsalDate || '');
    setPlanParticipants(plan.participants || '');
    setPlanEvaluation(plan.evaluation || '');
    setPlanCommander(plan.commander || '');
    setPlanVehiclesCount(plan.vehiclesCount !== undefined ? plan.vehiclesCount : '');
    setPlanPersonnelCount(plan.personnelCount !== undefined ? plan.personnelCount : '');
    setIsAddingPlan(false);
  };

  const handleSavePlan = (e: any) => {
    e.preventDefault();
    const currentFac = facilities.find(f => f.id === planFacilityId) || facilities.find(f => f.name === planFacilityId);
    const resolvedName = planName.trim() || `Thực tập phương án - ${currentFac ? currentFac.name : (planFacilityId || 'Vị trí độc lập')}`;

    const body: Omit<FireProtectionPlan, 'id'> = {
      name: resolvedName,
      facilityId: currentFac ? currentFac.id : planFacilityId,
      createdDate: planCreatedDate,
      approvedDate: planApprovedDate,
      rehearsalDate: planRehearsalDate || undefined,
      participants: planParticipants || undefined,
      evaluation: planEvaluation || undefined,
      fileUrl: 'PHUONG_AN_MOCK_2026.pdf',
      commander: planCommander || undefined,
      vehiclesCount: planVehiclesCount !== '' ? Number(planVehiclesCount) : undefined,
      personnelCount: planPersonnelCount !== '' ? Number(planPersonnelCount) : undefined,
      address: planAddress || undefined,
    };

    if (isAddingPlan) {
      setPlans([...plans, { id: `PLAN_${Date.now()}`, ...body }]);
    } else if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...body } : p));
    }

    setEditingPlan(null);
    setIsAddingPlan(false);
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phương án: ${name}?`)) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  // Equipment actions
  const handleOpenAddEq = () => {
    setEditingEq(null);
    setEqName('');
    setEqCat('Phương tiện chữa cháy');
    setEqQty(1);
    setEqStatus('Tốt');
    setEqInspectionDate('2026-06-13');
    setEqMaintenanceDate('2026');
    setIsAddingEq(true);
  };

  const handleOpenEditEq = (eq: FireEquipment) => {
    setEditingEq(eq);
    setEqName(eq.name);
    setEqCat(eq.category);
    setEqQty(eq.quantity);
    setEqStatus(eq.status);
    setEqInspectionDate(eq.lastInspectionDate);
    
    // Extract year (yyyy) if the source nextMaintenanceDate has a full date, otherwise take as is
    let yearValue = eq.nextMaintenanceDate || '';
    if (yearValue.includes('-')) {
      yearValue = yearValue.split('-')[0];
    }
    // Filter to 4 digits max
    setEqMaintenanceDate(yearValue.replace(/\D/g, '').slice(0, 4));
    setIsAddingEq(false);
  };

  const handleSaveEq = (e: any) => {
    e.preventDefault();
    if (!eqName.trim()) return alert('Nhập tên phương tiện thiết bị');

    const body: Omit<FireEquipment, 'id'> = {
      name: eqName,
      category: eqCat,
      quantity: Number(eqQty),
      status: eqStatus,
      lastInspectionDate: eqInspectionDate,
      nextMaintenanceDate: eqMaintenanceDate,
    };

    if (isAddingEq) {
      setEquipment([...equipment, { id: `EQ_${Date.now()}`, ...body }]);
    } else if (editingEq) {
      setEquipment(equipment.map(e => e.id === editingEq.id ? { ...e, ...body } : e));
    }

    setEditingEq(null);
    setIsAddingEq(false);
  };

  const handleDeleteEq = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thiết bị/phương tiện: ${name}?`)) {
      setEquipment(equipment.filter(e => e.id !== id));
    }
  };

  // Filtering
  const filteredPlans = plans.filter(p => {
    const facility = facilities.find(f => f.id === p.facilityId) || facilities.find(f => f.name === p.facilityId);
    const addressStr = p.address || facility?.address || '';
    const cmdStr = p.commander || '';
    const nameStr = p.name || '';
    const facNameStr = facility ? facility.name : (p.facilityId || '');
    const searchVal = planSearch.toLowerCase();
    
    const matchesSearch = nameStr.toLowerCase().includes(searchVal) || 
           facNameStr.toLowerCase().includes(searchVal) ||
           addressStr.toLowerCase().includes(searchVal) ||
           cmdStr.toLowerCase().includes(searchVal);

    if (!matchesSearch) return false;

    if (planFromDate && p.rehearsalDate && p.rehearsalDate < planFromDate) {
      return false;
    }
    if (planToDate && p.rehearsalDate && p.rehearsalDate > planToDate) {
      return false;
    }
    return true;
  });

  const allDraftOfficers = Array.from(new Set(
    drafts.flatMap(d => [d.createdBy, d.revisionAuthor].filter(Boolean))
  )) as string[];

  const allDraftPlanTypes = Array.from(new Set(
    drafts.map(d => d.planType).filter(Boolean)
  )) as string[];

  const filteredDrafts = drafts.filter(d => {
    const facility = facilities.find(f => f.id === d.facilityId);
    const facilityName = facility ? facility.name : (d.facilityId || '');
    const matchesSearch = d.title.toLowerCase().includes(draftSearch.toLowerCase()) || 
                          facilityName.toLowerCase().includes(draftSearch.toLowerCase()) ||
                          (d.fireSource || '').toLowerCase().includes(draftSearch.toLowerCase());
    
    let matchesDate = true;
    const targetDate = d.approvalDate || d.revisionDate || '';
    if (targetDate) {
      if (draftStartDate) {
        matchesDate = matchesDate && targetDate >= draftStartDate;
      }
      if (draftEndDate) {
        matchesDate = matchesDate && targetDate <= draftEndDate;
      }
    } else {
      if (draftStartDate || draftEndDate) {
        matchesDate = false;
      }
    }

    const matchesOfficer = !draftOfficerFilter || d.createdBy === draftOfficerFilter || d.revisionAuthor === draftOfficerFilter;
    const matchesPlanType = !draftPlanTypeFilter || d.planType === draftPlanTypeFilter;
    
    return matchesSearch && matchesDate && matchesOfficer && matchesPlanType;
  });

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(eqSearch.toLowerCase());
    const matchesCat = eqCategory === 'All' || e.category === eqCategory;
    return matchesSearch && matchesCat;
  });

  const exportPlansToExcel = () => {
    // Setup columns with Vietnamese headers
    const headers = [
      "Tên cơ sở",
      "Địa chỉ diễn tập",
      "Chỉ huy diễn tập",
      "Số lượng phương tiện",
      "Số lượng cán bộ chiến sĩ",
      "Ngày diễn tập",
      "Kết quả đánh giá"
    ];

    const rows = filteredPlans.map(plan => {
      const facility = facilities.find(f => f.id === plan.facilityId) || facilities.find(f => f.name === plan.facilityId);
      const facilityName = facility ? facility.name : (plan.facilityId || "Vị trí độc lập");
      const resolvedAddress = plan.address || facility?.address || '--';
      const resolvedCommander = plan.commander || '--';
      const resolvedVehicles = plan.vehiclesCount !== undefined ? `${plan.vehiclesCount} xe` : '--';
      const resolvedPersonnel = plan.personnelCount !== undefined ? `${plan.personnelCount} đ/c` : '--';
      const resolvedDate = plan.rehearsalDate || '--';
      const resolvedResult = plan.evaluation || '--';

      return [
        `"${facilityName.replace(/"/g, '""')}"`,
        `"${resolvedAddress.replace(/"/g, '""')}"`,
        `"${resolvedCommander.replace(/"/g, '""')}"`,
        `"${resolvedVehicles.replace(/"/g, '""')}"`,
        `"${resolvedPersonnel.replace(/"/g, '""')}"`,
        `"${resolvedDate.replace(/"/g, '""')}"`,
        `"${resolvedResult.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_dien_tap_phuong_an_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDraftsToExcel = () => {
    const headers = [
      "STT",
      "Mã cơ sở",
      "Tên cơ sở",
      "Địa chỉ",
      "Loại phương án",
      "Số phương án",
      "Ngày phê duyệt",
      "Cán bộ xây dựng",
      "Ngày cập nhật",
      "Cán bộ cập nhật",
      "Ghi chú"
    ];

    const rows = filteredDrafts.map((d, idx) => {
      const facility = facilities.find(f => f.id === d.facilityId);
      const stt = (idx + 1).toString();
      const maCoSo = d.facilityId || '';
      const tenCoSo = facility ? facility.name : 'Không rõ';
      const diaChi = d.address || facility?.address || '';
      const loaiPhuongAn = d.planType || '';
      const soPhuongAn = d.planNumber || '';
      const ngayPheDuyet = d.approvalDate || '';
      const canBoXayDung = d.createdBy || '';
      const ngayCapNhat = d.revisionDate || '';
      const canBoCapNhat = d.revisionAuthor || '';
      const ghiChu = d.notes || '';

      return [
        stt,
        maCoSo,
        tenCoSo,
        diaChi,
        loaiPhuongAn,
        soPhuongAn,
        ngayPheDuyet,
        canBoXayDung,
        ngayCapNhat,
        canBoCapNhat,
        ghiChu
      ].map(val => {
        const clean = String(val || '').replace(/"/g, '""').replace(/\r?\n/g, ' ');
        return `"${clean}"`;
      });
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_phe_duyet_phuong_an_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportEquipmentToExcel = () => {
    const headers = [
      "Tên phương tiện / Thiết bị",
      "Phân nhóm",
      "Số lượng",
      "Trạng thái",
      "Ngày kiểm tra gần nhất",
      "Ngày bảo dưỡng tiếp theo/Năm sản xuất"
    ];

    const rows = filteredEquipment.map(item => {
      let statusLabel = item.status;
      if (item.status === 'Tốt') statusLabel = 'Hoạt động Tốt';
      else if (item.status === 'Cần sửa chữa') statusLabel = 'Cần kiểm tra định sửa';
      else if (item.status === 'Hỏng hóc') statusLabel = 'Thanh lý, Hỏng hóc';

      return [
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        `"${item.quantity}"`,
        `"${statusLabel.replace(/"/g, '""')}"`,
        `"${(item.lastInspectionDate || '--').replace(/"/g, '""')}"`,
        `"${(item.nextMaintenanceDate || '--').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_phuong_tien_thiet_bi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="fire-rescue-module">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-650" />
            CÔNG TÁC CHỮA CHÁY VÀ CỨU NẠN CỨU HỘ
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Thiết kế phương án dập lửa chủ động, quản lý lịch trình thực tập cứu hộ và kiểm kê khí đài trực chiến phòng quân.
          </p>
          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>

        {/* Navigation subtabs & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center no-print">
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

          <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              id="subtab-plans"
              onClick={() => setActiveSubTab('plans')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'plans' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              Thực tập phương án
            </button>
            <button
              id="subtab-drafting"
              onClick={() => setActiveSubTab('drafting')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'drafting' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              Xây dựng phương án
            </button>
            <button
              id="subtab-equipment"
              onClick={() => setActiveSubTab('equipment')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'equipment' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              Phương tiện & Thiết bị Kỹ thuật
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'plans' && (
        <div className="space-y-4" id="plans-viewport-manager">
          {/* Action header bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4 no-print">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* Search component */}
              <div className="relative flex-1 max-w-lg w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="plan-search-input"
                  type="text"
                  placeholder="Tìm kế hoạch thực tập theo cơ sở, địa chỉ, chỉ huy..."
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Date Filters Range */}
              <div className="flex flex-wrap items-center gap-2.5 bg-slate-50/50 p-1.5 px-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Từ ngày:</span>
                  <input
                    id="plan-filter-from-date"
                    type="date"
                    value={planFromDate}
                    onChange={(e) => setPlanFromDate(e.target.value)}
                    className="p-1 px-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer focus:border-red-400"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-semibold">Đến ngày:</span>
                  <input
                    id="plan-filter-to-date"
                    type="date"
                    value={planToDate}
                    onChange={(e) => setPlanToDate(e.target.value)}
                    className="p-1 px-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer focus:border-red-400"
                  />
                </div>
                {(planFromDate || planToDate) && (
                  <button
                    onClick={() => { setPlanFromDate(''); setPlanToDate(''); }}
                    className="p-1.5 px-2.5 text-red-650 hover:text-red-700 font-bold text-xs cursor-pointer bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa lọc ngày
                  </button>
                )}
              </div>

              {/* Actions group */}
              <div className="flex flex-row gap-2 w-full lg:w-auto shrink-0">
                <button
                  id="export-plans-excel-btn"
                  onClick={exportPlansToExcel}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-[0.98]"
                >
                  <FileDown className="w-4 h-4" />
                  Xuất file Excel
                </button>
                <button
                  id="add-plan-btn"
                  onClick={handleOpenAddPlan}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-xs active:scale-[0.98]"
                >
                  + Thực tập phương án mới
                </button>
              </div>
            </div>

            {/* Rehearsal Statistics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 bg-slate-50/40 p-3 rounded-xl">
              <div className="text-center p-2.5 rounded-lg bg-white border border-slate-100 shadow-3xs flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tổng số cuộc diễn tập</span>
                <span className="text-sm sm:text-lg font-black text-blue-650 font-mono leading-none">{filteredPlans.length}</span>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white border border-slate-100 shadow-3xs flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Lượt Đạt yêu cầu</span>
                <span className="text-sm sm:text-lg font-black text-emerald-600 font-mono leading-none">{filteredPlans.filter(p => p.evaluation === 'Đạt yêu cầu').length}</span>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white border border-slate-100 shadow-3xs flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Lượt Chưa đạt yêu cầu</span>
                <span className="text-sm sm:text-lg font-black text-red-600 font-mono leading-none">{filteredPlans.filter(p => p.evaluation === 'Chưa đạt yêu cầu').length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel - Styled as Table */}
            <div className="lg:col-span-2 space-y-4" id="plans-list-viewport">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="plans-data-table">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400">
                        <th className="p-4">Cơ sở & Địa chỉ</th>
                        <th className="p-4">Chỉ huy</th>
                        <th className="p-4 text-center">Phương tiện</th>
                        <th className="p-4 text-center">CB chiến sĩ</th>
                        <th className="p-4 text-center">Ngày diễn tập</th>
                        <th className="p-4 text-center">Kết quả</th>
                        <th className="p-4 text-right no-print">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                      {filteredPlans.map(plan => {
                        const facility = facilities.find(f => f.id === plan.facilityId) || facilities.find(f => f.name === plan.facilityId);
                        const resolvedAddress = plan.address || facility?.address || '--';
                        const resolvedCommander = plan.commander || '--';
                        const resolvedVehicles = plan.vehiclesCount !== undefined ? `${plan.vehiclesCount} xe` : '--';
                        const resolvedPersonnel = plan.personnelCount !== undefined ? `${plan.personnelCount} đ/c` : '--';
                        const resolvedDate = plan.rehearsalDate || '--';
                        const resolvedResult = plan.evaluation || '--';

                        return (
                          <tr key={plan.id} className="hover:bg-slate-50/40 transition-all">
                            <td className="p-4 max-w-[200px]">
                              <span className="font-extrabold text-slate-800 block text-xs">{facility ? facility.name : (plan.facilityId || 'Vị trí độc lập')}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 truncate" title={resolvedAddress}>{resolvedAddress}</span>
                            </td>
                            <td className="p-4 font-bold text-slate-800">{resolvedCommander}</td>
                            <td className="p-4 text-center font-mono font-bold text-indigo-650">{resolvedVehicles}</td>
                            <td className="p-4 text-center font-mono font-bold text-indigo-650">{resolvedPersonnel}</td>
                            <td className="p-4 text-center text-slate-500 font-mono font-bold">{resolvedDate}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                resolvedResult === 'Chưa đạt yêu cầu'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : resolvedResult === 'Xuất sắc'
                                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-150'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {resolvedResult}
                              </span>
                            </td>
                            <td className="p-4 text-right no-print">
                              <div className="flex gap-2 justify-end items-center">
                                {deleteConfirmPlanId === plan.id ? (
                                  <div className="flex items-center gap-1 bg-red-50/70 px-1.5 py-0.5 rounded border border-red-100 text-[10px]">
                                    <span className="text-red-700 font-extrabold text-[9px]">Xóa?</span>
                                    <button
                                      onClick={() => {
                                        setPlans(plans.filter(p => p.id !== plan.id));
                                        setDeleteConfirmPlanId(null);
                                      }}
                                      className="bg-red-650 hover:bg-red-600 text-white px-1.5 py-0.5 rounded text-[9.5px] font-extrabold cursor-pointer transition-all"
                                    >
                                      Có
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmPlanId(null)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-750 px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-all"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      id={`edit-plan-${plan.id}`}
                                      onClick={() => handleOpenEditPlan(plan)}
                                      className="text-xs text-blue-650 font-bold hover:underline cursor-pointer transition-all px-1"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      id={`delete-plan-${plan.id}`}
                                      onClick={() => setDeleteConfirmPlanId(plan.id)}
                                      className="text-xs text-red-650 hover:underline cursor-pointer font-bold transition-all px-1"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPlans.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-400">
                            Chưa ghi nhận kế hoạch thực tập phương án nào phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Plans Form side */}
            <div id="plan-entry-form">
              {(editingPlan || isAddingPlan) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-850 uppercase tracking-widest">
                      {isAddingPlan ? 'Khai báo Thực tập Mới' : 'Hiệu chỉnh Thực tập'}
                    </h3>
                    <button id="close-plan-form" onClick={() => { setEditingPlan(null); setIsAddingPlan(false); }} className="text-slate-400 p-1 hover:bg-slate-50 rounded">X</button>
                  </div>

                  <form onSubmit={handleSavePlan} className="space-y-4 text-xs font-semibold text-slate-600">
                    <div>
                      <label className="block mb-1">Cơ sở diễn tập *</label>
                      <input
                        id="plan-form-facility"
                        type="text"
                        required
                        list="facilities-datalist"
                        value={planFacilityId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlanFacilityId(val);
                          const fac = facilities.find(f => f.name === val || f.id === val);
                          if (fac) {
                            setPlanAddress(fac.address || '');
                          }
                        }}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs text-slate-800 bg-white"
                        placeholder="Nhập tên hoặc chọn cơ sở..."
                        autoComplete="off"
                      />
                      <datalist id="facilities-datalist">
                        {facilities.map(f => (
                          <option key={f.id} value={f.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block mb-1">Địa chỉ diễn tập *</label>
                      <input
                        id="plan-form-address"
                        type="text"
                        required
                        value={planAddress}
                        onChange={(e) => setPlanAddress(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-800 bg-white"
                        placeholder="Địa chỉ cụ thể nơi tổ chức diễn tập..."
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Chỉ huy diễn tập *</label>
                      <input
                        id="plan-form-commander"
                        type="text"
                        required
                        value={planCommander}
                        onChange={(e) => setPlanCommander(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-800 bg-white"
                        placeholder="Họ tên Chỉ huy diễn tập (VD: Đ/c Nguyễn Văn A)..."
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Số lượng phương tiện *</label>
                        <input
                          id="plan-form-vehicles"
                          type="number"
                          required
                          min={0}
                          value={planVehiclesCount}
                          onChange={(e) => setPlanVehiclesCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-800 bg-white"
                          placeholder="Số phương tiện"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Số lượng cán bộ chiến sĩ *</label>
                        <input
                          id="plan-form-personnel"
                          type="number"
                          required
                          min={0}
                          value={planPersonnelCount}
                          onChange={(e) => setPlanPersonnelCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-800 bg-white"
                          placeholder="Số cán bộ chiến sĩ"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Ngày diễn tập *</label>
                        <input
                          id="plan-form-rehearsal"
                          type="date"
                          required
                          value={planRehearsalDate}
                          onChange={(e) => setPlanRehearsalDate(e.target.value)}
                          className="w-full p-2 border border-slate-250 rounded border-slate-200 text-xs text-slate-850"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Kết quả diễn tập *</label>
                        <select
                          id="plan-form-evaluation-select"
                          value={planEvaluation}
                          onChange={(e) => setPlanEvaluation(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs text-slate-800 bg-white cursor-pointer"
                        >
                          <option value="Đạt yêu cầu">Đạt yêu cầu</option>
                          <option value="Chưa đạt yêu cầu">Chưa đạt yêu cầu</option>
                        </select>
                      </div>
                    </div>

                    <button
                      id="save-plan-submit-btn"
                      type="submit"
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg cursor-pointer transition-colors shadow-xs"
                    >
                      Bảo lưu thông tin thực tập
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
                  <ShieldAlert className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2" />
                  Ghi chép và quản lý dữ liệu huấn luyện thực binh, diễn tập cứu hỏa định kỳ để nâng cao tính sẵn sàng chiến đấu trên địa bàn phường quản phận.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'drafting' && (
        <div className="space-y-4 font-semibold" id="drafts-viewport-manager">
          {/* Action header bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center no-print" id="drafts-action-bar-container">
            <div className="flex flex-col sm:flex-row flex-1 gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="draft-search-input"
                  type="text"
                  placeholder="Tìm kịch bản tác chiến theo tên hoặc cơ sở..."
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Filters list */}
              <div className="flex flex-wrap gap-2 items-center text-xs font-bold text-slate-600">
                {/* Date range filters */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg" id="draft-start-date-filter">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Từ ngày</span>
                  <input
                    id="draft-filter-start-date"
                    type="date"
                    value={draftStartDate}
                    onChange={(e) => setDraftStartDate(e.target.value)}
                    className="bg-transparent border-0 font-mono text-[11px] font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg" id="draft-end-date-filter">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Đến ngày</span>
                  <input
                    id="draft-filter-end-date"
                    type="date"
                    value={draftEndDate}
                    onChange={(e) => setDraftEndDate(e.target.value)}
                    className="bg-transparent border-0 font-mono text-[11px] font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>

                {/* Officer Filter */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg" id="draft-officer-filter">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Cán bộ</span>
                  <select
                    id="draft-filter-officer"
                    value={draftOfficerFilter}
                    onChange={(e) => setDraftOfficerFilter(e.target.value)}
                    className="bg-transparent border-0 font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Tất cả cán bộ</option>
                    {allDraftOfficers.map(officer => (
                      <option key={officer} value={officer}>{officer}</option>
                    ))}
                  </select>
                </div>

                {/* Plan Type Filter */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg max-w-[280px]" id="draft-plan-type-filter">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Loại PA</span>
                  <select
                    id="draft-filter-plan-type"
                    value={draftPlanTypeFilter}
                    onChange={(e) => setDraftPlanTypeFilter(e.target.value)}
                    className="bg-transparent border-0 font-bold text-slate-800 focus:outline-hidden cursor-pointer truncate max-w-[180px]"
                  >
                    <option value="">Tất cả loại PA</option>
                    {allDraftPlanTypes.map(pType => (
                      <option key={pType} value={pType} title={pType}>{pType}</option>
                    ))}
                  </select>
                </div>

                {(draftStartDate || draftEndDate || draftOfficerFilter || draftPlanTypeFilter) && (
                  <button
                    id="clear-draft-all-filters"
                    onClick={() => {
                      setDraftStartDate('');
                      setDraftEndDate('');
                      setDraftOfficerFilter('');
                      setDraftPlanTypeFilter('');
                    }}
                    className="p-1.5 hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-lg flex items-center gap-1 hover:text-rose-700 font-bold text-[10px] cursor-pointer transition-all"
                    title="Xóa tất cả bộ lọc"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Xóa lọc</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 justify-end">
              <button
                id="export-drafts-excel-btn"
                onClick={exportDraftsToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors active:scale-[0.98]"
              >
                <FileDown className="w-4 h-4" />
                Xuất file Excel
              </button>
              <button
                id="add-draft-btn"
                onClick={handleOpenAddDraft}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm phương án
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel */}
            <div className="lg:col-span-2 space-y-4" id="drafts-list-viewport">
              {filteredDrafts.map(draft => {
                const facility = facilities.find(f => f.id === draft.facilityId);
                const displayFacilityName = facility ? facility.name : (draft.facilityId || 'Vị trí độc lập');
                return (
                  <div key={draft.id} className="relative bg-white p-5 rounded-xl border border-slate-100 space-y-4 shadow-xs" id={`draft-card-${draft.id}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 pr-60">
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">
                          Cơ sở: <strong className="text-red-650">{displayFacilityName}</strong>
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs mb-1">{draft.title}</h4>
                        {(draft.address || draft.revisionDate || draft.revisionAuthor || draft.planType) && (
                          <div className="mt-2 text-[10.5px] text-slate-500 bg-slate-50/50 p-2 rounded border border-slate-100/70 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                            {draft.planType && (
                              <div className="w-full border-t border-b border-dashed border-slate-100 py-1.5 flex items-start gap-1">
                                <span className="text-slate-400 font-bold shrink-0">📂 Loại phương án:</span> <span className="text-red-700 font-extrabold">{draft.planType}</span>
                              </div>
                            )}
                            {draft.address && (
                              <div className="w-full">
                                <span className="text-slate-400 font-bold">📍 Địa chỉ:</span> <span className="text-slate-700">{draft.address}</span>
                              </div>
                            )}
                            {draft.revisionDate && (
                              <div>
                                <span className="text-slate-400 font-bold">🔄 Ngày cập nhật, bổ sung, chỉnh lý:</span> <span className="text-slate-700">{draft.revisionDate}</span>
                              </div>
                            )}
                            {draft.revisionAuthor && (
                              <div>
                                <span className="text-slate-400 font-bold">👤 Cán bộ cập nhật, chỉnh lý:</span> <span className="text-slate-700">{draft.revisionAuthor}</span>
                              </div>
                            )}
                            {draft.notes && (
                              <div className="w-full border-t border-dashed border-slate-100 pt-1.5 mt-0.5">
                                <span className="text-slate-400 font-bold">📝 Ghi chú:</span> <span className="text-slate-700">{draft.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Absolute positioned info badges in top-right corner */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 font-mono text-[11px]">
                      {draft.planNumber && (
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1.5 shadow-2xs">
                          <span className="text-[10px] text-blue-400 font-bold">📋 SỐ PA:</span>
                          <span className="font-extrabold text-blue-800 text-xs">{draft.planNumber}</span>
                        </div>
                      )}
                      {draft.approvalDate && (
                        <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5 shadow-2xs">
                          <span className="text-[10px] text-emerald-400 font-bold">📅 DUYỆT:</span>
                          <span className="font-extrabold text-emerald-800 text-xs">{draft.approvalDate}</span>
                        </div>
                      )}
                    </div>

                    {(draft.fireSource || draft.forcesMobilized) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100/60 font-semibold text-slate-650">
                        {draft.fireSource && (
                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wide">Điểm Khởi Cháy / Sự Cố</span>
                              <button
                                onClick={() => {
                                  if (window.confirm("Bạn có chắc chắn muốn xóa điểm khởi cháy/sự cố?")) {
                                    saveDraftsToStorage(drafts.map(d => d.id === draft.id ? { ...d, fireSource: '' } : d));
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 text-[10px] font-extrabold transition-colors cursor-pointer"
                                title="Xóa điểm khởi cháy"
                              >
                                Xóa
                              </button>
                            </div>
                            <span className="text-slate-800 font-bold">{draft.fireSource}</span>
                          </div>
                        )}
                        {draft.forcesMobilized && (
                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wide">Lực lượng & Thiết bị huy động</span>
                              <button
                                onClick={() => {
                                  if (window.confirm("Bạn có chắc chắn muốn xóa lực lượng và thiết bị huy động?")) {
                                    saveDraftsToStorage(drafts.map(d => d.id === draft.id ? { ...d, forcesMobilized: '' } : d));
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 text-[10px] font-extrabold transition-colors cursor-pointer"
                                title="Xóa lực lượng"
                              >
                                Xóa
                              </button>
                            </div>
                            <span className="text-slate-800 font-bold">{draft.forcesMobilized}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {draft.tactics && (
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold block text-[9.5px] uppercase tracking-wide">Biện Pháp Kỹ Thuật / Chiến Thuật Tấn Công</span>
                          <button
                            onClick={() => {
                              if (window.confirm("Bạn có chắc chắn muốn xóa biện pháp kỹ thuật và chiến thuật tấn công?")) {
                                saveDraftsToStorage(drafts.map(d => d.id === draft.id ? { ...d, tactics: '' } : d));
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-[10px] font-extrabold transition-colors cursor-pointer"
                            title="Xóa biện pháp kỹ thuật"
                          >
                            Xóa
                          </button>
                        </div>
                        <p className="font-semibold text-slate-700 bg-red-50/30 p-2.5 border border-red-50 rounded-lg italic leading-relaxed text-[11px]">
                          "{draft.tactics}"
                        </p>
                      </div>
                    )}

                    {/* Step-by-step checklist */}
                    {draft.steps && draft.steps.length > 0 && (
                      <div className="space-y-2 pt-1 font-semibold text-xs text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold block text-[9.5px] uppercase tracking-wide">Quy trình triển khai kịch bản tác chiến ({draft.steps.filter((s:any)=>s.done).length}/{draft.steps.length})</span>
                          <button
                            onClick={() => {
                              if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ quy trình triển khai?")) {
                                saveDraftsToStorage(drafts.map(d => d.id === draft.id ? { ...d, steps: [] } : d));
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-[10px] font-extrabold transition-colors cursor-pointer"
                            title="Xóa toàn bộ quy trình"
                          >
                            Xóa toàn bộ quy trình
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 pl-1">
                          {draft.steps.map((step: any, idx: number) => (
                            <div 
                              key={idx}
                              className={`flex items-center justify-between gap-2.5 p-2 rounded-md border ${
                                step.done 
                                  ? 'bg-emerald-50/40 border-emerald-100 text-slate-500' 
                                  : 'bg-slate-50/30 border-slate-100 text-slate-750 hover:bg-slate-100/60'
                              } text-[11px] font-semibold transition-colors`}
                            >
                              <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                                <input 
                                  type="checkbox"
                                  checked={!!step.done}
                                  onChange={() => handleToggleStep(draft.id, idx)}
                                  className="mt-0.5 rounded text-red-650 focus:ring-red-500 w-3.5 h-3.5 shrink-0 cursor-pointer"
                                />
                                <span className={step.done ? "line-through text-slate-400 font-normal truncate" : "truncate"}>
                                  {step.desc}
                                </span>
                              </label>
                              <button
                                onClick={() => handleDeleteStep(draft.id, idx)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                                title="Xóa bước này"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium no-print">
                      <span>
                        {draft.createdBy && (
                          <>Cán bộ xây dựng: <strong className="text-slate-700 font-bold">{draft.createdBy}</strong> • </>
                        )}
                        {draft.notes && (
                          <>Ghi chú: <strong className="text-slate-700 font-bold">{draft.notes}</strong> • </>
                        )}
                        {draft.updatedAt && (
                          <span className="inline-flex items-center gap-1 group/time">
                            Cập nhật: <span className="font-mono">{draft.updatedAt}</span>
                            <button
                              onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xóa mốc thời gian cập nhật?")) {
                                  saveDraftsToStorage(drafts.map(d => d.id === draft.id ? { ...d, updatedAt: '' } : d));
                                }
                              }}
                              className="text-red-650 hover:text-red-700 hover:underline font-extrabold text-[9.5px] transition-colors cursor-pointer ml-1"
                              title="Xóa mốc thời gian"
                            >
                              (Xóa)
                            </button>
                          </span>
                        )}
                      </span>
                      <div className="flex gap-3">
                        {deleteConfirmDraftId === draft.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50/70 px-2 py-1 rounded border border-red-100">
                            <span className="text-red-700 font-extrabold text-[9.5px] uppercase">Xác nhận xóa?</span>
                            <button
                              onClick={() => {
                                const updatedList = drafts.filter(d => d.id !== draft.id);
                                saveDraftsToStorage(updatedList);
                                setDeleteConfirmDraftId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-[9.5px] font-extrabold cursor-pointer transition-colors"
                            >
                              Có
                            </button>
                            <button
                              onClick={() => setDeleteConfirmDraftId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-750 px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmDraftId(draft.id)}
                            className="text-red-650 hover:underline cursor-pointer font-bold"
                          >
                            Xóa
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditDraft(draft)}
                          className="text-blue-650 hover:underline cursor-pointer font-bold"
                        >
                          Hiệu chỉnh
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDrafts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                  Chưa ghi nhận phương án giả định tác chiến nào. Bấm vào nút thiết kế phương án giả định để tạo ngay!
                </div>
              )}
            </div>

            {/* Side Form */}
            <div id="draft-entry-form">
              {(editingDraft || isAddingDraft) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                      {isAddingDraft ? 'Xây dựng phương án mới' : 'Hiệu chỉnh phương án giả định'}
                    </h3>
                    <button onClick={() => { setEditingDraft(null); setIsAddingDraft(false); }} className="text-slate-400 font-bold hover:text-slate-600 text-xs cursor-pointer">X</button>
                  </div>

                  <form onSubmit={handleSaveDraft} className="space-y-4 text-xs font-semibold text-slate-600">
                    {draftSaveSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-lg font-bold text-center flex items-center justify-center gap-2 animate-pulse" id="draft-save-success-alert">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                        <span>Đã lưu thành công!</span>
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 text-slate-650">Mã cơ sở *</label>
                      <input
                        type="text"
                        required
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded font-medium text-slate-800 text-xs"
                        placeholder=""
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-650">Tên cơ sở *</label>
                      <input
                        type="text"
                        required
                        value={draftFacilityId}
                        onChange={(e) => setDraftFacilityId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                        placeholder="Nhập tên cơ sở..."
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-650">Địa chỉ *</label>
                      <input
                        type="text"
                        required
                        value={draftAddress}
                        onChange={(e) => setDraftAddress(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                        placeholder="Nhập địa chỉ..."
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-650">Loại phương án *</label>
                      <select
                        value={draftPlanType}
                        onChange={(e) => setDraftPlanType(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium bg-white"
                      >
                        <option value="Phương án chữa cháy, cứu nạn, cứu hộ của phương tiện giao thông (Mẫu số PC07)">
                          Phương án chữa cháy, cứu nạn, cứu hộ của phương tiện giao thông (Mẫu số PC07)
                        </option>
                        <option value="Phương án chữa cháy, cứu nạn, cứu hộ của cơ quan Công an (Mẫu số PC08)">
                          Phương án chữa cháy, cứu nạn, cứu hộ của cơ quan Công an (Mẫu số PC08)
                        </option>
                        <option value="Phương án cứu nạn, cứu hộ của cơ quan Công an (Mẫu số PC09)">
                          Phương án cứu nạn, cứu hộ của cơ quan Công an (Mẫu số PC09)
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-slate-650">Số phương án *</label>
                        <input
                          type="text"
                          required
                          value={draftPlanNumber}
                          onChange={(e) => setDraftPlanNumber(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                          placeholder="Số phương án..."
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-650">Ngày phê duyệt *</label>
                        <input
                          type="date"
                          required
                          value={draftApprovalDate}
                          onChange={(e) => setDraftApprovalDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium text-slate-950 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-650">Cán bộ xây dựng *</label>
                      <input
                        type="text"
                        required
                        value={draftAuthor}
                        onChange={(e) => setDraftAuthor(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                        placeholder="Nhập tên cán bộ xây dựng..."
                        autoComplete="off"
                      />
                    </div>

                     <div>
                      <label className="block mb-1 text-slate-650">Ngày cập nhật, bổ sung, chỉnh lý phương án</label>
                      <input
                        type="date"
                        value={draftRevisionDate}
                        onChange={(e) => setDraftRevisionDate(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium text-slate-950 bg-white"
                      />
                    </div>

                     <div>
                      <label className="block mb-1 text-slate-650">Cán bộ cập nhật, chỉnh lý, bổ sung</label>
                      <input
                        type="text"
                        value={draftRevisionAuthor}
                        onChange={(e) => setDraftRevisionAuthor(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                        placeholder="Nhập tên cán bộ cập nhật, chỉnh lý, bổ sung..."
                        autoComplete="off"
                      />
                    </div>

                     <div>
                      <label className="block mb-1 text-slate-650">Ghi chú</label>
                      <input
                        type="text"
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs text-slate-800 font-medium"
                        placeholder="Nhập ghi chú thêm..."
                        autoComplete="off"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-red-650 hover:bg-red-605 bg-red-600 text-white font-extrabold rounded-lg cursor-pointer text-xs uppercase"
                    >
                      Bảo lưu phương án kịch bản
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
                  <CheckSquare className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2 animate-pulse" />
                  Xây dựng kịch bản giả định, lập phương án chiến thuật, lựa chọn lực lượng và kiểm soát quy trình tác chiến dập tắt thảm họa phòng hỏa.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'equipment' && (
        <div className="space-y-4" id="equipment-viewport-manager">
          {/* Action header bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 no-print">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="eq-search-input"
                type="text"
                placeholder="Tìm thiết bị, vật phẩm phòng hỏa tác chiến..."
                value={eqSearch}
                onChange={(e) => setEqSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>
            <div className="md:col-span-3">
              <select
                id="eq-category-filter"
                value={eqCategory}
                onChange={(e) => setEqCategory(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">--- Phân loại thiết bị ---</option>
                <option value="Phương tiện chữa cháy">Phương tiện chữa cháy</option>
                <option value="Thiết bị CNCH">Thiết bị CNCH</option>
                <option value="Thiết bị bảo hộ">Thiết bị bảo hộ</option>
                <option value="Khác">Phụ trợ khác</option>
              </select>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <button
                id="export-eq-excel-btn"
                onClick={exportEquipmentToExcel}
                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold leading-relaxed cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
              >
                <FileDown className="w-4 h-4" />
                Xuất file Excel
              </button>
              <button
                id="add-eq-btn"
                onClick={handleOpenAddEq}
                className="flex-1 px-3 py-2 bg-red-650 hover:bg-red-600 text-white rounded-lg text-xs font-bold leading-relaxed cursor-pointer flex items-center justify-center gap-1 transition-colors active:scale-[0.98]"
              >
                + Khai báo Thiết bị
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel */}
            <div className="lg:col-span-2" id="equipment-list-viewport">
              <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-655" id="eq-data-table">
                  <thead className="bg-slate-50 uppercase tracking-wider text-[10px] text-slate-450 font-extrabold border-b">
                    <tr>
                      <th className="p-4">Tên Phương tiện / Thiết bị</th>
                      <th className="p-4">Phân nhóm</th>
                      <th className="p-4 text-center">Số lượng</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 no-print text-right">Lựa chọn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold text-slate-700">
                    {filteredEquipment.map(item => (
                      <tr key={item.id} id={`eq-row-${item.id}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-extrabold block text-slate-800">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Năm sản xuất: {item.nextMaintenanceDate ? (item.nextMaintenanceDate.includes('-') ? item.nextMaintenanceDate.split('-')[0] : item.nextMaintenanceDate) : '--'}
                          </span>
                        </td>
                        <td className="p-4 max-w-[130px] truncate">{item.category}</td>
                        <td className="p-4 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'Tốt'
                              ? 'bg-emerald-55 bg-emerald-100 text-emerald-600'
                              : item.status === 'Đang bảo dưỡng'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5 no-print">
                          <button
                            id={`edit-eq-${item.id}`}
                            onClick={() => handleOpenEditEq(item)}
                            className="p-1 text-blue-600 hover:underline"
                          >
                            Chi tiết
                          </button>
                           {deleteConfirmEqId === item.id ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 px-1 py-0.5 rounded border border-red-100 text-[10px]">
                              <button
                                onClick={() => {
                                  setEquipment(equipment.filter(e => e.id !== item.id));
                                  setDeleteConfirmEqId(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-[9.5px] font-extrabold cursor-pointer transition-colors"
                              >
                                Có
                              </button>
                              <button
                                onClick={() => setDeleteConfirmEqId(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-750 px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                              >
                                Hủy
                              </button>
                            </span>
                          ) : (
                            <button
                              id={`delete-eq-${item.id}`}
                              onClick={() => setDeleteConfirmEqId(item.id)}
                              className="p-1 text-red-650 hover:underline font-bold"
                            >
                              Xóa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredEquipment.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          Chưa có trang thiết bị nào được ghi nhận khớp điều kiện.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Equipment side form */}
            <div id="equipment-entry-form">
              {(editingEq || isAddingEq) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                      {isAddingEq ? 'Khai báo Vật tư' : 'Hiệu chỉnh Thiết bị'}
                    </h3>
                    <button id="close-eq-form" onClick={() => { setEditingEq(null); setIsAddingEq(false); }} className="text-slate-400">X</button>
                  </div>

                  <form onSubmit={handleSaveEq} className="space-y-4 text-xs font-semibold text-slate-600">
                    <div>
                      <label className="block mb-1">Tên Phương tiện / Thiết bị *</label>
                      <input
                        id="eq-form-name"
                        type="text"
                        required
                        value={eqName}
                        onChange={(e) => setEqName(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-slate-800 font-medium"
                        placeholder="Thiết bị kìm cắt phá..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Phân hạng nhóm</label>
                        <select
                          id="eq-form-cat"
                          value={eqCat}
                          onChange={(e) => setEqCat(e.target.value as any)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        >
                          <option value="Phương tiện chữa cháy">Phương tiện chữa cháy</option>
                          <option value="Thiết bị CNCH">Thiết bị CNCH</option>
                          <option value="Thiết bị bảo hộ">Thiết bị bảo hộ</option>
                          <option value="Khác">Phụ trợ khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Số lượng tồn</label>
                        <input
                          id="eq-form-qty"
                          type="number"
                          required
                          min="1"
                          value={eqQty}
                          onChange={(e) => setEqQty(Number(e.target.value))}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Trạng thái hao mòn</label>
                      <select
                        id="eq-form-status"
                        value={eqStatus}
                        onChange={(e) => setEqStatus(e.target.value as any)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                      >
                        <option value="Tốt">Hoạt động Tốt</option>
                        <option value="Cần sửa chữa">Cần kiểm tra định sửa</option>
                        <option value="Hỏng hóc">Thanh lý, Hỏng hóc</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[11px]">Kiểm định gần nhất</label>
                        <input
                          id="eq-form-inspdate"
                          type="date"
                          value={eqInspectionDate}
                          onChange={(e) => setEqInspectionDate(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px]">Năm sản xuất</label>
                        <input
                          id="eq-form-maintdate"
                          type="text"
                          maxLength={4}
                          value={eqMaintenanceDate}
                          onChange={(e) => setEqMaintenanceDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 bg-white font-mono"
                          placeholder="yyyy"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <button
                      id="save-eq-submit-btn"
                      type="submit"
                      className="w-full py-2 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Bảo lưu thiết bị
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
                  <Wrench className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2" />
                  Ghi chép cụ thể hạn kiểm định, máy móc vận hành để giữ liên lạc trực ban an toàn tuyệt đối 100%.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
