"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loading } from "@/components/shared/loading"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface VendorSummaryData {
  date: string
  totalPurchaseCost: number
  vendors: Array<{
    vendorId: string
    vendorName: string
    totalCost: number
    products: Array<{
      productName: string
      unit: string
      totalQty: number
      purchasePrice: number
      totalCost: number
    }>
  }>
}

export function VendorSummaryView() {
  const { data, error } = useSWR<VendorSummaryData>("/api/dashboard/vendor-summary", fetcher)

  if (error) return <p className="text-destructive">Failed to load vendor summary.</p>
  if (!data) return <Loading message="Loading vendor summary..." />

  return (
    <div className="space-y-6">
      {/* Total cost card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Purchase Cost for {new Date(data.date).toLocaleDateString()}</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(data.totalPurchaseCost)}</p>
            </div>
            <p className="text-sm text-muted-foreground">{data.vendors.length} vendors</p>
          </div>
        </CardContent>
      </Card>

      {data.vendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{"No orders for tomorrow's delivery."}</p>
          </CardContent>
        </Card>
      ) : (
        data.vendors.map((vendor) => (
          <Card key={vendor.vendorId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{vendor.vendorName}</span>
                <span className="text-base font-medium">{formatCurrency(vendor.totalCost)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.products.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.productName}</TableCell>
                      <TableCell className="capitalize">{p.unit}</TableCell>
                      <TableCell>{p.totalQty}</TableCell>
                      <TableCell>{formatCurrency(p.purchasePrice)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(p.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFoot>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">Vendor Total</TableCell>
                    <TableCell className="font-bold">{formatCurrency(vendor.totalCost)}</TableCell>
                  </TableRow>
                </TableFoot>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
