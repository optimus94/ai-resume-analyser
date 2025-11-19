export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = import("pdfjs-dist/build/pdf.mjs")
    .then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; // MUST exist in /public
      pdfjsLib = lib;
      return lib;
    })
    .catch((err) => {
      throw new Error("Failed to load pdf.js library: " + err);
    });

  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
      return {
        imageUrl: "",
        file: null,
        error: "Invalid or encrypted PDF. Unable to read.",
      };
    }

    let page;
    try {
      page = await pdf.getPage(1);
    } catch {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to load the first page of the PDF.",
      };
    }

    // Prevent extremely large canvases that break toBlob()
    const scale = 2; // safe scale
    const viewport = page.getViewport({ scale });

    if (viewport.width > 8000 || viewport.height > 8000) {
      return {
        imageUrl: "",
        file: null,
        error: "PDF page is too large to render safely.",
      };
    }

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to get canvas 2D context.",
      };
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    try {
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to render PDF page to canvas.",
      };
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to generate PNG blob. Canvas size may be too large.",
            });
            return;
          }

          const name = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${name}.png`, {
            type: "image/png",
          });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: "Unexpected error converting PDF: " + err,
    };
  }
}
