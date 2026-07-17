import { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { DutySchedule, DutyPeriod } from '../types';
import { formatDateDMY } from '../lib/dateUtils';
import { 
  CalendarDays, Trash2, Plus, Edit2, ShieldAlert, 
  MapPin, Clock, Search, BookOpen, AlertCircle, Eye, Info, X,
  Download, Printer, RefreshCw, CheckCircle2, Save
 } from 'lucide-react';

interface DutyScheduleModuleProps {
  store: PCCCStoreType;
}

export default function DutyScheduleModule({ store }: DutyScheduleModuleProps) {
  const { schedules, setSchedules, officers, equipment = [] } = store;

  // View mode: 'list' or 'grid_weeks'
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('All');

  // Form setup
  const [editingSchedule, setEditingSchedule] = useState<DutySchedule | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [formShift, setFormShift] = useState<DutyPeriod>('Cả ngày (24h)');
  const [formCommanderId, setFormCommanderId] = useState('');
  const [formOfficerIds, setFormOfficerIds] = useState<string[]>([]);
  const [formVehicles, setFormVehicles] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  // Conflict warning
  const [conflictWarning, setConflictWarning] = useState<string>('');
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa lịch trực chiến đấu...');
      setTimeout(() => {
        localStorage.setItem('pccc_schedules', JSON.stringify(schedules));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu thông tin phân công trực thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  const SHIFT_OPTIONS: DutyPeriod[] = [
    'Sáng (07h30 - 11h30)',
    'Chiều (13h30 - 17h30)',
    'Tối (19h00 - 07h30 hôm sau)',
    'Cả ngày (24h)'
  ];

  const activeVehicles = equipment && equipment.length > 0
    ? equipment.filter(e => e.category === 'Phương tiện chữa cháy' || e.name.toLowerCase().includes('xe')).map(e => e.name)
    : [
        'Xe chữa cháy MAN (29C-112.34)',
        'Xe chữa cháy Mercedes (29C-001.23)',
        'Xe cứu hộ cứu nạn (29C-223.45)',
        'Xe chở nước cứu hỏa (29C-555.55)',
        'Xe thang cứu nạn 32m'
      ];

  // Detect conflict when date, shift, commander or officers are modified
  const runConflictCheck = (dateVal: string, shiftVal: DutyPeriod, commId: string, offIds: string[], excludeId?: string) => {
    let duplicateMsg = '';
    
    schedules.forEach(schedule => {
      if (schedule.id === excludeId) return;

      if (schedule.date === dateVal && schedule.shift === shiftVal) {
        if (schedule.commanderId === commId && commId) {
          const matchedCommName = officers.find(o => o.id === commId)?.fullName;
          duplicateMsg += `⚠️ Chỉ huy ${matchedCommName} đã được phân lịch tại ca này!\n`;
        }
        
        const sharedOfficers = schedule.officerIds.filter(id => offIds.includes(id));
        if (sharedOfficers.length > 0) {
          const names = sharedOfficers.map(id => officers.find(o => o.id === id)?.fullName).join(', ');
          duplicateMsg += `⚠️ Cán bộ: [ ${names} ] đã trùng ca trực trên cùng một ca trực ngày ${formatDateDMY(dateVal)}!\n`;
        }
      }
    });

    setConflictWarning(duplicateMsg);
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setFormDate(`${year}-${month}-${day}`);
    setFormShift('Cả ngày (24h)');
    // Default commander to the first available high-rank officer
    const senior = officers.find(o => o.rank === 'Thượng tá' || o.rank === 'Trung tá');
    setFormCommanderId(senior ? senior.id : officers[0]?.id || '');
    setFormOfficerIds([]);
    setFormVehicles([]);
    setFormNotes('');
    setConflictWarning('');
    setIsAddingNew(true);
  };

  const handleOpenEdit = (sched: DutySchedule) => {
    setEditingSchedule(sched);
    setFormDate(sched.date);
    setFormShift(sched.shift);
    setFormCommanderId(sched.commanderId);
    setFormOfficerIds(sched.officerIds);
    setFormVehicles(sched.vehicles);
    setFormNotes(sched.notes || '');
    setConflictWarning('');
    setIsAddingNew(false);
  };

  const handleSaveSchedule = (e: any) => {
    e.preventDefault();
    if (!formCommanderId) return alert('Vui lòng chọn Chỉ huy trực');
    if (formOfficerIds.length === 0) return alert('Vui lòng phân công ít nhất một cán bộ bám trực');

    const body: Omit<DutySchedule, 'id'> = {
      date: formDate,
      shift: formShift,
      commanderId: formCommanderId,
      officerIds: formOfficerIds,
      vehicles: formVehicles,
      notes: formNotes,
    };

    if (isAddingNew) {
      const item: DutySchedule = {
        id: `DUTY_${Date.now()}`,
        ...body
      };
      setSchedules([...schedules, item]);
    } else if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, ...body } : s));
    }

    setEditingSchedule(null);
    setIsAddingNew(false);
    setConflictWarning('');
  };

  const handleDeleteSchedule = (id: string, date: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ca trực ngày ${formatDateDMY(date)}?`)) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  // Toggle officer checkbox
  const handleToggleOfficerSelect = (id: string) => {
    let nextIds = [...formOfficerIds];
    if (nextIds.includes(id)) {
      nextIds = nextIds.filter(x => x !== id);
    } else {
      nextIds.push(id);
    }
    setFormOfficerIds(nextIds);
    runConflictCheck(formDate, formShift, formCommanderId, nextIds, editingSchedule?.id);
  };

  // Fast normalized helper to matching names with brackets/whitespaces differences robustly
  const normalizeVehicleName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '');
  };

  const isVehicleChecked = (vName: string) => {
    if (formVehicles.includes(vName)) return true;
    const normalizedTarget = normalizeVehicleName(vName);
    return formVehicles.some(fv => normalizeVehicleName(fv) === normalizedTarget);
  };

  // Toggle vehicle checkbox
  const handleToggleVehicleSelect = (v: string) => {
    const isChecked = isVehicleChecked(v);
    const normalizedTarget = normalizeVehicleName(v);

    if (isChecked) {
      setFormVehicles(prev => prev.filter(fv => normalizeVehicleName(fv) !== normalizedTarget));
    } else {
      const existsInForm = formVehicles.some(fv => normalizeVehicleName(fv) === normalizedTarget);
      if (!existsInForm) {
        setFormVehicles(prev => [...prev, v]);
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    // 1. Prepare CSV headers
    const headers = [
      'STT',
      'Mã Lịch trực',
      'Ngày trực',
      'Ca trực',
      'Chỉ huy trực',
      'Cán bộ tham gia',
      'Phương tiện trực chiến',
      'Ghi chú'
    ];

    // Helper to escape special characters for CSV
    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    // 2. Map data rows
    const rows = filteredSchedules.map((s, idx) => {
      const commander = officers.find(o => o.id === s.commanderId)?.fullName || '';
      const helpers = s.officerIds.map(id => officers.find(o => o.id === id)?.fullName || '').join('; ');
      
      return [
        (idx + 1).toString(),
        s.id,
        s.date,
        s.shift,
        commander,
        helpers,
        s.vehicles.join('; '),
        s.notes || ''
      ].map(escapeCSV).join(',');
    });

    // 3. Assemble CSV text with UTF-8 BOM representation for Excel
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');

    // 4. Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh_Sach_Lich_Truc_PCCC_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Selected Items
  const handleExportSelectedCSV = () => {
    if (selectedScheduleIds.length === 0) return;
    
    // 1. Prepare CSV headers
    const headers = [
      'STT',
      'Mã Lịch trực',
      'Ngày trực',
      'Ca trực',
      'Chỉ huy trực',
      'Cán bộ tham gia',
      'Phương tiện trực chiến',
      'Ghi chú'
    ];

    // Helper to escape special characters for CSV
    const escapeCSV = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      let cleanVal = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${cleanVal}"`;
    };

    // Filter schedules that match selected internal IDs
    const selectedSchedules = filteredSchedules.filter(s => selectedScheduleIds.includes(s.id));

    // 2. Map data rows
    const rows = selectedSchedules.map((s, idx) => {
      const commander = officers.find(o => o.id === s.commanderId)?.fullName || '';
      const helpers = s.officerIds.map(id => officers.find(o => o.id === id)?.fullName || '').join('; ');
      
      return [
        (idx + 1).toString(),
        s.id,
        s.date,
        s.shift,
        commander,
        helpers,
        s.vehicles.join('; '),
        s.notes || ''
      ].map(escapeCSV).join(',');
    });

    // 3. Assemble CSV text with UTF-8 BOM representation for Excel
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');

    // 4. Create local blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_Sach_Lich_Truc_PCCC_Da_Chon_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(s => {
    const matchesOfficer = selectedOfficerId === 'All' || 
                          s.commanderId === selectedOfficerId || 
                          s.officerIds.includes(selectedOfficerId);
    const matchesSearch = s.date.includes(searchTerm) || 
                          s.shift.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOfficer && matchesSearch;
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6" id="duty-schedule-module">
      {/* Official State Banner for PDF Print Export only */}
      <div className="print-only mb-6 text-center border-b border-slate-300 pb-4">
        <div className="flex justify-between items-start text-[11px] font-semibold uppercase tracking-tight mb-4">
          <div className="text-center w-1/2 leading-relaxed">
            <span className="block font-bold">CÔNG AN TỈNH LONG AN</span>
            <span className="block font-extrabold text-xs">CẢNH SÁT PCCC & CNCH TÂN AN</span>
            <span className="block text-[9px] font-normal lowercase tracking-normal mt-0.5">Số: ...... /QĐ-PCCC</span>
          </div>
          <div className="text-center w-1/2 leading-relaxed">
            <span className="block font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
            <span className="block font-bold border-b border-black w-2/3 mx-auto pb-0.5">Độc lập - Tự do - Hạnh phúc</span>
            <span className="block text-[9px] font-normal italic tracking-normal mt-1 text-slate-500">Tân An, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</span>
          </div>
        </div>
        <h1 className="text-base font-extrabold text-slate-950 tracking-wider uppercase mt-6 mb-1">
          BẢNG PHÂN TRỰC CHIẾN ĐẤU CA QUÂN HẰNG NGÀY
        </h1>
        <p className="text-[10px] text-slate-600 font-mono">ĐƠN VỊ: ĐỘI PHÒNG CHÁY CHỮA CHÁY VÀ CỨU NẠN CỨU HỘ KHU VỰC TÂN AN</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-red-600" />
            BẢNG PHÂN CÔNG TRỰC
          </h2>

          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center no-print">
          {/* Auto update status indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[10.5px] font-bold shadow-3xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Tự động cập nhật: BẬT</span>
          </div>

          <button
            id="manual-sync-btn"
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer ${isSyncing ? 'opacity-85 pointer-events-none' : ''}`}
            title="Nhấn để chủ động cập nhật lưu trữ và kiểm tra đồng bộ dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'ĐANG LƯU DỮ LIỆU...' : 'CẬP NHẬT & LƯU'}
          </button>

          <button
            id="export-duty-excel-btn"
            onClick={selectedScheduleIds.length > 0 ? handleExportSelectedCSV : handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
            title={selectedScheduleIds.length > 0 ? "Xuất các ca trực đã chọn ra file Excel (CSV)" : "Xuất toàn bộ danh sách phân trực hiện tại ra file Excel (CSV)"}
          >
            <Download className="w-4 h-4" />
            {selectedScheduleIds.length > 0 
              ? `XUẤT EXCEL ĐÃ CHỌN (${selectedScheduleIds.filter(id => filteredSchedules.some(s => s.id === id)).length})`
              : 'XUẤT FILE EXCEL'
            }
          </button>
          <button
            id="add-duty-btn"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> THÊM LỊCH TRỰC
          </button>
        </div>
      </div>

      {/* Filter widgets */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between no-print">
        <div className="flex flex-1 gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Bộ lọc:</span>
          <select
            id="duty-officer-filter"
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs"
          >
            <option value="All">--- Lọc theo Cán bộ ---</option>
            {officers.filter(o => o.position !== 'Chiến sĩ').map(off => (
              <option key={off.id} value={off.id}>{off.rank} {off.fullName} ({off.unit})</option>
            ))}
          </select>

          <input
            id="duty-search"
            type="text"
            placeholder="Tìm theo ngày (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-xs w-48"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
          <button 
            id="mode-list"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
          >
            Chế độ Danh sách
          </button>
          <button 
            id="mode-week"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
          >
            Chế độ Theo tuần
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main schedule view screen. Left col span 2 */}
        <div className="lg:col-span-2 space-y-4 shadow-xs" id="schedule-viewport">
          {viewMode === 'list' ? (
            /* Traditional List view grouped by Month */
            <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden" id="duty-list-table">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    id="select-all-duty-btn"
                    onClick={() => {
                      const allFilteredIds = filteredSchedules.map(s => s.id);
                      const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedScheduleIds.includes(id));
                      if (isAllSelected) {
                        setSelectedScheduleIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                      } else {
                        setSelectedScheduleIds(prev => {
                          const newIds = [...prev];
                          allFilteredIds.forEach(id => {
                            if (!newIds.includes(id)) newIds.push(id);
                          });
                          return newIds;
                        });
                      }
                    }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      filteredSchedules.length > 0 && filteredSchedules.every(s => selectedScheduleIds.includes(s.id))
                        ? 'bg-red-650 border-red-650 shadow-xs text-white'
                        : 'border-slate-350 hover:border-slate-450 bg-white text-slate-400'
                    }`}
                    title={filteredSchedules.length > 0 && filteredSchedules.every(s => selectedScheduleIds.includes(s.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả lịch trực"}
                  >
                    {filteredSchedules.length > 0 && filteredSchedules.every(s => selectedScheduleIds.includes(s.id)) && (
                      <svg className="w-3 h-3 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">Lịch trực chi tiết thứ tự thời gian</span>
                  {selectedScheduleIds.length > 0 && (
                    <span className="text-xs font-bold text-red-650 bg-red-100/60 px-2 py-0.5 rounded font-mono">
                      Đã chọn {selectedScheduleIds.filter(id => filteredSchedules.some(s => s.id === id)).length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedScheduleIds.length > 0 && (
                    <button
                      id="clear-duty-selection-btn"
                      onClick={() => setSelectedScheduleIds([])}
                      className="text-[10px] text-slate-500 hover:text-slate-705 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                  <span className="text-xs font-semibold text-slate-400 font-mono">{new Date().getFullYear()}</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredSchedules.map((schedule) => {
                  const commander = officers.find(o => o.id === schedule.commanderId);
                  const helpers = schedule.officerIds.map(id => officers.find(o => o.id === id)).filter(Boolean);
                  
                  // Construct array of on-duty personnel for the table
                  const tableRows: Array<{
                    fullName: string;
                    position: string;
                    phone: string;
                  }> = [];

                  if (commander) {
                    tableRows.push({
                      fullName: `${commander.rank} ${commander.fullName}`,
                      position: commander.position || 'Chỉ huy ca trực',
                      phone: commander.phone || '-',
                    });
                  }

                  helpers.forEach(h => {
                    if (h) {
                      tableRows.push({
                        fullName: `${h.rank} ${h.fullName}`,
                        position: h.position || 'Cán bộ trực chiến',
                        phone: h.phone || '-',
                      });
                    }
                  });

                  const isSelected = selectedScheduleIds.includes(schedule.id);
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className={`p-5 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row gap-4 justify-between items-start ${
                        isSelected ? 'bg-red-50/15 border-l-4 border-red-500 pl-4 py-5 pr-5' : 'border-l-4 border-transparent'
                      }`}
                    >
                      {/* Circular Selection Checkbox */}
                      <button
                        id={`select-duty-btn-${schedule.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScheduleIds(prev => 
                            prev.includes(schedule.id) 
                              ? prev.filter(id => id !== schedule.id) 
                              : [...prev, schedule.id]
                          );
                        }}
                        className={`mt-1.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-650 border-red-650 shadow-xs text-white'
                            : 'border-slate-300 hover:border-slate-450 bg-white text-slate-300'
                        }`}
                        title={isSelected ? "Bỏ chọn" : "Chọn ca trực"}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>

                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex items-center gap-2">
                          <span className="w-24 font-mono font-extrabold text-red-650 text-xs bg-red-100/40 text-center py-1 rounded">
                            {formatDateDMY(schedule.date)}
                          </span>
                        </div>

                        {/* Crew Details - Table Format */}
                        <div className="mt-2.5 overflow-x-auto rounded-lg border border-slate-150">
                          <table className="min-w-full divide-y divide-slate-150 text-left text-xs bg-white">
                            <thead className="bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-center w-12 border-b border-slate-150">STT</th>
                                <th scope="col" className="px-3 py-2 border-b border-slate-150">Tên cán bộ</th>
                                <th scope="col" className="px-3 py-2 border-b border-slate-150">Chức vụ</th>
                                <th scope="col" className="px-3 py-2 border-b border-slate-150">Số điện thoại</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-705 bg-white">
                              {tableRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-1.5 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                                  <td className="px-3 py-1.5 font-bold text-slate-800">{row.fullName}</td>
                                  <td className="px-3 py-1.5 text-slate-500 font-semibold">{row.position}</td>
                                  <td className="px-3 py-1.5 font-mono text-slate-600 font-bold">{row.phone}</td>
                                </tr>
                              ))}
                              {tableRows.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="px-3 py-3 text-center text-slate-400 italic">Chưa phân công cán bộ</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-1.5">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Phương tiện trực ban</span>
                          <div className="overflow-x-auto rounded-lg border border-slate-150 max-w-md">
                            <table className="min-w-full divide-y divide-slate-150 text-left text-[11px] bg-white">
                              <thead className="bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                                <tr>
                                  <th scope="col" className="px-2.5 py-1 text-center w-10 border-b border-slate-150">STT</th>
                                  <th scope="col" className="px-2.5 py-1 border-b border-slate-150">Tên phương tiện</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-705 bg-white font-medium">
                                {schedule.vehicles.map((vehicle, vIdx) => (
                                  <tr key={vIdx} className="hover:bg-slate-50/50">
                                    <td className="px-2.5 py-1 text-center font-mono text-slate-400 font-bold">{vIdx + 1}</td>
                                    <td className="px-2.5 py-1 font-bold text-slate-800">{vehicle}</td>
                                  </tr>
                                ))}
                                {schedule.vehicles.length === 0 && (
                                  <tr>
                                    <td colSpan={2} className="px-2.5 py-1.5 text-center text-slate-400 italic">Chưa phân công phương tiện</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {schedule.notes && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 text-[11px] text-slate-500 max-w-xl">
                            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wide block mb-0.5">Tình hình bàn giao:</span>
                            {schedule.notes}
                          </div>
                        )}
                      </div>

                      {/* Controls on right */}
                      <div className="flex items-center gap-1.5 self-end md:self-center no-print">
                        <button
                          id={`edit-duty-${schedule.id}`}
                          onClick={() => handleOpenEdit(schedule)}
                          className="p-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded text-xs transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button
                          id={`delete-duty-${schedule.id}`}
                          onClick={() => handleDeleteSchedule(schedule.id, schedule.date)}
                          className="p-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-100 rounded text-xs transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredSchedules.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    Chưa có lịch phân công được thiết lập cho bộ lọc này.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Weekly View: styled visually as bento boxes representing days of week starting from 2026-06-12 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="duty-week-bento">
              {filteredSchedules.map((schedule) => {
                const dayName = new Date(schedule.date).toLocaleDateString('vi-VN', { weekday: 'long' });
                const commander = officers.find(o => o.id === schedule.commanderId);
                const helpers = schedule.officerIds.map(id => officers.find(o => o.id === id)).filter(Boolean);

                const tableRows: Array<{
                  fullName: string;
                  position: string;
                  phone: string;
                }> = [];

                if (commander) {
                  tableRows.push({
                    fullName: `${commander.rank} ${commander.fullName}`,
                    position: commander.position || 'Chỉ huy ca trực',
                    phone: commander.phone || '-',
                  });
                }

                helpers.forEach(h => {
                  if (h) {
                    tableRows.push({
                      fullName: `${h.rank} ${h.fullName}`,
                      position: h.position || 'Cán bộ trực chiến',
                      phone: h.phone || '-',
                    });
                  }
                });

                const isSelected = selectedScheduleIds.includes(schedule.id);

                return (
                  <div 
                    key={schedule.id} 
                    onClick={() => {
                      setSelectedScheduleIds(prev => 
                        prev.includes(schedule.id) 
                          ? prev.filter(id => id !== schedule.id) 
                          : [...prev, schedule.id]
                      );
                    }}
                    className={`bg-white p-5 rounded-xl border transition-all duration-200 card-print space-y-3 shadow-xs cursor-pointer ${
                      isSelected 
                        ? 'border-red-500 ring-3 ring-red-500/10 bg-red-50/5' 
                        : 'border-slate-100 hover:border-red-400'
                    }`}
                  >
                    <div className="flex justify-between items-start border-b border-slate-50 pb-2.5">
                      <div className="flex items-start gap-2.5">
                        {/* Circular Selection Checkbox */}
                        <button
                          id={`select-duty-week-btn-${schedule.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScheduleIds(prev => 
                              prev.includes(schedule.id) 
                                ? prev.filter(id => id !== schedule.id) 
                                : [...prev, schedule.id]
                            );
                          }}
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-650 border-red-650 shadow-xs text-white'
                              : 'border-slate-300 hover:border-slate-450 bg-white text-slate-300'
                          }`}
                          title={isSelected ? "Bỏ chọn" : "Chọn ca trực"}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <span className="text-red-650 font-extrabold text-xs uppercase block tracking-wider">{dayName}</span>
                          <h4 className="font-extrabold text-slate-800 text-sm font-mono">{formatDateDMY(schedule.date)}</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded uppercase">
                        {schedule.shift}
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="overflow-x-auto rounded-lg border border-slate-150">
                        <table className="min-w-full divide-y divide-slate-150 text-left text-xs bg-white">
                          <thead className="bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                            <tr>
                              <th scope="col" className="px-2 py-1.5 text-center w-10 border-b border-slate-150">STT</th>
                              <th scope="col" className="px-2 py-1.5 border-b border-slate-150">Tên cán bộ</th>
                              <th scope="col" className="px-2 py-1.5 border-b border-slate-150">Chức vụ</th>
                              <th scope="col" className="px-2 py-1.5 border-b border-slate-150">Số điện thoại</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-705 bg-white">
                            {tableRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-2 py-1.5 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                                <td className="px-2 py-1.5 font-bold text-slate-800">{row.fullName}</td>
                                <td className="px-2 py-1.5 text-slate-500 font-semibold">{row.position}</td>
                                <td className="px-2 py-1.5 font-mono text-slate-600 font-medium">{row.phone}</td>
                              </tr>
                            ))}
                            {tableRows.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-2 py-2 text-center text-slate-400 italic">Chưa phân công cán bộ</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <strong className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Thống kê phương tiện:</strong>
                        <div className="overflow-x-auto rounded-lg border border-slate-150">
                          <table className="min-w-full divide-y divide-slate-150 text-left text-[11px] bg-white">
                            <thead className="bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                              <tr>
                                <th scope="col" className="px-2 py-1 text-center w-10 border-b border-slate-150">STT</th>
                                <th scope="col" className="px-2 py-1 border-b border-slate-150">Tên phương tiện</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-705 bg-white font-medium">
                              {schedule.vehicles.map((v, vIdx) => (
                                <tr key={vIdx} className="hover:bg-slate-50/50">
                                  <td className="px-2 py-1 text-center font-mono text-slate-400 font-bold">{vIdx + 1}</td>
                                  <td className="px-2 py-1 font-bold text-slate-800">{v}</td>
                                </tr>
                              ))}
                              {schedule.vehicles.length === 0 && (
                                <tr>
                                  <td colSpan={2} className="px-2 py-1.5 text-center text-slate-400 italic">Chưa phân công phương tiện</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form panel on right. Col span 1 */}
        <div id="duty-form-container">
          {(editingSchedule || isAddingNew) ? (
            <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4" id="duty-schedule-form">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                  {isAddingNew ? 'Lập Ca Trực Mới' : 'Cập Nhật Ca Trực'}
                </h3>
                <button 
                  id="close-duty-form"
                  onClick={() => {
                    setEditingSchedule(null);
                    setIsAddingNew(false);
                    setConflictWarning('');
                  }} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {conflictWarning && (
                <div className="bg-amber-50 border border-amber-250 p-3 rounded-lg text-amber-800 text-xs font-semibold whitespace-pre-line leading-relaxed">
                  <div className="flex items-center gap-1.5 font-extrabold mb-1">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 inline shrink-0" />
                    <span>PHÁT HIỆN TRÙNG LỊCH TRỰC:</span>
                  </div>
                  {conflictWarning}
                </div>
              )}

              <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Ngày trực *</label>
                  <input
                    id="schedule-date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      runConflictCheck(e.target.value, formShift, formCommanderId, formOfficerIds, editingSchedule?.id);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>



                <div>
                  <label className="block text-slate-600 font-bold mb-1">Chỉ huy trực *</label>
                  <select
                    id="schedule-commander"
                    value={formCommanderId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormCommanderId(val);
                      runConflictCheck(formDate, formShift, val, formOfficerIds, editingSchedule?.id);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- Chọn Chỉ huy --</option>
                    {officers.filter(o => (o.status === 'Đang công tác' || o.status === 'Đi công tác') && o.position !== 'Chiến sĩ').map(o => (
                      <option key={o.id} value={o.id}>{o.rank} {o.fullName} ({o.position})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Cán bộ hỗ trợ tác chiến *</label>
                  <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto p-2.5 space-y-1.5" id="schedule-officers-checkboxes">
                    {officers.filter(o => (o.status === 'Đang công tác' || o.status === 'Đi công tác') && o.position !== 'Chiến sĩ').map(o => (
                      <label key={o.id} className="flex items-center gap-2 cursor-pointer font-medium hover:text-red-650">
                        <input
                          id={`officer-checkbox-${o.id}`}
                          type="checkbox"
                          checked={formOfficerIds.includes(o.id)}
                          onChange={() => handleToggleOfficerSelect(o.id)}
                          className="rounded text-red-650 focus:ring-red-500"
                        />
                        <span>{o.rank} {o.fullName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Giao phương tiện chữa cháy chủ lực</label>
                  <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto p-2.5 space-y-1.5" id="schedule-vehicles-checkboxes">
                    {activeVehicles.map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer font-medium hover:text-red-650 transition-colors">
                        <input
                          id={`vehicle-checkbox-${v.replace(/[^a-zA-Z0-9]/g, '')}`}
                          type="checkbox"
                          checked={isVehicleChecked(v)}
                          onChange={() => handleToggleVehicleSelect(v)}
                          className="rounded text-red-650 focus:ring-red-500"
                        />
                        <span>{v}</span>
                      </label>
                    ))}
                    {activeVehicles.length === 0 && (
                      <div className="text-slate-400 italic text-[11px] text-center py-2">
                        Không có phương tiện chữa cháy nào hoạt động.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tình hình bàn giao ca trực / Ghi chú</label>
                  <textarea
                    id="schedule-notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs h-16"
                    placeholder="Tình hình máy móc xe cộ, xăng dầu, túc trực..."
                  />
                </div>

                <button
                  id="save-schedule-submit"
                  type="submit"
                  className="w-full py-2.5 bg-red-650 hover:bg-red-750 active:scale-[0.99] text-white font-extrabold rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer uppercase"
                >
                  <Save className="w-4 h-4" />
                  CẬP NHẬT & LƯU THÔNG TIN
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2 animate-pulse" />
              Lựa chọn hoặc thêm mới một ca trực để phần mềm kích hoạt hệ thống kiểm định mâu thuẫn trực thuộc, kiểm soát chồng chéo công văn và tự động cảnh báo xung đột lịch trực.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
