"use client";
import { Button, SafeImage } from "@/components/ui/";
import { useMangaDetails } from "@/components/overlays/mangaDetails/MangaDetailsContext";
import { ask } from "@/components/overlays/confirm/confirm";
import { Manga } from "@/types/manga.type";
import { useAdminMangaDelete } from "./AdminDeleteMangaContext";

type Props = {
  manga: Manga;
  variant?: "table" | "list";
};

export default function AdminMangaRow({ manga, variant = "table" }: Props) {
  const {
    manga_id,
    title,
    author,
    language,
    cover_image,
    like_count,
    download_timestamp,
  } = manga;
  const date = new Date(download_timestamp).toLocaleDateString();

  const { openManga, manga: selectedManga, closeManga } = useMangaDetails();
  const { deleteManga, deletingIds } = useAdminMangaDelete();

  const selected = selectedManga?.manga_id === manga.manga_id;
  const deleting = deletingIds.has(manga_id);

  const onDeleteManga = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    if (selected) closeManga();
    const res = await ask({
      title: "Confirm Delete Manga",
      description: `Are you sure you want to delete "${title}"?`,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (res) deleteManga(manga_id);
  };

  const handleOpenManga = () => {
    if (deleting || selected) return;
    openManga(manga);
  };

  const cover = (
    <SafeImage
      src={cover_image}
      alt={title}
      className="object-cover rounded-md"
      quality={40}
      width={40}
      height={56}
    />
  );

  const DeleteButton = (
    <Button
      onClick={onDeleteManga}
      variant="danger"
      disabled={deleting}
      className="w-20"
      type="button"
    >
      {deleting ? "Deleting…" : "Delete"}
    </Button>
  );

  return (
    <tr
      onClick={handleOpenManga}
      className={`
        cursor-pointer 
        hover-card focus-ring 
        border-b border-default
        ${selected && "bg-accent"}
      `}
    >
      {variant == "table" ? (
        <>
          {/* ID */}
          <td className="py-2 pr-3 pl-4 text-xs fg-muted font-mono">
            #{manga_id}
          </td>

          {/* Cover */}
          <td className="py-2 pr-3">{cover}</td>

          {/* Title */}
          <td className="py-2 pr-3 fg-primary truncate max-w-65">{title}</td>

          {/* Author — desktop only */}
          <td className="py-2 pr-3 fg-muted truncate hidden lg:table-cell">
            {author || "—"}
          </td>

          {/* Language — desktop only */}
          <td className="py-2 pr-3 fg-muted hidden lg:table-cell">
            {language || "—"}
          </td>

          {/* Likes — desktop only */}
          <td className="py-2 pr-3 text-right fg-muted hidden lg:table-cell">
            {like_count ?? "—"}
          </td>

          {/* Date — desktop only (placeholder for now) */}
          <td className="py-2 pr-3 fg-muted text-xs hidden lg:table-cell">{date}</td>
        </>
      ) : (
        <>
          <td>
            <div className="flex gap-3 p-3">
              {/* Cover */}
              {cover}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="fg-primary text-sm truncate">{title}</div>
                <div className="fg-muted text-xs truncate">{author || "—"}</div>
                <div className="fg-muted text-xs font-mono mt-1">
                  #{manga_id}
                </div>
              </div>
            </div>
          </td>
        </>
      )}
      {/* Action */}
      <td className="py-2 pr-4 text-right">{DeleteButton}</td>
    </tr>
  );
}
