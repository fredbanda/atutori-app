// lib/monitoring/voice-health.ts
// Production-ready monitoring system for voice services
// Tracks performance, errors, and system health

// Remove "use server" since this is utilities, not server actions

export interface VoiceMetrics {
  timestamp: Date;
  service: "openai" | "gemini" | "browser-fallback";
  operation: "tts" | "stt" | "enhancement";
  duration_ms: number;
  success: boolean;
  error?: string;
  user_grade?: number;
  cache_hit?: boolean;
}

export interface HealthStatus {
  openai: {
    status: "healthy" | "degraded" | "down";
    last_success: Date | null;
    error_rate: number;
    avg_response_time: number;
  };
  gemini: {
    status: "healthy" | "degraded" | "down";
    last_success: Date | null;
    error_rate: number;
    avg_response_time: number;
  };
  cache: {
    hit_rate: number;
    size: number;
    memory_usage_mb: number;
  };
  overall: "healthy" | "degraded" | "critical";
}

// In-memory metrics storage (in production, use Redis or database)
class VoiceHealthMonitor {
  private metrics: VoiceMetrics[] = [];
  private readonly MAX_METRICS = 10000; // Keep last 10k metrics in memory
  private readonly HEALTH_CHECK_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  logMetric(metric: VoiceMetrics) {
    this.metrics.push(metric);

    // Maintain sliding window
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log critical errors immediately
    if (!metric.success && metric.error) {
      console.error(
        `🚨 Voice Service Error [${metric.service}:${metric.operation}]:`,
        {
          error: metric.error,
          duration: metric.duration_ms,
          grade: metric.user_grade,
          timestamp: metric.timestamp.toISOString(),
        }
      );
    }

    // Log performance warnings
    if (metric.success && metric.duration_ms > 5000) {
      console.warn(
        `⚠️ Slow Voice Response [${metric.service}:${metric.operation}]: ${metric.duration_ms}ms`
      );
    }
  }

  getHealthStatus(): HealthStatus {
    const now = Date.now();
    const windowStart = now - this.HEALTH_CHECK_WINDOW_MS;
    const recentMetrics = this.metrics.filter(
      (m) => m.timestamp.getTime() > windowStart
    );

    const openaiMetrics = recentMetrics.filter((m) => m.service === "openai");
    const geminiMetrics = recentMetrics.filter((m) => m.service === "gemini");

    // Calculate service health
    const getServiceHealth = (metrics: VoiceMetrics[]) => {
      if (metrics.length === 0) {
        return {
          status: "healthy" as const,
          last_success: null,
          error_rate: 0,
          avg_response_time: 0,
        };
      }

      const successful = metrics.filter((m) => m.success);
      const failed = metrics.filter((m) => !m.success);
      const errorRate = failed.length / metrics.length;
      const avgResponseTime =
        successful.reduce((sum, m) => sum + m.duration_ms, 0) /
        (successful.length || 1);
      const lastSuccess =
        successful.length > 0
          ? successful[successful.length - 1].timestamp
          : null;

      let status: "healthy" | "degraded" | "down" = "healthy";
      if (errorRate > 0.5 || avgResponseTime > 10000) status = "degraded";
      if (errorRate > 0.8 || (failed.length > 0 && successful.length === 0))
        status = "down";

      return {
        status,
        last_success: lastSuccess,
        error_rate: errorRate,
        avg_response_time: avgResponseTime,
      };
    };

    const openaiHealth = getServiceHealth(openaiMetrics);
    const geminiHealth = getServiceHealth(geminiMetrics);

    // Cache metrics (simplified - in production use actual cache stats)
    const cacheHits = recentMetrics.filter((m) => m.cache_hit).length;
    const cacheTotal = recentMetrics.length;
    const cacheHitRate = cacheTotal > 0 ? cacheHits / cacheTotal : 0;

    // Overall system health
    let overall: "healthy" | "degraded" | "critical" = "healthy";
    if (
      openaiHealth.status === "degraded" ||
      geminiHealth.status === "degraded"
    ) {
      overall = "degraded";
    }
    if (openaiHealth.status === "down" && geminiHealth.status === "down") {
      overall = "critical";
    }

    return {
      openai: openaiHealth,
      gemini: geminiHealth,
      cache: {
        hit_rate: cacheHitRate,
        size: cacheTotal,
        memory_usage_mb: Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        ),
      },
      overall,
    };
  }

  // Get recent error patterns for debugging
  getRecentErrors(limit: number = 10): VoiceMetrics[] {
    return this.metrics
      .filter((m) => !m.success)
      .slice(-limit)
      .reverse();
  }

  // Get performance statistics
  getPerformanceStats() {
    const now = Date.now();
    const windowStart = now - this.HEALTH_CHECK_WINDOW_MS;
    const recentMetrics = this.metrics.filter(
      (m) => m.timestamp.getTime() > windowStart
    );

    const byService = {
      openai: recentMetrics.filter((m) => m.service === "openai"),
      gemini: recentMetrics.filter((m) => m.service === "gemini"),
      browser: recentMetrics.filter((m) => m.service === "browser-fallback"),
    };

    return {
      total_requests: recentMetrics.length,
      services: Object.entries(byService).map(([service, metrics]) => ({
        service,
        requests: metrics.length,
        success_rate:
          metrics.length > 0
            ? metrics.filter((m) => m.success).length / metrics.length
            : 0,
        avg_response_time:
          metrics.length > 0
            ? metrics
                .filter((m) => m.success)
                .reduce((sum, m) => sum + m.duration_ms, 0) /
                metrics.filter((m) => m.success).length || 0
            : 0,
      })),
      window_minutes: this.HEALTH_CHECK_WINDOW_MS / 60000,
    };
  }
}

// Global monitoring instance
export const voiceHealthMonitor = new VoiceHealthMonitor();

// Helper function to wrap voice operations with monitoring
export async function monitorVoiceOperation<T>(
  service: VoiceMetrics["service"],
  operation: VoiceMetrics["operation"],
  operationFn: () => Promise<T>,
  userGrade?: number,
  cacheHit?: boolean
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operationFn();

    voiceHealthMonitor.logMetric({
      timestamp: new Date(),
      service,
      operation,
      duration_ms: Date.now() - startTime,
      success: true,
      user_grade: userGrade,
      cache_hit: cacheHit,
    });

    return result;
  } catch (error) {
    voiceHealthMonitor.logMetric({
      timestamp: new Date(),
      service,
      operation,
      duration_ms: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      user_grade: userGrade,
      cache_hit: cacheHit,
    });

    throw error;
  }
}

// Circuit breaker pattern for failing services
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeoutMs = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open - service unavailable");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "open";
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
