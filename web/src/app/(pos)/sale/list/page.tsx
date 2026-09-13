"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Eye, ArrowLeftRight, Printer, MoreVertical } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { FilterBar } from "@/components/ui/FilterBar";
import { api, odata } from "@/lib/api-client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { Sale, SaleItem } from "@/lib/types";

export default function SaleListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });

  const fetchSales = useCallback(async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const query = odata()
        .include(["customer", "warehouse", "salePoint", "creator"])
        .orderByMulti({ createdAt: "desc" })
        .skip((pagination.page - 1) * pagination.pageSize)
        .take(pagination.pageSize);

      if (params.search) {
        query.search(params.search as string, ["code", "customer.name"]);
      }
      if (params.paymentStatus) {
        query.where({ paymentStatus: params.paymentStatus });
      }
      if (params.dateFrom) {
        query.where({ date: { gte: new Date(params.dateFrom as string) } });
      }
      if (params.dateTo) {
        query.where({ date: { lte: new Date(params.dateTo as string) } });
      }

      const res = await api.get<Sale[]>("sale", query.toParams());
      if (res.success) {
        setSales(res.data || []);
        if (res.meta) {
          setPagination((prev) => ({
            ...prev,
            total: res.meta!.total,
            totalPages: res.meta!.pages,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchSales(filters);
  }, [filters, fetchSales]);

  const columns = [
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span>,
    },
    {
      key: "date",
      label: "Tanggal",
      sortable: true,
      render: (v: unknown) => formatDate(v as string),
    },
    {
      key: "customer.name",
      label: "Pelanggan",
      render: (_: unknown, row: Sale) => row.customer?.name || "-",
    },
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => <span className="font-semibold">{formatCurrency(v as number)}</span>,
    },
    {
      key: "paymentMethod",
      label: "Metode",
      render: (v: unknown) => {
        const methods: Record<string, string> = {
          CASH: "Tunai", TRANSFER: "Transfer", DEBIT: "Debit", QRIS: "QRIS", CREDIT: "Kredit",
        };
        return <span className="text-xs">{methods[v as string] || (v as string)}</span>;
      },
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (v: unknown) => {
        const status = v as string;
        const variants: Record<string, "success" | "warning" | "danger" | "default"> = {
          PAID: "success", PARTIAL: "warning", PENDING: "default", CANCELLED: "danger",
        };
        const labels: Record<string, string> = {
          PAID: "Lunas", PARTIAL: "Sebagian", PENDING: "Tertunda", CANCELLED: "Batal",
        };
        return <Badge variant={(variants[status] || "default") as any}>{labels[status] || status}</Badge>;
      },
    },
    {
      key: "creator.name",
      label: "Kasir",
      render: (_: unknown, row: Sale) => row.creator?.name || "-",
    },
    {
      key: "actions",
      label: "",
      width: 50,
      render: (_: unknown, row: Sale) => (
        <Button
          variant="ghost"
          size="icon"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSale(row);
            setShowDetail(true);
          }}
        />
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Daftar Penjualan"
        subtitle="Kelola transaksi penjualan"
        actions={
          <Button variant="primary" icon={Plus} href="/sale/pos">
            Penjualan Baru
          </Button>
        }
      />

      <Card>
        <FilterBar
          fields={[
            { key: "paymentStatus", label: "Status", type: "select", options: [
              { value: "", label: "Semua" },
              { value: "PAID", label: "Lunas" },
              { value: "PENDING", label: "Tertunda" },
              { value: "PARTIAL", label: "Sebagian" },
              { value: "CANCELLED", label: "Batal" },
            ]},
            { key: "dateFrom", label: "Dari Tanggal", type: "date" },
            { key: "dateTo", label: "Sampai Tanggal", type: "date" },
          ]}
          onFilter={setFilters}
          loading={loading}
        />

        <div className="mt-4">
          <DataTable
            data={sales}
            columns={columns}
            loading={loading}
            emptyMessage="Tidak ada penjualan"
            onRowClick={(row) => {
              setSelectedSale(row);
              setShowDetail(true);
            }}
            pagination={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              totalPages: pagination.totalPages,
              onPageChange: (p) => setPagination((prev) => ({ ...prev, page: p })),
            }}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Detail Penjualan ${selectedSale?.code || ""}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" icon={Printer} onClick={() => {}}>
              Cetak Struk
            </Button>
            <Button variant="outline" icon={ArrowLeftRight}>
              Retur
            </Button>
            <Button variant="primary" onClick={() => setShowDetail(false)}>
              Tutup
            </Button>
          </>
        }
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Tanggal</p>
                <p className="font-medium">{formatDateTime(selectedSale.date)}</p>
              </div>
              <div>
                <p className="text-muted">Pelanggan</p>
                <p className="font-medium">{selectedSale.customer?.name || "Umum"}</p>
              </div>
              <div>
                <p className="text-muted">Metode Bayar</p>
                <p className="font-medium">{selectedSale.paymentMethod}</p>
              </div>
              <div>
                <p className="text-muted">Status</p>
                <Badge variant={selectedSale.paymentStatus === "PAID" ? "success" : "warning"}>
                  {selectedSale.paymentStatus}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-highlighted">Item</h4>
              <div className="rounded-lg border border-default">
                <table className="w-full text-sm">
                  <thead className="bg-elevated/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Produk</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Harga</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSale.saleItems || []).map((item) => (
                      <tr key={item.id} className="border-t border-default">
                        <td className="px-3 py-2">{item.product?.name || `Product #${item.productId}`}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2 border-t border-default pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              {Number(selectedSale.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Diskon</span>
                  <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                </div>
              )}
              {Number(selectedSale.taxAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">PPN</span>
                  <span>{formatCurrency(selectedSale.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(selectedSale.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}


