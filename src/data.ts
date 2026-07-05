import { Officer, DutySchedule, Facility, FireInspection, FireEquipment, FireProtectionPlan, DocumentIncoming, DocumentOutgoing, ReferenceMaterial, TaskWork } from './types';

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'OFF_001',
    fullName: 'Nguyễn Văn Hải',
    rank: 'Thượng tá',
    position: 'Đội trưởng',
    unit: 'Chỉ huy đội',
    phone: '0912345678',
    email: 'haininguyen.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 95,
    tasksCount: 42,
    notes: 'Trưởng phòng / Chỉ huy trưởng. Chỉ đạo chung toàn diện.'
  },
  {
    id: 'OFF_002',
    fullName: 'Trần Quốc Toản',
    rank: 'Trung tá',
    position: 'Phó Đội trưởng',
    unit: 'Chỉ huy đội',
    phone: '0987654321',
    email: 'toantran.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 90,
    tasksCount: 38,
    notes: 'Phó trưởng phòng / Chỉ huy phó. Phụ trách kiểm tra an toàn PCCC.'
  },
  {
    id: 'OFF_003',
    fullName: 'Lê Minh Đức',
    rank: 'Thiếu tá',
    position: 'Đội trưởng',
    unit: 'Tổ kiểm tra',
    phone: '0945566778',
    email: 'ducleminh.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 88,
    tasksCount: 30,
    notes: 'Đội trưởng. Chỉ đạo các tổ công tác kiểm tra địa bàn.'
  },
  {
    id: 'OFF_004',
    fullName: 'Phạm Thị Thu Thảo',
    rank: 'Đại úy',
    position: 'Cán bộ',
    unit: 'Tổ y tế',
    phone: '0356789123',
    email: 'thaopham.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 92,
    tasksCount: 55,
    notes: 'Phụ trách lưu trữ công văn và thống kê báo cáo.'
  },
  {
    id: 'OFF_005',
    fullName: 'Trịnh Văn Lâm',
    rank: 'Thượng úy',
    position: 'Phó Đội trưởng',
    unit: 'Tổ chữa cháy',
    phone: '0901234567',
    email: 'lamtrinh.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 85,
    tasksCount: 22,
    notes: 'Đội phó. Chỉ huy kíp trực chữa cháy chính.'
  },
  {
    id: 'OFF_006',
    fullName: 'Hoàng Hải Long',
    rank: 'Trung úy',
    position: 'Cán bộ',
    unit: 'Tổ kiểm tra',
    phone: '0888999111',
    email: 'longhoang.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 82,
    tasksCount: 25,
    notes: 'Cán bộ kỹ thuật. Thực hiện kiểm tra các chung cư, nhà cao tầng.'
  },
  {
    id: 'OFF_007',
    fullName: 'Nguyễn Tiến Dũng',
    rank: 'Thiếu úy',
    position: 'Chiến sĩ',
    unit: 'Tổ chữa cháy',
    phone: '0977665544',
    email: 'dungnguyen.pccc@chinhphu.vn',
    status: 'Đang công tác',
    kpi: 80,
    tasksCount: 15,
    notes: 'Chiến sĩ trẻ nghĩa vụ tích cực trong công tác CNCH.'
  },
  {
    id: 'OFF_008',
    fullName: 'Đỗ Văn Minh',
    rank: 'Đại úy',
    position: 'Cán bộ',
    unit: 'Tổ y tế',
    phone: '0963234125',
    email: 'minhdo.pccc@chinhphu.vn',
    status: 'Đi công tác',
    kpi: 86,
    tasksCount: 18,
    notes: 'Đang tập huấn công tác phòng cháy tại Học viện PCCC.'
  }
];

