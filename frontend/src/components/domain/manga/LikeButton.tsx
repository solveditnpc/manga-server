"use client";
import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import { delay } from "@/_mock/mockPromise";

interface LikeButtonProps {
  mangaId: string | number;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({
  mangaId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  // internal control state (not for rendering)
  const desiredLikedRef = useRef(initialLiked);
  const pendingRef = useRef(false);

  function toggle() {
    const nextLiked = !desiredLikedRef.current;
    desiredLikedRef.current = nextLiked;
    // optimistic UI
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    sync();
  }

  async function sync() {
    // only request at a time
    if (pendingRef.current) return;

    let sentLiked = desiredLikedRef.current;

    pendingRef.current = true;

    try {
      await delay(800);
      console.log("set liked as :" , sentLiked);
      
    } catch {
      // rollback to last known good state
      const rollback = !sentLiked;
      desiredLikedRef.current = rollback;
      setLiked(rollback);
      setCount((c) => c + (rollback ? 1 : -1));
      sentLiked = rollback;

    } finally {
      pendingRef.current = false;

      // intent changed while request was in flight
      if (desiredLikedRef.current !== sentLiked) {
        sync();
      }
    }
  }

  return (
    <button
      onClick={toggle}
      className="
        flex items-center gap-2
        text-sm fg-muted cursor-pointer
        hover:fg-primary
      "
    >
      <div
        className={`
          border rounded-full p-2
          ${
            liked
              ? "bg-rose-800 fill-primary! border-rose-800"
              : "border-default"
          }
        `}
      >
        <Heart
          className={liked ? "fill-primary stroke-primary" : ""}
          size={18}
        />
      </div>
      {count}
    </button>
  );
}
