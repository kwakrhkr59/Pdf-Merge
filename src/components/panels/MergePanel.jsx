import { Download } from "lucide-react";

export function MergePanel({ items, busy, onMergeAndDownload }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8">
        <button
          onClick={onMergeAndDownload}
          disabled={busy}
          className="w-full p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base sm:text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
        >
          {busy ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">병합 처리 중...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{items.length}개 페이지 병합 & 다운로드</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}