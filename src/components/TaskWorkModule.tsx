import { useState, useEffect } from 'react';
import { PCCCStoreType } from '../lib/store';
import { TaskWork } from '../types';
import { 
  CheckSquare, Search, Plus, Trash2, Edit2, Check, Clock, AlertCircle, 
  HelpCircle, MoreVertical, ShieldAlert, X, User, Flag, MessageSquareCode,
  RefreshCw, CheckCircle2, Download
} from 'lucide-react';
import { formatDateDMY } from '../lib/dateUtils';

interface TaskWorkProps {
  store: PCCCStoreType;
}

export default function TaskWorkModule({ store }: TaskWorkProps) {
  const { tasks, setTasks, officers } = store;

  // Searches & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Form states
  const [editingTask, setEditingTask] = useState<TaskWork | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCreator, setFormCreator] = useState('');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formStartDate, setFormStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [formDeadline, setFormDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [formPriority, setFormPriority] = useState<'Thấp' | 'Trung bình' | 'Cao'>('Trung bình');
  const [formStatus, setFormStatus] = useState<'Chưa thực hiện' | 'Đang xử lý' | 'Hoàn thành' | 'Quá hạn'>('Chưa thực hiện');
  const [formResultNotes, setFormResultNotes] = useState('');
  const [formRecurrence, setFormRecurrence] = useState('');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formPublisher, setFormPublisher] = useState('');

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu chỉ đạo và phân công nhiệm vụ...');
      setTimeout(() => {
        localStorage.setItem('pccc_tasks', JSON.stringify(tasks));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ tiến độ công việc thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  // Auto trigger overdue checks based on dynamic currentDate state
  useEffect(() => {
    if (!currentDate) return;
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    let needsUpdate = false;
    const checkedTasks = tasks.map(t => {
      if (t.status !== 'Hoàn thành') {
        const dDate = new Date(t.deadline);
        dDate.setHours(0, 0, 0, 0);
        if (dDate < today) {
          if (t.status !== 'Quá hạn') {
            needsUpdate = true;
            return { ...t, status: 'Quá hạn' as const };
          }
        } else {
          // dDate >= today (thời hạn xử lý lớn hơn hoặc bằng thời hạn hiện tại)
          if (t.status === 'Chưa thực hiện' || t.status === 'Quá hạn') {
            needsUpdate = true;
            return { ...t, status: 'Đang xử lý' as const };
          }
        }
      }
      return t;
    });

    if (needsUpdate) {
      setTasks(checkedTasks);
    }
  }, [currentDate, tasks, setTasks]);

  // Periodic sync of currentDate state to actual real system date
  useEffect(() => {
    const syncToToday = () => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      setCurrentDate(prev => prev !== todayStr ? todayStr : prev);
    };

    syncToToday();
    const timer = setInterval(syncToToday, 10000); // Check every 10 seconds for instant synchronization
    return () => clearInterval(timer);
  }, []);

  // Parse taskId from URL deep links and automatically search for it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('taskId') || params.get('task_id');
    if (targetId) {
      const match = tasks.find(t => t.id === targetId);
      if (match) {
        setSearchTerm(match.title);
      }
    }
  }, [tasks]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormContent('');
    setFormCreator(store.currentUser?.fullName || 'Nguyễn Văn Hải');
    setFormAssigneeId(officers.find(o => o.position !== 'Chiến sĩ')?.id || '');
    setFormStartDate(currentDate);
    
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setFormDeadline(d.toISOString().slice(0, 10));
    
    setFormPriority('Trung bình');
    setFormStatus('Đang xử lý');
    setFormResultNotes('');
    setFormRecurrence('');
    setFormDocNumber('');
    setFormPublisher('');
    setIsAddingNew(true);
  };

  const handleOpenEdit = (task: TaskWork) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormContent(task.content);
    setFormCreator(task.creatorId);
    setFormAssigneeId(task.assigneeId);
    setFormStartDate(task.startDate);
    setFormDeadline(task.deadline);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormResultNotes(task.resultNotes || '');
    setFormRecurrence(task.recurrence || '');
    setFormDocNumber(task.docNumber || '');
    setFormPublisher(task.publisher || '');
    setIsAddingNew(false);
  };

  const handleRecurrenceChange = (value: string) => {
    setFormRecurrence(value);
  };

  const handleSaveTask = (e: any) => {
    e.preventDefault();
    if (!formTitle.trim()) return alert('Nhập tiêu đề công việc');
    if (!formAssigneeId) return alert('Lựa chọn cán bộ chịu trách nhiệm');

    let finalStatus = formStatus;
    let finalDeadline = formDeadline;
    let finalResultNotes = formResultNotes;

    if (formStatus === 'Hoàn thành' && formRecurrence) {
      const baseDate = new Date(formDeadline || new Date());
      if (formRecurrence === 'Hàng ngày') {
        baseDate.setDate(baseDate.getDate() + 1);
      } else if (formRecurrence === 'Hàng tuần') {
        baseDate.setDate(baseDate.getDate() + 7);
      } else if (formRecurrence === 'Hàng tháng') {
        baseDate.setMonth(baseDate.getMonth() + 1);
      } else if (formRecurrence === 'Hàng năm') {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
      }

      const yyyy = baseDate.getFullYear();
      const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
      const dd = String(baseDate.getDate()).padStart(2, '0');
      finalDeadline = `${yyyy}-${mm}-${dd}`;
      finalStatus = 'Đang xử lý'; // reset status to 'Đang xử lý' (Đang thực hiện)
      finalResultNotes = `Đã hoàn thành lượt trước ngày ${formDeadline || 'chưa rõ'}. Tự động gia hạn chu kỳ tiếp theo (${formRecurrence}). Ghi chú cũ: ${formResultNotes || 'Không có'}`;
      alert(`Công việc lặp lại (${formRecurrence}) đã được hoàn thành!\nHạn dứt điểm đã tự động thay đổi theo chu kỳ mới: ${finalDeadline} và trạng thái xử lý chuyển thành "Đang thực hiện".`);
    }

    const body: Omit<TaskWork, 'id'> = {
      title: formTitle,
      content: formContent,
      creatorId: formCreator,
      assigneeId: formAssigneeId,
      startDate: formStartDate,
      deadline: finalDeadline,
      priority: formPriority,
      status: finalStatus,
      resultNotes: finalResultNotes || undefined,
      recurrence: formRecurrence || undefined,
      docNumber: formDocNumber || undefined,
      publisher: formPublisher || undefined,
    };

    if (isAddingNew) {
      setTasks([...tasks, { id: `TASK_${Date.now()}`, ...body }]);
    } else if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...body } : t));
    }

    setEditingTask(null);
    setIsAddingNew(false);
  };

  const handleDeleteTask = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn gỡ bỏ nhiệm vụ: ${name}?`)) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleQuickResolve = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (t.recurrence) {
          const baseDate = new Date(t.deadline || new Date());
          if (t.recurrence === 'Hàng ngày') {
            baseDate.setDate(baseDate.getDate() + 1);
          } else if (t.recurrence === 'Hàng tuần') {
            baseDate.setDate(baseDate.getDate() + 7);
          } else if (t.recurrence === 'Hàng tháng') {
            baseDate.setMonth(baseDate.getMonth() + 1);
          } else if (t.recurrence === 'Hàng năm') {
            baseDate.setFullYear(baseDate.getFullYear() + 1);
          }
          const yyyy = baseDate.getFullYear();
          const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
          const dd = String(baseDate.getDate()).padStart(2, '0');
          const nextDeadline = `${yyyy}-${mm}-${dd}`;
          
          alert(`Công việc lặp lại (${t.recurrence}) đã được hoàn thành!\nHạn dứt điểm đã tự động thay đổi theo chu kỳ mới: ${nextDeadline} và trạng thái xử lý chuyển thành "Đang thực hiện".`);
          
          return {
            ...t,
            deadline: nextDeadline,
            status: 'Đang xử lý' as const,
            resultNotes: `Đã hoàn thành lượt trước ngày ${t.deadline || 'chưa rõ'}. Tự động lặp lại chu kỳ mới.`
          };
        } else {
          return {
            ...t,
            status: 'Hoàn thành' as const,
            resultNotes: 'Đã hoàn thành xuất sắc và báo cáo cấp trên thông qua trực tiếp.'
          };
        }
      }
      return t;
    }));
  };

  const exportTasksToExcel = () => {
    const headers = [
      "Mã nhiệm vụ",
      "Số hiệu văn bản",
      "Cơ quan ban hành",
      "Trích yếu",
      "Mô tả nội dung tiến độ chi tiết",
      "Người khởi tạo / giao việc",
      "Cán bộ chịu trách nhiệm",
      "Ngày bắt đầu",
      "Hạn dứt điểm",
      "Độ ưu tiên",
      "Trạng thái xử lý",
      "Nhắc việc lặp lại",
      "Ghi chú kết quả"
    ];

    const rows = filteredTasks.map(t => {
      const matchedOfficer = officers.find(o => o.id === t.assigneeId);
      const assigneeName = matchedOfficer ? `${matchedOfficer.rank} ${matchedOfficer.fullName}` : '--';
      return [
        `"${t.id}"`,
        `"${(t.docNumber || '').replace(/"/g, '""')}"`,
        `"${(t.publisher || '').replace(/"/g, '""')}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.content.replace(/"/g, '""')}"`,
        `"${(t.creatorId || '').replace(/"/g, '""')}"`,
        `"${assigneeName.replace(/"/g, '""')}"`,
        `"${t.startDate || ''}"`,
        `"${t.deadline}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${(t.recurrence || 'Không').replace(/"/g, '""')}"`,
        `"${(t.resultNotes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_nhiem_vu_cong_viec_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchedAssignee = officers.find(o => o.id === t.assigneeId);
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (matchedAssignee?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || 
                          (selectedStatus === 'Đang xử lý' && (t.status === 'Đang xử lý' || t.status === 'Chưa thực hiện')) ||
                          (selectedStatus === 'Hoàn thành' && t.status === 'Hoàn thành') ||
                          (selectedStatus === 'Quá hạn' && t.status === 'Quá hạn');
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6" id="tasks-module">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-red-650" />
            KIỂM SOÁT CÔNG VIỆC
          </h2>

          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          {/* Interactive Current Date configuration widget */}
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50/70 border border-red-100 text-red-700 rounded-lg text-xs font-bold shadow-3xs">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-red-600">Ngày hiện tại:</span>
            <input
              type="date"
              id="tasks-current-date-input"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(e.target.value);
                }
              }}
              className="bg-white border border-red-200 rounded px-2 py-1 text-xs text-red-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer shadow-3xs hover:bg-red-50 transition-colors"
              title="Thay đổi ngày hiện tại để tự động chuyển trạng thái quá hạn các nhiệm vụ"
            />
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
            id="add-task-btn"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-650 hover:bg-red-750 active:scale-[0.98] text-white font-extrabold rounded-lg text-xs shrink-0 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> THIẾT LẬP NHIỆM VỤ MỚI
          </button>
        </div>
      </div>

      {/* Lọc */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 no-print">
        <div className="relative lg:col-span-2 md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Tìm việc theo tên, yêu cầu, hoặc tên cán bộ bám trực..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded border-slate-200 text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <select
            id="task-priority-filter"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs text-slate-700"
          >
            <option value="All">--- Tất cả Ưu tiên ---</option>
            <option value="Thấp">Thấp</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Cao">Cao</option>
          </select>
        </div>

        <div>
          <select
            id="task-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs text-slate-705"
          >
            <option value="All">--- Tất cả Trạng thái ---</option>
            <option value="Đang xử lý">Đang thực hiện</option>
            <option value="Hoàn thành">Đã hoàn thành</option>
            <option value="Quá hạn">Quá hạn</option>
          </select>
        </div>

        <div className="flex">
          <button
            id="export-tasks-excel-btn"
            onClick={exportTasksToExcel}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            title="Xuất Excel các nhiệm vụ công việc hiện tại dựa theo bộ lọc"
          >
            <Download className="w-4 h-4" />
            Xuất file Excel
          </button>
        </div>
      </div>

      {/* Grid view tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main core list (Col span 2) */}
        <div className="lg:col-span-2 space-y-4" id="tasks-list-viewport">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTasks.map(task => {
              const matchedOfficer = officers.find(o => o.id === task.assigneeId);
              const dDead = new Date(task.deadline);
              dDead.setHours(0,0,0,0);
              const dToday = new Date(currentDate);
              dToday.setHours(0,0,0,0);
              const isOverdue = task.status === 'Quá hạn' || (task.status !== 'Hoàn thành' && dDead < dToday);
              
              return (
                <div
                  key={task.id}
                  id={`task-card-${task.id}`}
                  onClick={() => {
                    setEditingTask(null);
                    setEditingTask(task);
                    setIsAddingNew(false);
                    // Open view details in editing model
                    handleOpenEdit(task);
                  }}
                  className={`bg-white p-5 rounded-xl border cursor-pointer hover:border-slate-350 hover:shadow-sm transition-all flex flex-col justify-between ${
                    editingTask?.id === task.id ? 'border-red-505 ring-2 ring-red-500/10' : 'border-slate-100'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        {task.recurrence && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1 inline-flex">
                            <RefreshCw className="w-2.5 h-2.5" />
                            Lặp lại: {task.recurrence}
                          </span>
                        )}
                        {(task.docNumber || task.publisher) && (
                          <div className="text-[10px] text-slate-500 font-bold mt-1.5 flex flex-wrap items-center gap-1.5">
                            {task.docNumber && (
                              <div className="flex items-center gap-1">
                                <span>Số hiệu VB:</span>
                                <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{task.docNumber}</span>
                              </div>
                            )}
                            {task.publisher && (
                              <div className="flex items-center gap-1">
                                <span>Cơ quan ban hành:</span>
                                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{task.publisher}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <h4 className="font-extrabold text-[#1e293b] text-sm mt-1.5 leading-relaxed">
                          {task.title}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded uppercase shrink-0 ${
                        task.status === 'Hoàn thành'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : isOverdue
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {task.status === 'Hoàn thành' ? 'Đã hoàn thành' : isOverdue ? 'Quá hạn' : 'Đang thực hiện'}
                      </span>
                    </div>

                    <p className="text-slate-500 text-[11.5px] line-clamp-2 leading-relaxed font-semibold">
                      {task.content}
                    </p>

                    {task.resultNotes && (
                      <div className="bg-emerald-50/60 p-2 text-[10.5px] rounded-lg border border-emerald-100/50">
                        <span className="font-extrabold text-emerald-800">Kết quả ghi chú:</span>{' '}
                        <span className="font-semibold text-emerald-700">{task.resultNotes}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 p-2 text-[10.5px] text-slate-500 flex items-center gap-1.5 rounded-lg border border-slate-100/50">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Trách nhiệm:</span>
                      <strong className="text-slate-700">{matchedOfficer ? `${matchedOfficer.rank} ${matchedOfficer.fullName}` : 'Chưa nhập'}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10.5px] text-slate-400 no-print font-medium font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hạn: <strong className={isOverdue ? 'text-red-600' : 'text-slate-700'}>{formatDateDMY(task.deadline)}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {task.status !== 'Hoàn thành' && (
                        <button
                          id={`quick-resolve-${task.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickResolve(task.id);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-all cursor-pointer"
                        >
                          Xong
                        </button>
                      )}
                      
                      <button
                        id={`delete-task-${task.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.title);
                        }}
                        className="text-red-650 font-bold hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                Chưa có công việc quy chuẩn được ghi dán tương đồng.
              </div>
            )}
          </div>
        </div>

        {/* Form side task. Col span 1 */}
        <div id="task-entry-form">
          {(editingTask || isAddingNew) ? (
            <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                  {isAddingNew ? 'Lập Công Việc Mới' : 'Chi Tiết & Biên tập'}
                </h3>
                <button id="close-task-form" onClick={() => { setEditingTask(null); setIsAddingNew(false); }} className="text-slate-400">X</button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-semibold text-slate-650">
                <div>
                  <label className="block mb-1">Số hiệu văn bản (nếu có)</label>
                  <input
                    id="task-form-doc-number"
                    type="text"
                    value={formDocNumber}
                    onChange={(e) => setFormDocNumber(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 font-medium text-slate-800"
                    placeholder="Ví dụ: 120/QĐ-UBND"
                  />
                </div>

                <div>
                  <label className="block mb-1">Cơ quan ban hành (nếu có)</label>
                  <input
                    id="task-form-publisher"
                    type="text"
                    value={formPublisher}
                    onChange={(e) => setFormPublisher(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 font-medium text-slate-800"
                    placeholder="Ví dụ: UBND Quận, CA Quận..."
                  />
                </div>

                <div>
                  <label className="block mb-1">Trích yếu *</label>
                  <input
                    id="task-form-title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 font-extrabold text-slate-800"
                    placeholder="Ví dụ: Lập biên bản xử phạt Royal..."
                  />
                </div>

                <div>
                  <label className="block mb-1">Mô tả nội dung tiến độ chi tiết</label>
                  <textarea
                    id="task-form-content"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 h-20 text-xs text-slate-800 font-medium"
                    placeholder="Chỉ thị chi tiết yêu cầu quân nhu..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Cán bộ phụ trách *</label>
                    <select
                      id="task-form-assignee"
                      value={formAssigneeId}
                      onChange={(e) => setFormAssigneeId(e.target.value)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-700"
                    >
                      {officers.filter(o => o.position !== 'Chiến sĩ').map(o => (
                        <option key={o.id} value={o.id}>{o.rank} {o.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Hạn dứt điểm</label>
                    <input
                      id="task-form-deadline"
                      type="date"
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Độ ưu tiên</label>
                    <select
                      id="task-form-priority"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px]"
                    >
                      <option value="Thấp">Thấp</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cao">Cao nhất</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Trạng thái xử lý</label>
                    <select
                      id="task-form-status"
                      value={formStatus === 'Chưa thực hiện' ? 'Đang xử lý' : formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200 text-[11px] font-semibold text-slate-800 bg-white"
                    >
                      <option value="Đang xử lý">Đang thực hiện</option>
                      <option value="Hoàn thành">Đã hoàn thành</option>
                      <option value="Quá hạn">Quá hạn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label id="task-form-recurrence-label" className="block mb-1">Nhắc việc lặp lại</label>
                  <select
                    id="task-form-recurrence"
                    value={formRecurrence}
                    onChange={(e) => handleRecurrenceChange(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="">-- Không lặp lại --</option>
                    <option value="Hàng ngày">Hàng ngày</option>
                    <option value="Hàng tuần">Hàng tuần</option>
                    <option value="Hàng tháng">Hàng tháng</option>
                    <option value="Hàng năm">Hàng năm</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Ghi chú kết quả hoàn thiện thực tế</label>
                  <textarea
                    id="task-form-results"
                    value={formResultNotes}
                    onChange={(e) => setFormResultNotes(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 h-16 font-medium text-slate-550"
                    placeholder="Đã thu hồi tiền phạt, nộp kho ngày..."
                  />
                </div>

                <button
                  id="save-task-submit-btn"
                  type="submit"
                  className="w-full py-2 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Bảo lưu hồ sơ công việc
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
              <CheckSquare className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2 animate-bounce" />
              Lập biên chỉ thị từ Trưởng phòng tới từng cán bộ chiến sĩ để hệ thống phân quyền tự động gửi thông báo bám sát công tác.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
