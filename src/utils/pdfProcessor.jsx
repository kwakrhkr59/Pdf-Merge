import { PDFDocument } from "pdf-lib";

/**
 * PDF 파일을 로드하고 페이지 이미지를 추출하여 파일 객체를 반환합니다.
 * @param {File} f - 사용자가 업로드한 파일 객체
 * @param {number} i - 파일 인덱스
 * @returns {Promise<object>} - 처리된 파일 데이터
 */
export const processPdfFile = async (f, i) => {
  const originalAb = await f.arrayBuffer();
  const pdfLibAb = originalAb.slice(0);
  const previewAb = originalAb.slice(0);

  // pdf-lib 문서 로드 (병합용)
  const pdfDoc = await PDFDocument.load(pdfLibAb, {
    ignoreEncryption: true,
  });

  // pdf.js 문서 로드 (미리보기용)
  const pdfJsDoc = await window.pdfjsLib.getDocument({
    data: previewAb,
    verbosity: 0,
  }).promise;
  const pageCount = pdfJsDoc.numPages;

  const pageImages = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    pageImages.push(canvas.toDataURL("image/png"));
  }
  pdfJsDoc.destroy();

  return {
    id: `${Date.now()}-${i}`,
    name: f.name,
    arrayBuffer: originalAb, // 사실 pdfDoc이 있어서 필요 없을 수도 있지만 일단 둠
    pdfDoc,
    pageImages,
    pageCount,
  };
};


/**
 * 페이지 배열을 기반으로 PDF 파일을 병합하고 다운로드합니다.
 * @param {Array<object>} items - 병합할 페이지 정보 배열
 * @param {Array<object>} files - 원본 파일 정보 배열
 * @returns {Promise<void>}
 */
export const mergeAndDownloadPdfs = async (items, files) => {
  const out = await PDFDocument.create();

  for (const item of items) {
    const srcFile = files.find((f) => f.id === item.fileId);
    if (!srcFile) continue;

    // 페이지 복사 및 추가
    const [copiedPage] = await out.copyPages(srcFile.pdfDoc, [item.pageIdx]);
    out.addPage(copiedPage);
  }

  const bytes = await out.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  
  // 다운로드
  const a = document.createElement("a");
  a.href = url;
  a.download = `merged_document_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};