"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function DeleteModal({ count = 0, children }: { count?: number; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Modal
        open={open}
        onClose={setOpen}
        title={`Delete ${count} customer${count > 1 ? "s" : ""}`}
        description="Are you sure, this action cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button label="Cancel" color="neutral" variant="subtle" onClick={() => setOpen(false)} />
          <Button label="Delete" color="error" variant="solid" loading={loading} onClick={onSubmit} />
        </div>
      </Modal>
    </>
  );
}
