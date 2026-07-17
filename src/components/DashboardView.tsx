import { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { formatDateDMY } from '../lib/dateUtils';
import { Officer } from '../types';
import { 
  Users, Building2, CalendarDays, Flame, ShieldAlert, 
  FileText, BookOpen, AlertCircle, CheckCircle2, Clock, Phone 
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

interface DashboardViewProps {
  store: PCCCStoreType;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ store, setActiveTab }: DashboardViewProps) {
  const { 
    officers, schedules, facilities, inspections, 
    equipment, plans, incomingDocs, outgoingDocs, 
    materials, tasks 
  } = store;

  const [dutySearchQuery, setDutySearchQuery] = useState('');

  const todayStr = (() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const getDayOfWeekVN = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[day] || '';
  };

  const getPersonnelDetails = (officerIds: string[]) => {
    const list = officerIds.map(id => officers.find(o => o.id === id)).filter(Boolean) as Officer[];
    const cadres = list.filter(o => o.position && !o.position.toLowerCase().includes('chiến sĩ'));
    const soldiers = list.filter(o => o.position && o.position.toLowerCase().includes('chiến sĩ'));
    return { cadres, soldiers };
  };

  const filteredSchedulesForStats = schedules.filter(s => {
    // Only display 1 current day
    if (s.date !== todayStr) return false;

    const commanderName = officers.find(o => o.id === s.commanderId)?.fullName || '';
    const { cadres, soldiers } = getPersonnelDetails(s.officerIds);
    const cadreNames = cadres.map(c => c.fullName).join(' ');
    const soldierNames = soldiers.map(sol => sol.fullName).join(' ');
    const vehiclesList = s.vehicles.join(' ');
    
    const query = dutySearchQuery.toLowerCase();
    const matchesSearch = 
      s.date.includes(query) ||
      s.shift.toLowerCase().includes(query) ||
      commanderName.toLowerCase().includes(query) ||
      cadreNames.toLowerCase().includes(query) ||
      soldierNames.toLowerCase().includes(query) ||
      vehiclesList.toLowerCase().includes(query);
      
    return matchesSearch;
  });

  const sortedSchedulesForStats = [...filteredSchedulesForStats].sort((a, b) => b.date.localeCompare(a.date));

  // Calculate stats (bao gồm chỉ huy, cán bộ và chiến sĩ)
  const totalOfficers = officers.length;
  const totalFacilities = facilities.length;
  const totalDutySchedules = schedules.length;
  const totalInspections = inspections.length; // Công tác phòng cháy (kiểm tra)
  const totalPlansAndEquipment = plans.length + equipment.filter(e => e.category === 'Phương tiện chữa cháy').length; // Công tác chữa cháy/CNCH
  const totalDocs = incomingDocs.length + outgoingDocs.length;
  const totalMaterials = materials.length;

  const activeTasks = tasks.filter(t => t.status !== 'Hoàn thành');
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Hoàn thành') return false;
    const deadlineDate = new Date(t.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today || t.status === 'Quá hạn';
  });

  const dueSoonTasks = tasks.filter(t => {
    if (t.status === 'Hoàn thành' || t.status === 'Quá hạn') return false;
    const deadlineDate = new Date(t.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  // Danger distribution in facilities for a bar chart
  const dangerLevels = facilities.reduce((acc, f) => {
    acc[f.dangerLevel] = (acc[f.dangerLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const facilityDangerChartData = [
    { name: 'Nhóm I', value: dangerLevels['Nhóm I'] || 0, color: '#ef4444' },
    { name: 'Nhóm II', value: dangerLevels['Nhóm II'] || 0, color: '#3b82f6' },
  ];

  const statCards = [
    {
      id: 'stat-officers',
      title: 'Cán bộ, Chiến sĩ',
      value: totalOfficers,
      subtitle: `${officers.filter(o => o.status === 'Đang công tác').length} đang trực chiến`,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      tab: 'officers'
    },
    {
      id: 'stat-facilities',
      title: 'Cơ sở quản lý',
      value: totalFacilities,
      subtitle: `${facilities.filter(f => f.dangerLevel === 'Nhóm I').length} Nhóm I, ${facilities.filter(f => f.dangerLevel === 'Nhóm II').length} Nhóm II`,
      icon: Building2,
      color: 'from-red-600 to-rose-600',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-600',
      tab: 'fire-protection'
    },
    {
      id: 'stat-duty',
      title: 'Lịch trực tháng này',
      value: totalDutySchedules,
      subtitle: 'Trực chỉ huy 24/24',
      icon: CalendarDays,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      tab: 'duty-schedule'
    },
    {
      id: 'stat-inspections',
      title: 'Công tác Phòng cháy',
      value: totalInspections,
      subtitle: `${inspections.filter(i => i.result === 'Không đạt yêu cầu').length} biên bản lỗi nghiêm trọng`,
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      tab: 'fire-protection'
    },
    {
      id: 'stat-rescue',
      title: 'Chữa cháy & CNCH',
      value: totalPlansAndEquipment,
      subtitle: `${plans.length} phương án PCCC hoạt động`,
      icon: ShieldAlert,
      color: 'from-teal-500 to-emerald-600',
      bgColor: 'bg-teal-500/10',
      textColor: 'text-teal-600',
      tab: 'fire-rescue'
    },
    {
      id: 'stat-vancông',
      title: 'Văn thư đến & đi',
      value: totalDocs,
      subtitle: `${incomingDocs.filter(d => d.status === 'Đang xử lý').length} văn bản đến cần xử lý`,
      icon: FileText,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600',
      tab: 'documents'
    },
    {
      id: 'stat-materials',
      title: 'Tài liệu Nghiệp vụ',
      value: totalMaterials,
      subtitle: 'Toàn bộ quy chuẩn & nghị định',
      icon: BookOpen,
      color: 'from-cyan-500 to-sky-600',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-600',
      tab: 'materials'
    }
  ];

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Header section with User role highlight */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-4" id="dashboard-header">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            TRANG CHỦ
          </h2>
          <p className="text-slate-550 text-xs mt-1">
            Hệ thống giám sát nghiệp vụ và quản lý trạng thái sẵn sàng chiến đấu PCCC & CNCH - Cập nhật 2026
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-center" id="current-user-badge">
          <div className="text-right">
            <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest">Phiên đăng nhập</span>
            <span className="text-sm font-semibold text-slate-700">{store.currentUser?.fullName}</span>
          </div>
          <div className="px-3 py-1.5 bg-red-50 text-red-650 text-xs font-bold rounded-md uppercase tracking-wide border border-red-100">
            {store.currentUser?.role === 'CommandingOfficer' ? 'Chỉ huy đơn vị' : 'Cán bộ'}
          </div>
        </div>
      </div>

      {/* Grid statistics 7 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {statCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div 
              key={card.id}
              id={card.id}
              onClick={() => setActiveTab(card.tab)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-red-600 transition-all duration-200 cursor-pointer shadow-sm group hover:shadow-md relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold block group-hover:text-red-600 transition-colors">
                    {card.title}
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-slate-800 font-mono tracking-tight block">
                    {card.value}
                  </span>
                </div>
                <div className={`p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-red-50 group-hover:text-red-650 transition-colors`}>
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-slate-400 text-[11px] mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>{card.subtitle}</span>
                <span className="text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Xem &rarr;</span>
              </div>
            </div>
          );
        })}

        {/* Dynamic Widget For Alerts (Overdue/Due Tasks) using Clean Utility / Minimal style */}
        <div 
          id="stat-critical-tasks"
          onClick={() => setActiveTab('tasks')}
          className="bg-red-50 border border-red-200 p-5 rounded-xl text-slate-900 shadow-sm cursor-pointer hover:bg-red-100/50 transition-colors duration-200 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-red-700 text-xs tracking-wider uppercase font-bold block">
                Cảnh Báo Công Việc
              </span>
              <span className="text-2xl md:text-3xl font-extrabold text-red-700 font-mono tracking-tight block">
                {overdueTasks.length + dueSoonTasks.length}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-red-100 text-red-600">
              <AlertCircle className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-slate-600 text-[11px] mt-4 pt-3 border-t border-red-200/50 space-y-1">
            <div className="flex justify-between">
              <span>Đã quá hạn xử lý:</span>
              <span className="font-bold text-red-700">{overdueTasks.length} việc</span>
            </div>
            <div className="flex justify-between">
              <span>Sắp đến hạn (≤ 3 ngày):</span>
              <span className="font-bold text-amber-700">{dueSoonTasks.length} việc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Duty Stats Table Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4" id="daily-duty-stats-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5.5 h-5.5 text-red-600" />
              <h3 className="font-extrabold text-base text-slate-800 uppercase tracking-wider bg-clip-text">
                Bảng Thống Kê Phân Công Lực Lượng Trực Chiến Ngày Hiện Tại ({formatDateDMY(todayStr)})
              </h3>
            </div>
            <p className="text-slate-550 text-xs mt-0.5 animate-pulse">
              Chi tiết lực lượng chỉ huy, cán bộ, chiến sĩ và phương tiện trực chiến của ngày hôm nay
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl" id="duty-stats-table-wrapper">
          <table className="min-w-full divide-y divide-slate-150 text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-32">Ngày & Ca Trực</th>
                <th className="px-4 py-3.5">Trực Chỉ Huy (01)</th>
                <th className="px-4 py-3.5">Cán Bộ Trực</th>
                <th className="px-4 py-3.5">Chiến Sĩ Trực</th>
                <th className="px-4 py-3.5">Phương Tiện Trực Chiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedSchedulesForStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                    Không tìm thấy lịch trực nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                sortedSchedulesForStats.map((s) => {
                  const dayName = getDayOfWeekVN(s.date);
                  const commander = officers.find(o => o.id === s.commanderId);
                  const { cadres, soldiers } = getPersonnelDetails(s.officerIds);
                  
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Date & Shift */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-extrabold text-slate-800 font-mono text-sm">
                          {formatDateDMY(s.date)}
                        </div>
                        <div className="text-[10px] text-red-650 font-bold mt-0.5">
                          {dayName}
                        </div>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-extrabold bg-indigo-50 text-indigo-650 rounded-md uppercase tracking-wide">
                          {s.shift}
                        </span>
                      </td>

                      {/* Commander */}
                      <td className="px-4 py-3.5 align-top">
                        {commander ? (
                          <div className="space-y-1.5">
                            <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                              {commander.rank}
                            </span>
                            <div className="font-extrabold text-slate-800 text-xs">
                              {commander.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Chức vụ: {commander.position}
                            </div>
                            {commander.phone && (
                              <div className="flex items-center gap-1 mt-1 text-[10.5px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-max">
                                <Phone className="w-3 h-3 text-red-650 shrink-0" />
                                <span>{commander.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>

                      {/* Cadres (Cán bộ) */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="space-y-2">
                          <div className="text-slate-400 font-bold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            SỐ LƯỢNG: {cadres.length} CÁN BỘ
                          </div>
                          {cadres.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {cadres.map(c => (
                                <span 
                                  key={c.id} 
                                  title={`${c.position} - Đơn vị: ${c.unit}${c.phone ? ` - SĐT: ${c.phone}` : ''}`}
                                  className="inline-flex flex-col bg-slate-50 border border-slate-150 px-2 py-1 rounded-md text-[10px]"
                                >
                                  <span className="font-semibold text-slate-800">{c.fullName}</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{c.rank} - {c.position}</span>
                                  {c.phone && (
                                    <span className="text-[9px] text-indigo-650 font-mono mt-0.5 flex items-center gap-0.5 animate-fade-in">
                                      <Phone className="w-2.5 h-2.5 text-indigo-650 shrink-0" />
                                      {c.phone}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] block">Không có cán bộ trong ca trực</span>
                          )}
                        </div>
                      </td>

                      {/* Soldiers (Chiến sĩ) */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="space-y-2">
                          <div className="text-slate-400 font-bold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            SỐ LƯỢNG: {soldiers.length} CHIẾN SĨ
                          </div>
                          {soldiers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {soldiers.map(sol => (
                                <span 
                                  key={sol.id} 
                                  title={`${sol.position} - Đơn vị: ${sol.unit}${sol.phone ? ` - SĐT: ${sol.phone}` : ''}`}
                                  className="inline-flex flex-col bg-slate-50 border border-slate-150 px-2 py-1 rounded-md text-[10px]"
                                >
                                  <span className="font-semibold text-slate-800">{sol.fullName}</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{sol.rank} - {sol.position}</span>
                                  {sol.phone && (
                                    <span className="text-[9px] text-indigo-650 font-mono mt-0.5 flex items-center gap-0.5 animate-fade-in">
                                      <Phone className="w-2.5 h-2.5 text-indigo-650 shrink-0" />
                                      {sol.phone}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] block">Không có chiến sĩ trong ca trực</span>
                          )}
                        </div>
                      </td>

                      {/* Vehicles (Phương tiện) */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="space-y-2">
                          <div className="text-slate-400 font-bold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            SỐ LƯỢNG: {s.vehicles.length} XE
                          </div>
                          {s.vehicles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {s.vehicles.map((v, i) => (
                                <span 
                                  key={i} 
                                  className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px] block">Không điều động phương tiện</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Aggregate Info Summary section */}
        {sortedSchedulesForStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center" id="duty-stats-overall-summary">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TỔNG LỰC LƯỢNG</div>
              <div className="text-xl font-extrabold text-red-600 font-mono mt-0.5">
                {sortedSchedulesForStats.reduce((sum, s) => {
                  const commanderExists = s.commanderId && officers.some(o => o.id === s.commanderId);
                  const { cadres, soldiers } = getPersonnelDetails(s.officerIds);
                  return sum + (commanderExists ? 1 : 0) + cadres.length + soldiers.length;
                }, 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CHỈ HUY</div>
              <div className="text-xl font-extrabold text-red-600 font-mono mt-0.5">
                {sortedSchedulesForStats.filter(s => s.commanderId && officers.some(o => o.id === s.commanderId)).length}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CÁN BỘ & CHIẾN SĨ</div>
              <div className="text-xl font-extrabold text-red-600 font-mono mt-0.5">
                {sortedSchedulesForStats.reduce((sum, s) => {
                  const { cadres, soldiers } = getPersonnelDetails(s.officerIds);
                  return sum + cadres.length + soldiers.length;
                }, 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PHƯƠNG TIỆN</div>
              <div className="text-xl font-extrabold text-red-600 font-mono mt-0.5">
                {sortedSchedulesForStats.reduce((sum, s) => sum + s.vehicles.length, 0)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Charts area was removed as requested */}

      {/* Task and Schedule Activity feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-activities">
        {/* Task Board Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="recent-tasks-card">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                Nhiệm vụ trọng điểm hiện hành ({activeTasks.length})
              </h3>
            </div>
            <button 
              id="dash-view-all-tasks"
              onClick={() => setActiveTab('tasks')} 
              className="text-xs text-red-600 font-bold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1" id="dash-tasks-list">
            {activeTasks.slice(0, 4).map((task) => {
              const assignedOfficer = officers.find(o => o.id === task.assigneeId);
              const dDead = new Date(task.deadline);
              dDead.setHours(0, 0, 0, 0);
              const dToday = new Date();
              dToday.setHours(0, 0, 0, 0);
              const isOverdue = dDead < dToday || task.status === 'Quá hạn';
              return (
                <div key={task.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-700 text-xs hover:text-red-600 transition-colors block">
                      {task.title}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase whitespace-nowrap ${
                      task.priority === 'Cao' 
                        ? 'bg-red-100 text-red-600' 
                        : task.priority === 'Trung bình'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1 mt-1">{task.content}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-200">
                    <span className="font-medium text-slate-500">
                      Phụ trách: {assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa phân công'}
                    </span>
                    <span className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                      <Clock className="w-3 h-3" />
                      Hạn: {task.deadline} {isOverdue ? '(Quá hạn)' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Duty Schedule feeds */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="recent-duty-card">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                Lịch trực chiến đấu trong tuần
              </h3>
            </div>
            <button 
              id="dash-view-all-duty"
              onClick={() => setActiveTab('duty-schedule')} 
              className="text-xs text-red-650 font-bold hover:underline"
            >
              Xem lịch đầy đủ
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1" id="dash-duty-list">
            {schedules.slice(0, 4).map((sched) => {
              const commander = officers.find(o => o.id === sched.commanderId);
              const onDutyOfficers = sched.officerIds.map(id => officers.find(o => o.id === id)).filter(Boolean);
              const cadresOnDuty = onDutyOfficers.filter(o => o.position && !o.position.toLowerCase().includes('chiến sĩ'));
              const soldiersOnDuty = onDutyOfficers.filter(o => o.position && o.position.toLowerCase().includes('chiến sĩ'));
              
              const cadresNames = cadresOnDuty.map(o => `${o.rank} ${o.fullName}`).join(', ');
              const soldiersNames = soldiersOnDuty.map(o => `${o.rank} ${o.fullName}`).join(', ');

              return (
                <div key={sched.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-700 text-xs">
                      Ca trực {sched.shift}
                    </span>
                    <span className="text-indigo-600 font-mono text-[11px] font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      {formatDateDMY(sched.date)}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-[11px] space-y-1 text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-600">Chỉ huy trực:</span> {commander ? `${commander.rank} ${commander.fullName}` : 'Chưa có'}
                    </div>
                    <div className="line-clamp-1">
                      <span className="font-semibold text-slate-600">Danh sách cán bộ trực:</span> {cadresNames || 'Chưa phân công'}
                    </div>
                    <div className="line-clamp-1">
                      <span className="font-semibold text-slate-600">Danh sách chiến sĩ trực:</span> {soldiersNames || 'Chưa phân công'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