const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_DUTY_SHEDULES: DutySchedule[] = [
  {
    id: 'DUTY_001',
    date: getRelativeDateStr(-2),
    shift: 'Cả ngày (24h)',
    commanderId: 'OFF_002',
    officerIds: ['OFF_005', 'OFF_007'],
    vehicles: ['Xe chữa cháy MAN (29C-112.34)', 'Xe cứu hộ cứu nạn (29C-223.45)'],
    notes: 'Tình hình trực bình thường. Đã bảo dưỡng kiểm tra phương tiện đầu ca trực.'
  },
  {
    id: 'DUTY_002',
    date: getRelativeDateStr(-1),
    shift: 'Cả ngày (24h)',
    commanderId: 'OFF_001',
    officerIds: ['OFF_003', 'OFF_006'],
    vehicles: ['Xe chữa cháy Mercedes (29C-001.23)', 'Xe cứu hộ cứu nạn (29C-223.45)', 'Xe thang cứu nạn 32m'],
    notes: 'Tiếp nhận 1 tin báo cháy giả tại phường Nguyễn Trãi, đã cho trinh sát xác minh kịp thời và nhắc nhở cơ sở.'
  },
  {
    id: 'DUTY_003',
    date: getRelativeDateStr(0),
    shift: 'Cả ngày (24h)',
    commanderId: 'OFF_002',
    officerIds: ['OFF_005', 'OFF_007'],
    vehicles: ['Xe chữa cháy MAN (29C-112.34)', 'Xe chở nước cứu hỏa (29C-555.55)'],
    notes: 'Kíp trực sẵn sàng chiến đấu, thiết bị kiểm tra định kỳ hoạt động trơn tru.'
  },
  {
    id: 'DUTY_004',
    date: getRelativeDateStr(1),
    shift: 'Cả ngày (24h)',
    commanderId: 'OFF_003',
    officerIds: ['OFF_006', 'OFF_004'],
    vehicles: ['Xe chữa cháy Mercedes (29C-001.23)'],
    notes: 'Lên lịch chuẩn bị trực chiến đấu phối hợp diễn tập cấp quận.'
  }
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'FAC_001',
    name: 'Chung cư cao cấp Thăng Long Victory',
    address: 'Lô đất HH1, Khu đô thị mới Nam An Khánh',
    ward: 'Phường Long An',
    category: 'Nhà chung cư',
    representative: 'Nguyễn Anh Tuấn',
    phone: '0988222333',
    managementLevel: 'Cấp tỉnh quản lý',
    dangerLevel: 'Nhóm I',
    status: 'Đang hoạt động',
    officerId: 'OFF_003',
    sector: 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
    industry: 'Kinh doanh bất động sản, quản lý vận hành chung cư',
    dossierNumber: 'HS-PCCC-001/2026',
    createdDate: '2026-01-10',
    lastInspectionDate: '2026-05-10',
    operationYear: '2022',
    economicSector: 'Tư nhân',
    investmentType: 'Trong nước',
    ownershipType: 'Chính chủ'
  },
  {
    id: 'FAC_002',
    name: 'Trung tâm Thương mại Aeon Mall Hà Đông',
    address: 'Khu dân cư Hoàng Văn Thụ, Phường Dương Nội',
    ward: 'Phường Tân An',
    category: 'Trung tâm thương mại',
    representative: 'Nakata Hideki',
    phone: '0243123456',
    managementLevel: 'Cấp tỉnh quản lý',
    dangerLevel: 'Nhóm I',
    status: 'Đang hoạt động',
    officerId: 'OFF_006',
    sector: 'Lĩnh vực cơ sở thương mại dịch vụ',
    industry: 'Kinh doanh trung tâm thương mại, bán lẻ',
    dossierNumber: 'HS-PCCC-002/2026',
    createdDate: '2026-02-15',
    lastInspectionDate: '2026-05-15',
    operationYear: '2019',
    economicSector: 'Có vốn đầu tư nước ngoài',
    investmentType: 'Nước ngoài',
    ownershipType: 'Thuê'
  },
  {
    id: 'FAC_003',
    name: 'Nhà máy dệt may Hanosimex Hà Đông',
    address: 'Số 15, Đường Quang Trung',
    ward: 'Phường Khánh Hậu',
    category: 'Cơ sở sản xuất công nghiệp có nhà phục vụ sản xuất thuộc hạng nguy hiểm cháy C',
    representative: 'Hoàng Văn Minh',
    phone: '0915151515',
    managementLevel: 'Cấp tỉnh quản lý',
    dangerLevel: 'Nhóm I',
    status: 'Đang hoạt động',
    officerId: 'OFF_003',
    sector: 'Lĩnh vực cơ sở công nghiệp, nhà kho',
    industry: 'Sản xuất, gia công hàng dệt may',
    dossierNumber: 'HS-PCCC-003/2026',
    createdDate: '2026-03-01',
    lastInspectionDate: '2026-05-20',
    operationYear: '2015',
    economicSector: 'Nhà nước',
    investmentType: 'Trong nước',
    ownershipType: 'Chính chủ'
  },
  {
    id: 'FAC_004',
    name: 'Karaoke Luxury Royal',
    address: 'Số 99, Đường Phùng Hưng',
    ward: 'Xã Tầm Vu',
    category: 'Cơ sở kinh doanh dịch vụ karaoke, vũ trường',
    representative: 'Phạm Thanh Sơn',
    phone: '0966999888',
    managementLevel: 'Cấp xã quản lý',
    dangerLevel: 'Nhóm I',
    status: 'Tạm dừng hoạt động',
    officerId: 'OFF_006',
    sector: 'Lĩnh vực cơ sở văn hóa, thể thao, du lịch',
    industry: 'Dịch vụ vui chơi giải trí karaoke',
    dossierNumber: 'HS-PCCC-004/2026',
    createdDate: '2026-03-12',
    lastInspectionDate: '2026-04-12'
  },
  {
    id: 'FAC_005',
    name: 'Trường THPT Chuyên Nguyễn Huệ',
    address: 'Số 560, Đường Quang Trung',
    ward: 'Xã Thuận Mỹ',
    category: 'Trường trung học phổ thông',
    representative: 'Phạm Văn Bính',
    phone: '0243353812',
    managementLevel: 'Cấp tỉnh quản lý',
    dangerLevel: 'Nhóm II',
    status: 'Đang hoạt động',
    officerId: 'OFF_008',
    sector: 'Lĩnh vực cơ sở giáo dục',
    industry: 'Dạy học, giáo dục đào tạo',
    dossierNumber: 'HS-PCCC-005/2026',
    createdDate: '2026-04-18',
    lastInspectionDate: '2026-05-25'
  },
  {
    id: 'FAC_006',
    name: 'Chợ Hà Đông',
    address: 'Đường Bà Triệu, Phường Nguyễn Trãi',
    ward: 'Xã An Lục Long',
    category: 'Chợ',
    representative: 'Ban Quản Lý Chợ Hà Đông',
    phone: '0243382749',
    managementLevel: 'Cấp xã quản lý',
    dangerLevel: 'Nhóm I',
    status: 'Đang hoạt động',
    officerId: 'OFF_003',
    sector: 'Lĩnh vực cơ sở thương mại dịch vụ',
    industry: 'Quản lý chợ công, cho thuê ki-ốt',
    dossierNumber: 'HS-PCCC-006/2026',
    createdDate: '2026-04-20',
    lastInspectionDate: '2026-05-02'
  },
  {
    id: 'FAC_007',
    name: 'Xưởng cơ khí Hoàng Gia',
    address: 'Số 42, Ngõ 19, Đường Tố Hữu',
    ward: 'Xã Vĩnh Công',
    category: 'Cơ sở sản xuất công nghiệp có nhà phục vụ sản xuất thuộc hạng nguy hiểm cháy D, E có tổng khối tích từ 2.500m3 trở lên hoặc tổng diện tích sàn từ 500m2 trở lên',
    representative: 'Lương Đình Gia',
    phone: '0954124355',
    managementLevel: 'Cấp xã quản lý',
    dangerLevel: 'Nhóm II',
    status: 'Đang cải tạo',
    officerId: 'OFF_006',
    sector: 'Lĩnh vực cơ sở công nghiệp, nhà kho',
    industry: 'Gia công cơ khí, rèn đúc kim loại',
    dossierNumber: 'HS-PCCC-007/2026',
    createdDate: '2026-05-05',
    lastInspectionDate: '2026-05-30'
  }
];

