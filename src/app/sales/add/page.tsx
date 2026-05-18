"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function AddSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
  });

  const [items, setItems] = useState([
    { medicineId: "", quantity: 1 }
  ]);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { medicineId: "", quantity: 1 }]);
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
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items
        }),
      });

      if (res.ok) {
        toast.success("Sale completed successfully. Stock reduced (FEFO).");
        router.push("/sales");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create sale");
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
        <Link href="/sales">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">New Sale / Billing</h2>
          <p className="text-slate-500 mt-1">Create a new sale invoice. Stock will be deducted using FEFO logic.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-xl">Customer Details (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="bg-slate-50"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  className="bg-slate-50"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Cart Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm" className="h-8 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-b">
              {items.map((item, index) => (
                <div key={index} className="p-4 grid grid-cols-12 gap-4 items-end bg-slate-50/30">
                  <div className="col-span-8 md:col-span-8 space-y-2">
                    <Label className="text-xs">Medicine ID (Search functionality can be added here)</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        required
                        className="pl-9"
                        placeholder="Type medicine ID to search..."
                        value={item.medicineId}
                        onChange={(e) => handleItemChange(index, "medicineId", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-3 space-y-2">
                    <Label className="text-xs">Qty</Label>
                    <Input 
                      type="number" min="1" required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mb-0.5"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/sales">
            <Button type="button" variant="outline" className="text-slate-600">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Processing..." : (
              <>
                <Save className="mr-2 h-4 w-4" /> Generate Bill
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
