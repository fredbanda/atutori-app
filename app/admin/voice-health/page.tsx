// app/admin/voice-health/page.tsx
// Voice system health monitoring dashboard
// Real-time production monitoring for scale

import VoiceDashboard from "@/components/admin/voice-dashboard";

export default function VoiceHealthPage() {
  return (
    <div className="min-h-screen bg-background">
      <VoiceDashboard />
    </div>
  );
}