export const INITIAL_INSPECTIONS: FireInspection[] = [
  {
    id: 'INSP_001',
    facilityId: 'FAC_001',
    date: '2026-05-15',
    type: 'Định kỳ',
    inspectors: ['Nguyễn Văn Hải', 'Hoàng Hải Long'],
    content: 'Kiểm tra hệ thống báo cháy tự động, hệ thống chữa cháy Sprinkler, kiểm tra họng nước vách tường và lối thoát nạn tại tất cả các tầng.',
    result: 'Không đạt yêu cầu',
    appendixIiCategory: 'Nhóm I',
    sector: 'Lĩnh vực nhà ở, trụ sở làm việc, văn phòng, nhà đa năng',
    violations: 'Đèn chiếu sáng sự cố tại lối thoát hiểm tầng 5 và tầng 8 tòa tháp A bị hỏng pin dự phòng. Lối hành lang thoát hiểm một số chỗ có cư dân để xe nôi trẻ em cản trở lối đi.',
    remedyDeadline: '2026-06-15',
    remedyStatus: 'Đang khắc phục',
    attachments: ['BienBan_ThangLongVictory_150526.pdf'],
    fineAmount: 15000000
  },
  {
    id: 'INSP_002',
    facilityId: 'FAC_004',
    date: '2026-04-10',
    type: 'Đột xuất',
    inspectors: ['Trần Quốc Toản', 'Le Minh Đức'],
    content: 'Kiểm tra đột xuất an toàn PCCC sau khi có chỉ đạo chấn chỉnh công tác PCCC các cơ sở dịch vụ karaoke, bar, pub.',
    result: 'Không đạt yêu cầu',
    appendixIiCategory: 'Nhóm II',
    sector: 'Lĩnh vực cơ sở thương mại dịch vụ',
    violations: 'Hệ thống hút khói hành lang không hoạt động; cửa thoát hiểm phụ chốt khóa; vật liệu trang trí phòng hát không đảm bảo tiêu chuẩn chống cháy lan theo quy định.',
    remedyDeadline: '2026-05-10',
    remedyStatus: 'Chưa khắc phục',
    attachments: ['QuyetDinh_DinhChi_KaraokeRoyal.pdf'],
    fineAmount: 35000000
  },
  {
    id: 'INSP_003',
    facilityId: 'FAC_002',
    date: '2026-05-20',
    type: 'Định kỳ',
    inspectors: ['Le Minh Đức', 'Hoàng Hải Long'],
    content: 'Kiểm tra bảo dưỡng định kỳ các tủ chữa cháy, kiểm định máy bơm nước điều áp chữa cháy chính, sơ đồ chỉ dẫn thoát hiểm chung toàn TTTM.',
    result: 'Đạt yêu cầu',
    appendixIiCategory: 'Nhóm I',
    sector: 'Lĩnh vực cơ sở thương mại dịch vụ',
    violations: 'Không có sai phạm lớn. Hệ thống hoạt động tốt.',
    remedyStatus: 'Không có vi phạm',
    attachments: ['BienBan_AeonMallHD_200526.pdf']
  },
  {
    id: 'INSP_004',
    facilityId: 'FAC_003',
    date: '2026-06-05',
    type: 'Chuyên đề',
    inspectors: ['Trần Quốc Toản', 'Hoàng Hải Long'],
    content: 'Chuyên đề kiểm tra an toàn hệ thống điện và tích trữ hóa chất/nguyên vật liệu dễ cháy trong mùa hanh khô, nắng nóng cao điểm.',
    result: 'Không đạt yêu cầu',
    appendixIiCategory: 'Nhóm II',
    sector: 'Lĩnh vực cơ sở công nghiệp, nhà kho',
    violations: 'Hệ thống dây dẫn điện tại kho vải số 1 luồn ngoài ống polyme bảo vệ, có nguy cơ quá tải nhiệt gây chập cháy.',
    remedyDeadline: '2026-06-25',
    remedyStatus: 'Đang khắc phục',
    attachments: ['YeuCauKhacPhuc_Hanosimex_0506.pdf']
  }
];

