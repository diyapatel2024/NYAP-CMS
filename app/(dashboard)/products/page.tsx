import { PageHeader } from "@/components/shared/page-header"
import { ProductList } from "@/components/products/product-list"
import { ProductFormModal } from "@/components/products/product-form-modal"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your dairy products and pricing"
      >
        <ProductFormModal />
      </PageHeader>
      <ProductList />
    </div>
  )
}
