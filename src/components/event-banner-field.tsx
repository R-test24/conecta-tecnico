"use client";

import { useRef, useState } from "react";
import { readEventBanner } from "@/lib/event-banner";
import { Photo } from "./photo";

export function EventBannerField() {
  const request = useRef(0);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState("");

  async function update(file: File | null) {
    const current = ++request.current;
    setError("");
    setPreview(undefined);
    try {
      const banner = await readEventBanner(file);
      if (request.current === current) setPreview(banner);
    } catch (problem) {
      if (request.current === current) {
        setError(problem instanceof Error ? problem.message : "Não foi possível carregar a foto.");
      }
    }
  }

  return <div className="stack">
    <label className="field">
      Foto do banner (opcional)
      <input name="image" type="file" accept="image/jpeg,image/png,image/webp"
        onChange={event => void update(event.currentTarget.files?.[0] ?? null)}/>
      <small className="muted">JPG, PNG ou WebP de até 5 MB. Para um melhor recorte, use uma foto horizontal.</small>
    </label>
    {error && <p className="error" role="alert">{error}</p>}
    {preview && <div className="event-banner-preview"><Photo image={preview}/></div>}
  </div>;
}
