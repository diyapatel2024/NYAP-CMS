import { PageHeader } from "@/components/shared/page-header"
import { CustomerList } from "@/components/customers/customer-list"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your dairy delivery customers"
        createHref="/customers/new"
        createLabel="Add Customer"
      />
      <CustomerList />
    </div>
  )
}
