"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

function isVideoUrl(url = "") {
  return /\.(mp4|webm|ogg|mov|avi|m4v)(\?.*)?$/i.test(url) || /video/i.test(url);
}

export function MediaGallery({ media = [], title = "Property media" }) {
  const slides = useMemo(() => (Array.isArray(media) ? media.filter(Boolean) : []), [media]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!isFullScreen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsFullScreen(false);
      if (event.key === "ArrowRight") setCurrentIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
      if (event.key === "ArrowLeft") setCurrentIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullScreen, slides.length]);

  if (!slides.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-[#c6c6cc] bg-[#e5e2e3] text-[#76777d]">
        No media available
      </div>
    );
  }

  const currentMedia = slides[currentIndex];
  const goToPrevious = () => setCurrentIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  const goToNext = () => setCurrentIndex((current) => (current === slides.length - 1 ? 0 : current + 1));

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-[#c6c6cc] bg-white shadow-sm">
        <button
          className="relative block aspect-[16/10] w-full overflow-hidden bg-[#f6f3f4] text-left"
          onClick={() => setIsFullScreen(true)}
          type="button"
        >
          {isVideoUrl(currentMedia) ? (
            <video
              key={currentMedia}
              className="h-full w-full object-cover"
              controls
              src={currentMedia}
            />
          ) : (
            <img
              alt={`${title} ${currentIndex + 1}`}
              className="h-full w-full object-cover"
              src={currentMedia}
            />
          )}
          {isVideoUrl(currentMedia) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white">
                <Play size={20} fill="currentColor" />
              </span>
            </div>
          )}
        </button>

        {slides.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1b1b1d] shadow-sm hover:bg-white"
              onClick={(event) => {
                event.stopPropagation();
                goToPrevious();
              }}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1b1b1d] shadow-sm hover:bg-white"
              onClick={(event) => {
                event.stopPropagation();
                goToNext();
              }}
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {slides.map((slide, index) => (
            <button
              className={`overflow-hidden rounded-lg border ${index === currentIndex ? "border-[#0453cd]" : "border-[#c6c6cc]"}`}
              key={`${slide}-${index}`}
              onClick={() => {
                setCurrentIndex(index);
                setIsFullScreen(true);
              }}
              type="button"
            >
              {isVideoUrl(slide) ? (
                <div className="relative aspect-video bg-[#e5e2e3]">
                  <video className="h-full w-full object-cover" src={slide} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="text-white" size={16} />
                  </span>
                </div>
              ) : (
                <img alt={`${title} thumb ${index + 1}`} className="aspect-video w-full object-cover" src={slide} />
              )}
            </button>
          ))}
        </div>
      )}

      {isFullScreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8" onClick={() => setIsFullScreen(false)}>
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button
              aria-label="Close full screen view"
              className="absolute -right-2 -top-12 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1b1b1d] shadow-lg hover:bg-white"
              onClick={() => setIsFullScreen(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="relative overflow-hidden rounded-2xl bg-black">
              <button
                aria-label="Previous media"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#1b1b1d] shadow-md hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                type="button"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex aspect-[16/10] w-full items-center justify-center bg-[#111827]">
                {isVideoUrl(currentMedia) ? (
                  <video className="h-full w-full object-contain" controls src={currentMedia} />
                ) : (
                  <img alt={`${title} full view`} className="h-full w-full object-contain" src={currentMedia} />
                )}
              </div>

              <button
                aria-label="Next media"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#1b1b1d] shadow-md hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNext();
                }}
                type="button"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
