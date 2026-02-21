"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "./stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Loading } from "@/components/shared/loading"
import { formatCurrency } from "@/lib/utils"
import { Users, Store, Package, ShoppingCart, Truck, DollarSign } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface DashboardData {
  stats: {
    totalCustomers: number
    totalVendors: number
    totalProducts: number
    totalOrders: number
    todaysOrders: number
    pendingRevenue: number
  }
  tomorrowSummary: {
    date: string
    totalOrders: number
    products: Array<{
      productName: string
      unit: string
      totalQty: number
      totalValue: number
    }>
  }
  recentOrders: Array<{
    _id: string
    customerId: { name: string }
    deliveryDate: string
    status: string
    totalAmount: number
  }>
}

export function DashboardView() {
  const { data, error } = useSWR<DashboardData>("/api/dashboard", fetcher, { refreshInterval: 30000 })

  if (error) return <p className="text-destructive">Failed to load dashboard data.</p>
  if (!data) return <Loading message="Loading dashboard..." />

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Active Customers" value={data.stats.totalCustomers} icon={Users} />
        <StatCard title="Active Vendors" value={data.stats.totalVendors} icon={Store} />
        <StatCard title="Products" value={data.stats.totalProducts} icon={Package} />
        <StatCard title="Total Orders" value={data.stats.totalOrders} icon={ShoppingCart} />
        <StatCard title="Today's Deliveries" value={data.stats.todaysOrders} icon={Truck} />
        <StatCard title="Pending Revenue" value={formatCurrency(data.stats.pendingRevenue)} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tomorrow's Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{"Tomorrow's"} Order Summary</span>
              <span className="text-sm font-normal text-muted-foreground">
                {data.tomorrowSummary.totalOrders} orders | {new Date(data.tomorrowSummary.date).toLocaleDateString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.tomorrowSummary.products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders for tomorrow yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tomorrowSummary.products.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.productName}</TableCell>
                      <TableCell>{p.totalQty} {p.unit}</TableCell>
                      <TableCell>{formatCurrency(p.totalValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.customerId?.name || "N/A"}</TableCell>
                      <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
