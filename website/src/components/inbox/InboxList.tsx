"use client";

import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Mail } from "@/types";

export function InboxList({
  mails,
  selectedMail,
  onSelect,
}: {
  mails: Mail[];
  selectedMail: Mail | null;
  onSelect: (mail: Mail) => void;
}) {
  return (
    <div className="flex-1 divide-y divide-default overflow-y-auto scrollbar-thin">
      {mails.map((mail) => (
        <div
          key={mail.id}
          onClick={() => onSelect(mail)}
          className={cn(
            "cursor-pointer border-l-2 p-4 text-sm transition-colors sm:px-6",
            mail.unread ? "text-highlighted" : "text-toned",
            selectedMail?.id === mail.id
              ? "border-primary bg-primary/10"
              : "border-transparent hover:border-primary hover:bg-primary/5",
          )}
        >
          <div className={cn("flex items-center justify-between", mail.unread && "font-semibold")}>
            <div className="flex items-center gap-3">
              {mail.from.name}
              {mail.unread && <span className="size-2 rounded-full bg-primary" />}
            </div>
            <span className="shrink-0 text-xs text-muted">
              {isToday(new Date(mail.date)) ? format(new Date(mail.date), "HH:mm") : format(new Date(mail.date), "dd MMM")}
            </span>
          </div>
          <p className={cn("truncate", mail.unread && "font-semibold")}>{mail.subject}</p>
          <p className="line-clamp-1 text-dimmed">{mail.body}</p>
        </div>
      ))}
    </div>
  );
}
