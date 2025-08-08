import fetch from "node-fetch";

async function testLogin() {
  try {
    console.log("Testing login...");

    const response = await fetch(
      "https://api.gari-mobility.tech/api/v1/auth/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: "colonelpirate@gmail.com",
          password: "tyron12345",
        }),
      }
    );

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Response body:", text);

    try {
      const data = JSON.parse(text);
      console.log("Parsed response:", data);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testLogin();
