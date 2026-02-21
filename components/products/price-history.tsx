"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/shared/loading"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface PriceEntry {
  _id: string
  version: number
  purchasePrice: number
  sellingPrice: number
  effectiveDate: string
  changedBy: string
}

export function PriceHistoryView({ productId, productName }: { productId: string; productName: string }) {
  const { data: history, error } = useSWR<PriceEntry[]>(`/api/products/${productId}/price-history`, fetcher)

  if (error) return <p className="text-destructive">Failed to load price history.</p>
  if (!history) return <Loading message="Loading price history..." />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History - {productName}</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No price history available.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Changed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, i) => (
                <TableRow key={entry._id}>
                  <TableCell>
                    <Badge variant={i === 0 ? "default" : "secondary"}>v{entry.version}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(entry.purchasePrice)}</TableCell>
                  <TableCell>{formatCurrency(entry.sellingPrice)}</TableCell>
                  <TableCell>{new Date(entry.effectiveDate).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{entry.changedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
