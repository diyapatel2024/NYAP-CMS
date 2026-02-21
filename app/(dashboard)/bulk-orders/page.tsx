import { PageHeader } from "@/components/shared/page-header"
import { BulkOrderList } from "@/components/orders/bulk-order-list"

export default function BulkOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Orders"
        description="Generate orders for all active customers at once"
        createHref="/bulk-orders/new"
        createLabel="New Bulk Order"
      />
      <BulkOrderList />
    </div>
  )
}
