"use client";

import { useState, useEffect } from "react";

export default function Translator() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setTranslated("");
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang }),
        });

        const data = await res.json();
        if (data.error) {
          setTranslated("Çeviri yapılamadı: " + data.error);
        } else {
          setTranslated(data.translatedText);
        }
      } catch (err) {
        console.error(err);
        setTranslated("Çeviri sırasında hata oluştu");
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler); // Temizleme
  }, [text, targetLang]);

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Çeviri Yap</h2>

      <textarea
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        rows={4}
        placeholder="Çevirmek istediğiniz metni yazın..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
      >
        <option value="English">İngilizce</option>
        <option value="German">Almanca</option>
        <option value="French">Fransızca</option>
        <option value="Spanish">İspanyolca</option>
        <option value="Italian">İtalyanca</option>
        <option value="Arabic">Arapça</option>
        <option value="Russian">Rusça</option>
        <option value="Chinese">Çince</option>
      </select>

      {loading && <p>Çeviriliyor...</p>}

      {translated && (
        <div style={{ marginTop: "10px", padding: "8px", border: "1px solid #eee", background: "#f9f9f9" }}>
          <strong>Çeviri:</strong>
          <p>{translated}</p>
        </div>
      )}
    </div>
  );
}
