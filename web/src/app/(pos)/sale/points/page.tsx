"use client";

import { useState, useEffect, useCallback } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { FilterBar } from "@/components/ui/FilterBar";
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
  const [selected, setSelected] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showTakeForm, setShowTakeForm] = useState(false);
  const [takeForm, setTakeForm] = useState({ customerId: "", pointsRedeemed: 0, rewardName: "", rewardValue: 0 });

  const fetchCustomers = useCallback(async () => {
    const res = await api.get("customer", { $select: "ID,Name,PointBalance" } as any).catch(() => ({ success: false, data: [] } as any));
    if (res.success) setCustomers(res.data || []);
  }, []);

  const runReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { $include: "Customer", $orderBy: { date: "desc" }, $take: 200 };
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
    setTakeForm({ customerId: customers[0]?.ID ? String(customers[0].ID) : "", pointsRedeemed: 0, rewardName: "", rewardValue: 0 });
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
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("point-redemption", String(selected.id));
      setShowDelete(false);
      setSelected(null);
      fetchCustomers();
      runReport();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => { setSelected(row); setShowDetail(true); }} /> },
    { key: "code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "customerName", label: "Pelanggan", render: (_: unknown, row: any) => row.Customer?.Name || "-" },
    { key: "rewardName", label: "Keterangan" },
    { key: "pointsRedeemed", label: "Point Diambil", align: "right" as const, render: (v: unknown) => <span className="font-semibold text-danger">-{v as number}</span> },
  ];

  const selectedCustomer = customers.find((c) => String(c.ID) === customerId);

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Point Penjualan mencatat pengambilan (redeem) point dari saldo point pelanggan.
          Saldo point terkumpul otomatis dari transaksi penjualan sesuai Setting Point.
        </p>
        <FilterBar
          fields={[
            { key: "customerId", label: "Pelanggan", type: "select", options: [{ value: "", label: "Semua Pelanggan" }, ...customers.map((c) => ({ value: String(c.ID), label: `${c.Name} (${c.PointBalance} pt)` }))] },
            { key: "startDate", label: "Dari Tanggal", type: "date" },
            { key: "endDate", label: "Sampai Tanggal", type: "date" },
          ]}
          onFilter={(v) => {
            setCustomerId((v.customerId as string) || "");
            setStartDate((v.startDate as string) || "");
            setEndDate((v.endDate as string) || "");
          }}
          loading={loading}
          actions={
            <GridActions
              onAdd={openTakePoint}
              onEdit={() => selected && setShowDetail(true)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected}
            />
          }
        />
        {selectedCustomer && (
          <div className="mt-3 rounded-lg bg-elevated p-3 text-sm">
            Saldo point saat ini untuk <span className="font-semibold">{selectedCustomer.Name}</span>: <span className="font-semibold text-primary">{selectedCustomer.PointBalance} pt</span>
          </div>
        )}
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} emptyMessage="Tidak ada data pengambilan point" selectedId={selected?.id ?? null} onRowClick={(row) => setSelected(row)} />
        </div>
      </Card>

      <Modal open={showTakeForm} onClose={() => setShowTakeForm(false)} title="Ambil Point" size="md"
        footer={<><Button variant="outline" onClick={() => setShowTakeForm(false)}>Batal</Button><Button variant="primary" onClick={handleTakePoint}>Simpan</Button></>}>
        <div className="space-y-4">
          <Select
            label="Pelanggan"
            value={takeForm.customerId}
            onChange={(e) => setTakeForm((f) => ({ ...f, customerId: e.target.value }))}
            options={customers.map((c) => ({ value: String(c.ID), label: `${c.Name} (${c.PointBalance} pt)` }))}
          />
          <Input label="Jumlah Point Diambil" type="number" value={takeForm.pointsRedeemed} onChange={(e) => setTakeForm((f) => ({ ...f, pointsRedeemed: Number(e.target.value) }))} />
          <Input label="Keterangan" value={takeForm.rewardName} onChange={(e) => setTakeForm((f) => ({ ...f, rewardName: e.target.value }))} placeholder="Contoh: Tukar voucher belanja" />
        </div>
      </Modal>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title={`Pengambilan Point ${selected?.code || ""}`} size="md">
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted">Tanggal:</span> {formatDate(selected.date)}</div>
            <div><span className="text-muted">Pelanggan:</span> {selected.Customer?.Name || "-"}</div>
            <div><span className="text-muted">Point Diambil:</span> <span className="font-semibold text-danger">-{selected.pointsRedeemed}</span></div>
            <div><span className="text-muted">Keterangan:</span> {selected.rewardName || "-"}</div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Point"
        message="Yakin ingin menghapus pengambilan point ini? Point akan dikembalikan ke saldo pelanggan."
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
