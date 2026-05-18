"use client";

import { useState, useEffect } from "react";
import { BarChart, TrendingUp, DollarSign, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Sale {
  id: string;
  saleDate: string;
  customerName: string | null;
  totalAmount: number;
  items?: unknown[];
}

interface Purchase {
  id: string;
  invoiceNumber: string | null;
  purchaseDate: string;
  totalAmount: number;
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/sales").then(res => res.json()),
      fetch("/api/purchases").then(res => res.json())
    ]).then(([salesData, purchasesData]) => {
      setSales(Array.isArray(salesData) ? salesData : []);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load report data", err);
      setLoading(false);
    });
  }, []);

  // Calculate metrics
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const profitEstimate = totalSales - totalPurchases; // Very basic estimate

  const today = new Date().toDateString();
  const todaysSales = sales.filter(s => new Date(s.saleDate).toDateString() === today)
                           .reduce((sum, s) => sum + s.totalAmount, 0);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Generating reports...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h2>
          <p className="text-slate-500 mt-1">Financial overview and business performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-slate-600">
            <Calendar className="mr-2 h-4 w-4" /> This Month
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Today&apos;s Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{todaysSales.toFixed(2)}</div>
            <p className="text-xs flex items-center mt-1 text-slate-500">
              Generated today
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Sales (All Time)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalSales.toFixed(2)}</div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Purchases</CardTitle>
            <BarChart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalPurchases.toFixed(2)}</div>
            <p className="text-xs text-orange-600 font-medium flex items-center mt-1">
              Stock investment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Est. Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitEstimate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{profitEstimate.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Revenue minus inventory cost
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Recent Sales History</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{new Date(sale.saleDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-xs text-slate-500">{sale.customerName || "Walk-in"} • {sale.items?.length || 0} items</p>
                  </div>
                  <div className="text-green-600 font-semibold text-sm">
                    +₹{sale.totalAmount.toFixed(2)}
                  </div>
                </div>
              ))}
              {sales.length === 0 && <div className="text-sm text-slate-500">No sales recorded yet.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Recent Purchases History</CardTitle>
            <CardDescription>Latest 5 stock additions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchases.slice(0, 5).map(purchase => (
                <div key={purchase.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-xs text-slate-500">Inv: {purchase.invoiceNumber || "N/A"}</p>
                  </div>
                  <div className="text-red-600 font-semibold text-sm">
                    -₹{purchase.totalAmount.toFixed(2)}
                  </div>
                </div>
              ))}
              {purchases.length === 0 && <div className="text-sm text-slate-500">No purchases recorded yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
