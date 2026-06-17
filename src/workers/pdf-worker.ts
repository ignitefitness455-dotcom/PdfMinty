// This file serves as the static reference representation for PDFMinty's client-side sandbox worker.
// The live worker is dynamically built from the inline code in WorkerManager.ts to ensure zero-config bundling.

self.onmessage = async (e) => {
  console.log("Static offline worker reference message received:", e.data);
};
export {};
