"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ProductFormProps {
  initialData?: {
    _id: string
    name: string
    vendorId: { _id: string } | string
    unit: string
    purchasePrice: number
    sellingPrice: number
    status: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: vendors } = useSWR("/api/vendors", fetcher)
  const [loading, setLoading] = useState(false)
  const isModal = !!onSuccess

  const vendorIdValue = initialData?.vendorId
    ? typeof initialData.vendorId === "object"
      ? initialData.vendorId._id
      : initialData.vendorId
    : ""

  const [form, setForm] = useState({
    name: initialData?.name || "",
    vendorId: vendorIdValue,
    unit: initialData?.unit || "litre",
    purchasePrice: initialData?.purchasePrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
    status: initialData?.status || "active",
  })

  const isEdit = !!initialData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isEdit ? `/api/products/${initialData._id}` : "/api/products"
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
      toast({ title: isEdit ? "Product updated" : "Product created", description: `${form.name} has been ${isEdit ? "updated" : "created"} successfully.` })
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/products")
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
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select value={form.vendorId} onValueChange={(v) => setForm({ ...form, vendorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors?.filter((v: { status: string }) => v.status === "active").map((v: { _id: string; name: string }) => (
                    <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="litre">Litre</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input id="purchasePrice" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input id="sellingPrice" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.purchasePrice > 0 && form.sellingPrice > 0 && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Margin: <span className="font-medium text-foreground">
                  {((form.sellingPrice - form.purchasePrice) / form.sellingPrice * 100).toFixed(1)}%
                </span>
                {" | "}Profit per unit: <span className="font-medium text-foreground">
                  ${(form.sellingPrice - form.purchasePrice).toFixed(2)}
                </span>
              </p>
            </div>
          )}
    </>
  )

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={() => (onCancel ? onCancel() : router.back())}>Cancel</Button>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Product" : "Create Product"}
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
          <CardTitle>{isEdit ? "Edit Product" : "Add New Product"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{fields}</CardContent>
        <CardFooter className="flex justify-between">{footer}</CardFooter>
      </Card>
    </form>
  )
}
