"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveLearnerProfile, type ProfileFormData } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, User, School, Users } from "lucide-react"

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "cambridge", label: "Cambridge", icon: School },
  { id: "guardian", label: "Guardian", icon: Users },
]

const CAMBRIDGE_STAGES = ["KS1", "KS2", "KS3", "IGCSE", "AS", "A2"]

const LANGUAGES = [
  "English", "Arabic", "French", "Spanish", "Mandarin", "Hindi",
  "Portuguese", "Swahili", "Afrikaans", "Other",
]

const NATIONALITIES = [
  "Zimbabwean", "South African", "Zambian", "Botswanan", "Mozambican",
  "Malawian", "Tanzanian", "Kenyan", "Nigerian", "Ghanaian",
  "British", "American", "Other",
]

export function ProfileForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileFormData>({})

  const set = (key: keyof ProfileFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await saveLearnerProfile(form)
      router.push("/dashboard")
      router.refresh()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = i < step
            const active = i === step
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    done
                      ? "bg-primary/20 text-primary"
                      : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 0 — Personal */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth ?? ""}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <Select value={form.nationality} onValueChange={(v) => set("nationality", v)}>
                  <SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Country of Residence</Label>
                <Input
                  placeholder="e.g. Zimbabwe"
                  value={form.countryOfResidence ?? ""}
                  onChange={(e) => set("countryOfResidence", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>First Language</Label>
                <Select value={form.firstLanguage} onValueChange={(v) => set("firstLanguage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => setStep(1)}>
                Next
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1 — Cambridge */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Cambridge Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Used for exam registration and credit transfers
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Cambridge Stage</Label>
                <Select value={form.cambridgeStage} onValueChange={(v) => set("cambridgeStage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {CAMBRIDGE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>School / Centre Name</Label>
                <Input
                  placeholder="e.g. Harare International School"
                  value={form.centreName ?? ""}
                  onChange={(e) => set("centreName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Centre Number</Label>
                  <Input
                    placeholder="e.g. ZW001"
                    value={form.centreNumber ?? ""}
                    onChange={(e) => set("centreNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Candidate Number</Label>
                  <Input
                    placeholder="e.g. 0001"
                    value={form.candidateNumber ?? ""}
                    onChange={(e) => set("candidateNumber", e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Centre and candidate numbers are assigned by Cambridge. Leave blank if not yet registered.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Next</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Guardian */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Parent / Guardian</CardTitle>
              <p className="text-sm text-muted-foreground">
                For progress reports and exam notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Guardian Full Name</Label>
                <Input
                  placeholder="Full name"
                  value={form.guardianName ?? ""}
                  onChange={(e) => set("guardianName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Relationship</Label>
                <Select value={form.guardianRelation} onValueChange={(v) => set("guardianRelation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Guardian Email</Label>
                <Input
                  type="email"
                  placeholder="guardian@email.com"
                  value={form.guardianEmail ?? ""}
                  onChange={(e) => set("guardianEmail", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Guardian Phone</Label>
                <Input
                  type="tel"
                  placeholder="+263 77 000 0000"
                  value={form.guardianPhone ?? ""}
                  onChange={(e) => set("guardianPhone", e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Complete Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
