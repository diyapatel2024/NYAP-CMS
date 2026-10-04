"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface VendorFormProps {
  initialData?: {
    _id: string
    name: string
    location?: string
    mobileNumber?: string
    contactNumber?: string
    status: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function VendorForm({ initialData, onSuccess, onCancel }: VendorFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isModal = !!onSuccess
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name || "",
    location: initialData?.location || "",
    mobileNumber: initialData?.mobileNumber || "",
    contactNumber: initialData?.contactNumber || "",
    status: initialData?.status || "active",
  })

  const isEdit = !!initialData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isEdit ? `/api/vendors/${initialData._id}` : "/api/vendors"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(parseApiError(data.error, "Validation failed"))
      }
      toast({ title: isEdit ? "Vendor updated" : "Vendor created", description: `${form.name} has been ${isEdit ? "updated" : "created"} successfully.` })
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/vendors")
        router.refresh()
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fields = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Vendor Name *</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input id="mobileNumber" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input id="contactNumber" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Textarea id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} rows={3} />
      </div>
      <div className="space-y-2 max-w-xs">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={() => (onCancel ? onCancel() : router.back())}>Cancel</Button>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Vendor" : "Create Vendor"}
      </Button>
    </>
  )

  if (isModal) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields}
        <div className="flex justify-between pt-2">{footer}</div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Vendor" : "Add New Vendor"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{fields}</CardContent>
        <CardFooter className="flex justify-between">{footer}</CardFooter>
      </Card>
    </form>
  )
}
