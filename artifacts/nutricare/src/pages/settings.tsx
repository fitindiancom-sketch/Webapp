import React, { useState, useEffect } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useBrandingStore } from "../store/branding";
import { settingsApi } from "../api/settings";
import { toast } from "sonner";
import { Upload, X, Palette, Bell, FileText, Settings2, Users } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { clinicName, tagline, primaryColor, updateBranding } = useBrandingStore();
  
  const [settings, setSettings] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState("https://via.placeholder.com/150?text=Logo");
  
  useEffect(() => {
    settingsApi.get().then(data => {
      setSettings(data);
      setLogoPreview(data.logoUrl);
    });
  }, []);

  const handleSaveBranding = () => {
    // Also save to root css vars if needed in a real app
    toast.success("Branding settings saved successfully");
  };

  const handleSaveTemplates = async () => {
    if (settings) {
      await settingsApi.update({ templates: settings.templates });
      toast.success("Templates saved successfully");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogoPreview(url);
      toast.success("Logo uploaded");
    }
  };

  const handleRemoveRole = (idx: number) => {
    if (settings) {
      const newRoles = [...settings.roles];
      newRoles.splice(idx, 1);
      setSettings({ ...settings, roles: newRoles });
    }
  };

  if (!settings) return null;

  return (
    <AppLayout>
      <PageHeader title="Settings" />

      <div className="flex flex-col md:flex-row gap-6">
        <Tabs defaultValue="branding" className="w-full flex flex-col md:flex-row gap-6">
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent p-0 gap-2 items-stretch justify-start">
            <TabsTrigger value="branding" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3"><Palette className="h-4 w-4 mr-2" /> Branding & Theme</TabsTrigger>
            <TabsTrigger value="roles" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3"><Users className="h-4 w-4 mr-2" /> Custom Roles</TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3"><Bell className="h-4 w-4 mr-2" /> Notifications</TabsTrigger>
            <TabsTrigger value="templates" className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3"><FileText className="h-4 w-4 mr-2" /> PDF Templates</TabsTrigger>
          </TabsList>

          <div className="flex-1 max-w-3xl">
            <TabsContent value="branding" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clinic Identity</CardTitle>
                  <CardDescription>Your public-facing brand details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Clinic Name</Label>
                    <Input value={clinicName} onChange={e => updateBranding({ clinicName: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tagline</Label>
                    <Input value={tagline} onChange={e => updateBranding({ tagline: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Upload New Logo</Button>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                        </div>
                        <p className="text-xs text-muted-foreground">Recommended size: 512x512px. PNG or JPG.</p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveBranding}>Save Branding</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-muted-foreground">Switch the interface to a dark color scheme.</p>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Roles</CardTitle>
                  <CardDescription>Manage roles available for staff members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {settings.roles.map((role: string, idx: number) => (
                      <Badge key={role} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2">
                        {role}
                        {role !== "Super Admin" && (
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveRole(idx)} />
                        )}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <Input placeholder="New role name..." />
                    <Button variant="secondary">Add</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>Configure auto-messages sent via SMS or WhatsApp.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-muted">{"{{client_name}}"}</Badge>
                    <Badge variant="outline" className="bg-muted">{"{{clinic_name}}"}</Badge>
                    <Badge variant="outline" className="bg-muted">{"{{appointment_time}}"}</Badge>
                    <Badge variant="outline" className="bg-muted">{"{{renewal_date}}"}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Appointment Reminder</Label>
                    <Textarea 
                      value={settings.templates.whatsapp} 
                      onChange={(e) => setSettings({...settings, templates: {...settings.templates, whatsapp: e.target.value}})}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Renewal Notice</Label>
                    <Textarea 
                      value={settings.templates.notification} 
                      onChange={(e) => setSettings({...settings, templates: {...settings.templates, notification: e.target.value}})}
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSaveTemplates}>Save Templates</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Diet Plan PDF Template</CardTitle>
                  <CardDescription>HTML allowed. This wraps the diet plan when exported to PDF.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    value={settings.templates.pdf} 
                    onChange={(e) => setSettings({...settings, templates: {...settings.templates, pdf: e.target.value}})}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleSaveTemplates}>Save PDF Template</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
