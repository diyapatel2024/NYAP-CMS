"use client"

import { useState } from "react"
import { mutate } from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductForm } from "./product-form"

interface ProductData {
  _id: string
  name: string
  vendorId: { _id: string } | string
  unit: string
  purchasePrice: number
  sellingPrice: number
  status: string
}

interface ProductFormModalProps {
  initialData?: ProductData
  trigger?: React.ReactNode
}

export function ProductFormModal({ initialData, trigger }: ProductFormModalProps) {
  const [open, setOpen] = useState(false)
  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={initialData}
          onSuccess={() => {
            setOpen(false)
            mutate("/api/products")
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
