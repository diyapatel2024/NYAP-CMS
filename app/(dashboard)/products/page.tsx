import { PageHeader } from "@/components/shared/page-header"
import { ProductList } from "@/components/products/product-list"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your dairy products and pricing"
        createHref="/products/new"
        createLabel="Add Product"
      />
      <ProductList />
    </div>
  )
}
