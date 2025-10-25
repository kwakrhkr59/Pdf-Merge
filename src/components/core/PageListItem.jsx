import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export function PageListItem({
  item,
  idx,
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
  const isDraggingSource = dragSrcIndex.current !== null && dragSrcIndex.current === idx;

  return (
    <div
      key={item.id}
      onClick={() => setSelectedIdx(idx)}
      className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 
        ${selectedIdx === idx
            ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-md"
            : "bg-white hover:bg-slate-50 border-2 border-transparent hover:border-slate-200"
        }
        ${isDraggingSource ? "opacity-30" : "opacity-100"}
      `}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        dragSrcIndex.current = idx;
        const dragImg = new Image(0, 0);
        e.dataTransfer.setDragImage(dragImg, 0, 0);
      }}
      onDragEnter={() => handleDragEnter(idx)}
      onDragLeave={() => handleDragLeave()}
      onDragOver={(e) => {
          e.preventDefault();
          handleDragEnter(idx);
      }}
      onDrop={() =>
        handlePageAction(
          { type: "drop", srcIdx: dragSrcIndex.current },
          idx
        )
      }
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
            selectedIdx === idx
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {idx + 1}
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
          {item.label}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePageAction({ type: "move", dir: -1 }, idx);
          }}
          className="p-1 sm:p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePageAction({ type: "move", dir: 1 }, idx);
          }}
          className="p-1 sm:p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removePage(idx);
          }}
          className="p-1 sm:p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}