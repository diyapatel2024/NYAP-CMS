"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { DataTable, Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Vendor {
  _id: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  status: string
  [key: string]: unknown
}

export function VendorList() {
  const { data: vendors, error, mutate } = useSWR<Vendor[]>("/api/vendors", fetcher)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Vendor deleted" })
      mutate()
    } catch {
      toast({ title: "Error", description: "Failed to delete vendor", variant: "destructive" })
    }
  }

  if (error) return <p className="text-destructive">Failed to load vendors.</p>
  if (!vendors) return <Loading message="Loading vendors..." />

  const columns: Column<Vendor>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "contactPerson", label: "Contact Person" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (v) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/vendors/${v._id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteDialog
            onConfirm={() => handleDelete(v._id)}
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
      data={vendors}
      searchKey="name"
      searchPlaceholder="Search vendors..."
      emptyMessage="No vendors yet. Create your first vendor."
    />
  )
}
