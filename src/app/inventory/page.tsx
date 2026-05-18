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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MedicineBatch {
  id: string;
  quantity: number;
}

interface Medicine {
  id: string;
  name: string;
  company: string;
  category: string;
  minimumStockLevel: number;
  prescriptionRequired: boolean;
  batches: MedicineBatch[];
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMedicines = useCallback(async (searchQuery = "") => {
    await Promise.resolve();
    setLoading(true);
    try {
      const url = searchQuery ? `/api/medicines?search=${encodeURIComponent(searchQuery)}` : "/api/medicines";
      const res = await fetch(url);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const calculateTotalStock = (batches: MedicineBatch[]) => {
    return batches.reduce((total, batch) => total + batch.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory</h2>
          <p className="text-slate-500 mt-1">Manage your medicines and stock levels.</p>
        </div>
        <Link href="/inventory/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Medicine
          </Button>
        </Link>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search medicines, company..."
                  className="pl-9 bg-slate-50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            <Button variant="outline" className="text-slate-600">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Category</TableHead>
                <TableHead className="font-semibold text-slate-600">Company</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Stock</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No medicines found.
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => {
                  const totalStock = calculateTotalStock(medicine.batches);
                  const isLowStock = totalStock <= medicine.minimumStockLevel;
                  
                  return (
                    <TableRow key={medicine.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {medicine.name}
                        {medicine.prescriptionRequired && (
                          <Badge variant="outline" className="ml-2 text-[10px] text-blue-600 border-blue-200 bg-blue-50">Rx</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">{medicine.category || "-"}</TableCell>
                      <TableCell className="text-slate-600">{medicine.company || "-"}</TableCell>
                      <TableCell className="text-right font-medium text-slate-900">{totalStock}</TableCell>
                      <TableCell>
                        {totalStock === 0 ? (
                          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/inventory/${medicine.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
