import { useState, useEffect } from 'react';
import { PCCCStoreType } from '../lib/store';
import { ReferenceMaterial } from '../types';
import { createVietnameseDoc, downloadPdfBlob, stripAccents, sanitizeFileName } from '../lib/pdfUtils';
import { 
  BookOpen, Search, Plus, Trash2, Edit2, FileText, 
  ExternalLink, Calendar, Check, Library, X, Paperclip,
  RefreshCw, CheckCircle2, Download, Eye
} from 'lucide-react';

interface ReferenceProps {
  store: PCCCStoreType;
}

export default function ReferenceMaterialModule({ store }: ReferenceProps) {
  const { materials, setMaterials } = store;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Sync state helpers
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('Đang kết nối máy chủ quản lý trực tuyến...');
    
    setTimeout(() => {
      setSyncMessage('Đồng bộ hóa dữ liệu quy chuẩn tài liệu kỹ thuật...');
      setTimeout(() => {
        localStorage.setItem('pccc_materials', JSON.stringify(materials));
        setIsSyncing(false);
        setSyncMessage('Đồng bộ hóa và lưu trữ tài liệu kỹ thuật thành công!');
        setTimeout(() => {
          setSyncMessage('');
        }, 3500);
      }, 700);
    }, 600);
  };

  // Selected Material for detail/editing panels
  const [viewingMaterial, setViewingMaterial] = useState<ReferenceMaterial | null>(null);
  const [previewingMaterial, setPreviewingMaterial] = useState<ReferenceMaterial | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [editingMaterial, setEditingMaterial] = useState<ReferenceMaterial | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formCategory, setFormCategory] = useState<'Luật' | 'Nghị định' | 'Thông tư' | 'Quy chuẩn' | 'Tiêu chuẩn' | 'Văn bản chỉ đạo' | 'Tài liệu huấn luyện'>('Nghị định');
  const [formPublishDate, setFormPublishDate] = useState('2026-06-13');
  const [formPublisher, setFormPublisher] = useState('');
  const [formScope, setFormScope] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');

  // Inline editing state for viewing detail panel
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedScope, setEditedScope] = useState('');
  const [isEditingScope, setIsEditingScope] = useState(false);

  useEffect(() => {
    if (viewingMaterial) {
      setEditedNotes(viewingMaterial.notes || '');
      setIsEditingNotes(false);
      setEditedScope(viewingMaterial.scope || '');
      setIsEditingScope(false);
    }
  }, [viewingMaterial]);

  const CATEGORIES = ['Luật', 'Nghị định', 'Thông tư', 'Quy chuẩn', 'Tiêu chuẩn', 'Văn bản chỉ đạo', 'Tài liệu huấn luyện'];

  // Handlers
  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormTitle('');
    setFormDocNumber('');
    setFormCategory('Nghị định');
    setFormPublishDate('2026-06-13');
    setFormPublisher('');
    setFormScope('');
    setFormNotes('');
    setFormFileUrl('');
    setIsAddingNew(true);
  };

  const handleOpenEdit = (mat: ReferenceMaterial) => {
    setEditingMaterial(mat);
    setFormTitle(mat.title);
    setFormDocNumber(mat.docNumber || '');
    setFormCategory(mat.category);
    setFormPublishDate(mat.publishDate || '2026-06-13');
    setFormPublisher(mat.publisher || '');
    setFormScope(mat.scope);
    setFormNotes(mat.notes || '');
    setFormFileUrl(mat.fileUrl || '');
    setIsAddingNew(false);
  };

  const handleSaveMaterial = (e: any) => {
    e.preventDefault();
    if (!formTitle.trim()) return alert('Vui lòng điền đề mục sách luật');

    const body: Omit<ReferenceMaterial, 'id'> = {
      title: formTitle,
      docNumber: formDocNumber || undefined,
      category: formCategory,
      publishDate: formPublishDate || undefined,
      publisher: formPublisher || undefined,
      scope: formScope,
      notes: formNotes || undefined,
      fileUrl: formFileUrl || undefined
    };

    if (isAddingNew) {
      setMaterials([...materials, { id: `MAT_${Date.now()}`, ...body }]);
    } else if (editingMaterial) {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...m, ...body } : m));
    }

    setEditingMaterial(null);
    setIsAddingNew(false);
  };

  const handleDeleteMaterial = (id: string, name: string) => {
    setMaterialToDelete({ id, title: name });
  };

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.docNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.scope.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="materials-module">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-650" />
            TÀI LIỆU VÀ QUY CHUẨN NGHIỆP VỤ PCCC
          </h2>
          {syncMessage && (
            <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {syncMessage}
            </div>
          )}
        </div>

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

          <button
            id="add-material-btn"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> BỔ SUNG THƯ VIỆN
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-105 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between no-print">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="material-search-input"
            type="text"
            placeholder="Tìm tài liệu theo tên, số hiệu, nội dung áp dụng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0" id="materials-badges-filters">
          <button
            id="cat-filter-all"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${selectedCategory === 'All' ? 'bg-red-600/10 text-red-600 border-red-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}
          >
            Tất cả
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`cat-filter-${cat.replace(/\s+/g, '')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${selectedCategory === cat ? 'bg-red-600/10 text-red-600 border-red-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List (Col span 2) */}
        <div className="lg:col-span-2 space-y-3" id="materials-list-viewport">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMaterials.map(mat => (
              <div
                key={mat.id}
                id={`material-card-${mat.id}`}
                onClick={() => {
                  setViewingMaterial(mat);
                  setEditingMaterial(null);
                }}
                className={`bg-white p-5 rounded-xl border cursor-pointer hover:border-slate-350 hover:shadow-sm transition-all flex flex-col justify-between ${
                  viewingMaterial?.id === mat.id ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-100'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 block">{mat.category}</span>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-0.5 line-clamp-2 leading-relaxed">{mat.title}</h4>
                    </div>
                  </div>

                  <p className="text-slate-500 text-[11.5px] line-clamp-2 leading-relaxed">
                    {mat.scope}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="font-mono flex items-center gap-1">
                    {mat.docNumber || 'Không số hiệu'}
                    {mat.fileUrl && <Paperclip className="w-3 h-3 text-red-500" title={`Có tài liệu đính kèm: ${mat.fileUrl}`} />}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`delete-mat-${mat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaterial(mat.id, mat.title);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-650 font-extrabold text-[10.5px] transition-all cursor-pointer border border-red-200/50 hover:border-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                    <button
                      id={`edit-mat-${mat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(mat);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10.5px] transition-all cursor-pointer border border-slate-200"
                    >
                      <Edit2 className="w-3 h-3" />
                      Sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredMaterials.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                <Library className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-sm">Không tìm thấy tài liệu quy chuẩn nào phù hợp.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div id="material-side-view-form">
          {(editingMaterial || isAddingNew) ? (
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                  {isAddingNew ? 'Lập Thư Mục Pháp Điển' : 'Hiệu chỉnh Thư Mục'}
                </h3>
                <button id="close-mat-form" onClick={() => { setEditingMaterial(null); setIsAddingNew(false); }} className="text-slate-400">X</button>
              </div>

              <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">Tên tài liệu / Nghị định *</label>
                  <textarea
                    id="mat-form-title"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 h-16 font-extrabold text-slate-800 text-xs"
                    placeholder="Quy chuẩn kỹ thuật quốc tế về an toàn cháy lan..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Ký hiệu / Số hiệu</label>
                    <input
                      id="mat-form-docnumber"
                      type="text"
                      value={formDocNumber}
                      onChange={(e) => setFormDocNumber(e.target.value)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200"
                      placeholder="QCVN 06:2022/BXD..."
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Phân phân nhóm</label>
                    <select
                      id="mat-form-cat"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Ngày ban hành</label>
                    <input
                      id="mat-form-publishdate"
                      type="date"
                      value={formPublishDate}
                      onChange={(e) => setFormPublishDate(e.target.value)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Pháp nhân ban hành</label>
                    <input
                      id="mat-form-publisher"
                      type="text"
                      value={formPublisher}
                      onChange={(e) => setFormPublisher(e.target.value)}
                      className="w-full p-2 border border-slate-205 rounded border-slate-200"
                      placeholder="Chính phủ, Bộ Công an..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Lĩnh vực, phạm vi áp dụng *</label>
                  <textarea
                    id="mat-form-scope"
                    required
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 h-16"
                    placeholder="Khai quát điều kiện thiết lập hệ hộc nước phòng cao tầng..."
                  />
                </div>

                <div>
                  <label className="block mb-1">Ghi chú bổ trợ</label>
                  <textarea
                    id="mat-form-notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2 border border-slate-205 rounded border-slate-200 h-14"
                    placeholder="Quy chuẩn bắt buộc, hướng dẫn kỹ cán bộ..."
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500 text-[11px] font-bold uppercase tracking-wider">Đính kèm tài liệu văn bản nghiệp vụ</label>
                  <div className="p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="mat-file-input"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormFileUrl(file.name);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('mat-file-input')?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        {formFileUrl ? 'Thay tệp khác' : 'Chọn tệp đính kèm'}
                      </button>
                      {formFileUrl && (
                        <button
                          type="button"
                          onClick={() => setFormFileUrl('')}
                          className="text-red-500 hover:text-red-750 font-bold text-xs"
                        >
                          Gỡ bỏ
                        </button>
                      )}
                    </div>
                    {formFileUrl ? (
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded border border-slate-250 text-[11px] text-slate-650 font-mono font-bold truncate">
                        <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{formFileUrl}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Có thể chọn tệp tin PDF, Word để đính kèm trực tiếp vào thư mục tra cứu.</span>
                    )}
                  </div>
                </div>

                <button
                  id="save-mat-submit-btn"
                  type="submit"
                  className="w-full py-2 bg-red-650 hover:bg-red-600 text-white font-bold rounded"
                >
                  Bảo lưu pháp mục
                </button>
              </form>
            </div>
          ) : viewingMaterial ? (
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4" id="material-detail-panel">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Quy chuẩn gốc</span>
                <button id="close-mat-detail" onClick={() => setViewingMaterial(null)} className="text-slate-400">X</button>
              </div>

              <div className="space-y-3 font-sans">
                <span className="text-[10px] uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded font-extrabold inline-block">
                  {viewingMaterial.category}
                </span>
                <h3 className="font-extrabold text-slate-800 text-sm leading-relaxed">{viewingMaterial.title}</h3>
                
                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t">
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-bold">Ký hiệu pháp quy:</span>
                    <span className="font-mono text-slate-800">{viewingMaterial.docNumber || 'Không có'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-bold">Ngày ban hành:</span>
                    <span className="text-slate-800">{viewingMaterial.publishDate || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-bold">Cơ quan phê duyệt:</span>
                    <span className="text-slate-800 text-right">{viewingMaterial.publisher || 'Chưa rõ'}</span>
                  </p>
                  
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-400 block uppercase text-[9.5px]">Phạm vi điều chỉnh:</span>
                    {isEditingScope ? (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          id="mat-detail-scope-textarea"
                          value={editedScope}
                          onChange={(e) => setEditedScope(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50 text-slate-800 font-medium"
                          rows={3}
                          placeholder="Nhập phạm vi áp dụng..."
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditedScope(viewingMaterial.scope || '');
                              setIsEditingScope(false);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            id="save-detail-scope-btn"
                            onClick={() => {
                              const updated = { ...viewingMaterial, scope: editedScope };
                              setMaterials(materials.map(m => m.id === viewingMaterial.id ? updated : m));
                              setViewingMaterial(updated);
                              setIsEditingScope(false);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold bg-red-650 hover:bg-red-600 text-white rounded cursor-pointer"
                          >
                            Lưu phạm vi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[11px] leading-relaxed text-slate-650 flex flex-col gap-1.5">
                        <p>{viewingMaterial.scope}</p>
                        <button
                          type="button"
                          id="edit-detail-scope-trigger"
                          onClick={() => setIsEditingScope(true)}
                          className="text-red-650 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer text-[10px] self-end"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Chỉnh sửa phạm vi
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="font-extrabold text-slate-400 block uppercase text-[9.5px]">Ghi chú cán bộ kiểm tra:</span>
                    {isEditingNotes ? (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          id="mat-detail-notes-textarea"
                          value={editedNotes}
                          onChange={(e) => setEditedNotes(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50 text-slate-800 font-medium"
                          rows={2}
                          placeholder="Nhập ghi chú hỗ trợ kiểm tra..."
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditedNotes(viewingMaterial.notes || '');
                              setIsEditingNotes(false);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            id="save-detail-notes-btn"
                            onClick={() => {
                              const updated = { ...viewingMaterial, notes: editedNotes || undefined };
                              setMaterials(materials.map(m => m.id === viewingMaterial.id ? updated : m));
                              setViewingMaterial(updated);
                              setIsEditingNotes(false);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold bg-red-650 hover:bg-red-600 text-white rounded cursor-pointer"
                          >
                            Lưu ghi chú
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/70 text-[11px] leading-relaxed text-slate-650 flex flex-col gap-1.5">
                        <p>{viewingMaterial.notes || <span className="text-slate-400 italic">Chưa có ghi chú nghiệp vụ.</span>}</p>
                        <button
                          type="button"
                          id="edit-detail-notes-trigger"
                          onClick={() => setIsEditingNotes(true)}
                          className="text-red-650 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer text-[10px] self-end"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Chỉnh sửa ghi chú
                        </button>
                      </div>
                    )}
                  </div>

                  {viewingMaterial.fileUrl ? (
                    <div className="bg-red-50/20 p-3 rounded-lg border border-red-100 space-y-3 mt-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-red-650 shrink-0" />
                        <span className="font-mono text-slate-800 text-[11px] truncate font-extrabold">{viewingMaterial.fileUrl}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button 
                          type="button"
                          id="read-attached-material-btn"
                          onClick={() => setPreviewingMaterial(viewingMaterial)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-2xs mr-1"
                        >
                          <Eye className="w-3 h-3" />
                          Đọc tài liệu
                        </button>
                        <button 
                          type="button"
                          onClick={async () => {
                            try {
                              const { doc, isUnicode } = await createVietnameseDoc();
                              const fontFamily = isUnicode ? "Roboto" : "Helvetica";

                              const cleanStr = (str: string) => {
                                if (!str) return '';
                                return isUnicode ? str.toString() : stripAccents(str.toString());
                              };

                              // Outer border
                              doc.setDrawColor(210, 210, 210);
                              doc.rect(10, 10, 190, 277);

                              // Header
                              doc.setFont(fontFamily, "bold");
                              doc.setFontSize(8);
                              doc.text(isUnicode ? "BỘ CÔNG AN - VIỆT NAM" : "BO CONG AN - VIET NAM", 15, 20);
                              doc.text(isUnicode ? "CỤC CẢNH SÁT PCCC & CNCH" : "CUC CANH SAT PCCC & CNCH", 15, 24);

                              doc.text(isUnicode ? "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" : "CONG HOA XA HOI CHU NGHIA VIET NAM", 110, 20);
                              doc.setFontSize(7.5);
                              doc.text(isUnicode ? "Độc lập - Tự do - Hạnh phúc" : "Doc lap - Tu do - Hanh phuc", 128, 24);
                              doc.line(128, 26, 168, 26);

                              doc.setLineWidth(0.4);
                              doc.line(15, 34, 195, 34);

                              // Title
                              doc.setFontSize(11);
                              doc.setFont(fontFamily, "bold");
                              doc.text(isUnicode ? "VĂN BẢN QUY CHUẨN KỸ THUẬT - PHÁP LUẬT" : "VAN BAN QUY CHUAN KY THUAT - PHAP LUAT", 105, 45, { align: "center" });

                              // Subtitle
                              doc.setFontSize(9);
                              doc.setFont(fontFamily, "bolditalic");
                              doc.text(cleanStr(viewingMaterial.title).toUpperCase(), 105, 52, { align: "center" });

                              // Specs table
                              doc.setFont(fontFamily, "bold");
                              doc.setFontSize(8.5);
                              doc.text(isUnicode ? "THÔNG TIN TÀI LIỆU:" : "THONG TIN TAI LIEU:", 18, 68);

                              doc.setFont(fontFamily, "normal");
                              doc.setFontSize(8);
                              doc.text(isUnicode ? `- Mã số / Tên file: ${cleanStr(viewingMaterial.fileUrl)}` : `- Ma so / Ten file: ${cleanStr(viewingMaterial.fileUrl)}`, 20, 74);
                              doc.text(isUnicode ? `- Nhóm danh mục: ${cleanStr(viewingMaterial.category)}` : `- Nhom danh muc: ${cleanStr(viewingMaterial.category)}`, 20, 79);
                              doc.text(isUnicode ? `- Cơ quan ban hành: ${cleanStr(viewingMaterial.publisher || 'Cục Cảnh sát PCCC & CNCH')}` : `- Co quan ban hanh: ${cleanStr(viewingMaterial.publisher || 'Cuc Canh sat PCCC & CNCH')}`, 20, 84);
                              doc.text(isUnicode ? `- Năm ban hành: ${cleanStr(viewingMaterial.publishYear || '2026')}` : `- Nam ban hanh: ${cleanStr(viewingMaterial.publishYear || '2026')}`, 20, 89);

                              // Content box
                              doc.setDrawColor(200, 0, 0);
                              doc.setFillColor(253, 250, 250);
                              doc.rect(18, 98, 174, 50, "FD");

                              doc.setFont(fontFamily, "bold");
                              doc.setTextColor(200, 0, 0);
                              doc.text(isUnicode ? "GHI CHÚ & TỜ TRÌNH TRÍCH YẾU:" : "GHI CHU & TO TRINH TRICH YEU:", 22, 104);

                              doc.setTextColor(50, 50, 50);
                              doc.setFont(fontFamily, "normal");
                              
                              const notesVal = viewingMaterial.notes || "Tai lieu nay quy dinh cac quy chuan tieu chuan quoc gia ve phong chay chua chay doi voi cac co so san xuat, kinh doanh va cong trinh cong cong.";
                              const splitNotes = doc.splitTextToSize(cleanStr(notesVal), 164);
                              doc.text(splitNotes, 22, 110);

                              // Reset text color
                              doc.setTextColor(0, 0, 0);

                              // Closing stamp
                              const sigY = 170;
                              doc.setFont(fontFamily, "bold");
                              doc.text(isUnicode ? "XÁC NHẬN HỆ THỐNG" : "XAC NHAN HE THONG", 130, sigY);
                              doc.text(isUnicode ? "VĂN PHÒNG PHÁP CHẾ" : "VONG PHONG PHAP CHE", 128, sigY + 5);

                              // Draw stamp circle
                              doc.setDrawColor(200, 0, 0);
                              doc.setLineWidth(0.5);
                              doc.circle(150, sigY + 22, 11);
                              doc.setLineWidth(0.2);
                              doc.circle(150, sigY + 22, 9.5);

                              doc.setFontSize(4);
                              doc.setTextColor(200, 0, 0);
                              doc.text(isUnicode ? "BỘ CÔNG AN" : "BO CONG AN", 150, sigY + 18, { align: "center" });
                              doc.text(isUnicode ? "BAN QUẢN LÝ" : "BAN QUAN LY", 150, sigY + 22, { align: "center" });
                              doc.text(isUnicode ? "QUY CHUẨN PCCC" : "QUY CHUAN PCCC", 150, sigY + 26, { align: "center" });

                              const finalName = viewingMaterial.fileUrl || "tai_lieu_dinh_kem.pdf";
                              downloadPdfBlob(doc, finalName);
                            } catch (err) {
                              console.error("Failed to generate reference PDF:", err);
                              alert("Đã xảy ra lỗi khi tạo tài liệu PDF.");
                            }
                          }}
                          className="flex items-center gap-1 bg-red-650 hover:bg-red-700 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3 h-3" />
                          Tải file đính kèm
                        </button>
                        
                        <input
                          id="mat-detail-file-replace-input"
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const updated = { ...viewingMaterial, fileUrl: file.name };
                              setMaterials(materials.map(m => m.id === viewingMaterial.id ? updated : m));
                              setViewingMaterial(updated);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('mat-detail-file-replace-input')?.click()}
                          className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1.5 rounded border border-slate-200 transition-all cursor-pointer"
                        >
                          Thay thế
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu đính kèm này?')) {
                              const updated = { ...viewingMaterial, fileUrl: undefined };
                              setMaterials(materials.map(m => m.id === viewingMaterial.id ? updated : m));
                              setViewingMaterial(updated);
                            }
                          }}
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded border border-rose-200 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          Xóa file
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <input
                        id="mat-detail-file-input"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const updated = { ...viewingMaterial, fileUrl: file.name };
                            setMaterials(materials.map(m => m.id === viewingMaterial.id ? updated : m));
                            setViewingMaterial(updated);
                          }
                        }}
                      />
                      <button
                        type="button"
                        id="mat-detail-attach-btn"
                        onClick={() => document.getElementById('mat-detail-file-input')?.click()}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-lg text-slate-705 font-extrabold text-xs cursor-pointer transition-all shadow-xs"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        Đính kèm tệp văn bản/tài liệu gốc
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions section with Save & Close */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="save-material-detail-btn"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isSyncing ? 'ĐANG LƯU...' : 'LƯU DỮ LIỆU'}
                </button>
                <button
                  type="button"
                  id="close-material-detail-btn"
                  onClick={() => setViewingMaterial(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs">
              <BookOpen className="w-10 h-10 mx-auto text-slate-350 stroke-1 mb-2" />
              Lựa chọn văn mục để tham chiếu phạm vi áp dụng, hoặc điều hướng tìm kiếm tệp luật đính kèm hỏa tốc.
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {materialToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4" id="delete-confirmation-overlay">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-sm w-full p-5 space-y-4" id="delete-confirmation-box">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-650 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900">Xác nhận xóa tài liệu?</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Tài liệu này sẽ bị gỡ bỏ khỏi cơ sở dữ liệu thư viện nghiệp vụ PCCC.
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Tên tài liệu</span>
              <p className="text-slate-800 font-extrabold text-[11.5px] leading-relaxed mt-0.5 line-clamp-2">
                {materialToDelete.title}
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                id="cancel-delete-btn"
                onClick={() => setMaterialToDelete(null)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer border border-slate-200"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="confirm-delete-submit-btn"
                onClick={() => {
                  setMaterials(materials.filter(m => m.id !== materialToDelete.id));
                  if (viewingMaterial?.id === materialToDelete.id) {
                    setViewingMaterial(null);
                  }
                  setMaterialToDelete(null);
                  
                  // Show feedback sync message
                  setSyncMessage('Đã gỡ bỏ tài liệu thành công!');
                  setTimeout(() => {
                    setSyncMessage('');
                  }, 3000);
                }}
                className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive e-Reader Document Preview Modal */}
      {previewingMaterial && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in" id="material-reader-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden text-slate-100" id="material-reader-box">
            
            {/* Toolbar Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-red-500/10 text-red-400 font-extrabold px-1.5 py-0.5 rounded border border-red-500/20 uppercase">
                      {previewingMaterial.category}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono">
                      {previewingMaterial.docNumber || 'Hỏa tốc / TCVN'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-200 line-clamp-1 mt-0.5">
                    {previewingMaterial.title}
                  </h3>
                </div>
              </div>

              {/* Reader Controls */}
              <div className="flex items-center gap-3">
                {/* Search in Doc */}
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm từ khóa..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="pl-7 pr-6 py-1 text-[11px] bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-md text-slate-300 w-32 placeholder-slate-500 focus:outline-none transition-all"
                  />
                  {previewSearch && (
                    <button
                      onClick={() => setPreviewSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Font Zoom */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(Math.max(80, previewZoom - 10))}
                    className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Thu nhỏ chữ"
                  >
                    A-
                  </button>
                  <span className="px-1.5 text-[9px] font-mono font-bold text-slate-500">
                    {previewZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(Math.min(160, previewZoom + 10))}
                    className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Phóng to chữ"
                  >
                    A+
                  </button>
                </div>

                {/* Theme toggle */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('light')}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${previewTheme === 'light' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('sepia')}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${previewTheme === 'sepia' ? 'bg-amber-100 text-amber-950 font-serif' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Giấy
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('dark')}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${previewTheme === 'dark' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Tối
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewingMaterial(null);
                    setPreviewSearch('');
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
                  title="Đóng trình đọc"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main view area: Split Pane */}
            <div className="flex-1 flex overflow-hidden bg-slate-950">
              
              {/* Left Side: Document Paper */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                <div 
                  className={`w-full max-w-2xl shadow-xl rounded-lg p-6 md:p-10 transition-all duration-300 min-h-[120%] relative border ${
                    previewTheme === 'light' 
                      ? 'bg-white text-slate-900 border-slate-200' 
                      : previewTheme === 'sepia'
                        ? 'bg-amber-50/95 text-slate-850 border-amber-200/50 font-serif'
                        : 'bg-slate-900 text-slate-200 border-slate-800'
                  }`}
                  style={{ fontSize: `${previewZoom}%` }}
                >
                  
                  {/* National Emblem & Header */}
                  <div className="flex justify-between border-b pb-3 mb-5 border-current/20 text-[10px] opacity-80">
                    <div className="space-y-0.5 font-bold">
                      <p>BỘ CÔNG AN - VIỆT NAM</p>
                      <p className="text-[8.5px] tracking-tight">{previewingMaterial.publisher || 'CỤC CẢNH SÁT PCCC & CNCH'}</p>
                      <p className="font-normal text-[8.5px]">Số hiệu: {previewingMaterial.docNumber || 'Hỏa tốc'}</p>
                    </div>
                    <div className="text-right space-y-0.5 font-bold">
                      <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="text-[9px]">Độc lập - Tự do - Hạnh phúc</p>
                      <div className="w-20 h-[1px] bg-current ml-auto mt-1" />
                    </div>
                  </div>

                  {/* Document Emblem simulation */}
                  <div className="text-center my-4">
                    <div className="w-10 h-10 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-2 opacity-90">
                      <BookOpen className="w-5 h-5 text-red-500" />
                    </div>
                    <h1 className="font-extrabold tracking-tight text-sm md:text-base uppercase">
                      VĂN BẢN QUY PHẠM PHÁP LUẬT
                    </h1>
                    <p className="font-bold text-[10px] text-red-650 tracking-wider uppercase mt-0.5">
                      {previewingMaterial.category}
                    </p>
                    <p className="text-[8px] italic mt-1 text-current/60">
                      (Đã xác thực chữ ký điện tử quốc gia)
                    </p>
                  </div>

                  {/* Title of the material */}
                  <div className="my-5 text-center bg-current/5 p-3 rounded border border-current/10">
                    <h2 className="font-extrabold text-xs md:text-sm tracking-tight uppercase leading-snug">
                      {previewingMaterial.title}
                    </h2>
                    {previewingMaterial.publishYear && (
                      <p className="text-[9px] font-bold text-red-650 mt-1 uppercase">
                        Năm hiệu lực: {previewingMaterial.publishYear}
                      </p>
                    )}
                  </div>

                  {/* Legal Body content */}
                  <div className="space-y-5 text-[11px] md:text-xs leading-relaxed font-normal">
                    
                    <div>
                      <p className="font-bold uppercase tracking-wide border-b border-current/10 pb-0.5 text-[10px] mb-1.5 text-red-650">Chương I: Quy Định Chung</p>
                      <div className="space-y-2 pl-1.5">
                        <p>
                          <strong className="font-bold text-current/90 block">Điều 1. Phạm vi điều chỉnh</strong>
                          {previewingMaterial.scope || `Văn bản quy chuẩn này quy định chi tiết các tiêu chuẩn kỹ thuật thiết kế, lắp đặt, nghiệm thu và bảo dưỡng hệ thống trang thiết bị phòng cháy, an toàn chống cháy lan đối với cơ sở kinh doanh, sản xuất và công trình cao tầng thuộc diện quản lý.`}
                        </p>
                        <p>
                          <strong className="font-bold text-current/90 block">Điều 2. Đối tượng áp dụng</strong>
                          Áp dụng đối với tất cả cơ quan quản lý Nhà nước về PCCC, các tổ chức hoạt động xây dựng, doanh nghiệp phát triển hạ tầng kỹ thuật và cá nhân liên quan trong phạm vi toàn quốc.
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold uppercase tracking-wide border-b border-current/10 pb-0.5 text-[10px] mb-1.5 text-red-650">Chương II: Các Quy Chuẩn Nghiệp Vụ Đặc Thù</p>
                      <div className="space-y-2 pl-1.5">
                        <p>
                          <strong className="font-bold text-current/90 block">Điều 3. Chỉ tiêu chịu lửa an toàn</strong>
                          Các bộ phận chịu lực chính và tường ngăn cháy lan phải chế tạo từ vật liệu đạt giới hạn chịu lửa EI-90 đến EI-120 phút. Cửa thoát hiểm chống cháy phải có gioăng nở cao su chống khói lọt qua khe và khả năng tự động đóng khi có sự cố xảy ra.
                        </p>
                        <p>
                          <strong className="font-bold text-current/90 block">Điều 4. Hệ thống hạ tầng phòng ngừa ban đầu</strong>
                          Tất cả hành lang thoát nạn phải thiết kế hệ thống chiếu sáng chỉ dẫn sự cố khẩn cấp độc lập hoạt động bằng pin lưu điện dự phòng tối thiểu 2 tiếng. Lối thoát không được phép lưu trữ vật tư gây cản trở di chuyển cứu hộ cứu nạn.
                        </p>
                      </div>
                    </div>

                    {previewingMaterial.notes && (
                      <div>
                        <p className="font-bold uppercase tracking-wide border-b border-current/10 pb-0.5 text-[10px] mb-1.5 text-red-650">Chương III: Ghi Chú Hỗ Trợ Nghiệp Vụ Kiểm Tra</p>
                        <div className="pl-1.5 bg-amber-500/5 p-2 rounded.md border border-current/10">
                          <p className="italic">
                            <strong className="font-bold not-italic text-red-650 block text-[9.5px]">Ghi chú cán bộ chuyên trách:</strong>
                            {previewingMaterial.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="font-bold uppercase tracking-wide border-b border-current/10 pb-0.5 text-[10px] mb-1.5 text-red-650">Chương IV: Điều Khoản Thi Hành</p>
                      <div className="space-y-1.5 pl-1.5">
                        <p>
                          <strong className="font-bold text-current/90 block">Điều 5. Trách nhiệm thi hành</strong>
                          Đơn vị cơ sở, chủ đầu tư dự án và các cơ quan chỉ huy Phòng cháy chữa cháy chịu trách nhiệm trực tiếp thi hành văn bản quy chuẩn này kể từ ngày chính thức ban hành./.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Signatures & Stamps section */}
                  <div className="mt-8 pt-4 border-t border-current/15 grid grid-cols-2 gap-3 text-[10px]">
                    <div className="space-y-0.5 text-[8.5px]">
                      <p className="font-bold uppercase">Nơi nhận:</p>
                      <p className="text-current/70">- Như Điều 2;</p>
                      <p className="text-current/70">- Bộ Công an;</p>
                      <p className="text-current/70">- Lưu văn thư pháp chế.</p>
                    </div>
                    
                    <div className="text-center relative">
                      <p className="font-extrabold text-[8px] uppercase tracking-wider">TM. BAN CHỈ HUY PCCC</p>
                      <p className="font-bold text-[9px] uppercase text-red-600 mt-0.5">TRƯỞNG PHÒNG</p>
                      
                      {/* RED CIRCULAR APPROVED STAMP */}
                      <div className="absolute right-4 top-4 w-16 h-16 border border-red-650 rounded-full flex flex-col items-center justify-center opacity-85 select-none rotate-6 scale-95 z-10 pointer-events-none">
                        <div className="absolute inset-[1.5px] border border-dashed border-red-650 rounded-full" />
                        <span className="text-[4px] font-extrabold text-red-650 uppercase tracking-tight">CỤC CẢNH SÁT PCCC</span>
                        <span className="text-[5.5px] font-black text-red-700 bg-white/80 px-0.5 rounded-sm border border-red-650 uppercase tracking-wide my-0.2">ĐÃ PHÊ DUYỆT</span>
                        <span className="text-[3px] font-bold text-red-650 uppercase tracking-tighter">BỘ CÔNG AN * VIỆT NAM</span>
                      </div>

                      {/* Leader name */}
                      <div className="mt-10 font-extrabold text-[11px]">
                        Nguyễn Văn Hải
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5 border border-dashed border-current/20 rounded px-1 py-0.5 inline-block bg-slate-50/50">
                        🔒 ĐÃ KÝ SỐ CHỨNG THƯ TRUNG ƯƠNG
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Footer watermark */}
                  <div className="mt-6 pt-3 border-t border-dashed border-current/10 flex justify-between items-center text-[8px] font-mono text-current/50">
                    <p>Mã tài liệu số hóa: ID-{previewingMaterial.id}</p>
                    <p>Tệp nguồn đính kèm: {previewingMaterial.fileUrl || 'Chưa đính kèm'}</p>
                  </div>

                </div>
              </div>

              {/* Right Side: Smart Interactive Helper Panel (Sidebar inside the modal) */}
              <div className="w-64 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto shrink-0 flex flex-col gap-4">
                
                {/* Meta Summary Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                    Thuộc tính số hóa tài liệu
                  </h4>
                  <div className="space-y-1.5 text-[10px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[9px]">TÊN LUẬT / QUY CHUẨN:</span>
                      <span className="font-bold text-slate-200">{previewingMaterial.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">CƠ QUAN BAN HÀNH:</span>
                      <span className="font-bold text-slate-200">{previewingMaterial.publisher || 'Cục Cảnh sát PCCC'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">TỆP ĐÍNH KÈM LIÊN KẾT:</span>
                      <span className="font-mono bg-slate-900 px-1 py-0.5 border border-slate-800 text-red-400 rounded block mt-0.5 truncate">
                        {previewingMaterial.fileUrl || 'Chưa đính kèm'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Inspection Guide Assistant */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin-slow" />
                    <h4 className="font-extrabold text-[10px] text-slate-200 uppercase tracking-wider">
                      Cẩm nang thanh tra nhanh
                    </h4>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Sổ tay tra cứu các điểm cốt yếu khi đi thực tế nghiệm thu hạ tầng PCCC liên quan đến tài liệu này:
                  </p>
                  
                  <div className="space-y-1.5 overflow-y-auto flex-1 text-[10px]">
                    <div className="p-1.5 bg-slate-900/60 rounded border border-slate-800/85">
                      <span className="font-bold text-blue-400 block">✓ Khả năng ngăn nhiệt</span>
                      Tường, vách ngăn chống cháy phải ngăn cản sức nóng tối thiểu 1 tiếng rưỡi để tránh sập cục bộ.
                    </div>
                    <div className="p-1.5 bg-slate-900/60 rounded border border-slate-800/85">
                      <span className="font-bold text-amber-400 block">✓ Tiêu chuẩn hành lang</span>
                      Toàn bộ lối đi chính thoát hiểm hành lang tuyệt đối không lắp rào chắn hay để vật cản.
                    </div>
                    <div className="p-1.5 bg-slate-900/60 rounded border border-slate-800/85">
                      <span className="font-bold text-emerald-400 block">✓ Kiểm tra máy bơm</span>
                      Đảm bảo van khóa áp suất nước hệ thống cứu hỏa hoạt động chính xác khi kiểm tra thực tế.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { doc, isUnicode } = await createVietnameseDoc();
                        const fontFamily = isUnicode ? "Roboto" : "Helvetica";

                        const cleanStr = (str: string) => {
                          if (!str) return '';
                          return isUnicode ? str.toString() : stripAccents(str.toString());
                        };

                        doc.setDrawColor(210, 210, 210);
                        doc.rect(10, 10, 190, 277);
                        
                        doc.setFont(fontFamily, "bold");
                        doc.setFontSize(8);
                        doc.text(isUnicode ? "BỘ CÔNG AN - VIỆT NAM" : "BO CONG AN - VIET NAM", 15, 20);
                        doc.text(isUnicode ? "CỤC CẢNH SÁT PCCC & CNCH" : "CUC CANH SAT PCCC & CNCH", 15, 24);
                        doc.text(isUnicode ? "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" : "CONG HOA XA HOI CHU NGHIA VIET NAM", 110, 20);
                        doc.setFontSize(7.5);
                        doc.text(isUnicode ? "Độc lập - Tự do - Hạnh phúc" : "Doc lap - Tu do - Hanh phuc", 128, 24);
                        doc.line(128, 26, 168, 26);
                        
                        doc.setLineWidth(0.4);
                        doc.line(15, 34, 195, 34);
                        doc.setFontSize(11);
                        doc.text(isUnicode ? "VĂN BẢN QUY CHUẨN KỸ THUẬT - PHÁP LUẬT" : "VAN BAN QUY CHUAN KY THUAT - PHAP LUAT", 105, 45, { align: "center" });
                        doc.setFontSize(9);
                        doc.setFont(fontFamily, "bolditalic");
                        doc.text(cleanStr(previewingMaterial.title).toUpperCase(), 105, 52, { align: "center" });
                        
                        const finalName = previewingMaterial.fileUrl || "tai_lieu_so_hoa.pdf";
                        downloadPdfBlob(doc, finalName);
                      } catch (e) {
                        console.error(e);
                        alert("Đã xảy ra lỗi khi tạo tài liệu PDF.");
                      }
                    }}
                    className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-blue-400" />
                    Lưu PDF nhanh
                  </button>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-[10px] text-slate-500">
              <p>Trình đọc tối ưu hóa • Nhấn phím để cuộn hoặc tương tác.</p>
              <button
                type="button"
                onClick={() => {
                  setPreviewingMaterial(null);
                  setPreviewSearch('');
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-md cursor-pointer transition-all"
              >
                Đóng văn bản
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
