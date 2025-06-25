// /components/VideoModal.tsx
'use client';
import React from 'react';

interface Props {
  setShowVideoAction: (val: boolean) => void;
}

export default function VideoModal({ setShowVideoAction }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-30 flex items-center justify-center"
      onClick={() => setShowVideoAction(false)}
    >
      <div
        className="bg-black w-11/12 md:w-2/3 lg:w-1/2 h-2/3 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-white text-xl"
          onClick={() => setShowVideoAction(false)}
        >
          ✕
        </button>
        <video controls className="w-full h-full">
          <source src="/demo-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
