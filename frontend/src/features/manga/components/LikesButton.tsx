"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  mangaId: string | number;
  initialCount: number;
}

export default function LikeButton({ mangaId, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  async function toggleLike() {
    setCount((c) => (liked ? c - 1 : c + 1));
    setLiked(!liked);
  }

  return (
    <button
      onClick={toggleLike}
      className="
        flex items-center gap-2
        text-sm
        fg-muted
      "
    >
      <div
        className={`
          border border-default
          rounded-full
          p-2
          ${liked ? "bg-red-800 fill-(--text-primary)!" : ""}
        `}
      >
        <Heart
          className={
            liked ? "fill-(--text-primary) stroke-(--text-primary)" : ""
          }
          size={18}
        />
      </div>
      {count}
    </button>
  );
}
