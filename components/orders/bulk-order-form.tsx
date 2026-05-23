"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BulkOrderForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: customers } = useSWR("/api/customers", fetcher)
  const [loading, setLoading] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  })
  const [notes, setNotes] = useState("")

  const activeCustomers = customers?.filter((c: { status: string }) => c.status === "active")?.length || 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/bulk-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate, notes }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create bulk order")
      }
      const data = await res.json()
      toast({
        title: "Bulk order created",
        description: `${data.totalOrders} orders generated for ${deliveryDate}`,
      })
      router.push("/bulk-orders")
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
          <CardTitle>Create Bulk Order</CardTitle>
          <CardDescription>
            Generate orders for all active customers with their assigned products and default quantities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-300">This will create individual orders for {activeCustomers} active customers</p>
                <p className="text-blue-700 dark:text-blue-400 mt-1">Each order will include all products assigned to the customer with quantity 1 and their custom pricing.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date *</Label>
              <Input id="deliveryDate" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional bulk order notes..." />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading || activeCustomers === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate {activeCustomers} Orders
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
