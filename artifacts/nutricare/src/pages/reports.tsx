import React, { useState } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { clients, payments, progressEntries } from "../mock/data";

const revenueData = [
  { name: 'Jan', value: 300000 },
  { name: 'Feb', value: 350000 },
  { name: 'Mar', value: 320000 },
  { name: 'Apr', value: 400000 },
  { name: 'May', value: 380000 },
  { name: 'Jun', value: 450000 },
  { name: 'Jul', value: 420000 },
  { name: 'Aug', value: 480000 },
  { name: 'Sep', value: 520000 },
];

const growthData = [
  { name: 'Jan', new: 20, churned: 5 },
  { name: 'Feb', new: 35, churned: 8 },
  { name: 'Mar', new: 25, churned: 10 },
  { name: 'Apr', new: 40, churned: 6 },
  { name: 'May', new: 45, churned: 12 },
  { name: 'Jun', new: 55, churned: 15 },
];

const dietitianOutput = [
  { name: 'Dr. Aditi', plans: 120 },
  { name: 'Dr. Kavita', plans: 95 },
  { name: 'Dr. Anil', plans: 40 },
];

const responseRate = [
  { name: 'Mon', rate: 95 },
  { name: 'Tue', rate: 98 },
  { name: 'Wed', rate: 92 },
  { name: 'Thu', rate: 99 },
  { name: 'Fri', rate: 96 },
  { name: 'Sat', rate: 85 },
  { name: 'Sun', rate: 80 },
];

export default function ReportsPage() {
  const handleCSVExport = () => {
    // Generate a simple CSV from clients mock data
    const headers = ["ID", "Name", "Mobile", "City", "Status", "Progress", "Renewal Date"];
    const rows = clients.map(c => [
      c.clientId,
      c.name,
      c.mobile,
      c.city,
      c.status,
      c.progressPercent.toString(),
      c.renewalDate
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nutricare_clients_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Downloaded");
  };

  const showExportToast = (type: string) => {
    toast(`Preparing ${type} export...`, { description: "This might take a few moments." });
    setTimeout(() => toast.success(`${type} downloaded successfully.`), 2000);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Reports & Analytics" 
        actions={
          <div className="flex flex-wrap gap-2">
            <Select defaultValue="this_year">
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCSVExport}><FileSpreadsheet className="h-4 w-4 mr-2" /> CSV</Button>
              <Button variant="outline" size="sm" onClick={() => showExportToast("PDF")}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue tracking</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} formatter={(value) => [`₹${value}`, "Revenue"]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
            <CardDescription>New vs Churned clients</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="new" name="New Clients" stroke="#10b981" fillOpacity={0.2} fill="#10b981" />
                <Area type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" fillOpacity={0.2} fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dietitian Output</CardTitle>
            <CardDescription>Plans created per dietitian</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dietitianOutput} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} />
                <Bar dataKey="plans" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Response Rate</CardTitle>
            <CardDescription>Daily response rate percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseRate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" name="Response Rate %" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Success Rate</CardTitle>
            <CardDescription>Clients reaching their goal weight</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} 
                  data={[{name: 'Success', value: 88, fill: 'hsl(var(--primary))'}, {name: 'Remaining', value: 12, fill: 'hsl(var(--muted))'}]} 
                  startAngle={180} endAngle={0}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
                <div className="text-4xl font-bold">88%</div>
                <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
