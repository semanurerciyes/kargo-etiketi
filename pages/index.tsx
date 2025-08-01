"use client";

import { useState, useEffect } from "react";
import PaperLayout from "../components/PaperLayout";
import ExportButtons from "../components/ExportButtons";

export default function IndexPage() {
  const [partCount, setPartCount] = useState<1 | 2 | 4 | 8 | 12 | 16 | 32>(8);
  const [images, setImages] = useState<(string | null)[]>(Array(partCount).fill(null));
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  // partCount değişince images sıfırlanır
  useEffect(() => {
    setImages(Array(partCount).fill(null));
  }, [partCount]);

  // body class'ını güncelle (CSS görsel düzen için)
  useEffect(() => {
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(orientation);
  }, [orientation]);

  // @page yönünü dinamik olarak head içine ekle (PDF önizleme ve çıktı için şart)
  useEffect(() => {
    const oldStyle = document.getElementById("dynamic-page-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "dynamic-page-style";
    style.innerHTML = `
      @page {
        size: A4 ${orientation};
        margin: 0;
      }
    `;
    document.head.appendChild(style);
  }, [orientation]);

  return (
    <main className="flex flex-col items-center p-4">
      {/* Parça sayısı seçimi */}
      <div className="mb-4 no-print">
        <label htmlFor="partCount" className="mr-2 font-semibold">
          Parça Sayısı:
        </label>
        <select
          id="partCount"
          value={partCount}
          onChange={(e) =>
            setPartCount(Number(e.target.value) as 1 | 2 | 4 | 8 | 12 | 16 | 32)
          }
          className="border rounded px-2 py-1"
        >
          {[1, 2, 4, 8, 12, 16, 32].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>

      {/* Yön seçimi */}
      <div className="mb-4 no-print hidden">
        <label htmlFor="orientation" className="mr-2 font-semibold">
          Sayfa Yönü:
        </label>
        <select
          id="orientation"
          value={orientation}
          onChange={(e) =>
            setOrientation(e.target.value as "portrait" | "landscape")
          }
          className="border rounded px-2 py-1"
        >
          <option value="portrait">Dikey</option>
          <option value="landscape">Yatay</option>
        </select>
      </div>

      {/* Kağıt yerleşimi */}
      <PaperLayout
        partCount={partCount}
        paperSize="A4"
        images={images}
        setImages={setImages}
        orientation={orientation}
        setOrientation={setOrientation}
      />

      {/* PDF butonu */}
      <ExportButtons images={images} orientation={orientation} />
    </main>
  );
}
