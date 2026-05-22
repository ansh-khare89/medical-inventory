import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Package, AlertCircle, AlertTriangle } from "lucide-react";

const recentSales = [
  { id: 1, amount: "742.50" },
  { id: 2, amount: "386.00" },
  { id: 3, amount: "928.75" },
  { id: 4, amount: "615.25" },
  { id: 5, amount: "254.90" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">Overview of your medicine inventory and sales.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹1,24,231.89</div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Medicines in Stock</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1,245</div>
            <p className="text-xs text-slate-500 mt-1">
              across 48 categories
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">12</div>
            <p className="text-xs text-amber-600/80 mt-1">
              Items below minimum level
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-red-600/80 mt-1">
              Within next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900">Sale INV-{1000 + sale.id}</p>
                    <p className="text-sm text-slate-500">Paracetamol, Amoxicillin</p>
                  </div>
                  <div className="ml-auto font-medium text-slate-900">
                    +₹{sale.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Low Stock Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: "Ibuprofen 400mg", qty: 4, min: 20 },
                { name: "Cough Syrup", qty: 2, min: 10 },
                { name: "Vitamin C", qty: 8, min: 50 },
                { name: "Bandages", qty: 15, min: 100 },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900">{item.name}</p>
                    <div className="flex items-center text-xs text-amber-600 mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Only {item.qty} left (Min: {item.min})
                    </div>
                  </div>
                  <div className="ml-auto font-medium text-slate-900">
                    <button className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors">
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
