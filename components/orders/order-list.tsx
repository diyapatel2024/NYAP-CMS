"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { DataTable, Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface OrderEntry {
  _id: string
  customerId: { _id: string; name: string; route?: string }
  deliveryDate: string
  status: string
  totalAmount: number
  items: unknown[]
  [key: string]: unknown
}

export function OrderList() {
  const { data: orders, error, mutate } = useSWR<OrderEntry[]>("/api/orders", fetcher)
  const router = useRouter()
  const { toast } = useToast()

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast({ title: `Order marked as ${status}` })
      mutate()
    } catch {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" })
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Order deleted" })
      mutate()
    } catch {
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" })
    }
  }

  if (error) return <p className="text-destructive">Failed to load orders.</p>
  if (!orders) return <Loading message="Loading orders..." />

  const columns: Column<OrderEntry>[] = [
    {
      key: "customerId",
      label: "Customer",
      render: (o) => (
        <div>
          <p className="font-medium">{o.customerId?.name || "N/A"}</p>
          {o.customerId?.route && <p className="text-xs text-muted-foreground">{o.customerId.route}</p>}
        </div>
      ),
    },
    {
      key: "deliveryDate",
      label: "Delivery Date",
      sortable: true,
      render: (o) => new Date(o.deliveryDate).toLocaleDateString(),
    },
    {
      key: "items",
      label: "Items",
      render: (o) => <span>{o.items?.length || 0} items</span>,
    },
    {
      key: "totalAmount",
      label: "Total",
      sortable: true,
      render: (o) => <span className="font-medium">{formatCurrency(o.totalAmount)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (o) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select value={o.status} onValueChange={(v) => handleStatusChange(o._id, v)}>
            <SelectTrigger className="w-32 h-8">
              <StatusBadge status={o.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (o) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/${o._id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <DeleteDialog
            onConfirm={() => handleDelete(o._id)}
            trigger={
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      searchKey="customerId"
      searchPlaceholder="Search orders..."
      emptyMessage="No orders yet. Create your first order."
    />
  )
}
