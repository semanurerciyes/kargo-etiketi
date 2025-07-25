"use client";

import React, { useState, useEffect } from "react";

const paperSizes = {
  A4: { width: 210, height: 294 }, // mm
  A5: { width: 148, height: 210 },
};

type Props = {
  partCount: 1 | 2 | 4 | 8 | 12 | 16 | 32;
  paperSize?: keyof typeof paperSizes;
  images: (string | null)[];
  setImages: React.Dispatch<React.SetStateAction<(string | null)[]>>;
};

export default function PaperLayout({
  partCount,
  paperSize = "A4",
  images,
  setImages,
}: Props) {
  const currentSize = paperSizes[paperSize];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isCellEmpty = (i: number) => images[i] === null;

  const getGridDimensions = (count: number): [number, number] => {
    switch (count) {
      case 1: return [1, 1];
      case 2: return [1, 2];
      case 4: return [2, 2];
      case 8: return [2, 4];
      case 12: return [3, 4];
      case 16: return [4, 4];
      case 32: return [4, 8];
      default: return [1, 1];
    }
  };

  const [cols, rows] = getGridDimensions(partCount);
  const cellWidth = currentSize.width / cols;
  const cellHeight = currentSize.height / rows;

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if (
        file &&
        file.type.startsWith("image/") &&
        selectedIndex !== null &&
        isCellEmpty(selectedIndex)
      ) {
        const url = URL.createObjectURL(file);
        setImages((prev) => {
          const updated = [...prev];
          updated[selectedIndex] = url;
          return updated;
        });
      }
    };

    window.addEventListener("paste", handlePaste as EventListener);
    return () => {
      window.removeEventListener("paste", handlePaste as EventListener);
    };
  }, [selectedIndex, setImages]);

  const handleClear = () => {
    if (selectedIndex !== null && images[selectedIndex]) {
      setImages((prev) => {
        const updated = [...prev];
        updated[selectedIndex] = null;
        return updated;
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 print-area">
      {/* Butonlar */}
      <div className="flex gap-4 mb-4 no-print">
        <button
          onClick={handleClear}
          disabled={selectedIndex === null || !images[selectedIndex]}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Temizle
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Yazdır
        </button>
      </div>

      {/* Kağıt Alanı */}
      <div
        id="etiket-pdf"
        className="grid gap-1 bg-white shadow-sm rounded print-area"
        style={{
          width: `${currentSize.width}mm`,
          height: `${currentSize.height}mm`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          border: "1px solid #aaa",
        }}
      >
        {Array.from({ length: partCount }, (_, i) => (
          <div
            key={i}
            onClick={() => setSelectedIndex(i)}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/") && isCellEmpty(i)) {
                const url = URL.createObjectURL(file);
                setImages((prev) => {
                  const updated = [...prev];
                  updated[i] = url;
                  return updated;
                });
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            className={`border border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
              selectedIndex === i
                ? "border-blue-500 bg-blue-100"
                : "border-gray-400"
            }`}
            style={{
              width: `${cellWidth}mm`,
              height: `${cellHeight}mm`,
            }}
          >
            {images[i] && (
              <img
                src={images[i] as string}
                alt={`Etiket ${i}`}
                loading="lazy"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