export const INITIAL_EQUIPMENT: FireEquipment[] = [
  {
    id: 'EQ_001',
    name: 'Xe chữa cháy MAN 29C-112.34',
    category: 'Phương tiện chữa cháy',
    quantity: 1,
    status: 'Tốt',
    lastInspectionDate: '2026-05-10',
    nextMaintenanceDate: '2026-11-10'
  },
  {
    id: 'EQ_002',
    name: 'Xe chữa cháy Mercedes 29C-001.23',
    category: 'Phương tiện chữa cháy',
    quantity: 1,
    status: 'Tốt',
    lastInspectionDate: '2026-05-25',
    nextMaintenanceDate: '2026-11-25'
  },
  {
    id: 'EQ_003',
    name: 'Xe thang cứu nạn 32m nâng thủy lực',
    category: 'Phương tiện chữa cháy',
    quantity: 1,
    status: 'Đang bảo dưỡng',
    lastInspectionDate: '2026-06-10',
    nextMaintenanceDate: '2026-06-20'
  },
  {
    id: 'EQ_004',
    name: 'Máy bơm chữa cháy diesel Ebara high-pressure',
    category: 'Phương tiện chữa cháy',
    quantity: 3,
    status: 'Tốt',
    lastInspectionDate: '2026-05-01',
    nextMaintenanceDate: '2026-08-01'
  },
  {
    id: 'EQ_005',
    name: 'Bộ kìm cắt phá dỡ thủy lực Holmatro cao cấp',
    category: 'Thiết bị CNCH',
    quantity: 2,
    status: 'Tốt',
    lastInspectionDate: '2026-04-15',
    nextMaintenanceDate: '2026-08-15'
  },
  {
    id: 'EQ_006',
    name: 'Mặt nạ phòng chống khói độc cách ly 3M',
    category: 'Thiết bị bảo hộ',
    quantity: 45,
    status: 'Tốt',
    lastInspectionDate: '2026-05-02',
    nextMaintenanceDate: '2026-11-02'
  },
  {
    id: 'EQ_007',
    name: 'Bình bọt chữa cháy xe đẩy Foam 35L',
    category: 'Phương tiện chữa cháy',
    quantity: 8,
    status: 'Cần sửa chữa',
    lastInspectionDate: '2026-06-01',
    nextMaintenanceDate: '2026-06-15'
  },
  {
    id: 'EQ_008',
    name: 'Xe cứu hộ cứu nạn (29C-223.45)',
    category: 'Phương tiện chữa cháy',
    quantity: 1,
    status: 'Tốt',
    lastInspectionDate: '2026-05-18',
    nextMaintenanceDate: '2026-11-18'
  },
  {
    id: 'EQ_009',
    name: 'Xe chở nước cứu hỏa (29C-555.55)',
    category: 'Phương tiện chữa cháy',
    quantity: 1,
    status: 'Tốt',
    lastInspectionDate: '2026-05-22',
    nextMaintenanceDate: '2026-11-22'
  }
];

