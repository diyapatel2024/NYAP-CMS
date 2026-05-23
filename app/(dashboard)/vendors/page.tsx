import { PageHeader } from "@/components/shared/page-header"
import { VendorList } from "@/components/vendors/vendor-list"

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your dairy product vendors"
        createHref="/vendors/new"
        createLabel="Add Vendor"
      />
      <VendorList />
    </div>
  )
}
