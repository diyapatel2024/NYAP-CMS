import { PageHeader } from "@/components/shared/page-header"
import { OrderList } from "@/components/orders/order-list"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage daily customer orders"
        createHref="/orders/new"
        createLabel="New Order"
      />
      <OrderList />
    </div>
  )
}
