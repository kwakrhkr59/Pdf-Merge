import React, { useRef, useState, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  X,
  Plus,
  Shuffle,
  Zap,
  Github,
} from "lucide-react";

// PDF.js 라이브러리 로드 커스텀 훅
const usePdfjs = () => {
  const [isPdfjsLoaded, setIsPdfjsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setIsPdfjsLoaded(true);
    };
    script.onerror = (e) => setLoadError(e);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return { isPdfjsLoaded, loadError };
};

// PDF 페이지 미리보기 컴포넌트
function PDFPagePreview({ imageDataUrl, selectedItem }) {
  if (!imageDataUrl) {
    return (
      <div className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              페이지 미리보기
            </h3>
            <p className="text-sm text-slate-500">
              왼쪽 목록에서 페이지를 선택하면 여기에서 미리볼 수 있어요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {selectedItem?.label}
        </h3>
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-b-2xl p-6 shadow-inner">
        <img
          src={imageDataUrl}
          alt="PDF Page Preview"
          className="max-w-full max-h-full mx-auto block rounded-lg shadow-lg border border-slate-200"
        />
      </div>
    </div>
  );
}

// 파일 아이템 컴포넌트
function FileItem({ file, onRemove, index }) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
          {index + 1}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 truncate text-sm">
            {file.name}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {file.pageCount}개 페이지
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(file.id)}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// 파일 업로드 컴포넌트
function FileUploader({ onFileUpload, busy }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onFileUpload(e);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        dragOver
          ? "border-blue-400 bg-blue-50"
          : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={onFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={busy}
      />
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            PDF 파일을 드래그하거나 클릭하세요
          </h3>
          <p className="text-sm text-slate-500">
            여러 파일을 한 번에 업로드할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}

// PDF 병합 웹 애플리케이션
export default function PDFMiniApp() {
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const dragSrcIndex = useRef(null);
  const { isPdfjsLoaded, loadError } = usePdfjs();

  // PDF 파일을 로드하고 모든 페이지를 이미지로 변환
  const handleFiles = useCallback(
    async (ev) => {
      setError("");
      setBusy(true);
      if (!isPdfjsLoaded) {
        setError("PDF 라이브러리를 로딩 중입니다. 잠시만 기다려주세요...");
        setBusy(false);
        return;
      }

      try {
        const flist = Array.from(ev.target.files || ev.dataTransfer.files);
        const newFilesData = await Promise.all(
          flist.map(async (f, i) => {
            const originalAb = await f.arrayBuffer();
            const pdfLibAb = originalAb.slice(0);
            const previewAb = originalAb.slice(0);

            const pdfDoc = await PDFDocument.load(pdfLibAb, {
              ignoreEncryption: true,
            });
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
              arrayBuffer: originalAb,
              pdfDoc,
              pageImages,
              pageCount,
            };
          })
        );

        setFiles((prevFiles) => [...prevFiles, ...newFilesData]);
        if (selectedIdx === null && newFilesData.length > 0) {
          setSelectedIdx(0);
        }
      } catch (e) {
        console.error(e);
        setError(
          "파일을 불러오는 중 문제가 발생했어요. 파일이 손상되지 않았는지 확인해주세요."
        );
      } finally {
        setBusy(false);
      }
    },
    [isPdfjsLoaded, selectedIdx]
  );

  // 파일 상태가 변경될 때마다 items를 재계산
  useEffect(() => {
    const newItems = files.flatMap((f) =>
      Array.from({ length: f.pageCount }, (_, pageIdx) => ({
        id: `${f.id}-${pageIdx}`,
        fileId: f.id,
        pageIdx,
        label: `${f.name} - ${pageIdx + 1}페이지`,
      }))
    );
    setItems(newItems);
  }, [files]);

  // 페이지 삭제
  const removePage = useCallback(
    (idx) => {
      setItems((prevItems) => {
        const nextItems = prevItems.filter((_, i) => i !== idx);
        const newSelectedIdx =
          selectedIdx === idx
            ? idx > 0
              ? idx - 1
              : null
            : selectedIdx > idx
            ? selectedIdx - 1
            : selectedIdx;

        setSelectedIdx(newSelectedIdx);
        return nextItems;
      });
    },
    [selectedIdx]
  );

  // 파일 삭제
  const removeFile = useCallback((fileIdToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileIdToRemove));
  }, []);

  // PDF 병합 및 다운로드
  const mergeAndDownload = useCallback(async () => {
    if (!items.length || busy) return;
    setBusy(true);
    setError("");
    try {
      const out = await PDFDocument.create();
      for (const item of items) {
        const srcFile = files.find((f) => f.id === item.fileId);
        if (!srcFile) continue;
        const [copiedPage] = await out.copyPages(srcFile.pdfDoc, [
          item.pageIdx,
        ]);
        out.addPage(copiedPage);
      }
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_document_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("병합 중 문제가 발생했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }, [items, files, busy]);

  // 페이지 액션 핸들러
  const handlePageAction = useCallback(
    (action, idx) => {
      setItems((prevItems) => {
        let nextItems = [...prevItems];
        let newSelectedIdx = selectedIdx;

        switch (action.type) {
          case "move":
            const ni = idx + action.dir;
            if (ni < 0 || ni >= nextItems.length) return prevItems;
            const [movedItem] = nextItems.splice(idx, 1);
            nextItems.splice(ni, 0, movedItem);
            if (selectedIdx === idx) newSelectedIdx = ni;
            break;
          case "drop":
            const src = action.srcIdx;
            const dst = idx;
            if (src === null || src === dst) return prevItems;
            const [draggedItem] = nextItems.splice(src, 1);
            nextItems.splice(dst, 0, draggedItem);
            newSelectedIdx =
              selectedIdx === src
                ? dst
                : selectedIdx > src && selectedIdx <= dst
                ? selectedIdx - 1
                : selectedIdx < src && selectedIdx >= dst
                ? selectedIdx + 1
                : selectedIdx;
            break;
          default:
            return prevItems;
        }
        setSelectedIdx(newSelectedIdx);
        return nextItems;
      });
    },
    [selectedIdx]
  );

  const selectedItem =
    selectedIdx !== null && items[selectedIdx] ? items[selectedIdx] : null;
  const selectedFile = selectedItem
    ? files.find((f) => f.id === selectedItem.fileId)
    : null;
  const selectedPageImage = selectedFile
    ? selectedFile.pageImages[selectedItem.pageIdx]
    : null;

  const clearAll = () => {
    setFiles([]);
    setItems([]);
    setError("");
    setSelectedIdx(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  PDF 마스터
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  PDF를 쉽고 빠르게 병합하고 정리하세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/kwakrhkr59/Pdf-Merge"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center w-10 h-10"
                title="GitHub에서 보기"
              >
                <Github className="w-full h-full text-black" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 왼쪽 패널 */}
          <div className="xl:col-span-2 space-y-8">
            {/* 파일 업로드 섹션 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">파일 추가</h2>
              </div>

              {files.length === 0 ? (
                <FileUploader onFileUpload={handleFiles} busy={busy} />
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {files.map((file, index) => (
                      <FileItem
                        key={file.id}
                        file={file}
                        onRemove={removeFile}
                        index={index}
                      />
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <FileUploader onFileUpload={handleFiles} busy={busy} />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                      모두 삭제
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* 페이지 순서 섹션 */}
            {items.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-800">
                      페이지 순서 ({items.length}개)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    드래그로 순서 변경
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                        selectedIdx === idx
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-md"
                          : "bg-white hover:bg-slate-50 border-2 border-transparent hover:border-slate-200"
                      }`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        dragSrcIndex.current = idx;
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() =>
                        handlePageAction(
                          { type: "drop", srcIdx: dragSrcIndex.current },
                          idx
                        )
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                            selectedIdx === idx
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePageAction({ type: "move", dir: -1 }, idx);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePageAction({ type: "move", dir: 1 }, idx);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePage(idx);
                          }}
                          className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 패널 - 미리보기 */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sticky top-32">
              <PDFPagePreview
                imageDataUrl={selectedPageImage}
                selectedItem={selectedItem}
              />

              {items.length > 0 && selectedIdx !== null && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      setSelectedIdx((prev) => Math.max(0, prev - 1))
                    }
                    disabled={selectedIdx === 0}
                    className="flex-1 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setSelectedIdx((prev) =>
                        Math.min(items.length - 1, prev + 1)
                      )
                    }
                    disabled={selectedIdx === items.length - 1}
                    className="flex-1 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 병합 버튼 */}
        {items.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <button
                onClick={mergeAndDownload}
                disabled={busy}
                className="w-full p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    병합 처리 중...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    {items.length}개 페이지 병합 & 다운로드
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/50">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>🔒</span>
              모든 처리가 브라우저에서 이루어져 파일이 외부로 전송되지 않습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
