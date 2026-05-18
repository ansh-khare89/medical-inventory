"use client";

import { useState, useCallback, useEffect } from "react";
import { AlertTriangle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MedicineBatch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
}

interface Medicine {
  id: string;
  name: string;
  minimumStockLevel: number;
  batches: MedicineBatch[];
}

interface AlertBatch extends MedicineBatch {
  medicineName: string;
}

export default function AlertsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch("/api/medicines");
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (error) {
      console.error("Failed to fetch medicines", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedicines();
  }, [fetchMedicines]);

  // Process data for alerts
  const lowStockItems = medicines.filter(med => {
    const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
    return totalStock <= med.minimumStockLevel;
  }).map(med => ({
    ...med,
    totalStock: med.batches.reduce((sum, b) => sum + b.quantity, 0)
  }));

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const now = new Date();

  const expiringBatches: AlertBatch[] = [];
  const expiredBatches: AlertBatch[] = [];

  medicines.forEach(med => {
    med.batches.forEach((batch) => {
      const expiry = new Date(batch.expiryDate);
      if (batch.quantity > 0) {
        if (expiry < now) {
          expiredBatches.push({ medicineName: med.name, ...batch });
        } else if (expiry <= thirtyDaysFromNow) {
          expiringBatches.push({ medicineName: med.name, ...batch });
        }
      }
    });
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading alerts data...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Alerts</h2>
        <p className="text-slate-500 mt-1">Monitor low stock and expiring medicines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 shadow-sm col-span-1">
          <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
            <CardTitle className="text-red-700 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Expired Stock
            </CardTitle>
            <CardDescription className="text-red-600/70">Requires immediate disposal</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {expiredBatches.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No expired items found.</div>
            ) : (
              <div className="divide-y border-t">
                {expiredBatches.map(batch => (
                  <div key={batch.id} className="p-4 flex flex-col gap-1">
                    <span className="font-medium text-slate-900">{batch.medicineName}</span>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Batch: {batch.batchNumber}</span>
                      <span className="text-red-600 font-medium">Qty: {batch.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm col-span-1">
          <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
            <CardTitle className="text-amber-700 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Expiring Soon
            </CardTitle>
            <CardDescription className="text-amber-600/70">Within next 30 days</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {expiringBatches.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No expiring items found.</div>
            ) : (
              <div className="divide-y border-t">
                {expiringBatches.map(batch => (
                  <div key={batch.id} className="p-4 flex flex-col gap-1">
                    <span className="font-medium text-slate-900">{batch.medicineName}</span>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>{formatDate(batch.expiryDate)}</span>
                      <span className="text-amber-600 font-medium">Qty: {batch.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm col-span-1 md:col-span-1 md:row-span-2">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
            <CardTitle className="text-blue-700 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-blue-600/70">Below minimum threshold</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">Stock levels are healthy.</div>
            ) : (
              <div className="divide-y border-t">
                {lowStockItems.map(item => (
                  <div key={item.id} className="p-4 flex flex-col gap-1">
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-slate-500">
                        Min: {item.minimumStockLevel}
                      </div>
                      <Badge variant="outline" className={item.totalStock === 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                        Current: {item.totalStock}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
