import { jsPDF } from 'jspdf';

let cachedRegularFont: string | null = null;
let cachedBoldFont: string | null = null;

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Sanitize filename to prevent special character issues
export function sanitizeFileName(name: string): string {
  if (!name) return 'document.pdf';
  let clean = name.replace(/[/\\?%*:|"<>\s]/g, '_');
  // Remove accents from filename for extra safety on some file systems
  clean = clean
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
  
  if (!clean.toLowerCase().endsWith('.pdf')) {
    clean += '.pdf';
  }
  return clean;
}

// Download raw PDF bytes using secure browser blob download
export function downloadPdfBlob(doc: jsPDF, fileName: string): void {
  const safeName = sanitizeFileName(fileName);
  try {
    const pdfOutput = doc.output('arraybuffer');
    const blob = new Blob([pdfOutput], { type: 'application/pdf' });
    
    if (blob.size === 0) {
      throw new Error("Created PDF blob has 0 bytes");
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeName;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (err) {
    console.error("Error during secure PDF blob download:", err);
    alert("Không thể tải xuống file PDF. Vui lòng thử lại.");
  }
}

// Fetch regular & bold fonts once and cache them
export async function getVietnameseFonts(): Promise<{ regular: string; bold: string } | null> {
  if (cachedRegularFont && cachedBoldFont) {
    return { regular: cachedRegularFont, bold: cachedBoldFont };
  }

  // Stable official Google Fonts GitHub URLs
  const regularUrl = "https://cdn.jsdelivr.net/gh/google/fonts/ofl/roboto/static/Roboto-Regular.ttf";
  const boldUrl = "https://cdn.jsdelivr.net/gh/google/fonts/ofl/roboto/static/Roboto-Bold.ttf";

  try {
    const [regRes, boldRes] = await Promise.all([
      fetch(regularUrl),
      fetch(boldUrl)
    ]);

    if (!regRes.ok || !boldRes.ok) {
      throw new Error("Font fetch failed with status");
    }

    const [regBuf, boldBuf] = await Promise.all([
      regRes.arrayBuffer(),
      boldRes.arrayBuffer()
    ]);

    cachedRegularFont = arrayBufferToBase64(regBuf);
    cachedBoldFont = arrayBufferToBase64(boldBuf);

    return { regular: cachedRegularFont, bold: cachedBoldFont };
  } catch (err) {
    console.warn("Could not download custom Vietnamese fonts from CDN, using fallback fonts", err);
    return null;
  }
}

// Create a configured jsPDF instance with Vietnamese fonts loaded if possible
export async function createVietnameseDoc(): Promise<{ doc: jsPDF; isUnicode: boolean }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  try {
    const fonts = await getVietnameseFonts();
    if (fonts) {
      // Add font files to jsPDF VFS (Virtual File System)
      doc.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
      doc.addFileToVFS("Roboto-Bold.ttf", fonts.bold);
      
      // Register fonts with custom name
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      
      // Set default font to Roboto
      doc.setFont("Roboto", "normal");
      return { doc, isUnicode: true };
    }
  } catch (err) {
    console.error("Failed to register custom fonts in jsPDF:", err);
  }

  // Fallback to standard Helvetica if fonts cannot be loaded
  doc.setFont("Helvetica", "normal");
  return { doc, isUnicode: false };
}

// Helper to remove Vietnamese accents for Helvetica fallback
export function stripAccents(str: string): string {
  if (!str) return "";
  let clean = str;
  clean = clean.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  clean = clean.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  clean = clean.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  clean = clean.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  clean = clean.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  clean = clean.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  clean = clean.replace(/đ/g, "d");
  
  clean = clean.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  clean = clean.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  clean = clean.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  clean = clean.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  clean = clean.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  clean = clean.replace(/Ỳ|Ý|Y|Ỷ|Ỹ/g, "Y");
  clean = clean.replace(/Đ/g, "D");
  
  return clean.replace(/[^\x20-\x7E\n]/g, "");
}
