import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { clients } from "../mock/data";

export default function Clients() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <Button>Add New Client</Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="add">Add Client</TabsTrigger>
            <TabsTrigger value="credentials">Login Credentials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4 space-y-4">
            <div className="flex gap-4">
              <Input placeholder="Search clients..." className="max-w-sm" />
              <Button variant="outline">Filter</Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.clientId}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.mobile}</TableCell>
                      <TableCell>{client.city}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'Active' ? 'default' : client.status === 'Renewal Due' ? 'destructive' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.progressPercent}%</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="add" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>Enter client details to register them in the system.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile</label>
                    <Input placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input placeholder="e.g. Mumbai" />
                  </div>
                </div>
                <Button className="mt-6">Save Client</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-10">
                  Login Credentials view
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