export const INITIAL_PLANS: FireProtectionPlan[] = [
  {
    id: 'PLAN_001',
    name: 'Phương án Chữa cháy & Cứu nạn phối hợp nhiều lực lượng',
    facilityId: 'FAC_001',
    createdDate: '2025-11-20',
    approvedDate: '2025-12-10',
    rehearsalDate: '2026-04-18',
    participants: 'Đội PCCC cơ sở Chung cư, Lực lượng Cảnh sát PCCC & CNCH khu vực, Trung tâm Y tế cấp quận, Công an phường An Khánh.',
    evaluation: 'Đạt loại Xuất sắc. Thời gian triển khai đội hình dập tắt đám cháy giả định và cứu 5 nạn nhân mắc kẹt từ tầng 10 đúng tiến độ trong kịch bản.',
    fileUrl: 'PA_PCCC_ThangLongVictory_PhiaQuan.pdf'
  },
  {
    id: 'PLAN_002',
    name: 'Phương án di tản khẩn cấp dập tắt đám cháy hóa chất kho bãi',
    facilityId: 'FAC_003',
    createdDate: '2026-02-05',
    approvedDate: '2026-02-28',
    rehearsalDate: '2026-05-12',
    participants: 'Đội chữa cháy cơ sở nhà máy dệt may, Đội ứng cứu sự cố hóa chất tỉnh, kíp trực chỉ huy phòng PCCC sở tại.',
    evaluation: 'Đạt yêu cầu. Tuy nhiên công tác sử dụng lăng phun bọt ban đầu của đội cơ sở còn lúng túng, cần tăng cường ôn tập huấn luyện bổ sung.',
    fileUrl: 'PA_Hanosimex_KhoVai_2026.pdf'
  },
  {
    id: 'PLAN_003',
    name: 'Phương án chữa cháy định kỳ bãi đỗ xe ngầm TTTM Aeon Mall',
    facilityId: 'FAC_002',
    createdDate: '2026-01-15',
    approvedDate: '2026-02-01',
    fileUrl: 'PA_AeonMall_HamXe_2026.pdf'
  }
];

