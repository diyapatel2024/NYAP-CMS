"use client"

import { use } from "react"
import useSWR from "swr"
import { PriceHistoryView } from "@/components/products/price-history"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductPriceHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: product, error } = useSWR(`/api/products/${id}`, fetcher)

  if (error) return <p className="text-destructive">Failed to load product.</p>
  if (!product) return <Loading message="Loading product..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Price History" description={`Version history for ${product.name}`}>
        <Button variant="outline" asChild>
          <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" />Back to Products</Link>
        </Button>
      </PageHeader>
      <PriceHistoryView productId={id} productName={product.name} />
    </div>
  )
}
