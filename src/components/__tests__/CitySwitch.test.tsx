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

  it("renders button with city name", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button", { name: /Change region/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Berlin");
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
    expect(screen.getByRole("option", { name: "Berlin" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Hamburg" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "NRW" })).toBeInTheDocument();
  });

  it("selects city when clicked", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const hamburgOption = screen.getByRole("option", { name: "Hamburg" });
    fireEvent.click(hamburgOption);
    expect(mockSetPreferredCity).toHaveBeenCalledWith("hamburg");
  });

  it("closes dropdown after selection", () => {
    render(<CitySwitch />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const hamburgOption = screen.getByRole("option", { name: "Hamburg" });
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
    const hamburgOption = screen.getByRole("option", { name: "Hamburg" });
    expect(hamburgOption.closest("li")).toHaveAttribute("aria-selected", "true");
  });
});
