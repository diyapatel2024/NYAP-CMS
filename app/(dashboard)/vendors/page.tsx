import { PageHeader } from "@/components/shared/page-header"
import { VendorList } from "@/components/vendors/vendor-list"
import { VendorFormModal } from "@/components/vendors/vendor-form-modal"

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your dairy product vendors"
      >
        <VendorFormModal />
      </PageHeader>
      <VendorList />
    </div>
  )
}
