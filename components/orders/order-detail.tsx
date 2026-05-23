"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface OrderDetailData {
  _id: string
  customerId: { name: string; businessName?: string; route?: string; phone?: string }
  deliveryDate: string
  status: string
  totalAmount: number
  notes?: string
  createdAt: string
  items: Array<{
    _id: string
    productId: { name: string; unit: string }
    quantity: number
    finalPriceUsed: number
    itemTotal: number
  }>
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { data: order, error } = useSWR<OrderDetailData>(`/api/orders/${orderId}`, fetcher)

  if (error) return <p className="text-destructive">Failed to load order.</p>
  if (!order) return <Loading message="Loading order details..." />

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Date</span>
              <span className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-bold">{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.notes && (
              <div>
                <span className="text-muted-foreground block mb-1">Notes</span>
                <p className="text-sm bg-muted/50 rounded-md p-2">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{order.customerId?.name}</span>
            </div>
            {order.customerId?.businessName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span>{order.customerId.businessName}</span>
              </div>
            )}
            {order.customerId?.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{order.customerId.phone}</span>
              </div>
            )}
            {order.customerId?.route && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span>{order.customerId.route}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price Used</TableHead>
                <TableHead>Item Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.productId?.name}</TableCell>
                  <TableCell className="capitalize">{item.productId?.unit}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.finalPriceUsed)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.itemTotal)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Grand Total</TableCell>
                <TableCell className="font-bold text-lg">{formatCurrency(order.totalAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
