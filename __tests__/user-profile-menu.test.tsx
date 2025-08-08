import { render, screen, fireEvent } from "@testing-library/react";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("UserProfileMenu", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }));
  });

  it("renders user info correctly", () => {
    render(<UserProfileMenu />);

    // Check if user name is displayed
    expect(screen.getByText("Carl Johnson")).toBeInTheDocument();
    // Check if user role is displayed
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    // Check if initials are displayed in avatar
    expect(screen.getByText("CJ")).toBeInTheDocument();
  });

  it("opens menu on click and navigates to profile page", () => {
    render(<UserProfileMenu />);

    // Click the menu trigger button
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);

    // Check if Profile option is visible
    const profileButton = screen.getByText("Profile");
    expect(profileButton).toBeInTheDocument();

    // Click the profile option
    fireEvent.click(profileButton);

    // Verify navigation was called
    expect(mockPush).toHaveBeenCalledWith("/dashboard/profile");
  });
});
