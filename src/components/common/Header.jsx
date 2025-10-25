import React from "react";
import { Zap, Github } from "lucide-react";

export function Header() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                PDF 마스터
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 hidden sm:block">
                PDF를 쉽고 빠르게 병합하고 정리하세요
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <a
              href="https://github.com/kwakrhkr59/Pdf-Merge"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
              title="GitHub에서 보기"
            >
              <Github className="w-4 h-4 sm:w-full sm:h-full text-black" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}