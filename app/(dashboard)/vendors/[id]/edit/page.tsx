"use client"

import { use } from "react"
import useSWR from "swr"
import { VendorForm } from "@/components/vendors/vendor-form"
import { Loading } from "@/components/shared/loading"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: vendor, error } = useSWR(`/api/vendors/${id}`, fetcher)

  if (error) return <p className="text-destructive">Failed to load vendor.</p>
  if (!vendor) return <Loading message="Loading vendor..." />

  return (
    <div className="max-w-2xl">
      <VendorForm initialData={vendor} />
    </div>
  )
}
