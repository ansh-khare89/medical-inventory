"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function AddPurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: "", // In a real app, this would be a select from suppliers table
    invoiceNumber: "",
  });

  const [items, setItems] = useState([
    { medicineId: "", batchNumber: "", expiryDate: "", quantity: 1, purchasePrice: 0, sellingPrice: 0 }
  ]);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { medicineId: "", batchNumber: "", expiryDate: "", quantity: 1, purchasePrice: 0, sellingPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Since we don't have a supplier selector yet, let's use a dummy or create one logic in API
          // For MVP, we will assume supplierId is filled manually or handled by API if missing.
          supplierId: "dummy-supplier-id", 
          items
        }),
      });

      if (res.ok) {
        toast.success("Purchase added successfully. Stock updated.");
        router.push("/purchases");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add purchase");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/purchases">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">New Purchase / Add Stock</h2>
          <p className="text-slate-500 mt-1">Record a purchase to automatically update inventory stock.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-xl">Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  className="bg-slate-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier ID (Temp for MVP)</Label>
                <Input
                  id="supplierId"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  className="bg-slate-50"
                  placeholder="Enter a supplier ID"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm" className="h-8 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-b">
              {items.map((item, index) => (
                <div key={index} className="p-4 grid grid-cols-12 gap-4 items-end bg-slate-50/30">
                  <div className="col-span-12 md:col-span-3 space-y-2">
                    <Label className="text-xs">Medicine ID</Label>
                    <Input 
                      required
                      placeholder="e.g. cm0...123"
                      value={item.medicineId}
                      onChange={(e) => handleItemChange(index, "medicineId", e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-2">
                    <Label className="text-xs">Batch No.</Label>
                    <Input 
                      required
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(index, "batchNumber", e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-2">
                    <Label className="text-xs">Expiry Date</Label>
                    <Input 
                      type="date"
                      required
                      value={item.expiryDate}
                      onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-1 space-y-2">
                    <Label className="text-xs">Qty</Label>
                    <Input 
                      type="number" min="1" required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-1 space-y-2">
                    <Label className="text-xs">Buy Price</Label>
                    <Input 
                      type="number" step="0.01" min="0" required
                      value={item.purchasePrice}
                      onChange={(e) => handleItemChange(index, "purchasePrice", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <Label className="text-xs">Sell Price</Label>
                    <Input 
                      type="number" step="0.01" min="0" required
                      value={item.sellingPrice}
                      onChange={(e) => handleItemChange(index, "sellingPrice", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 flex justify-end">
              <div className="text-lg font-medium text-slate-800">
                Total: ₹{items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0).toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/purchases">
            <Button type="button" variant="outline" className="text-slate-600">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Processing..." : (
              <>
                <Save className="mr-2 h-4 w-4" /> Complete Purchase
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
