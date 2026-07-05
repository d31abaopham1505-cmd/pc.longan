import { useState } from 'react';
import { PCCCStoreType } from '../lib/store';
import { DocumentIncoming, DocumentOutgoing } from '../types';
import { jsPDF } from 'jspdf';
import { 
  FileText, Search, Plus, Trash2, Edit2, Download, 
  ArrowDownLeft, ArrowUpRight, Send, CheckCircle2, AlertCircle, X, Users, Paperclip,
  RefreshCw, Eye
} from 'lucide-react';

interface DocumentModuleProps {
  store: PCCCStoreType;
}

export default function DocumentModule({ store }: DocumentModuleProps) {
  const { incomingDocs, setIncomingDocs, outgoingDocs, setOutgoingDocs, officers } = store;

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa văn quản thư lưu trữ công văn...');
      setTimeout(() => {
        localStorage.setItem('pccc_incoming_docs', JSON.stringify(incomingDocs));
        localStorage.setItem('pccc_outgoing_docs', JSON.stringify(outgoingDocs));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ công văn thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  const handleDownloadFile = (fileName: string, title?: string, details?: {
    docNumber?: string;
    date?: string;
    publisher?: string;
    summary?: string;
  }) => {
    if (!fileName) return;

    // Smart lookup if title or details are not passed directly
    let resolvedTitle = title;
    let resolvedDetails = details;

    if (!resolvedTitle || !resolvedDetails) {
      const foundIn = incomingDocs.find(d => d.fileUrl === fileName);
      if (foundIn) {
        resolvedTitle = resolvedTitle || foundIn.summary;
        resolvedDetails = resolvedDetails || {
          docNumber: foundIn.docNumber,
          date: foundIn.arrivalDate,
          publisher: foundIn.publisher,
          summary: foundIn.summary
        };
      } else {
        const foundOut = outgoingDocs.find(d => d.fileUrl === fileName);
        if (foundOut) {
          resolvedTitle = resolvedTitle || foundOut.summary;
          resolvedDetails = resolvedDetails || {
            docNumber: foundOut.docNumber,
            date: foundOut.publishDate,
            publisher: 'Phong Canh sat PCCC & CNCH',
            summary: foundOut.summary
          };
        }
      }
    }

    const docTitle = resolvedTitle || "Tai lieu Cong van PCCC";
    const docNo = resolvedDetails?.docNumber || "CV-2026/PCCC";
    const docDate = resolvedDetails?.date || "13/06/2026";
    const docPub = resolvedDetails?.publisher || "Phong Canh sat PCCC";
    const docSummary = resolvedDetails?.summary || "Noi dung trich yeu nghiep vu";

    // Clean Vietnamese accents so standard Helvetica font can display the PDF correctly
    const cleanStr = (str: string) => {
      if (!str) return '';
      let co = str.toString();
      co = co.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
      co = co.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
      co = co.replace(/ì|í|ị|ỉ|ĩ/g, "i");
      co = co.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
      co = co.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
      co = co.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
      co = co.replace(/đ/g, "d");
      co = co.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
      co = co.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
      co = co.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
      co = co.replace(/Ò|Ó|Ọ|Bả|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
      co = co.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
      co = co.replace(/Ỳ|Ý|Y|Ỷ|Ỹ/g, "Y");
      co = co.replace(/Đ/g, "D");
      // Remove any non-ASCII characters to keep PDF stream 100% compliant
      return co.replace(/[^\x20-\x7E]/g, "");
    };

    const cPub = cleanStr(docPub).toUpperCase();
    const cNo = cleanStr(docNo);
    const cDate = cleanStr(docDate);
    const cTitle = cleanStr(docTitle).toUpperCase();
    const cSummary = cleanStr(docSummary);

    try {
      const doc = new jsPDF();

      // Draw border box
      doc.setDrawColor(200, 200, 200);
      doc.rect(10, 10, 190, 277);

      // National heading on right
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("CONG HOA XA HOI CHU NGHIA VIET NAM", 110, 20);
      doc.setFontSize(7.5);
      doc.text("Doc lap - Tu do - Hanh phuc", 128, 24);
      doc.setLineWidth(0.3);
      doc.line(128, 26, 168, 26);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(7);
      doc.text(`Quan PCCC, ngay ${cDate}`, 122, 31);

      // Publisher info on left
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text(cPub, 15, 20);
      doc.text("SO CANH SAT PCCC & CNCH", 15, 24);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(`So: ${cNo}`, 15, 29);

      doc.setLineWidth(0.5);
      doc.line(15, 36, 195, 36);

      // Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("QUYET DINH / CONG VAN CHI DAO NGHI KIP", 105, 48, { align: "center" });
      doc.setFont("Helvetica", "bolditalic");
      doc.setFontSize(8.5);
      doc.text(`Ve viec: ${cTitle}`, 105, 54, { align: "center" });

      // Greeting
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Kinh gui: Cac phong, ban, don vi lien quan va cac co so truc thuoc dien quan ly.", 18, 68);

      // Body lines
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      
      const bodyY_start = 76;
      doc.text("Can cu Luat Phong chay va chua chay ngay 29 thang 6 nam 2001; Luat sua doi, bo sung mot so dieu cua", 18, bodyY_start);
      doc.text("Luat Phong chay va chua chay ngay 22 thang 11 nam 2013 cua Quoc hoi.", 18, bodyY_start + 5);
      
      doc.text("Xet de nghi cua Truong phong Canh sat phong chay, chua chay va cuu nan, cuu ho ve viec tang", 18, bodyY_start + 13);
      doc.text("cuong cong tac nghiep vu van thu, kiem tra an toan lien tuc, giam thieu thiet hai.", 18, bodyY_start + 18);

      // Summary grey box
      doc.setDrawColor(180, 0, 0);
      doc.setFillColor(252, 248, 248);
      doc.rect(18, bodyY_start + 25, 174, 30, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(180, 0, 0);
      doc.text("TOM TAT NOI DUNG VAN BAN BAO MAT / HO SO:", 22, bodyY_start + 31);
      
      doc.setTextColor(50, 50, 50);
      doc.setFont("Helvetica", "normal");
      doc.text(`* Trich yeu: ${cSummary}`, 22, bodyY_start + 38);
      doc.text(`* Ma so hieu: ${cNo} | Co quan chu tri: ${cPub}`, 22, bodyY_start + 43);
      doc.text(`* Phien ban so hoa luu kho hop phap tren he thong du lieu truc tuyen.`, 22, bodyY_start + 48);

      doc.setTextColor(0, 0, 0);
      // Continued body
      doc.text("Yeu cau cac dong chi bham sat chi dao nghiem tuc, khao sat hien truong chat che,", 18, bodyY_start + 61);
      doc.text("hoan thanh bao cao dinh ky va phoi hop voi cac ban nganh de xu ly bat cap hien tai.", 18, bodyY_start + 66);
      doc.text("Nhan duoc van thu nay, yeu cau cac don vi khan truong trien khai dong bo./.", 18, bodyY_start + 71);

      // Signatures
      const sigY = bodyY_start + 85;
      doc.setFont("Helvetica", "bold");
      doc.text("Noi nhan:", 18, sigY);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("- Nhu tren;", 18, sigY + 5);
      doc.text("- Luu van thu phong;", 18, sigY + 10);
      doc.text("- Cong an quan (b/c);", 18, sigY + 15);

      // Sign on right
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("TM. BAN CHI HUY PCCC", 130, sigY);
      doc.text("TRUONG PHONG", 136, sigY + 5);

      // Stamp circles
      doc.setDrawColor(200, 0, 0);
      doc.setLineWidth(0.6);
      doc.circle(150, sigY + 22, 12);
      doc.setLineWidth(0.2);
      doc.circle(150, sigY + 22, 10.5);

      doc.setFontSize(4.5);
      doc.setTextColor(200, 0, 0);
      doc.text("CONG AN QUAN", 150, sigY + 18, { align: "center" });
      doc.text("DA DUYET", 150, sigY + 22, { align: "center" });
      doc.text("PCCC & CNCH", 150, sigY + 26, { align: "center" });

      // Leader Name
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.text("Nguyen Van Hải", 138, sigY + 40);

      // Save PDF using jsPDF
      let finalFileName = fileName;
      if (!finalFileName.toLowerCase().endsWith('.pdf')) {
        finalFileName += '.pdf';
      }
      doc.save(finalFileName);
    } catch (err) {
      console.error("PDF generation failed, falling back to basic download", err);
      // Basic fallback
      const basicBlob = new Blob(["Simulated PDF: " + cTitle], { type: 'application/pdf' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(basicBlob);
      element.download = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Sub-tabs: 'incoming' or 'outgoing'
  const [docTab, setDocTab] = useState<'incoming' | 'outgoing'>('incoming');

  // Preview document state
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewDocDetails, setPreviewDocDetails] = useState<{
    docNumber?: string;
    date?: string;
    publisher?: string;
    summary?: string;
  } | null>(null);

  // Searches
  const [inSearch, setInSearch] = useState('');
  const [inStatusFilter, setInStatusFilter] = useState<string>('All');
  const [outSearch, setOutSearch] = useState('');
  const [outFromDate, setOutFromDate] = useState('');
  const [outToDate, setOutToDate] = useState('');

  // Form states Incoming
  const [editingIn, setEditingIn] = useState<DocumentIncoming | null>(null);
  const [isAddingIn, setIsAddingIn] = useState(false);

  const [inDocNumber, setInDocNumber] = useState('');
  const [inArrivalDate, setInArrivalDate] = useState('2026-06-13');
  const [inPublisher, setInPublisher] = useState('');
  const [inSummary, setInSummary] = useState('');
  const [inAssigneeId, setInAssigneeId] = useState('');
  const [inDeadline, setInDeadline] = useState('');
  const [inStatus, setInStatus] = useState<'Chưa xử lý' | 'Đang xử lý' | 'Đã hoàn thành' | 'Quá hạn'>('Chưa xử lý');
  const [inFileLoc, setInFileLoc] = useState<string>('CV_DEN_MOCK_2026.pdf');

  // Form states Outgoing
  const [editingOut, setEditingOut] = useState<DocumentOutgoing | null>(null);
  const [isAddingOut, setIsAddingOut] = useState(false);

  const [outDocNumber, setOutDocNumber] = useState('');
  const [outPublishDate, setOutPublishDate] = useState('2026-06-13');
  const [outReceiver, setOutReceiver] = useState('');
  const [outSummary, setOutSummary] = useState('');
  const [outAuthorId, setOutAuthorId] = useState('');
  const [outSigner, setOutSigner] = useState('');
  const [outFileLoc, setOutFileLoc] = useState<string>('CV_DI_MOCK_2026.pdf');

  // Handlers Incoming
  const handleOpenAddIn = () => {
    setEditingIn(null);
    setInDocNumber('');
    setInArrivalDate('2026-06-13');
    setInPublisher('');
    setInSummary('');
    setInAssigneeId(officers[0]?.id || '');
    setInDeadline('');
    setInStatus('Chưa xử lý');
    setInFileLoc('CV_DEN_MOCK_2026.pdf');
    setIsAddingIn(true);
  };

  const handleOpenEditIn = (doc: DocumentIncoming) => {
    setEditingIn(doc);
    setInDocNumber(doc.docNumber);
    setInArrivalDate(doc.arrivalDate);
    setInPublisher(doc.publisher);
    setInSummary(doc.summary);
    setInAssigneeId(doc.assigneeId);
    setInDeadline(doc.deadline || '');
    setInStatus(doc.status);
    setInFileLoc(doc.fileUrl || 'CV_DEN_MOCK_2026.pdf');
    setIsAddingIn(false);
  };

  const handleSaveIncoming = (e: any) => {
    e.preventDefault();
    if (!inDocNumber.trim()) return alert('Vui lòng điền số hiệu văn bản');

    const body: Omit<DocumentIncoming, 'id'> = {
      docNumber: inDocNumber,
      arrivalDate: inArrivalDate,
      publisher: inPublisher,
      summary: inSummary,
      assigneeId: inAssigneeId,
      deadline: inDeadline || undefined,
      status: inStatus,
      fileUrl: inFileLoc,
    };

    if (isAddingIn) {
      setIncomingDocs([...incomingDocs, { id: `DOC_IN_${Date.now()}`, ...body }]);
    } else if (editingIn) {
      setIncomingDocs(incomingDocs.map(d => d.id === editingIn.id ? { ...d, ...body } : d));
    }

    setEditingIn(null);
    setIsAddingIn(false);
  };

  const handleDeleteIncoming = (id: string, num: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa văn văn bản đến số ${num}?`)) {
      setIncomingDocs(incomingDocs.filter(d => d.id !== id));
    }
  };

  // Handlers Outgoing
  const handleOpenAddOut = () => {
    setEditingOut(null);
    setOutDocNumber('');
    setOutPublishDate('2026-06-13');
    setOutReceiver('');
    setOutSummary('');
    setOutAuthorId(officers[0]?.id || '');
    setOutSigner('Nguyễn Văn Hải');
    setOutFileLoc('CV_DI_MOCK_2026.pdf');
    setIsAddingOut(true);
  };

  const handleOpenEditOut = (doc: DocumentOutgoing) => {
    setEditingOut(doc);
    setOutDocNumber(doc.docNumber);
    setOutPublishDate(doc.publishDate);
    setOutReceiver(doc.receiver);
    setOutSummary(doc.summary);
    setOutAuthorId(doc.authorId);
    setOutSigner(doc.signer);
    setOutFileLoc(doc.fileUrl || 'CV_DI_MOCK_2026.pdf');
    setIsAddingOut(false);
  };

  const handleSaveOutgoing = (e: any) => {
    e.preventDefault();
    if (!outDocNumber.trim()) return alert('Vui lòng nhập số văn bản đi');

    const body: Omit<DocumentOutgoing, 'id'> = {
      docNumber: outDocNumber,
      publishDate: outPublishDate,
      receiver: outReceiver,
      summary: outSummary,
      authorId: outAuthorId,
      signer: outSigner,
      fileUrl: outFileLoc,
    };

    if (isAddingOut) {
      setOutgoingDocs([...outgoingDocs, { id: `DOC_OUT_${Date.now()}`, ...body }]);
    } else if (editingOut) {
      setOutgoingDocs(outgoingDocs.map(d => d.id === editingOut.id ? { ...d, ...body } : d));
    }

    setEditingOut(null);
    setIsAddingOut(false);
  };

  const handleDeleteOutgoing = (id: string, num: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa văn văn bản đi số ${num}?`)) {
      setOutgoingDocs(outgoingDocs.filter(d => d.id !== id));
    }
  };

  // Filtering
  const filteredIncoming = incomingDocs.filter(d => {
    if (inStatusFilter !== 'All' && d.status !== inStatusFilter) {
      return false;
    }
    const matchedAssignee = officers.find(o => o.id === d.assigneeId);
    return d.docNumber.toLowerCase().includes(inSearch.toLowerCase()) || 
           d.summary.toLowerCase().includes(inSearch.toLowerCase()) ||
           d.publisher.toLowerCase().includes(inSearch.toLowerCase()) ||
           (matchedAssignee?.fullName || '').toLowerCase().includes(inSearch.toLowerCase());
  }).sort((a,b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());

  const filteredOutgoing = outgoingDocs.filter(d => {
    let matchesDate = true;
    if (outFromDate) {
      matchesDate = matchesDate && d.publishDate >= outFromDate;
    }
    if (outToDate) {
      matchesDate = matchesDate && d.publishDate <= outToDate;
    }
    if (!matchesDate) return false;

    const matchedAuthor = officers.find(o => o.id === d.authorId);
    return d.docNumber.toLowerCase().includes(outSearch.toLowerCase()) || 
           d.summary.toLowerCase().includes(outSearch.toLowerCase()) ||
           d.receiver.toLowerCase().includes(outSearch.toLowerCase()) ||
           (matchedAuthor?.fullName || '').toLowerCase().includes(outSearch.toLowerCase());
  }).sort((a,b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const exportIncomingDocsToExcel = () => {
    const headers = [
      "Số văn bản đến",
      "Ngày đến",
      "Cơ quan ban hành",
      "Trích yếu nội dung",
      "Người xử lý",
      "Hạn xử lý",
      "Trạng thái xử lý"
    ];

    const rows = filteredIncoming.map(d => {
      const assignedOfficer = officers.find(o => o.id === d.assigneeId);
      const assigneeName = assignedOfficer ? assignedOfficer.fullName : '--';
      return [
        `"${d.docNumber.replace(/"/g, '""')}"`,
        `"${d.arrivalDate}"`,
        `"${d.publisher.replace(/"/g, '""')}"`,
        `"${d.summary.replace(/"/g, '""')}"`,
        `"${assigneeName.replace(/"/g, '""')}"`,
        `"${d.deadline || '--'}"`,
        `"${d.status}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_cong_van_den_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOutgoingDocsToExcel = () => {
    const headers = [
      "Số văn bản đi",
      "Ngày phát hành",
      "Nơi nhận văn bản",
      "Trích yếu nội dung",
      "Người ký duyệt",
      "Phân nhóm"
    ];

    const rows = filteredOutgoing.map(d => {
      const authorOfficer = officers.find(o => o.id === d.authorId);
      const authorName = authorOfficer ? authorOfficer.fullName : '--';
      return [
        `"${d.docNumber.replace(/"/g, '""')}"`,
        `"${d.publishDate}"`,
        `"${d.receiver.replace(/"/g, '""')}"`,
        `"${d.summary.replace(/"/g, '""')}"`,
        `"${authorName.replace(/"/g, '""')}"`,
        `"${d.category || 'Văn bản khác'}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_cong_van_di_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="documents-module">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-650" />
            VĂN THƯ - LƯU TRỮ CÔNG VĂN
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Quản ý, phân quyền xử lý các quyết định xử phạt, chỉ huy chống cháy và báo cáo đệ trình UBND Quận năm 2026.
          </p>
          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>

        {/* Tab switch incoming/outgoing & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
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

          <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              id="doc-tab-incoming"
              onClick={() => setDocTab('incoming')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${docTab === 'incoming' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500" /> Văn bản Đến
            </button>
            <button
              id="doc-tab-outgoing"
              onClick={() => setDocTab('outgoing')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${docTab === 'outgoing' ? 'bg-white text-red-650 shadow-xs' : 'text-slate-500'}`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> Văn bản Đi
            </button>
          </div>
        </div>
      </div>

      {docTab === 'incoming' ? (
        /* Incoming document display page */
        <div className="space-y-4" id="incoming-docs-panel">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between no-print">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="incoming-search-input"
                  type="text"
                  placeholder="Tìm số hiệu, trích yếu, người xử lý, cơ quan ban hành..."
                  value={inSearch}
                  onChange={(e) => setInSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  id="incoming-status-filter"
                  value={inStatusFilter}
                  onChange={(e) => setInStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="All">--- Trạng thái xử lý ---</option>
                  <option value="Chưa xử lý">Chưa xử lý</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                  <option value="Quá hạn">Quá hạn</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
              <button
                id="export-incoming-excel-btn"
                onClick={exportIncomingDocsToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Xuất file Excel
              </button>
              <button
                id="add-incoming-doc-btn"
                onClick={handleOpenAddIn}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-colors shadow-xs text-center"
              >
                + Đăng ký Công văn Đến
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel */}
            <div className="lg:col-span-2 space-y-4" id="incoming-list-viewport">
              {filteredIncoming.map(doc => {
                const assignedOfficer = officers.find(o => o.id === doc.assigneeId);
                return (
                  <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-100 space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                            Ký hiệu: {doc.docNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Nhập sổ: {doc.arrivalDate}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-1.5">{doc.summary}</h4>
                      </div>

                      <span className={`px-2.5 py-0.5 text-[10.5px] font-bold rounded uppercase shrink-0 ${
                        doc.status === 'Đã hoàn thành'
                          ? 'bg-emerald-55 bg-emerald-150 text-emerald-600'
                          : doc.status === 'Đang xử lý'
                            ? 'bg-blue-105 bg-blue-100 text-blue-600'
                            : 'bg-red-105 bg-red-100 text-red-600'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-50 font-semibold">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Đơn vị ban hành:</span>
                        <span className="text-slate-800 text-right">{doc.publisher}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Cán bộ xử lý:</span>
                        <span className="text-indigo-650 text-right">
                          {assignedOfficer ? `${assignedOfficer.rank} ${assignedOfficer.fullName}` : 'Chưa chỉ định'}
                        </span>
                      </p>
                      {doc.deadline && (
                        <p className="flex justify-between border-t border-slate-100/50 pt-1.5 mt-1.5">
                          <span className="text-slate-400">Hạn giải quyết:</span>
                          <span className="font-mono text-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {doc.deadline}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-slate-50 no-print text-xs">
                      <span className="text-[10.5px] text-blue-500 flex items-center gap-1 font-mono">
                        📂 {doc.fileUrl}
                        {doc.fileUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewFile(doc.fileUrl);
                              setPreviewTitle(doc.summary);
                              setPreviewDocDetails({
                                docNumber: doc.docNumber,
                                date: doc.arrivalDate,
                                publisher: doc.publisher,
                                summary: doc.summary
                              });
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors inline-flex items-center justify-center cursor-pointer ml-1"
                            title="Xem trước tài liệu PDF đính kèm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <button
                          id={`delete-in-doc-${doc.id}`}
                          onClick={() => handleDeleteIncoming(doc.id, doc.docNumber)}
                          className="text-red-650 hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          id={`edit-in-doc-${doc.id}`}
                          onClick={() => handleOpenEditIn(doc)}
                          className="text-blue-650 font-bold hover:underline cursor-pointer"
                        >
                          Chi tiết & Sửa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredIncoming.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                  Chưa ghi nhận công văn ban ngành chuyển giao tới.
                </div>
              )}
            </div>

            {/* Form side Incoming */}
            <div id="incoming-entry-form">
              {(editingIn || isAddingIn) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                      {isAddingIn ? 'Đăng ký Công văn Đến' : 'Bổ sung Công văn Đến'}
                    </h3>
                    <button id="close-in-form" onClick={() => { setEditingIn(null); setIsAddingIn(false); }} className="text-slate-400">X</button>
                  </div>

                  <form onSubmit={handleSaveIncoming} className="space-y-4 text-xs font-semibold text-slate-600">
                    <div>
                      <label className="block mb-1">Số văn bản / Kí hiệu của cơ quan ban hành *</label>
                      <input
                        id="in-form-number"
                        type="text"
                        required
                        value={inDocNumber}
                        onChange={(e) => setInDocNumber(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-slate-800 font-medium"
                        placeholder="Số 425/UBND-NC hoặc QD/..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Ngày đến nhận văn bản</label>
                        <input
                          id="in-form-arrival"
                          type="date"
                          value={inArrivalDate}
                          onChange={(e) => setInArrivalDate(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Cơ quan ban hành phát lệnh</label>
                        <input
                          id="in-form-publisher"
                          type="text"
                          required
                          value={inPublisher}
                          onChange={(e) => setInPublisher(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                          placeholder="UBND Quận, Công an TP..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Trích yếu nội dung công văn *</label>
                      <textarea
                        id="in-form-summary"
                        required
                        value={inSummary}
                        onChange={(e) => setInSummary(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 h-20 text-xs font-semibold text-slate-800"
                        placeholder="Tuyên truyền an toàn PCCC chung cư trên thành phố..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Cán bộ xử lý</label>
                        <select
                          id="in-form-assignee"
                          value={inAssigneeId}
                          onChange={(e) => setInAssigneeId(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200 text-xs text-slate-700 font-medium"
                        >
                          {officers.map(o => (
                            <option key={o.id} value={o.id}>{o.rank} {o.fullName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Hạn giải quyết (Nếu có)</label>
                        <input
                          id="in-form-deadline"
                          type="date"
                          value={inDeadline}
                          onChange={(e) => setInDeadline(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Trạng thái xử lý công văn</label>
                      <select
                        id="in-form-status"
                        value={inStatus}
                        onChange={(e) => setInStatus(e.target.value as any)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200"
                      >
                        <option value="Chưa xử lý">Chưa tiếp cận</option>
                        <option value="Đang xử lý">Đang phân tích triển khai</option>
                        <option value="Đã hoàn thành">Đã báo cáo Hoàn thành</option>
                        <option value="Quá hạn">Phạt Quá hạn</option>
                      </select>
                    </div>

                     <div>
                      <label className="block mb-1 text-slate-500">Tài liệu đính kèm</label>
                      <div className="flex flex-col gap-2 p-3 bg-slate-50/50 rounded-lg border border-slate-150">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer border border-slate-200 transition-colors text-[11px] font-extrabold shadow-2xs">
                            <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đính kèm tài liệu</span>
                            <input
                              type="file"
                              className="hidden"
                              id="in-form-file-input"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setInFileLoc(e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                          {inFileLoc && (
                            <span className="text-[11px] text-slate-500 truncate max-w-[150px] font-mono font-bold">
                              {inFileLoc}
                            </span>
                          )}
                        </div>

                        {inFileLoc && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewFile(inFileLoc);
                                setPreviewTitle(inSummary || 'Tài liệu Công văn Đến');
                                setPreviewDocDetails({
                                  docNumber: inDocNumber || 'CV/2026/PCCC',
                                  date: inArrivalDate,
                                  publisher: inPublisher || 'UBND Quận / Cơ quan ban hành',
                                  summary: inSummary || 'Chưa có trích yếu'
                                });
                              }}
                              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 transition-all cursor-pointer"
                              title="Xem trực tuyến tài liệu"
                            >
                              <Eye className="w-3 h-3 text-amber-600" />
                              Xem trước
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(inFileLoc)}
                              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-200 transition-all cursor-pointer"
                              title="Tải xuống tệp đính kèm"
                            >
                              <Download className="w-3 h-3" />
                              Tải về
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa tệp đính kèm này?')) {
                                  setInFileLoc('');
                                }
                              }}
                              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded border border-rose-200 transition-all cursor-pointer"
                              title="Xóa tệp đính kèm"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa file
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      id="save-in-submit-btn"
                      type="submit"
                      className="w-full py-2 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Bảo lưu công văn đến
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
                  <ArrowDownLeft className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2" />
                  Ghi sổ và gán cán bộ xử lý các chỉ đạo hỏa tốc của cơ quan cấp trên nhằm theo dõi tiến độ công vụ năm 2026.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Outgoing document display page */
        <div className="space-y-4" id="outgoing-docs-panel">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4 no-print">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* Search component */}
              <div className="relative flex-1 max-w-lg w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="outgoing-search-input"
                  type="text"
                  placeholder="Tìm số hiệu, trích yếu văn bản đi, người soạn, người ký..."
                  value={outSearch}
                  onChange={(e) => setOutSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Date Filters Range */}
              <div className="flex flex-wrap items-center gap-2.5 bg-slate-50/50 p-1.5 px-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Từ ngày:</span>
                  <input
                    id="outgoing-filter-from-date"
                    type="date"
                    value={outFromDate}
                    onChange={(e) => setOutFromDate(e.target.value)}
                    className="p-1 px-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer focus:border-red-400"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Đến ngày:</span>
                  <input
                    id="outgoing-filter-to-date"
                    type="date"
                    value={outToDate}
                    onChange={(e) => setOutToDate(e.target.value)}
                    className="p-1 px-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer focus:border-red-400"
                  />
                </div>
                {(outFromDate || outToDate) && (
                  <button
                    onClick={() => { setOutFromDate(''); setOutToDate(''); }}
                    className="p-1.5 px-2.5 text-red-650 hover:text-red-700 font-bold text-xs cursor-pointer bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa lọc ngày
                  </button>
                )}
              </div>

              {/* Actions group */}
              <div className="flex flex-row gap-2 w-full lg:w-auto shrink-0">
                <button
                  id="export-outgoing-excel-btn"
                  onClick={exportOutgoingDocsToExcel}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  Xuất file Excel
                </button>
                <button
                  id="add-outgoing-doc-btn"
                  onClick={handleOpenAddOut}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-colors shadow-xs text-center"
                >
                  + Đăng ký Công văn Đi
                </button>
              </div>
            </div>

            {/* Outgoing Document Statistics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 bg-slate-50/40 p-3 rounded-xl">
              <div className="text-center p-2.5 rounded-lg bg-white border border-slate-100 shadow-3xs flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tổng công văn đi trong kỳ</span>
                <span className="text-sm sm:text-lg font-black text-blue-650 font-mono leading-none">{filteredOutgoing.length}</span>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white border border-slate-100 shadow-3xs flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Cán bộ tham gia soạn thảo</span>
                <span className="text-sm sm:text-lg font-black text-emerald-600 font-mono leading-none">
                  {new Set(filteredOutgoing.map(d => d.authorId)).size}
                </span>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white border border-slate-100 shadow-3xs flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Đơn vị nhận văn bản</span>
                <span className="text-sm sm:text-lg font-black text-amber-600 font-mono leading-none">
                  {new Set(filteredOutgoing.map(d => d.receiver.trim())).size}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Outgoing */}
            <div className="lg:col-span-2 space-y-4" id="outgoing-list-viewport">
              {filteredOutgoing.map(doc => {
                const authorOfficer = officers.find(o => o.id === doc.authorId);
                return (
                  <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-100 space-y-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                            Ký hiệu đi: {doc.docNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium font-mono">Ban hành: {doc.publishDate}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-1.5">{doc.summary}</h4>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-50 font-semibold">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Đơn vị tiếp nhận quyết định:</span>
                        <span className="text-slate-800 font-bold max-w-[200px] truncate text-right">{doc.receiver}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Cán bộ soạn thảo:</span>
                        <span className="text-slate-700 text-right">
                          {authorOfficer ? `${authorOfficer.rank} ${authorOfficer.fullName}` : 'Chưa nhập'}
                        </span>
                      </p>
                      <p className="flex justify-between border-t border-slate-100/50 pt-1.5 mt-1.5">
                        <span className="text-slate-400">Người ký ban hành:</span>
                        <span className="text-red-650 font-extrabold text-right">{doc.signer}</span>
                      </p>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-slate-50 no-print text-xs">
                      <span className="text-[10.5px] text-blue-500 font-mono flex items-center gap-1">
                        📂 {doc.fileUrl}
                        {doc.fileUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewFile(doc.fileUrl);
                              setPreviewTitle(doc.summary);
                              setPreviewDocDetails({
                                docNumber: doc.docNumber,
                                date: doc.publishDate,
                                publisher: 'Phòng Cảnh sát PCCC & CNCH',
                                summary: doc.summary
                              });
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors inline-flex items-center justify-center cursor-pointer ml-1"
                            title="Xem trước tài liệu PDF đính kèm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <button
                          id={`delete-out-doc-${doc.id}`}
                          onClick={() => handleDeleteOutgoing(doc.id, doc.docNumber)}
                          className="text-red-150 text-red-650 hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          id={`edit-out-doc-${doc.id}`}
                          onClick={() => handleOpenEditOut(doc)}
                          className="text-blue-650 font-bold hover:underline cursor-pointer"
                        >
                          Hiệu chỉnh
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredOutgoing.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                  Chưa ban hành công văn đi nào.
                </div>
              )}
            </div>

            {/* Form side Outgoing */}
            <div id="outgoing-entry-form">
              {(editingOut || isAddingOut) ? (
                <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                      {isAddingOut ? 'Đăng ký Công văn Đi' : 'Sửa Công văn Đi'}
                    </h3>
                    <button id="close-out-form" onClick={() => { setEditingOut(null); setIsAddingOut(false); }} className="text-slate-400">X</button>
                  </div>

                  <form onSubmit={handleSaveOutgoing} className="space-y-4 text-xs font-semibold text-slate-600 font-sans">
                    <div>
                      <label className="block mb-1">Số văn bản ban hành *</label>
                      <input
                        id="out-form-number"
                        type="text"
                        required
                        value={outDocNumber}
                        onChange={(e) => setOutDocNumber(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 text-slate-800 font-medium"
                        placeholder="Số 115/BC-PCCC hoặc QD/..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Ngày ban hành quyết định</label>
                        <input
                          id="out-form-publish"
                          type="date"
                          value={outPublishDate}
                          onChange={(e) => setOutPublishDate(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Đơn vị nhận văn bản *</label>
                        <input
                          id="out-form-receiver"
                          type="text"
                          required
                          value={outReceiver}
                          onChange={(e) => setOutReceiver(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                          placeholder="Mường Thanh, UBND Phường..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1">Trích yếu nội dung văn bản đi *</label>
                      <textarea
                        id="out-form-summary"
                        required
                        value={outSummary}
                        onChange={(e) => setOutSummary(e.target.value)}
                        className="w-full p-2 border border-slate-205 rounded border-slate-200 h-20 text-xs text-slate-800 font-semibold"
                        placeholder="Nội dung báo cáo tiến độ tuần soát..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Cán bộ soạn thảo văn bản</label>
                        <select
                          id="out-form-author"
                          value={outAuthorId}
                          onChange={(e) => setOutAuthorId(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                        >
                          {officers.map(o => (
                            <option key={o.id} value={o.id}>{o.rank} {o.fullName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Thủ trưởng ký và duyệt</label>
                        <input
                          id="out-form-signer"
                          type="text"
                          required
                          value={outSigner}
                          onChange={(e) => setOutSigner(e.target.value)}
                          className="w-full p-2 border border-slate-205 rounded border-slate-200"
                          placeholder="Nguyễn Văn Hải"
                        />
                      </div>
                    </div>

                     <div>
                      <label className="block mb-1 text-slate-500">Tài liệu đính kèm</label>
                      <div className="flex flex-col gap-2 p-3 bg-slate-50/50 rounded-lg border border-slate-150">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer border border-slate-200 transition-colors text-[11px] font-extrabold shadow-2xs">
                            <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đính kèm tài liệu</span>
                            <input
                              type="file"
                              className="hidden"
                              id="out-form-file-input"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setOutFileLoc(e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                          {outFileLoc && (
                            <span className="text-[11px] text-slate-500 truncate max-w-[150px] font-mono font-bold">
                              {outFileLoc}
                            </span>
                          )}
                        </div>

                        {outFileLoc && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewFile(outFileLoc);
                                setPreviewTitle(outSummary || 'Tài liệu Công văn Đi');
                                setPreviewDocDetails({
                                  docNumber: outDocNumber || 'CV/2026/PCCC-DI',
                                  date: outPublishDate,
                                  publisher: 'Phòng Cảnh sát PCCC & CNCH',
                                  summary: outSummary || 'Chưa có trích yếu'
                                });
                              }}
                              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 transition-all cursor-pointer"
                              title="Xem trực tuyến tài liệu"
                            >
                              <Eye className="w-3 h-3 text-amber-600" />
                              Xem trước
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(outFileLoc)}
                              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-200 transition-all cursor-pointer"
                              title="Tải xuống tệp đính kèm"
                            >
                              <Download className="w-3 h-3" />
                              Tải về
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa tệp đính kèm này?')) {
                                  setOutFileLoc('');
                                }
                              }}
                              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded border border-rose-200 transition-all cursor-pointer"
                              title="Xóa tệp đính kèm"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa file
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      id="save-out-submit-btn"
                      type="submit"
                      className="w-full py-2 bg-red-650 hover:bg-red-650/90 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Bảo lưu công văn đi
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-250 p-6 rounded-xl text-center text-slate-400 text-xs">
                  <ArrowUpRight className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2" />
                  Ghi dán công văn đi gửi quần chúng, cơ sở hoặc ban chỉ huy quận nhằm khép kín sổ văn thư nội hạt năm 2026.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Simulated PDF Document Reader Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header bar */}
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-650 rounded-lg text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                    {previewFile}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    BẢN ĐỌC TRỰC TUYẾN TÀI LIỆU SỐ HÓA PCCC & CNCH
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFile)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4 text-emerald-450" />
                  Tải PDF về máy
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Đóng bản xem trước"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-slate-200/60 shadow-inner">
              {/* A4 Paper simulation */}
              <div className="bg-white w-full max-w-2xl min-h-[840px] p-8 md:p-14 shadow-xl border border-slate-250 relative flex flex-col font-sans text-slate-800 rounded-lg">
                
                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                  <div className="w-96 h-96 border-[12px] border-red-650 rounded-full flex items-center justify-center font-extrabold text-4xl text-red-650 text-center tracking-wider rotate-[-30deg]">
                    CẢNH SÁT PCCC<br/>& CNCH
                  </div>
                </div>

                {/* National Heading */}
                <div className="flex justify-between items-start text-center mb-8 gap-4 text-[11px] md:text-xs">
                  <div className="w-1/2 flex flex-col items-center">
                    <span className="font-extrabold uppercase tracking-wide text-slate-900">
                      {previewDocDetails?.publisher ? previewDocDetails.publisher.toUpperCase() : 'UBND QUẬN PCCC'}
                    </span>
                    <span className="font-bold border-b border-slate-800 pb-0.5 w-24">
                      SỞ PCCC & CNCH
                    </span>
                    <span className="text-[10px] mt-1.5 font-mono text-slate-500">
                      Số: {previewDocDetails?.docNumber || 'CV/2026/PCCC'}
                    </span>
                  </div>
                  <div className="w-1/2 flex flex-col items-center">
                    <span className="font-extrabold uppercase tracking-wide text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
                    <span className="font-bold text-[11.5px] text-slate-900">Độc lập - Tự do - Hạnh phúc</span>
                    <span className="border-b border-slate-800 pb-0.5 w-32 mt-0.5"></span>
                    <span className="text-[10px] italic mt-1.5 font-mono text-slate-500">
                      Quận PCCC, ngày {previewDocDetails?.date || '13 tháng 06 năm 2026'}
                    </span>
                  </div>
                </div>

                {/* Document Type Name */}
                <div className="text-center my-6">
                  <h4 className="font-black text-sm md:text-base tracking-wide uppercase text-slate-900">
                    QUYẾT ĐỊNH / CÔNG VĂN CHỈ ĐẠO
                  </h4>
                  <p className="text-[11px] md:text-xs italic text-slate-650 mt-1.5 max-w-lg mx-auto leading-relaxed">
                    Về việc: {previewTitle}
                  </p>
                </div>

                {/* Main content of Document */}
                <div className="flex-1 text-xs md:text-[13px] leading-relaxed space-y-4 text-justify font-serif text-slate-850">
                  <p className="font-bold">Kính gửi: Các phòng, ban, đơn vị liên quan và các cơ sở trực thuộc diện quản lý phòng cháy chữa cháy trên địa bàn.</p>
                  
                  <p>
                    Căn cứ Luật Phòng cháy và chữa cháy ngày 29 tháng 6 năm 2001; Luật sửa đổi, bổ sung một số điều của Luật Phòng cháy và chữa cháy ngày 22 tháng 11 năm 2013;
                  </p>
                  
                  <p>
                    Xét đề nghị của Trưởng phòng Cảnh sát phòng cháy, chữa cháy và cứu nạn, cứu hộ về việc tăng cường công tác phòng chống cháy nổ và rà soát kỹ lưỡng hồ sơ quản lý cơ sở năm 2026;
                  </p>

                  <div className="pl-4 border-l-2 border-red-500 space-y-2 py-1 font-sans text-xs bg-slate-50/50 rounded-r-lg p-3 my-4">
                    <p className="font-extrabold text-slate-900">TỔNG QUAN NỘI DUNG TÀI LIỆU CHỈ ĐẠO:</p>
                    <p><span className="font-bold text-slate-700">Trích yếu chính:</span> {previewDocDetails?.summary || 'Nội dung công văn triển khai phòng chống cháy nổ tại các địa bàn trọng điểm.'}</p>
                    <p><span className="font-bold text-slate-700">Mã số hồ sơ văn bản:</span> {previewDocDetails?.docNumber || 'CV_MOCK_2026'}</p>
                    <p><span className="font-bold text-slate-700">Cơ quan lưu trữ ban hành:</span> {previewDocDetails?.publisher || 'Cơ quan lưu trữ phòng nghiệp vụ PCCC'}</p>
                  </div>

                  <p>
                    Yêu cầu các đồng chí Chỉ huy các đội nghiệp vụ, Cán bộ quản lý địa bàn bám sát chỉ đạo, thực hiện nghiêm túc công tác kiểm tra đột xuất đối với những cơ sở thuộc Phụ lục II có dấu hiệu nguy cơ cao. Đồng thời hoàn thành việc cập nhật nhật ký kiểm tra biên bản trước ngày đáo hạn được nêu trong hệ thống phần mềm quản lý văn thư trực tuyến.
                  </p>

                  <p>
                    Nhận được công văn này, yêu cầu các cơ quan, ban ngành, cơ sở kinh doanh, và cán bộ được giao nhiệm vụ nghiêm túc phối hợp triển khai thực hiện và gửi báo cáo kết quả định kỳ về Văn phòng chỉ huy PCCC./.
                  </p>
                </div>

                {/* Signature and Seal */}
                <div className="flex justify-between items-start mt-10 pt-6 border-t border-slate-150 text-xs shrink-0">
                  <div className="w-1/2">
                    <span className="font-bold block uppercase text-[10px] text-slate-400 mb-1">Nơi nhận:</span>
                    <ul className="text-[10px] space-y-0.5 list-disc pl-4 font-mono text-slate-500">
                      <li>Như trên;</li>
                      <li>Lưu hồ sơ văn thư;</li>
                      <li>Công an Quận (để b/c);</li>
                      <li>Trang tin điện tử.</li>
                    </ul>
                  </div>
                  
                  <div className="w-1/2 flex flex-col items-center relative text-center">
                    <span className="font-extrabold uppercase text-[11px] text-slate-700">TM. BAN CHỈ HUY</span>
                    <span className="font-bold text-[11px] text-slate-700 mt-0.5">TRƯỞNG PHÒNG PCCC</span>
                    
                    {/* Seal simulation */}
                    <div className="absolute right-4 md:right-8 -top-2 w-28 h-28 border-4 border-double border-red-600 rounded-full flex items-center justify-center rotate-[15deg] select-none pointer-events-none opacity-80 shadow-xs bg-red-55/10">
                      <div className="border border-dashed border-red-600 rounded-full w-24 h-24 flex items-center justify-center flex-col text-[7px] font-black text-red-600 leading-none">
                        <span className="tracking-widest mb-1">CÔNG AN QUẬN PCCC</span>
                        <span className="text-[8px] bg-red-100/50 px-1 py-0.5 rounded border border-red-400 font-extrabold my-1">ĐÃ DUYỆT</span>
                        <span className="scale-90 font-bold">VĂN PHÒNG CHỈ HUY</span>
                      </div>
                    </div>

                    <div className="mt-16 font-extrabold text-xs text-slate-800 z-10">
                      Nguyễn Văn Hải
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Chữ ký điện tử / Ban Chỉ huy PCCC</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
