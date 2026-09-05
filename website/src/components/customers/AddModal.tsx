"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export function AddModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const toast = useToast();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return;
    toast.add({ title: "Success", description: `New customer ${name} added`, color: "success" });
    setOpen(false);
    setName("");
    setEmail("");
  }

  return (
    <>
      <Button label="New customer" icon={Plus} onClick={() => setOpen(true)} />
      <Modal open={open} onClose={setOpen} title="New customer" description="Add a new customer to the database">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-highlighted">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-highlighted">Email</span>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button label="Cancel" color="neutral" variant="subtle" type="button" onClick={() => setOpen(false)} />
            <Button label="Create" color="primary" variant="solid" type="submit" />
          </div>
        </form>
      </Modal>
    </>
  );
}
