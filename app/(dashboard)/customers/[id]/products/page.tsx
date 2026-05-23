"use client"

import { use } from "react"
import useSWR from "swr"
import { CustomerProducts } from "@/components/customers/customer-products"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CustomerProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: customer, error } = useSWR(`/api/customers/${id}`, fetcher)

  if (error) return <p className="text-destructive">Failed to load customer.</p>
  if (!customer) return <Loading message="Loading customer..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Products" description={`Product assignments and pricing for ${customer.name}`}>
        <Button variant="outline" asChild>
          <Link href="/customers"><ArrowLeft className="mr-2 h-4 w-4" />Back to Customers</Link>
        </Button>
      </PageHeader>
      <CustomerProducts customerId={id} customerName={customer.name} />
    </div>
  )
}
