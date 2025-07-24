"use client";

import { useState, useEffect } from "react";
import PaperLayout from "../components/PaperLayout";
import ExportButtons from "../components/ExportButtons";

export default function IndexPage() {
  const [partCount, setPartCount] = useState<1 | 2 | 4 | 8 | 12 | 16 | 32>(8);
  const [images, setImages] = useState<(string | null)[]>(Array(partCount).fill(null));

  useEffect(() => {
    setImages(Array(partCount).fill(null));
  }, [partCount]);

  return (
    <main className="flex flex-col items-center p-4">
      <div className="mb-4 no-print">
        <label htmlFor="partCount" className="mr-2 font-semibold">
          Parça Sayısı:
        </label>
        <select
          id="partCount"
          value={partCount}
          onChange={(e) => setPartCount(Number(e.target.value) as 1 | 2 | 4 | 8| 12 | 16 | 32)}
          className="border rounded px-2 py-1"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={12}>12</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
        </select>
      </div>

      <PaperLayout
        partCount={partCount}
        paperSize="A4"
        images={images}
        setImages={setImages}
      />
      <ExportButtons images={images} />
    </main>
  );
}
