"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { DataTable, Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Edit, Trash2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Customer {
  _id: string
  name: string
  businessName?: string
  phone?: string
  route?: string
  status: string
  [key: string]: unknown
}

export function CustomerList() {
  const { data: customers, error, mutate } = useSWR<Customer[]>("/api/customers", fetcher)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Customer deleted" })
      mutate()
    } catch {
      toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" })
    }
  }

  if (error) return <p className="text-destructive">Failed to load customers.</p>
  if (!customers) return <Loading message="Loading customers..." />

  const columns: Column<Customer>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "businessName", label: "Business" },
    { key: "phone", label: "Phone" },
    { key: "route", label: "Route" },
    { key: "status", label: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/customers/${c._id}/products`)}>
            <Package className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/customers/${c._id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteDialog
            onConfirm={() => handleDelete(c._id)}
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
      data={customers}
      searchKey="name"
      searchPlaceholder="Search customers..."
      emptyMessage="No customers yet. Create your first customer."
    />
  )
}