export const INITIAL_INCOMING_DOCS: DocumentIncoming[] = [
  {
    id: 'DOC_IN_001',
    docNumber: '425/UBND-NC',
    arrivalDate: '2026-06-08',
    publisher: 'Ủy ban nhân dân Quận Hà Đông',
    summary: 'Chỉ đạo tăng cường rà soát, kiểm tra liên ngành an toàn toàn diện các tụ điểm karaoke, vũ trường trước đỉnh điểm mùa nhiệt cao hè 2026.',
    assigneeId: 'OFF_003',
    deadline: '2026-06-25',
    status: 'Đang xử lý',
    fileUrl: 'QD_425_UBND_RaSoatKaraoke.pdf'
  },
  {
    id: 'DOC_IN_002',
    docNumber: '1120/CAT-PCCC',
    arrivalDate: '2026-06-01',
    publisher: 'Công an Thành phố - Phòng Cảnh sát PCCC',
    summary: 'Thông báo về việc tổ chức tập huấn kỹ năng cập nhật cơ sở dữ liệu lên cổng thông tin dịch vụ công trực tuyến thuộc Bộ Công an.',
    assigneeId: 'OFF_004',
    deadline: '2026-06-15',
    status: 'Đang xử lý',
    fileUrl: 'CV_1120_CAT_TapHuanCSDL.pdf'
  },
  {
    id: 'DOC_IN_003',
    docNumber: '92/LĐTBXH',
    arrivalDate: '2026-05-20',
    publisher: 'Sở Lao động - Thương binh và Xã hội',
    summary: 'Kế hoạch phát động tuần lễ quốc gia hưởng ứng về An toàn, Vệ sinh lao động và Phòng chống cháy nổ khu công nghiệp năm 2026.',
    assigneeId: 'OFF_008',
    deadline: '2026-06-05',
    status: 'Đã hoàn thành',
    fileUrl: 'KH_92_LD_AnToanLaoDong.pdf'
  },
  {
    id: 'DOC_IN_004',
    docNumber: '58/PC-HĐ',
    arrivalDate: '2026-05-10',
    publisher: 'Tòa án nhân dân Quận Hà Đông',
    summary: 'Yêu cầu phối hợp giám định vết lộ mạch điện gây cháy tại bãi tập kết phế thải xảy ra ngày 05/05/2026 tại phường La Khê.',
    assigneeId: 'OFF_002',
    deadline: '2026-05-28',
    status: 'Đã hoàn thành',
    fileUrl: 'YC_58_GiamDinhChayLaKhe.pdf'
  }
];

