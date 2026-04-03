// Test environment variables directly
console.log("Testing environment variables:");
console.log("BETTER_AUTH_SECRET type:", typeof process.env.BETTER_AUTH_SECRET);
console.log(
  "BETTER_AUTH_SECRET value:",
  process.env.BETTER_AUTH_SECRET?.substring(0, 10) + "..."
);
console.log("DATABASE_URL type:", typeof process.env.DATABASE_URL);
console.log(
  "DATABASE_URL start:",
  process.env.DATABASE_URL?.substring(0, 20) + "..."
);
console.log("KV_REST_API_URL type:", typeof process.env.KV_REST_API_URL);
console.log("KV_REST_API_TOKEN type:", typeof process.env.KV_REST_API_TOKEN);
