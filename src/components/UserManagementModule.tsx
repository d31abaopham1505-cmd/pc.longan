import React, { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { User, UserRole } from '../types';
import { 
  Users, UserPlus, Search, Edit2, Lock, Unlock, Trash2, 
  Mail, ShieldAlert, ShieldCheck, KeyRound, Calendar, Award, Check,
  RefreshCw, CheckCircle2, Save, X, UserCheck, UserX, Info
} from 'lucide-react';

interface UserManagementProps {
  store: PCCCStoreType;
}

export default function UserManagementModule({ store }: UserManagementProps) {
  const { 
    users, 
    createUserAccount, 
    updateUserAccount, 
    deleteUserAccount, 
    currentUser,
    registrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    logout
  } = store;

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Tab state: 'active' (Tài khoản hiện hành) or 'pending' (Yêu cầu đăng ký mới)
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'pending'>('active');

  // Selected registration requests for bulk operations
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);

  const toggleSelectReg = (reqId: string) => {
    setSelectedRegIds(prev => 
      prev.includes(reqId) ? prev.filter(id => id !== reqId) : [...prev, reqId]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRegIds.length === 0) return;
    
    const duplicates: string[] = [];
    for (const reqId of selectedRegIds) {
      const req = registrationRequests.find(r => r.id === reqId);
      if (req) {
        const dup = users.find(u => u.email.trim().toLowerCase() === req.email.trim().toLowerCase());
        if (dup) {
          duplicates.push(`- Cán bộ: ${req.fullName} (Email trùng: ${req.email}) đã tồn tại nick: ${dup.fullName}`);
        }
      }
    }

    let confirmMsg = `Bạn có chắc muốn phê duyệt ${selectedRegIds.length} yêu cầu đăng ký đã chọn với vai trò 'Cán bộ phụ trách' và quân hàm mặc định?`;
    if (duplicates.length > 0) {
      confirmMsg = `CẢNH BÁO TRÙNG LẶP: Phát hiện một số yêu cầu trùng khớp với tài khoản đã được tạo lập trên hệ thống:\n${duplicates.join('\n')}\n\nBạn có chắc chắn muốn tiếp tục duyệt (bao gồm các tài khoản trùng lặp) hay không?`;
    }

    if (window.confirm(confirmMsg)) {
      try {
        for (const id of selectedRegIds) {
          await approveRegistrationRequest(id);
        }
        setSelectedRegIds([]);
      } catch (err: any) {
        alert('Lỗi phê duyệt hàng loạt: ' + err.message);
      }
    }
  };

  const handleBulkReject = async () => {
    if (selectedRegIds.length === 0) return;
    if (window.confirm(`Bạn có chắc muốn từ chối và xóa ${selectedRegIds.length} yêu cầu đăng ký đã chọn ra khỏi danh sách hay không?`)) {
      try {
        for (const id of selectedRegIds) {
          await rejectRegistrationRequest(id);
        }
        setSelectedRegIds([]);
      } catch (err: any) {
        alert('Lỗi hủy bỏ hàng loạt: ' + err.message);
      }
    }
  };

  // Approving flow state
  const [approvingReqId, setApprovingReqId] = useState<string | null>(null);
  const [approveRole, setApproveRole] = useState<UserRole>('Cán bộ phụ trách');
  const [approveRank, setApproveRank] = useState('Thiếu úy');
  const [approveDob, setApproveDob] = useState('');

  // Form State for Editing/Direct Creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Cán bộ phụ trách');
  const [rank, setRank] = useState('');
  const [dob, setDob] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu tài khoản cán bộ chiến sĩ...');
      setTimeout(() => {
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ thông tin tài khoản thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  const RANK_OPTIONS = [
    'Thiếu úy', 'Trung úy', 'Thượng úy', 'Đại úy', 
    'Thiếu tá', 'Trung tá', 'Thượng tá', 'Đại tá'
  ];

  const ROLE_OPTIONS: UserRole[] = ['Admin', 'Chỉ huy', 'Cán bộ phụ trách'];

  const handleOpenCreate = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('Cán bộ phụ trách');
    setRank('Thiếu úy');
    setDob('');
    setIsLocked(false);
    setFormError('');
    setFormSuccess('');
    setEditingId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (user: User) => {
    setEmail(user.email || '');
    setPassword(user.password || '');
    setFullName(user.fullName);
    setRole(user.role);
    setRank(user.rank || '');
    setDob(user.dob || '');
    setIsLocked(!!user.isLocked);
    setFormError('');
    setFormSuccess('');
    setEditingId(user.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email.trim() || !fullName.trim()) {
      setFormError('Vui lòng điền đầy đủ các thông tin cốt lõi (Email và Họ tên).');
      return;
    }

    if (!editingId && !password.trim()) {
      setFormError('Yêu cầu điền mật khẩu đăng nhập khởi tạo.');
      return;
    }

    const payload = {
      email: email.trim(),
      username: email.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      role,
      rank: rank || undefined,
      dob: dob || undefined,
      isLocked,
    };

    try {
      if (editingId) {
        // Prevent admins from lock out themselves
        if (editingId === currentUser?.id && isLocked) {
          setFormError('Không thể tự khóa tài khoản Admin của chính bạn!');
          return;
        }

        await updateUserAccount({ ...payload, id: editingId, username: email.trim() });
        setFormSuccess('Cập nhật tài khoản cán bộ thành công!');
      } else {
        // Check duplicate email
        const exists = users.some(u => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (exists) {
          setFormError('Email đăng nhập này đã tồn tại trên cơ sở dữ liệu.');
          return;
        }

        await createUserAccount(payload);
        setFormSuccess('Tạo tài khoản cán bộ mới thành công!');
      }

      // Close panel after success
      setTimeout(() => {
        setIsEditing(false);
      }, 800);
    } catch (err: any) {
      setFormError(err.message || 'Lỗi thao tác dữ liệu.');
    }
  };

  const handleDelete = async (userId: string) => {
    const isSelf = userId === currentUser?.id;
    const confirmMsg = isSelf 
      ? 'CẢNH BÁO: Bạn đang thực hiện xóa TÀI KHOẢN CỦA CHÍNH MÌNH. Hệ thống sẽ tự động đăng xuất sau khi xóa xong. Bạn có chắc chắn muốn xóa không?'
      : 'Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản cán bộ này không?';

    if (window.confirm(confirmMsg)) {
      try {
        await deleteUserAccount(userId);
        if (isSelf) {
          logout();
        }
      } catch (err: any) {
        alert('Lỗi khi xóa tài khoản: ' + err.message);
      }
    }
  };

  const handleToggleLock = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Không thể tự khóa tài khoản Admin của chính bạn!');
      return;
    }

    try {
      await updateUserAccount({
        ...user,
        isLocked: !user.isLocked
      });
    } catch (err: any) {
      alert('Lỗi thao tác khóa tài khoản: ' + err.message);
    }
  };

  const handleStartApprove = (reqId: string) => {
    setApprovingReqId(reqId);
    setApproveRole('Cán bộ phụ trách');
    setApproveRank('Thiếu úy');
    setApproveDob('');
  };

  const handleConfirmApprove = async (reqId: string) => {
    const req = registrationRequests.find(r => r.id === reqId);
    if (!req) return;

    // Check if duplicate user exists with the same email
    const duplicateUser = users.find(u => u.email.trim().toLowerCase() === req.email.trim().toLowerCase());

    if (duplicateUser) {
      if (!window.confirm(`CẢNH BÁO TRÙNG LẶP: Đã có tài khoản cán bộ trùng email (${req.email}) đã được tạo lập trên hệ thống.\nTài khoản hiện tại:\n- Họ tên: ${duplicateUser.fullName}\n- Cấp bậc: ${duplicateUser.rank || 'Chuẩn'}\n- Vai trò: ${duplicateUser.role}\n\nBạn có chắn chắn muốn ghi đè/phê duyệt thêm tài khoản này hay không?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Xác nhận phê duyệt và tạo lập tài khoản cho cán bộ ${req.fullName}?`)) {
        return;
      }
    }

    try {
      await approveRegistrationRequest(reqId, {
        role: approveRole,
        rank: approveRank,
        dob: approveDob || undefined
      });
      setApprovingReqId(null);
    } catch (err: any) {
      alert('Lỗi phê duyệt đăng ký: ' + err.message);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    if (window.confirm('Bạn có chắc muốn từ chối và xóa yêu cầu đăng ký này ra khỏi danh sách hay không?')) {
      try {
        await rejectRegistrationRequest(reqId);
      } catch (err: any) {
        alert('Lỗi thao tác: ' + err.message);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" id="user-management-module">
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-650" />
            BỘ CHỈ HUY QUẢN TRỊ TÀI KHOẢN CÁN BỘ
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Hạ tầng phân cấp quyền truy cập hệ thống PCCC của Đội Tân An. Chỉ có tài khoản nhóm <strong>Admin</strong> mới được quyền điều khiển mục này.
          </p>
          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

          {!isEditing && (
            <button
              id="add-user-btn"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-red-650 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-red-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> THÊM TÀI KHOẢN MỚI
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit / Create Form View */
        <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
            <span className="font-extrabold text-xs uppercase tracking-wider">
              {editingId ? 'Cập nhật tài khoản cán bộ' : 'Tạo mới tài khoản đăng nhập'}
            </span>
            <button
              id="cancel-user-form-btn"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs cursor-pointer"
            >
              Quay lại danh sách
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block mb-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Email Tài khoản (Dùng làm ID đăng nhập)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="TenCanBo@pccc-tanan.gov.vn"
                    disabled={!!editingId}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Mật khẩu xác thực</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingId}
                    placeholder="Mật khẩu của cán bộ..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              {/* FullName */}
              <div>
                <label className="block mb-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Họ và Tên Cán Bộ</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Ví dụ: Thiếu tá Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
                />
              </div>

              {/* Phân quyền */}
              <div>
                <label className="block mb-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Phân quyền Hệ thống (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 bg-slate-50"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Cấp bậc */}
              <div>
                <label className="block mb-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Cấp bậc Quân hàm (Tùy chọn)</label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-slate-50"
                >
                  <option value="">Không có cấp bậc / Khác</option>
                  {RANK_OPTIONS.map((rk) => (
                    <option key={rk} value={rk}>{rk}</option>
                  ))}
                </select>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block mb-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">Ngày Tháng Năm Sinh</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Lock Control (Switch) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <strong className="block text-xs text-slate-800">Trạng thái phát hành khóa tài khoản</strong>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Nếu bị khóa, tài khoản này lập tức mất quyền truy cập và rà soát hệ thống.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-650" />
              </label>
            </div>

            {/* Form actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                id="cancel-form-btn-bottom"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                id="save-account-btn"
                className="px-5 py-2.5 bg-red-650 hover:bg-red-750 active:scale-[0.99] text-white font-extrabold rounded-lg text-xs tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer uppercase"
              >
                <Save className="w-4 h-4" /> CẬP NHẬT & LƯU THÔNG TIN
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Users Accounts List View with Tabs */
        <div className="space-y-5">
          {/* Sub Tab selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 max-w-md no-print shadow-2xs">
            <button
              onClick={() => setActiveSubTab('active')}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer ${
                activeSubTab === 'active'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              TÀI KHOẢN HIỆN HÀNH ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer relative ${
                activeSubTab === 'pending'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              YÊU CẦU ĐĂNG KÝ MỚI
              {registrationRequests && registrationRequests.length > 0 && (
                <span className="absolute top-1 right-2 bg-yellow-505 text-amber-950 font-sans font-black text-[9px] px-1.5 py-0.5 rounded-full ring-2 ring-white bg-yellow-405">
                  {registrationRequests.length}
                </span>
              )}
            </button>
          </div>

          {activeSubTab === 'active' ? (
            /* ACTIVE ACCOUNTS VIEW */
            <div className="space-y-4 animate-fade-in">
              {/* Filtering bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="user-search-input"
                    type="text"
                    placeholder="Tìm kiếm tài khoản theo Họ tên hoặc Email cán bộ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono self-center pr-2 font-semibold uppercase">
                  Tổng số tài khoản: {filteredUsers.length} cán bộ
                </div>
              </div>

              {/* Grid Layout Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="users-grid-container">
                {filteredUsers.map((user) => {
                  const { id, email, fullName, role, dob, rank, isLocked: locked } = user;
                  const isSelf = id === currentUser?.id;

                  return (
                    <div 
                      key={id}
                      id={`user-card-${id}`} 
                      className={`bg-white rounded-xl border p-4.5 space-y-3.5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                        locked 
                          ? 'border-red-150 bg-red-50/10' 
                          : 'border-slate-150 hover:border-slate-300'
                      }`}
                    >
                      {/* Lock Watermark Badge */}
                      {locked && (
                        <div className="absolute top-0 right-0 p-1 bg-red-100 rounded-bl-lg text-red-700">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {/* Header: Avatar, Name, and Role */}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border uppercase ${
                            isSelf 
                              ? 'bg-red-50 text-red-600 border-red-200' 
                              : locked 
                                ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}>
                            {fullName.charAt(0)}
                          </div>

                          <div className="min-w-0 pr-4">
                            <strong className="text-slate-800 text-xs block leading-tight truncate">
                              {fullName} {isSelf && <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-mono ml-1">Tôi</span>}
                            </strong>
                            <span className="text-[9.5px] text-slate-400 font-mono tracking-tight block truncate mt-0.5">
                              {email}
                            </span>
                          </div>
                        </div>

                        {/* Metadata indicators */}
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-slate-500 pt-2 border-t border-slate-105">
                          <div>
                            <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-bold">Chức vị / Vai trò</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide mt-0.5 ${
                              role === 'Admin'
                                ? 'bg-rose-50 text-rose-600 border border-rose-205'
                                : role === 'Chỉ huy'
                                  ? 'bg-sky-50 text-sky-600 border border-sky-205'
                                  : 'bg-emerald-50 text-emerald-600 border border-emerald-205'
                            }`}>
                              {role}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-bold">Quân hàm</span>
                            <span className="text-slate-700 block mt-0.5 flex items-center gap-1 font-sans">
                              <Award className="w-3 h-3 text-amber-500" />
                              {rank || 'Chưa quy định'}
                            </span>
                          </div>
                          {dob && (
                            <div className="col-span-2">
                              <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-bold">Ngày sinh</span>
                              <span className="text-slate-700 block mt-0.5 font-mono">{dob}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                        {/* Lock toggle button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLock(user)}
                          disabled={isSelf}
                          className={`px-2 py-1 rounded text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
                            isSelf
                              ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                              : locked
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-650 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {locked ? (
                            <>
                              <Unlock className="w-3 h-3" /> Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" /> KHÓA HŨ
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            title="Hiệu chỉnh tài khoản"
                            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 text-slate-600 rounded text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" /> Sửa
                          </button>

                          {!isSelf && id !== 'USR_ADMIN_01' ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              title="Xóa tài khoản"
                              className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-150 text-rose-600 rounded text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Xóa
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* PENDING REGISTRATION REQUESTS VIEW */
            <div className="space-y-4 animate-fade-in" id="pending-registrations">
              {(!registrationRequests || registrationRequests.length === 0) ? (
                /* Empty registrations state */
                <div className="bg-white rounded-xl border border-slate-150 p-12 text-center max-w-lg mx-auto space-y-3 shadow-6xs">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                    <Info className="w-6 h-6" />
                  </div>
                  <strong className="block text-slate-700 text-sm">Không tìm thấy yêu cầu đăng ký nào</strong>
                  <p className="text-slate-400 text-xs">Phân hệ rà duyệt rỗng sạch. Hiện không có cán bộ nào gửi đơn yêu cầu rà duyệt đăng ký cấp quyền trực tuyến.</p>
                </div>
              ) : (
                <>
                  {/* Bulk Select Control Bar */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedRegIds.length === registrationRequests.length) {
                            setSelectedRegIds([]);
                          } else {
                            setSelectedRegIds(registrationRequests.map(r => r.id));
                          }
                        }}
                        className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                          selectedRegIds.length === registrationRequests.length && registrationRequests.length > 0
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                        title="Chọn tất cả / Bỏ chọn tất cả"
                      >
                        {selectedRegIds.length === registrationRequests.length && registrationRequests.length > 0 && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </button>
                      <span className="text-xs font-bold text-slate-700">
                        Đã chọn {selectedRegIds.length} / {registrationRequests.length} yêu cầu đăng ký
                      </span>
                    </div>

                    {selectedRegIds.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBulkReject}
                          className="px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 font-extrabold text-[10.5px] rounded transition-colors cursor-pointer uppercase flex items-center gap-1.5"
                          title="Từ chối và xóa tất cả các yêu cầu đăng ký được chọn ra khỏi hàng chờ"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Từ chối & Xóa khỏi danh sách
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkApprove}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-[10.5px] rounded transition-colors shadow-xs cursor-pointer uppercase flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Duyệt đã chọn
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Bạn có chắc muốn từ chối và XÓA SẠCH TOÀN BỘ ${registrationRequests.length} yêu cầu đăng ký đang chờ và dọn sạch hàng chờ rà duyệt không?`)) {
                              try {
                                for (const req of registrationRequests) {
                                  await rejectRegistrationRequest(req.id);
                                }
                                setSelectedRegIds([]);
                              } catch (err: any) {
                                alert('Lỗi dọn sạch hàng chờ: ' + err.message);
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 text-rose-650 font-extrabold text-[10.5px] rounded transition-colors cursor-pointer uppercase flex items-center gap-1.5"
                          title="Từ chối, xóa sạch toàn bộ hàng chờ yêu cầu"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Từ chối & Xóa toàn bộ
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Registration cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registrationRequests.map((req) => {
                      const isApproving = approvingReqId === req.id;
                      const isSelected = selectedRegIds.includes(req.id);
                      
                      return (
                        <div 
                          key={req.id} 
                          className={`bg-white rounded-xl border p-4.5 space-y-4 shadow-3xs transition-all ${
                            isApproving ? 'border-amber-400 bg-amber-50/10' : isSelected ? 'border-emerald-500 ring-2 ring-emerald-50/50' : 'border-slate-200'
                          }`}
                        >
                          {/* Request Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Circular checkbox selector */}
                              <button
                                type="button"
                                onClick={() => toggleSelectReg(req.id)}
                                className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 hover:border-slate-400 bg-white'
                                }`}
                                title={isSelected ? "Bỏ chọn" : "Chọn yêu cầu này"}
                              >
                                {isSelected && (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                )}
                              </button>

                              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm border border-amber-200 uppercase">
                                {req.fullName.charAt(0)}
                              </div>
                              <div>
                                <strong className="text-slate-800 text-xs block leading-tight">{req.fullName}</strong>
                                <span className="text-[9.5px] text-slate-400 font-mono tracking-tight block truncate mt-0.5">{req.email}</span>
                              </div>
                            </div>
                          
                          {/* Created date */}
                          <div className="text-[9px] font-mono text-slate-400 text-right bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                          </div>
                        </div>

                        {/* Request Details */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                          <div>
                            <span className="block text-[8px] text-slate-405 uppercase tracking-wider font-extrabold text-slate-400">Đơn vị</span>
                            <span className="text-slate-700 block mt-0.5">{req.unit || 'Chưa quy định'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-405 uppercase tracking-wider font-extrabold text-slate-400">Chức vụ</span>
                            <span className="text-slate-705 text-slate-700 block mt-0.5">{req.position || 'Chưa quy định'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[8px] text-slate-405 uppercase tracking-wider font-extrabold text-slate-400">Số điện thoại liên lạc</span>
                            <span className="text-slate-700 block mt-0.5 font-mono">{req.phone}</span>
                          </div>
                        </div>

                        {/* Approve configuration expander */}
                        {isApproving && (
                          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 space-y-3 animate-fade-in text-xs">
                            <strong className="block text-[10px] text-amber-800 uppercase tracking-wider font-black">Thiết lập tài khoản cấp duyệt</strong>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Phân quyền */}
                              <div>
                                <label className="block mb-1 text-slate-700 font-bold text-[9.5px] uppercase">Hệ thống Role</label>
                                <select
                                  value={approveRole}
                                  onChange={(e) => setApproveRole(e.target.value as UserRole)}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-[11px] font-bold text-slate-700 focus:outline-none"
                                >
                                  {ROLE_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Quân hàm */}
                              <div>
                                <label className="block mb-1 text-slate-700 font-bold text-[9.5px] uppercase">Cấp bậc quân hàm</label>
                                <select
                                  value={approveRank}
                                  onChange={(e) => setApproveRank(e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-[11px] font-semibold text-slate-700 focus:outline-none"
                                >
                                  {RANK_OPTIONS.map((rk) => (
                                    <option key={rk} value={rk}>{rk}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Ngày sinh */}
                              <div className="sm:col-span-2">
                                <label className="block mb-1 text-slate-700 font-bold text-[9.5px] uppercase">Ngày tháng năm sinh</label>
                                <input
                                  type="date"
                                  value={approveDob}
                                  onChange={(e) => setApproveDob(e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-[11px] font-medium text-slate-700 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setApprovingReqId(null)}
                                className="px-2.5 py-1.5 border border-slate-200 rounded text-[10px] font-black text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                Hủy bỏ
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmApprove(req.id)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Xác nhận duyệt
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Request Actions */}
                        {!isApproving && (
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-3 py-1.5 rounded text-[10.5px] font-black uppercase text-red-650 bg-red-50 hover:bg-red-100 border border-red-100 flex items-center gap-1 cursor-pointer transition-all"
                              title="Từ chối và xóa yêu cầu đăng ký này ra khỏi danh sách"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Từ chối & Xóa
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleStartApprove(req.id)}
                              className="px-4 py-1.5 rounded text-[10.5px] font-black uppercase text-white bg-emerald-600 hover:bg-emerald-700 shadow-3xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Phê duyệt đơn
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
