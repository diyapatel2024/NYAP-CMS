"use client"

import useSWR from "swr"
import { DataTable, Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface BulkOrderEntry {
  _id: string
  deliveryDate: string
  totalOrders: number
  totalAmount: number
  status: string
  createdAt: string
  [key: string]: unknown
}

export function BulkOrderList() {
  const { data: bulkOrders, error } = useSWR<BulkOrderEntry[]>("/api/bulk-orders", fetcher)

  if (error) return <p className="text-destructive">Failed to load bulk orders.</p>
  if (!bulkOrders) return <Loading message="Loading bulk orders..." />

  const columns: Column<BulkOrderEntry>[] = [
    {
      key: "deliveryDate",
      label: "Delivery Date",
      sortable: true,
      render: (b) => new Date(b.deliveryDate).toLocaleDateString(),
    },
    { key: "totalOrders", label: "Orders", sortable: true },
    {
      key: "totalAmount",
      label: "Total Amount",
      sortable: true,
      render: (b) => formatCurrency(b.totalAmount),
    },
    { key: "status", label: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "createdAt",
      label: "Created",
      render: (b) => new Date(b.createdAt).toLocaleString(),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={bulkOrders}
      emptyMessage="No bulk orders yet."
    />
  )
}
