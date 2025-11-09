import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CitySwitch from "../CitySwitch";
import { useAppStore } from "@/store/app";

vi.mock("@/store/app", () => ({
  useAppStore: vi.fn(),
}));

describe("CitySwitch", () => {
  const mockSetPreferredCity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue({
      preferredCity: "berlin",
      setPreferredCity: mockSetPreferredCity,
    });
  });

  it("renders button with location icon", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button", { name: /Change region/i });
    expect(button).toBeInTheDocument();
  });

  it("displays current city in aria-label", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button", { name: /Current: Berlin/i });
    expect(button).toBeInTheDocument();
  });

  it("opens dropdown when clicked", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("displays all cities in dropdown", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Hamburg")).toBeInTheDocument();
    expect(screen.getByText("NRW")).toBeInTheDocument();
  });

  it("selects city when clicked", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const hamburgOption = screen.getByText("Hamburg");
    fireEvent.click(hamburgOption);
    expect(mockSetPreferredCity).toHaveBeenCalledWith("hamburg");
  });

  it("closes dropdown after selection", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const hamburgOption = screen.getByText("Hamburg");
    fireEvent.click(hamburgOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <CitySwitch />
      </div>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("uses custom buttonClassName when provided", () => {
    render(<CitySwitch buttonClassName="custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("marks current city as selected", () => {
    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue({
      preferredCity: "hamburg",
      setPreferredCity: mockSetPreferredCity,
    });
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const hamburgOption = screen.getByText("Hamburg").closest("li");
    expect(hamburgOption).toHaveAttribute("aria-selected", "true");
  });
});
