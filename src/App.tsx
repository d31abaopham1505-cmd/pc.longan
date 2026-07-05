import { useState } from 'react';
import { usePCCCStore } from './lib/store';
import { UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import OfficerModule from './components/OfficerModule';
import DutyScheduleModule from './components/DutyScheduleModule';
import FireProtectionModule from './components/FireProtectionModule';
import FireRescueModule from './components/FireRescueModule';
import DocumentModule from './components/DocumentModule';
import ReferenceMaterialModule from './components/ReferenceMaterialModule';
import TaskWorkModule from './components/TaskWorkModule';
import ReportModule from './components/ReportModule';
import SettingsModule from './components/SettingsModule';
import UserManagementModule from './components/UserManagementModule';

import { 
  Flame, LayoutDashboard, ShieldAlert, Users, CalendarClock, 
  FileCheck2, BookMarked, ClipboardList, BarChart3, Settings, 
  LogOut, ShieldCheck, Mail, Hamburger, Menu, X, BellDot,
  MapPin, Phone
} from 'lucide-react';

type TabType = 
  | 'dashboard' 
  | 'officers' 
  | 'user-management'
  | 'duty-schedule' 
  | 'fire-protection' 
  | 'fire-rescue' 
  | 'documents' 
  | 'materials' 
  | 'tasks' 
  | 'reports' 
  | 'settings';

export default function App() {
  const store = usePCCCStore();
  const { currentUser, login, logout, tasks, isFirebaseOnline } = store;

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not logged in, trigger safety Login Screen
  if (!currentUser) {
    return <LoginScreen store={store} />;
  }

  // Count overdue tasks for badge notification
  const overdueTasksCount = tasks.filter(t => {
    if (t.status === 'Hoàn thành') return false;
    if (t.status === 'Quá hạn') return true;
    const deadline = new Date(t.deadline);
    const today = new Date();
    return deadline < today;
  }).length;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  interface MenuItem {
    id: TabType;
    label: string;
    icon: any;
    badge?: number;
  }

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard tổng quan', icon: LayoutDashboard },
    { id: 'officers', label: 'Cán bộ chiến sĩ', icon: Users },
    ...(currentUser?.role === 'Admin' ? [{ id: 'user-management' as TabType, label: 'Quản lý tài khoản', icon: ShieldCheck }] : []),
    { id: 'duty-schedule', label: 'Lịch trực chiến', icon: CalendarClock },
    { id: 'fire-protection', label: 'Công tác phòng cháy', icon: FileCheck2 },
    { id: 'fire-rescue', label: 'Công tác chữa cháy và cứu nạn, cứu hộ', icon: ShieldAlert },
    { id: 'documents', label: 'Văn thư - Công văn', icon: Mail },
    { id: 'materials', label: 'Tài liệu & Quy chuẩn', icon: BookMarked },
    { id: 'tasks', label: 'Kiểm soát công việc', icon: ClipboardList, badge: overdueTasksCount > 0 ? overdueTasksCount : undefined },
    { id: 'reports', label: 'Kế hoạch - Báo cáo kết quả công tác', icon: BarChart3 },
    ...(currentUser?.role === 'Admin' ? [{ id: 'settings' as TabType, label: 'Cấu hình hệ thống', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-red-600 selection:text-white" id="app-root-container">
      
      {/* Sidebar - Left section */}
      <aside 
        id="app-navigation-sidebar"
        className={`w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 no-print transition-all duration-300 z-50 fixed md:static inset-y-0 left-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand identity */}
        <div className="py-4 border-b border-slate-800 px-3 flex items-center justify-between bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-[72px] h-[72px] flex items-center justify-center relative overflow-hidden bg-slate-950 rounded-lg p-0.5 border border-slate-800 shadow-inner group/avatar cursor-pointer" title="Nhấp để thay đổi ảnh đại diện">
              <div 
                className="w-full h-full relative"
                onClick={() => document.getElementById('avatar-file-input')?.click()}
              >
                {currentUser?.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/vi/f/f6/Logo_C%E1%BB%A5c_C%E1%BA%A3nh_s%C3%A1t_Ph%C3%B2ng_ch%C3%A1y_ch%E1%BB%AFa_ch%E1%BB%AFa_v%E1%BB%9Bi_C%E1%BB%A9u_n%E1%BA%A1n_c%E1%BB%A9u_h%E1%BB%99.png" 
                    alt="Logo PCCC" 
                    className="w-full h-full object-contain level-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const cb = document.createElement("div");
                        cb.className = "w-full h-full bg-red-650 rounded-md flex items-center justify-center font-extrabold text-[9px] text-white tracking-widest border border-red-500";
                        cb.innerText = "PCCC";
                        parent.appendChild(cb);
                      }
                    }}
                  />
                )}
                {/* Overlay hover đổi ảnh */}
                <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-250 rounded-md">
                  <span className="text-[7px] text-slate-100 font-extrabold uppercase tracking-widest leading-none">Đổi ảnh</span>
                </div>
              </div>
            </div>
            <input 
              type="file" 
              id="avatar-file-input" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = async () => {
                    if (typeof reader.result === 'string') {
                      await store.updateUserAccount({
                        ...currentUser,
                        avatarUrl: reader.result
                      });
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <div className="leading-tight max-w-[160px]">
              <span className="font-extrabold text-[13px] text-white tracking-tight uppercase block whitespace-normal">
                ĐỘI CHỮA CHÁY VÀ CỨU NẠN, CỨU HỘ KHU VỰC TÂN AN
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold block uppercase mt-0.5">
                Phiên bản {new Date().getFullYear()}
              </span>
            </div>
          </div>
          
          <button 
            id="close-sidebar-mobile"
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic menu entries */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-sm" id="sidebar-nav">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 block pt-2 pb-2">
            DANH MỤC
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`sidebar-btn-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all relative group cursor-pointer ${
                  isActive 
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[9.5px] rounded-full font-mono font-bold leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Unit Contact Info Box */}
          <div className="mt-8 pt-4 border-t border-slate-800/65 px-2 space-y-2 select-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block px-1">
              Thông tin đơn vị
            </span>
            <div 
              className="rounded-lg p-3 border border-slate-800/80 space-y-2 text-[10px] leading-relaxed text-slate-100"
              style={{ backgroundColor: '#1148e9' }}
            >
              <p className="font-bold text-slate-200 uppercase tracking-wide text-[9.5px]">
                ĐỘI CHỮA CHÁY VÀ CỨU NẠN, CỨU HỘ KHU VỰC TÂN AN
              </p>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-550 shrink-0 mt-0.5" />
                <span className="text-slate-350">Số 565, Quốc lộ 1, phường Long An, tỉnh Tây Ninh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-550 shrink-0" />
                <span className="font-mono text-slate-350 font-bold tracking-tight">114 – 02723.672.009</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950" id="sidebar-footer">
          <div className="flex items-center gap-3 mb-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.fullName} 
                className="w-8 h-8 rounded object-cover border border-slate-700 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 font-sans">
                {currentUser.fullName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-white truncate leading-tight">{currentUser.fullName}</span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium truncate mt-0.5">{currentUser.role}</span>
            </div>
          </div>
          <button 
            id="logout-btn"
            onClick={logout}
            className="w-full py-2 bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-300 border border-slate-700/50 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất hệ thống
          </button>

          <div className="mt-3 text-center text-[9px] text-slate-500 font-medium tracking-normal select-none">
            Bản quyền thuộc về đồng chí Phạm Quốc Bảo
          </div>
        </div>
      </aside>

      {/* Main viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50" id="app-main-viewport">
        
        {/* Top Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shrink-0 no-print" id="app-header">
          <div className="flex items-center gap-3">
            <button 
              id="open-sidebar-mobile"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-850 uppercase tracking-tight hidden sm:block">
              Hệ thống Quản lý Công tác PCCC & CNCH
            </h1>
            {isFirebaseOnline ? (
              <span className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-750 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Kết nối trực tuyến (Realtime Multi-User)
              </span>
            ) : (
              <span className="hidden md:flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Mô phỏng 2026 (Ngoại tuyến)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {overdueTasksCount > 0 ? (
              <button
                onClick={() => handleTabChange('tasks')}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                title="Nhấp để chuyển đến mục Kiểm soát công việc"
              >
                <BellDot className="w-3.5 h-3.5 text-red-500 animate-ring-shake" />
                <span>{overdueTasksCount} việc quá hạn</span>
              </button>
            ) : (
              <button
                onClick={() => handleTabChange('tasks')}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                title="Nhấp để chuyển đến mục Kiểm soát công việc"
              >
                <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                <span>Kiểm soát công việc</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Mounted Page Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6" id="app-viewport-inner">
          {activeTab === 'dashboard' && <DashboardView store={store} setActiveTab={handleTabChange} />}
          {activeTab === 'officers' && <OfficerModule store={store} />}
          {activeTab === 'user-management' && <UserManagementModule store={store} />}
          {activeTab === 'duty-schedule' && <DutyScheduleModule store={store} />}
          {activeTab === 'fire-protection' && <FireProtectionModule store={store} />}
          {activeTab === 'fire-rescue' && <FireRescueModule store={store} />}
          {activeTab === 'documents' && <DocumentModule store={store} />}
          {activeTab === 'materials' && <ReferenceMaterialModule store={store} />}
          {activeTab === 'tasks' && <TaskWorkModule store={store} />}
          {activeTab === 'reports' && <ReportModule store={store} />}
          {activeTab === 'settings' && currentUser?.role === 'Admin' && <SettingsModule store={store} />}
        </main>
      </div>

    </div>
  );
}
