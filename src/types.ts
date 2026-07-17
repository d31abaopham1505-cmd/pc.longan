export type UserRole = 'Admin' | 'Chỉ huy' | 'Cán bộ phụ trách';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  dob?: string;
  rank?: string;
  email?: string;
  password?: string;
  isLocked?: boolean;
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  unit: string;
  position: string;
  phone: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface Officer {
  id: string;
  fullName: string;
  rank: string;         // Cấp bậc: Thiếu úy, Trung úy, Thượng úy, Đại úy, Thiếu tá, Trung tá, Thượng tá, Đại tá
  position: string;     // Chức vụ: Đội trưởng, Phó đội trưởng, Cán bộ, Chỉ huy trưởng, etc.
  unit: string;         // Đội/Tổ công tác: Đội Kiểm tra, Đội Chữa cháy & CNCH, Tổ Tổng hợp...
  phone: string;
  email: string;
  status: 'Đang công tác' | 'Nghỉ phép' | 'Đi công tác' | 'Đi học';
  kpi: number;          // KPI score out of 100
  tasksCount: number;   // Số lượng công việc đã xử lý
  notes?: string;
  dob?: string;         // Ngày tháng năm sinh
  hometown?: string;    // Quê quán
  residence?: string;   // Nơi thường trú
}

export type DutyPeriod = 'Sáng (07h30 - 11h30)' | 'Chiều (13h30 - 17h30)' | 'Tối (19h00 - 07h30 hôm sau)' | 'Cả ngày (24h)';

export interface DutySchedule {
  id: string;
  date: string;         // YYYY-MM-DD
  shift: DutyPeriod;
  commanderId: string;  // Chỉ huy trực (Officer ID)
  officerIds: string[]; // Cán bộ, chiến sĩ trực (Officer IDs)
  vehicles: string[];   // Phương tiện trực: Xe chữa cháy 1, Xe cứu hộ 2, Xe nước 3...
  notes?: string;       // Ghi chú tình hình ca trực
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  ward: string;         // Xã/Phường
  category: string;     // Loại hình cơ sở: Nhà chung cư, Trung tâm thương mại, Nhà xưởng, Karaoke, Trường học, Bệnh viện...
  representative: string;
  phone: string;
  managementLevel: 'Cấp tỉnh quản lý' | 'Cấp xã quản lý';
  dangerLevel: 'Nhóm I' | 'Nhóm II';
  status: 'Hoạt động' | 'Ngừng hoạt động' | 'Tạm ngừng hoạt động' | 'Đang hoạt động' | 'Tạm dừng hoạt động' | 'Đã đình chỉ' | 'Đang cải tạo';
  officerId?: string; // Cán bộ quản lý địa bàn/cơ sở
  sector?: string;     // Phân loại theo Lĩnh vực
  industry?: string;   // Ngành nghề
  dossierNumber?: string; // Số hồ sơ nghiệp vụ
  createdDate?: string;   // Ngày lập (ngày lập hồ sơ)
  lastInspectionDate?: string; // Ngày kiểm tra gần nhất
  operationYear?: string;      // Năm đưa vào hoạt động
  economicSector?: string;     // Thành phần kinh tế
  investmentType?: string;     // Hình thức đầu tư
  ownershipType?: string;      // Hình thức sở hữu
  notes?: string;              // Ghi chú thêm (Notes)
  industrialZone?: 'KCN, KCX' | 'CCN' | 'Ngoài KCN, KCX, CCN';
  localForceType?: 'Cơ sở' | 'Chuyên ngành' | 'Phân công';
  localForceCount?: number;
}

export interface FireInspection {
  id: string;
  facilityId: string;
  date: string;         // YYYY-MM-DD
  type: 'Định kỳ' | 'Đột xuất' | 'Chuyên đề';
  inspectors: string[]; // Thành phần đoàn kiểm tra (Họ tên hoặc IDs)
  content: string;      // Nội dung kiểm tra
  result: 'Đạt yêu cầu' | 'Không đạt yêu cầu';
  appendixIiCategory?: string; // Phân loại theo Phụ lục II
  industry?: string;           // Ngành nghề
  sector?: string;             // Lĩnh vực
  address?: string;            // Địa chỉ cơ sở
  facilityCategory?: string;   // Phân loại/Loại hình cơ sở
  officerId?: string;          // Cán bộ quản lý địa bàn
  inspectionPlan?: string;     // Kế hoạch kiểm tra
  violations?: string;  // Tồn tại, sai phạm phát hiện
  remedyDeadline?: string; // Hạn khắc phục YYYY-MM-DD
  remedyStatus: 'Không có vi phạm' | 'Chưa khắc phục' | 'Đang khắc phục' | 'Đã khắc phục xong' | 'Đã khắc phục';
  attachments?: string[]; // Tên file đính kèm
  fineAmount?: number;    // Số tiền xử phạt (nếu có)
  facilityStatus?: 'Hoạt động' | 'Ngừng hoạt động' | 'Tạm ngừng hoạt động' | 'Đang hoạt động' | 'Tạm dừng hoạt động' | 'Đã đình chỉ' | 'Đang cải tạo';
  notes?: string;         // Ghi chú thêm
  legalBasis?: string;    // Căn cứ pháp lý / Căn cứ theo quy định
  industrialZone?: 'KCN, KCX' | 'CCN' | 'Ngoài KCN, KCX, CCN';
  localForceType?: 'Cơ sở' | 'Chuyên ngành' | 'Phân công';
  localForceCount?: number;
}

