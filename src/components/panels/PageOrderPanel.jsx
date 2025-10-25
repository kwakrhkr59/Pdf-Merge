import React from "react";
import { Shuffle } from "lucide-react";
import { PageListItem } from "../core/PageListItem";

export function PageOrderPanel({
  items,
  selectedIdx,
  setSelectedIdx,
  handlePageAction,
  removePage,
  dragSrcIndex,
}) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <Shuffle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            페이지 순서 ({items.length}개)
          </h2>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full hidden sm:inline">
          드래그로 순서 변경
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item, idx) => (
          <PageListItem
            key={item.id}
            item={item}
            idx={idx}
            selectedIdx={selectedIdx}
            setSelectedIdx={setSelectedIdx}
            handlePageAction={handlePageAction}
            removePage={removePage}
            dragSrcIndex={dragSrcIndex}
          />
        ))}
      </div>
    </div>
  );
}