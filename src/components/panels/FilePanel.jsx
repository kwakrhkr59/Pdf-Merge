import React from "react";
import { Plus, X } from "lucide-react";
import { FileUploader } from "../core/FileUploader";
import { FileItem } from "../core/FileItem";

export function FilePanel({ files, busy, error, onFileUpload, onRemoveFile, onClearAll, onDuplicatePages }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">파일 추가</h2>
      </div>

      {files.length === 0 ? (
        <FileUploader onFileUpload={onFileUpload} busy={busy} />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {files.map((file, index) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={onRemoveFile}
                onDuplicatePages={onDuplicatePages}
                index={index}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <FileUploader onFileUpload={onFileUpload} busy={busy} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200 text-sm"
            >
              <X className="w-4 h-4" />
              모두 삭제
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-700 text-xs sm:text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}