"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { RowDeleteIcon } from "@/components/ui/GridActions";
import { Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function SalePointsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [showTakeForm, setShowTakeForm] = useState(false);
  const [takeForm, setTakeForm] = useState({ customerId: "", pointsRedeemed: 0, rewardName: "", rewardValue: 0 });

  const fetchCustomers = useCallback(async () => {
    const res = await api.get("customer", { $select: "id,name,pointBalance" } as any).catch(() => ({ success: false, data: [] } as any));
    if (res.success) setCustomers(res.data || []);
  }, []);

  const runReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "customer", $orderBy: { date: "desc" }, $take: 200 };
      if (customerId) params.$where = { customerId: Number(customerId) };
      const res = await api.get("point-redemption", params).catch(() => ({ success: false, data: [] } as any));
      let data: any[] = res.success ? res.data || [] : [];
      data = data.filter((row) => {
        const d = row.date ? new Date(row.date) : null;
        if (!d) return true;
        if (startDate && d < new Date(startDate)) return false;
        if (endDate && d > new Date(endDate + "T23:59:59")) return false;
        return true;
      });
      setRows(data);
    } finally { setLoading(false); }
  }, [customerId, startDate, endDate]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { runReport(); }, [runReport]);

  const openTakePoint = () => {
    setTakeForm({ customerId: customers[0]?.id ? String(customers[0].id) : "", pointsRedeemed: 0, rewardName: "", rewardValue: 0 });
    setShowTakeForm(true);
  };

  const handleTakePoint = async () => {
    if (!takeForm.customerId || takeForm.pointsRedeemed <= 0) return;
    const payload = {
      customerId: Number(takeForm.customerId),
      code: `PR-${Date.now()}`,
      pointsRedeemed: Number(takeForm.pointsRedeemed),
      rewardName: takeForm.rewardName || "Ambil Point",
      rewardValue: Number(takeForm.rewardValue) || 0,
    };
    const res = await api.post("point-redemption", payload).catch(() => ({ success: false } as any));
    if (res.success) {
      setShowTakeForm(false);
      fetchCustomers();
      runReport();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete("point-redemption", String(deleteTarget.id)).catch(() => ({}));
    setDeleteTarget(null);
    fetchCustomers();
    runReport();
  };

  const columns = [
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "customerName", label: "Pelanggan", render: (_: unknown, row: any) => row.customer?.name || "-" },
    { key: "rewardName", label: "Keterangan" },
    { key: "pointsRedeemed", label: "Point Diambil", align: "right" as const, render: (v: unknown) => <span className="font-semibold text-danger">-{v as number}</span> },
    {
      key: "actions", label: "", width: "60px",
      render: (_: unknown, row: any) => <RowDeleteIcon onClick={() => setDeleteTarget(row)} />,
    },
  ];

  const selectedCustomer = customers.find((c) => String(c.id) === customerId);

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Point Penjualan mencatat pengambilan (redeem) point dari saldo point pelanggan.
          Saldo point terkumpul otomatis dari transaksi penjualan sesuai Setting Point.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Pelanggan"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={[{ value: "", label: "Semua Pelanggan" }, ...customers.map((c) => ({ value: String(c.id), label: `${c.name} (${c.pointBalance} pt)` }))]}
          />
          <Input type="date" label="Dari Tanggal" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" label="Sampai Tanggal" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button variant="primary" onClick={runReport} loading={loading}>Proses</Button>
          <div className="flex-1" />
          <Button variant="primary" icon={Plus} onClick={openTakePoint}>Ambil Point</Button>
        </div>
        {selectedCustomer && (
          <div className="mt-3 rounded-lg bg-elevated p-3 text-sm">
            Saldo point saat ini untuk <span className="font-semibold">{selectedCustomer.name}</span>: <span className="font-semibold text-primary">{selectedCustomer.pointBalance} pt</span>
          </div>
        )}
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} emptyMessage="Tidak ada data pengambilan point" />
        </div>
      </Card>

      <Modal open={showTakeForm} onClose={() => setShowTakeForm(false)} title="Ambil Point" size="md">
        <div className="space-y-4">
          <Select
            label="Pelanggan"
            value={takeForm.customerId}
            onChange={(e) => setTakeForm((f) => ({ ...f, customerId: e.target.value }))}
            options={customers.map((c) => ({ value: String(c.id), label: `${c.name} (${c.pointBalance} pt)` }))}
          />
          <Input label="Jumlah Point Diambil" type="number" value={takeForm.pointsRedeemed} onChange={(e) => setTakeForm((f) => ({ ...f, pointsRedeemed: Number(e.target.value) }))} />
          <Input label="Keterangan" value={takeForm.rewardName} onChange={(e) => setTakeForm((f) => ({ ...f, rewardName: e.target.value }))} placeholder="Contoh: Tukar voucher belanja" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowTakeForm(false)}>Batal</Button>
            <Button variant="primary" onClick={handleTakePoint}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Point"
        message="Yakin ingin menghapus pengambilan point ini? Point akan dikembalikan ke saldo pelanggan."
        confirmText="Hapus"
        variant="danger"
      />
    </PageWrapper>
  );
}
