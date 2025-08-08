import { NextResponse } from "next/server";

const API_URL = "https://api.gari-mobility.tech";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Attempting login with email:", body.email);

    const apiResponse = await fetch(`${API_URL}/api/v1/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    // Log response details for debugging
    console.log("API Response Status:", apiResponse.status);
    console.log(
      "API Response Headers:",
      Object.fromEntries(apiResponse.headers)
    );

    const responseText = await apiResponse.text();
    console.log("API Response Body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse API response:", e);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      );
    }

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.detail || "Authentication failed" },
        { status: apiResponse.status }
      );
    }

    // Transform response to match our expected format
    const responseData = {
      token: data.Token,
      user: data.user,
    };

    // Create response with the token
    const response = NextResponse.json(responseData);

    // Set CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      {
        error: "Failed to connect to authentication server",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Handle GET requests with proper error
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Please use POST for login." },
    { status: 405 }
  );
}