export const INITIAL_OUTGOING_DOCS: DocumentOutgoing[] = [
  {
    id: 'DOC_OUT_001',
    docNumber: '115/BC-PCCC',
    publishDate: '2026-06-10',
    receiver: 'Ủy ban nhân dân Quận Hà Đông',
    summary: 'Báo cáo kết quả tuần tự rà soát, thống kê tạm đình chỉ hoạt động 03 cơ sở kinh doanh dịch vụ karaoke vi phạm kỹ thuật PCCC nghiêm trọng.',
    authorId: 'OFF_004',
    signer: 'Nguyễn Văn Hải',
    fileUrl: 'BC_115_PCCC_BaoCaoKaraokeTuan1.pdf'
  },
  {
    id: 'DOC_OUT_002',
    docNumber: '290/QD-PCCC',
    publishDate: '2026-06-03',
    receiver: 'Ban quản lý Chung cư Thăng Long Victory',
    summary: 'Quyết định xử phạt vi phạm hành chính về phòng cháy chữa cháy đối với hành vi làm cản trở lối thoát hiểm phòng hỏa chung cư.',
    authorId: 'OFF_003',
    signer: 'Trần Quốc Toản',
    fileUrl: 'QD_XPHC_ThangLongVictory_2026.pdf'
  },
  {
    id: 'DOC_OUT_003',
    docNumber: '34/TB-PCCC',
    publishDate: '2026-05-25',
    receiver: 'Tất cả các cơ sở thuộc diện quản lý trên địa bàn',
    summary: 'Thông báo tăng cường cảnh báo ngăn ngừa cháy nổ từ hoạt động thắp hương thờ cúng và đốt vàng mã mùa lễ hội hè.',
    authorId: 'OFF_004',
    signer: 'Nguyễn Văn Hải',
    fileUrl: 'TB_34_CangBaoVangMa.pdf'
  }
];

export const INITIAL_MATERIALS: ReferenceMaterial[] = [
  {
    id: 'MAT_001',
    title: 'Luật Phòng cháy và Chữa cháy năm 2001 (Sửa đổi, bổ sung năm 2013)',
    docNumber: '27/2001/QH10',
    category: 'Luật',
    publishDate: '2001-06-29',
    publisher: 'Quốc hội nước CHXHCN Việt Nam',
    scope: 'Đạo luật khung pháp lý cao nhất về phòng ngừa, dập tắt hỏa hoạn và cứu nạn tại nước ta.',
    notes: 'Bắt buộc áp dụng đối với tất cả cơ quan, tổ chức, hộ gia đình.'
  },
  {
    id: 'MAT_002',
    title: 'Nghị định quy định chi tiết một số điều và biện pháp thi hành Luật PCCC',
    docNumber: '136/2020/NĐ-CP',
    category: 'Nghị định',
    publishDate: '2020-11-24',
    publisher: 'Chính phủ Việt Nam',
    scope: 'Quy định chi tiết điều kiện an toàn PCCC, phân cấp quản lý cơ sở và phê duyệt thiết kế nghiệm thu.',
    notes: 'Quy chuẩn vô cùng quan trọng đối với các đoàn kiểm tra cơ sở.'
  },
  {
    id: 'MAT_003',
    title: 'Nghị định sửa đổi, bổ sung một số điều của Nghị định số 136/2020/NĐ-CP và Nghị định số 83/2017/NĐ-CP',
    docNumber: '50/2024/NĐ-CP',
    category: 'Nghị định',
    publishDate: '2024-05-10',
    publisher: 'Chính phủ Việt Nam',
    scope: 'Sửa đổi cắt giảm nhiều thủ tục hành chính, nới lỏng bổ sung một số điều kiện kỹ thuật phù hợp thực tiễn phát triển mới.',
    notes: 'Văn bản cốt lõi mới cập nhật cần chú ý áp dụng trong năm 2026.'
  },
  {
    id: 'MAT_004',
    title: 'Thông tư quy định chi tiết một số điều của Nghị định số 136/2020/NĐ-CP',
    docNumber: '149/2020/TT-BCA',
    category: 'Thông tư',
    publishDate: '2020-12-31',
    publisher: 'Bộ Công an',
    scope: 'Quy định biểu mẫu Biên bản kiểm tra PCCC, phương án cứu nạn, chế độ báo cáo thống kê chuyên ngành.',
    notes: 'Toàn bộ biểu mẫu làm việc của cán bộ đều trích xuất từ thông tư này.'
  },
  {
    id: 'MAT_005',
    title: 'Quy chuẩn kỹ thuật quốc gia về An toàn cháy cho nhà và công trình',
    docNumber: 'QCVN 06:2022/BXD',
    category: 'Quy chuẩn',
    publishDate: '2022-11-30',
    publisher: 'Bộ Xây dựng',
    scope: 'Tiêu chí khắt khe áp dụng cho công tác thẩm duyệt thiết kế hầm, thoát nạn cao tầng, chống cháy lan mặt dựng dựng mới sản xuất.',
    notes: 'Áp dụng cho mọi hoạt động tư vấn, thẩm duyệt thiết kế kiến trúc xây dựng dân dụng.'
  }
];

