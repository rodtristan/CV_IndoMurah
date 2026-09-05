"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox as InboxIcon } from "lucide-react";
import { Navbar } from "@/components/layout/PageHeader";
import { SidebarCollapseButton } from "@/components/layout/SidebarCollapseButton";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Slideover } from "@/components/ui/Slideover";
import { InboxList } from "./InboxList";
import { InboxMail } from "./InboxMail";
import { mails as allMails } from "@/lib/mock-data";
import type { Mail } from "@/types";

const tabItems = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
];

export function InboxView() {
  const [tab, setTab] = useState("all");
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isMobileMailOpen, setMobileMailOpen] = useState(false);

  const filteredMails = useMemo(
    () => (tab === "unread" ? allMails.filter((m) => m.unread) : allMails),
    [tab],
  );

  // Derive the effective selection during render instead of syncing it via an
  // effect: if the selected mail falls out of the filtered list, treat it as
  // unselected without an extra render pass.
  const effectiveSelectedMail =
    selectedMail && filteredMails.some((m) => m.id === selectedMail.id) ? selectedMail : null;

  useEffect(() => {
    // Synchronizing with the URL (?id=) from a notification link is a valid
    // effect use case (external system -> state). Read it directly from
    // `window.location` (instead of `useSearchParams`) so this component
    // doesn't need a Suspense boundary and can be fully server-rendered.
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      const mail = allMails.find((m) => m.id === Number(id));
      if (mail) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the URL (external system)
        setSelectedMail(mail);
        setMobileMailOpen(true);
      }
    }
  }, []);

  function selectMail(mail: Mail) {
    setSelectedMail(mail);
    setMobileMailOpen(true);
  }

  return (
    <>
      <div className="flex w-full min-w-0 lg:w-[380px] lg:shrink-0 lg:border-r lg:border-default flex-col overflow-hidden">
        <Navbar
          title="Inbox"
          leading={<SidebarCollapseButton />}
          trailing={<Badge color="neutral" variant="subtle">{filteredMails.length}</Badge>}
          right={<Tabs items={tabItems} value={tab} onChange={setTab} size="xs" />}
        />
        <InboxList mails={filteredMails} selectedMail={effectiveSelectedMail} onSelect={selectMail} />
      </div>

      {effectiveSelectedMail ? (
        <div className="hidden min-w-0 flex-1 lg:flex">
          <InboxMail mail={effectiveSelectedMail} onClose={() => setSelectedMail(null)} />
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <InboxIcon className="size-32 text-dimmed" />
        </div>
      )}

      <Slideover
        open={isMobileMailOpen && !!effectiveSelectedMail}
        onClose={setMobileMailOpen}
        widthClassName="max-w-full sm:max-w-lg"
        noPadding
      >
        {effectiveSelectedMail && (
          <InboxMail
            mail={effectiveSelectedMail}
            onClose={() => {
              setMobileMailOpen(false);
              setSelectedMail(null);
            }}
          />
        )}
      </Slideover>
    </>
  );
}
