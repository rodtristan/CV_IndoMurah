"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, Inbox as InboxIcon, Reply, EllipsisVertical, Paperclip, Send, CheckCircle, TriangleAlert, Star, CirclePause } from "lucide-react";
import { Navbar } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/lib/toast-context";
import type { Mail } from "@/types";

const dropdownItems: DropdownItem[][] = [
  [
    { label: "Mark as unread", icon: CheckCircle },
    { label: "Mark as important", icon: TriangleAlert },
  ],
  [
    { label: "Star thread", icon: Star },
    { label: "Mute thread", icon: CirclePause },
  ],
];

export function InboxMail({ mail, onClose }: { mail: Mail; onClose: () => void }) {
  const toast = useToast();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setReply("");
      toast.add({
        title: "Email sent",
        description: "Your email has been sent successfully",
        color: "success",
      });
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden">
      <Navbar
        title={mail.subject}
        leading={
          <button
            type="button"
            onClick={onClose}
            className="-ms-1.5 flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated"
          >
            <X className="size-5" />
          </button>
        }
        right={
          <>
            <Tooltip text="Archive">
              <button type="button" className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated">
                <InboxIcon className="size-5" />
              </button>
            </Tooltip>
            <Tooltip text="Reply">
              <button type="button" className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated">
                <Reply className="size-5" />
              </button>
            </Tooltip>
            <Dropdown sections={dropdownItems} align="end">
              <button type="button" className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated">
                <EllipsisVertical className="size-5" />
              </button>
            </Dropdown>
          </>
        }
      />

      <div className="flex flex-col justify-between gap-1 border-b border-default p-4 sm:flex-row sm:px-6">
        <div className="flex items-start gap-4 sm:my-1.5">
          <Avatar src={mail.from.avatar?.src} alt={mail.from.name} size="3xl" />
          <div className="min-w-0">
            <p className="font-semibold text-highlighted">{mail.from.name}</p>
            <p className="text-muted">{mail.from.email}</p>
          </div>
        </div>
        <p className="text-sm text-muted max-sm:pl-16 sm:mt-2">{format(new Date(mail.date), "dd MMM HH:mm")}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-6">
        <p className="whitespace-pre-wrap text-sm text-toned">{mail.body}</p>
      </div>

      <div className="shrink-0 px-4 pb-4 sm:px-6">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="mb-2 flex items-center gap-1.5 text-dimmed">
            <Reply className="size-5" />
            <span className="truncate text-sm">
              Reply to {mail.from.name} ({mail.from.email})
            </span>
          </div>

          <form onSubmit={onSubmit}>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              variant="none"
              required
              autoresize
              placeholder="Write your reply..."
              rows={4}
              disabled={loading}
              className="w-full"
            />

            <div className="flex items-center justify-between pt-2">
              <Tooltip text="Attach file">
                <button type="button" className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated">
                  <Paperclip className="size-5" />
                </button>
              </Tooltip>

              <div className="flex items-center justify-end gap-2">
                <Button color="neutral" variant="ghost" label="Save draft" type="button" />
                <Button color="neutral" type="submit" loading={loading} label="Send" icon={Send} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
