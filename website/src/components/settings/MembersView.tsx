"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MembersList } from "./MembersList";
import { members } from "@/lib/mock-data";

export function MembersView() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(query) || m.username.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <div>
      <PageCard
        title="Members"
        description="Invite new members by email address."
        variant="naked"
        orientation="horizontal"
        className="mb-4"
        footer={<Button label="Invite people" color="neutral" />}
      />

      <div className="rounded-lg bg-elevated/50 ring-1 ring-inset ring-default">
        <div className="border-b border-default p-4">
          <Input icon={Search} placeholder="Search members" autoFocus value={q} onChange={(e) => setQ(e.target.value)} className="w-full" />
        </div>
        <MembersList members={filtered} />
      </div>
    </div>
  );
}
