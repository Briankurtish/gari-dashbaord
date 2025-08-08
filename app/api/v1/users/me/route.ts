import { NextResponse } from "next/server";
import { headers } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://api.gari-mobility.tech";

export async function GET(request: Request) {
  try {
    const headersList = headers();
    const token = headersList.get("Authorization");

    if (!token) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/v1/users/me/`, {
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch user data" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("User data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
