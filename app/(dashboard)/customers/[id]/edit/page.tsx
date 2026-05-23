"use client"

import { use } from "react"
import useSWR from "swr"
import { CustomerForm } from "@/components/customers/customer-form"
import { Loading } from "@/components/shared/loading"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: customer, error } = useSWR(`/api/customers/${id}`, fetcher)

  if (error) return <p className="text-destructive">Failed to load customer.</p>
  if (!customer) return <Loading message="Loading customer..." />

  return (
    <div className="max-w-2xl">
      <CustomerForm initialData={customer} />
    </div>
  )
}