export interface FireProtectionPlan {
  id: string;
  name: string;         // Tên phương án
  facilityId: string;   // Cơ sở/Địa điểm áp dụng
  createdDate: string;  // Ngày xây dựng
  approvedDate: string; // Ngày phê duyệt
  rehearsalDate?: string; // Ngày thực tập gần nhất
  participants?: string; // Thành phần tham gia
  evaluation?: string;   // Nhận xét, đánh giá kết quả
  fileUrl?: string;     // Tên file đính kèm
  commander?: string;     // Chỉ huy
  vehiclesCount?: number; // Số lượng phương tiện tham gia
  personnelCount?: number;// Số lượng cán bộ chiến sĩ
  address?: string;       // Địa chỉ
}

export interface FireEquipment {
  id: string;
  name: string;         // Tên phương tiện/thiết bị
  category: 'Phương tiện chữa cháy' | 'Thiết bị CNCH' | 'Thiết bị bảo hộ' | 'Khác';
  quantity: number;
  status: 'Tốt' | 'Cần sửa chữa' | 'Đang bảo dưỡng' | 'Hỏng hóc';
  lastInspectionDate: string; // Ngày kiểm tra gần nhất
  nextMaintenanceDate: string; // Ngày bảo dưỡng tiếp theo
}

export interface DocumentIncoming {
  id: string;
  docNumber: string;    // Số văn bản
  arrivalDate: string;  // Ngày đến
  publisher: string;    // Cơ quan ban hành
  summary: string;      // Trích yếu nội dung
  assigneeId: string;   // Người xử lý (Officer ID)
  deadline?: string;    // Hạn xử lý
  status: 'Chưa xử lý' | 'Đang xử lý' | 'Đã hoàn thành' | 'Quá hạn';
  fileUrl?: string;
}

export interface DocumentOutgoing {
  id: string;
  docNumber: string;    // Số văn bản đi
  publishDate: string;  // Ngày ban hành
  receiver: string;     // Đơn vị nhận
  summary: string;      // Trích yếu nội dung
  authorId: string;     // Người soạn thảo (Officer ID)
  signer: string;       // Người ký
  fileUrl?: string;
}

export interface ReferenceMaterial {
  id: string;
  title: string;        // Tên tài liệu
  docNumber?: string;   // Số hiệu
  category: 'Luật' | 'Nghị định' | 'Thông tư' | 'Quy chuẩn' | 'Tiêu chuẩn' | 'Văn bản chỉ đạo' | 'Tài liệu huấn luyện';
  publishDate?: string; // Ngày ban hành
  publisher?: string;   // Cơ quan ban hành
  scope: string;        // Lĩnh vực áp dụng
  fileUrl?: string;
  notes?: string;
}

export interface TaskWork {
  id: string;
  title: string;        // Tên công việc
  content: string;      // Nội dung công việc
  creatorId: string;    // Người giao việc (Officer ID hoặc tên)
  assigneeId: string;   // Người phụ trách (Officer ID)
  startDate: string;    // Ngày giao
  deadline: string;     // Hạn xử lý
  priority: 'Thấp' | 'Trung bình' | 'Cao';
  status: 'Chưa thực hiện' | 'Đang xử lý' | 'Hoàn thành' | 'Quá hạn';
  attachments?: string[];
  resultNotes?: string; // Ghi chú kết quả
  recurrence?: string;  // Nhắc việc lặp lại (hàng ngày, hàng tuần, hàng tháng, hàng năm)
  docNumber?: string;   // Số hiệu văn bản liên quan (nếu có)
  publisher?: string;   // Cơ quan ban hành (nếu có)
}
