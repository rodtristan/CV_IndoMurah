"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { PageCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/lib/toast-context";

interface Profile {
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio: string;
}

const FIELDS: { name: keyof Profile; label: string; description: string; type?: string }[] = [
  { name: "name", label: "Name", description: "Will appear on receipts, invoices, and other communication." },
  { name: "email", label: "Email", description: "Used to sign in, for email receipts and product updates.", type: "email" },
  { name: "username", label: "Username", description: "Your unique username for logging in and your profile URL." },
];

export function GeneralForm() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>({
    name: "Benjamin Canac",
    email: "ben@nuxtlabs.com",
    username: "benjamincanac",
    avatar: undefined,
    bio: "",
  });

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    toast.add({ title: "Success", description: "Your settings have been updated.", color: "success" });
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    update("avatar", URL.createObjectURL(e.target.files[0]!));
  }

  return (
    <form id="settings" onSubmit={onSubmit}>
      <PageCard
        title="Profile"
        description="These informations will be displayed publicly."
        variant="naked"
        orientation="horizontal"
        className="mb-4"
        footer={<Button form="settings" label="Save changes" color="neutral" type="submit" />}
      />

      <div className="divide-y divide-default rounded-lg bg-elevated/50 p-4 ring-1 ring-inset ring-default sm:p-6">
        {FIELDS.map((field) => (
          <div key={field.name} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0 max-sm:flex-col">
            <div className="max-w-xs">
              <label htmlFor={field.name} className="text-sm font-medium text-highlighted">
                {field.label}
              </label>
              <p className="text-sm text-muted">{field.description}</p>
            </div>
            <Input
              id={field.name}
              type={field.type}
              value={profile[field.name] as string}
              onChange={(e) => update(field.name, e.target.value)}
              autoComplete="off"
              className="sm:w-64"
            />
          </div>
        ))}

        <div className="flex items-center justify-between gap-4 py-4 max-sm:flex-col max-sm:items-start">
          <div className="max-w-xs">
            <p className="text-sm font-medium text-highlighted">Avatar</p>
            <p className="text-sm text-muted">JPG, GIF or PNG. 1MB Max.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar src={profile.avatar} alt={profile.name} size="lg" />
            <Button label="Choose" color="neutral" type="button" onClick={() => fileRef.current?.click()} />
            <input ref={fileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.gif" onChange={onFileChange} />
          </div>
        </div>

        <div className="py-4 last:pb-0">
          <label htmlFor="bio" className="text-sm font-medium text-highlighted">
            Bio
          </label>
          <p className="mb-2 text-sm text-muted">Brief description for your profile. URLs are hyperlinked.</p>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={5}
            autoresize
            className="w-full"
          />
        </div>
      </div>
    </form>
  );
}
