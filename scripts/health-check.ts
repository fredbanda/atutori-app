// scripts/health-check.ts
// Production readiness health check
// Verifies all systems are ready for scale

import {
  getVoiceSystemHealth,
  triggerServiceRecovery,
} from "../lib/services/bulletproof-voice";
import { runLoadTest, LOAD_TEST_CONFIGS } from "./load-test-voice";

interface HealthCheckResult {
  timestamp: string;
  overall: "pass" | "fail" | "warning";
  checks: {
    name: string;
    status: "pass" | "fail" | "warning";
    message: string;
    details?: any;
  }[];
  recommendations: string[];
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  console.log("🏥 Starting production health check...");

  const checks: HealthCheckResult["checks"] = [];
  const recommendations: string[] = [];

  // 1. Basic voice system health
  try {
    console.log("🔍 Checking voice system health...");
    const health = await getVoiceSystemHealth();

    if (health.health.overall === "healthy") {
      checks.push({
        name: "Voice System Health",
        status: "pass",
        message: "All voice services are healthy",
      });
    } else if (health.health.overall === "degraded") {
      checks.push({
        name: "Voice System Health",
        status: "warning",
        message: "Some voice services are degraded",
        details: health.health,
      });
      recommendations.push(
        "Monitor degraded services and consider triggering recovery"
      );
    } else {
      checks.push({
        name: "Voice System Health",
        status: "fail",
        message: "Voice system is in critical state",
        details: health.health,
      });
      recommendations.push("Critical: Trigger service recovery immediately");
    }
  } catch (error) {
    checks.push({
      name: "Voice System Health",
      status: "fail",
      message: `Health check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }

  // 2. API connectivity
  try {
    console.log("🔍 Checking API connectivity...");

    // Test OpenAI
    const openaiTest = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (openaiTest.ok) {
      checks.push({
        name: "OpenAI API Connectivity",
        status: "pass",
        message: "OpenAI API is accessible",
      });
    } else {
      checks.push({
        name: "OpenAI API Connectivity",
        status: "fail",
        message: `OpenAI API returned ${openaiTest.status}: ${openaiTest.statusText}`,
      });
    }

    // Test Gemini (basic check)
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      checks.push({
        name: "Gemini API Configuration",
        status: "pass",
        message: "Gemini API key is configured",
      });
    } else {
      checks.push({
        name: "Gemini API Configuration",
        status: "warning",
        message: "Gemini API key not found",
      });
      recommendations.push(
        "Configure Gemini API key for enhanced text processing"
      );
    }
  } catch (error) {
    checks.push({
      name: "API Connectivity",
      status: "fail",
      message: `API connectivity test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }

  // 3. Environment configuration
  console.log("🔍 Checking environment configuration...");

  const requiredEnvVars = [
    "OPENAI_API_KEY",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVars.length === 0) {
    checks.push({
      name: "Environment Configuration",
      status: "pass",
      message: "All required environment variables are configured",
    });
  } else {
    checks.push({
      name: "Environment Configuration",
      status: "fail",
      message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
    });
  }

  // 4. Load test (smoke test)
  try {
    console.log("🔍 Running smoke test...");
    const loadTestResult = await runLoadTest(LOAD_TEST_CONFIGS.smoke);

    if (
      loadTestResult.errorRate < 0.1 &&
      loadTestResult.p95ResponseTime < 5000
    ) {
      checks.push({
        name: "Load Test (Smoke)",
        status: "pass",
        message: `Smoke test passed: ${loadTestResult.successfulRequests}/${loadTestResult.totalRequests} requests successful`,
        details: {
          errorRate: loadTestResult.errorRate,
          p95ResponseTime: loadTestResult.p95ResponseTime,
          throughput: loadTestResult.throughputPerSecond,
        },
      });
    } else {
      checks.push({
        name: "Load Test (Smoke)",
        status: "warning",
        message: `Smoke test shows performance issues`,
        details: loadTestResult,
      });
      recommendations.push(
        "Performance issues detected. Consider optimization before production deployment"
      );
    }
  } catch (error) {
    checks.push({
      name: "Load Test (Smoke)",
      status: "fail",
      message: `Smoke test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }

  // 5. Cache and memory usage
  try {
    console.log("🔍 Checking cache and memory...");
    const health = await getVoiceSystemHealth();

    if (health.cache.tts.size > 0) {
      checks.push({
        name: "Cache System",
        status: "pass",
        message: `Cache is working: ${health.cache.tts.size} TTS entries, ${health.cache.enhancement.size} enhancement entries`,
      });
    } else {
      checks.push({
        name: "Cache System",
        status: "warning",
        message: "Cache appears empty - may indicate cache issues",
      });
    }

    const ttsSizeMb = Math.round(health.cache.tts.size * 0.01); // rough estimate
    if (ttsSizeMb < 1000) {
      checks.push({
        name: "Memory Usage",
        status: "pass",
        message: `Cache entries: ${health.cache.tts.size} TTS, ${health.cache.enhancement.size} enhancement`,
      });
    } else {
      checks.push({
        name: "Memory Usage",
        status: "warning",
        message: `High cache size: ${health.cache.tts.size} TTS entries`,
      });
      recommendations.push(
        "Monitor memory usage and consider cache size limits"
      );
    }
  } catch (error) {
    checks.push({
      name: "Cache and Memory",
      status: "fail",
      message: `Cache/memory check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }

  // 6. Database connectivity
  try {
    console.log("🔍 Checking database connectivity...");

    // This would be a simple query to verify DB is accessible
    // For now, just check if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      checks.push({
        name: "Database Configuration",
        status: "pass",
        message: "Database URL is configured",
      });
    } else {
      checks.push({
        name: "Database Configuration",
        status: "fail",
        message: "DATABASE_URL not configured",
      });
    }
  } catch (error) {
    checks.push({
      name: "Database Connectivity",
      status: "fail",
      message: `Database check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }

  // Determine overall status
  const failedChecks = checks.filter((check) => check.status === "fail").length;
  const warningChecks = checks.filter(
    (check) => check.status === "warning"
  ).length;

  let overall: "pass" | "fail" | "warning";
  if (failedChecks > 0) {
    overall = "fail";
  } else if (warningChecks > 0) {
    overall = "warning";
  } else {
    overall = "pass";
  }

  const result: HealthCheckResult = {
    timestamp: new Date().toISOString(),
    overall,
    checks,
    recommendations,
  };

  // Print results
  console.log("\n🏥 PRODUCTION HEALTH CHECK RESULTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎯 Overall Status: ${overall.toUpperCase()}`);
  console.log(
    `📊 Checks: ${
      checks.filter((c) => c.status === "pass").length
    } pass, ${warningChecks} warning, ${failedChecks} fail`
  );

  checks.forEach((check) => {
    const icon =
      check.status === "pass" ? "✅" : check.status === "warning" ? "⚠️" : "❌";
    console.log(`${icon} ${check.name}: ${check.message}`);

    if (check.details) {
      console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
    }
  });

  if (recommendations.length > 0) {
    console.log("\n💡 RECOMMENDATIONS:");
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  return result;
}

// CLI interface
if (require.main === module) {
  runHealthCheck()
    .then((result) => {
      console.log("\n✅ Health check completed");

      // Exit with appropriate code
      if (result.overall === "fail") {
        console.error("❌ System is not ready for production deployment");
        process.exit(1);
      } else if (result.overall === "warning") {
        console.warn("⚠️ System has warnings but may be deployable");
        process.exit(0);
      } else {
        console.log("🚀 System is ready for production deployment!");
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error("❌ Health check failed:", error);
      process.exit(1);
    });
}
