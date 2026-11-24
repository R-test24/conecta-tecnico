"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { photographs } from "@/lib/catalog";

export function Photo({ image, priority = false }: { image: string; priority?: boolean }) {
  const [error, setError] = useState(false);
  return <div className="photo">{error ? <span className="photo-fallback" role="img" aria-label={photographs[image]}><ImageIcon size={32}/></span> : <Image src={image.startsWith("data:") ? image : "/images/" + image + ".jpg"} alt={photographs[image] ?? "Capa do evento"} fill preload={priority} sizes={priority ? "(max-width: 780px) 100vw, 52vw" : "(max-width: 650px) 100vw, (max-width: 950px) 50vw, 380px"} onError={() => setError(true)}/>}</div>;
}
