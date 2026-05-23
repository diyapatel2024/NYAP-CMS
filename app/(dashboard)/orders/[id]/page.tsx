"use client"

import { use } from "react"
import { OrderDetail } from "@/components/orders/order-detail"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="space-y-6">
      <PageHeader title="Order Details" description="View order information and items">
        <Button variant="outline" asChild>
          <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to Orders</Link>
        </Button>
      </PageHeader>
      <OrderDetail orderId={id} />
    </div>
  )
}
