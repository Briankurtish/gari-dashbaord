import { LoginCredentials, LoginResponse, User } from "@/types/auth";

const API_URL = "https://api.gari-mobility.tech";

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log("Starting login process with:", credentials.email);

      const response = await fetch(`${API_URL}/api/v1/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      console.log("Login response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        console.error("Login failed:", data);
        throw new Error(data.detail || data.error || "Failed to login");
      }

      // Handle both uppercase and lowercase token field
      const token = data.Token || data.token;
      if (!token) {
        console.error("No token in response:", data);
        throw new Error("No token received from server");
      }

      // Store the token
      console.log("Storing authentication token");
      localStorage.setItem("token", token);

      // Store user data if available
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return {
        token: token,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "Network error - Unable to connect to the server. Please check your internet connection."
        );
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        this.logout();
      }
    }
    return null;
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: token } : {};
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const token = this.getToken();
      console.log("Making authenticated request to:", url);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers["Authorization"] = token;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        console.log("Authentication failed, logging out");
        this.logout();
        window.location.href = "/login";
        throw new Error("Authentication expired");
      }

      return response;
    } catch (error) {
      console.error("Request error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "Network error - Unable to connect to the server. Please check your internet connection."
        );
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
