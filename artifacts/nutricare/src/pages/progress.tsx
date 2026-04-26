import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Progress() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Client Progress & Photos</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground py-20">
              Progress Timeline & Photos Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
