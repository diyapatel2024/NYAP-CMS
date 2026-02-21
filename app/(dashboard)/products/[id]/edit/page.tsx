"use client"

import { use } from "react"
import useSWR from "swr"
import { ProductForm } from "@/components/products/product-form"
import { Loading } from "@/components/shared/loading"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: product, error } = useSWR(`/api/products/${id}`, fetcher)

  if (error) return <p className="text-destructive">Failed to load product.</p>
  if (!product) return <Loading message="Loading product..." />

  return (
    <div className="max-w-2xl">
      <ProductForm initialData={product} />
    </div>
  )
}
