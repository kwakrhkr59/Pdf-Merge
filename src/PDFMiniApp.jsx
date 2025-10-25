import React, { useRef, useState, useEffect, useCallback } from "react";
import { usePdfjs } from "./hooks/usePdfjs";
import { processPdfFile, mergeAndDownloadPdfs } from "./utils/pdfProcessor";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { FilePanel } from "./components/panels/FilePanel";
import { PageOrderPanel } from "./components/panels/PageOrderPanel";
import { PreviewPanel } from "./components/panels/PreviewPanel";
import { MergePanel } from "./components/panels/MergePanel";

// PDF 병합 웹 애플리케이션
export default function PDFMiniApp() {
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]); // 병합할 페이지 순서
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null); // 미리보기 선택 페이지 인덱스
  const dragSrcIndex = useRef(null);
  const dragOverTimeout = useRef(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const { isPdfjsLoaded, loadError } = usePdfjs();

  // PDF 파일 업로드 및 로딩 처리
  const handleFiles = useCallback(
    async (ev) => {
      setError("");
      setBusy(true);

      if (loadError) {
        setError("PDF 라이브러리 로드 오류. 새로고침 후 다시 시도해주세요.");
        setBusy(false);
        return;
      }
      if (!isPdfjsLoaded) {
        setError("PDF 라이브러리를 로딩 중입니다. 잠시만 기다려주세요...");
        setBusy(false);
        return;
      }

      try {
        const flist = Array.from(ev.target.files || ev.dataTransfer.files);
        const newFilesData = await Promise.all(
          flist.map(processPdfFile)
        );

        setFiles((prevFiles) => [...prevFiles, ...newFilesData]);

        setItems((prevItems) => {
          const newPages = newFilesData.flatMap((f) =>
            Array.from({ length: f.pageCount }, (_, pageIdx) => ({
              id: `${f.id}-${pageIdx}`,
              fileId: f.id,
              pageIdx,
              label: `${f.name} - ${pageIdx + 1}페이지`,
            }))
          );
          return [...prevItems, ...newPages];
        });

        if (selectedIdx === null && newFilesData.length > 0) {
          setSelectedIdx(items.length > 0 ? items.length : 0);
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
    [isPdfjsLoaded, loadError, selectedIdx, items.length]
  );

  // 페이지 삭제
  const removePage = useCallback(
    (idx) => {
        setItems((prevItems) => {
            const itemToRemove = prevItems[idx];
            if (!itemToRemove) return prevItems;

            const fileId = itemToRemove.fileId;
            const nextItems = prevItems.filter((_, i) => i !== idx);

            // 1. items에서 해당 파일의 남은 페이지 확인
            const remainingPages = nextItems.filter((item) => item.fileId === fileId);

            if (remainingPages.length === 0) {
                // 2. 남은 페이지가 없으면 files 목록에서 해당 파일 삭제 👈 추가된 로직
                setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
            }

            // 3. 선택 인덱스 조정 (기존 로직 유지)
            const newSelectedIdx =
                selectedIdx === idx
                    ? idx > 0
                        ? idx - 1
                        : nextItems.length > 0 ? 0 : null
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
  const removeFile = useCallback(
    (fileIdToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileIdToRemove));

        setItems((prevItems) => {
            const nextItems = prevItems.filter((item) => item.fileId !== fileIdToRemove);
            
            if (selectedIdx !== null) {
                const isSelectedFileRemoved = prevItems[selectedIdx]?.fileId === fileIdToRemove;
                if (isSelectedFileRemoved) {
                    setSelectedIdx(nextItems.length > 0 ? 0 : null);
                } else if (selectedIdx >= nextItems.length) {
                    setSelectedIdx(nextItems.length > 0 ? nextItems.length - 1 : null);
                }
            }
            
            return nextItems;
        });
    },
    [selectedIdx]
);

  // 모두 지우기
  const clearAll = useCallback(() => {
    setFiles([]);
    setError("");
    setSelectedIdx(null);
  }, []);

  // 파일 페이지 복제 및 추가
  const duplicateFilePages = useCallback(
      (fileToDuplicate) => {
          const newPages = Array.from({ length: fileToDuplicate.pageCount }, (_, pageIdx) => ({
              id: `${fileToDuplicate.id}-${pageIdx}-${Date.now()}-${Math.random()}`,
              fileId: fileToDuplicate.id,
              pageIdx,
              label: `${fileToDuplicate.name} - ${pageIdx + 1}페이지 (복제)`,
          }));

          setItems((prevItems) => [...prevItems, ...newPages]);
          
          setSelectedIdx((prevSelectedIdx) => {
              const newIndex = items.length;
              return newIndex;
          });

      },
      [items.length]
  );

  // PDF 병합 및 다운로드
  const handleMergeAndDownload = useCallback(async () => {
    if (!items.length || busy) return;
    setBusy(true);
    setError("");
    try {
      await mergeAndDownloadPdfs(items, files);
    } catch (e) {
      console.error(e);
      setError("병합 중 문제가 발생했어요. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }, [items, files, busy]);

  // 드래그가 아이템 위로 진입할 때
    const handleDragEnter = useCallback((idx) => {
        if (dragOverTimeout.current) {
            clearTimeout(dragOverTimeout.current);
        }
        setDragOverIdx(idx);
    }, []);

    // 드래그가 아이템 밖으로 나갈 때 (지연 시간을 두어 깜빡임 방지)
    const handleDragLeave = useCallback(() => {
        if (dragOverTimeout.current) {
            clearTimeout(dragOverTimeout.current);
        }
        dragOverTimeout.current = setTimeout(() => {
            setDragOverIdx(null);
        }, 50);
    }, []);

  // 페이지 이동 및 드래그 앤 드롭 처리
  const handlePageAction = useCallback(
    (action, idx) => {
      setItems((prevItems) => {
        let nextItems = [...prevItems];
        let newSelectedIdx = selectedIdx;

        switch (action.type) {
          case "move": {
            const ni = idx + action.dir;
            if (ni < 0 || ni >= nextItems.length) return prevItems;
            const [movedItem] = nextItems.splice(idx, 1);
            nextItems.splice(ni, 0, movedItem);
            if (selectedIdx === idx) newSelectedIdx = ni;
            break;
          }
          case "drop": {
            const src = action.srcIdx;
            const dst = idx;
            if (src === null || src === dst) return prevItems;
            const [draggedItem] = nextItems.splice(src, 1);
            nextItems.splice(dst, 0, draggedItem);
            
            // 선택된 페이지의 인덱스 조정 로직
            newSelectedIdx =
              selectedIdx === src
                ? dst
                : selectedIdx > src && selectedIdx <= dst
                  ? selectedIdx - 1
                  : selectedIdx < src && selectedIdx >= dst
                    ? selectedIdx + 1
                    : selectedIdx;
            
            dragSrcIndex.current = null;
            setDragOverIdx(null); 
            break;
          }
          default:
            return prevItems;
        }

        setSelectedIdx(newSelectedIdx);
        return nextItems;
      });
    },
    [selectedIdx, dragSrcIndex, setDragOverIdx]
  );
  
  // 미리보기에 필요한 데이터 계산
  const selectedItem =
    selectedIdx !== null && items[selectedIdx] ? items[selectedIdx] : null;
  const selectedFile = selectedItem
    ? files.find((f) => f.id === selectedItem.fileId)
    : null;
  const selectedPageImage = selectedFile
    ? selectedFile.pageImages[selectedItem.pageIdx]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* 왼쪽 패널 그룹 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            <FilePanel
              files={files}
              busy={busy}
              error={error}
              onFileUpload={handleFiles}
              onRemoveFile={removeFile}
              onClearAll={clearAll}
              onDuplicatePages={duplicateFilePages}
            />
            <PageOrderPanel
              items={items}
              selectedIdx={selectedIdx}
              setSelectedIdx={setSelectedIdx}
              handlePageAction={handlePageAction}
              removePage={removePage}
              dragSrcIndex={dragSrcIndex}
              handleDragEnter={handleDragEnter}
              handleDragLeave={handleDragLeave}
              dragOverIdx={dragOverIdx}
            />
          </div>

          {/* 오른쪽 패널 - 미리보기 */}
          <div className="lg:col-span-1">
            <PreviewPanel
              selectedPageImage={selectedPageImage}
              selectedItem={selectedItem}
              selectedIdx={selectedIdx}
              items={items}
              setSelectedIdx={setSelectedIdx}
            />
          </div>
        </div>
        
        <MergePanel
          items={items}
          busy={busy}
          onMergeAndDownload={handleMergeAndDownload}
        />
        
        <Footer />
      </div>
    </div>
  );
}