"use client";

// One full-page transaction form for the Ketoko back-office documents:
// Pesanan Pembelian, Pembelian, Pesanan Penjualan, Penjualan, Retur Pembelian and Retur Penjualan.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, MapPin, Printer, Save } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn, formatCurrency, localDate } from "@/lib/utils";
import { usePageTitle } from "@/lib/page-title";
import { Badge } from "@/components/ui/StatCard";
import {
  KCard, KCode, KColumns, KEditableGrid, KInfoBox, KInput, KNumber, KRadioGroup, KRow, KSelect, KTabs, KTextarea,
} from "@/components/kform";
import { PartnerLookup } from "./PartnerLookup";
import { ItemsGrid } from "./ItemsGrid";
import { printDocument } from "./print";
import {
  computeTotals, lineDiscount, lineSubtotal, newKey, num, round2, todayStr, toDateInput,
  type LineItem, type TaxMode, type TierDiscount,
} from "./calc";
import { LoadingState } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { EMPTY_PAY, SalePayDialog, summarizePay, type SalePayState } from "./SalePayDialog";

export type TxnKind = "purchase" | "purchase-order" | "sale" | "sale-order" | "purchase-return" | "sale-return";

type Rec = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface Cfg {
  title: string;
  endpoint: string;
  listPath: string;
  partnerEp: "supplier" | "customer";
  partnerLabel: string;
  partnerKey: "Supplier" | "Customer";
  itemsKey: "PurchaseItems" | "SaleItems" | "ReturnItems" | "PurchaseOrderItems" | "SaleOrderItems";
  priceField: "PurchasePrice" | "SellingPrice";
  include: string;
  isReturn: boolean;
  refEndpoint?: string;
  refKey?: "Purchase" | "Sale";
  refLabel?: string;
  refIdField?: "PurchaseID" | "SaleID";
  partnerIdField: "SupplierID" | "CustomerID";
}

const CFG: Record<TxnKind, Cfg> = {
  "purchase-order": {
    title: "Pesanan Pembelian", endpoint: "PurchaseOrders", listPath: "/purchase/order", partnerEp: "supplier", partnerLabel: "Supplier", partnerKey: "Supplier",
    itemsKey: "PurchaseOrderItems", priceField: "PurchasePrice", isReturn: false, partnerIdField: "SupplierID",
    include: "Supplier,Warehouse,Status,PurchaseOrderItems,PurchaseOrderItems.Product,PurchaseOrderItems.Unit",
  },
  purchase: {
    title: "Pembelian", endpoint: "purchases", listPath: "/purchase/list", partnerEp: "supplier", partnerLabel: "Supplier", partnerKey: "Supplier",
    itemsKey: "PurchaseItems", priceField: "PurchasePrice", isReturn: false, partnerIdField: "SupplierID",
    include: "Supplier,Warehouse,PaymentMethod,PaymentStatus,Status,PurchaseItems,PurchaseItems.Product,PurchaseItems.Unit",
  },
  "sale-order": {
    title: "Pesanan Penjualan", endpoint: "SaleOrders", listPath: "/sale/order", partnerEp: "customer", partnerLabel: "Pelanggan", partnerKey: "Customer",
    itemsKey: "SaleOrderItems", priceField: "SellingPrice", isReturn: false, partnerIdField: "CustomerID",
    include: "Customer,SalesPerson,Warehouse,Status,SaleOrderItems,SaleOrderItems.Product,SaleOrderItems.Unit",
  },
  sale: {
    title: "Penjualan", endpoint: "sales", listPath: "/sale/list", partnerEp: "customer", partnerLabel: "Pelanggan", partnerKey: "Customer",
    itemsKey: "SaleItems", priceField: "SellingPrice", isReturn: false, partnerIdField: "CustomerID",
    include: "Customer,SalesPerson,Warehouse,PaymentMethod,PaymentStatus,SaleOrder,SalePayments,SaleItems,SaleItems.Product,SaleItems.Unit",
  },
  "purchase-return": {
    title: "Retur Pembelian", endpoint: "PurchaseReturns", listPath: "/purchase/returns", partnerEp: "supplier", partnerLabel: "Supplier", partnerKey: "Supplier",
    itemsKey: "ReturnItems", priceField: "PurchasePrice", isReturn: true, partnerIdField: "SupplierID",
    refEndpoint: "purchases", refKey: "Purchase", refLabel: "Faktur Pembelian", refIdField: "PurchaseID",
    include: "Purchase,Supplier,Warehouse,Status,ReturnItems,ReturnItems.Product,ReturnItems.Unit",
  },
  "sale-return": {
    title: "Retur Penjualan", endpoint: "SaleReturns", listPath: "/sale/returns", partnerEp: "customer", partnerLabel: "Pelanggan", partnerKey: "Customer",
    itemsKey: "ReturnItems", priceField: "SellingPrice", isReturn: true, partnerIdField: "CustomerID",
    refEndpoint: "sales", refKey: "Sale", refLabel: "Faktur Penjualan", refIdField: "SaleID",
    include: "Sale,Customer,Warehouse,Status,ReturnItems,ReturnItems.Product,ReturnItems.Unit",
  },
};

type PayType = "TUNAI" | "KREDIT" | "DP";
interface Opt { value: string; label: string }
interface Picked { id: number; name: string }

const PO_STATUS_OPTIONS = [
  { value: "WAITING_PAYMENT", label: "Menunggu Pembayaran" },
  { value: "PAID", label: "Sudah Dibayar" },
  { value: "PROCESSED", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DONE", label: "Selesai" },
  { value: "CANCELLED", label: "Batal" },
];

const statusVariant: Record<string, string> = {
  DRAFT: "warning", CONFIRMED: "info", COMPLETED: "success", CANCELLED: "danger",
  PENDING: "warning", PAID: "success", PARTIAL: "info", INSTALMENT: "info",
};

const listOf = (d: unknown): Rec[] => (Array.isArray(d) ? (d as Rec[]) : Array.isArray((d as Rec)?.data) ? (d as Rec).data : []);

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
function diffDays(a: string, b: string): number {
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000);
}

