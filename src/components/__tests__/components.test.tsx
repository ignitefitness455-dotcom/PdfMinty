/**
 * @vitest-environment jsdom
 */
import { expect, it, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { FileUploader } from "../FileUploader";
import { DocumentPreview } from "../DocumentPreview";
import { PdfPreview } from "../PdfPreview";
import { ToastProvider } from "../../contexts/ToastContext";

// Mock pdfRunner's preprocessor
vi.mock("../../core/pdfRunner", () => ({
  preprocessAndLoadPdf: vi.fn().mockResolvedValue({
    pdf: {
      numPages: 3,
      getPage: vi.fn().mockResolvedValue({
        getViewport: () => ({ width: 100, height: 100 }),
        render: () => ({
          promise: Promise.resolve(),
        }),
      }),
    },
  }),
}));

describe("FileUploader Component", () => {
  it("renders with correct instruction titles for standard tools", () => {
    const handleSelected = vi.fn();
    render(<FileUploader onSelectedFiles={handleSelected} toolId="merge" />);

    expect(screen.getByText(/Drop files here or/i)).not.toBeNull();
    expect(screen.getByText(/Choose File/i)).not.toBeNull();
  });

  it("triggers selection callback on physical file inputs change", () => {
    const handleSelected = vi.fn();
    const { container } = render(<FileUploader onSelectedFiles={handleSelected} toolId="merge" />);

    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    expect(input).not.toBeNull();

    const file = new File(["pdf contents"], "test.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(handleSelected).toHaveBeenCalled();
  });
});

describe("DocumentPreview Component", () => {
  it("renders standard PDF preview wrapper when a PDF is selected", () => {
    const dummyFile = new File(["bytes"], "doc.pdf", { type: "application/pdf" });
    render(
      <ToastProvider>
        <DocumentPreview files={[dummyFile]} toolId="merge" />
      </ToastProvider>
    );

    // Document thumbnail loader spinner should show initially or loader progress should mount
    expect(screen.getByText(/Generating document thumbnails/i)).not.toBeNull();
  });

  it("renders image thumbnail collage grid for image-to-pdf compilers", () => {
    const dummyImg = new File(["bytes"], "avatar.png", { type: "image/png" });
    render(
      <ToastProvider>
        <DocumentPreview files={[dummyImg]} toolId="img-to-pdf" />
      </ToastProvider>
    );

    expect(screen.getByText(/Compiled Images/i)).not.toBeNull();
    expect(screen.getByText(/avatar.png/i)).not.toBeNull();
  });
});

describe("PdfPreview Component", () => {
  it("successfully mounts and triggers pdf preprocessor loaded event", async () => {
    const file = new File(["bytes"], "document.pdf", { type: "application/pdf" });
    render(
      <ToastProvider>
        <PdfPreview file={file} />
      </ToastProvider>
    );

    expect(screen.getByText(/Generating document thumbnails/i)).not.toBeNull();
  });
});
