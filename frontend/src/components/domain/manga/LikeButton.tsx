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
          border
          rounded-full
          p-2
          ${
            liked
              ? "bg-rose-800 fill-primary! border-rose-800"
              : " border-default"
          }
        `}
      >
        <Heart
          className={
            liked ? "fill-primary stroke-primary" : ""
          }
          size={18}
        />
      </div>
      {count}
    </button>
  );
}