export const INITIAL_TASKS: TaskWork[] = [
  {
    id: 'TASK_001',
    title: 'Tổng kiểm tra đột xuất các quán Karaoke',
    content: 'Triển khai công tác rà soát, đo lường kỹ thuật hệ thống báo hỏa tự động và lối hiểm tại các cơ sở karaoke thuộc danh sách đỏ quản lý.',
    creatorId: 'Nguyễn Văn Hải',
    assigneeId: 'OFF_003',
    startDate: '2026-06-09',
    deadline: '2026-06-18',
    priority: 'Cao',
    status: 'Đang xử lý',
    resultNotes: 'Phối hợp cùng tổ chuyên môn và đại diện ban văn hóa truyền thông phường sở tại.'
  },
  {
    id: 'TASK_002',
    title: 'Cập nhật danh sách cơ sở phân quyền 2026',
    content: 'Cập nhật phân loại danh mục cơ sở an toàn lên phần mềm hệ thống theo phân cấp Nghị định 50/2024 mới nhất.',
    creatorId: 'Trần Quốc Toản',
    assigneeId: 'OFF_004',
    startDate: '2026-06-02',
    deadline: '2026-06-12',
    priority: 'Trung bình',
    status: 'Hoàn thành',
    resultNotes: 'Đã hoàn thành và lập báo cáo tổng hợp gửi cấp trên duyệt ngày 11/06.'
  },
  {
    id: 'TASK_003',
    title: 'Bảo dưỡng kiểm tra định kỳ xe thang nâng 32m',
    content: 'Mang xe thang di chuyển sang trạm dịch vụ ủy quyền để bảo dưỡng định kỳ hệ thống ty lăng thủy lực và bộ trích lực động cơ.',
    creatorId: 'Trần Quốc Toản',
    assigneeId: 'OFF_005',
    startDate: '2026-06-10',
    deadline: '2026-06-20',
    priority: 'Cao',
    status: 'Đang xử lý',
    resultNotes: 'Ký bàn giao tạm thời bàn trực cho kíp xe bọt dự phòng.'
  },
  {
    id: 'TASK_004',
    title: 'Xử lý báo cáo tuần tra an toàn trường học La Khê',
    content: 'Soạn thảo biên bản nhắc nhở kiến nghị biện pháp gia cố lưới bảo hiểm bảo vệ thoát nạn sau chuyến tuần tra tại trường Nguyễn Huệ.',
    creatorId: 'Lê Minh Đức',
    assigneeId: 'OFF_006',
    startDate: '2026-06-01',
    deadline: '2026-06-08',
    priority: 'Thấp',
    status: 'Quá hạn',
    resultNotes: 'Chưa thấy cán bộ nộp báo cáo tổng hợp hoàn tất.'
  },
  {
    id: 'TASK_005',
    title: 'Tổ chức tuyên truyền an toàn gas sinh hoạt hộ gia đình',
    content: 'Phối hợp cùng UBND phường Quang Trung lên kịch bản phát loa tuyên truyền và phát tờ rơi hướng dẫn lưu kho an toàn bình gas du lịch.',
    creatorId: 'Nguyễn Văn Hải',
    assigneeId: 'OFF_008',
    startDate: '2026-06-15',
    deadline: '2026-06-25',
    priority: 'Trung bình',
    status: 'Chưa thực hiện'
  }
];
