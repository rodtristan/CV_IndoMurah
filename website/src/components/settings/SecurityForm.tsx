"use client";

import { useState, type FormEvent } from "react";
import { PageCard } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SecurityForm() {
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (current.length < 8 || newPassword.length < 8) {
      setError("Must be at least 8 characters");
      return;
    }
    if (current === newPassword) {
      setError("Passwords must be different");
      return;
    }
    setError(null);
  }

  return (
    <>
      <PageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle">
        <form onSubmit={onSubmit} className="flex max-w-xs flex-col gap-4">
          <Input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full"
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button label="Update" type="submit" className="w-fit" />
        </form>
      </PageCard>

      <PageCard
        title="Account"
        description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
        variant="subtle"
        className="bg-gradient-to-tl from-error/10 from-5% to-bg"
        footer={<Button label="Delete account" color="error" />}
      />
    </>
  );
}
