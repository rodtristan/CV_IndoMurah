"use client";

import { Plus, Pencil, Copy, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GridIconButtonProps {
  icon: LucideIcon;
  color: "green" | "blue" | "red";
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

const colorClasses: Record<GridIconButtonProps["color"], string> = {
  green: "bg-success text-white hover:bg-success/90",
  blue: "bg-info text-white hover:bg-info/90",
  red: "bg-danger text-white hover:bg-danger/90",
};

function GridIconButton({ icon: Icon, color, onClick, disabled, title }: GridIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex size-9 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        colorClasses[color]
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

interface GridActionsProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  disableEdit?: boolean;
  disableCopy?: boolean;
  disableDelete?: boolean;
}

/** The green-add / blue-edit / blue-copy / red-delete icon row seen on every Ketoko.co.id grid page. */
export function GridActions({
  onAdd,
  onEdit,
  onCopy,
  onDelete,
  disableEdit,
  disableCopy,
  disableDelete,
}: GridActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {onAdd && <GridIconButton icon={Plus} color="green" onClick={onAdd} title="Tambah" />}
      {onEdit && (
        <GridIconButton icon={Pencil} color="blue" onClick={onEdit} disabled={disableEdit} title="Ubah" />
      )}
      {onCopy && (
        <GridIconButton icon={Copy} color="blue" onClick={onCopy} disabled={disableCopy} title="Salin" />
      )}
      {onDelete && (
        <GridIconButton icon={Trash2} color="red" onClick={onDelete} disabled={disableDelete} title="Hapus" />
      )}
    </div>
  );
}

/** A small outline "utility" button (e.g. Kartu Stok, Satuan Salah) matching the reference toolbar. */
export function UtilityButton({
  children,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 items-center gap-1.5 rounded border border-default bg-elevated px-3 text-[13px] text-highlighted transition-colors hover:bg-bg"
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
    </button>
  );
}

export function RowEditIcon({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded text-info transition-colors hover:bg-info/10"
      title="Ubah"
    >
      <Pencil className="size-3.5" />
    </button>
  );
}

export function RowDeleteIcon({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded text-danger transition-colors hover:bg-danger/10"
      title="Hapus"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
