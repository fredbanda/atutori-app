// components/admin/voice-dashboard.tsx
// Real-time monitoring dashboard for voice services
// Production-ready health monitoring and performance metrics

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
  TrendingUp,
  Zap,
  XCircle,
} from "lucide-react";

interface VoiceHealthData {
  timestamp: string;
  health: {
    openai: {
      status: "healthy" | "degraded" | "down";
      last_success: string | null;
      error_rate: number;
      avg_response_time: number;
    };
    gemini: {
      status: "healthy" | "degraded" | "down";
      last_success: string | null;
      error_rate: number;
      avg_response_time: number;
    };
    cache: {
      hit_rate: number;
      size: number;
      memory_usage_mb: number;
    };
    overall: "healthy" | "degraded" | "critical";
  };
  performance: {
    total_requests: number;
    services: Array<{
      service: string;
      requests: number;
      success_rate: number;
      avg_response_time: number;
    }>;
    window_minutes: number;
  };
  cache: {
    tts: {
      size: number;
      totalHits: number;
      averageAge: number;
    };
    enhancement: {
      size: number;
      totalHits: number;
      averageAge: number;
    };
  };
  rateLimiting: {
    gemini: {
      currentBackoff: number;
      requestsInWindow: number;
      windowResetIn: number;
    };
    openai: {
      currentBackoff: number;
      requestsInWindow: number;
      windowResetIn: number;
    };
  };
  circuitBreakers: {
    openai: {
      state: "closed" | "open" | "half-open";
      failures: number;
      lastFailureTime: number;
    };
    gemini: {
      state: "closed" | "open" | "half-open";
      failures: number;
      lastFailureTime: number;
    };
  };
}

const StatusBadge = ({
  status,
}: {
  status: "healthy" | "degraded" | "down" | "critical";
}) => {
  const colors = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    down: "bg-red-500",
    critical: "bg-red-600",
  };

  const icons = {
    healthy: <CheckCircle className="h-3 w-3" />,
    degraded: <AlertTriangle className="h-3 w-3" />,
    down: <XCircle className="h-3 w-3" />,
    critical: <XCircle className="h-3 w-3" />,
  };

  return (
    <Badge className={`${colors[status]} text-white`}>
      {icons[status]}
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
};

const CircuitBreakerBadge = ({
  state,
}: {
  state: "closed" | "open" | "half-open";
}) => {
  const colors = {
    closed: "bg-green-500",
    "half-open": "bg-yellow-500",
    open: "bg-red-500",
  };

  return (
    <Badge className={`${colors[state]} text-white text-xs`}>
      {state.toUpperCase()}
    </Badge>
  );
};

export default function VoiceDashboard() {
  const [data, setData] = useState<VoiceHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/voice-health");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch health data"
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerRecovery = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/voice-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recovery" }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchHealthData(); // Refresh data
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading voice system health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchHealthData}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice System Health</h1>
          <p className="text-muted-foreground">
            Real-time monitoring for production voice services
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Disable" : "Enable"} Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchHealthData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={triggerRecovery}>
            <Zap className="h-4 w-4 mr-2" />
            Trigger Recovery
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">System Status</h2>
            <StatusBadge status={data.health.overall} />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-sm font-mono">
              {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Service Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OpenAI Service */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">OpenAI TTS</h3>
            <StatusBadge status={data.health.openai.status} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="text-sm font-mono">
                {(data.health.openai.error_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Response
              </span>
              <span className="text-sm font-mono">
                {data.health.openai.avg_response_time.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Circuit Breaker
              </span>
              <CircuitBreakerBadge state={data.circuitBreakers.openai.state} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rate Limit</span>
              <span className="text-sm font-mono">
                {data.rateLimiting.openai.requestsInWindow} req/min
              </span>
            </div>
          </div>
        </Card>

        {/* Gemini Service */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Gemini Enhancement</h3>
            <StatusBadge status={data.health.gemini.status} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="text-sm font-mono">
                {(data.health.gemini.error_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Response
              </span>
              <span className="text-sm font-mono">
                {data.health.gemini.avg_response_time.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Circuit Breaker
              </span>
              <CircuitBreakerBadge state={data.circuitBreakers.gemini.state} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rate Limit</span>
              <span className="text-sm font-mono">
                {data.rateLimiting.gemini.requestsInWindow} req/min
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cache Performance */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <HardDrive className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold">Cache Performance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Hit Rate</span>
                <span className="text-sm font-mono">
                  {(data.health.cache.hit_rate * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={data.health.cache.hit_rate * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  TTS Cache Size
                </span>
                <span className="text-sm font-mono">{data.cache.tts.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Enhancement Cache
                </span>
                <span className="text-sm font-mono">
                  {data.cache.enhancement.size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Memory Usage
                </span>
                <span className="text-sm font-mono">
                  {data.health.cache.memory_usage_mb}MB
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Request Volume */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold">Request Volume</h3>
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {data.performance.total_requests}
              </p>
              <p className="text-sm text-muted-foreground">
                Total requests ({data.performance.window_minutes}m window)
              </p>
            </div>
            <div className="space-y-2">
              {data.performance.services.map((service) => (
                <div key={service.service} className="flex justify-between">
                  <span className="text-sm capitalize">{service.service}</span>
                  <span className="text-sm font-mono">
                    {service.requests} (
                    {(service.success_rate * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Response Times */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold">Response Times</h3>
          </div>
          <div className="space-y-3">
            {data.performance.services.map((service) => (
              <div key={service.service}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm capitalize">{service.service}</span>
                  <span className="text-sm font-mono">
                    {service.avg_response_time.toFixed(0)}ms
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (service.avg_response_time / 5000) * 100,
                    100
                  )}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Rate Limiting Status</h4>
            <div className="space-y-1 text-sm">
              <p>OpenAI Backoff: {data.rateLimiting.openai.currentBackoff}ms</p>
              <p>Gemini Backoff: {data.rateLimiting.gemini.currentBackoff}ms</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">
              Circuit Breaker Details
            </h4>
            <div className="space-y-1 text-sm">
              <p>OpenAI Failures: {data.circuitBreakers.openai.failures}</p>
              <p>Gemini Failures: {data.circuitBreakers.gemini.failures}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
