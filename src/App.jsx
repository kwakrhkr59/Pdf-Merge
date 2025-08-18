import React, { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

// Single-file mini app: merge, concatenate, and reorder PDF pages entirely in the browser.
// Dependencies: pdf-lib (already available in this environment). Tailwind classes for styling.
// How it works:
// 1) Upload one or more PDFs. We read them into ArrayBuffers and quickly parse page counts.
// 2) We create a flat list of pages ("items"). You can drag to reorder, or remove pages.
// 3) Click "Merge & Download" to generate a new PDF with the chosen order.

export default function PDFMiniApp() {
  const [files, setFiles] = useState([]); // { name, arrayBuffer, pdfDoc, pageCount }
  const [items, setItems] = useState([]); // flat list of { id, fileIdx, pageIdx, label }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dragSrcIndex = useRef(null);

  const handleFiles = async (ev) => {
    setError("");
    setBusy(true);
    try {
      const flist = Array.from(ev.target.files || []);
      const loaded = [];
      for (let f of flist) {
        const ab = await f.arrayBuffer();
        const pdf = await PDFDocument.load(ab, { ignoreEncryption: true });
        loaded.push({
          name: f.name,
          arrayBuffer: ab,
          pdfDoc: pdf,
          pageCount: pdf.getPageCount(),
        });
      }
      setFiles(loaded);
      // Build flat page list
      const newItems = [];
      let id = 0;
      loaded.forEach((f, fi) => {
        for (let pi = 0; pi < f.pageCount; pi++) {
          newItems.push({
            id: `${fi}-${pi}-${id++}`,
            fileIdx: fi,
            pageIdx: pi,
            label: `${f.name} – p.${pi + 1}`,
          });
        }
      });
      setItems(newItems);
    } catch (e) {
      console.error(e);
      setError(
        "PDF 로딩 중 오류가 발생했습니다. 비암호화된 표준 PDF인지 확인해 주세요."
      );
    } finally {
      setBusy(false);
    }
  };

  const onDragStart = (idx) => (e) => {
    dragSrcIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (idx) => (e) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    if (src === null || src === idx) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(src, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    dragSrcIndex.current = null;
  };

  const move = (idx, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const ni = idx + dir;
      if (ni < 0 || ni >= next.length) return prev;
      const [m] = next.splice(idx, 1);
      next.splice(ni, 0, m);
      return next;
    });
  };

  const removeAt = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setFiles([]);
    setItems([]);
    setError("");
  };

  const mergeAndDownload = async () => {
    if (!items.length || !files.length) return;
    setBusy(true);
    setError("");
    try {
      // Ensure we have PDFDocument objects for sources
      // (already parsed in files[])
      const out = await PDFDocument.create();
      for (const it of items) {
        const src = files[it.fileIdx];
        // pdf-lib requires copyPages from a PDFDocument instance
        const copied = await out.copyPages(src.pdfDoc, [it.pageIdx]);
        out.addPage(copied[0]);
      }
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("병합 중 오류가 발생했습니다. 파일을 다시 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">
            PDF 병합 · 연결 · 페이지 순서 변경
          </h1>
          <p className="text-sm mt-2">
            모든 처리는 브라우저 내에서 이루어져 개인 정보가 서버에 전송되지
            않습니다.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <label className="block text-sm font-medium mb-2">
            PDF 파일 업로드 (여러 개 선택 가능)
          </label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFiles}
            className="block w-full"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={clearAll}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              초기화
            </button>
            <button
              onClick={mergeAndDownload}
              disabled={!items.length || busy}
              className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50"
            >
              {busy ? "처리 중…" : "Merge & Download"}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">페이지 목록 ({items.length})</h2>
            <span className="text-xs text-gray-500">
              드래그 앤 드롭으로 순서 변경 가능
            </span>
          </div>
          {!items.length && (
            <p className="text-sm text-gray-500">
              PDF를 업로드하면 각 페이지가 아래 목록에 나타납니다.
            </p>
          )}
          <ul className="divide-y">
            {items.map((it, idx) => (
              <li
                key={it.id}
                className="flex items-center justify-between py-2 cursor-move select-none"
                draggable
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver}
                onDrop={onDrop(idx)}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-gray-100">
                    {idx + 1}
                  </span>
                  <span className="text-sm">{it.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => move(idx, -1)}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    위로
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    아래로
                  </button>
                  <button
                    onClick={() => removeAt(idx)}
                    className="text-xs px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="text-xs text-gray-500 mt-6">
          <p>
            ⚠️ 암호화된 PDF는 열리지 않을 수 있습니다. 가능하면 비밀번호를
            제거한 후 사용하세요.
          </p>
        </footer>
      </div>
    </div>
  );
}
