"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Purchase {
  id: string;
  supplierId: string;
  invoiceNumber: string | null;
  purchaseDate: string;
  totalAmount: number;
  supplier?: {
    name: string;
  } | null;
  items?: unknown[];
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch("/api/purchases");
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error("Failed to fetch purchases", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPurchases();
  }, [fetchPurchases]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Purchases</h2>
          <p className="text-slate-500 mt-1">Manage purchase records and inbound stock.</p>
        </div>
        <Link href="/purchases/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Purchase
          </Button>
        </Link>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search invoice number..."
                className="pl-9 bg-slate-50"
              />
            </div>
            <Button variant="outline" className="text-slate-600">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Invoice No.</TableHead>
                  <TableHead className="font-semibold text-slate-600">Supplier</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Items</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Amount</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      Loading purchases...
                    </TableCell>
                  </TableRow>
                ) : purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No purchases found.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {formatDate(purchase.purchaseDate)}
                      </TableCell>
                      <TableCell className="text-slate-600">{purchase.invoiceNumber || "-"}</TableCell>
                      <TableCell className="text-slate-600">
                        {purchase.supplier?.name || purchase.supplierId || "-"}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">{purchase.items?.length || 0}</TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        ₹{purchase.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
