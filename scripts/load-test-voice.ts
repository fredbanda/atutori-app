// scripts/load-test-voice.ts
// Production load testing for voice services
// Simulates massive concurrent usage to verify scalability

import {
  bulletproofTTS,
  bulletproofBatchTTS,
  getVoiceSystemHealth,
} from "../lib/services/bulletproof-voice";
import { voiceHealthMonitor } from "../lib/monitoring/voice-health";

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  testDurationMinutes: number;
  rampUpMinutes: number;
}

interface LoadTestResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughputPerSecond: number;
  healthSummary: any;
}

// Test scenarios that match real lesson usage
const TEST_SCENARIOS = [
  {
    name: "Grade 1 Content",
    texts: [
      "Welcome to your math lesson! Today we'll learn about counting.",
      "Count with me: 1, 2, 3, 4, 5!",
      "Great job! You're doing amazing!",
      "Now let's try adding numbers together.",
    ],
    grade: 1,
  },
  {
    name: "Grade 2 Science",
    texts: [
      "Look around you... can you see different animals?",
      "Animals need food, water, and shelter to survive.",
      "Repeat after me: mammals",
      "Excellent work! You're a great scientist!",
    ],
    grade: 2,
  },
  {
    name: "Grade 3 English",
    texts: [
      "Stories have characters, settings, and plots.",
      "Let's practice reading together...",
      "What do you think will happen next?",
      "Reading helps us learn about the world!",
    ],
    grade: 3,
  },
];

