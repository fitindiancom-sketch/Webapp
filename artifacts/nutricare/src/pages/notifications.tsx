import React, { useState, useEffect } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationsApi } from "../api/notifications";
import { Notification } from "../types";
import { Bell, Calendar, UserPlus, AlertCircle, CheckCircle2, Check, Trash2 } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    const data = await notificationsApi.list();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    toast.success("All notifications marked as read");
    fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.update(id, { read: true });
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await notificationsApi.remove(id);
    toast.success("Notification deleted");
    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(n => filter === "all" || n.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "renewal_reminder": return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "appointment_reminder": return <Calendar className="h-5 w-5 text-blue-500" />;
      case "new_registration": return <UserPlus className="h-5 w-5 text-emerald-500" />;
      case "progress_milestone": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "no_response": return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const counts = {
    all: notifications.length,
    renewal_reminder: notifications.filter(n => n.type === "renewal_reminder").length,
    appointment_reminder: notifications.filter(n => n.type === "appointment_reminder").length,
    new_registration: notifications.filter(n => n.type === "new_registration").length,
    progress_milestone: notifications.filter(n => n.type === "progress_milestone").length,
    no_response: notifications.filter(n => n.type === "no_response").length,
  };

  const filters = [
    { id: "all", label: "All Notifications" },
    { id: "renewal_reminder", label: "Renewals" },
    { id: "no_response", label: "No Response" },
    { id: "appointment_reminder", label: "Appointments" },
    { id: "new_registration", label: "Registrations" },
    { id: "progress_milestone", label: "Milestones" },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Notifications" 
        actions={<Button variant="outline" onClick={handleMarkAllRead}><Check className="h-4 w-4 mr-2" /> Mark all as read</Button>}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Rail Filters */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors text-left
                ${filter === f.id ? 'bg-primary text-primary-foreground font-medium' : 'bg-card border hover:bg-muted'}
              `}
            >
              {f.label}
              <Badge variant={filter === f.id ? "secondary" : "outline"} className={filter === f.id ? "bg-primary-foreground text-primary hover:bg-primary-foreground" : ""}>
                {counts[f.id as keyof typeof counts]}
              </Badge>
            </button>
          ))}
        </div>

        {/* Main List */}
        <Card className="flex-1">
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="py-20">
                <EmptyState icon={Bell} title="All caught up!" description="You don't have any notifications in this category." />
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map(n => (
                  <div key={n.id} className={`p-4 flex gap-4 transition-colors hover:bg-muted/30 ${!n.read ? 'bg-primary/5' : ''}`}>
                    <div className="shrink-0 mt-1">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className={`text-sm font-semibold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        {!n.read && (
                          <button onClick={() => handleMarkRead(n.id)} className="text-xs font-medium text-primary hover:underline">
                            Mark as read
                          </button>
                        )}
                        <button onClick={() => handleDelete(n.id)} className="text-xs font-medium text-destructive hover:underline flex items-center gap-1">
                          Delete
                        </button>
                      </div>
                    </div>
                    {!n.read && (
                      <div className="shrink-0 flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
