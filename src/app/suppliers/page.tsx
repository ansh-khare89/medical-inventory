"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Search, MapPin, Phone } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  gstNumber: string | null;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSuppliers();
  }, [fetchSuppliers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Suppliers</h2>
          <p className="text-slate-500 mt-1">Manage your distributors and suppliers network.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search suppliers, phone..."
                className="pl-9 bg-slate-50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Name / Company</TableHead>
                <TableHead className="font-semibold text-slate-600">Contact</TableHead>
                <TableHead className="font-semibold text-slate-600">GST Number</TableHead>
                <TableHead className="font-semibold text-slate-600">Location</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Loading suppliers...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No suppliers found. Click &quot;Add Supplier&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {supplier.phone ? (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1.5 text-slate-400" />
                          {supplier.phone}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {supplier.gstNumber ? (
                         <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-600">{supplier.gstNumber}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {supplier.address ? (
                        <div className="flex items-start max-w-[200px]">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{supplier.address}</span>
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
