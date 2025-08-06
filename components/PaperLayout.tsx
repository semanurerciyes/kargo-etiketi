"use client";

import React, { useState, useEffect } from "react";

const defaultPaperSizes = {
  A4: { width: 210, height: 297 },
  Label: { width: 210, height: 297 },
};

const paperSizeNames: Record<string, string> = {
  A4: "A4",
  Label: "Etiket",
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
  const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // px'den mm'ye dönüşüm (96 DPI standart)
  const pxToMm = (px: number) => (px * 25.4) / 96;

  const isCellEmpty = (i: number) => images[i] === null;

  const getGridDimensions = (count: number): [number, number] => {
    switch (count) {
      case 1: return [1, 1];
      case 2: return [1, 2];
      case 4: return [2, 2];
      case 8: return [2, 4];
      case 12: return [2, 6];
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
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(orientation);

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
  }, [orientation, selectedIndex, setImages]);

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
                if (value === "Label") {
                  setMargin({
                    top: pxToMm(20),
                    right: pxToMm(4),
                    bottom: pxToMm(20),
                    left: pxToMm(4),
                  });
                } else {
                  setMargin({ top: 0, right: 0, bottom: 0, left: 0 });
                }
              }}
            >
              {Object.keys(defaultPaperSizes).map((key) => (
                <option key={key} value={key}>
                  {paperSizeNames[key]}
                </option>
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

      {/* Etiket Alanı */}
      <div
        id="etiket-pdf"
        className="bg-white shadow relative"
        style={{
          width: `${pageWidth}mm`,
          height: `${pageHeight}mm`,
          paddingTop: `${margin.top}mm`,
          paddingRight: `${margin.right}mm`,
          paddingBottom: `${margin.bottom}mm`,
          paddingLeft: `${margin.left}mm`,
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "0mm", // referans çizgisiz tam otursun
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
