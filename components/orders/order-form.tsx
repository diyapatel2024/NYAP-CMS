"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Loader2, Plus, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface OrderItemRow {
  productId: string
  productName: string
  unit: string
  quantity: number
  price: number
  priceOverride: number | null
}

interface CustomerProduct {
  _id: string
  productId: { _id: string; name: string; unit: string }
  customPrice: number
}

export function OrderForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: customers } = useSWR("/api/customers", fetcher)
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState("")
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  })
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItemRow[]>([])
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([])

  // Load customer products when customer changes
  useEffect(() => {
    if (!customerId) {
      setCustomerProducts([])
      setItems([])
      return
    }
    fetch(`/api/customers/${customerId}/products`)
      .then((r) => r.json())
      .then((data) => {
        setCustomerProducts(data)
        // Auto-populate items with all assigned products
        const autoItems: OrderItemRow[] = data.map((cp: CustomerProduct) => ({
          productId: cp.productId._id,
          productName: cp.productId.name,
          unit: cp.productId.unit,
          quantity: 1,
          price: cp.customPrice,
          priceOverride: null,
        }))
        setItems(autoItems)
      })
      .catch(() => setCustomerProducts([]))
  }, [customerId])

  function addItem() {
    // Show available products not yet added
    const addedIds = new Set(items.map((i) => i.productId))
    const available = customerProducts.filter((cp) => !addedIds.has(cp.productId._id))
    if (available.length === 0) {
      toast({ title: "All assigned products already added", variant: "destructive" })
      return
    }
    const first = available[0]
    setItems([
      ...items,
      {
        productId: first.productId._id,
        productName: first.productId.name,
        unit: first.productId.unit,
        quantity: 1,
        price: first.customPrice,
        priceOverride: null,
      },
    ])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: unknown) {
    const updated = [...items]
    if (field === "productId") {
      const cp = customerProducts.find((c) => c.productId._id === value)
      if (cp) {
        updated[index] = {
          ...updated[index],
          productId: cp.productId._id,
          productName: cp.productId.name,
          unit: cp.productId.unit,
          price: cp.customPrice,
          priceOverride: null,
        }
      }
    } else {
      (updated[index] as Record<string, unknown>)[field] = value
    }
    setItems(updated)
  }

  const totalAmount = items.reduce((sum, item) => {
    const price = item.priceOverride !== null ? item.priceOverride : item.price
    return sum + price * item.quantity
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId || items.length === 0) {
      toast({ title: "Please select a customer and add at least one item", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const payload = {
        customerId,
        deliveryDate,
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceOverride: item.priceOverride,
        })),
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create order")
      }
      toast({ title: "Order created", description: `Total: ${formatCurrency(totalAmount)}` })
      router.push("/orders")
      router.refresh()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.filter((c: { status: string }) => c.status === "active").map((c: { _id: string; name: string; businessName?: string }) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}{c.businessName ? ` (${c.businessName})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date *</Label>
              <Input id="deliveryDate" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
            </div>
          </div>

          {customerId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />Add Item
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {customerProducts.length === 0
                    ? "No products assigned to this customer. Assign products first."
                    : "Click 'Add Item' to add products to this order."}
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Override</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, i) => {
                        const effectivePrice = item.priceOverride !== null ? item.priceOverride : item.price
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <Select value={item.productId} onValueChange={(v) => updateItem(i, "productId", v)}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {customerProducts.map((cp) => (
                                    <SelectItem key={cp.productId._id} value={cp.productId._id}>{cp.productId.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="capitalize">{item.unit}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={item.quantity}
                                onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatCurrency(item.price)}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="--"
                                value={item.priceOverride ?? ""}
                                onChange={(e) => updateItem(i, "priceOverride", e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(effectivePrice * item.quantity)}</TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              {items.length > 0 && (
                <div className="flex justify-end">
                  <div className="rounded-lg bg-primary/5 px-6 py-3 border border-primary/20">
                    <p className="text-lg font-semibold text-foreground">Total: {formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional order notes..." />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading || items.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Order
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
