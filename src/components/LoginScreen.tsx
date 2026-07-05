import React, { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { ShieldAlert, KeyRound, Mail, AlertCircle, UserRound, Building2, Briefcase, Phone, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  store: PCCCStoreType;
}

export default function LoginScreen({ store }: LoginScreenProps) {
  const { loginWithEmail, createRegistrationRequest, isFirebaseOnline, users, registrationRequests } = store;
  
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if they already submitted in this browser
  const [hasSubmittedReg, setHasSubmittedReg] = useState(() => {
    return localStorage.getItem('pccc_has_submitted_registration') === 'true';
  });
  const [submittedEmail, setSubmittedEmail] = useState(() => {
    return localStorage.getItem('pccc_submitted_reg_email') || '';
  });

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form states
  const [regFullName, setRegFullName] = useState('');
  const [regUnit, setRegUnit] = useState('Đội Tân An');
  const [regPosition, setRegPosition] = useState('Cán bộ');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errorInput, setErrorInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorInput('Vui lòng nhập Email tài khoản cán bộ.');
      return;
    }
    if (!password.trim()) {
      setErrorInput('Vui lòng nhập mật khẩu hành chính.');
      return;
    }

    const res = loginWithEmail(email.trim(), password);
    if (res.success) {
      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng sang Dashboard...');
    } else {
      setErrorInput(res.msg);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorInput('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorInput('Vui lòng nhập Số điện thoại liên hệ.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorInput('Vui lòng nhập Email đăng nhập.');
      return;
    }
    if (!regPassword.trim()) {
      setErrorInput('Vui lòng tạo Mật khẩu.');
      return;
    }

    const normalizedEmail = regEmail.trim().toLowerCase();

    // Check duplicate in users active
    const emailExists = users.some(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (emailExists) {
      setErrorInput('Tài khoản email này đã được kích hoạt và hoạt động trên hệ thống.');
      return;
    }

    // Check duplicate in pending list
    const pendingExists = registrationRequests.some(r => r.email.trim().toLowerCase() === normalizedEmail);
    if (pendingExists) {
      setErrorInput('Email này đã gửi yêu cầu đăng ký trước đó và đang chờ quản trị phê duyệt. Hệ thống chỉ cho phép nộp kết quả 01 lần.');
      localStorage.setItem('pccc_has_submitted_registration', 'true');
      localStorage.setItem('pccc_submitted_reg_email', regEmail.trim());
      setHasSubmittedReg(true);
      setSubmittedEmail(regEmail.trim());
      return;
    }

    try {
      await createRegistrationRequest({
        fullName: regFullName.trim(),
        unit: regUnit.trim(),
        position: regPosition.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        password: regPassword
      });

      setSuccessMsg('Gửi yêu cầu đăng ký thành công! Vui lòng chờ phê duyệt từ Ban quản trị hệ thống. Hệ thống chỉ cho phép nộp kết quả 01 lần.');
      
      // Save submission state to localStorage
      localStorage.setItem('pccc_has_submitted_registration', 'true');
      localStorage.setItem('pccc_submitted_reg_email', regEmail.trim());
      setHasSubmittedReg(true);
      setSubmittedEmail(regEmail.trim());

      // Clear forms
      setRegFullName('');
      setRegPhone('');
      setRegEmail('');
      setRegPassword('');

      // Auto switch to login view after some time
      setTimeout(() => {
        setIsRegistering(false);
        setSuccessMsg('');
      }, 5000);
    } catch (err: any) {
      setErrorInput(err.message || 'Lỗi gửi yêu cầu đăng ký.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white" id="login-container">
      {/* Dynamic ambient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.2),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-850 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md relative z-10 animate-fade-in" id="login-card">
        {/* Banner Online mode if active */}
        {isFirebaseOnline ? (
          <div className="bg-emerald-600/20 text-emerald-400 border-b border-emerald-500/20 px-4 py-2.5 text-center text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            🔥 CO-SYNC ONLINE: FIRESTORE ACTIVE
          </div>
        ) : (
          <div className="bg-amber-600/10 text-amber-500 border-b border-amber-500/20 px-4 py-2.5 text-center text-[10.5px] font-semibold tracking-wide flex items-center justify-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            ℹ️ SANDBOX: CHẠY GIẢ LẬP LOCAL (SẴN SÀNG KẾT NỐI VERCEL)
          </div>
        )}

        {/* Card Header (Red accent) */}
        <div className="p-7 text-center bg-gradient-to-r from-red-650 to-red-750 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none select-none">
            <img 
              src="https://upload.wikimedia.org/wikipedia/vi/f/f6/Logo_C%E1%BB%A5c_C%E1%BA%A3nh_s%C3%A1t_Ph%C3%B2ng_ch%C3%A1y_ch%E1%BB%AFa_ch%E1%BB%AFa_v%E1%BB%9Bi_C%E1%BB%A9u_n%E1%BA%A1n_c%E1%BB%A9u_h%E1%BB%99.png" 
              alt="Logo PCCC" 
              className="w-24 h-24 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            Hệ thống Quản lý PCCC & CNCH
          </h1>
          <p className="text-red-100 text-[10px] mt-1.5 font-mono tracking-wider uppercase font-extrabold pb-0.5">
            ĐỘI CHỮA CHÁY VÀ CỨU NẠN, CỨU HỘ KHU VỰC TÂN AN
          </p>
        </div>

        <div className="p-8 space-y-6">
          {errorInput && (
            <div id="login-error-alert" className="p-3 bg-red-900/40 border border-red-500/35 text-red-300 text-xs rounded-lg font-bold flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorInput}</span>
            </div>
          )}

          {successMsg && (
            <div id="login-success-alert" className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4.5">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                  Email Đăng Nhập Hệ Thống
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="Gợi ý: admin@pccc-tanan.gov.vn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorInput('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-pass" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                  Mật Khẩu Hành Chính
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="login-pass"
                    type="password"
                    required
                    placeholder="Nhập mã khẩu đăng nhập..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorInput('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                id="submit-login-btn"
                type="submit"
                className="w-full py-3 bg-red-650 hover:bg-red-700 text-white font-black rounded-lg text-xs tracking-wider uppercase transition-all focus:ring-2 focus:ring-red-500/20 active:scale-[0.98] cursor-pointer"
              >
                XÁC THỰC VÀ ĐĂNG NHẬP
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setErrorInput('');
                    setSuccessMsg('');
                  }}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-bold"
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
            </form>
          ) : hasSubmittedReg ? (
            /* Already Submitted Notice screen */
            <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-6 text-center space-y-5 shadow-xl animate-fade-in relative overflow-hidden" id="register-submitted-info">
              {/* Highlight pattern */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-550 to-red-550" />
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/35 text-amber-500 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-amber-400 font-extrabold text-[13px] uppercase tracking-wide">
                  Đã Gửi Thông Tin Chờ Quản Trị Phê Duyệt
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-sm mx-auto">
                  Yêu cầu đăng ký tài khoản của bạn đã được ghi nhận thành công và đang chờ Ban quản trị phê duyệt.
                </p>
                <div className="p-3 bg-amber-950/40 rounded border border-amber-500/20 max-w-xs mx-auto text-amber-300 text-[10.5px] font-bold">
                  ⚠️ Mỗi cán bộ chỉ được phép nộp kết quả thông tin đăng ký 01 lần duy nhất.
                </div>
                {submittedEmail && (
                  <div className="pt-2 text-slate-400 text-[10px] font-mono">
                    Email đăng ký: <span className="text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{submittedEmail}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorInput('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white font-black rounded-lg text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-sm text-center"
                >
                  Quay lại đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bạn có muốn xóa dữ liệu đã đăng ký trên thiết bị này để nhập lại không? (Yêu cầu hiện tại trên hệ thống vẫn sẽ được giữ trong danh sách chờ rà duyệt)')) {
                      localStorage.removeItem('pccc_has_submitted_registration');
                      localStorage.removeItem('pccc_submitted_reg_email');
                      setHasSubmittedReg(false);
                      setSubmittedEmail('');
                    }
                  }}
                  className="w-full py-1.5 text-slate-500 hover:text-slate-350 text-[10.5px] font-bold transition-all underline cursor-pointer"
                >
                  Nhập thông tin đăng ký cán bộ mới
                </button>
              </div>
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4.5">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-fullname" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                  Họ và Tên
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <UserRound className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={regFullName}
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      setErrorInput('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Row: Unit and Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-unit" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                    Đơn vị
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-unit"
                      type="text"
                      required
                      placeholder="Đội Tân An"
                      value={regUnit}
                      onChange={(e) => {
                        setRegUnit(e.target.value);
                        setErrorInput('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-position" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                    Chức vụ
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-position"
                      type="text"
                      required
                      placeholder="Cán bộ"
                      value={regPosition}
                      onChange={(e) => {
                        setRegPosition(e.target.value);
                        setErrorInput('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                  Số Điện Thoại
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-phone"
                    type="text"
                    required
                    placeholder="0912..."
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value);
                      setErrorInput('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                  Email Đăng Nhập Hệ Thống
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="Gợi ý: admin@pccc-tanan.gov.vn"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setErrorInput('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-pass" className="block text-slate-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-2">
                  Tạo Mật Khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-pass"
                    type="password"
                    required
                    placeholder="Nhập mã khẩu đăng nhập..."
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setErrorInput('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-semibold focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                id="submit-register-btn"
                type="submit"
                className="w-full py-3 bg-red-650 hover:bg-red-700 text-white font-black rounded-lg text-xs tracking-wider uppercase transition-all focus:ring-2 focus:ring-red-500/20 active:scale-[0.98] cursor-pointer"
              >
                ĐĂNG KÝ TÀI KHOẢN
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorInput('');
                    setSuccessMsg('');
                  }}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-bold"
                >
                  Đã có tài khoản? Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
