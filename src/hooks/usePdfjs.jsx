import { useState, useEffect } from "react";

/**
 * PDF.js 라이브러리를 동적으로 로드하는 커스텀 훅
 * @returns {{isPdfjsLoaded: boolean, loadError: Error|null}}
 */
export const usePdfjs = () => {
  const [isPdfjsLoaded, setIsPdfjsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    
    const onLoad = () => {
      // PDF.js 워커 설정
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setIsPdfjsLoaded(true);
      } else {
         setLoadError(new Error("PDF.js 라이브러리가 로드되지 않았습니다."));
      }
    };

    const onError = (e) => setLoadError(e);
    
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return { isPdfjsLoaded, loadError };
};