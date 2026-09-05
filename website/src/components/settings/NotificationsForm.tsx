"use client";

import { useState } from "react";
import { PageCard } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";

interface Field {
  name: string;
  label: string;
  description: string;
}

const sections: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Notification channels",
    description: "Where can we notify you?",
    fields: [
      { name: "email", label: "Email", description: "Receive a daily email digest." },
      { name: "desktop", label: "Desktop", description: "Receive desktop notifications." },
    ],
  },
  {
    title: "Account updates",
    description: "Receive updates about Nuxt UI.",
    fields: [
      { name: "weekly_digest", label: "Weekly digest", description: "Receive a weekly digest of news." },
      { name: "product_updates", label: "Product updates", description: "Receive a monthly email with all new features and updates." },
      {
        name: "important_updates",
        label: "Important updates",
        description: "Receive emails about important updates like security fixes, maintenance, etc.",
      },
    ],
  },
];

export function NotificationsForm() {
  const [state, setState] = useState<Record<string, boolean>>({
    email: true,
    desktop: false,
    product_updates: true,
    weekly_digest: false,
    important_updates: true,
  });

  function onChange(name: string, value: boolean) {
    setState((s) => {
      const next = { ...s, [name]: value };
      console.log(next);
      return next;
    });
  }

  return (
    <>
      {sections.map((section, index) => (
        <div key={index}>
          <PageCard title={section.title} description={section.description} variant="naked" className="mb-4" />

          <div className="divide-y divide-default rounded-lg bg-elevated/50 p-4 ring-1 ring-inset ring-default sm:p-6">
            {section.fields.map((field) => (
              <div key={field.name} className="flex items-center justify-between gap-2 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-highlighted">{field.label}</p>
                  <p className="text-sm text-muted">{field.description}</p>
                </div>
                <Switch checked={state[field.name] ?? false} onChange={(v) => onChange(field.name, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