async function runSingleRequest(scenario: (typeof TEST_SCENARIOS)[0]): Promise<{
  success: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const randomText =
      scenario.texts[Math.floor(Math.random() * scenario.texts.length)];
    await bulletproofTTS(randomText, scenario.grade);

    return {
      success: true,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runUserSession(
  userId: number,
  config: LoadTestConfig,
  scenario: (typeof TEST_SCENARIOS)[0]
): Promise<Array<{ success: boolean; responseTime: number; error?: string }>> {
  const results = [];

  console.log(
    `👤 User ${userId} starting session with ${config.requestsPerUser} requests`
  );

  for (let i = 0; i < config.requestsPerUser; i++) {
    // Add realistic delays between requests (0.5-3 seconds)
    const delay = 500 + Math.random() * 2500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const result = await runSingleRequest(scenario);
    results.push(result);

    if (i % 10 === 0) {
      console.log(
        `👤 User ${userId} completed ${i + 1}/${
          config.requestsPerUser
        } requests`
      );
    }
  }

  console.log(`✅ User ${userId} completed session`);
  return results;
}

async function runBatchTest(): Promise<void> {
  console.log("🔄 Testing batch processing...");

  const batchItems = [
    { text: "This is batch item 1", id: "batch_1" },
    { text: "This is batch item 2", id: "batch_2" },
    { text: "This is batch item 3", id: "batch_3" },
    { text: "This is batch item 4", id: "batch_4" },
    { text: "This is batch item 5", id: "batch_5" },
  ];

  const startTime = Date.now();

  try {
    const results = await bulletproofBatchTTS(
      batchItems,
      2,
      (completed, total) => {
        console.log(`📦 Batch progress: ${completed}/${total}`);
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Batch test completed in ${duration}ms`);
    console.log(`📊 Results: ${results.length} items processed`);

    // Verify all items were processed
    const processedIds = results.map((r) => r.id).sort();
    const expectedIds = batchItems.map((b) => b.id).sort();

    if (JSON.stringify(processedIds) === JSON.stringify(expectedIds)) {
      console.log("✅ All batch items processed correctly");
    } else {
      console.error(
        "❌ Missing batch items:",
        expectedIds.filter((id) => !processedIds.includes(id))
      );
    }
  } catch (error) {
    console.error("❌ Batch test failed:", error);
  }
}

export async function runLoadTest(
  config: LoadTestConfig
): Promise<LoadTestResults> {
  console.log("🚀 Starting voice system load test...");
  console.log(
    `📊 Config: ${config.concurrentUsers} users, ${config.requestsPerUser} requests each`
  );
  console.log(
    `⏱️  Duration: ${config.testDurationMinutes} minutes with ${config.rampUpMinutes} minute ramp-up`
  );

  const startTime = Date.now();
  const allResults: Array<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> = [];

  // Test batch processing first
  await runBatchTest();

  console.log("🔄 Starting concurrent user simulation...");

  // Create user sessions with ramp-up
  const userPromises: Promise<any>[] = [];
  const rampUpDelay =
    (config.rampUpMinutes * 60 * 1000) / config.concurrentUsers;

  for (let userId = 1; userId <= config.concurrentUsers; userId++) {
    const scenario =
      TEST_SCENARIOS[Math.floor(Math.random() * TEST_SCENARIOS.length)];

    const userPromise = new Promise(async (resolve) => {
      // Stagger user start times for realistic ramp-up
      await new Promise((resolve) =>
        setTimeout(resolve, (userId - 1) * rampUpDelay)
      );

      try {
        const userResults = await runUserSession(userId, config, scenario);
        allResults.push(...userResults);
        resolve(userResults);
      } catch (error) {
        console.error(`❌ User ${userId} failed:`, error);
        resolve([]);
      }
    });

    userPromises.push(userPromise);
  }

  // Wait for all users to complete
  await Promise.all(userPromises);

  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  // Calculate results
  const totalRequests = allResults.length;
  const successfulRequests = allResults.filter((r) => r.success).length;
  const failedRequests = totalRequests - successfulRequests;
  const responseTimes = allResults
    .map((r) => r.responseTime)
    .sort((a, b) => a - b);

  const averageResponseTime =
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const p95Index = Math.floor(responseTimes.length * 0.95);
  const p99Index = Math.floor(responseTimes.length * 0.99);
  const p95ResponseTime = responseTimes[p95Index] || 0;
  const p99ResponseTime = responseTimes[p99Index] || 0;
  const errorRate = failedRequests / totalRequests;
  const throughputPerSecond = totalRequests / (totalDuration / 1000);

  // Get final health status
  const healthSummary = await getVoiceSystemHealth();

  const results: LoadTestResults = {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime,
    p95ResponseTime,
    p99ResponseTime,
    errorRate,
    throughputPerSecond,
    healthSummary,
  };

  // Print detailed results
  console.log("\n🎯 LOAD TEST RESULTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`📊 Total Requests: ${totalRequests}`);
  console.log(
    `✅ Successful: ${successfulRequests} (${(
      (successfulRequests / totalRequests) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `❌ Failed: ${failedRequests} (${(errorRate * 100).toFixed(1)}%)`
  );
  console.log(`⚡ Throughput: ${throughputPerSecond.toFixed(1)} req/s`);
  console.log(`🕐 Avg Response Time: ${averageResponseTime.toFixed(0)}ms`);
  console.log(`📈 95th Percentile: ${p95ResponseTime.toFixed(0)}ms`);
  console.log(`📈 99th Percentile: ${p99ResponseTime.toFixed(0)}ms`);
  console.log(`🏥 Overall System Health: ${healthSummary.health.overall}`);
  console.log(
    `🎯 Cache Hit Rate: ${(voiceHealthMonitor.getHealthStatus().cache.hit_rate * 100).toFixed(
      1
    )}%`
  );

  // Health check details
  if (healthSummary.health.overall !== "healthy") {
    console.log("\n⚠️  SYSTEM HEALTH ISSUES:");
    console.log(`🔴 OpenAI Status: ${healthSummary.health.openai.status}`);
    console.log(`🟡 Gemini Status: ${healthSummary.health.gemini.status}`);
  }

  // Error analysis
  if (failedRequests > 0) {
    console.log("\n🔍 ERROR ANALYSIS:");
    const recentErrors = voiceHealthMonitor.getRecentErrors(5);
    recentErrors.forEach((error, index) => {
      console.log(
        `   ${index + 1}. [${error.service}:${error.operation}] ${error.error}`
      );
    });
  }

  return results;
}

// Predefined test configurations
export const LOAD_TEST_CONFIGS = {
  smoke: {
    concurrentUsers: 5,
    requestsPerUser: 3,
    testDurationMinutes: 1,
    rampUpMinutes: 0.5,
  } as LoadTestConfig,

  moderate: {
    concurrentUsers: 25,
    requestsPerUser: 10,
    testDurationMinutes: 5,
    rampUpMinutes: 1,
  } as LoadTestConfig,

  heavy: {
    concurrentUsers: 100,
    requestsPerUser: 20,
    testDurationMinutes: 10,
    rampUpMinutes: 2,
  } as LoadTestConfig,

  stress: {
    concurrentUsers: 500,
    requestsPerUser: 50,
    testDurationMinutes: 15,
    rampUpMinutes: 3,
  } as LoadTestConfig,
};

// CLI interface for running tests
if (require.main === module) {
  const testType = process.argv[2] || "smoke";
  const config = LOAD_TEST_CONFIGS[testType as keyof typeof LOAD_TEST_CONFIGS];

  if (!config) {
    console.error(
      "❌ Invalid test type. Options: smoke, moderate, heavy, stress"
    );
    process.exit(1);
  }

  runLoadTest(config)
    .then((results) => {
      console.log("\n✅ Load test completed successfully");

      // Exit with error code if performance is poor
      if (results.errorRate > 0.1 || results.p95ResponseTime > 10000) {
        console.error("❌ Performance below acceptable thresholds");
        process.exit(1);
      }

      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Load test failed:", error);
      process.exit(1);
    });
}
