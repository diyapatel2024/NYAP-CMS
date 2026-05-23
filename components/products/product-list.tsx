"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { DataTable, Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Edit, Trash2, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Product {
  _id: string
  name: string
  vendorId: { _id: string; name: string }
  unit: string
  purchasePrice: number
  sellingPrice: number
  status: string
  [key: string]: unknown
}

export function ProductList() {
  const { data: products, error, mutate } = useSWR<Product[]>("/api/products", fetcher)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Product deleted" })
      mutate()
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" })
    }
  }

  if (error) return <p className="text-destructive">Failed to load products.</p>
  if (!products) return <Loading message="Loading products..." />

  const columns: Column<Product>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "vendorId", label: "Vendor", render: (p) => p.vendorId?.name || "N/A" },
    { key: "unit", label: "Unit", render: (p) => p.unit.charAt(0).toUpperCase() + p.unit.slice(1) },
    { key: "purchasePrice", label: "Purchase Price", sortable: true, render: (p) => formatCurrency(p.purchasePrice) },
    { key: "sellingPrice", label: "Selling Price", sortable: true, render: (p) => formatCurrency(p.sellingPrice) },
    { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/products/${p._id}/price-history`)}>
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/products/${p._id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteDialog
            onConfirm={() => handleDelete(p._id)}
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
      data={products}
      searchKey="name"
      searchPlaceholder="Search products..."
      emptyMessage="No products yet. Create your first product."
    />
  )
}
