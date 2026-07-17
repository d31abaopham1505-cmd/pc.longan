import React, { useState, useEffect } from 'react';
import { PCCCStoreType } from '../lib/store';
import { 
  Settings, RefreshCw, Eye, BookOpen, Lock, Terminal, 
  Database, Flame, ShieldAlert, Award, Compass, Sparkles, HelpCircle,
  Mail, Send, CheckCircle2, AlertTriangle, Activity, Trash2, ShieldCheck, EyeOff
} from 'lucide-react';

interface SettingsProps {
  store: PCCCStoreType;
}

export default function SettingsModule({ store }: SettingsProps) {
  const { resetAllData, currentUser, setOfficers, setFacilities } = store;
  const [resetConfirm, setResetConfirm] = useState(false);

  // SMTP & Alert configuration states
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpServer, setSmtpServer] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpEncryption, setSmtpEncryption] = useState('TLS');
  const [alertEmails, setAlertEmails] = useState('d31a.baopham1505@gmail.com');
  
  // History logs & status feedback
  const [logs, setLogs] = useState<any[]>([]);
  const [checkStatus, setCheckStatus] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch settings & notification logs on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSmtpUser(data.smtpUser || '');
          setSmtpPass(data.smtpPass || '');
          setSmtpServer(data.smtpServer || 'smtp.gmail.com');
          setSmtpPort(data.smtpPort || 587);
          setSmtpEncryption(data.smtpEncryption || 'TLS');
          if (Array.isArray(data.alertEmails)) {
            setAlertEmails(data.alertEmails.join(', '));
          }
        }
      })
      .catch(err => console.warn('API settings are not active yet:', err));

    fetch('/api/email-notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
      })
      .catch(err => console.warn('API logs are not active yet:', err));
  }, []);

  const handleReset = () => {
    resetAllData();
    setResetConfirm(false);
    window.location.reload();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const emailsArray = alertEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser,
          smtpPass,
          smtpServer,
          smtpPort: Number(smtpPort),
          smtpEncryption,
          alertEmails: emailsArray
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Cập nhật cấu hình SMTP Gmail và danh sách email nhận cảnh báo thành công!');
      } else {
        alert('Lỗi khi cập nhật cấu hình.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ để lưu cấu hình.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerCheck = async () => {
    setIsChecking(true);
    setCheckStatus('Đang khởi động tiến trình rà soát hạn dứt điểm & kết nối máy chủ SMTP...');
    try {
      const res = await fetch('/api/trigger-check', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCheckStatus(data.results);
        
        // Refresh logs immediately
        const logsRes = await fetch('/api/email-notifications');
        const logsData = await logsRes.json();
        if (Array.isArray(logsData)) {
          setLogs(logsData);
        }
      } else {
        setCheckStatus({ error: data.error || 'Lỗi kiểm tra hệ thống' });
      }
    } catch (err: any) {
      setCheckStatus({ error: err.message || 'Lỗi kết nối máy chủ' });
    } finally {
      setIsChecking(false);
    }
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
            Thiết lập cấu hình gửi email cảnh báo tự động, SMTP Gmail, rà soát hạn xử lý công việc và quản lý sao lưu dữ liệu nghiệp vụ PCCC & CNCH.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left block: Config and details (Col span 2) */}
        <div className="lg:col-span-2 space-y-6 font-sans">
          
          {/* Email Settings and SMTP Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-105 shadow-xs space-y-5" id="settings-email-smtp-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-650" />
                CẤU HÌNH GỬI EMAIL THÔNG BÁO TỰ ĐỘNG & SMTP GMAIL
              </h3>
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">SMTP TLS</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-lg space-y-2 text-slate-600 leading-relaxed font-semibold">
                <strong className="text-slate-800 text-xs flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-600" /> Điều kiện rà soát và gửi thông báo:
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                  <li><strong>Còn 3 ngày đến hạn:</strong> Hệ thống tự động nhắc việc gửi cảnh báo sắp đến hạn.</li>
                  <li><strong>Đúng ngày hết hạn:</strong> Hệ thống cảnh báo "Công việc đến hạn hôm nay".</li>
                  <li><strong>Đã quá hạn xử lý:</strong> Hệ thống cảnh báo "Công việc đã quá hạn xử lý".</li>
                  <li className="text-red-700"><strong>Nguyên tắc:</strong> Chỉ gửi <strong>01 lần duy nhất</strong> cho mỗi mốc để tránh spam hòm thư cán bộ.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Máy chủ SMTP (SMTP Server)</label>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cổng kết nối (SMTP Port)</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tài khoản SMTP (Email Gmail gửi)</label>
                  <input
                    type="email"
                    placeholder="ví dụ: coquan.pccc@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 font-semibold font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tài khoản email Gmail của quý cơ quan.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mật khẩu ứng dụng Gmail (App Password)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập 16 ký tự mật khẩu ứng dụng"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 font-semibold font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Sử dụng mật khẩu ứng dụng 16 chữ số tạo trong Google Account (2-Step Verification).</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Nhận Cảnh Báo (Cấu hình nhiều địa chỉ nhận)</label>
                <textarea
                  rows={2}
                  placeholder="d31a.baopham1505@gmail.com, canbo.trucban@pccc-tanan.gov.vn"
                  value={alertEmails}
                  onChange={(e) => setAlertEmails(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 font-semibold font-mono text-[11px]"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ nhiều địa chỉ email nhận ngăn cách nhau bởi dấu phẩy (,).</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleTriggerCheck}
                  disabled={isChecking}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-bold rounded-lg text-slate-700 cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Đang chạy rà soát...' : 'Chạy Rà Soát & Gửi Thử Ngay'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Email'}
                </button>
              </div>
            </form>

            {/* Run check status logs block */}
            {checkStatus && (
              <div className="p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px] max-h-[250px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-red-400"># KẾT QUẢ RÀ SOÁT TỰ ĐỘNG THỦ CÔNG</span>
                  <button onClick={() => setCheckStatus(null)} className="text-slate-400 hover:text-white">Đóng</button>
                </div>
                {typeof checkStatus === 'string' ? (
                  <p className="text-slate-400">{checkStatus}</p>
                ) : checkStatus.error ? (
                  <p className="text-red-400 font-bold">LỖI: {checkStatus.error}</p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-emerald-400 font-bold">Kích hoạt rà soát thành công!</p>
                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-slate-850 rounded">
                      <div>
                        <span className="block text-[9px] text-slate-400">ĐÃ GỬI (MỚI)</span>
                        <strong className="text-emerald-400 text-sm font-bold">{checkStatus.sent}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400">BỎ QUA (ĐÃ GỬI TRƯỚC)</span>
                        <strong className="text-slate-300 text-sm font-bold">{checkStatus.skipped}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400">BỊ LỖI KẾT NỐI</span>
                        <strong className="text-red-400 text-sm font-bold">{checkStatus.errors}</strong>
                      </div>
                    </div>
                    {checkStatus.logs && checkStatus.logs.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                        <strong className="text-slate-400 text-[10px] block">Nhật ký xử lý:</strong>
                        {checkStatus.logs.map((logStr: string, idx: number) => (
                          <div key={idx} className="truncate text-[10px] text-slate-300" title={logStr}>&gt; {logStr}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email notifications table */}
          <div className="bg-white p-6 rounded-xl border border-slate-105 shadow-xs space-y-4" id="email-notifications-log-card">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                LỊCH SỬ GỬI EMAIL CẢNH BÁO (email_notifications)
              </h3>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                {logs.length} bản ghi
              </span>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              Dưới đây là nhật ký phân hệ gửi thư tự động, theo dõi sát sao tất cả tiến trình công việc, đảm bảo kỷ cương hành chính và kỷ luật tác chiến PCCC & CNCH Quận.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="p-3 font-bold">STT</th>
                    <th className="p-3 font-bold">Mã Công Việc</th>
                    <th className="p-3 font-bold">Loại Nhắc</th>
                    <th className="p-3 font-bold">Địa Chỉ Nhận</th>
                    <th className="p-3 font-bold">Thời Gian Gửi</th>
                    <th className="p-3 font-bold">Trạng Thế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        Chưa có lịch sử gửi email cảnh báo nào được ghi nhận.
                      </td>
                    </tr>
                  ) : (
                    logs.slice().reverse().map((log: any, idx: number) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">{log.task_id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            log.notification_type === '3_DAYS_BEFORE' 
                              ? 'bg-amber-100 text-amber-800' 
                              : log.notification_type === 'DUE_TODAY'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.notification_type === '3_DAYS_BEFORE' 
                              ? 'Sắp hết hạn (3 ngày)' 
                              : log.notification_type === 'DUE_TODAY'
                              ? 'Hôm nay đến hạn'
                              : 'Đã quá hạn'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{log.email}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString('vi-VN') : 'N/A'}
                        </td>
                        <td className="p-3">
                          {log.status === 'success' ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1 font-bold" title={log.error_message}>
                              <AlertTriangle className="w-3.5 h-3.5" /> Lỗi gửi thư
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vercel guidelines */}
          <div className="bg-white p-6 rounded-xl border border-slate-105 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-650" />
              BIÊN BẢN HƯỚNG DẪN TRIỂN KHAI VERCEL ĐÚNG CHUẨN
            </h3>

            <p className="text-slate-500 text-xs leading-relaxed font-normal">
              Ứng dụng quản lý nghiệp vụ PCCC & CNCH năm 2026 được tối ưu hóa tối đa để hoạt động trong môi trường Cloud Container (Cloud Run) và biên dịch tĩnh bám sát biên kịch Vercel một cách liền mạch. Dưới đây là quy trình 3 bước đẩy mã nguồn:
            </p>

            <div className="space-y-4 pt-2 font-semibold">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-red-500/20">1</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Chuẩn hóa cấu hình Đẩy mã (Push Code)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-normal">
                    Khởi tạo kho chứa (Repository) mới trên <strong>GitHub hoặc GitLab</strong>. Tiến hành commit tất cả thư mục nòng cốt nằm trong workspace ngoại trừ <code>node_modules/</code> và tệp <code>dist/</code> đã được khóa tại <code>.gitignore</code>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-red-500/20">2</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Ủy quyền ứng dụng trên Vercel Dashboard</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-normal font-sans">
                    Truy cập trang chủ <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">vercel.com</a>. Chọn nút <strong>Add New Project</strong>, tiến hành liên đới với kho chứa GitHub đã đẩy tại Bước 1.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold leading-none shrink-0 border border-red-500/20">3</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Cấu hình tham số môi trường (Environment Variables)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-normal font-sans">
                    Tại góc cài đặt dự án Vercel, cài đặt biến <code>GEMINI_API_KEY</code>, <code>SMTP_USER</code>, và <code>SMTP_PASS</code> trùng khớp với key xử lý dữ liệu và thông tin xác thực để kích hoạt toàn diện tính năng kịch bản.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150/60 mt-4 text-[10.5px] text-slate-500 space-y-1">
              <strong className="text-slate-700 block text-xs flex items-center gap-1 font-bold">
                <Terminal className="w-3.5 h-3.5 text-red-600" /> Cấu hình biên dịch tự động do Vercel phán quyết:
              </strong>
              <div className="grid grid-cols-2 gap-4 font-mono text-slate-600 pt-1.5">
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase font-bold">Framework Preset</span>
                  <span>Vite / Next.js Static</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase font-bold">Build Command</span>
                  <span>npm run build</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase font-bold">Output Directory</span>
                  <span>dist</span>
                </div>
                <div>
                  <span className="block text-[9px] text-[#94a3b8] uppercase font-bold">Install Command</span>
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

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
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
                <p className="text-[10px] text-red-600 leading-normal font-normal">
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
