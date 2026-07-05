import { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { Officer, TaskWork } from '../types';
import { 
  Users, Search, Plus, Trash2, Edit2, CheckCircle2, 
  MapPin, Phone, Mail, FileText, UserCheck, ShieldAlert, X, Trophy, Save, RefreshCw
} from 'lucide-react';

interface OfficerModuleProps {
  store: PCCCStoreType;
}

export default function OfficerModule({ store }: OfficerModuleProps) {
  const { officers, setOfficers, tasks, setTasks } = store;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Selected Officer for Viewing Details / Editing or Assigning layout
  const [viewingOfficer, setViewingOfficer] = useState<Officer | null>(null);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRank, setFormRank] = useState('Thiếu úy');
  const [formPosition, setFormPosition] = useState('Cán bộ');
  const [formUnit, setFormUnit] = useState('Tổ kiểm tra');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'Đang công tác' | 'Nghỉ phép' | 'Đi công tác' | 'Đi học'>('Đang công tác');
  const [formKpi, setFormKpi] = useState(80);
  const [formNotes, setFormNotes] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formHometown, setFormHometown] = useState('');
  const [formResidence, setFormResidence] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Assign Task Form Contextual state
  const [assigningTaskOfficer, setAssigningTaskOfficer] = useState<Officer | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Thấp' | 'Trung bình' | 'Cao'>('Trung bình');
  const [taskDeadline, setTaskDeadline] = useState('2026-06-20');

  // Dropdown list sets
  const RANK_OPTIONS = [
    'Binh nhì', 'Binh nhất', 'Hạ sĩ', 'Trung sĩ', 'Thượng sĩ', 
    'Thiếu úy', 'Trung úy', 'Thượng úy', 'Đại úy', 
    'Thiếu tá', 'Trung tá', 'Thượng tá', 'Đại tá'
  ];
  const POSITION_OPTIONS = ['Đội trưởng', 'Phó Đội trưởng', 'Cán bộ', 'Chiến sĩ'];
  const UNIT_OPTIONS = ['Chỉ huy đội', 'Tổ kiểm tra', 'Tổ chữa cháy', 'Tổ y tế'];

  // Handlers
  const handleOpenEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormName(officer.fullName);
    setFormRank(officer.rank);
    setFormPosition(officer.position);
    setFormUnit(officer.unit);
    setFormPhone(officer.phone);
    setFormEmail(officer.email);
    setFormStatus(officer.status);
    setFormKpi(officer.kpi);
    setFormNotes(officer.notes || '');
    setFormDob(officer.dob || '');
    setFormHometown(officer.hometown || '');
    setFormResidence(officer.residence || '');
    setSaveSuccess(false);
    setIsAddingNew(false);
  };

  const handleOpenAdd = () => {
    setEditingOfficer(null);
    setFormName('');
    setFormRank('Thiếu úy');
    setFormPosition('Cán bộ');
    setFormUnit('Tổ kiểm tra');
    setFormPhone('');
    setFormEmail('');
    setFormStatus('Đang công tác');
    setFormKpi(80);
    setFormNotes('');
    setFormDob('');
    setFormHometown('');
    setFormResidence('');
    setSaveSuccess(false);
    setIsAddingNew(true);
  };

  const handleSaveOfficer = (e: any) => {
    e.preventDefault();
    if (!formName.trim()) return alert('Vui lòng nhập họ và tên');

    if (isAddingNew) {
      const newOfficer: Officer = {
        id: `OFF_${Date.now()}`,
        fullName: formName,
        rank: formRank,
        position: formPosition,
        unit: formUnit,
        phone: formPhone,
        email: formEmail,
        status: formStatus,
        kpi: Number(formKpi),
        tasksCount: 0,
        notes: formNotes,
        dob: formDob || undefined,
        hometown: formHometown || undefined,
        residence: formResidence || undefined,
      };
      setOfficers([...officers, newOfficer]);
    } else if (editingOfficer) {
      setOfficers(officers.map(o => o.id === editingOfficer.id ? {
        ...o,
        fullName: formName,
        rank: formRank,
        position: formPosition,
        unit: formUnit,
        phone: formPhone,
        email: formEmail,
        status: formStatus,
        kpi: Number(formKpi),
        notes: formNotes,
        dob: formDob || undefined,
        hometown: formHometown || undefined,
        residence: formResidence || undefined,
      } : o));
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setEditingOfficer(null);
      setIsAddingNew(false);
    }, 1500);
  };

  const handleDeleteOfficer = (id: string) => {
    setOfficers(officers.filter(o => o.id !== id));
    if (viewingOfficer?.id === id) setViewingOfficer(null);
    setOfficerToDelete(null);
  };

  // Assign task contextually
  const handleAssignTask = (e: any) => {
    e.preventDefault();
    if (!taskTitle.trim() || !assigningTaskOfficer) return;

    const newTask: TaskWork = {
      id: `TASK_${Date.now()}`,
      title: taskTitle,
      content: taskContent,
      creatorId: store.currentUser?.fullName || 'Hệ thống',
      assigneeId: assigningTaskOfficer.id,
      startDate: '2026-06-13',
      deadline: taskDeadline,
      priority: taskPriority,
      status: 'Chưa thực hiện',
    };

    setTasks([...tasks, newTask]);

    // Update work statistics for officer
    setOfficers(officers.map(o => o.id === assigningTaskOfficer.id ? {
      ...o,
      tasksCount: o.tasksCount + 1
    } : o));

    alert(`Đã giao nhiệm vụ thành công cho cán bộ ${assigningTaskOfficer.fullName}`);
    setAssigningTaskOfficer(null);
    setTaskTitle('');
    setTaskContent('');
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu cán bộ chiến sĩ...');
      setTimeout(() => {
        // Explicitly write state variables
        localStorage.setItem('pccc_officers', JSON.stringify(officers));
        localStorage.setItem('pccc_tasks', JSON.stringify(tasks));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa trực tuyến và sao lưu dữ liệu thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  // Filter officers
  const filteredOfficers = officers.filter(o => {
    const matchesSearch = o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === 'All' || o.unit === selectedUnit;
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchesSearch && matchesUnit && matchesStatus;
  });

  return (
    <div className="space-y-6" id="officers-module">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            BIÊN CHẾ CÁN BỘ & CHIẾN SĨ
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Tổng biên chế: {officers.length} cán bộ | Đang công tác: {officers.filter(o => o.status === 'Đang công tác').length} | Nghỉ phép/Học tập: {officers.filter(o => o.status !== 'Đang công tác').length}
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

          <button
            id="add-officer-btn"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold rounded-lg text-xs transition-colors shadow-md border border-red-700/20 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> THÊM BIÊN CHẾ
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="officer-search"
            type="text"
            placeholder="Tìm theo họ tên, cấp bậc, chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Lọc Đội / Tổ */}
        <div>
          <select
            id="unit-filter"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="All">--- Tất cả Đội/Tổ ---</option>
            {UNIT_OPTIONS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Lọc trạng thái */}
        <div>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="All">--- Tất cả Trạng thái ---</option>
            <option value="Đang công tác">Đang công tác</option>
            <option value="Đi công tác">Đi công tác</option>
            <option value="Nghỉ phép">Nghỉ phép</option>
            <option value="Đi học">Đi học</option>
          </select>
        </div>
      </div>

      {/* Main layout with list on left and details/forms on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officers Grid/List (Col span 2) */}
        <div className="lg:col-span-2 space-y-3" id="officers-list-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredOfficers.map((officer) => {
              const matchesOfficerTasks = tasks.filter(t => t.assigneeId === officer.id);
              const completedTasks = matchesOfficerTasks.filter(t => t.status === 'Hoàn thành').length;
              return (
                <div 
                  key={officer.id}
                  id={`officer-card-${officer.id}`}
                  className={`bg-white p-5 rounded-xl border transition-all duration-250 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
                    viewingOfficer?.id === officer.id 
                      ? 'border-red-500 ring-2 ring-red-500/10' 
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                  onClick={() => {
                    setViewingOfficer(officer);
                    setEditingOfficer(null);
                    setAssigningTaskOfficer(null);
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider font-semibold">{officer.rank}</span>
                        <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-red-650">{officer.fullName}</h4>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{officer.position}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        officer.status === 'Đang công tác' 
                          ? 'bg-emerald-50 text-emerald-600'
                          : officer.status === 'Đi công tác'
                            ? 'bg-blue-50 text-blue-600'
                            : officer.status === 'Nghỉ phép'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-purple-50 text-purple-600'
                      }`}>
                        {officer.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-500 text-[11px] font-medium">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{officer.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{officer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating / KPI & actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-red-600">
                        <Trophy className="w-3 h-3 text-red-650" />
                        <span>KPI: {officer.kpi}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Xử lý: {completedTasks}/{matchesOfficerTasks.length} việc
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 no-print">
                      <button
                        id={`edit-officer-${officer.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(officer);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        id={`delete-officer-${officer.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOfficerToDelete(officer);
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-550 rounded transition-colors"
                        title="Xóa biên chế"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOfficers.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                <Users className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-sm">Không tìm thấy cán bộ chiến sĩ hợp lệ.</p>
              </div>
            )}
          </div>
        </div>

        {/* Details / Forms side panel (Col span 1) */}
        <div className="space-y-4" id="officer-detail-form-panel">
          {/* Active Add / Edit Form */}
          {(editingOfficer || isAddingNew) ? (
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4" id="officer-form">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                  {isAddingNew ? 'Thêm Biên Chế Mới' : 'Sửa Thông Tin Biên Chế'}
                </h3>
                <button 
                  id="close-officer-form"
                  onClick={() => {
                    setEditingOfficer(null);
                    setIsAddingNew(false);
                  }} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveOfficer} className="space-y-4 text-xs">
                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-lg font-bold text-center flex items-center justify-center gap-2 animate-pulse" id="officer-save-success-alert">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span>Đã lưu thành công!</span>
                  </div>
                )}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Họ và Tên *</label>
                  <input
                    id="form-officer-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Cấp bậc</label>
                    <select
                      id="form-officer-rank"
                      value={formRank}
                      onChange={(e) => setFormRank(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      {RANK_OPTIONS.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Chức vụ</label>
                    <select
                      id="form-officer-position"
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      {POSITION_OPTIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Đội / Tổ công tác</label>
                  <select
                    id="form-officer-unit"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Số điện thoại</label>
                    <input
                      id="form-officer-phone"
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      placeholder="0911..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Email</label>
                    <input
                      id="form-officer-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Ngày tháng năm sinh</label>
                    <input
                      id="form-officer-dob"
                      type="date"
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Quê quán</label>
                    <input
                      id="form-officer-hometown"
                      type="text"
                      value={formHometown}
                      onChange={(e) => setFormHometown(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      placeholder="Nhập quê quán..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nơi thường trú</label>
                  <input
                    id="form-officer-residence"
                    type="text"
                    value={formResidence}
                    onChange={(e) => setFormResidence(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    placeholder="Địa chỉ thường trú..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Trạng thái công tác</label>
                    <select
                      id="form-officer-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Đang công tác">Đang công tác</option>
                      <option value="Đi công tác">Đi công tác</option>
                      <option value="Nghỉ phép">Nghỉ phép</option>
                      <option value="Đi học">Đi học</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">KPI Mục tiêu (%)</label>
                    <input
                      id="form-officer-kpi"
                      type="number"
                      min="1"
                      max="100"
                      value={formKpi}
                      onChange={(e) => setFormKpi(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Ghi chú cá nhân</label>
                  <textarea
                    id="form-officer-notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20"
                    placeholder="Sở trường lái xe, công nghệ..."
                  />
                </div>

                <button
                  id="save-officer-submit"
                  type="submit"
                  className="w-full py-2.5 bg-red-650 hover:bg-red-750 active:scale-[0.99] text-white font-extrabold rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer uppercase"
                >
                  <Save className="w-4 h-4" />
                  CẬP NHẬT & LƯU THÔNG TIN
                </button>
              </form>
            </div>
          ) : viewingOfficer ? (
            /* Viewing officer details */
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4" id="officer-detail-card">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Thông tin chi tiết</span>
                <button 
                  id="close-officer-detail"
                  onClick={() => setViewingOfficer(null)} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-650 to-orange-500 text-white flex items-center justify-center text-xl font-extrabold mx-auto shadow-sm">
                  {viewingOfficer.fullName.split(' ').pop()?.charAt(0)}
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm mt-2">{viewingOfficer.rank} {viewingOfficer.fullName}</h3>
                <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                  {viewingOfficer.position}
                </span>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Đội ngũ / Đơn vị:</span>
                  <span className="text-right font-medium">{viewingOfficer.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Số di động:</span>
                  <span className="text-right font-mono font-medium">{viewingOfficer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Thư điện tử:</span>
                  <span className="text-right font-mono text-[11px] font-medium">{viewingOfficer.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-400">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    viewingOfficer.status === 'Đang công tác' 
                      ? 'bg-emerald-50 text-emerald-600'
                      : viewingOfficer.status === 'Đi công tác'
                        ? 'bg-blue-50 text-blue-600'
                        : viewingOfficer.status === 'Nghỉ phép'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-purple-50 text-purple-600'
                  }`}>
                    {viewingOfficer.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-400">Xếp hạng KPI:</span>
                  <span className="font-mono font-extrabold text-red-600 bg-red-50 text-xs px-2 py-0.5 rounded">
                    {viewingOfficer.kpi} / 100 điểm
                  </span>
                </div>
                {viewingOfficer.dob && (
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">Ngày sinh:</span>
                    <span className="text-right font-medium font-mono">{viewingOfficer.dob}</span>
                  </div>
                )}
                {viewingOfficer.hometown && (
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">Quê quán:</span>
                    <span className="text-right font-medium">{viewingOfficer.hometown}</span>
                  </div>
                )}
                {viewingOfficer.residence && (
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">Nơi thường trú:</span>
                    <span className="text-right font-medium">{viewingOfficer.residence}</span>
                  </div>
                )}
                {viewingOfficer.notes && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 text-[11px] text-slate-500">
                    <span className="font-extrabold block text-[10px] text-slate-400 uppercase tracking-wide mb-1">Ghi chú nghiệp vụ:</span>
                    {viewingOfficer.notes}
                  </div>
                )}
              </div>

              {/* Quick assignment button linked contextually */}
              <div className="pt-2">
                <button
                  id="open-context-task-assignment-btn"
                  onClick={() => setAssigningTaskOfficer(viewingOfficer)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> GIAO VIỆC CHO CÁN BỘ NÀY
                </button>
              </div>
            </div>
          ) : assigningTaskOfficer ? (
            /* Context Task Assignment */
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4" id="officer-assign-task-form">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                  Giao việc: {assigningTaskOfficer.fullName}
                </h3>
                <button 
                  id="close-assign-task-form"
                  onClick={() => setAssigningTaskOfficer(null)} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignTask} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tiêu đề công việc *</label>
                  <input
                    id="context-task-title"
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Nhập tên nhiệm vụ..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nội dung yêu cầu</label>
                  <textarea
                    id="context-task-content"
                    value={taskContent}
                    onChange={(e) => setTaskContent(e.target.value)}
                    placeholder="Nội dung miêu tả tiến độ..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Độ ưu tiên</label>
                    <select
                      id="context-task-priority"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Thấp">Thấp</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cao">Cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Hạn hoàn thành</label>
                    <input
                      id="context-task-deadline"
                      type="date"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  id="submit-context-task-btn"
                  type="submit"
                  className="w-full py-2 bg-blue-650 hover:bg-blue-600 text-white font-bold rounded-lg text-xs"
                >
                  XÁC NHẬN PHÂN CÔNG
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-slate-450" />
              </div>
              Vui lòng chọn hoặc click vào một cán bộ chiến sĩ để thực hiện xem chi tiết, báo cáo KPI hoặc thiết lập phân công công việc trực tiếp.
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {officerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print" id="delete-officer-overlay">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-100 p-5 space-y-4 shadow-2xl" id="delete-officer-dialog">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-650 shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Xác nhận xóa biên chế
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Đồng chí có chắc chắn muốn xóa cán bộ <span className="font-bold text-slate-700">"{officerToDelete.rank} {officerToDelete.fullName}"</span> khỏi danh sách biên chế? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-1">
              <button
                id="cancel-delete-officer-btn"
                onClick={() => setOfficerToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                HỦY BỎ
              </button>
              <button
                id="confirm-delete-officer-btn"
                onClick={() => handleDeleteOfficer(officerToDelete.id)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                XÁC NHẬN XÓA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
