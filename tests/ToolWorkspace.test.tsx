/**
 * @vitest-environment jsdom
 */
import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ToolWorkspace } from "../src/components/ToolWorkspace";
import { useToast } from "../src/contexts/ToastContext";
import { preprocessAndLoadPdf } from "../src/core/pdfRunner";

// Mock the dependencies
vi.mock("../src/contexts/ToastContext", () => {
  const showToast = vi.fn();
  return {
    useToast: () => ({ showToast }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("../src/core/pdfRunner", () => ({
  executePdfWorker: vi.fn(),
  preprocessAndLoadPdf: vi.fn(),
}));

describe("React Component: ToolWorkspace.tsx", () => {
  const mockTool = {
    id: "merge",
    name: "Merge PDF",
    slug: "merge-pdf",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ToolWorkspace tool={mockTool} />
      </MemoryRouter>
    );
  };

  it("renders the select tool title and back-button on mount", () => {
    renderComponent();
    expect(screen.getByText("Merge PDF")).not.toBeNull();
    expect(screen.getByText(/Back to Dashboard/i)).not.toBeNull();
  });

  it("shows initial upload dropzone and accepts PDF files for a PDF-only tool", async () => {
    const { showToast } = useToast();
    vi.mocked(preprocessAndLoadPdf).mockResolvedValue({ pdf: { numPages: 10 } } as any);

    renderComponent();

    const uploader = screen.getByLabelText(/upload pdf or image files/i);
    expect(uploader).not.toBeNull();

    // Create a mock PDF File
    const mockPdfFile = new File(["pdf content"], "document.pdf", {
      type: "application/pdf",
    });

    // Simulate drop operation
    fireEvent.drop(uploader, {
      dataTransfer: {
        files: [mockPdfFile],
      },
    });

    // Verify file loader preprocessor was triggered
    expect(preprocessAndLoadPdf).toHaveBeenCalledWith(mockPdfFile, expect.anything());
  });

  it("rejects invalid file types and alerts with a toast message", async () => {
    const { showToast } = useToast();
    renderComponent();

    const uploader = screen.getByLabelText(/upload pdf or image files/i);

    // Create an invalid File (e.g., txt file)
    const mockTxtFile = new File(["plain text content"], "wrong.txt", {
      type: "text/plain",
    });

    // Simulate drop operation
    fireEvent.drop(uploader, {
      dataTransfer: {
        files: [mockTxtFile],
      },
    });

    // preprocessAndLoadPdf should not be called
    expect(preprocessAndLoadPdf).not.toHaveBeenCalled();
    // showToast error should be triggered
    expect(showToast).toHaveBeenCalledWith("Please upload PDF documents.", "error");
  });

  it("accepts image uploads if the active tool is an image-to-pdf compiler", async () => {
    const mockImageTool = {
      id: "img-to-pdf",
      name: "Image to PDF",
      slug: "jpg-to-pdf",
    };

    render(
      <MemoryRouter>
        <ToolWorkspace tool={mockImageTool} />
      </MemoryRouter>
    );

    const uploader = screen.getByLabelText(/upload pdf or image files/i);

    // Create a mock JPG File
    const mockImageFile = new File(["image binary"], "photo.jpg", {
      type: "image/jpeg",
    });

    // Simulate drop operation
    fireEvent.drop(uploader, {
      dataTransfer: {
        files: [mockImageFile],
      },
    });

    // preprocessAndLoadPdf should not run for image-to-pdf (since it doesn't need info loading)
    expect(preprocessAndLoadPdf).not.toHaveBeenCalled();
  });
});
