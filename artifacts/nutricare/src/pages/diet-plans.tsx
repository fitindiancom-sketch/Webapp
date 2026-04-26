import React from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Eye, Save, FileText, Plus, Pencil, Trash2, CheckCircle2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useDietPlanStore } from "../store/dietPlans";
import { useClientsStore } from "../store/clients";
import { staff } from "../mock/data";
import type { DietPlanTemplate } from "../types";

const MEAL_SECTIONS = ["Morning", "Breakfast", "Mid Meal", "Lunch", "Evening", "Dinner", "Tea Time"];
const TEMPLATE_CATEGORIES = ["Morning", "Breakfast", "Mid Meal", "Lunch", "Evening", "Dinner", "Tea Time", "Instructions"];

interface MealRow {
  type: string;
  content: string;
}

export default function DietPlans() {
  const [step, setStep] = React.useState(1);
  const [activeView, setActiveView] = React.useState<"builder" | "templates" | "saved">("builder");

  const [dietitianId, setDietitianId] = React.useState<string>("");
  const [clientId, setClientId] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("New");
  const [mustDo, setMustDo] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [waterGoal, setWaterGoal] = React.useState(3);
  const [goalWeight, setGoalWeight] = React.useState("");
  const [meals, setMeals] = React.useState<MealRow[]>(
    MEAL_SECTIONS.map((m) => ({ type: m, content: "" }))
  );
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const { templates, plans, addTemplate, updateTemplate, deleteTemplate, savePlan, saveDraft, draft, clearDraft } = useDietPlanStore();
  const clients = useClientsStore((s) => s.clients);
  const attachPlan = useClientsStore((s) => s.attachPlan);
  const dietitians = staff.filter((s) => s.role === "Dietitian");

  // Template manager state
  const [tplDialogOpen, setTplDialogOpen] = React.useState(false);
  const [editingTpl, setEditingTpl] = React.useState<DietPlanTemplate | null>(null);
  const [tplForm, setTplForm] = React.useState({ category: "Breakfast", name: "", content: "" });
  const [tplCategoryFilter, setTplCategoryFilter] = React.useState("all");

  // Restore draft on first load
  React.useEffect(() => {
    if (draft) {
      if (draft.dietitianId) setDietitianId(draft.dietitianId);
      if (draft.clientId) setClientId(draft.clientId);
      if (draft.category) setCategory(draft.category);
      if (draft.mustDo) setMustDo(draft.mustDo);
      if (draft.instructions) setInstructions(draft.instructions);
      if (draft.waterGoal) setWaterGoal(draft.waterGoal);
      if (draft.goalWeight) setGoalWeight(draft.goalWeight);
      if (draft.meals && draft.meals.length) {
        setMeals(MEAL_SECTIONS.map((m) => {
          const found = draft.meals!.find((x) => x.type === m);
          return { type: m, content: found?.content ?? "" };
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedDietitian = dietitians.find((d) => d.id === dietitianId);

  const goNext = () => {
    if (step === 1 && !dietitianId) { toast.error("Please select a dietitian"); return; }
    if (step === 2 && !clientId) { toast.error("Please select a client"); return; }
    setStep(Math.min(5, step + 1));
  };
  const goBack = () => setStep(Math.max(1, step - 1));

  const validatePlan = (): string | null => {
    if (!clientId) return "Client is required";
    if (!dietitianId) return "Dietitian is required";
    const filledMeals = meals.filter((m) => m.content.trim().length > 0).length;
    if (filledMeals < 2) return "Fill at least 2 meal sections";
    return null;
  };

  const handleSavePlan = () => {
    const err = validatePlan();
    if (err) { toast.error(err); return; }
    const newPlan = savePlan({
      clientId,
      clientName: selectedClient?.name ?? "",
      clientCode: selectedClient?.clientId ?? "",
      dietitianId,
      dietitianName: selectedDietitian?.name ?? "",
      goalWeight,
      category,
      mustDo,
      instructions,
      waterGoal,
      meals,
      status: "Published",
    });
    // Push plan window back to the client so its auto-status flips off "Plan Not Started"
    const startIso = newPlan.createdAt.slice(0, 10);
    const endIso = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    attachPlan(clientId, startIso, endIso);
    toast.success(`Plan Created Successfully — ${newPlan.id}`);
    // reset form
    setStep(1); setDietitianId(""); setClientId(""); setMustDo(""); setInstructions("");
    setGoalWeight(""); setMeals(MEAL_SECTIONS.map((m) => ({ type: m, content: "" })));
    setActiveView("saved");
  };

  const handleSaveDraft = () => {
    saveDraft({
      clientId, clientName: selectedClient?.name ?? "", clientCode: selectedClient?.clientId ?? "",
      dietitianId, dietitianName: selectedDietitian?.name ?? "",
      goalWeight, category, mustDo, instructions, waterGoal, meals,
    });
    toast.success("Draft saved to your browser");
  };

  const updateMeal = (index: number, content: string) => {
    setMeals((prev) => prev.map((m, i) => (i === index ? { ...m, content } : m)));
  };

  const applyTemplateToMeal = (mealType: string, templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setMeals((prev) => prev.map((m) =>
      m.type === mealType ? { ...m, content: m.content ? `${m.content}\n${tpl.content}` : tpl.content } : m
    ));
    toast.success(`Inserted "${tpl.name}" into ${mealType}`);
  };

  const openTplCreate = () => {
    setEditingTpl(null);
    setTplForm({ category: "Breakfast", name: "", content: "" });
    setTplDialogOpen(true);
  };
  const openTplEdit = (tpl: DietPlanTemplate) => {
    setEditingTpl(tpl);
    setTplForm({ category: tpl.category, name: tpl.name, content: tpl.content });
    setTplDialogOpen(true);
  };
  const submitTpl = () => {
    if (!tplForm.name.trim() || !tplForm.content.trim()) {
      toast.error("Template name and content are required"); return;
    }
    if (editingTpl) {
      updateTemplate(editingTpl.id, tplForm);
      toast.success("Template updated");
    } else {
      addTemplate(tplForm);
      toast.success("Template created");
    }
    setTplDialogOpen(false);
  };

  const filteredTemplates = templates.filter((t) =>
    tplCategoryFilter === "all" ? true : t.category === tplCategoryFilter
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Diet Plans</h2>
            <p className="text-sm text-muted-foreground">Build, manage and save personalized diet plans</p>
          </div>
          {draft && activeView === "builder" && (
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" /> Draft restored
            </Badge>
          )}
        </div>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList>
            <TabsTrigger value="builder">Plan Builder</TabsTrigger>
            <TabsTrigger value="templates">Manage Templates</TabsTrigger>
            <TabsTrigger value="saved">Saved Plans ({plans.length})</TabsTrigger>
          </TabsList>

          {/* ===== BUILDER ===== */}
          <TabsContent value="builder" className="mt-4 space-y-6">
            {/* Stepper */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    s === step ? "bg-primary text-primary-foreground" :
                    s < step ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  }`}>
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                      s === step ? "bg-white/20" : s < step ? "bg-emerald-200" : "bg-background"
                    }`}>{s < step ? <CheckCircle2 className="h-3 w-3" /> : s}</span>
                    {["Dietitian", "Client", "Build", "Preview", "Save"][s - 1]}
                  </div>
                  {s < 5 && <div className={`flex-1 h-px ${s < step ? "bg-emerald-300" : "bg-border"}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Select Dietitian</CardTitle>
                  <CardDescription>Choose which dietitian is creating this plan.</CardDescription>
                </CardHeader>
                <CardContent className="max-w-md space-y-4">
                  <Select value={dietitianId} onValueChange={setDietitianId}>
                    <SelectTrigger><SelectValue placeholder="Select a dietitian" /></SelectTrigger>
                    <SelectContent>
                      {dietitians.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={goNext}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Select Client</CardTitle>
                  <CardDescription>Search by name, mobile or client ID, then pick.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="max-w-md"><SelectValue placeholder="Choose a client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} — {c.clientId} ({c.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClient && (
                    <div className="rounded-lg border p-3 max-w-md text-sm bg-muted/30">
                      <div className="font-medium">{selectedClient.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {selectedClient.clientId} · {selectedClient.mobile} · {selectedClient.city}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button onClick={goNext}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3 - Build plan */}
            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Plan Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Plan Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New Client</SelectItem>
                          <SelectItem value="Active">Active (Follow up)</SelectItem>
                          <SelectItem value="Renewal">Renewal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Goal Weight (kg)</label>
                      <Input value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} type="number" placeholder="65" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Water Goal (Liters)</label>
                      <Input value={waterGoal} onChange={(e) => setWaterGoal(Number(e.target.value))} type="number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Must Do</label>
                      <Textarea value={mustDo} onChange={(e) => setMustDo(e.target.value)} rows={3} placeholder="Daily mandatory habits..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Important rules..." />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                      <Button onClick={goNext}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Meal Plan Builder</CardTitle>
                    <CardDescription>Pick a template per section, or type freely. Templates auto-fill the textarea and stay editable.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {meals.map((meal, idx) => {
                      const sectionTemplates = templates.filter((t) => t.category === meal.type);
                      return (
                        <Card key={meal.type} className="bg-muted/20">
                          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between gap-2">
                            <CardTitle className="text-base">{meal.type}</CardTitle>
                            <Select onValueChange={(v) => applyTemplateToMeal(meal.type, v)}>
                              <SelectTrigger className="w-[200px] h-8 text-xs">
                                <SelectValue placeholder="Insert template..." />
                              </SelectTrigger>
                              <SelectContent>
                                {sectionTemplates.length === 0 ? (
                                  <div className="px-2 py-1.5 text-xs text-muted-foreground">No templates yet</div>
                                ) : (
                                  sectionTemplates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </CardHeader>
                          <CardContent className="px-4 pb-3">
                            <Textarea
                              value={meal.content}
                              onChange={(e) => updateMeal(idx, e.target.value)}
                              placeholder={`Enter ${meal.type.toLowerCase()} details...`}
                              rows={2}
                              className="bg-background text-sm"
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4 - Preview */}
            {step === 4 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Step 4: Preview</CardTitle>
                    <CardDescription>Review the plan before saving.</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                    <Eye className="h-4 w-4 mr-1" /> Open Full Preview
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground">Client:</span> <span className="font-medium">{selectedClient?.name} ({selectedClient?.clientId})</span></div>
                    <div><span className="text-muted-foreground">Dietitian:</span> <span className="font-medium">{selectedDietitian?.name}</span></div>
                    <div><span className="text-muted-foreground">Goal Weight:</span> {goalWeight || "—"} kg</div>
                    <div><span className="text-muted-foreground">Water Goal:</span> {waterGoal} L</div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-medium mb-1">Filled Meals:</p>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                      {meals.filter((m) => m.content).map((m) => (
                        <li key={m.type}><span className="text-foreground">{m.type}:</span> {m.content.slice(0, 80)}{m.content.length > 80 ? "..." : ""}</li>
                      ))}
                      {meals.filter((m) => m.content).length === 0 && <li>No meal sections filled yet</li>}
                    </ul>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button onClick={goNext}>Continue to Save <ArrowRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5 - Save */}
            {step === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 5: Save Plan</CardTitle>
                  <CardDescription>Create the plan now or save it as a draft for later.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 bg-emerald-50 text-sm">
                    <div className="font-medium mb-2">Ready to publish for {selectedClient?.name}</div>
                    <div className="text-muted-foreground">
                      {meals.filter((m) => m.content).length} meal sections · Goal {goalWeight || "—"}kg · Water {waterGoal}L
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                    <Button variant="outline" onClick={handleSaveDraft}>
                      <Save className="h-4 w-4 mr-1" /> Save Draft
                    </Button>
                    <Button onClick={handleSavePlan} className="ml-auto">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Create Plan
                    </Button>
                  </div>
                  {draft && (
                    <Button variant="ghost" size="sm" onClick={() => { clearDraft(); toast.success("Draft cleared"); }}>
                      Clear saved draft
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== TEMPLATES MANAGER ===== */}
          <TabsContent value="templates" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Templates</CardTitle>
                  <CardDescription>Create reusable text snippets per meal section. Saved in your browser.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={tplCategoryFilter} onValueChange={setTplCategoryFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {TEMPLATE_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button onClick={openTplCreate}><Plus className="h-4 w-4 mr-1" /> Add Template</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredTemplates.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                      No templates yet. Click "Add Template" to create one.
                    </div>
                  )}
                  {filteredTemplates.map((t) => (
                    <Card key={t.id} className="bg-muted/20">
                      <CardHeader className="py-3 px-4 flex flex-row items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1">{t.category}</Badge>
                          <CardTitle className="text-sm">{t.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTplEdit(t)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700"
                            onClick={() => { deleteTemplate(t.id); toast.success("Template deleted"); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{t.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={tplDialogOpen} onOpenChange={setTplDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTpl ? "Edit Template" : "New Template"}</DialogTitle>
                  <DialogDescription>Templates can be inserted into any meal section in the plan builder.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={tplForm.category} onValueChange={(v) => setTplForm({ ...tplForm, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Name</label>
                    <Input value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} placeholder="e.g. High Protein Breakfast" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea value={tplForm.content} onChange={(e) => setTplForm({ ...tplForm, content: e.target.value })} rows={5} placeholder="e.g. Oats + Fruit + Seeds" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTplDialogOpen(false)}>Cancel</Button>
                  <Button onClick={submitTpl}>{editingTpl ? "Save Changes" : "Create Template"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ===== SAVED PLANS ===== */}
          <TabsContent value="saved" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Plans</CardTitle>
                <CardDescription>All published diet plans saved in your browser.</CardDescription>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    No plans saved yet. Create one in the Plan Builder.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((p) => (
                      <div key={p.id} className="flex items-center justify-between border rounded-lg p-3 text-sm hover:bg-muted/30">
                        <div>
                          <div className="font-medium">{p.clientName} <span className="text-muted-foreground font-normal">— {p.clientCode}</span></div>
                          <div className="text-xs text-muted-foreground">
                            {p.id} · {p.dietitianName} · {new Date(p.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge>{p.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ===== PREVIEW DIALOG ===== */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">NutriCare Diet Plan</DialogTitle>
                  <DialogDescription>Printable preview</DialogDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4 print:p-6">
              <div className="border-b pb-3 flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">NutriCare</div>
                <div className="text-xs text-muted-foreground text-right">
                  Plan Date: {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Client Name:</span> <span className="font-medium">{selectedClient?.name || "—"}</span></div>
                <div><span className="text-muted-foreground">Client ID:</span> <span className="font-medium">{selectedClient?.clientId || "—"}</span></div>
                <div><span className="text-muted-foreground">Dietitian:</span> <span className="font-medium">{selectedDietitian?.name || "—"}</span></div>
                <div><span className="text-muted-foreground">Goal Weight:</span> <span className="font-medium">{goalWeight || "—"} kg</span></div>
                <div><span className="text-muted-foreground">Water Goal:</span> <span className="font-medium">{waterGoal} L/day</span></div>
                <div><span className="text-muted-foreground">Plan Type:</span> <span className="font-medium">{category}</span></div>
              </div>

              {mustDo && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Must Do</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/30 p-3 rounded">{mustDo}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-2">Meal Plan</h4>
                <div className="space-y-2">
                  {meals.filter((m) => m.content).length === 0 && (
                    <p className="text-sm text-muted-foreground">No meal sections filled.</p>
                  )}
                  {meals.filter((m) => m.content).map((m) => (
                    <div key={m.type} className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">{m.type}</div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {instructions && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/30 p-3 rounded">{instructions}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
