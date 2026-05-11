import { PDFDocument } from 'pdf-lib';

export async function getPdfBytes(input) {
    if (input instanceof ArrayBuffer) return input;
    if (typeof input === 'string' && window.pdfDB) {
        return await window.pdfDB.getFile(input);
    }
    throw new Error("Could not retrieve file data.");
}

export async function processPdfTask(btnElem, processFn) {
    if (btnElem && !btnElem.hasAttribute('data-original-text')) {
        btnElem.setAttribute('data-original-text', btnElem.textContent);
    }
    if (btnElem) {
        btnElem.disabled = true;
        btnElem.textContent = "Processing...";
    }
    if (typeof window.showProgress === 'function') window.showProgress(10);

    try {
        await processFn();
    } catch (error) {
        console.error("PDF Processing Error:", error);
        if (typeof window.hideProgress === 'function') window.hideProgress();
        if (typeof window.showError === 'function') {
            window.showError(error.message || "An error occurred while processing the PDF.");
        } else {
            alert("Error: " + (error.message || "An error occurred"));
        }
    } finally {
        if (btnElem) {
            btnElem.disabled = false;
            btnElem.textContent = btnElem.getAttribute('data-original-text');
        }
    }
}
