import { Trash2, Plus } from "lucide-react";

export function FileItem({ file, onRemove, onDuplicatePages, index }) {
  return (
    <div className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm text-xs sm:text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
            {file.name}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {file.pageCount}개 페이지
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
        <button
          onClick={() => onDuplicatePages(file)}
          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 flex-shrink-0"
          title="페이지 목록에 이 파일의 페이지들을 다시 추가"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => onRemove(file.id)}
          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 flex-shrink-0"
          title="파일 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}