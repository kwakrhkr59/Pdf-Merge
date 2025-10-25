export function DropZone({ idx, isDragOver, handleDragEnter, handleDrop, dragSrcIndex }) {
  const isSelfDrag = dragSrcIndex.current !== null && dragSrcIndex.current === idx;
  const isSelfNextDrag = dragSrcIndex.current !== null && dragSrcIndex.current + 1 === idx;
  
  if (isSelfDrag || isSelfNextDrag) {
    return null;
  }

  return (
    <div className="relative h-0"> 
      <div
        className="absolute inset-x-0 h-10 -top-5 z-10" // h-10과 -top-5를 사용하여 위아래로 20px씩 확장된 판정 영역을 확보
        onDragEnter={() => handleDragEnter(idx)}
        onDragOver={(e) => {
          e.preventDefault();
          handleDragEnter(idx);
        }}
        onDrop={() =>
          handleDrop(
            { type: "drop", srcIdx: dragSrcIndex.current },
            idx
          )
        }
      >
        {isDragOver && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="w-full h-1 bg-blue-500 rounded-full transition-all duration-100 ease-in-out shadow-md"></div>
          </div>
        )}
      </div>
    </div>
  );
}