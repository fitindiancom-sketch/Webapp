import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendar() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground py-20">
              Calendar View Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
