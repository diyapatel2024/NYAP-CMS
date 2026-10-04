"use client"

import { useState } from "react"
import useSWR from "swr"
import { CustomerProducts } from "@/components/customers/customer-products"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface CustomerOption {
  _id: string
  name: string
  businessName?: string
}

export default function CustomerProductsPage() {
  const { data, error } = useSWR<CustomerOption[]>("/api/customers", fetcher)
  const [customerId, setCustomerId] = useState("")

  const customers = Array.isArray(data) ? data : undefined
  const selected = customers?.find((c) => c._id === customerId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Pricing"
        description="Assign products and set per-customer prices"
      />

      <div className="max-w-sm space-y-2">
        <Label>Customer</Label>
        {error ? (
          <p className="text-destructive text-sm">Failed to load customers.</p>
        ) : !customers ? (
          <Loading message="Loading customers..." />
        ) : (
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}{c.businessName ? ` — ${c.businessName}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selected && (
        <CustomerProducts customerId={selected._id} customerName={selected.name} />
      )}
    </div>
  )
}
