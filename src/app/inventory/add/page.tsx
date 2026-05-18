"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function AddMedicinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    category: "",
    description: "",
    minimumStockLevel: "10",
    rackLocation: "",
    prescriptionRequired: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          minimumStockLevel: parseInt(formData.minimumStockLevel, 10),
        }),
      });

      if (res.ok) {
        toast.success("Medicine added successfully");
        router.push("/inventory");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add medicine");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Add New Medicine</h2>
          <p className="text-slate-500 mt-1">Create a new medicine profile in the system.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-xl">Medicine Details</CardTitle>
          <CardDescription>Fill in the basic information about the medicine.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-slate-700">Medicine Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. Paracetamol 500mg"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-700">Brand / Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="e.g. GlaxoSmithKline"
                  value={formData.company}
                  onChange={handleChange}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g. Analgesic"
                  value={formData.category}
                  onChange={handleChange}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumStockLevel" className="text-slate-700">Minimum Stock Level</Label>
                <Input
                  id="minimumStockLevel"
                  name="minimumStockLevel"
                  type="number"
                  min="0"
                  required
                  value={formData.minimumStockLevel}
                  onChange={handleChange}
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">Alerts will be triggered when stock falls below this level.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rackLocation" className="text-slate-700">Rack / Shelf Location</Label>
                <Input
                  id="rackLocation"
                  name="rackLocation"
                  placeholder="e.g. A-12"
                  value={formData.rackLocation}
                  onChange={handleChange}
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">Description / Notes</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any additional information..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="prescriptionRequired"
                name="prescriptionRequired"
                checked={formData.prescriptionRequired}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="prescriptionRequired" className="font-normal text-slate-700">
                Prescription required for this medicine
              </Label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Link href="/inventory">
                <Button type="button" variant="outline" className="text-slate-600">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Saving..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Medicine
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
