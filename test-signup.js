// Simple test script to trigger sign-up POST
fetch("http://localhost:3000/api/auth/sign-up/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  }),
})
  .then((response) => response.text())
  .then((data) => console.log("Response:", data))
  .catch((error) => console.error("Error:", error));
