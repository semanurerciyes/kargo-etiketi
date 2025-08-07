"use client";

import React, { useState, useEffect } from "react";

const directionsTR: Record<string, string> = {
  top: "Üst",
  right: "Sağ",
  bottom: "Alt",
  left: "Sol",
};

type Props = {
  partCount: 1 | 2 | 4 | 8 | 12 | 16 | 32;
  images: (string | null)[];
  setImages: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  orientation: "portrait" | "landscape";
  setOrientation: React.Dispatch<React.SetStateAction<"portrait" | "landscape">>;
};

export default function PaperLayout({
  partCount,
  images,
  setImages,
  orientation,
  setOrientation,
}: Props) {
  const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [presets, setPresets] = useState<Record<string, typeof margin>>({});
  const [presetName, setPresetName] = useState("");

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

  const pageWidth = orientation === "portrait" ? 210 : 297;
  const pageHeight = orientation === "portrait" ? 297 : 210;
  const contentWidth = pageWidth - margin.left - margin.right;
  const contentHeight = pageHeight - margin.top - margin.bottom;
  const cellWidth = contentWidth / cols;
  const cellHeight = contentHeight / rows;

  useEffect(() => {
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(orientation);

    const saved = localStorage.getItem("margin-presets");
    if (saved) setPresets(JSON.parse(saved));

    const handlePaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if (file && file.type.startsWith("image/") && selectedIndex !== null && images[selectedIndex] === null) {
        const url = URL.createObjectURL(file);
        setImages((prev) => {
          const updated = [...prev];
          updated[selectedIndex] = url;
          return updated;
        });
      }
    };

    window.addEventListener("paste", handlePaste as EventListener);
    return () => window.removeEventListener("paste", handlePaste as EventListener);
  }, [orientation, selectedIndex, setImages, images]);

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

  const saveCurrentMarginAsPreset = (name: string) => {
    const newPresets = { ...presets, [name]: margin };
    setPresets(newPresets);
    localStorage.setItem("margin-presets", JSON.stringify(newPresets));
  };

  const deletePreset = (name: string) => {
    const { [name]: _, ...rest } = presets;
    setPresets(rest);
    localStorage.setItem("margin-presets", JSON.stringify(rest));
  };

  return (
    <div className="p-4 print-area">
      {/* Ayar Paneli */}
      <div className="mb-4 space-y-4 no-print">
        <div className="flex gap-4">
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

        {/* Hazır Margin Ayarları */}
        <div className="flex items-center gap-2 flex-wrap">
          <label>
            Hazır Boşluk Ayarı:
            <select
              className="ml-2 border p-1"
              onChange={(e) => {
                const selected = presets[e.target.value];
                if (selected) setMargin(selected);
              }}
            >
              <option value="">Seç</option>
              {Object.keys(presets).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              const name = prompt("Silmek istediğiniz ayarın adını girin:");
              if (name && presets[name]) deletePreset(name);
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded"
          >
            Ayar Sil
          </button>
        </div>

        {/* Yeni Margin Ayarı Kaydet */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ayar ismi girin"
            className="border p-1"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button
            onClick={() => {
              if (presetName.trim()) {
                saveCurrentMarginAsPreset(presetName.trim());
                setPresetName("");
              }
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            Kaydet
          </button>
        </div>

        {/* Margin Girişleri */}
        <div className="flex gap-2 flex-wrap">
          {["top", "right", "bottom", "left"].map((side) => (
            <label key={side}>
              {directionsTR[side]} boşluk:
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
          gap: "0mm",
        }}
      >
        {Array.from({ length: partCount }, (_, i) => (
          <div
            key={i}
            onClick={() => setSelectedIndex(i)}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/") && images[i] === null) {
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
