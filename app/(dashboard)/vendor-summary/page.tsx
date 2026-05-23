import { PageHeader } from "@/components/shared/page-header"
import { VendorSummaryView } from "@/components/dashboard/vendor-summary-view"

export default function VendorSummaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Purchase Summary"
        description="Tomorrow's vendor purchase requirements grouped by vendor and product"
      />
      <VendorSummaryView />
    </div>
  )
}
