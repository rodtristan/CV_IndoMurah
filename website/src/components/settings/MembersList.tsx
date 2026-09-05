"use client";

import { EllipsisVertical } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import type { Member } from "@/types";

const items: DropdownItem[][] = [
  [
    { label: "Edit member", onSelect: () => console.log("Edit member") },
    { label: "Remove member", color: "error", onSelect: () => console.log("Remove member") },
  ],
];

export function MembersList({ members }: { members: Member[] }) {
  return (
    <ul role="list" className="divide-y divide-default">
      {members.map((member, index) => (
        <li key={index} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={member.avatar.src} alt={member.name} size="md" />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-highlighted">{member.name}</p>
              <p className="truncate text-muted">{member.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select defaultValue={member.role} options={["member", "owner"]} />
            <Dropdown sections={items} align="end">
              <button type="button" className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated">
                <EllipsisVertical className="size-4" />
              </button>
            </Dropdown>
          </div>
        </li>
      ))}
    </ul>
  );
}
