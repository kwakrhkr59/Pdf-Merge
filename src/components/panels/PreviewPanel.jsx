import React from "react";
import { PDFPagePreview } from "../core/PDFPagePreview";

export function PreviewPanel({ selectedPageImage, selectedItem, selectedIdx, items, setSelectedIdx }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-3 sm:p-6 sticky top-4 sm:top-32">
      <PDFPagePreview
        imageDataUrl={selectedPageImage}
        selectedItem={selectedItem}
      />

      {items.length > 0 && selectedIdx !== null && (
        <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
          <button
            onClick={() =>
              setSelectedIdx((prev) => Math.max(0, prev - 1))
            }
            disabled={selectedIdx === 0}
            className="flex-1 p-2 sm:p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
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
            className="flex-1 p-2 sm:p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}