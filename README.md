# PDFMinty - Free Online PDF Tools

**100% Client-side. No Upload. No Servers. 🔒 Private.**

PDFMinty is a collection of free, open-source PDF tools that run entirely in your browser. Your files never leave your device, ensuring complete privacy and security.

## ✨ Features

- **Merge PDFs:** Combine multiple PDF files into one.
- **Split PDF:** Extract specific pages or split a PDF into multiple documents.
- **Compress PDF:** Reduce file size with various compression levels (Basic, Strong, Deep).
- **Crop & Resize PDF:** Adjust page dimensions or crop content.
- **Unlock PDF:** Remove password protection from PDFs.
- **Add Page Numbers:** Insert customizable page numbers.
- **Watermark PDF:** Add text watermarks to your documents.
- **PDF to Image:** Convert PDF pages to JPG images.
- **Image to PDF:** Convert images (JPG, PNG) to a single PDF.
- **Rotate PDF:** Rotate pages within your PDF.
- **Delete Pages:** Remove unwanted pages from your PDF.
- **Extract Pages:** Pull out specific pages to create a new PDF.

## 🚀 Getting Started

### Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ignitefitness455-dotcom/PdfMinty.git
    cd PdfMinty
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```
This will generate optimized static assets in the `dist/` directory.

### Deploying to Cloudflare Pages (Recommended)

1.  **Fork this repository** to your GitHub account.
2.  **Connect your forked repository** to Cloudflare Pages.
3.  **Build settings:**
    -   **Framework preset:** `Vite`
    -   **Build command:** `npm run build`
    -   **Build output directory:** `dist`
4.  **Environment Variables:** Add the following to your Cloudflare Pages project settings:
    -   `GEMINI_API_KEY`: Your API key for Gemini AI integration.
    -   `RESEND_API_KEY`: Your API key for the contact form service.
    -   `RATE_LIMIT_KV`: The name of your Cloudflare KV Namespace binding for rate limiting (e.g., `PDFMINTY_RATE_LIMIT`).

### Android App (Capacitor)

1.  **Build web assets and sync with Android project:**
    ```bash
    npm run build:android
    ```
2.  **Open Android Studio:**
    ```bash
    npm run open:android
    ```
    From Android Studio, you can build and run the app on an emulator or device.

## 🛠️ Technologies Used

-   **Vite:** Fast frontend tooling.
-   **pdf-lib:** For PDF manipulation in the browser.
-   **pdfjs-dist:** For PDF rendering and advanced features in Web Workers.
-   **JSZip:** For creating ZIP archives.
-   **Capacitor:** For building native Android applications from the web codebase.
-   **Cloudflare Workers/Pages:** For serverless functions (API routes) and static site hosting.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
