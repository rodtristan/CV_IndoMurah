"use client";

import Link from "next/link";
import { Slideover } from "@/components/ui/Slideover";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { useDashboard } from "@/lib/dashboard-context";
import { notifications } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/format-time-ago";

export function NotificationsSlideover() {
  const { isNotificationsSlideoverOpen, setNotificationsSlideoverOpen } = useDashboard();

  return (
    <Slideover open={isNotificationsSlideoverOpen} onClose={setNotificationsSlideoverOpen} title="Notifications">
      <div className="flex flex-col">
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={`/inbox?id=${notification.id}`}
            onClick={() => setNotificationsSlideoverOpen(false)}
            className="relative -mx-3 flex items-center gap-3 rounded-md px-3 py-2.5 first:-mt-3 last:-mb-3 hover:bg-elevated/50"
          >
            <Chip color="error" show={!!notification.unread} inset>
              <Avatar src={notification.sender.avatar?.src} alt={notification.sender.name} size="md" />
            </Chip>

            <div className="flex-1 text-sm">
              <p className="flex items-center justify-between gap-2">
                <span className="font-medium text-highlighted">{notification.sender.name}</span>
                <time className="text-xs text-muted">{formatTimeAgo(notification.date)}</time>
              </p>
              <p className="text-dimmed">{notification.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </Slideover>
  );
}
