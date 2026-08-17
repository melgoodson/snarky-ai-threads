import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Upload,
  Save,
  Loader2,
  Plus,
  X,
  Eye,
  ImagePlus,
  Sparkles,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { resolveDesignImage } from "@/lib/resolveDesignImage";

// ─── Types ───────────────────────────────────────────────────────────
interface Theme {
  label: string;
  keywords: string;
}

interface ScheduleData {
  id?: string;
  month: number;
  headline: string;
  subheadline: string;
  themes: Theme[];
  design_ids: string[];
  is_active: boolean;
}

interface Design {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Convert a filename like "snarky_coffee_cat.png" → "Snarky Coffee Cat" */
const filenameToTitle = (filename: string): string => {
  return filename
    .replace(/\.[^.]+$/, "")            // strip extension
    .replace(/[-_]+/g, " ")             // dashes/underscores → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case each word
};

// ─── Component ───────────────────────────────────────────────────────
export function AdminFeaturedSchedule() {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [schedule, setSchedule] = useState<ScheduleData>({
    month: currentMonth,
    headline: "",
    subheadline: "",
    themes: [],
    design_ids: [],
    is_active: true,
  });
  const [allDesigns, setAllDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // New-theme input state
  const [newThemeLabel, setNewThemeLabel] = useState("");
  const [newThemeKeywords, setNewThemeKeywords] = useState("");

  // ── Fetch all designs from Supabase ──
  const fetchDesigns = useCallback(async () => {
    const { data, error } = await supabase
      .from("designs")
      .select("id, title, image_url, is_active")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading designs:", error);
    } else {
      setAllDesigns(data || []);
    }
  }, []);

  // ── Fetch schedule for selected month ──
  const fetchSchedule = useCallback(async (month: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("featured_schedules")
        .select("*")
        .eq("month", month)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSchedule({
          id: data.id,
          month: data.month,
          headline: data.headline || "",
          subheadline: data.subheadline || "",
          themes: (data.themes as Theme[]) || [],
          design_ids: data.design_ids || [],
          is_active: data.is_active ?? true,
        });
      } else {
        // No schedule exists for this month — reset to blank
        setSchedule({
          month,
          headline: "",
          subheadline: "",
          themes: [],
          design_ids: [],
          is_active: true,
        });
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      // Table might not exist yet — fall back to blank
      setSchedule({
        month,
        headline: "",
        subheadline: "",
        themes: [],
        design_ids: [],
        is_active: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  useEffect(() => {
    fetchSchedule(selectedMonth);
  }, [selectedMonth, fetchSchedule]);

  // ── Save / Upsert schedule ──
  const handleSave = async () => {
    if (!schedule.headline.trim()) {
      toast.error("Please enter a headline");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        month: selectedMonth,
        headline: schedule.headline,
        subheadline: schedule.subheadline,
        themes: schedule.themes as any,
        design_ids: schedule.design_ids,
        is_active: schedule.is_active,
        updated_at: new Date().toISOString(),
      };

      if (schedule.id) {
        // Update existing
        const { error } = await supabase
          .from("featured_schedules")
          .update(payload)
          .eq("id", schedule.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("featured_schedules")
          .insert(payload);
        if (error) throw error;
      }

      toast.success(`Schedule saved for ${MONTH_NAMES[selectedMonth]}!`);
      await fetchSchedule(selectedMonth); // refresh ID
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save schedule: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  // ── Bulk image upload & auto-name ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let uploaded = 0;

    for (const file of Array.from(files)) {
      const title = filenameToTitle(file.name);
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const storagePath = `designs/${Date.now()}_${file.name.replace(/\s/g, "_")}`;

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("design-images")
          .upload(storagePath, file, { contentType: file.type });

        if (uploadError) {
          console.error(`Upload failed for ${file.name}:`, uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("design-images")
          .getPublicUrl(storagePath);

        const imageUrl = urlData?.publicUrl || "";

        // Insert into designs table
        const { data: designRow, error: insertError } = await supabase
          .from("designs")
          .insert({
            title,
            description: `Uploaded design: ${title}`,
            image_url: imageUrl,
            is_active: true,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error(`DB insert failed for ${file.name}:`, insertError);
          toast.error(`Failed to save design record for ${file.name}`);
          continue;
        }

        // Auto-add to the current month's selected design IDs
        if (designRow?.id) {
          setSchedule((prev) => ({
            ...prev,
            design_ids: [...prev.design_ids, designRow.id],
          }));
        }

        uploaded++;
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
      }
    }

    // Refresh design list
    await fetchDesigns();
    toast.success(`${uploaded} design(s) uploaded and auto-named!`);
    setUploading(false);

    // Reset file input
    e.target.value = "";
  };

  // ── Theme management ──
  const addTheme = () => {
    if (!newThemeLabel.trim()) return;
    setSchedule((prev) => ({
      ...prev,
      themes: [
        ...prev.themes,
        { label: newThemeLabel.trim(), keywords: newThemeKeywords.trim() },
      ],
    }));
    setNewThemeLabel("");
    setNewThemeKeywords("");
  };

  const removeTheme = (idx: number) => {
    setSchedule((prev) => ({
      ...prev,
      themes: prev.themes.filter((_, i) => i !== idx),
    }));
  };

  // ── Design picker toggle ──
  const toggleDesign = (designId: string) => {
    setSchedule((prev) => {
      const ids = prev.design_ids.includes(designId)
        ? prev.design_ids.filter((id) => id !== designId)
        : [...prev.design_ids, designId];
      return { ...prev, design_ids: ids };
    });
  };

  // Selected designs for preview
  const selectedDesigns = allDesigns.filter((d) =>
    schedule.design_ids.includes(d.id)
  );

  // ── Render ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Featured Design Scheduler
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload designs, auto-name them, and schedule monthly featured collections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, i) => (
                <SelectItem key={i} value={String(i)}>
                  {name} {i === currentMonth ? "(current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Editing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Headline / Subheadline / Themes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Monthly Headline
              </CardTitle>
              <CardDescription>
                This appears as the main featured section title on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={schedule.headline}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  placeholder="e.g. SUMMER SNARK"
                  className="font-bold uppercase"
                />
              </div>
              <div>
                <Label htmlFor="subheadline">Subheadline</Label>
                <Textarea
                  id="subheadline"
                  value={schedule.subheadline}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, subheadline: e.target.value }))
                  }
                  placeholder="Brief description that appears below the headline..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={schedule.is_active}
                  onCheckedChange={(checked) =>
                    setSchedule((prev) => ({ ...prev, is_active: !!checked }))
                  }
                />
                <Label htmlFor="is_active" className="text-sm">
                  Active (display on homepage when this month arrives)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Theme Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Badges</CardTitle>
              <CardDescription>
                SEO keyword-rich theme tags shown below the headline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing themes */}
              <div className="flex flex-wrap gap-2">
                {schedule.themes.map((theme, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="pl-3 pr-1 py-1.5 flex items-center gap-1 text-sm"
                  >
                    {theme.label}
                    <button
                      onClick={() => removeTheme(idx)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {schedule.themes.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    No themes yet — add one below
                  </span>
                )}
              </div>

              {/* Add theme form */}
              <div className="flex gap-2">
                <Input
                  placeholder="Label (e.g. 🍦 Ice Cream Day)"
                  value={newThemeLabel}
                  onChange={(e) => setNewThemeLabel(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="SEO keywords (comma-separated)"
                  value={newThemeKeywords}
                  onChange={(e) => setNewThemeKeywords(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addTheme}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Upload & Design Picker */}
        <div className="space-y-6">
          {/* Bulk upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Upload New Designs
              </CardTitle>
              <CardDescription>
                Upload images — filenames are auto-converted to titles
                (e.g. <code className="text-xs bg-muted px-1 rounded">snarky_coffee_cat.png</code> → <strong>Snarky Coffee Cat</strong>)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl py-8 px-4 cursor-pointer hover:border-primary/50 transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  {uploading ? "Uploading..." : "Click or drag to upload design images"}
                </span>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  PNG, JPG, WebP • Multiple files supported
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </CardContent>
          </Card>

          {/* Design Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Select Featured Designs
                <Badge variant="outline" className="ml-2 text-xs">
                  {schedule.design_ids.length} selected
                </Badge>
              </CardTitle>
              <CardDescription>
                Check designs to feature for {MONTH_NAMES[selectedMonth]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {allDesigns.map((design) => {
                  const isSelected = schedule.design_ids.includes(design.id);
                  return (
                    <button
                      key={design.id}
                      onClick={() => toggleDesign(design.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="aspect-square">
                        <img
                          src={resolveDesignImage(design.image_url)}
                          alt={design.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                        <p className="text-[10px] text-white font-medium truncate">
                          {design.title}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
                {allDesigns.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground text-center py-4">
                    No designs found. Upload some above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Homepage Preview — {MONTH_NAMES[selectedMonth]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-xl border p-6 space-y-6">
              {/* Preview: headline */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">
                    Featured This Month
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                  {schedule.headline || "YOUR HEADLINE HERE"}
                </h2>
                <p className="text-muted-foreground text-base max-w-xl mx-auto">
                  {schedule.subheadline || "Your subheadline goes here…"}
                </p>
              </div>

              {/* Preview: theme badges */}
              {schedule.themes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {schedule.themes.map((theme, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full text-muted-foreground"
                    >
                      {theme.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview: design grid */}
              {selectedDesigns.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className="rounded-xl overflow-hidden border bg-card"
                    >
                      <div className="aspect-square">
                        <img
                          src={resolveDesignImage(design.image_url)}
                          alt={design.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-xs font-semibold truncate">
                          {design.title}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          FEATURED
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No designs selected — pick some from the design picker above
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
