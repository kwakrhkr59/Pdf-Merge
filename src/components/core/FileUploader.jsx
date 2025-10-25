import React, { useState } from "react";
import { Upload } from "lucide-react";

export function FileUploader({ onFileUpload, busy }) {
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
      className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-8 text-center transition-all duration-300 ${
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
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2">
            PDF 파일을 드래그하거나 클릭하세요
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            여러 파일을 한 번에 업로드할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}