import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DietPlans() {
  const [step, setStep] = React.useState(1);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Diet Plan Builder</h2>
          <Button variant="outline">View Drafts</Button>
        </div>

        <div className="flex gap-2 mb-4">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Dietitian</CardTitle>
            </CardHeader>
            <CardContent className="max-w-md">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dietitian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="d1">Dr. Aditi Sharma</SelectItem>
                  <SelectItem value="d2">Dr. Kavita Desai</SelectItem>
                </SelectContent>
              </Select>
              <Button className="mt-4" onClick={() => setStep(2)}>Next Step</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Search Client</CardTitle>
            </CardHeader>
            <CardContent className="max-w-md">
              <Input placeholder="Search by name, mobile, or ID" />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Plan Category</CardTitle>
            </CardHeader>
            <CardContent className="max-w-md space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Client</SelectItem>
                  <SelectItem value="active">Active (Follow up)</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Must Do</label>
                  <Textarea placeholder="Enter daily mandatory habits..." rows={4} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Water Goal (Liters)</label>
                  <Input type="number" defaultValue={3} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meal Plan</CardTitle>
                  <CardDescription>Build the daily diet chart</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Preview</Button>
                  <Button>Save Plan</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Morning', 'Breakfast', 'Lunch', 'Evening', 'Dinner'].map(meal => (
                  <Card key={meal} className="bg-muted/30">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base">{meal}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <Input placeholder="Enter food items..." />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
