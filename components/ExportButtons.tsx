"use client";

import { useState } from "react";

const html2pdf = typeof window !== "undefined" ? require("html2pdf.js") : null;

type Props = {
  images: (string | null)[];
  orientation: "portrait" | "landscape"; // 👈 yeni prop
};

export default function ExportButtons({ images, orientation }: Props) {
  const handlePDFExport = () => {
    if (!html2pdf) {
      alert("PDF oluşturma yalnızca tarayıcıda çalışır.");
      return;
    }

    const element = document.getElementById("etiket-pdf");
    if (!element) {
      alert("PDF çıktısı alınacak alan bulunamadı (etiket-pdf).");
      return;
    }

    html2pdf()
      .from(element)
      .set({
        margin: 0,
        filename: "etiketler.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation }, // 👈 yön bilgisi buraya dinamik geldi
      })
      .save();
  };

  return (
    <div className="flex flex-col gap-2 mt-4 no-print">
      <button
        onClick={handlePDFExport}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        PDF Olarak İndir
      </button>
    </div>
  );
}
