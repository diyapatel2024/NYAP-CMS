"use client"

import { use } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Loading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface PriceEntry {
  _id: string
  version: number
  customPrice: number
  effectiveDate: string
  changedBy: string
}

export default function CustomerProductPriceHistoryPage({
  params,
}: {
  params: Promise<{ id: string; cpId: string }>
}) {
  const { id, cpId } = use(params)
  const { data: history, error } = useSWR<PriceEntry[]>(`/api/customer-products/${cpId}/price-history`, fetcher)

  if (error) return <p className="text-destructive">Failed to load price history.</p>
  if (!history) return <Loading message="Loading price history..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Product Price History" description="Version history for this customer-product pricing">
        <Button variant="outline" asChild>
          <Link href={`/customers/${id}/products`}><ArrowLeft className="mr-2 h-4 w-4" />Back to Products</Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Price Versions</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No price history available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Custom Price</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry, i) => (
                  <TableRow key={entry._id}>
                    <TableCell><Badge variant={i === 0 ? "default" : "secondary"}>v{entry.version}</Badge></TableCell>
                    <TableCell>{formatCurrency(entry.customPrice)}</TableCell>
                    <TableCell>{new Date(entry.effectiveDate).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{entry.changedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
