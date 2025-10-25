export function Footer() {
  return (
    <div className="mt-8 sm:mt-12 text-center">
      <div className="inline-block bg-white/50 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/50">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>🔒</span>
          <span className="text-center">모든 처리가 브라우저에서 이루어져 파일이 외부로 전송되지 않습니다</span>
        </p>
      </div>
    </div>
  );
}