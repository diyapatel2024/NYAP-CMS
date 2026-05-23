"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Loading } from "@/components/shared/loading"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Trash2, History, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface CustomerProductEntry {
  _id: string
  productId: { _id: string; name: string; unit: string }
  customPrice: number
}

interface ProductOption {
  _id: string
  name: string
  unit: string
  sellingPrice: number
}

export function CustomerProducts({ customerId, customerName }: { customerId: string; customerName: string }) {
  const { data: customerProducts, error, mutate } = useSWR<CustomerProductEntry[]>(
    `/api/customers/${customerId}/products`,
    fetcher
  )
  const { data: allProducts } = useSWR<ProductOption[]>("/api/products", fetcher)
  const { toast } = useToast()
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<CustomerProductEntry | null>(null)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [customPrice, setCustomPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  // Filter out already-assigned products
  const assignedIds = new Set(customerProducts?.map((cp) => cp.productId._id) || [])
  const availableProducts = allProducts?.filter((p) => !assignedIds.has(p._id)) || []

  async function handleAssign() {
    if (!selectedProduct) return
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct, customPrice }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to assign")
      }
      toast({ title: "Product assigned" })
      mutate()
      setAddOpen(false)
      setSelectedProduct("")
      setCustomPrice(0)
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePrice() {
    if (!editItem) return
    setLoading(true)
    try {
      const res = await fetch(`/api/customer-products/${editItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrice }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast({ title: "Price updated" })
      mutate()
      setEditOpen(false)
      setEditItem(null)
    } catch {
      toast({ title: "Error", description: "Failed to update price", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(id: string) {
    try {
      const res = await fetch(`/api/customer-products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to remove")
      toast({ title: "Product removed" })
      mutate()
    } catch {
      toast({ title: "Error", description: "Failed to remove product", variant: "destructive" })
    }
  }

  if (error) return <p className="text-destructive">Failed to load customer products.</p>
  if (!customerProducts) return <Loading message="Loading assigned products..." />

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products for {customerName}</CardTitle>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Assign Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Product to {customerName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={(v) => {
                    setSelectedProduct(v)
                    const p = allProducts?.find((p) => p._id === v)
                    if (p) setCustomPrice(p.sellingPrice)
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((p) => (
                      <SelectItem key={p._id} value={p._id}>{p.name} ({formatCurrency(p.sellingPrice)}/{p.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Custom Price</Label>
                <Input type="number" step="0.01" min="0" value={customPrice} onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={loading || !selectedProduct}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {customerProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No products assigned yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Custom Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerProducts.map((cp) => (
                <TableRow key={cp._id}>
                  <TableCell className="font-medium">{cp.productId.name}</TableCell>
                  <TableCell className="capitalize">{cp.productId.unit}</TableCell>
                  <TableCell>{formatCurrency(cp.customPrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/customers/${customerId}/products/${cp._id}/price-history`, "_self")}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditItem(cp); setCustomPrice(cp.customPrice); setEditOpen(true) }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteDialog
                        title="Remove product?"
                        description="This will remove this product assignment from the customer."
                        onConfirm={() => handleRemove(cp._id)}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Price Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Price - {editItem?.productId.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Custom Price</Label>
              <Input type="number" step="0.01" min="0" value={customPrice} onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePrice} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
