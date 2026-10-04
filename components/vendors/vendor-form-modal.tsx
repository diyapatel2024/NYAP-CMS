"use client"

import { useState } from "react"
import { mutate } from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { VendorForm } from "./vendor-form"

interface VendorData {
  _id: string
  name: string
  location?: string
  mobileNumber?: string
  contactNumber?: string
  status: string
}

interface VendorFormModalProps {
  initialData?: VendorData
  trigger?: React.ReactNode
}

export function VendorFormModal({ initialData, trigger }: VendorFormModalProps) {
  const [open, setOpen] = useState(false)
  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
        </DialogHeader>
        <VendorForm
          initialData={initialData}
          onSuccess={() => {
            setOpen(false)
            mutate("/api/vendors")
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
