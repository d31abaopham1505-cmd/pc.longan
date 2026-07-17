import { useState, useMemo } from 'react';
import { PCCCStoreType } from '../lib/store';
import { Facility, FireInspection } from '../types';
import { formatDateDMY } from '../lib/dateUtils';
import * as XLSX from 'xlsx';
import { 
  Building2, ShieldAlert, Sparkles, Filter, Plus, Trash2, Edit2, 
  MapPin, Phone, User, CheckCircle2, AlertCircle, FileText, CalendarDays, Search, X, Download, Paperclip,
  RefreshCw, Save, Upload, Check, AlertTriangle, FileSpreadsheet
} from 'lucide-react';

interface FireProtectionProps {
  store: PCCCStoreType;
}

export default function FireProtectionModule({ store }: FireProtectionProps) {
  const { facilities, setFacilities, inspections, setInspections, officers, plans } = store;

  // Sub-tabs inside protection module
  const [subTab, setSubTab] = useState<'facilities' | 'inspections' | 'analytics'>('facilities');

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu cơ sở phòng cháy và biên bản...');
      setTimeout(() => {
        localStorage.setItem('pccc_facilities', JSON.stringify(facilities));
        localStorage.setItem('pccc_inspections', JSON.stringify(inspections));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ dữ liệu phòng cháy thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  // Facilities management state
  const [facSearch, setFacSearch] = useState('');
  const [facWard, setFacWard] = useState('All');
  const [facDanger, setFacDanger] = useState('All');
  const [facManagementLevelFilter, setFacManagementLevelFilter] = useState('All');
  const [facSectorFilter, setFacSectorFilter] = useState('All');
  const [facCategoryFilter, setFacCategoryFilter] = useState('All');
  const [facIndustryFilter, setFacIndustryFilter] = useState('All');
  const [facOfficerFilter, setFacOfficerFilter] = useState('All');
  const [facStatusFilter, setFacStatusFilter] = useState('All');

  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string; type: 'facility' | 'inspection' } | null>(null);

  // Facility Form State
  const [facId, setFacId] = useState('');
  const [facName, setFacName] = useState('');
  const [facAddress, setFacAddress] = useState('');
  const [facW, setFacW] = useState('Vạn Phúc');
  const [facCategory, setFacCategory] = useState('Nhà chung cư');
  const [facSector, setFacSector] = useState('Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng');
  const [facIndustry, setFacIndustry] = useState('');
  const [facDossierNumber, setFacDossierNumber] = useState('');
  const [facCreatedDate, setFacCreatedDate] = useState('');
  const [facOperationYear, setFacOperationYear] = useState('');
  const [facEconomicSector, setFacEconomicSector] = useState('');
  const [facInvestmentType, setFacInvestmentType] = useState('');
  const [facOwnershipType, setFacOwnershipType] = useState('');
  const [facRep, setFacRep] = useState('');
  const [facPhone, setFacPhone] = useState('');
  const [facLevel, setFacLevel] = useState<'Cấp tỉnh quản lý' | 'Cấp xã quản lý'>('Cấp tỉnh quản lý');
  const [facDangerLevel, setFacDangerLevel] = useState<'Nhóm I' | 'Nhóm II'>('Nhóm I');
  const [facStatus, setFacStatus] = useState<Facility['status']>('Hoạt động');
  const [facNotes, setFacNotes] = useState('');
  const [facOfficerId, setFacOfficerId] = useState('');
  const [facIndustrialZone, setFacIndustrialZone] = useState<Facility['industrialZone']>('Ngoài KCN, KCX, CCN');
  const [facLocalForceType, setFacLocalForceType] = useState<Facility['localForceType']>('Cơ sở');
  const [facLocalForceCount, setFacLocalForceCount] = useState<number>(0);
  const [facLastInspectionDate, setFacLastInspectionDate] = useState('');
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);

  // Excel Import states
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedFacilities, setParsedFacilities] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Inspection states
  const [inspSearch, setInspSearch] = useState('');
  const [inspResult, setInspResult] = useState('All');
  const [inspOfficerFilter, setInspOfficerFilter] = useState('All');
  const [inspTypeFilter, setInspTypeFilter] = useState('All');

  // Date range statistics state
  const [statsStartDate, setStatsStartDate] = useState('');
  const [statsEndDate, setStatsEndDate] = useState('');

  const [editingInspection, setEditingInspection] = useState<FireInspection | null>(null);
  const [isAddingInspection, setIsAddingInspection] = useState(false);

  // Inspection Excel Import states
  const [isImportingInspExcel, setIsImportingInspExcel] = useState(false);
  const [inspExcelFile, setInspExcelFile] = useState<File | null>(null);
  const [parsedInspections, setParsedInspections] = useState<any[]>([]);
  const [inspImportStatus, setInspImportStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Inspection Form state
  const [inspFacId, setInspFacId] = useState('');
  const [inspDate, setInspDate] = useState('2026-06-13');
  const [inspType, setInspType] = useState<'Định kỳ' | 'Đột xuất' | 'Chuyên đề'>('Định kỳ');
  const [inspInspectors, setInspInspectors] = useState<string>('');
  const [inspContent, setInspContent] = useState('');
  const [inspResultVal, setInspResultVal] = useState<'Đạt yêu cầu' | 'Không đạt yêu cầu'>('Đạt yêu cầu');
  const [inspAppendixIi, setInspAppendixIi] = useState('');
  const [inspIndustry, setInspIndustry] = useState('');
  const [inspSector, setInspSector] = useState('');
  const [inspAddress, setInspAddress] = useState('');
  const [inspFacilityCategory, setInspFacilityCategory] = useState('');
  const [inspViolations, setInspViolations] = useState('');
  const [inspDeadline, setInspDeadline] = useState('');
  const [inspRemedyStatus, setInspRemedyStatus] = useState<'Không có vi phạm' | 'Chưa khắc phục' | 'Đang khắc phục' | 'Đã khắc phục xong' | 'Đã khắc phục'>('Chưa khắc phục');
  const [inspPlan, setInspPlan] = useState('');
  const [inspAttachments, setInspAttachments] = useState<string[]>([]);
  const [inspOfficerId, setInspOfficerId] = useState('');
  const [inspFineAmount, setInspFineAmount] = useState<number | undefined>(undefined);
  const [inspFacilityStatus, setInspFacilityStatus] = useState<Facility['status']>('Hoạt động');
  const [inspNotes, setInspNotes] = useState('');
  const [inspLegalBasis, setInspLegalBasis] = useState('');
  const [inspIndustrialZone, setInspIndustrialZone] = useState<Facility['industrialZone']>('Ngoài KCN, KCX, CCN');
  const [inspLocalForceType, setInspLocalForceType] = useState<Facility['localForceType']>('Cơ sở');
  const [inspLocalForceCount, setInspLocalForceCount] = useState<number>(0);

  const WARD_OPTIONS = useMemo(() => {
    const unique = new Set<string>();
    facilities.forEach(f => {
      if (f.ward && f.ward.trim()) {
        unique.add(f.ward.trim());
      }
    });
    if (unique.size === 0) {
      return [
        'Phường Long An',
        'Phường Tân An',
        'Phường Khánh Hậu',
        'Xã Tầm Vu',
        'Xã Thuận Mỹ',
        'Xã An Lục Long',
        'Xã Vĩnh Công',
        'Xã Thủ Thừa',
        'Xã Mỹ Thạnh',
        'Xã Mỹ An',
        'Xã Vàm Cỏ',
        'Xã Nhựt Tảo',
        'Xã Tân Trụ',
        'Xã Tân Long'
      ];
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [facilities]);
  const SECTOR_CATEGORIES: Record<string, string[]> = {
    'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng': [
      'Nhà chung cư',
      'Nhà tập thể',
      'Bưu điện',
      'Bưu cục',
      'Cơ sở cung cấp dịch vụ Bưu chính, viễn thông khác',
      'Trụ sở làm việc của cơ quan nhà nước cấp Trung ương',
      'Trụ sở làm việc của cơ quan nhà nước cấp tỉnh',
      'Trụ sở làm việc của cơ quan nhà nước cấp xã',
      'Trụ sở, nhà làm việc của doanh nghiệp, tổ chức chính trị, xã hội',
      'Nhà đa năng, nhà hỗn hợp (trừ nhà ở kết hợp sản xuất kinh doanh)',
      'Nhà ở kết hợp sản xuất, kinh doanh (tổng diện tích phục vụ sản xuất, kinh doanh từ 50m2 trở lên)'
    ],
    'Lĩnh vực cơ sở y tế': [
      'Bệnh viện',
      'Phòng khám đa khoa, chuyên khoa',
      'Trạm y tế, nhà hộ sinh, Cơ sở phòng chống dịch bệnh, cơ sở nghiên cứu, thí nghiệm chuyên ngành y tế',
      'Nhà điều dưỡng, phục hồi chức năng, chỉnh hình, nhà dưỡng lão',
      'Cơ sở y tế khác (theo luật khám bệnh, chữa bệnh)'
    ],
    'Lĩnh vực cơ sở giáo dục': [
      'Nhà trẻ, trường mẫu giáo, mầm non',
      'Trường tiểu học',
      'Trường trung học cơ sở',
      'Trường trung học phổ thông',
      'Trường phổ thông có nhiều cấp học',
      'Trường cao đẳng, đại học, học viện',
      'Trường trung học chuyên nghiệp',
      'Trường dạy nghề',
      'Trường công nhân kỹ thuật',
      'Cơ sở giáo dục khác (theo Luật giáo dục)',
      'Cơ sơ nghiên cứu vũ trụ, trung tâm cơ sở dữ liệu chuyên ngành và cơ sở nghiên cứu chuyên ngành khác'
    ],
    'Lĩnh vực cơ sở văn hóa, thể thao, du lịch': [
      'Sân vận động',
      'Nhà thi đấu, Nhà tập luyện các môn thể thao, bể bơi, Sân thi đấu các môn thể thao có khán đài',
      'Trường đua, trường bắn',
      'Cơ sở thể thao khác (theo luật thể dục, thể thao)',
      'Nhà hát, rạp chiếu phim, rạp xiếc',
      'Trung tâm hội nghị',
      'Bảo tàng, thư viện',
      'Nhà trưng bày, nhà triển lãm',
      'Nhà văn hóa',
      'Thủy cung',
      'Cơ sở kinh doanh dịch vụ karaoke, vũ trường',
      'Cơ sở kinh doanh dịch vụ vui chơi, giải trí',
      'Cơ sở biểu diễn nghệ thuật, hoạt động văn hóa khác',
      'Cơ sở tôn giáo, tín ngưỡng',
      'Công trình di tích lịch sử - văn hóa cấp tỉnh trở lên',
      'Khách sạn, nhà khách, nhà nghỉ',
      'Cơ sở nghỉ dưỡng, cơ sở dịch vụ lưu trú khác',
      'Cơ sở trợ giúp xã hội'
    ],
    'Lĩnh vực cơ sở thương mại dịch vụ': [
      'Chợ',
      'Trung tâm thương mại (độc lập)',
      'Siêu thị (độc lập)',
      'Dịch vụ ăn uống, khác',
      'Kinh doanh hàng hóa dễ cháy ≥ 50m2',
      'Hàng hóa khó cháy đựng bao bì dễ cháy ≥ 300m2'
    ],
    'Lĩnh vực cơ sở giao thông vận tải': [
      'Nhà để xe, showroom ≥ 100m2',
      'Nhà ga hành khách/ngoại giao',
      'Nhà kỹ thuật máy bay',
      'Đài kiểm soát không lưu',
      'Cảng, bến thủy nội địa',
      'Bến cảng biển',
      'Cảng cá',
      'Cảng cạn',
      'Bến xe khách',
      'Trung tâm đăng kiểm',
      'Trạm dừng nghỉ',
      'Hầm đường ô tô ≥ 500m',
      'Ga, đề-pô đường sắt',
      'Nhà ga cáp treo',
      'Hầm đường sắt ≥ 500m',
      'Hầm, ga, depot metro',
      'Sửa chữa phương tiện đường bộ ≥ 100m2',
      'Sửa chữa phương tiện thủy'
    ],
    'Lĩnh vực cơ sở năng lượng': [
      'Nhà máy điện',
      'Trạm biến áp ≥ 110kV'
    ],
    'Lĩnh vực cơ sở xăng dầu, dầu khí': [
      'Cơ sở KD khí đốt',
      'Cửa hàng xăng dầu',
      'Nhà máy lọc dầu',
      'Nhà máy hóa dầu',
      'Lọc hóa dầu',
      'Nhà máy chế biến khí',
      'Nhiên liệu sinh học',
      'Kho dầu',
      'Kho khí hóa lỏng',
      'Trạm chiết LPG',
      'Trạm phân phối khí'
    ],
    'Lĩnh vực cơ sở hóa chất': [
      'Cơ sở sản xuất vật liệu nổ, tiền chất, vũ khí',
      'Kho vật liệu nổ, tiền chất',
      'Cơ sở hạt nhân (trừ NM điện)',
      'Phân bón, hóa chất BVTV',
      'Nguồn điện hóa học (pin, ắc quy)',
      'Khí công nghiệp',
      'Sản phẩm cao su',
      'Chất tẩy rửa',
      'Sơn, mực in',
      'Nguyên liệu nhựa',
      'Chất lỏng dễ cháy (khác xăng/dầu)'
    ],
    'Lĩnh vực cơ sở công nghiệp, nhà kho': [
      'Cơ sở sản xuất vật liệu, sản phẩm xây dựng',
      'Cơ sở luyện kim và cơ khí chế tạo',
      'Cơ sở khai thác, chế biến khoáng sản',
      'Công nghiệp nhẹ',
      'Cơ sở khác phục vụ sản xuất CN',
      'Kho dự trữ quốc gia',
      'Kho hàng nguy hiểm cháy nổ (A-E)',
      'Bãi chứa hàng ≥ 500m2 (trừ xăng/dầu)'
    ],
    'Cơ sở khác': [
      'Hạ tầng khu đô thị, nhà ở',
      'Hạ tầng khu công nghiệp',
      'Hạ tầng cụm công nghiệp',
      'Hạ tầng khu du lịch, TDTT, đào tạo',
      'Nhà máy nước',
      'Nhà máy xử lý chất thải'
    ]
  };

  const CATEGORY_OPTIONS = Object.values(SECTOR_CATEGORIES).flat();
  const FAC_CATEGORY_OPTIONS = useMemo(() => {
    const unique = new Set<string>();
    facilities.forEach(f => {
      if (f.category && f.category.trim()) {
        unique.add(f.category.trim());
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [facilities]);
  const INDUSTRY_OPTIONS = useMemo(() => {
    const unique = new Set<string>();
    facilities.forEach(f => {
      if (f.industry && f.industry.trim()) {
        unique.add(f.industry.trim());
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [facilities]);
  const APPENDIX_II_OPTIONS = [
    'Nhóm I',
    'Nhóm II'
  ];
  const SECTOR_OPTIONS = [
    'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
    'Lĩnh vực cơ sở y tế',
    'Lĩnh vực cơ sở giáo dục',
    'Lĩnh vực cơ sở văn hóa, thể thao, du lịch',
    'Lĩnh vực cơ sở thương mại dịch vụ',
    'Lĩnh vực cơ sở giao thông vận tải',
    'Lĩnh vực cơ sở năng lượng',
    'Lĩnh vực cơ sở xăng dầu, dầu khí',
    'Lĩnh vực cơ sở hóa chất',
    'Lĩnh vực cơ sở công nghiệp, nhà kho',
    'Cơ sở khác'
  ];

  // Handlers Facility
  const handleOpenEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setFacId(facility.id);
    setFacName(facility.name);
    setFacAddress(facility.address);
    setFacW(facility.ward);
    setFacCategory(facility.category);
    setFacSector(facility.sector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng');
    setFacIndustry(facility.industry || '');
    setFacDossierNumber(facility.dossierNumber || '');
    setFacCreatedDate(facility.createdDate || '');
    setFacOperationYear(facility.operationYear || '');
    setFacEconomicSector(facility.economicSector || '');
    setFacInvestmentType(facility.investmentType || '');
    setFacOwnershipType(facility.ownershipType || '');
    setFacRep(facility.representative);
    setFacPhone(facility.phone);
    setFacLevel(facility.managementLevel);
    setFacDangerLevel(facility.dangerLevel);
    setFacStatus(facility.status);
    setFacNotes(facility.notes || '');
    setFacOfficerId(facility.officerId || '');
    setFacIndustrialZone(facility.industrialZone || 'Ngoài KCN, KCX, CCN');
    setFacLocalForceType(facility.localForceType || 'Cơ sở');
    setFacLocalForceCount(facility.localForceCount || 0);
    setFacLastInspectionDate(facility.lastInspectionDate || '');
    setIsAddingFacility(false);
  };

  const handleOpenAddFacility = () => {
    setEditingFacility(null);
    setFacId(`FAC_${Date.now().toString().slice(-3)}`);
    setFacName('');
    setFacAddress('');
    setFacW('Vạn Phúc');
    setFacCategory('Nhà chung cư');
    setFacSector('Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng');
    setFacIndustry('');
    setFacDossierNumber('');
    setFacCreatedDate('');
    setFacOperationYear('');
    setFacEconomicSector('');
    setFacInvestmentType('');
    setFacOwnershipType('');
    setFacRep('');
    setFacPhone('');
    setFacLevel('Cấp tỉnh quản lý');
    setFacDangerLevel('Nhóm II');
    setFacStatus('Hoạt động');
    setFacNotes('');
    setFacOfficerId('');
    setFacIndustrialZone('Ngoài KCN, KCX, CCN');
    setFacLocalForceType('Cơ sở');
    setFacLocalForceCount(0);
    setFacLastInspectionDate('');
    setIsAddingFacility(true);
  };

  const handleSaveFacility = (e: any) => {
    e.preventDefault();
    if (!facName.trim()) return alert('Nhập tên cơ sở quản lý');
    const checkedId = facId.trim() || `FAC_${Date.now()}`;

    if (isAddingFacility) {
      if (facilities.some(f => f.id === checkedId)) {
        return alert('Mã cơ sở đã tồn tại, vui lòng nhập mã khác!');
      }
    } else if (editingFacility) {
      if (checkedId !== editingFacility.id && facilities.some(f => f.id === checkedId)) {
        return alert('Mã cơ sở đã tồn tại, vui lòng nhập mã khác!');
      }
    }

    const body: Omit<Facility, 'id'> = {
      name: facName,
      address: facAddress,
      ward: facW,
      category: facCategory,
      representative: facRep,
      phone: facPhone,
      managementLevel: facLevel,
      dangerLevel: facDangerLevel,
      status: facStatus,
      notes: facNotes || undefined,
      officerId: facOfficerId || undefined,
      sector: facSector,
      industry: facIndustry,
      dossierNumber: facDossierNumber || undefined,
      createdDate: facCreatedDate || undefined,
      lastInspectionDate: facLastInspectionDate || undefined,
      operationYear: facOperationYear || undefined,
      economicSector: facEconomicSector || undefined,
      investmentType: facInvestmentType || undefined,
      ownershipType: facOwnershipType || undefined,
      industrialZone: facIndustrialZone || undefined,
      localForceType: facLocalForceType || undefined,
      localForceCount: facLocalForceCount !== undefined ? Number(facLocalForceCount) : undefined,
    };

    if (isAddingFacility) {
      setFacilities([...facilities, { id: checkedId, ...body }]);
    } else if (editingFacility) {
      setFacilities(facilities.map(f => f.id === editingFacility.id ? { ...f, id: checkedId, ...body } : f));
      if (checkedId !== editingFacility.id) {
        setInspections(inspections.map(i => i.facilityId === editingFacility.id ? { ...i, facilityId: checkedId } : i));
      }
    }

    setEditingFacility(null);
    setIsAddingFacility(false);
  };

  const handleDeleteFacility = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: 'facility' });
  };

  const handleExportExcel = () => {
    // 1. Prepare CSV headers
    const headers = [
      'STT',
      'Mã cơ sở',
      'Tên cơ sở',
      'Địa chỉ chi tiết',
      'Xã, phường',
      'Khu công nghiệp / Cụm công nghiệp',
      'Người đại diện',
      'Điện thoại',
      'Lĩnh vực',
      'Phân loại cơ sở',
      'Ngành nghề',
      'Trạng thái hoạt động',
      'Năm hoạt động',
      'Thành phần kinh tế',
      'Hình thức đầu tư',
      'Hình thức sở hữu',
      'Phân loại theo phụ lục II',
      'Lực lượng tại chỗ',
      'Số lượng lực lượng tại chỗ (người)',
      'Thẩm quyền quản lý',
      'Số hồ sơ nghiệp vụ',
      'Ngày lập',
      'Cán bộ quản lý địa bàn',
      'Ghi chú'
    ];

    // Helper to escape special characters for CSV
    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    // 2. Map data rows
    const rows = filteredFacilities.map((fac, idx) => {
      const assignedOfficer = officers?.find(o => o.id === fac.officerId);
      const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
      
      return [
        (idx + 1).toString(),
        fac.id,
        fac.name,
        fac.address,
        fac.ward,
        fac.industrialZone || 'Ngoài KCN, KCX, CCN',
        fac.representative,
        fac.phone,
        fac.sector || '',
        fac.category,
        fac.industry || '',
        fac.status,
        fac.operationYear || '',
        fac.economicSector || '',
        fac.investmentType || '',
        fac.ownershipType || '',
        fac.dangerLevel,
        fac.localForceType || 'Cơ sở',
        fac.localForceCount !== undefined ? fac.localForceCount.toString() : '0',
        fac.managementLevel,
        fac.dossierNumber || '',
        fac.createdDate || '',
        officerStr,
        fac.notes || ''
      ].map(escapeCSV).join(',');
    });

    // 3. Assemble CSV text with UTF-8 BOM representation for Excel
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');

    // 4. Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh_Sach_Co_So_PCCC.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadImportTemplate = () => {
    try {
      const templateHeaders = [
        'Mã cơ sở (*)',
        'Tên cơ sở (*)',
        'Địa chỉ chi tiết (*)',
        'Xã, phường (*)',
        'Khu công nghiệp / Cụm công nghiệp',
        'Người đại diện (*)',
        'Điện thoại (*)',
        'Lĩnh vực (*)',
        'Phân loại cơ sở (*)',
        'Ngành nghề (*)',
        'Trạng thái hoạt động (*)',
        'Năm hoạt động',
        'Thành phần kinh tế',
        'Hình thức đầu tư',
        'Hình thức sở hữu',
        'Phân loại theo Phụ lục II (*)',
        'Lực lượng tại chỗ',
        'Số lượng lực lượng tại chỗ (người)',
        'Thẩm quyền quản lý (*)',
        'Số hồ sơ nghiệp vụ',
        'Ngày lập (YYYY-MM-DD)',
        'Cán bộ quản lý địa bàn (Tên hoặc Mã)',
        'Ghi chú'
      ];

      // Build sample rows
      const sampleRows = [
        [
          'FAC_TEST_001',
          'Chung cư Cao cấp Vạn Phúc Plaza',
          'Số 234 Đường Nguyễn Trãi',
          WARD_OPTIONS[0] || 'Phường Long An',
          'Ngoài KCN, KCX, CCN',
          'Trần Quốc Bảo',
          '0912345678',
          'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
          'Nhà chung cư',
          'Dịch vụ nhà ở',
          'Hoạt động',
          '2022',
          'Tư nhân',
          'Trong nước',
          'Chính chủ',
          'Nhóm I',
          'Cơ sở',
          '8',
          'Cấp tỉnh quản lý',
          'HS-PCCC-001/2026',
          '2026-02-15',
          officers?.filter(o => o.position !== 'Chiến sĩ')[0]?.fullName || 'Nguyễn Văn Trọng',
          'Hồ sơ đã phê duyệt đầy đủ trang thiết bị.'
        ],
        [
          'FAC_TEST_002',
          'Xưởng May Mặc Thành Đạt',
          'Lô B2, Đường số 4, KCN Phú An',
          WARD_OPTIONS[1] || 'Phường Tân An',
          'KCN, KCX',
          'Lê Hồng Phong',
          '0987654321',
          'Lĩnh vực cơ sở công nghiệp, nhà kho',
          'Nhà máy sản xuất khác',
          'May mặc',
          'Tạm ngừng hoạt động',
          '2020',
          'Tư nhân',
          'Trong nước',
          'Thuê',
          'Nhóm II',
          'Cơ sở',
          '15',
          'Cấp xã quản lý',
          'HS-PCCC-002/2026',
          '2026-03-20',
          officers?.filter(o => o.position !== 'Chiến sĩ')[1]?.fullName || 'Trần Văn Hoàng',
          'Đang tạm ngừng để bảo dưỡng hệ thống chữa cháy tự động.'
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet([templateHeaders, ...sampleRows]);
      
      // Auto-fit column widths
      const maxColWidths = templateHeaders.map((h, i) => {
        const val1 = h.length;
        const val2 = sampleRows[0][i] ? String(sampleRows[0][i]).length : 0;
        const val3 = sampleRows[1][i] ? String(sampleRows[1][i]).length : 0;
        return { wch: Math.max(val1, val2, val3) + 4 };
      });
      ws['!cols'] = maxColWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mẫu cơ sở quản lý');
      
      XLSX.writeFile(wb, 'Mau_Khai_Bao_Co_So_Quan_Ly_PCCC.xlsx');
    } catch (err) {
      console.error('Lỗi khi tải file mẫu:', err);
      alert('Không thể tạo file mẫu excel. Vui lòng thử lại.');
    }
  };

  const handleParseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to raw array
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rawRows.length < 2) {
          setImportStatus({ type: 'error', message: 'File Excel không có dữ liệu hoặc sai cấu trúc.' });
          return;
        }

        const headers = rawRows[0].map(h => String(h).trim());
        const dataRows = rawRows.slice(1);

        // Find matches for each header field to be extremely resilient
        const colMap: Record<string, number> = {};
        const headerTerms: Record<string, string[]> = {
          id: ['Mã cơ sở', 'Mã cơ sở (*)', 'Ma co so', 'Mã', 'id'],
          name: ['Tên cơ sở', 'Tên cơ sở (*)', 'Ten co so', 'Tên', 'name'],
          address: ['Địa chỉ chi tiết', 'Địa chỉ chi tiết (*)', 'Dia chi chi tiet', 'Địa chỉ', 'address'],
          ward: ['Xã, phường', 'Xã, phường (*)', 'Xa, phuong', 'Phường', 'Xã', 'ward'],
          industrialZone: ['Khu công nghiệp / Cụm công nghiệp', 'KCN', 'Khu công nghiệp', 'industrialZone'],
          representative: ['Người đại diện', 'Người đại diện (*)', 'Nguoi dai dien', 'representative'],
          phone: ['Điện thoại', 'Điện thoại (*)', 'Dien thoai', 'SĐT', 'phone'],
          sector: ['Lĩnh vực', 'Lĩnh vực (*)', 'Linh vuc', 'sector'],
          category: ['Phân loại cơ sở', 'Phân loại cơ sở (*)', 'Phan loai co so', 'Loại hình', 'category'],
          industry: ['Ngành nghề', 'Ngành nghề (*)', 'Nganh nghe', 'industry'],
          status: ['Trạng thái hoạt động', 'Trạng thái hoạt động (*)', 'Trang thai hoat dong', 'Trạng thái', 'status'],
          operationYear: ['Năm hoạt động', 'Nam hoat dong', 'Năm đưa vào hoạt động', 'operationYear'],
          economicSector: ['Thành phần kinh tế', 'Thanh phan kinh te', 'economicSector'],
          investmentType: ['Hình thức đầu tư', 'Hinh thuc dau tu', 'investmentType'],
          ownershipType: ['Hình thức sở hữu', 'Hinh thuc so huu', 'ownershipType'],
          dangerLevel: ['Phân loại theo Phụ lục II', 'Phân loại theo Phụ lục II (*)', 'Phan loai theo Phu luc II', 'Phụ lục II', 'dangerLevel'],
          localForceType: ['Lực lượng tại chỗ', 'Luc luong tai cho', 'localForceType'],
          localForceCount: ['Số lượng lực lượng tại chỗ (người)', 'Số lượng lực lượng tại chỗ', 'localForceCount'],
          managementLevel: ['Thẩm quyền quản lý', 'Thẩm quyền quản lý (*)', 'Tham quyen quan ly', 'Diện quản lý', 'managementLevel'],
          dossierNumber: ['Số hồ sơ nghiệp vụ', 'So ho so nghiep vu', 'Số hồ sơ', 'dossierNumber'],
          createdDate: ['Ngày lập', 'Ngày lập (YYYY-MM-DD)', 'Ngay lap', 'createdDate'],
          officerId: ['Cán bộ quản lý địa bàn', 'Cán bộ quản lý địa bàn (Tên hoặc Mã)', 'Can bo quan ly', 'Cán bộ', 'officerId'],
          notes: ['Ghi chú', 'Ghi chu', 'Ghi chú thêm', 'notes']
        };

        // Populate colMap with index of matched headers
        Object.keys(headerTerms).forEach(field => {
          const terms = headerTerms[field];
          const matchedIdx = headers.findIndex(h => 
            terms.some(term => h.toLowerCase().includes(term.toLowerCase()))
          );
          if (matchedIdx !== -1) {
            colMap[field] = matchedIdx;
          }
        });

        // Fallback default indices
        const fallbackIndices: Record<string, number> = {
          id: 0, name: 1, address: 2, ward: 3, industrialZone: 4, representative: 5,
          phone: 6, sector: 7, category: 8, industry: 9, status: 10, operationYear: 11,
          economicSector: 12, investmentType: 13, ownershipType: 14, dangerLevel: 15,
          localForceType: 16, localForceCount: 17, managementLevel: 18, dossierNumber: 19,
          createdDate: 20, officerId: 21, notes: 22
        };

        const parsed: any[] = [];

        dataRows.forEach((row, idx) => {
          if (!row || row.length === 0 || row.every(val => val === null || val === undefined || String(val).trim() === '')) {
            return;
          }

          const getVal = (field: string, defaultVal: any = '') => {
            const index = colMap[field] !== undefined ? colMap[field] : fallbackIndices[field];
            const rawVal = row[index];
            if (rawVal === undefined || rawVal === null) return defaultVal;
            return String(rawVal).trim();
          };

          const rawId = getVal('id');
          const rawName = getVal('name');
          const rawAddress = getVal('address');

          const errors: string[] = [];
          const warnings: string[] = [];

          if (!rawId) errors.push('Thiếu Mã cơ sở');
          if (!rawName) errors.push('Thiếu Tên cơ sở');
          if (!rawAddress) errors.push('Thiếu Địa chỉ chi tiết');

          const rawWard = getVal('ward');
          const rawRep = getVal('representative');
          const rawPhone = getVal('phone');
          const rawSector = getVal('sector');
          const rawCategory = getVal('category');
          const rawIndustry = getVal('industry');
          const rawStatus = getVal('status');

          if (!rawWard) warnings.push('Xã/phường trống - mặc định: Vạn Phúc');
          if (!rawRep) warnings.push('Trống tên Người đại diện');
          if (!rawPhone) warnings.push('Trống số Điện thoại');
          if (!rawSector) warnings.push('Trống Lĩnh vực - mặc định: Lĩnh vực nhà ở...');
          if (!rawCategory) warnings.push('Trống Phân loại cơ sở - mặc định: Nhà chung cư');
          if (!rawIndustry) warnings.push('Trống Ngành nghề - mặc định: Dịch vụ');

          const isDuplicate = facilities.some(f => f.id === rawId);
          if (isDuplicate && rawId) {
            warnings.push('Mã cơ sở đã tồn tại - Sẽ ghi đè');
          }

          const rawOfficerText = getVal('officerId');
          let resolvedOfficerId = '';
          if (rawOfficerText) {
            const cleanOfficer = rawOfficerText.trim().toLowerCase();
            const officerMatch = officers?.find(o => 
              o.id.toLowerCase() === cleanOfficer || 
              o.fullName.toLowerCase() === cleanOfficer || 
              `${o.rank} ${o.fullName}`.toLowerCase().includes(cleanOfficer) ||
              cleanOfficer.includes(o.fullName.toLowerCase())
            );
            if (officerMatch) {
              resolvedOfficerId = officerMatch.id;
            } else {
              warnings.push(`Không tìm thấy cán bộ "${rawOfficerText}" - Sẽ để trống`);
            }
          }

          const rawForceCount = getVal('localForceCount');
          let resolvedForceCount = 0;
          if (rawForceCount) {
            const parsedInt = parseInt(rawForceCount);
            if (!isNaN(parsedInt)) {
              resolvedForceCount = Math.max(0, parsedInt);
            }
          }

          let resolvedManagementLevel: 'Cấp tỉnh quản lý' | 'Cấp xã quản lý' = 'Cấp xã quản lý';
          const rawMgmt = getVal('managementLevel');
          if (rawMgmt && rawMgmt.includes('tỉnh')) {
            resolvedManagementLevel = 'Cấp tỉnh quản lý';
          }

          let resolvedDangerLevel: 'Nhóm I' | 'Nhóm II' = 'Nhóm II';
          const rawDanger = getVal('dangerLevel');
          if (rawDanger && rawDanger.includes('I') && !rawDanger.includes('II')) {
            resolvedDangerLevel = 'Nhóm I';
          }

          let resolvedZone: Facility['industrialZone'] = 'Ngoài KCN, KCX, CCN';
          const rawZone = getVal('industrialZone');
          if (rawZone) {
            if (rawZone.includes('KCN') || rawZone.includes('KCX')) resolvedZone = 'KCN, KCX';
            else if (rawZone.includes('CCN')) resolvedZone = 'CCN';
          }

          let resolvedForceType: Facility['localForceType'] = 'Cơ sở';
          const rawForceType = getVal('localForceType');
          if (rawForceType) {
            if (rawForceType.includes('chuyên ngành') || rawForceType.includes('Chuyên ngành')) resolvedForceType = 'Chuyên ngành';
            else if (rawForceType.includes('phân công') || rawForceType.includes('Phân công')) resolvedForceType = 'Phân công';
          }

          let resolvedStatus: Facility['status'] = 'Hoạt động';
          if (rawStatus) {
            const s = rawStatus.toLowerCase();
            if (s.includes('tạm ngừng') || s.includes('tạm dừng')) resolvedStatus = 'Tạm ngừng hoạt động';
            else if (s.includes('ngừng') || s.includes('dừng') || s.includes('đình chỉ')) resolvedStatus = 'Ngừng hoạt động';
          }

          const rawEco = getVal('economicSector');
          let resolvedEco = '';
          if (rawEco) {
            if (rawEco.includes('Nhà nước')) resolvedEco = 'Nhà nước';
            else if (rawEco.includes('Tập thể')) resolvedEco = 'Tập thể';
            else if (rawEco.includes('Tư nhân')) resolvedEco = 'Tư nhân';
            else if (rawEco.includes('nước ngoài')) resolvedEco = 'Có vốn đầu tư nước ngoài';
            else resolvedEco = 'Khác';
          }

          const rawInvest = getVal('investmentType');
          let resolvedInvest = '';
          if (rawInvest) {
            if (rawInvest.includes('nước ngoài') || rawInvest.includes('Nước ngoài')) resolvedInvest = 'Nước ngoài';
            else if (rawInvest.includes('Liên doanh')) resolvedInvest = 'Liên doanh với nước ngoài';
            else resolvedInvest = 'Trong nước';
          }

          const rawOwner = getVal('ownershipType');
          let resolvedOwner = '';
          if (rawOwner) {
            if (rawOwner.includes('Thuê') || rawOwner.includes('thuê')) resolvedOwner = 'Thuê';
            else resolvedOwner = 'Chính chủ';
          }

          parsed.push({
            id: rawId || `FAC_TEMP_${idx}`,
            name: rawName || '',
            address: rawAddress || '',
            ward: rawWard || 'Vạn Phúc',
            industrialZone: resolvedZone,
            representative: rawRep || 'Chưa rõ',
            phone: rawPhone || 'Chưa rõ',
            sector: rawSector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
            category: rawCategory || 'Nhà chung cư',
            industry: rawIndustry || 'Kinh doanh dịch vụ',
            status: resolvedStatus,
            operationYear: getVal('operationYear'),
            economicSector: resolvedEco,
            investmentType: resolvedInvest,
            ownershipType: resolvedOwner,
            dangerLevel: resolvedDangerLevel,
            managementLevel: resolvedManagementLevel,
            localForceType: resolvedForceType,
            localForceCount: resolvedForceCount,
            dossierNumber: getVal('dossierNumber'),
            createdDate: getVal('createdDate'),
            officerId: resolvedOfficerId,
            notes: getVal('notes'),
            errors,
            warnings,
            isDuplicate
          });
        });

        setParsedFacilities(parsed);
        setImportStatus({ type: 'idle', message: `Đã đọc thành công ${parsed.length} dòng dữ liệu.` });
      } catch (err) {
        console.error(err);
        setImportStatus({ type: 'error', message: 'Lỗi khi đọc file Excel. Định dạng không hợp lệ.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    const validFacilities = parsedFacilities.filter(f => f.errors.length === 0);
    if (validFacilities.length === 0) {
      setImportStatus({ type: 'error', message: 'Không có cơ sở hợp lệ nào để nhập.' });
      return;
    }

    const updatedFacilities = [...facilities];
    validFacilities.forEach(newFac => {
      const schemaFac: Facility = {
        id: newFac.id,
        name: newFac.name,
        address: newFac.address,
        ward: newFac.ward,
        industrialZone: newFac.industrialZone,
        representative: newFac.representative,
        phone: newFac.phone,
        sector: newFac.sector,
        category: newFac.category,
        industry: newFac.industry,
        status: newFac.status,
        operationYear: newFac.operationYear,
        economicSector: newFac.economicSector,
        investmentType: newFac.investmentType,
        ownershipType: newFac.ownershipType,
        dangerLevel: newFac.dangerLevel,
        managementLevel: newFac.managementLevel,
        localForceType: newFac.localForceType,
        localForceCount: newFac.localForceCount,
        dossierNumber: newFac.dossierNumber,
        createdDate: newFac.createdDate,
        officerId: newFac.officerId,
        notes: newFac.notes
      };

      const existingIndex = updatedFacilities.findIndex(f => f.id === schemaFac.id);
      if (existingIndex !== -1) {
        updatedFacilities[existingIndex] = schemaFac;
      } else {
        updatedFacilities.push(schemaFac);
      }
    });

    setFacilities(updatedFacilities);
    localStorage.setItem('pccc_facilities', JSON.stringify(updatedFacilities));
    
    setImportStatus({
      type: 'success',
      message: `Đã nhập thành công ${validFacilities.length} cơ sở quản lý vào hệ thống!`
    });

    setTimeout(() => {
      setIsImportingExcel(false);
      setExcelFile(null);
      setParsedFacilities([]);
      setImportStatus({ type: 'idle', message: '' });
    }, 2000);
  };

  const handleDownloadInspTemplate = () => {
    const headers = [
      'Mã biên bản (Không bắt buộc)',
      'Mã cơ sở (*)',
      'Tên cơ sở (Để tham khảo)',
      'Ngày lập biên bản (*) (YYYY-MM-DD)',
      'Hình thức kiểm tra (*) (Định kỳ / Đột xuất)',
      'Đoàn kiểm tra / Cán bộ kiểm tra (Cách nhau bằng dấu phẩy)',
      'Kế hoạch kiểm tra',
      'Nội dung kiểm tra chính',
      'Kết quả kiểm tra (*) (Đạt yêu cầu / Không đạt yêu cầu)',
      'Tồn tại, sai phạm phát hiện (Nếu có)',
      'Căn cứ theo quy định',
      'Số tiền xử phạt (Nếu có - VNĐ)',
      'Hạn khắc phục (YYYY-MM-DD)',
      'Trạng thái xử lý lỗi (*) (Không có vi phạm / Chưa khắc phục / Đã khắc phục)',
      'Phân loại nhóm theo Phụ lục II (Nhóm I / Nhóm II)',
      'Lĩnh vực',
      'Phân loại cơ sở (Loại hình)',
      'Ngành nghề',
      'Trạng thái hoạt động của cơ sở (Hoạt động / Ngừng hoạt động / Tạm ngừng hoạt động)',
      'Lực lượng tại chỗ (Cơ sở / Chuyên ngành / Phân công)',
      'Số lượng lực lượng tại chỗ (người)',
      'Cán bộ quản lý địa bàn (Tên hoặc ID)',
      'Ghi chú'
    ];

    const sampleFac1 = facilities[0];
    const sampleFac2 = facilities[1];
    
    const sampleOfficer1 = officers?.[0];
    const sampleOfficer2 = officers?.[1];

    const row1 = [
      'INSP_EXCEL_001',
      sampleFac1?.id || 'FAC_001',
      sampleFac1?.name || 'Chung cư Cao cấp Vạn Phúc Plaza',
      new Date().toISOString().split('T')[0],
      'Định kỳ',
      'Nguyễn Văn A, Trần Văn B',
      'Kế hoạch kiểm tra an toàn PCCC Quý II - 2026',
      'Kiểm tra định kỳ hệ thống báo cháy, trụ nước chữa cháy, lối thoát hiểm của tòa nhà.',
      'Đạt yêu cầu',
      '',
      'Nghị định 136/2020/NĐ-CP',
      '',
      '',
      'Không có vi phạm',
      sampleFac1?.dangerLevel || 'Nhóm I',
      sampleFac1?.sector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
      sampleFac1?.category || 'Nhà chung cư',
      sampleFac1?.industry || 'Quản lý vận hành nhà chung cư',
      sampleFac1?.status || 'Hoạt động',
      sampleFac1?.localForceType || 'Cơ sở',
      sampleFac1?.localForceCount !== undefined ? String(sampleFac1.localForceCount) : '10',
      sampleOfficer1?.fullName || 'Nguyễn Văn Hùng',
      'Cơ sở duy trì tốt công tác PCCC thường trực'
    ];

    const row2 = [
      'INSP_EXCEL_002',
      sampleFac2?.id || 'FAC_002',
      sampleFac2?.name || 'Xưởng May Mặc Thành Đạt',
      new Date().toISOString().split('T')[0],
      'Đột xuất',
      'Trần Văn C',
      'Quyết định kiểm tra đột xuất số 120/QĐ-CAT',
      'Kiểm tra đột xuất điều kiện an toàn phòng cháy đối với khu sản xuất.',
      'Không đạt yêu cầu',
      'Hệ thống họng nước vách tường bị khóa van tổng; 02 bình chữa cháy hết hạn sạc khí.',
      'Nghị định 144/2021/NĐ-CP',
      '4500000',
      new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      'Chưa khắc phục',
      sampleFac2?.dangerLevel || 'Nhóm II',
      sampleFac2?.sector || 'Lĩnh vực cơ sở công nghiệp, nhà kho',
      sampleFac2?.category || 'Nhà sản xuất',
      sampleFac2?.industry || 'Sản xuất may mặc xuất khẩu',
      sampleFac2?.status || 'Hoạt động',
      sampleFac2?.localForceType || 'Cơ sở',
      sampleFac2?.localForceCount !== undefined ? String(sampleFac2.localForceCount) : '15',
      sampleOfficer2?.fullName || 'Lê Văn Tám',
      'Yêu cầu khắc phục dứt điểm trước thời hạn, đã lập biên bản xử phạt vi phạm hành chính.'
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, row1, row2]);
    ws['!cols'] = headers.map(() => ({ wch: 25 }));

    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Bien_Ban');
    XLSX.writeFile(wb, 'Mau_File_Bien_Ban_Kiem_Tra.xlsx');
  };

  const handleParseInspExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rawRows.length < 2) {
          setInspImportStatus({ type: 'error', message: 'File Excel trống hoặc không đúng cấu trúc.' });
          return;
        }

        const headers = rawRows[0].map((h: any) => String(h || '').trim());
        const dataRows = rawRows.slice(1);

        const headerTerms: Record<string, string[]> = {
          id: ['Mã biên bản', 'Ma bien ban', 'Mã BB', 'Mã', 'id'],
          facilityId: ['Mã cơ sở', 'Mã cơ sở (*)', 'Ma co so', 'facilityId'],
          facilityName: ['Tên cơ sở', 'Tên cơ sở (Để tham khảo)', 'Ten co so', 'facilityName'],
          date: ['Ngày lập biên bản', 'Ngày lập biên bản (*)', 'Ngày kiểm tra', 'Ngay lap bien ban', 'Ngay kiem tra', 'date'],
          type: ['Hình thức kiểm tra', 'Hình thức kiểm tra (*)', 'Hình thức', 'Loại biên bản', 'type'],
          inspectors: ['Đoàn kiểm tra / Cán bộ kiểm tra', 'Đoàn kiểm tra', 'Cán bộ kiểm tra', 'inspectors'],
          plan: ['Kế hoạch kiểm tra', 'Kế hoạch', 'plan'],
          content: ['Nội dung kiểm tra chính', 'Nội dung', 'Nội dung kiểm tra', 'content'],
          result: ['Kết quả kiểm tra', 'Kết quả kiểm tra (*)', 'Kết quả', 'result'],
          violations: ['Tồn tại, sai phạm phát hiện', 'Tồn tại', 'Sai phạm', 'violations'],
          legalBasis: ['Căn cứ theo quy định', 'Căn cứ pháp lý', 'Căn cứ', 'legalBasis'],
          fineAmount: ['Số tiền xử phạt', 'Số tiền xử phạt (Nếu có - VNĐ)', 'Số tiền xử phạt (VNĐ)', 'Tiền phạt', 'fineAmount'],
          deadline: ['Hạn khắc phục', 'Hạn khắc phục (YYYY-MM-DD)', 'Hạn khắc phục lỗi', 'deadline'],
          remedyStatus: ['Trạng thái xử lý lỗi', 'Trạng thái xử lý lỗi (*)', 'Trạng thái xử lý', 'remedyStatus'],
          appendixIi: ['Phân loại nhóm theo Phụ lục II', 'Phụ lục II', 'appendixIi'],
          sector: ['Lĩnh vực', 'Linh vuc', 'sector'],
          category: ['Phân loại cơ sở (Loại hình)', 'Phân loại cơ sở', 'Loại hình cơ sở', 'category'],
          industry: ['Ngành nghề', 'Nganh nghe', 'industry'],
          facilityStatus: ['Trạng thái hoạt động của cơ sở', 'Trạng thái hoạt động', 'facilityStatus'],
          localForceType: ['Lực lượng tại chỗ', 'localForceType'],
          localForceCount: ['Số lượng lực lượng tại chỗ (người)', 'Số lượng lực lượng tại chỗ', 'localForceCount'],
          officerId: ['Cán bộ quản lý địa bàn', 'Cán bộ quản lý địa bàn (Tên hoặc ID)', 'officerId'],
          notes: ['Ghi chú', 'notes']
        };

        const fallbackIndices: Record<string, number> = {
          id: 0, facilityId: 1, facilityName: 2, date: 3, type: 4, inspectors: 5, plan: 6, content: 7,
          result: 8, violations: 9, legalBasis: 10, fineAmount: 11, deadline: 12, remedyStatus: 13,
          appendixIi: 14, sector: 15, category: 16, industry: 17, facilityStatus: 18,
          localForceType: 19, localForceCount: 20, officerId: 21, notes: 22
        };

        const indices: Record<string, number> = {};
        Object.keys(headerTerms).forEach(key => {
          const terms = headerTerms[key];
          const foundIdx = headers.findIndex((h: string) => 
            terms.some(term => h.toLowerCase().includes(term.toLowerCase()))
          );
          indices[key] = foundIdx !== -1 ? foundIdx : fallbackIndices[key];
        });

        const parsed: any[] = [];
        dataRows.forEach((row: any[], rowIdx: number) => {
          if (!row || row.length === 0 || row.every(cell => cell === undefined || cell === '')) {
            return;
          }

          const rawId = String(row[indices.id] || '').trim();
          const rawFacilityId = String(row[indices.facilityId] || '').trim();
          const rawFacilityName = String(row[indices.facilityName] || '').trim();
          const rawDateStr = String(row[indices.date] || '').trim();
          const rawType = String(row[indices.type] || '').trim();
          const rawInspectors = String(row[indices.inspectors] || '').trim();
          const rawPlan = String(row[indices.plan] || '').trim();
          const rawContent = String(row[indices.content] || '').trim();
          const rawResult = String(row[indices.result] || '').trim();
          const rawViolations = String(row[indices.violations] || '').trim();
          const rawLegalBasis = String(row[indices.legalBasis] || '').trim();
          const rawFineAmount = String(row[indices.fineAmount] || '').trim();
          const rawDeadline = String(row[indices.deadline] || '').trim();
          const rawRemedyStatus = String(row[indices.remedyStatus] || '').trim();
          const rawAppendixIi = String(row[indices.appendixIi] || '').trim();
          const rawSector = String(row[indices.sector] || '').trim();
          const rawCategory = String(row[indices.category] || '').trim();
          const rawIndustry = String(row[indices.industry] || '').trim();
          const rawFacilityStatus = String(row[indices.facilityStatus] || '').trim();
          const rawLocalForceType = String(row[indices.localForceType] || '').trim();
          const rawLocalForceCount = String(row[indices.localForceCount] || '').trim();
          const rawOfficer = String(row[indices.officerId] || '').trim();
          const rawNotes = String(row[indices.notes] || '').trim();

          const errors: string[] = [];
          const warnings: string[] = [];

          if (!rawFacilityId) {
            errors.push('Thiếu Mã cơ sở');
          } else {
            const facExists = facilities.some(f => f.id.toLowerCase() === rawFacilityId.toLowerCase());
            if (!facExists) {
              warnings.push(`Mã cơ sở "${rawFacilityId}" chưa có trong hệ thống`);
            }
          }

          let dateFormatted = rawDateStr;
          if (!rawDateStr) {
            errors.push('Thiếu Ngày lập biên bản');
          } else {
            if (/^\d+(\.\d+)?$/.test(rawDateStr)) {
              const excelDateNum = Number(rawDateStr);
              const dateObj = new Date(Math.round((excelDateNum - 25569) * 86400 * 1000));
              dateFormatted = dateObj.toISOString().split('T')[0];
            } else {
              const d = new Date(rawDateStr);
              if (isNaN(d.getTime())) {
                errors.push('Ngày lập biên bản sai định dạng YYYY-MM-DD');
              } else {
                dateFormatted = d.toISOString().split('T')[0];
              }
            }
          }

          let typeNorm: 'Định kỳ' | 'Đột xuất' | 'Chuyên đề' = 'Định kỳ';
          if (rawType.includes('Đột xuất') || rawType.toLowerCase().includes('dot xuat')) {
            typeNorm = 'Đột xuất';
          } else if (rawType.includes('Chuyên đề') || rawType.toLowerCase().includes('chuyen de')) {
            typeNorm = 'Chuyên đề';
          }

          let resultNorm: 'Đạt yêu cầu' | 'Không đạt yêu cầu' = 'Đạt yêu cầu';
          if (rawResult.toLowerCase().includes('không đạt') || rawResult.toLowerCase().includes('khong dat') || rawResult === 'Không đạt yêu cầu') {
            resultNorm = 'Không đạt yêu cầu';
          }

          let remedyStatusNorm: 'Không có vi phạm' | 'Chưa khắc phục' | 'Đang khắc phục' | 'Đã khắc phục xong' | 'Đã khắc phục' = 'Chưa khắc phục';
          if (rawRemedyStatus) {
            if (rawRemedyStatus.includes('Không có vi phạm') || rawRemedyStatus.toLowerCase().includes('khong co vi pham')) {
              remedyStatusNorm = 'Không có vi phạm';
            } else if (rawRemedyStatus.includes('Đang khắc phục') || rawRemedyStatus.toLowerCase().includes('dang khac phuc')) {
              remedyStatusNorm = 'Đang khắc phục';
            } else if (rawRemedyStatus.includes('Đã khắc phục xong') || rawRemedyStatus.toLowerCase().includes('da khac phuc song')) {
              remedyStatusNorm = 'Đã khắc phục xong';
            } else if (rawRemedyStatus.includes('Đã khắc phục') || rawRemedyStatus.toLowerCase().includes('da khac phuc')) {
              remedyStatusNorm = 'Đã khắc phục';
            }
          } else {
            if (resultNorm === 'Đạt yêu cầu') {
              remedyStatusNorm = 'Không có vi phạm';
            }
          }

          let officerIdMatched = '';
          if (rawOfficer) {
            const officerObj = officers?.find(o => 
              o.fullName.toLowerCase() === rawOfficer.toLowerCase() ||
              o.id.toLowerCase() === rawOfficer.toLowerCase()
            );
            if (officerObj) {
              officerIdMatched = officerObj.id;
            } else {
              warnings.push(`Cán bộ "${rawOfficer}" không khớp`);
            }
          }

          let isDuplicate = false;
          let dupReason = '';
          
          const dbDup = inspections.find(i => 
            (rawId && i.id.toLowerCase() === rawId.toLowerCase()) ||
            (i.facilityId.toLowerCase() === rawFacilityId.toLowerCase() && i.date === dateFormatted)
          );

          const fileDup = parsed.find(p => 
            p.errors.length === 0 &&
            ((rawId && p.id.toLowerCase() === rawId.toLowerCase()) ||
             (p.facilityId.toLowerCase() === rawFacilityId.toLowerCase() && p.date === dateFormatted))
          );

          if (dbDup) {
            isDuplicate = true;
            dupReason = rawId && dbDup.id.toLowerCase() === rawId.toLowerCase()
              ? `Trùng Mã ID "${dbDup.id}" (Sẽ ghi đè)`
              : `Trùng ngày & mã cơ sở với biên bản đã có ngày ${formatDateDMY(dbDup.date)} (Sẽ ghi đè)`;
          } else if (fileDup) {
            isDuplicate = true;
            dupReason = 'Trùng với dòng khác trong file tải lên (Sẽ ghi đè)';
          }

          parsed.push({
            id: rawId || `INSP_IMPORT_${Date.now()}_${rowIdx}`,
            facilityId: rawFacilityId,
            facilityName: rawFacilityName || facilities.find(f => f.id.toLowerCase() === rawFacilityId.toLowerCase())?.name || 'Cơ sở mới',
            date: dateFormatted,
            type: typeNorm,
            inspectors: rawInspectors ? rawInspectors.split(',').map((n: string) => n.trim()) : [],
            plan: rawPlan,
            content: rawContent || 'Kiểm tra an toàn PCCC theo định kỳ cơ sở.',
            result: resultNorm,
            violations: rawViolations,
            legalBasis: rawLegalBasis,
            fineAmount: rawFineAmount ? Number(rawFineAmount) : undefined,
            deadline: rawDeadline,
            remedyStatus: remedyStatusNorm,
            appendixIi: rawAppendixIi || 'Nhóm I',
            sector: rawSector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
            category: rawCategory,
            industry: rawIndustry,
            facilityStatus: (rawFacilityStatus as any) || 'Hoạt động',
            localForceType: (rawLocalForceType as any) || 'Cơ sở',
            localForceCount: rawLocalForceCount ? Number(rawLocalForceCount) : 0,
            officerId: officerIdMatched || rawOfficer || undefined,
            notes: rawNotes,
            isDuplicate,
            dupReason,
            errors,
            warnings
          });
        });

        setParsedInspections(parsed);
        setInspImportStatus({ type: 'idle', message: `Đã đọc thành công ${parsed.length} dòng dữ liệu.` });
      } catch (err) {
        console.error(err);
        setInspImportStatus({ type: 'error', message: 'Lỗi khi đọc file Excel. Định dạng không hợp lệ.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitInspImport = () => {
    const validInsps = parsedInspections.filter(i => i.errors.length === 0);
    if (validInsps.length === 0) {
      setInspImportStatus({ type: 'error', message: 'Không có biên bản hợp lệ nào để nhập.' });
      return;
    }

    const updatedInsps = [...inspections];
    const updatedFacilities = [...facilities];

    validInsps.forEach(newInsp => {
      const schemaInsp: FireInspection = {
        id: newInsp.id,
        facilityId: newInsp.facilityId,
        date: newInsp.date,
        type: newInsp.type,
        inspectors: newInsp.inspectors,
        content: newInsp.content,
        result: newInsp.result,
        appendixIiCategory: newInsp.appendixIi,
        industry: newInsp.industry,
        sector: newInsp.sector,
        address: newInsp.address || facilities.find(f => f.id.toLowerCase() === newInsp.facilityId.toLowerCase())?.address || '',
        facilityCategory: newInsp.category,
        officerId: newInsp.officerId,
        inspectionPlan: newInsp.plan,
        violations: newInsp.violations || undefined,
        remedyDeadline: newInsp.deadline || undefined,
        remedyStatus: newInsp.remedyStatus,
        fineAmount: newInsp.fineAmount,
        facilityStatus: newInsp.facilityStatus,
        notes: newInsp.notes || undefined,
        legalBasis: newInsp.legalBasis || undefined,
        industrialZone: facilities.find(f => f.id.toLowerCase() === newInsp.facilityId.toLowerCase())?.industrialZone || 'Ngoài KCN, KCX, CCN',
        localForceType: newInsp.localForceType,
        localForceCount: newInsp.localForceCount,
      };

      const existingIdx = updatedInsps.findIndex(i => 
        i.id === schemaInsp.id || 
        (i.facilityId === schemaInsp.facilityId && i.date === schemaInsp.date)
      );

      if (existingIdx !== -1) {
        updatedInsps[existingIdx] = schemaInsp;
      } else {
        updatedInsps.push(schemaInsp);
      }

      const facIdx = updatedFacilities.findIndex(f => f.id.toLowerCase() === schemaInsp.facilityId.toLowerCase());
      if (facIdx !== -1) {
        updatedFacilities[facIdx] = {
          ...updatedFacilities[facIdx],
          status: schemaInsp.facilityStatus || updatedFacilities[facIdx].status,
          lastInspectionDate: schemaInsp.date,
          notes: schemaInsp.notes || updatedFacilities[facIdx].notes
        };
      }
    });

    setInspections(updatedInsps);
    setFacilities(updatedFacilities);
    localStorage.setItem('pccc_inspections', JSON.stringify(updatedInsps));
    localStorage.setItem('pccc_facilities', JSON.stringify(updatedFacilities));

    setInspImportStatus({
      type: 'success',
      message: `Đã nhập thành công ${validInsps.length} biên bản kiểm tra vào hệ thống!`
    });

    setTimeout(() => {
      setIsImportingInspExcel(false);
      setInspExcelFile(null);
      setParsedInspections([]);
      setInspImportStatus({ type: 'idle', message: '' });
    }, 2000);
  };

  const handleExportCategoryExcel = () => {
    // 1. Prepare statistics sheet content
    const headersStats = [
      'STT',
      'Loại hình cơ sở',
      'Số lượng cơ sở',
      'Tỷ lệ (%)'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const totalCount = facilities.length || 1;
    
    // Rows of category summary statistics
    const statsRows = CATEGORY_OPTIONS.map((cat, idx) => {
      const num = totalByCategory[cat] || 0;
      const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : '0.0';
      return [
        (idx + 1).toString(),
        cat,
        num.toString(),
        `${percent}%`
      ].map(escapeCSV).join(',');
    });

    const totalRow = [
      'Tổng cộng',
      'Tất cả loại hình',
      facilities.length.toString(),
      '100.0%'
    ].map(escapeCSV).join(',');

    // 2. Prepare detailed list grouped by Category
    const headersDetail = [
      'STT',
      'Loại hình cơ sở',
      'Mã cơ sở',
      'Tên cơ sở',
      'Địa chỉ',
      'Xã Phường',
      'Người đại diện',
      'Số điện thoại',
      'Cán bộ quản lý',
      'Trạng thái',
      'Cấp quản lý',
      'Phân loại Phụ lục II',
      'Ngày kiểm tra gần nhất'
    ];

    let detailRows: string[] = [];
    let absoluteIndex = 1;

    CATEGORY_OPTIONS.forEach(cat => {
      const facsOfCat = facilities.filter(f => f.category === cat);
      if (facsOfCat.length > 0) {
        facsOfCat.forEach(fac => {
          const assignedOfficer = officers?.find(o => o.id === fac.officerId);
          const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
          
          detailRows.push(
            [
              absoluteIndex.toString(),
              fac.category,
              fac.id,
              fac.name,
              fac.address,
              fac.ward,
              fac.representative,
              fac.phone,
              officerStr,
              fac.status,
              fac.managementLevel,
              fac.dangerLevel,
              fac.lastInspectionDate || 'Chưa kiểm tra'
            ].map(escapeCSV).join(',')
          );
          absoluteIndex++;
        });
      }
    });

    const fileTitleStats = ['BÁO CÁO THỐNG KÊ SỐ LƯỢNG CƠ SỞ THEO LOẠI HÌNH PCCC', '', '', ''].map(escapeCSV).join(',');
    const fileTitleDetail = ['DANH SÁCH CHI TIẾT CƠ SỞ PHÂN THEO LOẠI HÌNH', '', '', '', '', '', '', '', '', '', '', '', ''].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + [
      fileTitleStats,
      headersStats.map(escapeCSV).join(','),
      ...statsRows,
      totalRow,
      '',
      '',
      fileTitleDetail,
      headersDetail.map(escapeCSV).join(','),
      ...detailRows
    ].join('\n');

    // Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_Cao_Co_So_PCCC_Theo_Loai_Hinh.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSectorExcel = () => {
    // 1. Prepare statistics sheet content
    const headersStats = [
      'STT',
      'Lĩnh vực',
      'Số lượng cơ sở',
      'Tỷ lệ (%)'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const totalCount = facilities.length || 1;
    
    // Rows of sector summary statistics
    const statsRows = SECTOR_OPTIONS.map((sec, idx) => {
      const num = totalBySector[sec] || 0;
      const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : '0.0';
      return [
        (idx + 1).toString(),
        sec,
        num.toString(),
        `${percent}%`
      ].map(escapeCSV).join(',');
    });

    const totalRow = [
      'Tổng cộng',
      'Tất cả lĩnh vực',
      facilities.length.toString(),
      '100.0%'
    ].map(escapeCSV).join(',');

    // 2. Prepare detailed list grouped by Sector
    const headersDetail = [
      'STT',
      'Lĩnh vực',
      'Mã cơ sở',
      'Tên cơ sở',
      'Địa chỉ',
      'Xã Phường',
      'Loại hình cơ sở',
      'Người đại diện',
      'Số điện thoại',
      'Cán bộ quản lý',
      'Trạng thái',
      'Cấp quản lý',
      'Phân loại Phụ lục II',
      'Ngày kiểm tra gần nhất'
    ];

    let detailRows: string[] = [];
    let absoluteIndex = 1;

    SECTOR_OPTIONS.forEach(sec => {
      const facsOfSec = facilities.filter(f => f.sector === sec || (sec === 'Cơ sở khác' && !f.sector));
      if (facsOfSec.length > 0) {
        facsOfSec.forEach(fac => {
          const assignedOfficer = officers?.find(o => o.id === fac.officerId);
          const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
          
          detailRows.push(
            [
              absoluteIndex.toString(),
              fac.sector || 'Cơ sở khác',
              fac.id,
              fac.name,
              fac.address,
              fac.ward,
              fac.category,
              fac.representative,
              fac.phone,
              officerStr,
              fac.status,
              fac.managementLevel,
              fac.dangerLevel,
              fac.lastInspectionDate || 'Chưa kiểm tra'
            ].map(escapeCSV).join(',')
          );
          absoluteIndex++;
        });
      }
    });

    const fileTitleStats = ['BÁO CÁO THỐNG KÊ SỐ LƯỢNG CƠ SỞ THEO LĨNH VỰC PCCC', '', '', ''].map(escapeCSV).join(',');
    const fileTitleDetail = ['DANH SÁCH CHI TIẾT CƠ SỞ PHÂN THEO LĨNH VỰC', '', '', '', '', '', '', '', '', '', '', '', '', ''].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + [
      fileTitleStats,
      headersStats.map(escapeCSV).join(','),
      ...statsRows,
      totalRow,
      '',
      '',
      fileTitleDetail,
      headersDetail.map(escapeCSV).join(','),
      ...detailRows
    ].join('\n');

    // Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_Cao_Co_So_PCCC_Theo_Linh_Vuc.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWardExcel = () => {
    // 1. Prepare statistics sheet content
    const headersStats = [
      'STT',
      'Địa bàn / Phường xã',
      'Số lượng cơ sở',
      'Tỷ lệ (%)'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const totalCount = facilities.length || 1;
    
    // Rows of ward summary statistics
    const statsRows = WARD_OPTIONS.map((ward, idx) => {
      const num = totalByWard[ward] || 0;
      const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : '0.0';
      return [
        (idx + 1).toString(),
        ward,
        num.toString(),
        `${percent}%`
      ].map(escapeCSV).join(',');
    });

    const totalRow = [
      'Tổng cộng',
      'Tất cả địa bàn',
      facilities.length.toString(),
      '100.0%'
    ].map(escapeCSV).join(',');

    // 2. Prepare detailed list grouped by Ward
    const headersDetail = [
      'STT',
      'Địa bàn / Phường xã',
      'Mã cơ sở',
      'Tên cơ sở',
      'Địa chỉ',
      'Loại hình cơ sở',
      'Người đại diện',
      'Số điện thoại',
      'Cán bộ quản lý',
      'Trạng thái',
      'Cấp quản lý',
      'Phân loại Phụ lục II',
      'Ngày kiểm tra gần nhất'
    ];

    let detailRows: string[] = [];
    let absoluteIndex = 1;

    WARD_OPTIONS.forEach(ward => {
      const facsOfWard = facilities.filter(f => f.ward === ward);
      if (facsOfWard.length > 0) {
        facsOfWard.forEach(fac => {
          const assignedOfficer = officers?.find(o => o.id === fac.officerId);
          const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
          
          detailRows.push(
            [
              absoluteIndex.toString(),
              fac.ward,
              fac.id,
              fac.name,
              fac.address,
              fac.category,
              fac.representative,
              fac.phone,
              officerStr,
              fac.status,
              fac.managementLevel,
              fac.dangerLevel,
              fac.lastInspectionDate || 'Chưa kiểm tra'
            ].map(escapeCSV).join(',')
          );
          absoluteIndex++;
        });
      }
    });

    const fileTitleStats = ['BÁO CÁO THỐNG KÊ SỐ LƯỢNG CƠ SỞ THEO ĐỊA BÀN PHƯỜNG/XÃ PCCC', '', '', ''].map(escapeCSV).join(',');
    const fileTitleDetail = ['DANH SÁCH CHI TIẾT CƠ SỞ PHÂN THEO ĐỊA BÀN PHƯỜNG/XÃ', '', '', '', '', '', '', '', '', '', '', '', ''].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + [
      fileTitleStats,
      headersStats.map(escapeCSV).join(','),
      ...statsRows,
      totalRow,
      '',
      '',
      fileTitleDetail,
      headersDetail.map(escapeCSV).join(','),
      ...detailRows
    ].join('\n');

    // Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_Cao_Co_So_PCCC_Theo_Dia_Ban.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDossierExcel = () => {
    const headers = [
      'STT',
      'Mã cơ sở',
      'Tên cơ sở',
      'Số hồ sơ nghiệp vụ',
      'Ngày lập',
      'Cán bộ quản lý',
      'Ghi chú'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const dossierFacilities = facilities.filter(f => f.dossierNumber);
    const rows = dossierFacilities.map((f, idx) => {
      const assignedOfficer = officers?.find(o => o.id === f.officerId);
      const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
      
      return [
        (idx + 1).toString(),
        f.id,
        f.name,
        f.dossierNumber || '',
        f.createdDate ? formatDateDMY(f.createdDate) : '',
        officerStr,
        f.notes || ''
      ].map(escapeCSV).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh_Sach_Co_So_Da_Lap_Ho_So_Nghiep_Vu_PCCC.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportNonDossierExcel = () => {
    const headers = [
      'STT',
      'Mã cơ sở',
      'Tên cơ sở',
      'Xã, phường',
      'Địa chỉ chi tiết',
      'Điện thoại',
      'Phân loại theo phụ lục II',
      'Cán bộ quản lý',
      'Ghi chú'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const nonDossierFacilities = facilities.filter(f => !f.dossierNumber);
    const rows = nonDossierFacilities.map((f, idx) => {
      const assignedOfficer = officers?.find(o => o.id === f.officerId);
      const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
      
      return [
        (idx + 1).toString(),
        f.id,
        f.name,
        f.ward,
        f.address,
        f.phone || '',
        f.dangerLevel || 'Không phân loại',
        officerStr,
        f.notes || ''
      ].map(escapeCSV).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh_Sach_Co_So_Chua_Lap_Ho_So_Nghiep_Vu_PCCC.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportIndustrialZoneExcel = () => {
    // 1. Prepare statistics sheet content
    const headersStats = [
      'STT',
      'Vị trí địa lý',
      'Số lượng cơ sở',
      'Tỷ lệ (%)'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const totalCount = facilities.length || 1;

    const zones = [
      { key: 'KCN, KCX', label: 'Trong KCN' },
      { key: 'CCN', label: 'Trong CCN' },
      { key: 'Ngoài KCN, KCX, CCN', label: 'Ngoài KCN, CCN' }
    ];

    const statsRows = zones.map((z, idx) => {
      const num = facilities.filter(f => {
        const zoneVal = f.industrialZone || 'Ngoài KCN, KCX, CCN';
        return zoneVal === z.key;
      }).length;
      const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : '0.0';
      return [
        (idx + 1).toString(),
        z.label,
        num.toString(),
        `${percent}%`
      ].map(escapeCSV).join(',');
    });

    const totalRow = [
      'Tổng cộng',
      'Tất cả cơ sở',
      facilities.length.toString(),
      '100.0%'
    ].map(escapeCSV).join(',');

    // 2. Prepare detailed list grouped by Industrial Zone
    const headersDetail = [
      'STT',
      'Vị trí địa lý',
      'Mã cơ sở',
      'Tên cơ sở',
      'Địa chỉ',
      'Xã Phường',
      'Người đại diện',
      'Số điện thoại',
      'Cán bộ quản lý',
      'Trạng thái',
      'Cấp quản lý',
      'Phân loại Phụ lục II',
      'Ngày kiểm tra gần nhất'
    ];

    let detailRows: string[] = [];
    let absoluteIndex = 1;

    zones.forEach(z => {
      const facsOfZone = facilities.filter(f => {
        const zoneVal = f.industrialZone || 'Ngoài KCN, KCX, CCN';
        return zoneVal === z.key;
      });
      if (facsOfZone.length > 0) {
        facsOfZone.forEach(fac => {
          const assignedOfficer = officers?.find(o => o.id === fac.officerId);
          const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
          
          detailRows.push(
            [
              absoluteIndex.toString(),
              z.label,
              fac.id,
              fac.name,
              fac.address,
              fac.ward,
              fac.representative,
              fac.phone,
              officerStr,
              fac.status,
              fac.managementLevel,
              fac.dangerLevel,
              fac.lastInspectionDate || 'Chưa kiểm tra'
            ].map(escapeCSV).join(',')
          );
          absoluteIndex++;
        });
      }
    });

    const fileTitleStats = ['BÁO CÁO THỐNG KÊ SỐ LƯỢNG CƠ SỞ THEO KHU/CỤM CÔNG NGHIỆP', '', '', ''].map(escapeCSV).join(',');
    const fileTitleDetail = ['DANH SÁCH CHI TIẾT CƠ SỞ PHÂN THEO KHU/CỤM CÔNG NGHIỆP', '', '', '', '', '', '', '', '', '', '', '', ''].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + [
      fileTitleStats,
      headersStats.map(escapeCSV).join(','),
      ...statsRows,
      totalRow,
      '',
      '',
      fileTitleDetail,
      headersDetail.map(escapeCSV).join(','),
      ...detailRows
    ].join('\n');

    // Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_Cao_Co_So_PCCC_Theo_Khu_Cum_Cong_Nghiep.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOfficerStatsExcel = () => {
    const headers = [
      'STT',
      'Tên cán bộ',
      'Phụ lục II - Nhóm I',
      'Phụ lục II - Nhóm II',
      'Trong KCN',
      'Trong CCN',
      'Ngoài KCN, CCN',
      'Tổng số cơ sở'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const rows = (officers || []).filter(o => o.position !== 'Chiến sĩ').map((o, idx) => {
      const assignedFacs = facilities.filter(f => f.officerId === o.id);
      const countI = assignedFacs.filter(f => f.dangerLevel === 'Nhóm I').length;
      const countII = assignedFacs.filter(f => f.dangerLevel === 'Nhóm II').length;
      const countKCN = assignedFacs.filter(f => f.industrialZone === 'KCN, KCX').length;
      const countCCN = assignedFacs.filter(f => f.industrialZone === 'CCN').length;
      const countOther = assignedFacs.filter(f => !f.industrialZone || f.industrialZone === 'Ngoài KCN, KCX, CCN').length;
      const total = assignedFacs.length;

      return [
        (idx + 1).toString(),
        `${o.rank} ${o.fullName}`,
        countI.toString(),
        countII.toString(),
        countKCN.toString(),
        countCCN.toString(),
        countOther.toString(),
        total.toString()
      ].map(escapeCSV).join(',');
    });

    // Add unassigned row if any
    const unassignedFacs = facilities.filter(f => !f.officerId || !(officers || []).some(o => o.id === f.officerId));
    if (unassignedFacs.length > 0) {
      const unI = unassignedFacs.filter(f => f.dangerLevel === 'Nhóm I').length;
      const unII = unassignedFacs.filter(f => f.dangerLevel === 'Nhóm II').length;
      const unKCN = unassignedFacs.filter(f => f.industrialZone === 'KCN, KCX').length;
      const unCCN = unassignedFacs.filter(f => f.industrialZone === 'CCN').length;
      const unOther = unassignedFacs.filter(f => !f.industrialZone || f.industrialZone === 'Ngoài KCN, KCX, CCN').length;
      const unTotal = unassignedFacs.length;

      rows.push([
        (rows.length + 1).toString(),
        'Cơ sở chưa phân công cán bộ',
        unI.toString(),
        unII.toString(),
        unKCN.toString(),
        unCCN.toString(),
        unOther.toString(),
        unTotal.toString()
      ].map(escapeCSV).join(','));
    }

    // Add total row
    const totalI = facilities.filter(f => f.dangerLevel === 'Nhóm I').length;
    const totalII = facilities.filter(f => f.dangerLevel === 'Nhóm II').length;
    const totalKCN = facilities.filter(f => f.industrialZone === 'KCN, KCX').length;
    const totalCCN = facilities.filter(f => f.industrialZone === 'CCN').length;
    const totalOther = facilities.filter(f => !f.industrialZone || f.industrialZone === 'Ngoài KCN, KCX, CCN').length;
    const totalAll = facilities.length;

    const totalRow = [
      'Tổng cộng',
      'Tất cả cơ sở',
      totalI.toString(),
      totalII.toString(),
      totalKCN.toString(),
      totalCCN.toString(),
      totalOther.toString(),
      totalAll.toString()
    ].map(escapeCSV).join(',');

    const fileTitle = ['THỐNG KÊ PHÂN CÔNG QUẢN LÝ CƠ SỞ THEO CÁN BỘ', '', '', '', '', '', '', ''].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + [
      fileTitle,
      headers.map(escapeCSV).join(','),
      ...rows,
      totalRow
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Thong_Ke_Phan_Cong_Can_Bo_PCCC.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUninspectedFacilities = () => {
    const uninspected = facilities.filter(f => {
      const hasInspectionInPeriod = inspections.some(i => {
        if (i.facilityId !== f.id) return false;
        const matchesStartDate = !statsStartDate || i.date >= statsStartDate;
        const matchesEndDate = !statsEndDate || i.date <= statsEndDate;
        const iOfficerId = i.officerId || f.officerId;
        const matchesOfficer = inspOfficerFilter === 'All' || iOfficerId === inspOfficerFilter;
        return matchesStartDate && matchesEndDate && matchesOfficer;
      });
      
      const matchesOfficerAssignment = inspOfficerFilter === 'All' || f.officerId === inspOfficerFilter;
      return !hasInspectionInPeriod && matchesOfficerAssignment;
    });

    const headers = [
      'STT',
      'Mã cơ sở',
      'Tên cơ sở',
      'Địa chỉ chi tiết',
      'Xã, phường',
      'Khu công nghiệp / Cụm công nghiệp',
      'Người đại diện',
      'Điện thoại',
      'Lĩnh vực',
      'Phân loại cơ sở',
      'Ngành nghề',
      'Trạng thái hoạt động',
      'Năm hoạt động',
      'Thành phần kinh tế',
      'Hình thức đầu tư',
      'Hình thức sở hữu',
      'Phân loại theo phụ lục II',
      'Lực lượng tại chỗ',
      'Số lượng lực lượng tại chỗ (người)',
      'Thẩm quyền quản lý',
      'Số hồ sơ nghiệp vụ',
      'Ngày lập',
      'Cán bộ quản lý địa bàn',
      'Ghi chú'
    ];

    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    const rows = uninspected.map((fac, idx) => {
      const assignedOfficer = officers?.find(o => o.id === fac.officerId);
      const officerStr = assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công';
      
      return [
        (idx + 1).toString(),
        fac.id,
        fac.name,
        fac.address,
        fac.ward,
        fac.industrialZone || 'Ngoài KCN, KCX, CCN',
        fac.representative,
        fac.phone,
        fac.sector || '',
        fac.category,
        fac.industry || '',
        fac.status,
        fac.operationYear || '',
        fac.economicSector || '',
        fac.investmentType || '',
        fac.ownershipType || '',
        fac.dangerLevel,
        fac.localForceType || 'Cơ sở',
        fac.localForceCount !== undefined ? fac.localForceCount.toString() : '0',
        fac.managementLevel,
        fac.dossierNumber || '',
        fac.createdDate || '',
        officerStr,
        fac.notes || ''
      ].map(escapeCSV).join(',');
    });

    let periodStr = 'Toàn bộ thời gian';
    if (statsStartDate && statsEndDate) {
      periodStr = `từ ${formatDateDMY(statsStartDate)} đến ${formatDateDMY(statsEndDate)}`;
    } else if (statsStartDate) {
      periodStr = `từ ngày ${formatDateDMY(statsStartDate)}`;
    } else if (statsEndDate) {
      periodStr = `đến ngày ${formatDateDMY(statsEndDate)}`;
    }

    let titleText = `DANH SÁCH CƠ SỞ CHƯA ĐƯỢC KIỂM TRA PCCC GIAI ĐOẠN ${periodStr.toUpperCase()}`;
    if (inspOfficerFilter !== 'All') {
      const selectedOfficer = officers?.find(o => o.id === inspOfficerFilter);
      if (selectedOfficer) {
        titleText += ` - CÁN BỘ PHỤ TRÁCH: ${selectedOfficer.rank.toUpperCase()} ${selectedOfficer.fullName.toUpperCase()}`;
      }
    }

    const fileTitle = [titleText, ...Array(headers.length - 1).fill('')].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + [
      fileTitle,
      headers.map(escapeCSV).join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileNameDatePart = (statsStartDate ? `${statsStartDate}_` : '') + (statsEndDate ? `${statsEndDate}` : '');
    const fileName = `Co_So_Chua_Kiem_Tra_PCCC_${fileNameDatePart || 'Toan_Thoi_Gian'}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers Inspection
  const handleDeleteAttachment = (inspId: string, fileName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tệp "${fileName}" khỏi biên bản này?`)) {
      const updatedInspections = inspections.map(insp => {
        if (insp.id === inspId) {
          return {
            ...insp,
            attachments: insp.attachments ? insp.attachments.filter(f => f !== fileName) : []
          };
        }
        return insp;
      });
      setInspections(updatedInspections);
    }
  };

  const handleDownloadAttachment = (fileName: string) => {
    if (!fileName) return;
    const element = document.createElement("a");
    const file = new Blob(["Nội dung mô phỏng cho tệp đính kèm: " + fileName], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleOpenEditInspection = (insp: FireInspection) => {
    setEditingInspection(insp);
    setInspFacId(insp.facilityId);
    setInspDate(insp.date);
    setInspType(insp.type);
    setInspInspectors(insp.inspectors.join(', '));
    setInspContent(insp.content);
    setInspResultVal(insp.result);
    setInspAppendixIi(insp.appendixIiCategory || '');
    setInspIndustry(insp.industry || '');
    setInspSector(insp.sector || '');
    setInspAddress(insp.address || '');
    setInspFacilityCategory(insp.facilityCategory || '');
    setInspOfficerId(insp.officerId || '');
    setInspViolations(insp.violations || '');
    setInspDeadline(insp.remedyDeadline || '');
    setInspRemedyStatus(insp.remedyStatus);
    setInspPlan(insp.inspectionPlan || '');
    setInspAttachments(insp.attachments || []);
    setInspFineAmount(insp.fineAmount);
    setInspFacilityStatus(insp.facilityStatus || 'Hoạt động');
    setInspNotes(insp.notes || '');
    setInspLegalBasis(insp.legalBasis || '');
    setInspIndustrialZone(insp.industrialZone || 'Ngoài KCN, KCX, CCN');
    setInspLocalForceType(insp.localForceType || 'Cơ sở');
    setInspLocalForceCount(insp.localForceCount || 0);
    setIsAddingInspection(false);
  };

  const handleOpenAddInspection = (defaultFacId?: string) => {
    const fac = facilities.find(f => f.id === defaultFacId);
    setEditingInspection(null);
    setInspFacId(defaultFacId || (facilities[0]?.id || ''));
    setInspDate(new Date().toISOString().split('T')[0]);
    setInspType('Định kỳ');
    setInspInspectors(store.currentUser?.fullName || '');
    setInspContent('');
    setInspResultVal('Đạt yêu cầu');
    setInspAppendixIi(fac?.dangerLevel || 'Nhóm I');
    setInspIndustry(fac?.industry || '');
    setInspSector(fac?.sector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng');
    setInspAddress(fac?.address || '');
    setInspFacilityCategory(fac?.category || '');
    setInspOfficerId(fac?.officerId || '');
    setInspViolations('');
    setInspDeadline('');
    setInspRemedyStatus('Không có vi phạm');
    setInspPlan('');
    setInspAttachments(['BB_PCCC_MOCK_2026.pdf']);
    setInspFineAmount(undefined);
    setInspFacilityStatus(fac?.status || 'Hoạt động');
    setInspNotes(fac?.notes || '');
    setInspLegalBasis('');
    setInspIndustrialZone(fac?.industrialZone || 'Ngoài KCN, KCX, CCN');
    setInspLocalForceType(fac?.localForceType || 'Cơ sở');
    setInspLocalForceCount(fac?.localForceCount || 0);
    setIsAddingInspection(true);
  };

  const handleFacilityChange = (facId: string) => {
    setInspFacId(facId);
    const fac = facilities.find(f => f.id === facId);
    if (fac) {
      setInspAppendixIi(fac.dangerLevel || 'Nhóm I');
      setInspIndustry(fac.industry || '');
      setInspSector(fac.sector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng');
      setInspAddress(fac.address || '');
      setInspFacilityCategory(fac.category || '');
      setInspOfficerId(fac.officerId || '');
      setInspFacilityStatus(fac.status || 'Hoạt động');
      setInspNotes(fac.notes || '');
      setInspIndustrialZone(fac.industrialZone || 'Ngoài KCN, KCX, CCN');
      setInspLocalForceType(fac.localForceType || 'Cơ sở');
      setInspLocalForceCount(fac.localForceCount || 0);
    }
  };

  const handleSaveInspection = (e: any) => {
    e.preventDefault();
    if (!inspFacId) return alert('Vui lòng lựa chọn cơ sở đã kiểm tra');

    // Check for duplicate inspection with same facility and date
    const isDuplicate = inspections.some(i => 
      i.facilityId === inspFacId && 
      i.date === inspDate && 
      (!editingInspection || i.id !== editingInspection.id)
    );

    if (isDuplicate) {
      const selectedFacility = facilities.find(f => f.id === inspFacId);
      const facName = selectedFacility ? selectedFacility.name : 'cơ sở này';
      const confirmSave = window.confirm(
        `Cảnh báo: Biên bản kiểm tra cho "${facName}" vào ngày ${inspDate} đã tồn tại!\nBạn có chắc chắn muốn tiếp tục lưu không?`
      );
      if (!confirmSave) return;
    }

    const body: Omit<FireInspection, 'id'> = {
      facilityId: inspFacId,
      date: inspDate,
      type: inspType,
      inspectors: inspInspectors.split(',').map(n => n.trim()),
      content: inspContent,
      result: inspResultVal,
      appendixIiCategory: inspAppendixIi,
      industry: inspIndustry,
      sector: inspSector,
      address: inspAddress,
      facilityCategory: inspFacilityCategory,
      officerId: inspOfficerId,
      inspectionPlan: inspPlan,
      violations: inspViolations,
      remedyDeadline: inspDeadline,
      remedyStatus: inspRemedyStatus,
      attachments: inspAttachments,
      fineAmount: inspFineAmount,
      facilityStatus: inspFacilityStatus,
      notes: inspNotes || undefined,
      legalBasis: inspLegalBasis || undefined,
      industrialZone: inspIndustrialZone || undefined,
      localForceType: inspLocalForceType || undefined,
      localForceCount: inspLocalForceCount !== undefined ? Number(inspLocalForceCount) : undefined,
    };

    if (isAddingInspection) {
      setInspections([...inspections, { id: `INSP_${Date.now()}`, ...body }]);
    } else if (editingInspection) {
      setInspections(inspections.map(i => i.id === editingInspection.id ? { ...i, ...body } : i));
    }

    // Update facility's status and notes as well to sync
    setFacilities(facilities.map(f => f.id === inspFacId ? { ...f, status: inspFacilityStatus, notes: inspNotes || undefined } : f));

    setEditingInspection(null);
    setIsAddingInspection(false);
  };

  const handleDeleteInspection = (id: string) => {
    const insp = inspections.find(i => i.id === id);
    const dateStr = insp ? formatDateDMY(insp.date) : '';
    const facName = facilities.find(f => f.id === insp?.facilityId)?.name || '';
    const desc = `Biên bản kiểm tra ngày ${dateStr} tại ${facName || 'cơ sở'}`;
    setDeleteConfirmation({ id, name: desc, type: 'inspection' });
  };

  // Filters logic
  const filteredFacilities = facilities.filter(f => {
    const query = facSearch.toLowerCase();
    const officer = officers?.find(o => o.id === f.officerId);
    const officerName = officer ? `${officer.rank} ${officer.fullName}`.toLowerCase() : '';
    
    const matchesSearch = f.name.toLowerCase().includes(query) || 
                          f.address.toLowerCase().includes(query) ||
                          f.representative.toLowerCase().includes(query) ||
                          f.id.toLowerCase().includes(query) ||
                          (f.phone && f.phone.toLowerCase().includes(query)) ||
                          (f.industry && f.industry.toLowerCase().includes(query)) ||
                          (f.dossierNumber && f.dossierNumber.toLowerCase().includes(query)) ||
                          f.ward.toLowerCase().includes(query) ||
                          f.category.toLowerCase().includes(query) ||
                          f.managementLevel.toLowerCase().includes(query) ||
                          f.dangerLevel.toLowerCase().includes(query) ||
                          f.status.toLowerCase().includes(query) ||
                          (f.sector && f.sector.toLowerCase().includes(query)) ||
                          (f.createdDate && f.createdDate.toLowerCase().includes(query)) ||
                          (f.lastInspectionDate && f.lastInspectionDate.toLowerCase().includes(query)) ||
                          (f.operationYear && f.operationYear.toLowerCase().includes(query)) ||
                          (f.economicSector && f.economicSector.toLowerCase().includes(query)) ||
                          (f.investmentType && f.investmentType.toLowerCase().includes(query)) ||
                          (f.ownershipType && f.ownershipType.toLowerCase().includes(query)) ||
                          (f.notes && f.notes.toLowerCase().includes(query)) ||
                          (f.industrialZone && f.industrialZone.toLowerCase().includes(query)) ||
                          (f.localForceType && f.localForceType.toLowerCase().includes(query)) ||
                          (f.localForceCount !== undefined && String(f.localForceCount).includes(query)) ||
                          officerName.includes(query);

    const matchesWard = facWard === 'All' || f.ward === facWard;
    const matchesDanger = facDanger === 'All' || f.dangerLevel === facDanger;
    const matchesManagementLevel = facManagementLevelFilter === 'All' || f.managementLevel === facManagementLevelFilter;
    const matchesSector = facSectorFilter === 'All' || f.sector === facSectorFilter;
    const matchesCategory = facCategoryFilter === 'All' || f.category === facCategoryFilter;
    const matchesOfficer = facOfficerFilter === 'All' || f.officerId === facOfficerFilter;
    const matchesStatus = facStatusFilter === 'All' || f.status === facStatusFilter;
    const matchesIndustry = facIndustryFilter === 'All' || f.industry === facIndustryFilter;
    return matchesSearch && matchesWard && matchesDanger && matchesManagementLevel && matchesSector && matchesCategory && matchesOfficer && matchesStatus && matchesIndustry;
  });

  const filteredInspections = inspections.filter(i => {
    const facility = facilities.find(f => f.id === i.facilityId);
    const query = inspSearch.toLowerCase();
    const matchesSearch = (facility?.name || '').toLowerCase().includes(query) || 
                          (facility?.representative || '').toLowerCase().includes(query) ||
                          (facility?.address || '').toLowerCase().includes(query) ||
                          (facility?.id || '').toLowerCase().includes(query) ||
                          i.content.toLowerCase().includes(query) ||
                          i.id.toLowerCase().includes(query);
    const matchesResult = inspResult === 'All' || i.result === inspResult;
    
    // Filter by date range
    const matchesStartDate = !statsStartDate || i.date >= statsStartDate;
    const matchesEndDate = !statsEndDate || i.date <= statsEndDate;
    
    // Filter by officer (direct or via facility)
    const iOfficerId = i.officerId || facility?.officerId;
    const matchesOfficer = inspOfficerFilter === 'All' || iOfficerId === inspOfficerFilter;
    
    // Filter by inspection type
    const matchesType = inspTypeFilter === 'All' || i.type === inspTypeFilter;
    
    return matchesSearch && matchesResult && matchesStartDate && matchesEndDate && matchesOfficer && matchesType;
  });

  // Basic stats counts for sub-tab analytics (uses facilities so statistics represent the full database list)
  const totalByWard = facilities.reduce((acc, f) => {
    acc[f.ward] = (acc[f.ward] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalByCategory = facilities.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalByDanger = facilities.reduce((acc, f) => {
    const danger = f.dangerLevel || 'Chưa phân loại';
    acc[danger] = (acc[danger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalByIndustrialZone = facilities.reduce((acc, f) => {
    const zone = f.industrialZone || 'Ngoài KCN, KCX, CCN';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBySector = facilities.reduce((acc, f) => {
    const sector = f.sector || 'Cơ sở khác';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Thống kê số lượng cơ sở theo cán bộ quản lý
  const officerStats = (officers || []).filter(o => o.position !== 'Chiến sĩ').map(o => {
    const assignedFacs = facilities.filter(f => f.officerId === o.id);
    const countI = assignedFacs.filter(f => f.dangerLevel === 'Nhóm I').length;
    const countII = assignedFacs.filter(f => f.dangerLevel === 'Nhóm II').length;
    const total = assignedFacs.length;
    
    // Đã kiểm tra = số lượng biên bản kiểm tra (inspections count)
    const inspected = inspections.filter(i => {
      if (i.officerId) return i.officerId === o.id;
      const fac = facilities.find(f => f.id === i.facilityId);
      return fac?.officerId === o.id;
    }).length;

    // Còn lại (Chưa KT) = số lượng cơ sở chưa có bất kỳ biên bản kiểm tra nào
    const remaining = assignedFacs.filter(f => !inspections.some(i => i.facilityId === f.id)).length;

    return {
      id: o.id,
      name: `${o.rank} ${o.fullName}`,
      unit: o.unit,
      countI,
      countII,
      total,
      inspected,
      remaining,
    };
  }).filter(stat => stat.total > 0);

  // Cơ sở chưa có cán bộ phân công
  const unassignedI = facilities.filter(f => (!f.officerId || !(officers || []).some(o => o.id === f.officerId)) && f.dangerLevel === 'Nhóm I').length;
  const unassignedII = facilities.filter(f => (!f.officerId || !(officers || []).some(o => o.id === f.officerId)) && f.dangerLevel === 'Nhóm II').length;
  const unassignedTotal = unassignedI + unassignedII;
  
  // Đã kiểm tra (không phân công) = số lượng biên bản kiểm tra không có cán bộ phân công hợp lệ
  const unassignedInspected = inspections.filter(i => {
    const oId = i.officerId || facilities.find(f => f.id === i.facilityId)?.officerId;
    return !oId || !(officers || []).some(o => o.id === oId);
  }).length;

  // Còn lại = số cơ sở không phân công và chưa có biên bản nào
  const unassignedRemaining = facilities.filter(f => {
    const hasOfficer = f.officerId && (officers || []).some(o => o.id === f.officerId);
    if (hasOfficer) return false;
    return !inspections.some(i => i.facilityId === f.id);
  }).length;

  return (
    <div className="space-y-6" id="fire-protection-module">
      {/* Visual Module header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-650" />
            CÔNG TÁC PHÒNG CHÁY
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Theo dõi, định kỳ kiểm tra các cơ sở thuộc thẩm quyền phân quyền và lưu trữ hồ sơ xử phạt, vi phạm an toàn chống cháy.
          </p>
          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>
        
        {/* Navigation sub-tabs & Actions */}
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

          <div className="flex p-1 rounded-lg bg-slate-100 border border-slate-200">
            <button
              id="subtab-facilities"
              onClick={() => setSubTab('facilities')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${subTab === 'facilities' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              Danh sách Cơ sở
            </button>
            <button
              id="subtab-inspections"
              onClick={() => setSubTab('inspections')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${subTab === 'inspections' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              Kết quả kiểm tra
            </button>
            <button
              id="subtab-analytics"
              onClick={() => setSubTab('analytics')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${subTab === 'analytics' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              Báo cáo Biến động
            </button>
          </div>
        </div>
      </div>

      {/* Main Module Layout based on selected Sub-tab */}
      {subTab === 'facilities' && (
        <div className="space-y-4 font-sans" id="protection-facilities-panel">
          {/* Search and filters bar for facilities list */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 no-print">
            <div className="relative flex items-center xl:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                id="facility-search-input"
                type="text"
                placeholder="Tìm tất cả nội dung phiếu khai báo cơ sở (tên, ĐD, SĐT, cán bộ, KCN, CCN, ghi chú...)"
                value={facSearch}
                onChange={(e) => setFacSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs"
              />
              {facSearch && (
                <button
                  type="button"
                  onClick={() => setFacSearch('')}
                  className="absolute right-2.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Xóa tất cả ký tự"
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              )}
            </div>
            <div>
              <select
                id="facility-ward-filter"
                value={facWard}
                onChange={(e) => setFacWard(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Tất cả Phường/Xã ---</option>
                {WARD_OPTIONS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="facility-category-filter"
                value={facCategoryFilter}
                onChange={(e) => setFacCategoryFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Loại hình cơ sở ---</option>
                {FAC_CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="facility-sector-filter"
                value={facSectorFilter}
                onChange={(e) => setFacSectorFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Lĩnh vực ---</option>
                {SECTOR_OPTIONS.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="facility-industry-filter"
                value={facIndustryFilter}
                onChange={(e) => setFacIndustryFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Ngành nghề ---</option>
                {INDUSTRY_OPTIONS.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="facility-danger-filter"
                value={facDanger}
                onChange={(e) => setFacDanger(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Phụ lục II ---</option>
                <option value="Nhóm I">Nhóm I</option>
                <option value="Nhóm II">Nhóm II</option>
              </select>
            </div>
            <div>
              <select
                id="facility-management-level-filter"
                value={facManagementLevelFilter}
                onChange={(e) => setFacManagementLevelFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Cấp quản lý ---</option>
                <option value="Cấp tỉnh quản lý">Cấp tỉnh quản lý</option>
                <option value="Cấp xã quản lý">Cấp xã quản lý</option>
              </select>
            </div>
            <div>
              <select
                id="facility-officer-filter"
                value={facOfficerFilter}
                onChange={(e) => setFacOfficerFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs cursor-pointer bg-white"
              >
                <option value="All">--- Cán bộ quản lý ---</option>
                {officers?.filter(o => o.position !== 'Chiến sĩ').map(o => (
                  <option key={o.id} value={o.id}>
                    {o.rank} {o.fullName} ({o.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="facility-status-filter"
                value={facStatusFilter}
                onChange={(e) => setFacStatusFilter(e.target.value)}
                className={`w-full p-2 border rounded-lg text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  facStatusFilter === 'All'
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-350'
                    : facStatusFilter === 'Hoạt động'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : facStatusFilter === 'Tạm ngừng hoạt động'
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-rose-300 bg-rose-50 text-rose-800'
                }`}
              >
                <option value="All" className="bg-white text-slate-700 font-normal">--- Trạng thái hoạt động ---</option>
                <option value="Hoạt động" className="bg-emerald-50 text-emerald-800 font-extrabold">🟢 Hoạt động</option>
                <option value="Tạm ngừng hoạt động" className="bg-amber-50 text-amber-800 font-extrabold">🟡 Tạm ngừng hoạt động</option>
                <option value="Ngừng hoạt động" className="bg-rose-50 text-rose-800 font-extrabold">🔴 Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List block */}
            <div className="lg:col-span-2 space-y-3 max-h-[720px] overflow-y-auto pr-2 scroll-smooth" id="facilities-list-viewport">
              {/* Action and Count Bar */}
              <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-xs gap-3 no-print">
                <div className="flex items-center gap-3">
                  {/* Select All Circle Button */}
                  <button
                    id="select-all-btn"
                    onClick={() => {
                      const allFilteredIds = filteredFacilities.map(f => f.id);
                      const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedFacilityIds.includes(id));
                      if (isAllSelected) {
                        setSelectedFacilityIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                      } else {
                        setSelectedFacilityIds(prev => {
                          const newIds = [...prev];
                          allFilteredIds.forEach(id => {
                            if (!newIds.includes(id)) {
                              newIds.push(id);
                            }
                          });
                          return newIds;
                        });
                      }
                    }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      filteredFacilities.length > 0 && filteredFacilities.every(f => selectedFacilityIds.includes(f.id))
                        ? 'bg-blue-600 border-blue-600 shadow-xs text-white'
                        : 'border-slate-350 hover:border-slate-450 bg-white text-slate-400'
                    }`}
                    title={filteredFacilities.length > 0 && filteredFacilities.every(f => selectedFacilityIds.includes(f.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả cơ sở hiển thị"}
                  >
                    {filteredFacilities.length > 0 && filteredFacilities.every(f => selectedFacilityIds.includes(f.id)) && (
                      <svg className="w-3 h-3 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                  <div className="text-slate-500 text-xs">
                    Hiển thị <span className="font-extrabold text-slate-850 bg-slate-100 px-2 py-0.5 rounded font-mono">{filteredFacilities.length}</span> cơ sở quản lý
                    {selectedFacilityIds.length > 0 && (
                      <span className="ml-2 font-medium text-slate-500">
                        (Đã chọn <span className="text-blue-600 font-extrabold font-mono">{selectedFacilityIds.filter(id => filteredFacilities.some(f => f.id === id)).length}</span>)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {selectedFacilityIds.length > 0 && (
                    <button
                      id="transfer-selected-fac-to-insp-btn"
                      onClick={() => {
                        const targetId = selectedFacilityIds[0];
                        setSubTab('inspections');
                        handleOpenAddInspection(targetId);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title="Chuyển dữ liệu cơ sở đã chọn để lập Biên bản kiểm tra mới"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Lập biên bản cơ sở đã chọn
                    </button>
                  )}
                  {selectedFacilityIds.length > 0 && (
                    <button
                      id="clear-selection-btn"
                      onClick={() => setSelectedFacilityIds([])}
                      className="text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-150 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      Bỏ chọn tất cả
                    </button>
                  )}
                  <button
                    id="export-excel-btn"
                    onClick={handleExportExcel}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    title="Xuất danh sách cơ sở hiện tại ra file Excel (CSV)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Xuất file Excel
                  </button>
                  <button
                    id="import-excel-btn"
                    onClick={() => {
                      setIsImportingExcel(true);
                      setExcelFile(null);
                      setParsedFacilities([]);
                      setImportStatus({ type: 'idle', message: '' });
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    title="Nhập danh sách cơ sở từ file Excel (.xlsx, .xls)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Thêm từ Excel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredFacilities.map(fac => {
                  const assignedOfficer = officers?.find(o => o.id === fac.officerId);
                  const isSelected = selectedFacilityIds.includes(fac.id);
                  return (
                    <div 
                      key={fac.id}
                      id={`facility-card-${fac.id}`}
                      onClick={() => {
                        setEditingFacility(null);
                        setIsAddingFacility(false);
                        handleOpenEditFacility(fac);
                      }}
                      className={`bg-white p-5 rounded-xl border cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between relative ${
                        isSelected 
                          ? 'border-blue-500 ring-3 ring-blue-500/10 bg-blue-50/5' 
                          : editingFacility?.id === fac.id 
                            ? 'border-red-500 ring-2 ring-red-500/10' 
                            : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          {/* Circular Selection Checkbox */}
                          <button
                            id={`select-fac-btn-${fac.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFacilityIds(prev => 
                                prev.includes(fac.id) 
                                  ? prev.filter(id => id !== fac.id) 
                                  : [...prev, fac.id]
                              );
                            }}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 shadow-xs text-white'
                                : 'border-slate-300 hover:border-slate-400 bg-white text-slate-300'
                            }`}
                            title={isSelected ? "Bỏ chọn" : "Chọn cơ sở"}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 pr-[110px]">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{fac.name}</h4>
                          </div>
                        </div>

                        <div className="space-y-1 text-slate-500 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                            {fac.industry && (
                              <span className="px-2 py-0.5 text-[9.5px] font-semibold text-slate-600 rounded whitespace-nowrap bg-slate-50 border border-slate-150" title="Ngành nghề">
                                Ngành: {fac.industry}
                              </span>
                            )}
                            {fac.status && (
                              <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded whitespace-nowrap border ${
                                fac.status === 'Hoạt động' || fac.status === 'Đang hoạt động'
                                  ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : fac.status === 'Tạm ngừng hoạt động' || fac.status === 'Tạm dừng hoạt động' || fac.status === 'Đang cải tạo'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`} title="Trạng thái hoạt động">
                                {fac.status}
                              </span>
                            )}
                          </div>

                          {(fac.dangerLevel || fac.sector || fac.industrialZone) && (
                            <div className="flex flex-wrap items-center gap-1.5 pb-1">
                              {fac.dangerLevel && (
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono border text-[9px] ${
                                  fac.dangerLevel === 'Nhóm I'
                                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                                    : 'bg-sky-50 text-sky-700 border-sky-100'
                                }`} title="Phân loại nhóm (Phụ lục II)">
                                  <span className="text-[8.5px] opacity-75 font-bold">NHÓM:</span>
                                  <span className="font-semibold">{fac.dangerLevel}</span>
                                </span>
                              )}
                              {fac.sector && (
                                <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-100 text-[9px]" title="Lĩnh vực quản lý">
                                  <span className="text-[8.5px] text-amber-500 font-bold">LĨNH VỰC:</span>
                                  <span className="font-semibold line-clamp-1 max-w-[220px]">{fac.sector}</span>
                                </span>
                              )}
                              {fac.industrialZone && fac.id !== '8025000981330' && (
                                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-100 text-[9px]" title="Khu công nghiệp / Cụm công nghiệp">
                                  <span className="text-[8.5px] text-indigo-500 font-bold">VÙNG:</span>
                                  <span className="font-semibold">{fac.industrialZone}</span>
                                </span>
                              )}
                              {(fac.localForceType || fac.localForceCount !== undefined) && fac.id !== '8025000981330' && (
                                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 text-[9px]" title="Lực lượng tại chỗ">
                                  <span className="text-[8.5px] text-emerald-500 font-bold">LLTC:</span>
                                  <span className="font-semibold">{fac.localForceType || 'Cơ sở'} {fac.localForceCount !== undefined ? `(${fac.localForceCount} người)` : ''}</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">
                              {fac.address} - {fac.ward && (fac.ward.startsWith('Phường') || fac.ward.startsWith('Xã') ? fac.ward : `Phường ${fac.ward}`)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Đại diện: {fac.representative} - </span>
                            <span className="font-mono">{fac.phone}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1.5 text-[10.5px]">
                            <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono border border-blue-100 placeholder-tag" title="Mã cơ sở">
                              <span className="text-[9.5px] text-blue-400 font-bold">MÃ:</span>
                              <span className="font-semibold text-blue-705">{fac.id}</span>
                            </div>
                            {fac.dossierNumber && (
                              <div className="flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-100" title="Số hồ sơ nghiệp vụ">
                                <span className="text-[9px] text-slate-400 font-bold">HS:</span>
                                <span className="font-semibold text-slate-700">{fac.dossierNumber}</span>
                              </div>
                            )}
                            {fac.createdDate && (
                              <div className="flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-100" title="Ngày lập hồ sơ">
                                <span className="text-[9px] text-slate-400 font-bold">LẬP:</span>
                                <span className="font-semibold text-slate-700">{fac.createdDate}</span>
                              </div>
                            )}
                          </div>
                          {fac.notes && (
                            <div className="mt-2.5 text-[10.5px] text-slate-500 bg-amber-50/40 border border-amber-100 p-2 rounded-lg flex items-start gap-1.5 leading-relaxed">
                              <span className="font-bold shrink-0 text-slate-650 bg-amber-100/55 px-1 py-0.5 rounded text-[9.5px]">GHI CHÚ:</span>
                              <span className="italic">{fac.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10.5px] font-semibold text-slate-500 italic">
                        Cán bộ quản lý: {assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          id={`delete-facility-${fac.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFacility(fac.id, fac.name);
                          }}
                          className="p-1 px-1.5 bg-red-50 hover:bg-red-150 text-red-650 rounded text-xs"
                        >
                          Xóa
                        </button>
                        <button
                          id={`edit-facility-${fac.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditFacility(fac);
                          }}
                          className="p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Hiệu chỉnh
                        </button>
                      </div>
                    </div>
                  </div>
                ); })}

                {filteredFacilities.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto text-slate-350 stroke-1 mb-2" />
                    Không tìm thấy cơ sở nào khớp với các điều kiện lọc.
                  </div>
                )}
              </div>
            </div>

            {/* Right Form panel */}
            <div id="facility-setup-form">
              {(editingFacility || isAddingFacility) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest text-[#1e293b]">
                      {isAddingFacility ? 'Khai báo Cơ sở Quản lý' : 'Hiệu chỉnh Cơ sở'}
                    </h3>
                    <button 
                      id="close-fac-form"
                      onClick={() => {
                        setEditingFacility(null);
                        setIsAddingFacility(false);
                      }} 
                      className="text-slate-400 p-1 hover:bg-slate-50"
                    >
                      X
                    </button>
                  </div>

                  <form onSubmit={handleSaveFacility} className="space-y-4 text-xs font-semibold text-slate-600">
                    <div>
                      <label className="block mb-1 text-slate-650">Mã cơ sở *</label>
                      <input
                        id="fac-form-id"
                        type="text"
                        required
                        value={facId}
                        onChange={(e) => setFacId(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 font-mono"
                        placeholder="FAC_XXX"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Tên cơ sở kinh doanh, công trình *</label>
                      <input
                        id="fac-form-name"
                        type="text"
                        required
                        value={facName}
                        onChange={(e) => setFacName(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        placeholder="Chung cư cao tầng ABCD..."
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Địa chỉ chi tiết *</label>
                      <input
                        id="fac-form-address"
                        type="text"
                        required
                        value={facAddress}
                        onChange={(e) => setFacAddress(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        placeholder="Số 1, đường ABC..."
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Xã / phường</label>
                      <input
                        id="fac-form-ward"
                        type="text"
                        list="ward-suggestions"
                        value={facW}
                        onChange={(e) => setFacW(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        placeholder="Nhập xã / phường..."
                      />
                      <datalist id="ward-suggestions">
                        {WARD_OPTIONS.map(opt => (
                          <option key={opt} value={opt} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block mb-1">Khu công nghiệp / Cụm công nghiệp</label>
                      <select
                        id="fac-form-industrial-zone"
                        value={facIndustrialZone || 'Ngoài KCN, KCX, CCN'}
                        onChange={(e) => setFacIndustrialZone(e.target.value as any)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                      >
                        <option value="KCN, KCX">KCN, KCX</option>
                        <option value="CCN">CCN</option>
                        <option value="Ngoài KCN, KCX, CCN">Ngoài KCN, KCX, CCN</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Người đại diện *</label>
                        <input
                          id="fac-form-rep"
                          type="text"
                          required
                          value={facRep}
                          onChange={(e) => setFacRep(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Điện thoại *</label>
                        <input
                          id="fac-form-phone"
                          type="text"
                          required
                          value={facPhone}
                          onChange={(e) => setFacPhone(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Phân loại theo Lĩnh vực *</label>
                      <select
                        id="fac-form-sector"
                        required
                        value={facSector}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFacSector(value);
                          const relatedCats = SECTOR_CATEGORIES[value] || [];
                          if (relatedCats.length > 0) {
                            setFacCategory(relatedCats[0]);
                          } else {
                            setFacCategory('');
                          }
                        }}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px]"
                      >
                        {SECTOR_OPTIONS.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Phân loại cơ sở *</label>
                      <select
                        id="fac-form-category"
                        required
                        value={facCategory}
                        onChange={(e) => setFacCategory(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px]"
                      >
                        {(SECTOR_CATEGORIES[facSector] || []).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        {facCategory && !(SECTOR_CATEGORIES[facSector] || []).includes(facCategory) && (
                          <option value={facCategory}>{facCategory}</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label id="fac-form-industry-label" className="block mb-1">Ngành nghề *</label>
                      <input
                        id="fac-form-industry"
                        type="text"
                        required
                        value={facIndustry}
                        onChange={(e) => setFacIndustry(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        placeholder="Gia công kim loại, Dịch vụ Karaoke, Bán lẻ v.v."
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Trạng thái hoạt động *</label>
                      <select
                        id="fac-form-status"
                        required
                        value={facStatus}
                        onChange={(e) => setFacStatus(e.target.value as any)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px]"
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                        <option value="Tạm ngừng hoạt động">Tạm ngừng hoạt động</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3" id="fac-form-operation-economic-row">
                      <div>
                        <label id="fac-form-operation-year-label" className="block mb-1">Năm đưa vào hoạt động</label>
                        <input
                          id="fac-form-operation-year"
                          type="text"
                          value={facOperationYear}
                          onChange={(e) => setFacOperationYear(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                          placeholder="VD: 2024, 2026..."
                        />
                      </div>
                      <div>
                        <label id="fac-form-economic-sector-label" className="block mb-1">Thành phần kinh tế</label>
                        <select
                          id="fac-form-economic-sector"
                          value={facEconomicSector}
                          onChange={(e) => setFacEconomicSector(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 bg-white cursor-pointer"
                        >
                          <option value="">-- Chọn thành phần --</option>
                          <option value="Nhà nước">Nhà nước</option>
                          <option value="Tập thể">Tập thể</option>
                          <option value="Tư nhân">Tư nhân</option>
                          <option value="Có vốn đầu tư nước ngoài">Có vốn đầu tư nước ngoài</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3" id="fac-form-investment-ownership-row">
                      <div>
                        <label id="fac-form-investment-type-label" className="block mb-1">Hình thức đầu tư</label>
                        <select
                          id="fac-form-investment-type"
                          value={facInvestmentType}
                          onChange={(e) => setFacInvestmentType(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 bg-white cursor-pointer text-xs"
                        >
                          <option value="">-- Chọn hình thức đầu tư --</option>
                          <option value="Nước ngoài">Nước ngoài</option>
                          <option value="Trong nước">Trong nước</option>
                          <option value="Liên doanh với nước ngoài">Liên doanh với nước ngoài</option>
                        </select>
                      </div>
                      <div>
                        <label id="fac-form-ownership-type-label" className="block mb-1">Hình thức sở hữu</label>
                        <select
                          id="fac-form-ownership-type"
                          value={facOwnershipType}
                          onChange={(e) => setFacOwnershipType(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 bg-white cursor-pointer text-xs"
                        >
                          <option value="">-- Chọn hình thức sở hữu --</option>
                          <option value="Thuê">Thuê</option>
                          <option value="Chính chủ">Chính chủ</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Phân loại theo Phụ lục II</label>
                        <select
                          id="fac-form-danger"
                          value={facDangerLevel}
                          onChange={(e) => setFacDangerLevel(e.target.value as any)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        >
                          <option value="Nhóm I">Nhóm I</option>
                          <option value="Nhóm II">Nhóm II</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Diện quản lý</label>
                        <select
                          id="fac-form-level"
                          value={facLevel}
                          onChange={(e) => setFacLevel(e.target.value as any)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px]"
                        >
                          <option value="Cấp tỉnh quản lý">Cấp tỉnh quản lý</option>
                          <option value="Cấp xã quản lý">Cấp xã quản lý</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3" id="fac-form-local-force-row">
                      <div>
                        <label className="block mb-1">Lực lượng tại chỗ</label>
                        <select
                          id="fac-form-local-force-type"
                          value={facLocalForceType || 'Cơ sở'}
                          onChange={(e) => setFacLocalForceType(e.target.value as any)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 bg-white"
                        >
                          <option value="Cơ sở">Cơ sở</option>
                          <option value="Chuyên ngành">Chuyên ngành</option>
                          <option value="Phân công">Phân công</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Số lượng (người)</label>
                        <input
                          id="fac-form-local-force-count"
                          type="number"
                          min="0"
                          value={facLocalForceCount}
                          onChange={(e) => setFacLocalForceCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                          placeholder="Số lượng thành viên"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3" id="fac-form-additional-metadata-row">
                      <div>
                        <label id="fac-form-dossier-label" className="block mb-1">Số hồ sơ nghiệp vụ</label>
                        <input
                          id="fac-form-dossier"
                          type="text"
                          value={facDossierNumber}
                          onChange={(e) => setFacDossierNumber(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                          placeholder="VD: HS-PCCC-001/2026"
                        />
                      </div>
                      <div>
                        <label id="fac-form-created-date-label" className="block mb-1">Ngày lập</label>
                        <input
                          id="fac-form-created-date"
                          type="date"
                          value={facCreatedDate}
                          onChange={(e) => setFacCreatedDate(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Cán bộ quản lý địa bàn *</label>
                      <select
                        id="fac-form-officer"
                        required
                        value={facOfficerId}
                        onChange={(e) => setFacOfficerId(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px]"
                      >
                        <option value="">- Chọn cán bộ phụ trách * -</option>
                        {officers?.filter(o => o.position !== 'Chiến sĩ').map(o => (
                          <option key={o.id} value={o.id}>
                            {o.rank} {o.fullName} ({o.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-slate-700">Ghi chú</label>
                      <textarea
                        id="fac-form-notes"
                        value={facNotes}
                        onChange={(e) => setFacNotes(e.target.value)}
                        placeholder="Nhập ghi chú thêm về tụ điểm/cơ sở..."
                        className="w-full p-2 border border-slate-200 rounded text-[11px] h-16 resize-y focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>



                    <button
                      id="save-fac-submit-btn"
                      type="submit"
                      className="w-full py-2.5 bg-red-650 hover:bg-red-750 active:scale-[0.99] text-white font-extrabold rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer uppercase"
                    >
                      <Save className="w-4 h-4" />
                      CẬP NHẬT & LƯU THÔNG TIN
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
                  <Building2 className="w-10 h-10 text-slate-350 stroke-1" />
                  <p className="max-w-[240px] leading-relaxed">
                    Lựa chọn cơ sở để kiểm kê mức độ nguy hiểm hoặc thiết lập thêm mới các tụ điểm dân cư dưới diện bám trực.
                  </p>
                  <button
                    id="add-facility-placeholder-btn"
                    onClick={handleOpenAddFacility}
                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm cơ sở mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'inspections' && (
        <div className="space-y-4" id="protection-inspections-panel">
          {/* Date range statistics panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4 animate-fade-in" id="date-range-stats-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-red-655 text-red-600" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                  Thống kê &amp; bộ lọc ngày nghiệp vụ kiểm tra
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 no-print">
                <span>Bộ lọc:</span>
                {statsStartDate || statsEndDate || inspOfficerFilter !== 'All' || inspTypeFilter !== 'All' || inspResult !== 'All' || inspSearch ? (
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1 animate-pulse font-mono">
                    Đang lọc
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono">
                    Toàn thời gian
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end no-print">
              <div>
                <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Từ ngày (Bắt đầu)</label>
                <input
                  id="stats-start-date-input"
                  type="date"
                  value={statsStartDate}
                  onChange={(e) => setStatsStartDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Đến ngày (Kết thúc)</label>
                <input
                  id="stats-end-date-input"
                  type="date"
                  value={statsEndDate}
                  onChange={(e) => setStatsEndDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 tracking-wider mb-1.5 uppercase">Cán bộ quản lý</label>
                <select
                  id="stats-officer-filter"
                  value={inspOfficerFilter}
                  onChange={(e) => setInspOfficerFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer"
                >
                  <option value="All">--- Tất cả cán bộ ---</option>
                  {officers?.filter(o => o.position !== 'Chiến sĩ').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.rank} {o.fullName} ({o.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {(statsStartDate || statsEndDate || inspOfficerFilter !== 'All' || inspTypeFilter !== 'All' || inspResult !== 'All' || inspSearch) && (
                  <button
                    id="stats-clear-filter"
                    type="button"
                    onClick={() => {
                      setStatsStartDate('');
                      setStatsEndDate('');
                      setInspOfficerFilter('All');
                      setInspTypeFilter('All');
                      setInspResult('All');
                      setInspSearch('');
                    }}
                    className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 border border-red-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Calculations and analysis based on selected date range */}
            {(() => {
              const rangeInspections = inspections.filter(i => {
                const matchesStartDate = !statsStartDate || i.date >= statsStartDate;
                const matchesEndDate = !statsEndDate || i.date <= statsEndDate;
                const facility = facilities.find(f => f.id === i.facilityId);
                const iOfficerId = i.officerId || facility?.officerId;
                const matchesOfficer = inspOfficerFilter === 'All' || iOfficerId === inspOfficerFilter;
                return matchesStartDate && matchesEndDate && matchesOfficer;
              });

              const rangeTotalCount = rangeInspections.length;
              const rangeOkCount = rangeInspections.filter(i => i.result === 'Đạt yêu cầu').length;
              const rangeFailCount = rangeInspections.filter(i => i.result === 'Không đạt yêu cầu').length;
              const rangeFineTotal = rangeInspections.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

              // Calculate stats for Nhóm I and Nhóm II separately based on the inspections
              const rangeGroupIInspections = rangeInspections.filter(i => {
                const group = i.appendixIiCategory || facilities.find(f => f.id === i.facilityId)?.dangerLevel || 'Nhóm I';
                return group === 'Nhóm I';
              });
              const rangeGroupIIInspections = rangeInspections.filter(i => {
                const group = i.appendixIiCategory || facilities.find(f => f.id === i.facilityId)?.dangerLevel || 'Nhóm II';
                return group === 'Nhóm II';
              });

              const rangeGroupICount = rangeGroupIInspections.length;
              const rangeGroupI_OkCount = rangeGroupIInspections.filter(i => i.result === 'Đạt yêu cầu').length;
              const rangeGroupI_FailCount = rangeGroupIInspections.filter(i => i.result === 'Không đạt yêu cầu').length;
              const rangeGroupIFineTotal = rangeGroupIInspections.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

              const rangeGroupIICount = rangeGroupIIInspections.length;
              const rangeGroupII_OkCount = rangeGroupIIInspections.filter(i => i.result === 'Đạt yêu cầu').length;
              const rangeGroupII_FailCount = rangeGroupIIInspections.filter(i => i.result === 'Không đạt yêu cầu').length;
              const rangeGroupIIFineTotal = rangeGroupIIInspections.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-center">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Tổng lượt biên bản</span>
                      <strong className="text-xl font-black font-mono text-slate-800 block">{rangeTotalCount}</strong>
                      <span className="text-[9.5px] text-slate-400 font-medium block">lượt kiểm kê</span>
                    </div>
                    <div className="p-3 bg-emerald-50/50 border border-emerald-150 rounded-xl space-y-1 text-center">
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block">Đạt yêu cầu</span>
                      <strong className="text-xl font-black font-mono text-emerald-600 block">{rangeOkCount}</strong>
                      <span className="text-[9.5px] font-bold block text-emerald-600">
                        {rangeTotalCount > 0 ? ((rangeOkCount / rangeTotalCount) * 100).toFixed(0) : 0}% tỉ lệ đạt
                      </span>
                    </div>
                    <div className="p-3 bg-red-50/50 border border-red-150 rounded-xl space-y-1 text-center">
                      <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-widest block">Không đạt yêu cầu</span>
                      <strong className="text-xl font-black font-mono text-red-600 block">{rangeFailCount}</strong>
                      <span className="text-[9.5px] text-red-500 font-bold block">
                        {rangeTotalCount > 0 ? ((rangeFailCount / rangeTotalCount) * 100).toFixed(0) : 0}% tỉ lệ chưa đạt
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-150 rounded-xl space-y-1 text-center">
                      <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-widest block">Tổng tiền phạt</span>
                      <strong className="text-xl font-black font-mono text-amber-700 block">{rangeFineTotal.toLocaleString('vi-VN')}</strong>
                      <span className="text-[9.5px] text-amber-600 font-bold block">
                        VNĐ lũy kế
                      </span>
                    </div>
                  </div>

                  {/* Detailed statistics breakdown by Nhóm I / Nhóm II */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Nhóm I card */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <h4 className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider">
                            Cơ sở Nhóm I (Phụ lục II)
                          </h4>
                        </div>
                        <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-extrabold border border-red-100">
                          {rangeGroupICount} lượt kiểm tra
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-emerald-50/40 rounded-lg border border-emerald-100/50">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Đạt yêu cầu</span>
                          <span className="text-sm font-black font-mono text-emerald-600 block">{rangeGroupI_OkCount}</span>
                          <span className="text-[8.5px] font-bold text-emerald-500 block">
                            {rangeGroupICount > 0 ? ((rangeGroupI_OkCount / rangeGroupICount) * 100).toFixed(0) : 0}% tỉ lệ đạt
                          </span>
                        </div>
                        <div className="p-2 bg-rose-50/40 rounded-lg border border-rose-100/50">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Chưa đạt</span>
                          <span className="text-sm font-black font-mono text-red-600 block">{rangeGroupI_FailCount}</span>
                          <span className="text-[8.5px] font-bold text-slate-500 block">
                            {rangeGroupICount > 0 ? ((rangeGroupI_FailCount / rangeGroupICount) * 100).toFixed(0) : 0}% chưa đạt
                          </span>
                        </div>
                      </div>
                      {rangeGroupIFineTotal > 0 && (
                        <div className="text-center pt-1.5 border-t border-dashed border-slate-200">
                          <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Tiền phạt Nhóm I: </span>
                          <span className="text-xs font-black font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100/50">{rangeGroupIFineTotal.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                      )}
                    </div>

                    {/* Nhóm II card */}
                    <div className="bg-slate-50/50 border border-slate-105 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <h4 className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider">
                            Cơ sở Nhóm II (Phụ lục II)
                          </h4>
                        </div>
                        <span className="text-[10px] bg-sky-50 text-sky-600 px-2.5 py-0.5 rounded-full font-extrabold border border-sky-100">
                          {rangeGroupIICount} lượt kiểm tra
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-emerald-50/40 rounded-lg border border-emerald-100/50">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Đạt yêu cầu</span>
                          <span className="text-sm font-black font-mono text-emerald-600 block">{rangeGroupII_OkCount}</span>
                          <span className="text-[8.5px] font-bold text-emerald-500 block">
                            {rangeGroupIICount > 0 ? ((rangeGroupII_OkCount / rangeGroupIICount) * 100).toFixed(0) : 0}% tỉ lệ đạt
                          </span>
                        </div>
                        <div className="p-2 bg-rose-50/40 rounded-lg border border-rose-100/50">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Chưa đạt</span>
                          <span className="text-sm font-black font-mono text-red-600 block">{rangeGroupII_FailCount}</span>
                          <span className="text-[8.5px] font-bold text-slate-500 block">
                            {rangeGroupIICount > 0 ? ((rangeGroupII_FailCount / rangeGroupIICount) * 100).toFixed(0) : 0}% chưa đạt
                          </span>
                        </div>
                      </div>
                      {rangeGroupIIFineTotal > 0 && (
                        <div className="text-center pt-1.5 border-t border-dashed border-slate-200">
                          <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Tiền phạt Nhóm II: </span>
                          <span className="text-xs font-black font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">{rangeGroupIIFineTotal.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(rangeTotalCount > 0 || statsStartDate || statsEndDate) && (() => {
                    const uninspectedCount = facilities.filter(f => {
                      const hasInspectionInPeriod = inspections.some(i => {
                        if (i.facilityId !== f.id) return false;
                        const matchesStartDate = !statsStartDate || i.date >= statsStartDate;
                        const matchesEndDate = !statsEndDate || i.date <= statsEndDate;
                        const iOfficerId = i.officerId || f.officerId;
                        const matchesOfficer = inspOfficerFilter === 'All' || iOfficerId === inspOfficerFilter;
                        return matchesStartDate && matchesEndDate && matchesOfficer;
                      });
                      const matchesOfficerAssignment = inspOfficerFilter === 'All' || f.officerId === inspOfficerFilter;
                      return !hasInspectionInPeriod && matchesOfficerAssignment;
                    }).length;

                    return (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 px-3.5 py-2.5 rounded-lg border border-slate-100 text-[11px] font-bold text-slate-600 no-print gap-2">
                        <span className="text-slate-500">
                          {rangeTotalCount > 0 ? (
                            <>Tìm thấy <span className="text-slate-800 font-extrabold font-mono">{rangeTotalCount}</span> biên bản phù hợp giai đoạn.</>
                          ) : (
                            <>Không tìm thấy biên bản kiểm tra nào phù hợp giai đoạn.</>
                          )}
                          {uninspectedCount > 0 && (
                            <span className="ml-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">
                              Có <span className="font-extrabold font-mono">{uninspectedCount}</span> cơ sở chưa kiểm tra
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            id="export-uninspected-facilities-btn"
                            type="button"
                            onClick={handleExportUninspectedFacilities}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all shadow-xs cursor-pointer text-[10.5px]"
                            title="Xuất danh sách cơ sở chưa được kiểm tra trong giai đoạn này"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Xuất cơ sở chưa kiểm tra ({uninspectedCount})
                          </button>
                          {rangeTotalCount > 0 && (
                            <button
                              id="export-range-insp-btn"
                              type="button"
                              onClick={() => {
                                const headers = [
                                  'STT',
                                  'Hình thức kiểm tra',
                                  'Cán bộ thực hiện',
                                  'Mã cơ sở trên TTCH',
                                  'Tên cơ sở',
                                  'Địa chỉ',
                                  'Xã, phường',
                                  'Trong KCN, ngoài KCN',
                                  'Phân loại nhóm',
                                  'Phân loại cơ sở',
                                  'Ngành nghề',
                                  'Lực lượng tại chỗ',
                                  'Số lượng lực lượng tại chỗ (người)',
                                  'Tình trạng hoạt động',
                                  'Ngày kiểm tra',
                                  'Kế hoạch kiểm tra',
                                  'Kết quả kiểm tra',
                                  'Nội dung vi phạm',
                                  'Căn cứ vi phạm',
                                  'Số tiền xử phạt (triệu đồng)',
                                  'Thời hạn khắc phục',
                                  'Trạng thái khắc phục',
                                  'Ghi chú'
                                ];
                                const rows = rangeInspections.map((insp, idx) => {
                                  const facility = facilities.find(f => f.id === insp.facilityId);
                                  const oId = insp.officerId || facility?.officerId;
                                  const off = officers?.find(o => o.id === oId);
                                  const officerText = off ? `${off.rank} ${off.fullName}` : 'Chưa phân công';
                                  
                                  const fullAddress = insp.address || facility?.address || '';
                                  const nameText = facility ? facility.name : 'Không rõ';
                                  const isInKcnText = insp.industrialZone || facility?.industrialZone || (
                                    (
                                      fullAddress.toLowerCase().includes('kcn') ||
                                      fullAddress.toLowerCase().includes('khu công nghiệp') ||
                                      fullAddress.toLowerCase().includes('phước đông') ||
                                      fullAddress.toLowerCase().includes('trảng bàng') ||
                                      fullAddress.toLowerCase().includes('thành thành công') ||
                                      fullAddress.toLowerCase().includes('chà là') ||
                                      nameText.toLowerCase().includes('kcn') ||
                                      nameText.toLowerCase().includes('khu công nghiệp')
                                    ) ? 'KCN, KCX' : 'Ngoài KCN, KCX, CCN'
                                  );

                                  const fineInMillions = insp.fineAmount ? (insp.fineAmount / 1000000).toString() : '0';
                                  
                                  return [
                                    (idx + 1).toString(),
                                    insp.type,
                                    officerText,
                                    insp.facilityId || facility?.id || '',
                                    nameText,
                                    fullAddress,
                                    facility?.ward || '',
                                    isInKcnText,
                                    insp.appendixIiCategory || facility?.dangerLevel || 'Không phân loại',
                                    insp.facilityCategory || facility?.category || 'Không phân loại',
                                    insp.industry || facility?.industry || 'Không có',
                                    insp.localForceType || facility?.localForceType || 'Cơ sở',
                                    (insp.localForceCount !== undefined ? insp.localForceCount : facility?.localForceCount !== undefined ? facility?.localForceCount : 0).toString(),
                                    insp.facilityStatus || facility?.status || 'Đang hoạt động',
                                    insp.date,
                                    insp.inspectionPlan || 'Không theo kế hoạch',
                                    insp.result,
                                    insp.violations || 'Không có',
                                    insp.legalBasis || 'Không có',
                                    fineInMillions,
                                    insp.remedyDeadline || 'Không có',
                                    insp.remedyStatus || 'Không có vi phạm',
                                    insp.notes || ''
                                  ];
                                });
                                const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(v => {
                                  const clean = String(v || '').replace(/"/g, '""').replace(/\r?\n/g, ' ');
                                  return `"${clean}"`;
                                }).join(',')).join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Thong_Ke_Kiem_Tra_PCCC_Giai_Doan.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs cursor-pointer text-[10.5px]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Xuất báo cáo giai đoạn
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>

          {/* Controls bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 no-print">
            <div className="relative md:col-span-4 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                id="inspection-search-input"
                type="text"
                placeholder="Tìm cơ sở, người đại diện, địa chỉ, mã cơ sở, nội dung..."
                value={inspSearch}
                onChange={(e) => setInspSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs"
              />
              {inspSearch && (
                <button
                  type="button"
                  onClick={() => setInspSearch('')}
                  className="absolute right-2.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Xóa tất cả ký tự"
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              )}
            </div>
            <div className="md:col-span-2">
              <select
                id="inspection-type-filter"
                value={inspTypeFilter}
                onChange={(e) => setInspTypeFilter(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer"
              >
                <option value="All">--- Hình thức ---</option>
                <option value="Định kỳ">Định kỳ</option>
                <option value="Đột xuất">Đột xuất</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                id="inspection-result-filter"
                value={inspResult}
                onChange={(e) => setInspResult(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer"
              >
                <option value="All">--- Kết quả ---</option>
                <option value="Đạt yêu cầu">Đạt yêu cầu</option>
                <option value="Không đạt yêu cầu">Không đạt yêu cầu</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                id="add-inspection-btn"
                onClick={() => handleOpenAddInspection()}
                className="w-full h-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center gap-1"
                title="Lập phiếu biên bản kiểm tra PCCC mới"
              >
                <Plus className="w-3.5 h-3.5" />
                + Lập BB mới
              </button>
            </div>
            <div className="md:col-span-2">
              <button
                id="import-inspection-excel-btn"
                onClick={() => {
                  setIsImportingInspExcel(true);
                  setInspExcelFile(null);
                  setParsedInspections([]);
                  setInspImportStatus({ type: 'idle', message: '' });
                }}
                className="w-full h-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-xs"
                title="Nhập dữ liệu biên bản hàng loạt từ file Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                Nhập Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel */}
            <div className="lg:col-span-2 space-y-4 max-h-[720px] overflow-y-auto pr-2 scroll-smooth" id="inspections-list-viewport">
              {filteredInspections.map(insp => {
                const facility = facilities.find(f => f.id === insp.facilityId);
                return (
                  <div key={insp.id} className="bg-white p-5 rounded-xl border border-slate-100 space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">
                          Kiểm tra: {facility ? facility.name : 'Không xác định'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-blue-705 font-mono font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full" title="Mã cơ sở">
                            MÃ CS: {facility ? facility.id : insp.facilityId}
                          </span>
                          <span className="text-[10px] text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                            {insp.type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono font-medium">{formatDateDMY(insp.date)}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 text-[10.5px] font-bold rounded uppercase whitespace-nowrap ${
                        insp.result === 'Đạt yêu cầu'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {insp.result}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-2">
                      <p>
                        <span className="font-bold text-slate-500">Đoàn kiểm tra:</span> {insp.inspectors.join(', ')}
                      </p>
                      {(insp.address || facility?.address) && (
                        <p>
                          <span className="font-bold text-slate-500">Địa chỉ:</span> <span className="text-slate-700 font-medium">{insp.address || facility?.address}</span>
                        </p>
                      )}
                      {(insp.facilityCategory || facility?.category) && (
                        <p>
                          <span className="font-bold text-slate-500">Phân loại cơ sở (Loại hình):</span> <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-extrabold border border-emerald-100 text-[10px] inline-block mt-0.5 leading-snug">{insp.facilityCategory || facility?.category}</span>
                        </p>
                      )}
                      {(insp.officerId || facility?.officerId) && (
                        <p>
                          <span className="font-bold text-slate-500">Cán bộ quản lý địa bàn:</span>{" "}
                          <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded font-extrabold border border-indigo-100 text-[10px] inline-block mt-0.5 leading-snug">
                            {(() => {
                              const oId = insp.officerId || facility?.officerId;
                              const off = officers?.find(o => o.id === oId);
                              return off ? `${off.fullName} (${off.rank} - ${off.position})` : 'Chưa phân công';
                            })()}
                          </span>
                        </p>
                      )}
                      {insp.appendixIiCategory && (
                        <p>
                          <span className="font-bold text-slate-500">Hạng mục Phụ lục II:</span> <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-extrabold border border-rose-100 text-[10px] inline-block mt-0.5 leading-snug">{insp.appendixIiCategory}</span>
                        </p>
                      )}
                      {insp.sector && (
                        <p>
                          <span className="font-bold text-slate-500">Lĩnh vực:</span> <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-extrabold border border-amber-100 text-[10px] inline-block mt-0.5 leading-snug">{insp.sector}</span>
                        </p>
                      )}
                      {insp.industry && (
                        <p>
                          <span className="font-bold text-slate-500">Ngành nghề:</span> <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-extrabold border border-sky-100 text-[10px] inline-block mt-0.5 leading-snug">{insp.industry}</span>
                        </p>
                      )}
                      {insp.inspectionPlan && (
                        <p>
                          <span className="font-bold text-slate-500">Kế hoạch kiểm tra:</span> <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-extrabold border border-indigo-100 text-[10px] inline-block mt-0.5 leading-snug">{insp.inspectionPlan}</span>
                        </p>
                      )}
                      <p>
                        <span className="font-bold text-slate-500">Nội dung rà soát:</span> {insp.content}
                      </p>
                      {insp.fineAmount !== undefined && (
                        <p>
                          <span className="font-bold text-slate-500">Số tiền xử phạt:</span> <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-extrabold border border-rose-100 text-xs inline-block mt-0.5 leading-snug font-mono">{insp.fineAmount.toLocaleString('vi-VN')} VNĐ</span>
                        </p>
                      )}
                      {insp.violations && (
                        <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-slate-700 mt-2 space-y-1">
                          <span className="font-bold text-red-600 block text-[10.5px] uppercase tracking-wider">Sai phạm phát hiện:</span>
                          <p className="text-[11.5px] font-medium leading-relaxed">{insp.violations}</p>
                          {insp.remedyDeadline && (
                            <div className="flex justify-between text-[10px] text-slate-500 pt-1.5 border-t border-red-100 mt-1.5">
                              <span>Hạn khắc phục: <strong className="font-mono text-red-650">{insp.remedyDeadline}</strong></span>
                              <span className="font-bold uppercase text-amber-700">({insp.remedyStatus})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-50 flex justify-between items-center no-print">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-400">Tệp:</span>
                        {insp.attachments && insp.attachments.length > 0 ? (
                          insp.attachments.map((file, fIdx) => (
                            <span 
                              key={file + fIdx} 
                              className="inline-flex items-center gap-2 text-[10.5px] bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium transition-all hover:bg-slate-100"
                            >
                              <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                              <span 
                                onClick={() => handleDownloadAttachment(file)}
                                className="hover:underline cursor-pointer font-mono font-semibold text-slate-800 truncate max-w-[120px]"
                                title="Nhấp để tải xuống tệp"
                              >
                                {file}
                              </span>
                              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadAttachment(file);
                                  }}
                                  className="text-slate-400 hover:text-blue-650 hover:bg-blue-50 rounded p-0.5 transition-all cursor-pointer inline-flex items-center justify-center focus:outline-none"
                                  title="Tải xuống tệp đính kèm này"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAttachment(insp.id, file);
                                  }}
                                  className="text-slate-400 hover:text-red-650 hover:bg-red-50 rounded p-0.5 transition-all cursor-pointer inline-flex items-center justify-center focus:outline-none"
                                  title="Xóa tệp đính kèm này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px] italic animate-pulse">Không có tệp đính kèm</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          id={`delete-insp-${insp.id}`}
                          onClick={() => handleDeleteInspection(insp.id)}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          id={`edit-insp-${insp.id}`}
                          onClick={() => handleOpenEditInspection(insp)}
                          className="text-xs text-red-650 font-bold hover:underline cursor-pointer"
                        >
                          Hiệu chỉnh
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredInspections.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                  Chưa có bản ghi biên bản kiểm tra tương thích.
                </div>
              )}
            </div>

            {/* Form inspect */}
            <div id="inspection-setup-form">
              {(editingInspection || isAddingInspection) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                      {isAddingInspection ? 'Lập Biên bản Mới' : 'Hiệu chỉnh Biên bản'}
                    </h3>
                    <button 
                      id="close-insp-form"
                      onClick={() => {
                        setEditingInspection(null);
                        setIsAddingInspection(false);
                      }} 
                      className="text-slate-400"
                    >
                      X
                    </button>
                  </div>

                  <form onSubmit={handleSaveInspection} className="space-y-4 text-xs font-semibold text-slate-600">
                    {/* Section I: Thông tin cơ sở */}
                    <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-xl space-y-3 shadow-3xs">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5 mb-2">
                        <div className="w-1.5 h-3.5 bg-red-600 rounded-xs"></div>
                        <span className="font-extrabold text-[11px] text-slate-750 uppercase tracking-widest">I. Thông tin cơ sở</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1">Mã cơ sở *</label>
                          <input
                            id="insp-form-facility-id"
                            type="text"
                            required
                            value={inspFacId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInspFacId(val);
                              const fac = facilities.find(f => f.id.toLowerCase() === val.trim().toLowerCase());
                              if (fac) {
                                setInspAppendixIi(fac.dangerLevel || 'Nhóm I');
                                setInspIndustry(fac.industry || '');
                                setInspSector(fac.sector || 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng');
                                setInspAddress(fac.address || '');
                                setInspFacilityCategory(fac.category || '');
                                setInspOfficerId(fac.officerId || '');
                              }
                            }}
                            className="w-full p-2 border border-slate-250 rounded border-slate-200 font-mono text-xs bg-white text-slate-800"
                            placeholder="Mã cơ sở (Ví dụ: FAC_001)"
                            autoComplete="off"
                          />
                        </div>

                        <div>
                          <label className="block mb-1">Cơ sở kiểm tra *</label>
                          <select
                            id="insp-form-facility"
                            value={inspFacId}
                            onChange={(e) => handleFacilityChange(e.target.value)}
                            className="w-full p-2 border border-slate-250 rounded border-slate-200 text-xs font-medium text-slate-700 bg-white"
                          >
                            <option value="">-- Chọn cơ sở --</option>
                            {facilities.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1">Trạng thái hoạt động *</label>
                          <select
                            id="insp-form-facility-status"
                            required
                            value={inspFacilityStatus}
                            onChange={(e) => setInspFacilityStatus(e.target.value as any)}
                            className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-700 bg-white"
                          >
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                            <option value="Tạm ngừng hoạt động">Tạm ngừng hoạt động</option>
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1">Địa chỉ cơ sở</label>
                          <input
                            id="insp-form-address"
                            type="text"
                            value={inspAddress}
                            onChange={(e) => setInspAddress(e.target.value)}
                            placeholder="Địa chỉ cơ sở kiểm tra..."
                            className="w-full p-2 border border-slate-200 rounded border-slate-200 font-medium text-slate-705 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Khu công nghiệp / Cụm công nghiệp</label>
                          <select
                            id="insp-form-industrial-zone"
                            value={inspIndustrialZone || 'Ngoài KCN, KCX, CCN'}
                            onChange={(e) => setInspIndustrialZone(e.target.value as any)}
                            className="w-full p-2 border border-slate-200 rounded border-slate-200 font-medium text-slate-700 text-xs bg-white"
                          >
                            <option value="KCN, KCX">KCN, KCX</option>
                            <option value="CCN">CCN</option>
                            <option value="Ngoài KCN, KCX, CCN">Ngoài KCN, KCX, CCN</option>
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Phân loại nhóm theo Phụ lục II</label>
                          <select
                            id="insp-form-appendixii"
                            value={inspAppendixIi}
                            onChange={(e) => setInspAppendixIi(e.target.value)}
                            className="w-full p-2 border border-red-200 focus:border-red-500 rounded bg-white font-medium text-slate-700 text-xs"
                          >
                            <option value="">-- Click chọn phân loại Phụ lục II --</option>
                            {APPENDIX_II_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Lĩnh vực</label>
                          <select
                            id="insp-form-sector"
                            value={inspSector}
                            onChange={(e) => {
                              const value = e.target.value;
                              setInspSector(value);
                              const relatedCats = SECTOR_CATEGORIES[value] || [];
                              if (relatedCats.length > 0) {
                                setInspFacilityCategory(relatedCats[0]);
                              } else {
                                setInspFacilityCategory('');
                              }
                            }}
                            className="w-full p-2 border border-sky-200 focus:border-sky-500 rounded bg-white font-medium text-slate-700 text-xs"
                          >
                            <option value="">-- Click chọn phân loại Lĩnh vực --</option>
                            {SECTOR_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 text-slate-755 font-semibold text-slate-700">Phân loại cơ sở (Loại hình)</label>
                          <select
                            id="insp-form-facility-category"
                            value={inspFacilityCategory}
                            onChange={(e) => setInspFacilityCategory(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded font-medium text-slate-705 text-xs bg-white"
                          >
                            <option value="">-- Chọn phân loại cơ sở --</option>
                            {(SECTOR_CATEGORIES[inspSector] || []).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            {inspFacilityCategory && !(SECTOR_CATEGORIES[inspSector] || []).includes(inspFacilityCategory) && (
                              <option value={inspFacilityCategory}>{inspFacilityCategory}</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Ngành nghề</label>
                          <input
                            id="insp-form-industry"
                            type="text"
                            value={inspIndustry}
                            onChange={(e) => setInspIndustry(e.target.value)}
                            placeholder="Nhập ngành nghề hoặc lĩnh vực..."
                            className="w-full p-2 border border-sky-200 focus:border-sky-500 rounded bg-white font-medium text-slate-700 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3" id="insp-form-local-force-row">
                          <div>
                            <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Lực lượng tại chỗ</label>
                            <select
                              id="insp-form-local-force-type"
                              value={inspLocalForceType || 'Cơ sở'}
                              onChange={(e) => setInspLocalForceType(e.target.value as any)}
                              className="w-full p-2 border border-slate-200 rounded font-medium text-slate-700 text-xs bg-white"
                            >
                              <option value="Cơ sở">Cơ sở</option>
                              <option value="Chuyên ngành">Chuyên ngành</option>
                              <option value="Phân công">Phân công</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Số lượng (người)</label>
                            <input
                              id="insp-form-local-force-count"
                              type="number"
                              min="0"
                              value={inspLocalForceCount}
                              onChange={(e) => setInspLocalForceCount(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full p-2 border border-slate-200 rounded font-medium text-slate-700 text-xs"
                              placeholder="Số lượng thành viên"
                            />
                          </div>
                        </div>



                        <div>
                          <label className="block mb-1 text-slate-705 font-extrabold uppercase tracking-wider text-[10px]">Cán bộ quản lý địa bàn</label>
                          <select
                            id="insp-form-officer"
                            value={inspOfficerId}
                            onChange={(e) => setInspOfficerId(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded border-slate-200 font-medium text-slate-700 text-xs bg-white"
                          >
                            <option value="">-- Click chọn cán bộ quản lý địa bàn --</option>
                            {officers?.filter(o => o.position !== 'Chiến sĩ').map(o => (
                              <option key={o.id} value={o.id}>{o.fullName} ({o.rank} - {o.position})</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1">Ngày kiểm tra</label>
                            <input
                              id="insp-form-date"
                              type="date"
                              value={inspDate}
                              onChange={(e) => setInspDate(e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block mb-1">Hình thức</label>
                            <select
                              id="insp-form-type"
                              value={inspType}
                              onChange={(e) => setInspType(e.target.value as any)}
                              className="w-full p-2 border border-slate-200 rounded border-slate-200 bg-white"
                            >
                              <option value="Định kỳ">Định kỳ</option>
                              <option value="Đột xuất">Đột xuất</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1">Kế hoạch kiểm tra</label>
                          <input
                            id="insp-form-plan"
                            type="text"
                            value={inspPlan}
                            onChange={(e) => setInspPlan(e.target.value)}
                            placeholder="Nhập kế hoạch kiểm tra..."
                            className="w-full p-2 border border-slate-200 rounded border-slate-200 text-xs font-medium text-slate-705 bg-white"
                          />
                        </div>


                      </div>
                    </div>

                    {/* Section II: Kết quả kiểm tra */}
                    <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-xl space-y-3 shadow-3xs">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5 mb-2">
                        <div className="w-1.5 h-3.5 bg-emerald-650 rounded-xs"></div>
                        <span className="font-extrabold text-[11px] text-slate-750 uppercase tracking-widest">II. Kết quả kiểm tra</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1">Kết quả kiểm tra</label>
                          <select
                            id="insp-form-result"
                            value={inspResultVal}
                            onChange={(e) => setInspResultVal(e.target.value as any)}
                            className="w-full p-2 border border-slate-200 rounded border-slate-200 font-medium text-slate-700 text-xs bg-white"
                          >
                            <option value="Đạt yêu cầu">Đạt yêu cầu</option>
                            <option value="Không đạt yêu cầu">Không đạt yêu cầu</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section III: Công tác xử lý vi phạm hành chính */}
                    <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-xl space-y-3 shadow-3xs">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5 mb-2">
                        <div className="w-1.5 h-3.5 bg-amber-600 rounded-xs"></div>
                        <span className="font-extrabold text-[11px] text-slate-750 uppercase tracking-widest">III. Công tác xử lý vi phạm vi phạm hành chính</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1">Vi phạm, tồn tại (Nếu có)</label>
                          <textarea
                            id="insp-form-violations"
                            value={inspViolations}
                            onChange={(e) => setInspViolations(e.target.value)}
                            className="w-full p-2 border border-slate-205 rounded border-slate-200 h-16 bg-white"
                            placeholder="Các thiết bị hỏng lỗi, chưa đảm bảo quy định..."
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-semibold text-slate-700">Căn cứ theo quy định</label>
                          <input
                            id="insp-form-legal-basis"
                            type="text"
                            value={inspLegalBasis}
                            onChange={(e) => setInspLegalBasis(e.target.value)}
                            placeholder="Nhập căn cứ theo quy định (Ví dụ: Nghị định 136/2020/NĐ-CP...)"
                            className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-705 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Số tiền xử phạt (nếu có - VNĐ)</label>
                          <input
                            id="insp-form-fine-amount"
                            type="number"
                            min="0"
                            step="100000"
                            value={inspFineAmount !== undefined ? inspFineAmount : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInspFineAmount(val === '' ? undefined : Number(val));
                            }}
                            placeholder="Ví dụ: 5000000 (để trống nếu không phạt tiền)"
                            className="w-full p-2 border border-slate-205 rounded border-slate-200 font-medium text-slate-700 text-xs bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1">Hạn khắc phục</label>
                            <input
                              id="insp-form-deadline"
                              type="date"
                              value={inspDeadline}
                              onChange={(e) => setInspDeadline(e.target.value)}
                              className="w-full p-2 border border-slate-205 rounded border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block mb-1">Trạng thái xử lý lỗi</label>
                            <select
                              id="insp-form-remedy"
                              value={inspRemedyStatus}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setInspRemedyStatus(val);
                                if (val === 'Đã khắc phục') {
                                  setInspResultVal('Đạt yêu cầu');
                                }
                              }}
                              className="w-full p-2 border border-slate-250 rounded border-slate-200 text-xs bg-white"
                            >
                              <option value="Chưa khắc phục">Chưa khắc phục</option>
                              <option value="Đã khắc phục">Đã khắc phục</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section IV: Đính kèm tài liệu */}
                    <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-xl space-y-3 shadow-3xs">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5 mb-2">
                        <div className="w-1.5 h-3.5 bg-blue-600 rounded-xs"></div>
                        <span className="font-extrabold text-[11px] text-slate-750 uppercase tracking-widest">IV. Đính kèm tài liệu</span>
                      </div>

                      <div className="space-y-2" id="inspection-attachment-container">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tệp đính kèm Biên bản</label>
                        <div className="flex flex-col gap-2.5 bg-white border border-dashed border-slate-250 p-4 rounded-xl text-center">
                          <input
                            id="insp-file-uploader"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                const names = Array.from(e.target.files).map((f: any) => f.name);
                                setInspAttachments(prev => {
                                  const next = [...prev];
                                  names.forEach(name => {
                                    if (!next.includes(name)) {
                                      next.push(name);
                                    }
                                  });
                                  return next;
                                });
                              }
                            }}
                          />

                          {inspAttachments.length > 0 ? (
                            <div className="space-y-1.5 text-left max-h-36 overflow-y-auto pr-1">
                              {inspAttachments.map((file, idx) => (
                                <div key={file + idx} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs select-none shadow-3xs hover:border-slate-300 transition-colors">
                                  <span className="font-mono text-slate-700 truncate max-w-[200px] flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {file}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Bạn có chắc chắn muốn gỡ bỏ tệp đính kèm "${file}"?`)) {
                                        setInspAttachments(prev => prev.filter((_, i) => i !== idx));
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 flex items-center gap-1 focus:outline-none cursor-pointer text-xs transition-colors"
                                    title="Xóa tệp đính kèm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs py-1.5 italic">Chưa có tệp đính kèm nào được chọn.</div>
                          )}

                          <button
                            type="button"
                            id="trigger-attachment-upload-btn"
                            onClick={() => {
                              document.getElementById('insp-file-uploader')?.click();
                            }}
                            className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                            Chọn biên bản đính kèm
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section V: Ghi chú */}
                    <div className="border border-slate-150 bg-slate-50/40 p-4 rounded-xl space-y-3 shadow-3xs">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5 mb-2">
                        <div className="w-1.5 h-3.5 bg-violet-600 rounded-xs"></div>
                        <span className="font-extrabold text-[11px] text-slate-750 uppercase tracking-widest">V. Ghi chú</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 font-semibold text-slate-700">Ghi chú</label>
                          <textarea
                            id="insp-form-notes"
                            value={inspNotes}
                            onChange={(e) => setInspNotes(e.target.value)}
                            placeholder="Nhập ghi chú thêm về tụ điểm/cơ sở..."
                            className="w-full p-2 border border-slate-200 rounded text-xs font-medium text-slate-700 h-16 resize-y focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      id="save-insp-submit-btn"
                      type="submit"
                      className="w-full py-2 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg cursor-pointer transition-colors mt-3 shadow-3xs"
                    >
                      Bảo lưu biên bản
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
                  <FileText className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2" />
                  Lựa chọn lập biên bản mới hoặc điều chỉnh biên bản hiện hành để đồng bộ tiến độ phòng hỏa.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'analytics' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6" id="protection-analytics-panel">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
              Bảng thống kê, tổng hợp
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Phân cấp dữ liệu theo từng phường/xã thuộc diện giám sát phòng cháy của Quận.
            </p>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="analytics-statistics-grid">
              {/* Table layout by Ward */}
              <div className="space-y-3" id="ward-analytics-table">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Thống kê theo Địa bàn</span>
                  <button
                    id="export-excel-ward-btn"
                    onClick={handleExportWardExcel}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                    title="Xuất thống kê địa bàn và danh sách chi tiết ra file Excel (Excel/CSV)"
                  >
                    <Download className="w-3 h-3" />
                    Xuất Excel
                  </button>
                </div>
                <div className="divide-y text-xs max-h-[350px] overflow-y-auto pr-1">
                  {WARD_OPTIONS.map(ward => {
                    const num = totalByWard[ward] || 0;
                    const totalCount = facilities.length || 1;
                    const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : 0;
                    return (
                      <div 
                        key={ward} 
                        onClick={() => {
                          setFacWard(ward);
                          setSubTab('facilities');
                        }}
                        className="py-2.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                        title="Bấm để lọc danh sách theo Phường này"
                      >
                        <span className="font-semibold text-slate-600">{ward}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">({percent}%)</span>
                          <strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 hover:bg-slate-200 transition-colors">{num} cơ sở</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total row for Ward */}
                <div className="py-2 flex justify-between items-center px-2 bg-slate-50/70 border-t border-slate-200 mt-1 rounded text-xs">
                  <span className="font-bold text-slate-850">Tổng cộng ở địa bàn</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-[10px] font-bold">(100%)</span>
                    <strong className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px]">{facilities.length} cơ sở</strong>
                  </div>
                </div>
              </div>

              {/* Table layout by Category */}
              <div className="space-y-3" id="category-analytics-table">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Thống kê theo Loại hình</span>
                  <button
                    id="export-excel-category-btn"
                    onClick={handleExportCategoryExcel}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                    title="Xuất thống kê loại hình và danh sách chi tiết ra file Excel (Excel/CSV)"
                  >
                    <Download className="w-3 h-3" />
                    Xuất Excel
                  </button>
                </div>
                <div className="divide-y text-xs max-h-[350px] overflow-y-auto pr-1">
                  {CATEGORY_OPTIONS.map(cat => {
                    const num = totalByCategory[cat] || 0;
                    const totalCount = facilities.length || 1;
                    const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : 0;
                    return (
                      <div 
                        key={cat} 
                        onClick={() => {
                          setFacSearch(cat);
                          setSubTab('facilities');
                        }}
                        className="py-2.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                        title="Bấm để lọc danh sách theo Loại hình này"
                      >
                        <span className="font-semibold text-slate-600 truncate max-w-[180px]" title={cat}>{cat}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-400">({percent}%)</span>
                          <strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 hover:bg-slate-200 transition-colors">{num} cơ sở</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total row for Category */}
                <div className="py-2 flex justify-between items-center px-2 bg-slate-50/70 border-t border-slate-200 mt-1 rounded text-xs">
                  <span className="font-bold text-slate-850">Tổng cộng theo loại hình</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-[10px] font-bold">(100%)</span>
                    <strong className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px]">{facilities.length} cơ sở</strong>
                  </div>
                </div>
              </div>

              {/* Table layout by Sector */}
              <div className="space-y-3" id="sector-analytics-table">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Thống kê theo Lĩnh vực</span>
                  <button
                    id="export-excel-sector-btn"
                    onClick={handleExportSectorExcel}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                    title="Xuất thống kê lĩnh vực và danh sách chi tiết ra file Excel (Excel/CSV)"
                  >
                    <Download className="w-3 h-3" />
                    Xuất Excel
                  </button>
                </div>
                <div className="divide-y text-xs max-h-[350px] overflow-y-auto pr-1">
                  {SECTOR_OPTIONS.map(sec => {
                    const num = totalBySector[sec] || 0;
                    const totalCount = facilities.length || 1;
                    const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : 0;
                    return (
                      <div 
                        key={sec} 
                        onClick={() => {
                          setFacSectorFilter(sec);
                          setSubTab('facilities');
                        }}
                        className="py-2.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                        title="Bấm để lọc danh sách theo Lĩnh vực này"
                      >
                        <span className="font-semibold text-slate-600 truncate max-w-[150px]" title={sec}>{sec}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-400">({percent}%)</span>
                          <strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 hover:bg-slate-200 transition-colors">{num} cơ sở</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total row for Sector */}
                <div className="py-2 flex justify-between items-center px-2 bg-slate-50/70 border-t border-slate-200 mt-1 rounded text-xs">
                  <span className="font-bold text-slate-850">Tổng cộng theo lĩnh vực</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-[10px] font-bold">(100%)</span>
                    <strong className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px]">{facilities.length} cơ sở</strong>
                  </div>
                </div>
              </div>

              {/* Table layout by Phụ lục II & Industrial Zone */}
              <div className="space-y-6">
                <div className="space-y-3" id="danger-analytics-table">
                  <span className="font-extrabold text-xs text-slate-500 block uppercase tracking-wider border-b pb-2">Thống kê theo Phụ lục II</span>
                  <div className="divide-y text-xs">
                    {['Nhóm I', 'Nhóm II'].map(danger => {
                      const num = totalByDanger[danger] || 0;
                      const totalCount = facilities.length || 1;
                      const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : 0;
                      return (
                        <div 
                          key={danger} 
                          onClick={() => {
                            setFacDanger(danger);
                            setSubTab('facilities');
                          }}
                          className="py-2.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                          title="Bấm để lọc danh sách theo Nhóm nguy hiểm này"
                        >
                          <span className="font-semibold text-slate-600 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${danger === 'Nhóm I' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            {danger}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">({percent}%)</span>
                            <strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 hover:bg-slate-200 transition-colors">{num} cơ sở</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total row for Danger */}
                  <div className="py-2 flex justify-between items-center px-2 bg-slate-50/70 border-t border-slate-200 mt-1 rounded text-xs">
                    <span className="font-bold text-slate-850">Tổng cộng theo phụ lục</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[10px] font-bold">(100%)</span>
                      <strong className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px]">{facilities.length} cơ sở</strong>
                    </div>
                  </div>
                </div>

                {/* Table layout by Industrial Zone */}
                <div className="space-y-3 border-t border-slate-100 pt-4" id="industrial-zone-analytics-table">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Thống kê Khu/Cụm công nghiệp</span>
                    <button
                      id="export-excel-industrial-zone-btn"
                      onClick={handleExportIndustrialZoneExcel}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                      title="Xuất thống kê khu/cụm công nghiệp và danh sách chi tiết ra file Excel (Excel/CSV)"
                    >
                      <Download className="w-3 h-3" />
                      Xuất Excel
                    </button>
                  </div>
                  <div className="divide-y text-xs">
                    {[
                      { key: 'KCN, KCX', label: 'Trong KCN', color: 'bg-emerald-500' },
                      { key: 'CCN', label: 'Trong CCN', color: 'bg-amber-500' },
                      { key: 'Ngoài KCN, KCX, CCN', label: 'Ngoài KCN, CCN', color: 'bg-slate-500' }
                    ].map(zone => {
                      const num = totalByIndustrialZone[zone.key] || 0;
                      const totalCount = facilities.length || 1;
                      const percent = num > 0 ? ((num / totalCount) * 100).toFixed(1) : 0;
                      return (
                        <div 
                          key={zone.key} 
                          onClick={() => {
                            if (zone.key === 'KCN, KCX') {
                              setFacSearch('KCN');
                            } else if (zone.key === 'CCN') {
                              setFacSearch('CCN');
                            } else {
                              setFacSearch('Ngoài KCN');
                            }
                            setSubTab('facilities');
                          }}
                          className="py-2.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                          title="Bấm để lọc danh sách theo khu vực này"
                        >
                          <span className="font-semibold text-slate-600 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${zone.color}`} />
                            {zone.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">({percent}%)</span>
                            <strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 hover:bg-slate-200 transition-colors">{num} cơ sở</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total row for Industrial Zone */}
                  <div className="py-2 flex justify-between items-center px-2 bg-slate-50/70 border-t border-slate-200 mt-1 rounded text-xs">
                    <span className="font-bold text-slate-850">Tổng cộng theo khu vực</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[10px] font-bold">(100%)</span>
                      <strong className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px]">{facilities.length} cơ sở</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Detailed Statistics by Officer */}
          <div className="pt-6 border-t border-slate-100 space-y-3" id="officer-by-group-stats">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-xs text-slate-500 block uppercase tracking-wider">
                  Thống kê số lượng cơ sở theo cán bộ quản lý
                </h4>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Bảng phân tách chi tiết số lượng nhóm quản lý theo Phụ lục II của từng cán bộ phụ trách địa bàn.
                </p>
              </div>
              <button
                id="export-excel-officer-stats-btn"
                onClick={handleExportOfficerStatsExcel}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10.5px] font-bold transition-all cursor-pointer shadow-xs shrink-0 ml-4"
                title="Xuất thống kê cán bộ quản lý ra file Excel (Excel/CSV)"
              >
                <Download className="w-3 h-3" />
                Xuất Excel
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="p-3 pl-4 text-center w-12">STT</th>
                    <th className="p-3">Tên cán bộ</th>
                    <th className="p-3 text-center">Phụ lục II - Nhóm I</th>
                    <th className="p-3 text-center">Phụ lục II - Nhóm II</th>
                    <th className="p-3 text-center text-emerald-700">Trong KCN</th>
                    <th className="p-3 text-center text-amber-700">Trong CCN</th>
                    <th className="p-3 text-center text-slate-700">Ngoài KCN, CCN</th>
                    <th className="p-3 text-center bg-slate-100/40">Tổng số cơ sở</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {(officers || []).filter(o => o.position !== 'Chiến sĩ').map((o, idx) => {
                    const assignedFacs = facilities.filter(f => f.officerId === o.id);
                    const countI = assignedFacs.filter(f => f.dangerLevel === 'Nhóm I').length;
                    const countII = assignedFacs.filter(f => f.dangerLevel === 'Nhóm II').length;
                    const countKCN = assignedFacs.filter(f => f.industrialZone === 'KCN, KCX').length;
                    const countCCN = assignedFacs.filter(f => f.industrialZone === 'CCN').length;
                    const countOther = assignedFacs.filter(f => !f.industrialZone || f.industrialZone === 'Ngoài KCN, KCX, CCN').length;
                    const total = assignedFacs.length;

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-4 text-center text-slate-450 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{o.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {o.rank} - {o.position} {o.unit ? `(${o.unit})` : ''}
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono text-red-650 font-bold">
                          {countI > 0 ? (
                            <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-100">
                              {countI}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono text-blue-650 font-bold">
                          {countII > 0 ? (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                              {countII}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono text-emerald-650 font-bold">
                          {countKCN > 0 ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
                              {countKCN}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono text-amber-650 font-bold">
                          {countCCN > 0 ? (
                            <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-100">
                              {countCCN}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600 font-bold">
                          {countOther > 0 ? (
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {countOther}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-bold bg-slate-50/20 text-slate-800">
                          {total > 0 ? (
                            <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
                              {total}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Unassigned row */}
                  {(() => {
                    const unassignedFacs = facilities.filter(f => !f.officerId || !(officers || []).some(o => o.id === f.officerId));
                    const unI = unassignedFacs.filter(f => f.dangerLevel === 'Nhóm I').length;
                    const unII = unassignedFacs.filter(f => f.dangerLevel === 'Nhóm II').length;
                    const unKCN = unassignedFacs.filter(f => f.industrialZone === 'KCN, KCX').length;
                    const unCCN = unassignedFacs.filter(f => f.industrialZone === 'CCN').length;
                    const unOther = unassignedFacs.filter(f => !f.industrialZone || f.industrialZone === 'Ngoài KCN, KCX, CCN').length;
                    const unTotal = unassignedFacs.length;
                    
                    if (unTotal === 0) return null;
                    return (
                      <tr className="bg-slate-50/30 hover:bg-slate-50/50 transition-colors italic">
                        <td className="p-3 pl-4 text-center text-slate-400 font-mono text-[11px]">-</td>
                        <td className="p-3 text-slate-500">
                          <div className="font-bold text-slate-600">Chưa phân công cán bộ</div>
                          <div className="text-[10px] text-slate-400 font-medium">Cơ sở tự quản hoặc chờ phân cấp</div>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {unI > 0 ? (
                            <span className="bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {unI}
                            </span>
                          ) : '0'}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {unII > 0 ? (
                            <span className="bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {unII}
                            </span>
                          ) : '0'}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {unKCN > 0 ? (
                            <span className="bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {unKCN}
                            </span>
                          ) : '0'}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {unCCN > 0 ? (
                            <span className="bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {unCCN}
                            </span>
                          ) : '0'}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {unOther > 0 ? (
                            <span className="bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {unOther}
                            </span>
                          ) : '0'}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600 font-bold bg-slate-50/20">
                          <span className="bg-slate-150 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {unTotal}
                          </span>
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/50 border-t border-slate-200 text-slate-800 font-extrabold text-[12px]">
                    <td className="p-3.5 pl-4 text-center" colSpan={2}>TỔNG CỘNG</td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-red-700 bg-red-50/10">
                      {facilities.filter(f => f.dangerLevel === 'Nhóm I').length}
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-blue-700 bg-blue-50/10">
                      {facilities.filter(f => f.dangerLevel === 'Nhóm II').length}
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-emerald-700 bg-emerald-50/10">
                      {facilities.filter(f => f.industrialZone === 'KCN, KCX').length}
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-amber-700 bg-amber-50/10">
                      {facilities.filter(f => f.industrialZone === 'CCN').length}
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-slate-700 bg-slate-100/10">
                      {facilities.filter(f => !f.industrialZone || f.industrialZone === 'Ngoài KCN, KCX, CCN').length}
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-slate-900 bg-slate-100">
                      {facilities.length}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Detailed Statistics of Facilities with Professional Dossiers */}
          <div className="pt-6 border-t border-slate-100 space-y-3" id="facility-dossier-stats-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-xs text-slate-500 block uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Danh sách cơ sở đã lập hồ sơ nghiệp vụ
                </h4>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Theo dõi số hiệu hồ sơ nghiệp vụ PCCC, ngày thiết lập hồ sơ và cán bộ quản lý phụ trách tương ứng.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-emerald-50 text-emerald-800 text-[10.5px] font-bold px-2.5 py-1.5 rounded-md border border-emerald-100 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Đã lập: {facilities.filter(f => f.dossierNumber).length} / {facilities.length} cơ sở</span>
                </div>
                <button
                  id="export-dossier-excel-btn"
                  onClick={handleExportDossierExcel}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-md shadow-sm transition-all focus:outline-none cursor-pointer"
                  title="Xuất danh sách cơ sở đã lập hồ sơ nghiệp vụ ra Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất Đã lập HS
                </button>
                <button
                  id="export-non-dossier-excel-btn"
                  onClick={handleExportNonDossierExcel}
                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-md shadow-sm transition-all focus:outline-none cursor-pointer"
                  title="Xuất danh sách cơ sở chưa lập hồ sơ nghiệp vụ ra Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất Chưa lập HS
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-slate-100 rounded-xl shadow-xs relative">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="sticky top-0 bg-slate-50 p-3 pl-4 text-center w-12 z-10 border-b border-slate-100">STT</th>
                    <th className="sticky top-0 bg-slate-50 p-3 w-28 z-10 border-b border-slate-100">Mã cơ sở</th>
                    <th className="sticky top-0 bg-slate-50 p-3 z-10 border-b border-slate-100">Tên cơ sở</th>
                    <th className="sticky top-0 bg-slate-50 p-3 z-10 border-b border-slate-100">Số hồ sơ nghiệp vụ</th>
                    <th className="sticky top-0 bg-slate-50 p-3 text-center w-32 z-10 border-b border-slate-100">Ngày lập</th>
                    <th className="sticky top-0 bg-slate-50 p-3 w-48 z-10 border-b border-slate-100">Cán bộ quản lý</th>
                    <th className="sticky top-0 bg-slate-50 p-3 z-10 border-b border-slate-100">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {facilities.filter(f => f.dossierNumber).length > 0 ? (
                    facilities.filter(f => f.dossierNumber).map((f, idx) => {
                      const assignedOfficer = officers?.find(o => o.id === f.officerId);
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-4 text-center text-slate-450 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-500 font-bold">{f.id}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 hover:text-red-700 cursor-pointer transition-colors" onClick={() => {
                              setFacSearch(f.name);
                              setSubTab('facilities');
                            }}>
                              {f.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {f.category} • {f.ward}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[11px] font-bold shadow-3xs">
                              {f.dossierNumber}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500 text-[11px]">
                            {f.createdDate ? formatDateDMY(f.createdDate) : '-'}
                          </td>
                          <td className="p-3">
                            {assignedOfficer ? (
                              <div className="text-slate-700">
                                <span className="font-bold text-slate-800">{assignedOfficer.fullName}</span>
                                <span className="text-[10px] text-slate-400 block font-medium">
                                  {assignedOfficer.rank} • {assignedOfficer.position}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic font-normal text-[11px]">Chưa phân công</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 text-[11px] font-medium max-w-[200px] truncate" title={f.notes || ''}>
                            {f.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic font-normal">
                        Chưa có cơ sở nào được lập hồ sơ nghiệp vụ.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print" id="delete-confirmation-overlay">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-100 p-5 space-y-4" id="delete-confirmation-dialog">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-650 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Xác nhận xóa {deleteConfirmation.type === 'facility' ? 'Cơ sở' : 'Biên bản'}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  {deleteConfirmation.type === 'facility' ? (
                    <>
                      Bạn có chắc chắn muốn xóa cơ sở <span className="font-bold text-slate-700">"{deleteConfirmation.name}"</span>? 
                      Hành động này sẽ xóa dữ liệu cơ sở và các biên bản kiểm tra liên quan.
                    </>
                  ) : (
                    <>
                      Bạn có chắc chắn muốn xóa <span className="font-bold text-slate-700">"{deleteConfirmation.name}"</span>? 
                      Hành động này không thể hoàn tác.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-1">
              <button
                id="cancel-delete-btn"
                onClick={() => setDeleteConfirmation(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                id="confirm-delete-btn"
                onClick={() => {
                  const { id, type } = deleteConfirmation;
                  if (type === 'facility') {
                    setFacilities(facilities.filter(f => f.id !== id));
                    setInspections(inspections.filter(i => i.facilityId !== id));
                  } else {
                    setInspections(inspections.filter(i => i.id !== id));
                  }
                  setDeleteConfirmation(null);
                }}
                className="px-3.5 py-1.5 bg-red-650 hover:bg-red-600 text-white rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {isImportingExcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Nhập dữ liệu cơ sở từ file Excel</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Thêm mới hoặc cập nhật thông tin hàng loạt</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportingExcel(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Instructions and Download Template */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-4.5 border border-slate-200/60 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    Hướng dẫn chuẩn bị dữ liệu
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-2 list-disc list-inside font-medium leading-relaxed">
                    <li>Sử dụng đúng cấu trúc file mẫu để đảm bảo hệ thống nhận diện đúng các cột thông tin.</li>
                    <li>Các trường có dấu <span className="text-red-500 font-bold">(*)</span> là bắt buộc (Mã cơ sở, Tên cơ sở, Địa chỉ, Lĩnh vực, Loại hình, Phân loại phụ lục II, Thẩm quyền quản lý, Trạng thái).</li>
                    <li>Nếu <strong className="text-slate-800">Mã cơ sở</strong> đã tồn tại trong hệ thống, dữ liệu mới sẽ <strong className="text-blue-600">ghi đè</strong> thông tin cũ.</li>
                    <li>Cán bộ quản lý địa bàn có thể nhập tên cán bộ (ví dụ: <code className="bg-slate-200 text-slate-800 px-1 py-0.2 rounded">Nguyễn Văn Trọng</code>) hoặc Mã cán bộ (<code className="bg-slate-200 text-slate-800 px-1 py-0.2 rounded">OFF_001</code>) để hệ thống tự động liên kết.</li>
                  </ul>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4.5 border border-blue-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-blue-950 text-xs">Mẫu file Excel chuẩn</h4>
                    <p className="text-[10.5px] text-blue-700/80 mt-1 font-medium leading-normal">Tải về mẫu file Excel được thiết lập sẵn các trường dữ liệu và dữ liệu mẫu chuẩn.</p>
                  </div>
                  <button
                    onClick={handleDownloadImportTemplate}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Tải file Excel mẫu
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 text-xs block">Chọn file Excel tải lên</span>
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/30 hover:bg-blue-50/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setExcelFile(file);
                        handleParseExcelFile(file);
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="font-bold text-xs text-slate-700">Kéo thả file hoặc click để chọn</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Hỗ trợ định dạng .xlsx, .xls</span>
                </label>
              </div>

              {/* File Info & Status Message */}
              {(excelFile || importStatus.message) && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800">{excelFile?.name}</span>
                      <span className="text-slate-400 ml-2">({excelFile ? (excelFile.size / 1024).toFixed(1) : 0} KB)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {importStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {importStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span className={`font-bold ${
                      importStatus.type === 'success' ? 'text-emerald-700' : 
                      importStatus.type === 'error' ? 'text-red-700' : 'text-slate-600'
                    }`}>
                      {importStatus.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedFacilities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      Xem trước dữ liệu sẽ nhập
                      <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {parsedFacilities.length} dòng
                      </span>
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        {parsedFacilities.filter(f => f.errors.length === 0 && !f.isDuplicate).length} Tạo mới
                      </span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <RefreshCw className="w-3.5 h-3.5" />
                        {parsedFacilities.filter(f => f.errors.length === 0 && f.isDuplicate).length} Ghi đè
                      </span>
                      {parsedFacilities.some(f => f.errors.length > 0) && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {parsedFacilities.filter(f => f.errors.length > 0).length} Lỗi bỏ qua
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-inner bg-slate-50/20">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                          <th className="p-2.5">Mã cơ sở</th>
                          <th className="p-2.5">Tên cơ sở</th>
                          <th className="p-2.5">Địa chỉ / Xã phường</th>
                          <th className="p-2.5">Đại diện / SĐT</th>
                          <th className="p-2.5">Trạng thái dữ liệu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {parsedFacilities.map((fac, idx) => (
                          <tr 
                            key={fac.id + '-' + idx} 
                            className={`hover:bg-slate-50 transition-colors ${
                              fac.errors.length > 0 ? 'bg-red-50/40' : 
                              fac.isDuplicate ? 'bg-blue-50/20' : 'bg-white'
                            }`}
                          >
                            <td className="p-2.5 font-mono font-bold text-slate-700">{fac.id}</td>
                            <td className="p-2.5 font-bold text-slate-800">{fac.name}</td>
                            <td className="p-2.5 text-slate-600">
                              <div className="font-semibold">{fac.address}</div>
                              <div className="text-[10px] text-slate-400 font-bold">{fac.ward}</div>
                            </td>
                            <td className="p-2.5 text-slate-600">
                              <div className="font-semibold">{fac.representative}</div>
                              <div className="text-[10.5px] font-mono text-slate-500">{fac.phone}</div>
                            </td>
                            <td className="p-2.5 font-bold">
                              {fac.errors.length > 0 ? (
                                <div className="space-y-1">
                                  {fac.errors.map((e: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] uppercase font-extrabold">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      {e}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {fac.isDuplicate ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] uppercase font-extrabold">
                                      <RefreshCw className="w-2.5 h-2.5" />
                                      Ghi đè
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] uppercase font-extrabold">
                                      <Check className="w-2.5 h-2.5" />
                                      Hợp lệ
                                    </span>
                                  )}
                                  {fac.warnings.map((w: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] uppercase font-bold" title={w}>
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      Cảnh báo
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-2.5 text-xs font-bold shrink-0">
              <button
                onClick={() => setIsImportingExcel(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCommitImport}
                disabled={parsedFacilities.filter(f => f.errors.length === 0).length === 0 || importStatus.type === 'success'}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg cursor-pointer transition-colors shadow-sm disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Tiến hành nhập dữ liệu ({parsedFacilities.filter(f => f.errors.length === 0).length} dòng)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel for Inspections */}
      {isImportingInspExcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in no-print" id="import-inspection-excel-modal">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Nhập dữ liệu biên bản từ file Excel</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Lập biên bản kiểm tra phòng hỏa hàng loạt dựa trên mẫu chuẩn</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportingInspExcel(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Instructions and Download Template */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-4.5 border border-slate-200/60 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Hướng dẫn chuẩn bị dữ liệu biên bản
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-2 list-disc list-inside font-medium leading-relaxed">
                    <li>Sử dụng cấu trúc cột mẫu chuẩn của hệ thống để nhận diện đúng thông tin phiếu lập biên bản mới.</li>
                    <li>Các trường có dấu <span className="text-red-500 font-bold">(*)</span> là bắt buộc (Mã cơ sở, Ngày lập biên bản, Hình thức, Kết quả, Trạng thái xử lý lỗi).</li>
                    <li><strong className="text-slate-800">Cảnh báo Trùng lặp:</strong> Hệ thống tự động kiểm tra biên bản bị trùng khớp (theo cùng <strong className="text-slate-800">Mã cơ sở</strong> &amp; <strong className="text-slate-800">Ngày kiểm tra</strong> hoặc trùng <strong className="text-slate-800">Mã biên bản</strong>). Nếu trùng khớp, hệ thống sẽ đưa ra cảnh báo màu vàng và thực hiện <strong className="text-amber-600">ghi đè thông tin cũ</strong> nếu người dùng xác nhận nhập.</li>
                    <li>Cán bộ kiểm tra, phân loại Phụ lục II, trạng thái hoạt động của cơ sở, và lực lượng tại chỗ đều được liên kết chuẩn hóa dựa trên phiếu mẫu của cơ sở.</li>
                  </ul>
                </div>

                <div className="bg-red-50/50 rounded-xl p-4.5 border border-red-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-red-950 text-xs">Mẫu Biên Bản chuẩn</h4>
                    <p className="text-[10.5px] text-red-700/80 mt-1 font-medium leading-normal">Mẫu file Excel tự động tạo ra dựa trên các cơ sở và cán bộ thực tế trong hệ thống của bạn làm mẫu tham khảo.</p>
                  </div>
                  <button
                    onClick={handleDownloadInspTemplate}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Tải Excel mẫu (Phụ thuộc BB mới)
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 text-xs block">Chọn file Excel biên bản kiểm tra</span>
                <label className="border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50/30 hover:bg-red-50/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setInspExcelFile(file);
                        handleParseInspExcelFile(file);
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="font-bold text-xs text-slate-700">Kéo thả file biên bản hoặc click để chọn</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Hỗ trợ định dạng .xlsx, .xls</span>
                </label>
              </div>

              {/* File Info & Status Message */}
              {(inspExcelFile || inspImportStatus.message) && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800">{inspExcelFile?.name}</span>
                      <span className="text-slate-400 ml-2">({inspExcelFile ? (inspExcelFile.size / 1024).toFixed(1) : 0} KB)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {inspImportStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {inspImportStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span className={`font-bold ${
                      inspImportStatus.type === 'success' ? 'text-emerald-700' : 
                      inspImportStatus.type === 'error' ? 'text-red-700' : 'text-slate-600'
                    }`}>
                      {inspImportStatus.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedInspections.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      Xem trước danh sách biên bản sẽ nhập
                      <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {parsedInspections.length} biên bản
                      </span>
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        {parsedInspections.filter(i => i.errors.length === 0 && !i.isDuplicate).length} Tạo mới
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                        {parsedInspections.filter(i => i.errors.length === 0 && i.isDuplicate).length} Trùng khớp (Sẽ ghi đè)
                      </span>
                      {parsedInspections.some(i => i.errors.length > 0) && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {parsedInspections.filter(i => i.errors.length > 0).length} Dòng lỗi bỏ qua
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-inner bg-slate-50/20">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                          <th className="p-2.5">Cơ sở / Mã cơ sở</th>
                          <th className="p-2.5">Ngày / Hình thức</th>
                          <th className="p-2.5">Nội dung / Kết quả</th>
                          <th className="p-2.5">Hạn khắc phục / Trạng thái xử lý</th>
                          <th className="p-2.5">Trạng thái biên bản</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {parsedInspections.map((insp, idx) => (
                          <tr 
                            key={insp.id + '-' + idx} 
                            className={`hover:bg-slate-50 transition-colors ${
                              insp.errors.length > 0 ? 'bg-red-50/40' : 
                              insp.isDuplicate ? 'bg-amber-50/30 border-l-2 border-l-amber-500' : 'bg-white'
                            }`}
                          >
                            <td className="p-2.5 text-slate-650">
                              <div className="font-bold text-slate-800">{insp.facilityName}</div>
                              <div className="font-mono text-[10px] text-slate-400 font-bold">Mã cơ sở: {insp.facilityId}</div>
                            </td>
                            <td className="p-2.5 text-slate-600">
                              <div className="font-semibold">{formatDateDMY(insp.date)}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{insp.type}</div>
                            </td>
                            <td className="p-2.5 text-slate-600 max-w-xs truncate" title={insp.content}>
                              <div className="font-semibold truncate max-w-[200px]">{insp.content}</div>
                              <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                insp.result === 'Đạt yêu cầu' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {insp.result}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">
                              <div className="font-semibold text-slate-750">{insp.deadline ? formatDateDMY(insp.deadline) : 'Không hạn'}</div>
                              <div className="text-[10px] font-bold text-slate-500">{insp.remedyStatus}</div>
                            </td>
                            <td className="p-2.5 font-bold">
                              {insp.errors.length > 0 ? (
                                <div className="space-y-1">
                                  {insp.errors.map((e: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] uppercase font-extrabold">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      {e}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {insp.isDuplicate ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] uppercase font-extrabold" title={insp.dupReason}>
                                      <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                      Trùng lặp (Sẽ ghi đè)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] uppercase font-extrabold">
                                      <Check className="w-2.5 h-2.5" />
                                      Hợp lệ
                                    </span>
                                  )}
                                  {insp.warnings.map((w: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] uppercase font-bold" title={w}>
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      Cảnh báo
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-2.5 text-xs font-bold shrink-0">
              <button
                onClick={() => setIsImportingInspExcel(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCommitInspImport}
                disabled={parsedInspections.filter(i => i.errors.length === 0).length === 0 || inspImportStatus.type === 'success'}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg cursor-pointer transition-colors shadow-sm disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Tiến hành nhập dữ liệu ({parsedInspections.filter(i => i.errors.length === 0).length} biên bản)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
