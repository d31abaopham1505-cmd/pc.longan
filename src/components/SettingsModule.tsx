import { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { 
  Settings, RefreshCw, Eye, BookOpen, Lock, Terminal, 
  Database, Flame, ShieldAlert, Award, Compass, Sparkles, HelpCircle 
} from 'lucide-react';

interface SettingsProps {
  store: PCCCStoreType;
}

export default function SettingsModule({ store }: SettingsProps) {
  const { resetAllData, currentUser, setOfficers, setFacilities } = store;
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    resetAllData();
    setResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings-module">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-650" />
            CẤU HÌNH & TRIỂN KHAI HỆ THỐNG NM 2026
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Thiết lập khóa kết nối, lưu trữ sao lưu dữ liệu cán bộ, và xem hướng dẫn chi tiết triển khai lên nền tảng đám mây Vercel dứt điểm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vercel instructions & guides (Col span 2) */}
        <div className="lg:col-span-2 space-y-6 font-sans">
          
          {/* Vercel guidelines */}
          <div className="bg-white p-6 rounded-xl border border-slate-105 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-650" />
              BIÊN BẢN HƯỚNG DẪN TRIỂN KHAI VERCEL ĐÚNG CHUẨN
            </h3>

            <p className="text-slate-500 text-xs leading-relaxed">
              Ứng dụng quản lý nghiệp vụ PCCC & CNCH năm 2026 được tối ưu hóa tối đa để hoạt động trong môi trường Cloud Container (Cloud Run) và biên dịch tĩnh bám sát biên kịch Vercel một cách liền mạch. Dưới đây là quy trình 3 bước đẩy mã nguồn:
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-red-500/20">1</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Chuẩn hóa cấu hình Đẩy mã (Push Code)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    Khởi tạo kho chứa (Repository) mới trên <strong>GitHub hoặc GitLab</strong>. Tiến hành commit tất cả thư mục nòng cốt nằm trong workspace ngoại trừ <code>node_modules/</code> và tệp <code>dist/</code> đã được khóa tại <code>.gitignore</code>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-red-500/20">2</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Ủy quyền ứng dụng trên Vercel Dashboard</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    Truy cập trang chủ <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com</a>. Chọn nút <strong>Add New Project</strong>, tiến hành liên đới với kho chứa GitHub đã đẩy tại Bước 1.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-red-500/20">3</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Cấu hình tham số môi trường (Environment Variables)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    Tại góc cài đặt dự án Vercel, cài đặt biến <code>GEMINI_API_KEY</code> trùng khớp với key xử lý dữ liệu của quý cơ quan thu thập từ Google AI Studio để kích hoạt toàn diện tính năng kịch bản.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150/60 mt-4 text-[10.5px] text-slate-500 space-y-1">
              <strong className="text-slate-700 block text-xs flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-red-600" /> Cấu hình biên dịch tự động do Vercel phán quyết:
              </strong>
              <div className="grid grid-cols-2 gap-4 font-mono text-slate-600 pt-1.5">
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase">Framework Preset</span>
                  <span>Vite / Next.js Static</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase">Build Command</span>
                  <span>npm run build</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase">Output Directory</span>
                  <span>dist</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase">Install Command</span>
                  <span>npm install</span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Setup Info & Rules */}
          <div className="bg-white p-6 rounded-xl border border-slate-105 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              SẤM NGUYÊN BẢN CƠ SỞ DỮ LIỆU CHUẨN POSTGRESQL / SUPABASE
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Phiên bản thử nghiệm tác chiến hiện thời đang được tự động hóa đồng bộ về <strong>LocalStorage</strong> của quý cán bộ để bảo lưu bảo mật tuyệt đối cục bộ. Tuy nhiên, để mở rộng quy mô hợp tác chiến giữa nhiều phường, đề xuất cấu hình liên kết Supabase PostgreSQL theo bảng thiết kế mẫu sau:
            </p>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto space-y-2 select-all">
              <p className="text-slate-400">-- SQL Schema cho bảng Cán bộ Chiến Sĩ 2026</p>
              <pre className="leading-relaxed">
{`CREATE TABLE officers (
  id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  rank VARCHAR(50) NOT NULL,
  position VARCHAR(50) NOT NULL,
  unit VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'Cán bộ phụ trách',
  kpi INT DEFAULT 80,
  phone VARCHAR(20)
);`}
              </pre>
            </div>
          </div>
        </div>

        {/* Side controller (Col span 1) */}
        <div className="space-y-6" id="settings-side-panel">
          
          {/* User profile brief info */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
              ĐẠI DIỆN TRỰC BAN TUYÊN TÚ
            </h3>

            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold">
                  {currentUser?.fullName.charAt(0)}
                </div>
                <div>
                  <strong className="text-slate-800 block text-xs">{currentUser?.fullName}</strong>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{currentUser?.role}</span>
                </div>
              </div>

              <div className="pt-3 border-t text-xs text-slate-550 space-y-1.5 font-semibold">
                <div className="flex justify-between">
                  <span>Mức bậc trực hành chính:</span>
                  <span className="text-slate-800 font-mono">Cấp 1</span>
                </div>
                <div className="flex justify-between">
                  <span>Trực phòng chỉ huy Quận:</span>
                  <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded font-mono">Bán kính 5km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core System Reset section */}
          <div className="bg-white p-5 rounded-xl border border-red-100/60 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-red-650 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> VÙNG CHỈ TRỊ ĐỘC HẠI
            </h3>

            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              Các thiết lập tại đây có thể biến đổi vĩnh viễn dữ liệu ghi dán hồ sơ phòng cháy của đơn vị. Khuyến nghị chỉ thực thi khi tái cấu trúc ca kíp trực.
            </p>

            {resetConfirm ? (
              <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <strong className="block text-[11px] text-red-700">Xác nhận khôi phục cài đặt gốc?</strong>
                <p className="text-[10px] text-red-600 leading-normal">
                  Hành động này sẽ dọn sạch toàn bộ cơ sở dữ liệu và ghi đè bằng mẫu mô phỏng danh sách cơ sở, cán bộ ban đầu.
                </p>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    id="cancel-reset-btn"
                    onClick={() => setResetConfirm(false)}
                    className="px-2 py-1 text-[11.5px] hover:bg-white border rounded cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                  <button
                    id="confirm-reset-btn"
                    onClick={handleReset}
                    className="px-2.5 py-1 text-[11.5px] bg-red-650 hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                  >
                    Đồng ý Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="trigger-reset-confirm"
                onClick={() => setResetConfirm(true)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-650 font-extrabold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-red-200"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Khôi phục Dữ liệu Mẫu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
