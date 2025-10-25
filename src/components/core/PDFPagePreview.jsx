import React from "react";
import { Eye, FileText } from "lucide-react";

export function PDFPagePreview({ imageDataUrl, selectedItem }) {
  if (!imageDataUrl) {
    return (
      <div className="relative border-2 border-dashed rounded-2xl p-4 sm:p-8 text-center transition-all duration-300 border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100">
        <div className="space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2">
              페이지 미리보기
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              왼쪽 목록에서 페이지를 선택하면 여기에서 미리볼 수 있어요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-3 sm:p-4">
        <h3 className="text-white font-medium flex items-center gap-2 text-sm sm:text-base">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{selectedItem?.label}</span>
        </h3>
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-b-2xl p-3 sm:p-6 shadow-inner">
        <img
          src={imageDataUrl}
          alt="PDF Page Preview"
          className="max-w-full max-h-full mx-auto block rounded-lg shadow-lg border border-slate-200"
        />
      </div>
    </div>
  );
}