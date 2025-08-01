"use client";

import React, { useState, useEffect } from "react";

const defaultPaperSizes = {
  A4: { width: 210, height: 294 },
  A5: { width: 148, height: 210 },
  Label: { width: 100, height: 150 },
};

type Props = {
  partCount: 1 | 2 | 4 | 8 | 12 | 16 | 32;
  paperSize?: keyof typeof defaultPaperSizes;
  images: (string | null)[];
  setImages: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  orientation: "portrait" | "landscape";
  setOrientation: React.Dispatch<React.SetStateAction<"portrait" | "landscape">>;
};

export default function PaperLayout({
  partCount,
  paperSize = "A4",
  images,
  setImages,
  orientation,
  setOrientation,
}: Props) {
  const [selectedPaperSize, setSelectedPaperSize] = useState<keyof typeof defaultPaperSizes>(paperSize);
  const [customSize, setCustomSize] = useState(defaultPaperSizes[paperSize]);
  const [margin, setMargin] = useState({ top: 10, right: 10, bottom: 10, left: 10 });
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
  const sizeFromSelection = defaultPaperSizes[selectedPaperSize] || customSize;
  const pageWidth = orientation === "portrait" ? sizeFromSelection.width : sizeFromSelection.height;
  const pageHeight = orientation === "portrait" ? sizeFromSelection.height : sizeFromSelection.width;
  const contentWidth = pageWidth - margin.left - margin.right;
  const contentHeight = pageHeight - margin.top - margin.bottom;
  const cellWidth = contentWidth / cols;
  const cellHeight = contentHeight / rows;

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if (file && file.type.startsWith("image/") && selectedIndex !== null && isCellEmpty(selectedIndex)) {
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
    if (orientation === "landscape") {
      document.body.classList.add("print-landscape");
    } else {
      document.body.classList.remove("print-landscape");
    }

    window.print();

    setTimeout(() => {
      document.body.classList.remove("print-landscape");
    }, 1000);
  };

  return (
    <div className="p-4 print-area">
      {/* Ayar Paneli */}
      <div className="mb-4 space-y-2 no-print">
        <div className="flex gap-4">
          <label>
            Sayfa Türü:
            <select
              className="ml-2 border p-1"
              value={selectedPaperSize}
              onChange={(e) => {
                const value = e.target.value as keyof typeof defaultPaperSizes;
                setSelectedPaperSize(value);
                setCustomSize(defaultPaperSizes[value]);
              }}
            >
              {Object.keys(defaultPaperSizes).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </label>

          <label>
            Yön:
            <select
              className="ml-2 border p-1"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}
            >
              <option value="portrait">Dikey</option>
              <option value="landscape">Yatay</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["top", "right", "bottom", "left"].map((side) => (
            <label key={side}>
              {side.toUpperCase()} boşluk:
              <input
                type="number"
                className="ml-1 border p-1 w-16"
                value={margin[side as keyof typeof margin]}
                onChange={(e) =>
                  setMargin((prev) => ({
                    ...prev,
                    [side]: parseInt(e.target.value) || 0,
                  }))
                }
              />{" "}
              mm
            </label>
          ))}
        </div>
      </div>

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
        className="bg-white shadow rounded relative"
        style={{
          width: `${pageWidth}mm`,
          height: `${pageHeight}mm`,
          paddingTop: `${margin.top}mm`,
          paddingRight: `${margin.right}mm`,
          paddingBottom: `${margin.bottom}mm`,
          paddingLeft: `${margin.left}mm`,
          boxSizing: "border-box",
          border: "1px solid #aaa",
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "1mm",
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
            className={`border border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden reference-cell ${
              selectedIndex === i ? "border-blue-500 bg-blue-100" : "border-gray-400"
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
