import React from "react";
import { Shuffle } from "lucide-react";
import { PageListItem } from "../core/PageListItem";
import { DropZone } from "../core/DropZone";

export function PageOrderPanel({
  items,
  selectedIdx,
  setSelectedIdx,
  handlePageAction,
  removePage,
  dragSrcIndex,
  handleDragEnter,
  handleDragLeave,
  dragOverIdx,
}) {
  if (items.length === 0) return null;
  
  const isDragging = dragSrcIndex.current !== null;

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
        {(isDragging || items.length === 0) && (
          <DropZone 
            idx={0} 
            isDragOver={dragOverIdx === 0 && dragSrcIndex.current !== 0} 
            handleDragEnter={handleDragEnter} 
            handleDrop={handlePageAction}
            dragSrcIndex={dragSrcIndex}
          />
        )}

        {items.map((item, idx) => (
          <React.Fragment key={item.id}>
            <PageListItem
              item={item}
              idx={idx}
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
            
            {isDragging && (
              <DropZone 
                idx={idx + 1} 
                isDragOver={dragOverIdx === idx + 1} 
                handleDragEnter={handleDragEnter} 
                handleDrop={handlePageAction}
                dragSrcIndex={dragSrcIndex}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}