export function TransactionForm({ kind, id, copyFrom, presetRef }: { kind: TxnKind; id?: string; copyFrom?: string; presetRef?: string }) {
  const cfg = CFG[kind];
  const router = useRouter();
  const isNew = !id;
  const isSale = kind === "sale";
  const isPurchase = kind === "purchase";
  const isPO = kind === "purchase-order";
  const isSO = kind === "sale-order";
  const isOrder = isPO || isSO;

  // ─ header
  const [code, setCode] = useState("");
  const [date, setDate] = useState(todayStr());
  const [dueDate, setDueDate] = useState("");
  const [partner, setPartner] = useState<Picked | null>(null);
  const [salesPerson, setSalesPerson] = useState<Picked | null>(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [methodId, setMethodId] = useState("");
  const [poId, setPoId] = useState("");
  const [refNo, setRefNo] = useState("");
  const [notes, setNotes] = useState("");
  const [refDoc, setRefDoc] = useState<Picked | null>(null);
  const [refOptions, setRefOptions] = useState<Rec[]>([]);
  const [returnType, setReturnType] = useState("POTONG");
  // ─ pesanan pembelian
  const [orderStatus, setOrderStatus] = useState("WAITING_PAYMENT");
  const [deliveryDate, setDeliveryDate] = useState(todayStr());
  // ─ money
  const [taxMode, setTaxMode] = useState<TaxMode>("NON");
  const [taxPercent, setTaxPercent] = useState("11");
  const [discPercent, setDiscPercent] = useState("");
  const [discAmount, setDiscAmount] = useState("");
  const [tiers, setTiers] = useState<TierDiscount[]>([]);
  const [otherCost, setOtherCost] = useState("");
  const [otherCostAdds, setOtherCostAdds] = useState(true);
  const [payType, setPayType] = useState<PayType>(isOrder ? "DP" : "KREDIT");
  const [dp, setDp] = useState("");
  const [deposit, setDeposit] = useState("");
  // ─ shipping (sale)
  const [shipStatus, setShipStatus] = useState("PENDING");
  const [shipDate, setShipDate] = useState("");
  const [tracking, setTracking] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipName, setShipName] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [courier, setCourier] = useState("");
  const [showShip, setShowShip] = useState(false);
  // ─ penjualan: pesanan, bayar
  const [soId, setSoId] = useState("");
  const [soOptions, setSoOptions] = useState<Opt[]>([]);
  const [soDp, setSoDp] = useState(0);
  const [depositBalance, setDepositBalance] = useState(0);
  const [pay, setPay] = useState<SalePayState>(EMPTY_PAY);
  const [showPay, setShowPay] = useState(false);
  const [dpMethodId, setDpMethodId] = useState("");
  // ─ lines
  const [items, setItems] = useState<LineItem[]>([]);
  // ─ meta
  const [record, setRecord] = useState<Rec | null>(null);
  const [tab, setTab] = useState("detail");
  const [loading, setLoading] = useState(!isNew || !!copyFrom);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warehouses, setWarehouses] = useState<Opt[]>([]);
  const [methods, setMethods] = useState<(Opt & { code: string })[]>([]);
  const [orders, setOrders] = useState<Opt[]>([]);

  const statusCode: string = record?.Status?.Code ?? "";
  const payStatusCode: string = record?.PaymentStatus?.Code ?? "";
  const editable = isNew
    ? true
    : isSale ? payStatusCode !== "CANCELLED"
      : isPurchase || isOrder ? !["CANCELLED", "COMPLETED"].includes(statusCode)
        : statusCode === "DRAFT";
  const itemsEditable = isNew || isPurchase || isSale
    || (isPO && !(Number(record?.ReceivedQty ?? 0) > 0)) || (isSO && !(Number(record?.DeliveredQty ?? 0) > 0));

  usePageTitle(isNew ? `${cfg.title} Baru` : `${cfg.title} ${code}`);

  // ── lookups
  useEffect(() => {
    void (async () => {
      const [wh, pm] = await Promise.all([
        api.get<Rec[]>("warehouse", { $take: 200 }).catch(() => null),
        api.get<Rec[]>("payment-methods", { $take: 100 }).catch(() => null),
      ]);
      setWarehouses(listOf(wh?.data).map((w) => ({ value: String(w.ID), label: w.Name })));
      const pms = listOf(pm?.data).map((m) => ({ value: String(m.ID), label: m.Name, code: String(m.Code) }));
      setMethods(pms);
      if (isNew && !copyFrom) {
        const cash = pms.find((m) => m.code === "CASH") ?? pms[0];
        if (cash) { setMethodId(cash.value); setDpMethodId(cash.value); }
        const first = listOf(wh?.data)[0];
        if (first) setWarehouseId((w) => w || String(first.ID));
      }
      if (isPurchase) {
        const po = await api.get<Rec[]>("PurchaseOrders", { $take: 100, $orderBy: { Date: "desc" }, $include: "Supplier", $where: { ProcessStatus: { in: "OPEN,PARTIAL" } } }).catch(() => null);
        setOrders(listOf(po?.data).map((p) => ({ value: String(p.ID), label: `${p.Code} - ${p.Supplier?.Name ?? ""}` })));
      }
    })();
  }, [isNew, copyFrom, isPurchase]);

  // ── Pembelian dari pesanan: isi supplier, gudang, PPN dan item (sisa yang belum diterima)
  const pickOrder = useCallback(async (orderId: string) => {
    setPoId(orderId);
    if (!orderId) return;
    const res = await api.get<Rec>(`PurchaseOrders/${orderId}`, { $include: "Supplier,PurchaseOrderItems,PurchaseOrderItems.Product,PurchaseOrderItems.Unit" }, { skipCache: true }).catch(() => null);
    const po = res?.data;
    if (!po) return;
    if (po.Supplier) setPartner({ id: po.Supplier.ID, name: po.Supplier.Name });
    if (po.WarehouseID) setWarehouseId(String(po.WarehouseID));
    if (po.TaxMode) setTaxMode(po.TaxMode as TaxMode);
    if (Number(po.TaxPercent) > 0) setTaxPercent(String(Number(po.TaxPercent)));
    setItems((po.PurchaseOrderItems ?? []).map((it: Rec) => ({
      key: newKey(), productId: it.ProductID, code: it.Product?.Code ?? "", name: it.Product?.Name ?? "",
      unitId: it.UnitID, unitName: it.Unit?.Name ?? "",
      qty: String(Math.max(0, Number(it.Quantity) - Number(it.ReceivedQuantity ?? 0))),
      price: String(Number(it.UnitPrice)),
      discPercent: Number(it.DiscountPercent) ? String(Number(it.DiscountPercent)) : "",
      discAmount: !Number(it.DiscountPercent) && Number(it.DiscountAmount) ? String(Number(it.DiscountAmount)) : "",
      orderedQty: Number(it.Quantity), orderItemId: it.ID,
    })).filter((l: LineItem) => num(l.qty) > 0));
  }, []);

  // ── Penjualan dari Pesanan Penjualan: isi pelanggan, sales, gudang, PPN, item (sisa yang belum dijual) & DP
  const pickSaleOrder = useCallback(async (orderId: string) => {
    setSoId(orderId);
    if (!orderId) { setSoDp(0); return; }
    const res = await api.get<Rec>(`SaleOrders/${orderId}`, { $include: "Customer,SalesPerson,SaleOrderItems,SaleOrderItems.Product,SaleOrderItems.Unit" }, { skipCache: true }).catch(() => null);
    const so = res?.data;
    if (!so) return;
    if (so.Customer) setPartner({ id: so.Customer.ID, name: so.Customer.Name });
    if (so.SalesPerson) setSalesPerson({ id: so.SalesPerson.ID, name: so.SalesPerson.Name });
    if (so.WarehouseID) setWarehouseId(String(so.WarehouseID));
    if (so.TaxMode) setTaxMode(so.TaxMode as TaxMode);
    if (Number(so.TaxPercent) > 0) setTaxPercent(String(Number(so.TaxPercent)));
    if (Number(so.DiscountAmount) > 0) setDiscAmount(String(Number(so.DiscountAmount)));
    if (Number(so.OtherCost) > 0) { setOtherCost(String(Number(so.OtherCost))); setOtherCostAdds(so.OtherCostAdds !== false); }
    setSoDp(Number(so.DownPayment ?? 0));
    setItems((so.SaleOrderItems ?? []).map((it: Rec) => ({
      key: newKey(), productId: it.ProductID, code: it.Product?.Code ?? "", name: it.Product?.Name ?? "",
      unitId: it.UnitID, unitName: it.Unit?.Name ?? "",
      qty: String(Math.max(0, Number(it.Quantity) - Number(it.DeliveredQuantity ?? 0))),
      price: String(Number(it.UnitPrice)),
      discPercent: Number(it.DiscountPercent) ? String(Number(it.DiscountPercent)) : "",
      discAmount: !Number(it.DiscountPercent) && Number(it.DiscountAmount) ? String(Number(it.DiscountAmount)) : "",
      orderedQty: Number(it.Quantity), orderItemId: it.ID,
    })).filter((l: LineItem) => num(l.qty) > 0));
  }, []);

  // Pesanan terbuka & saldo deposit pelanggan (untuk Bayar)
  useEffect(() => {
    if (!isSale || !isNew) return;
    if (!partner) { setSoOptions([]); setDepositBalance(0); return; }
    void (async () => {
      const [so, c] = await Promise.all([
        api.get<Rec[]>("SaleOrders/open", { customerId: partner.id }, { skipCache: true }).catch(() => null),
        api.get<Rec>(`customer/${partner.id}`, undefined, { skipCache: true }).catch(() => null),
      ]);
      setSoOptions(listOf(so?.data).map((o) => ({ value: String(o.ID), label: `${o.Code} - ${toDateInput(o.Date)} - ${formatCurrency(Number(o.Total))}` })));
      setDepositBalance(Number(c?.data?.DepositBalance ?? 0));
    })();
  }, [isSale, isNew, partner]);

  /** Default dari master Supplier/Pelanggan: jatuh tempo & pajak (Ketoko "mengacu pada data supplier"). */
  const applyPartnerDefaults = useCallback(async (partnerId: number) => {
    if (!isNew || cfg.isReturn) return;
    const res = await api.get<Rec>(`${cfg.partnerEp}/${partnerId}`, undefined, { skipCache: true }).catch(() => null);
    const p = res?.data;
    if (!p) return;
    if (Number(p.DueDays) > 0) setDueDate(addDays(date, Number(p.DueDays)));
    if (p.TaxMode && p.TaxMode !== "DEFAULT") setTaxMode(p.TaxMode as TaxMode);
    if (p.TaxValueSource === "PARTNER" && Number(p.TaxRate) > 0) setTaxPercent(String(Number(p.TaxRate)));
  }, [isNew, cfg.isReturn, cfg.partnerEp, date]);

  // ── invoices selectable by a return
  const loadRefOptions = useCallback(async (partnerId?: number) => {
    if (!cfg.refEndpoint) return;
    const params: Rec = { $take: 100, $orderBy: { Date: "desc" } };
    if (partnerId) params.$where = { [cfg.partnerIdField]: partnerId };
    const res = await api.get<Rec[]>(cfg.refEndpoint, params, { skipCache: true }).catch(() => null);
    setRefOptions(listOf(res?.data));
  }, [cfg.refEndpoint, cfg.partnerIdField]);

  useEffect(() => { if (cfg.isReturn && isNew) void loadRefOptions(partner?.id); }, [cfg.isReturn, isNew, partner?.id, loadRefOptions]);

  const pickInvoice = useCallback(async (invoiceId: string, presetQty?: Map<number, number>) => {
    if (!cfg.refEndpoint) return;
    if (!invoiceId) { setRefDoc(null); setItems([]); return; }
    const res = await api.get<Rec>(`${cfg.refEndpoint}/${invoiceId}`, {
      $include: `${cfg.partnerKey},${cfg.isReturn && kind === "purchase-return" ? "PurchaseItems,PurchaseItems.Product,PurchaseItems.Unit" : "SaleItems,SaleItems.Product,SaleItems.Unit"}`,
    }, { skipCache: true }).catch(() => null);
    const inv = res?.data;
    if (!inv) return;
    setRefDoc({ id: inv.ID, name: inv.Code });
    if (inv[cfg.partnerKey]) setPartner((p) => p ?? { id: inv[cfg.partnerKey].ID, name: inv[cfg.partnerKey].Name });
    if (inv.WarehouseID) setWarehouseId((w) => w || String(inv.WarehouseID));
    const src: Rec[] = inv.PurchaseItems ?? inv.SaleItems ?? [];
    setItems(src.map((it) => ({
      key: newKey(),
      productId: it.ProductID,
      code: it.Product?.Code ?? "",
      name: it.Product?.Name ?? `Item #${it.ProductID}`,
      unitId: it.UnitID,
      unitName: it.Unit?.Name ?? "",
      qty: presetQty ? String(presetQty.get(it.ProductID) ?? 0) : "0",
      price: String(Number(it.UnitPrice)),
      discPercent: "",
      discAmount: "",
      maxQty: Number(it.Quantity),
    })));
  }, [cfg, kind]);

  useEffect(() => { if (presetRef && isNew && !copyFrom) void pickInvoice(presetRef); }, [presetRef, isNew, copyFrom, pickInvoice]);

  // ── existing record / copy
  useEffect(() => {
    const src = id ?? copyFrom;
    if (!src) return;
    void (async () => {
      setLoading(true);
      try {
        const res = await api.get<Rec>(`${cfg.endpoint}/${src}`, { $include: cfg.include }, { skipCache: true });
        const r = res.data;
        if (!r) { setError("Data tidak ditemukan"); return; }
        if (!copyFrom) { setRecord(r); setCode(r.Code ?? ""); }
        setDate(copyFrom ? todayStr() : toDateInput(r.Date) || todayStr());
        setDueDate(copyFrom ? "" : toDateInput(r.DueDate));
        if (r[cfg.partnerKey]) setPartner({ id: r[cfg.partnerKey].ID, name: r[cfg.partnerKey].Name });
        if (r.SalesPerson) setSalesPerson({ id: r.SalesPerson.ID, name: r.SalesPerson.Name });
        if (r.WarehouseID) setWarehouseId(String(r.WarehouseID));
        if (r.PaymentMethodID) setMethodId(String(r.PaymentMethodID));
        if (r.PurchaseOrderID) setPoId(String(r.PurchaseOrderID));
        setNotes(r.Notes ?? r.Reason ?? "");
        if (!cfg.isReturn) {
          const tp = Number(r.TaxPercent ?? 0);
          setTaxMode((r.TaxMode as TaxMode) || (tp > 0 ? "EXCLUDE" : "NON"));
          if (tp > 0) setTaxPercent(String(tp));
          const da = Number(r.DiscountAmount ?? 0);
          if (da > 0) setDiscAmount(String(da));
          if (Number(r.OtherCost) > 0) setOtherCost(String(Number(r.OtherCost)));
          if (r.OtherCostAdds === false) setOtherCostAdds(false);
          if (r.ReferenceNo) setRefNo(r.ReferenceNo);
        }
        if (isOrder) {
          setOrderStatus(r.OrderStatus ?? "WAITING_PAYMENT");
          setDeliveryDate(toDateInput(r.DeliveryDate) || todayStr());
          if (Number(r.DownPayment) > 0) setDp(String(Number(r.DownPayment)));
        }
        if (isSale) {
          setShipStatus(r.ShippingStatus ?? "PENDING");
          setShipDate(toDateInput(r.ShippingDate));
          setTracking(r.TrackingNumber ?? "");
          setShipName(r.ShipName ?? ""); setShipAddress(r.ShipAddress ?? ""); setShipCity(r.ShipCity ?? ""); setShipPhone(r.ShipPhone ?? ""); setCourier(r.Courier ?? "");
          if (!copyFrom && r.SaleOrderID) {
            setSoId(String(r.SaleOrderID));
            if (r.SaleOrder) setSoOptions([{ value: String(r.SaleOrderID), label: r.SaleOrder.Code }]);
          }
        } else if (isPurchase && !copyFrom) {
          setPayType(Number(r.Paid ?? 0) >= Number(r.Total ?? 0) && Number(r.Total) > 0 ? "TUNAI" : Number(r.Paid ?? 0) > 0 ? "DP" : "KREDIT");
          if (Number(r.Paid) > 0) setDp(String(Number(r.Paid)));
        }
        if (cfg.isReturn && cfg.refKey) {
          const ref = r[cfg.refKey];
          const qtyMap = new Map<number, number>((r.ReturnItems ?? []).map((it: Rec) => [it.ProductID, Number(it.Quantity)]));
          if (copyFrom) { await pickInvoice(String(r[cfg.refIdField!]), qtyMap); }
          else {
            if (ref) setRefDoc({ id: ref.ID, name: ref.Code });
            setItems((r.ReturnItems ?? []).map((it: Rec) => ({
              key: newKey(), productId: it.ProductID, code: it.Product?.Code ?? "", name: it.Product?.Name ?? "",
              unitId: it.UnitID, unitName: it.Unit?.Name ?? "", qty: String(Number(it.Quantity)), price: String(Number(it.UnitPrice)),
              discPercent: "", discAmount: "",
            })));
          }
        } else {
          setItems((r[cfg.itemsKey] ?? []).map((it: Rec) => ({
            key: newKey(), productId: it.ProductID, code: it.Product?.Code ?? "", name: it.Product?.Name ?? "",
            unitId: it.UnitID, unitName: it.Unit?.Name ?? "", qty: String(Number(it.Quantity)), price: String(Number(it.UnitPrice)),
            discPercent: Number(it.DiscountPercent) ? String(Number(it.DiscountPercent)) : "",
            discAmount: !Number(it.DiscountPercent) && Number(it.DiscountAmount) ? String(Number(it.DiscountAmount)) : "",
            receivedQty: it.ReceivedQuantity !== undefined ? Number(it.ReceivedQuantity) : it.DeliveredQuantity !== undefined ? Number(it.DeliveredQuantity) : undefined,
          })));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, copyFrom]);

  // ── totals
  const t = useMemo(() => computeTotals({ items, discPercent, discAmount, tiers, taxMode, taxPercent, otherCost, otherCostAdds }), [items, discPercent, discAmount, tiers, taxMode, taxPercent, otherCost, otherCostAdds]);
  const paidNow = isOrder ? Math.min(num(dp), t.total) : payType === "TUNAI" ? t.total : payType === "KREDIT" ? 0 : Math.min(num(dp), t.total);
  const dpSoUsed = isSale && isNew ? round2(Math.min(soDp, depositBalance, t.total)) : 0;
  const saleSum = summarizePay(t.total, dpSoUsed, pay);
  const recordPaid = isSale
    ? ((record?.SalePayments ?? []) as Rec[]).filter((p) => p.IsCleared !== false).reduce((a, p) => a + Number(p.Amount), 0)
    : Number(record?.Paid ?? 0);
  const paid = isNew ? (isSale ? saleSum.paid : paidNow + num(deposit)) : recordPaid;
  const remaining = Math.max(0, t.total - paid);
  const change = isSale && isNew ? saleSum.change : 0;

  // ── save
  const validate = (): string => {
    if (!partner) return `${cfg.partnerLabel} wajib dipilih`;
    if (cfg.isReturn && isNew && !refDoc) return `${cfg.refLabel} wajib dipilih`;
    if (isNew || itemsEditable) {
      const lines = cfg.isReturn ? items.filter((l) => num(l.qty) > 0) : items;
      if (lines.length === 0) return cfg.isReturn ? "Isi jumlah retur minimal satu item" : "Tambahkan minimal 1 item";
      if (lines.some((l) => num(l.qty) <= 0)) return "Jumlah item harus lebih dari 0";
      if (cfg.isReturn && lines.some((l) => l.maxQty !== undefined && num(l.qty) > l.maxQty)) return "Jumlah retur melebihi jumlah pada faktur";
    }
    return "";
  };

  const buildDoc = () => ({
    title: cfg.title,
    code: code || "(Auto)",
    date,
    partnerLabel: cfg.partnerLabel,
    partner: partner?.name ?? "-",
    warehouse: warehouses.find((w) => w.value === warehouseId)?.label,
    rows: items.filter((l) => !cfg.isReturn || num(l.qty) > 0).map((l) => ({
      code: l.code, name: l.name, qty: l.qty, unit: l.unitName, price: num(l.price), disc: lineDiscount(l), subtotal: lineSubtotal(l),
    })),
    totals: [
      { label: "Subtotal", value: t.subtotal },
      { label: "Potongan", value: t.discount },
      { label: taxMode === "INCLUDE" ? "PPN (termasuk)" : "PPN", value: t.tax },
      { label: "Biaya Lain", value: t.other },
      { label: "Total", value: t.total },
    ],
    notes,
  });

  /** Baris Bayar → Payments API (DP SO & Bayar Deposit memakai saldo deposit pelanggan). */
  const salePayments = () => {
    const byCode = (c: string) => methods.find((m) => m.code === c)?.value;
    const out: Rec[] = [];
    if (dpSoUsed > 0) out.push({ InstrumentType: "DEPOSIT", Amount: dpSoUsed, Notes: "DP Pesanan" });
    if (num(pay.deposit) > 0) out.push({ InstrumentType: "DEPOSIT", Amount: round2(num(pay.deposit)) });
    if (num(pay.cash) > 0) out.push({ MethodID: Number(byCode("CASH") ?? methodId), Amount: round2(num(pay.cash)) });
    if (num(pay.debit) > 0) out.push({ MethodID: Number(byCode("DEBIT") ?? methodId), Amount: round2(num(pay.debit)) });
    if (num(pay.card) > 0) out.push({ MethodID: Number(byCode("CREDIT") ?? methodId), Amount: round2(num(pay.card)) });
    if (num(pay.emoney) > 0) out.push({ MethodID: Number(byCode("EWALLET") ?? byCode("QRIS") ?? methodId), Amount: round2(num(pay.emoney)) });
    return out;
  };

  const save = async (print = false) => {
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    try {
      let savedId = id;
      // Tanggal + jam saat ini (seperti Ketoko); edit tanpa ganti tanggal mempertahankan waktu asli.
      const dateIso = (() => {
        if (!date) return undefined;
        if (!isNew && record?.Date && toDateInput(record.Date) === date) return String(record.Date);
        const [y, m, d] = date.split("-").map(Number);
        const now = new Date();
        return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
      })();
      const wh = warehouseId ? Number(warehouseId) : undefined;
      // Server menghitung pajak dari mode + persen (Include = sudah termasuk harga).
      const apiTax = taxMode === "NON" ? 0 : num(taxPercent);
      const docExtra = { TaxMode: taxMode, OtherCost: num(otherCost), OtherCostAdds: otherCostAdds };
      const lineBody = (l: LineItem) => ({
        ProductID: l.productId, Quantity: num(l.qty), UnitID: l.unitId, UnitPrice: num(l.price),
        ...(cfg.isReturn ? {} : { DiscountPercent: num(l.discPercent), DiscountAmount: round2(lineDiscount(l)) }),
      });

      if (isNew) {
        let body: Rec;
        if (isPO) {
          body = {
            SupplierID: partner!.id, WarehouseID: wh, Date: dateIso, DeliveryDate: deliveryDate || undefined, OrderStatus: orderStatus,
            DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra,
            DownPayment: round2(paidNow), Notes: notes || undefined, Items: items.map(lineBody),
          };
        } else if (isSO) {
          body = {
            CustomerID: partner!.id, SalesPersonID: salesPerson?.id, WarehouseID: wh, Date: dateIso, DeliveryDate: deliveryDate || undefined,
            OrderStatus: orderStatus, DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra,
            DownPayment: round2(paidNow), DPMethodID: dpMethodId ? Number(dpMethodId) : undefined, Notes: notes || undefined, Items: items.map(lineBody),
          };
        } else if (isPurchase) {
          body = {
            SupplierID: partner!.id, WarehouseID: wh, PurchaseOrderID: poId ? Number(poId) : undefined, Date: dateIso, DueDate: dueDate || undefined,
            PaymentMethodID: methodId ? Number(methodId) : undefined, DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount),
            TaxPercent: apiTax, ...docExtra, ReferenceNo: refNo || undefined, Notes: notes || undefined, Items: items.map(lineBody),
          };
        } else if (isSale) {
          body = {
            CustomerID: partner!.id, SalesPersonID: salesPerson?.id, WarehouseID: wh, Date: dateIso, DueDate: dueDate || undefined,
            DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra, ReferenceNo: refNo || undefined,
            SaleOrderID: soId ? Number(soId) : undefined, Payments: salePayments(),
            ShipName: shipName || undefined, ShipAddress: shipAddress || undefined, ShipCity: shipCity || undefined, ShipPhone: shipPhone || undefined, Courier: courier || undefined,
            Notes: notes || undefined, Items: items.map(lineBody),
          };
        } else if (kind === "purchase-return") {
          body = {
            PurchaseID: refDoc!.id, SupplierID: partner!.id, WarehouseID: wh, Date: dateIso, Reason: notes || undefined,
            Items: items.filter((l) => num(l.qty) > 0).map(lineBody),
          };
        } else {
          body = {
            SaleID: refDoc!.id, CustomerID: partner!.id, WarehouseID: wh, Date: dateIso, Reason: notes || undefined,
            Items: items.filter((l) => num(l.qty) > 0).map((l) => ({ ...lineBody(l), Subtotal: round2(num(l.qty) * num(l.price)) })),
          };
        }
        const res = await api.post<Rec>(cfg.endpoint, body);
        if (!res.success || !res.data) throw new Error(res.message || "Gagal menyimpan");
        savedId = String(res.data.ID);
        setCode(res.data.Code ?? "");

        // Purchases record cash/DP as a payment against the new invoice.
        if (isPurchase && paidNow > 0) {
          const amount = Math.min(round2(paidNow), Number(res.data.Total ?? paidNow));
          const mId = methodId ? Number(methodId) : methods[0] ? Number(methods[0].value) : undefined;
          if (amount > 0 && mId) {
            await api.post("PurchasePayments", { PurchaseID: res.data.ID, MethodID: mId, Amount: amount, Date: dateIso })
              .catch((e) => window.alert(`Pembelian tersimpan, tetapi pembayaran gagal dicatat: ${e instanceof Error ? e.message : ""}`));
          }
        }
        if (isSale && (shipStatus !== "PENDING" || shipDate || tracking)) {
          await api.put("sales", `${res.data.ID}/shipping`, {
            ShippingStatus: shipStatus, ShippingDate: shipDate || undefined, TrackingNumber: tracking || undefined, Courier: courier || undefined,
          }).catch(() => undefined);
        }
      } else {
        let body: Rec;
        if (isPO) {
          body = {
            SupplierID: partner!.id, WarehouseID: wh, Date: dateIso, DeliveryDate: deliveryDate || null, OrderStatus: orderStatus,
            DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra,
            DownPayment: round2(paidNow), Notes: notes, ...(itemsEditable ? { Items: items.map(lineBody) } : {}),
          };
        } else if (isSO) {
          body = {
            CustomerID: partner!.id, SalesPersonID: salesPerson?.id ?? null, WarehouseID: wh, Date: dateIso, DeliveryDate: deliveryDate || null,
            OrderStatus: orderStatus, DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra,
            DownPayment: round2(paidNow), DPMethodID: dpMethodId ? Number(dpMethodId) : undefined, Notes: notes,
            ...(itemsEditable ? { Items: items.map(lineBody) } : {}),
          };
        } else if (isPurchase) {
          body = {
            WarehouseID: wh, Date: dateIso, DueDate: dueDate || undefined, PaymentMethodID: methodId ? Number(methodId) : undefined,
            DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra,
            ReferenceNo: refNo || null, Notes: notes, Items: items.map(lineBody),
          };
        } else if (isSale) {
          body = {
            CustomerID: partner!.id, SalesPersonID: salesPerson?.id ?? null, WarehouseID: wh, Date: dateIso, DueDate: dueDate || undefined,
            DiscountPercent: num(discPercent), DiscountAmount: round2(t.discount), TaxPercent: apiTax, ...docExtra, ReferenceNo: refNo || null, Notes: notes,
            ShipName: shipName || null, ShipAddress: shipAddress || null, ShipCity: shipCity || null, ShipPhone: shipPhone || null, Courier: courier || null,
            ...(itemsEditable ? { Items: items.map(lineBody) } : {}),
          };
        } else {
          body = { WarehouseID: wh, Date: dateIso, Reason: notes };
        }
        const res = await api.put<Rec>(cfg.endpoint, id!, body);
        if (!res.success) throw new Error(res.message || "Gagal menyimpan");
        if (isSale) {
          await api.put("sales", `${id}/shipping`, { ShippingStatus: shipStatus, ShippingDate: shipDate || undefined, TrackingNumber: tracking || undefined, Courier: courier || undefined }).catch(() => undefined);
        }
      }
      if (print) printDocument({ ...buildDoc(), code: (record?.Code as string) || code || String(savedId) });
      router.push(cfg.listPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (statusCode2: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await api.put(cfg.endpoint, `${id}/status`, { StatusCode: statusCode2 });
      router.push(cfg.listPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah status");
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingState className="py-16" />;

  const dis = !editable;
  const statusBadge = statusCode || payStatusCode;
  const nextActions: { code: string; label: string }[] = !isNew && !isSale
    ? statusCode === "DRAFT" ? [{ code: "CONFIRMED", label: "Konfirmasi" }, { code: "CANCELLED", label: "Batalkan" }]
      : statusCode === "CONFIRMED" ? [{ code: "COMPLETED", label: "Selesaikan" }, { code: "CANCELLED", label: "Batalkan" }] : []
    : [];

  const totalRow = (label: string, node: React.ReactNode, strong?: boolean) => (
    <div className={cn("flex items-center justify-between gap-3 py-1.5", strong && "border-t border-[#d5d9de] pt-2 text-[16px] font-bold")}>
      <span className="text-[14px] text-[#2b3540]">{label}</span>
      <span className={cn("text-right", !strong && "text-[14px]")}>{node}</span>
    </div>
  );
  const moneyInput = (value: string, onChange: (v: string) => void, extra?: string, disabled?: boolean) => (
    <input
      type="number" min={0} step="any" value={value} disabled={disabled ?? dis}
      onFocus={(e) => e.target.select()} onChange={(e) => onChange(e.target.value)}
      className={cn("h-9 w-36 rounded border border-[#cfd4da] bg-white px-2 text-right text-sm outline-none focus:border-primary disabled:bg-[#f3f4f6]", extra)}
    />
  );

  return (
    <div className="mx-auto max-w-[1400px] pb-8">
      {/* Title bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button type="button" title="Kembali ke daftar" onClick={() => router.push(cfg.listPath)} className="flex size-10 items-center justify-center rounded border border-[#cfd4da] bg-white hover:bg-[#f3f4f6]">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-highlighted">{isNew ? `${cfg.title} Baru` : `${cfg.title} ${code}`}</h2>
        {statusBadge && <Badge variant={(statusVariant[statusBadge] ?? "default") as never}>{statusBadge}</Badge>}
        {!isNew && !editable && <span className="text-sm text-muted">Hanya dapat dilihat (transaksi sudah selesai / batal)</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          {nextActions.map((a) => (
            <button key={a.code} type="button" disabled={saving} onClick={() => void changeStatus(a.code)} className={cn("h-10 rounded border px-4 text-sm", a.code === "CANCELLED" ? "border-danger text-danger hover:bg-danger/10" : "border-info text-info hover:bg-info/10")}>
              {a.label}
            </button>
          ))}
          {!isNew && (
            <button type="button" onClick={() => printDocument(buildDoc())} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">
              <Printer className="size-4" /> Cetak
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

      {/* Header */}
      <KCard>
        <KColumns>
          <div>
            <KCode label="No. Transaksi" value={code} isNew={isNew} />
            <KRow>
              <KInput label="Tanggal" type="date" value={date} disabled={dis} onChange={(e) => { setDate(e.target.value); if (dueDate) setDueDate(dueDate < e.target.value ? e.target.value : dueDate); }} />
              {kind === "purchase" || isSale ? (
                <KInput label="Jatuh Tempo" type="date" value={dueDate} disabled={dis} onChange={(e) => setDueDate(e.target.value)} />
              ) : (
                <KSelect label={isPO ? "Masuk Ke" : isSO ? "Keluar Dari" : "Dari Kantor / Gudang"} value={warehouseId} disabled={dis} onChange={setWarehouseId} options={warehouses} placeholder="Pilih gudang..." />
              )}
            </KRow>
            {(kind === "purchase" || isSale) && (
              <KRow>
                <KNumber
                  label="Hari Jt" value={dueDate ? diffDays(date, dueDate) : ""} disabled={dis} placeholder="0"
                  onChange={(v) => setDueDate(v === "" ? "" : addDays(date, Math.max(0, Math.round(num(v)))))}
                />
                <KSelect label={isPurchase ? "Masuk Ke" : "Keluar Dari"} value={warehouseId} disabled={dis} onChange={setWarehouseId} options={warehouses} placeholder="Pilih gudang..." />
              </KRow>
            )}
            <PartnerLookup
              label={cfg.partnerLabel} endpoint={cfg.partnerEp} value={partner?.name ?? ""}
              disabled={dis || (cfg.isReturn && !isNew) || (!isNew && isPurchase)}
              onPick={(p) => { setPartner({ id: Number(p.value), name: p.label }); void applyPartnerDefaults(Number(p.value)); if (cfg.isReturn) { setRefDoc(null); setItems([]); } if (isSale && soId) { setSoId(""); setSoDp(0); } }}
              onClear={() => { setPartner(null); if (cfg.isReturn) { setRefDoc(null); setItems([]); } if (isSale) { setSoId(""); setSoDp(0); } }}
            />
            {cfg.isReturn && (
              isNew ? (
                <KSelect
                  label={cfg.refLabel} value={refDoc?.id ?? ""} onChange={(v) => void pickInvoice(v)} placeholder={`Pilih ${cfg.refLabel?.toLowerCase()}...`}
                  options={refOptions.map((r) => ({ value: r.ID, label: `${r.Code} - ${toDateInput(r.Date)} - ${formatCurrency(Number(r.Total))}` }))}
                />
              ) : (
                <KInput label={cfg.refLabel} value={refDoc?.name ?? ""} readOnly />
              )
            )}
            {(isSale || isSO) && (
              <PartnerLookup
                label="Sales" endpoint="sales-person" value={salesPerson?.name ?? ""} disabled={dis} placeholder="(opsional)"
                onPick={(p) => setSalesPerson({ id: Number(p.value), name: p.label })} onClear={() => setSalesPerson(null)}
              />
            )}
          </div>
          <div>
            {isPurchase && (
              <KRow>
                <KInput label="No. Faktur Supplier" value={refNo} disabled={dis} onChange={(e) => setRefNo(e.target.value)} />
                <KSelect label="Pesanan" value={poId} disabled={dis || !isNew} onChange={(v) => void pickOrder(v)} options={orders} placeholder="(tanpa pesanan)" />
              </KRow>
            )}
            {isSale && (
              <KRow>
                <KSelect label="Pesanan" value={soId} disabled={dis || !isNew || !partner} onChange={(v) => void pickSaleOrder(v)} options={soOptions} placeholder={partner ? "(tanpa pesanan)" : "Pilih pelanggan dahulu"} />
                <KInput label="No. Referensi / PO Pelanggan" value={refNo} disabled={dis} onChange={(e) => setRefNo(e.target.value)} />
              </KRow>
            )}
            {isOrder && (
              <KRow>
                <KSelect
                  label="Status Pesanan" value={orderStatus} disabled={dis} onChange={(v) => setOrderStatus(v || "WAITING_PAYMENT")}
                  options={PO_STATUS_OPTIONS} placeholder="Menunggu Pembayaran"
                />
                <KInput label="Tanggal Kirim" type="date" value={deliveryDate} disabled={dis} onChange={(e) => setDeliveryDate(e.target.value)} />
              </KRow>
            )}
            {isPurchase && (
              <KSelect label="Metode Pembayaran" value={methodId} disabled={dis} onChange={setMethodId} options={methods} placeholder="Pilih metode..." />
            )}
            {cfg.isReturn && (
              <KRadioGroup
                label="Jenis Pengembalian" value={returnType} onChange={setReturnType} inline
                options={[{ value: "POTONG", label: kind === "purchase-return" ? "Potong Hutang" : "Potong Piutang" }, { value: "TUNAI", label: "Tunai" }, { value: "DEPOSIT", label: "Deposit" }]}
              />
            )}
            <KRadioGroup
              label="PPN" value={taxMode} onChange={(v) => setTaxMode(v as TaxMode)} inline
              options={[{ value: "NON", label: "Non" }, { value: "INCLUDE", label: "Include" }, { value: "EXCLUDE", label: "Exclude" }]}
              hint={taxMode === "INCLUDE" ? "Harga sudah termasuk pajak." : taxMode === "EXCLUDE" ? "Pajak ditambahkan pada total akhir semua barang." : "Tidak menerapkan pajak."}
            />
            {taxMode !== "NON" && <KNumber label="Pajak (%)" value={taxPercent} disabled={dis} onChange={setTaxPercent} />}
          </div>
        </KColumns>
      </KCard>

      {/* Tabs */}
      <div className="mt-4">
        <KTabs
          active={tab} onChange={setTab}
          tabs={[{ key: "detail", label: "Rincian" }, { key: "discount", label: "Potongan" }, { key: "other", label: isSale ? "Keterangan & Pengiriman" : "Keterangan" }]}
        />
        <KCard className="rounded-t-none border-t-0">
          {tab === "detail" && (
            <>
              {!isNew && !cfg.isReturn && !itemsEditable && (
                <KInfoBox variant="info" title="Keterangan">
                  {isPO ? "Item pesanan tidak dapat diganti karena sebagian sudah diterima lewat pembelian." : isSO ? "Item pesanan tidak dapat diganti karena sebagian sudah dijual." : "Rincian item tidak dapat diubah setelah transaksi tersimpan."}
                </KInfoBox>
              )}
              <ItemsGrid
                items={items} onChange={setItems} readOnly={dis || !itemsEditable && !cfg.isReturn || (cfg.isReturn && !isNew)}
                priceField={cfg.priceField} showDiscount={!cfg.isReturn}
                qtyLimit={cfg.isReturn} lockAdd={cfg.isReturn}
                showOrdered={(isPurchase && (!!poId || items.some((l) => l.orderedQty !== undefined))) || (isSale && (!!soId || items.some((l) => l.orderedQty !== undefined)))}
                showReceived={isOrder && !isNew}
              />
              {cfg.isReturn && isNew && items.length > 0 && (
                <button type="button" className="mt-3 h-9 rounded border border-[#cfd4da] bg-white px-3 text-sm hover:bg-[#f3f4f6]" onClick={() => setItems(items.map((l) => ({ ...l, qty: String(l.maxQty ?? l.qty) })))}>
                  Retur semua jumlah
                </button>
              )}
            </>
          )}
          {tab === "discount" && (
            <div className="max-w-2xl">
              <KInfoBox variant="info" title="Keterangan">
                Potongan (%) pada bagian total dikenakan sama rata pada seluruh item. Tambahkan baris di bawah untuk potongan bertingkat; setiap baris dihitung berurutan dari sisa nilai setelah potongan sebelumnya.
              </KInfoBox>
              <KEditableGrid<TierDiscount>
                columns={[{ key: "percent", label: "Potongan (%)", type: "number" }, { key: "amount", label: "Potongan (Rp)", type: "number" }]}
                rows={tiers} onChange={dis ? () => undefined : setTiers} newRow={() => ({ key: newKey(), percent: "", amount: "" })}
                addLabel="Tambah Data" emptyText="Tidak ada potongan bertingkat"
              />
            </div>
          )}
          {tab === "other" && (
            <KColumns>
              <KTextarea label={cfg.isReturn ? "Keterangan / Alasan Retur" : "Keterangan"} value={notes} disabled={dis} onChange={(e) => setNotes(e.target.value)} rows={5} />
              {isSale && (
                <div>
                  <KSelect label="Status Pengiriman" value={shipStatus} onChange={setShipStatus} disabled={dis} options={[{ value: "PENDING", label: "Pending" }, { value: "SHIPPED", label: "Terkirim" }]} placeholder="Pilih status..." />
                  <KRow>
                    <KInput label="Tanggal Kirim" type="date" value={shipDate} disabled={dis} onChange={(e) => setShipDate(e.target.value)} />
                    <KInput label="No. Resi" value={tracking} disabled={dis} onChange={(e) => setTracking(e.target.value)} />
                  </KRow>
                  <KInput label="Kurir" value={courier} disabled={dis} onChange={(e) => setCourier(e.target.value)} />
                  <button type="button" onClick={() => setShowShip(true)} className="mt-1 inline-flex h-9 items-center gap-2 rounded border border-[#cfd4da] bg-white px-3 text-sm hover:bg-[#f3f4f6]">
                    <MapPin className="size-4 text-[#8e44ad]" /> Alamat Kirim{shipAddress ? `: ${shipName ? `${shipName}, ` : ""}${shipAddress}${shipCity ? `, ${shipCity}` : ""}` : ""}
                  </button>
                </div>
              )}
            </KColumns>
          )}
        </KCard>
      </div>

      {/* Totals */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <KCard>
          {!cfg.isReturn ? (
            <>
              <KTextarea label="Keterangan" value={notes} disabled={dis} onChange={(e) => setNotes(e.target.value)} rows={3} />
              {isSale && salesPerson && (
                <p className="mt-2 text-xs text-muted">Komisi sales dihitung dari pengaturan komisi pada master Sales dan dibayar lewat menu Komisi Sales setelah faktur lunas.</p>
              )}
            </>
          ) : (
            <KTextarea label="Keterangan / Alasan Retur" value={notes} disabled={dis} onChange={(e) => setNotes(e.target.value)} rows={3} />
          )}
        </KCard>
        <KCard>
          {totalRow("Subtotal", formatCurrency(t.subtotal))}
          {totalRow("Potongan (%)", moneyInput(discPercent, setDiscPercent))}
          {totalRow("Potongan (Rp)", moneyInput(discAmount, setDiscAmount))}
          {(t.discount > 0) && totalRow("Total Potongan", <span className="text-danger">- {formatCurrency(t.discount)}</span>)}
          {totalRow(taxMode === "INCLUDE" ? `PPN ${num(taxPercent)}% (termasuk)` : `PPN ${taxMode === "EXCLUDE" ? num(taxPercent) + "%" : ""}`, formatCurrency(t.tax))}
          {totalRow("Biaya Lain", (
            <span className="inline-flex items-center gap-2">
              <select value={otherCostAdds ? "add" : "no"} disabled={dis} onChange={(e) => setOtherCostAdds(e.target.value === "add")} className="h-9 rounded border border-[#cfd4da] bg-white px-1 text-xs">
                <option value="add">Ditambah ke total</option>
                <option value="no">Tidak ditambah</option>
              </select>
              {moneyInput(otherCost, setOtherCost)}
            </span>
          ))}
          {totalRow("Total", formatCurrency(t.total), true)}
          {isOrder && (
            <>
              {totalRow(isSO ? "DP Pesanan" : "Titip / DP", moneyInput(dp, setDp))}
              {isSO && num(dp) > 0 && totalRow("Cara Bayar DP", (
                <select value={dpMethodId} disabled={dis} onChange={(e) => setDpMethodId(e.target.value)} className="h-9 w-44 rounded border border-[#cfd4da] bg-white px-2 text-sm">
                  {methods.filter((m) => m.code !== "DEPOSIT").map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              ))}
              {totalRow("Sisa", <span className={remaining > 0 ? "font-bold text-danger" : ""}>{formatCurrency(Math.max(0, t.total - paidNow))}</span>)}
            </>
          )}
          {isSale && (
            <div className="mt-3 border-t border-[#eceff2] pt-3">
              {isNew && dpSoUsed > 0 && totalRow("DP SO/Pesanan", formatCurrency(dpSoUsed))}
              {totalRow("Dibayar", formatCurrency(paid))}
              {totalRow("Bayar Kredit (Piutang)", <span className={remaining > 0 ? "font-bold text-danger" : ""}>{formatCurrency(remaining)}</span>)}
              {change > 0 && totalRow("Kembali", formatCurrency(change))}
              {!isNew && remaining > 0 && <p className="mt-1 text-xs text-muted">Pelunasan piutang dicatat lewat menu Bayar Piutang.</p>}
            </div>
          )}
          {!cfg.isReturn && !isOrder && !isSale && (
            <>
              <div className="mt-3 border-t border-[#eceff2] pt-3">
                <KRadioGroup
                  label="Pembayaran" value={payType} inline
                  onChange={(v) => { if (isNew) setPayType(v as PayType); }}
                  options={[{ value: "TUNAI", label: "Tunai (Lunas)" }, { value: "KREDIT", label: "Kredit" }, { value: "DP", label: "Titip / DP" }]}
                />
              </div>
              {isNew ? (
                <>
                  {payType === "DP" && totalRow("Tunai / DP", moneyInput(dp, setDp, undefined, false))}
                  {totalRow("Deposit", moneyInput(deposit, setDeposit))}
                  {totalRow("Dibayar", formatCurrency(paid))}
                </>
              ) : (
                totalRow("Dibayar", formatCurrency(paid))
              )}
              {totalRow("Sisa", <span className={remaining > 0 ? "font-bold text-danger" : ""}>{formatCurrency(remaining)}</span>)}
              {change > 0 && totalRow("Kembali", formatCurrency(change))}
            </>
          )}
        </KCard>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {editable && (
          <>
            <button type="button" disabled={saving} onClick={() => void save(false)} className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-5 text-[15px] font-medium text-white hover:bg-[#43a047] disabled:opacity-60">
              <Save className="size-4" /> {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" disabled={saving} onClick={() => void save(true)} className="inline-flex h-10 items-center gap-2 rounded border border-[#4caf50] bg-white px-5 text-[15px] font-medium text-[#3d8b40] hover:bg-[#f1f8f1] disabled:opacity-60">
              <Printer className="size-4" /> Simpan &amp; Cetak
            </button>
            {isSale && isNew && (
              <button type="button" disabled={saving} onClick={() => { const v = validate(); if (v) { setError(v); return; } setShowPay(true); }} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-5 text-[15px] hover:bg-[#f3f4f6] disabled:opacity-60">
                <CreditCard className="size-4 text-[#c08a00]" /> Bayar
              </button>
            )}
            {isSale && (
              <button type="button" onClick={() => setShowShip(true)} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-5 text-[15px] hover:bg-[#f3f4f6]">
                <MapPin className="size-4 text-[#8e44ad]" /> Alamat Kirim
              </button>
            )}
          </>
        )}
        <button type="button" onClick={() => router.push(cfg.listPath)} className="h-10 rounded border border-[#cfd4da] bg-white px-5 text-[15px] hover:bg-[#f3f4f6]">
          {editable ? "Batal" : "Kembali"}
        </button>
      </div>

      {isSale && (
        <SalePayDialog
          open={showPay} onClose={() => setShowPay(false)} total={t.total} dpSo={dpSoUsed} depositBalance={depositBalance}
          value={pay} onChange={setPay} saving={saving} onSave={(print) => { setShowPay(false); void save(print); }}
        />
      )}
      {isSale && (
        <Modal open={showShip} onClose={() => setShowShip(false)} title="Alamat Kirim" size="md">
          <div className="space-y-1">
            <KInput label="Nama Penerima" value={shipName} disabled={dis} onChange={(e) => setShipName(e.target.value)} />
            <KTextarea label="Alamat" rows={3} value={shipAddress} disabled={dis} onChange={(e) => setShipAddress(e.target.value)} />
            <KRow>
              <KInput label="Kota" value={shipCity} disabled={dis} onChange={(e) => setShipCity(e.target.value)} />
              <KInput label="Telepon" value={shipPhone} disabled={dis} onChange={(e) => setShipPhone(e.target.value)} />
            </KRow>
            <KInput label="Kurir" value={courier} disabled={dis} onChange={(e) => setCourier(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              {partner && !dis && (
                <button type="button" className="h-9 rounded border border-[#cfd4da] bg-white px-3 text-sm hover:bg-[#f3f4f6]" onClick={() => void api.get<Rec>(`customer/${partner.id}`, undefined, { skipCache: true }).then((r) => {
                  const c = r.data; if (!c) return;
                  setShipName(c.Name ?? ""); setShipAddress(c.Address ?? ""); setShipCity(c.City ?? ""); setShipPhone(c.Phone ?? c.Mobile ?? "");
                }).catch(() => undefined)}>
                  Salin dari data pelanggan
                </button>
              )}
              <button type="button" className="h-9 rounded bg-[#4caf50] px-4 text-sm text-white" onClick={() => setShowShip(false)}>OK</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
