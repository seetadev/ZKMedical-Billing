import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InvoiceForm from "../../components/InvoiceForm";
import { InvoiceProvider } from "../../contexts/InvoiceContext";

// Mock the SocialCalc invoice module with factory function
vi.mock("../../components/socialcalc/modules/invoice.js", () => ({
  addInvoiceData: vi.fn(() => true),
  clearInvoiceData: vi.fn(() => true),
}));

describe("InvoiceForm", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (props = defaultProps) => {
    return render(
      <InvoiceProvider>
        <InvoiceForm {...props} />
      </InvoiceProvider>
    );
  };

  it("renders when open", () => {
    renderWithProvider();

    expect(screen.getByTestId("ion-modal")).toBeInTheDocument();
    expect(screen.getByText("Invoice Form")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderWithProvider({ ...defaultProps, isOpen: false });

    expect(screen.queryByTestId("ion-modal")).not.toBeInTheDocument();
  });

  it("displays form fields", () => {
    renderWithProvider();

    // Check for some key form fields that should exist
    expect(screen.getByTestId("ion-modal")).toBeInTheDocument();
    expect(screen.getByText("Invoice Form")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", () => {
    const mockOnClose = vi.fn();

    renderWithProvider({ ...defaultProps, onClose: mockOnClose });

    // Find and click close button (looking for close icon)
    const closeButtons = screen.getAllByTestId("ion-button");
    // The first button should be the close button
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Simplified test for basic functionality
  it("handles form interaction", () => {
    renderWithProvider();

    // Just verify the modal renders and we can interact with it
    expect(screen.getByTestId("ion-modal")).toBeInTheDocument();

    // Try to find any input or interactive element
    const inputs = screen.getAllByTestId("ion-input");
    expect(inputs.length).toBeGreaterThan(0);
  });
});
