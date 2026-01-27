import { GoogleGenAI } from "@google/genai";

export type NanoModel = "nanobanana" | "nanobanana-pro";

export type ImageTaskType =
    | "text-to-image"
    | "image-to-image"
    | "multi-image-blend"
    | "character-sheet"
    | "character-variation"
    | "comic-layout";

export interface NanoImageJobRequest {
    apiKey: string;
    model: NanoModel;
    taskType: ImageTaskType;

    prompt: string;
    negativePrompt?: string;

    aspectRatio?: string; // e.g. "1:1", "3:4"
    outputResolution?: string; // "1k", "2k", "4k"
    numOutputs?: number;
    seed?: number;

    inputImages?: Array<{
        mimeType: string;
        dataBase64: string;
        role?: "base" | "style" | "reference" | "mask";
    }>;

    rawConfig?: Record<string, unknown>;
}

export interface NanoGeneratedImage {
    index: number;
    mimeType: string;
    dataBase64: string;
}

export interface NanoImageJobResult {
    images: NanoGeneratedImage[];
    rawResponse: unknown;
}

export async function runNanoImageJob(
    request: NanoImageJobRequest,
): Promise<NanoImageJobResult> {
    // Mock mode for testing without burning credits or if models are unavailable
    if (request.apiKey.startsWith("mock-")) {
        console.log("Running in MOCK mode");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

        const mockImages: NanoGeneratedImage[] = Array.from({ length: request.numOutputs || 1 }).map((_, i) => ({
            index: i,
            mimeType: "image/png",
            // A simple 1x1 transparent pixel or similar placeholder
            dataBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        }));

        return {
            images: mockImages,
            rawResponse: { mock: true },
        };
    }

    // Initialize new @google/genai SDK
    const ai = new GoogleGenAI({ apiKey: request.apiKey });

    const modelName = request.model === "nanobanana-pro"
        ? "gemini-3-pro-image-preview"
        : "gemini-2.5-flash-image";

    console.log(`[Nanobanana] Using model: ${modelName} (requested: ${request.model})`);

    // Construct prompt (without aspect ratio and resolution - now in config)
    let fullPrompt = request.prompt;
    if (request.negativePrompt) fullPrompt += ` --no ${request.negativePrompt}`;
    if (request.seed) fullPrompt += ` --seed ${request.seed}`;

    console.log(`[Nanobanana] Full prompt: ${fullPrompt}`);
    console.log(`[Nanobanana] Image config - Resolution: ${request.outputResolution}, Aspect Ratio: ${request.aspectRatio}`);

    // Build contents array with text and optional images
    const contents: any[] = [{ text: fullPrompt }];

    if (request.inputImages) {
        for (const img of request.inputImages) {
            contents.push({
                inlineData: {
                    mimeType: img.mimeType,
                    data: img.dataBase64
                }
            });
        }
    }

    try {
        // Note: Gemini image models currently only support single image generation
        // We'll need to call the API multiple times if numOutputs > 1
        const numImages = request.numOutputs || 1;
        const images: NanoGeneratedImage[] = [];

        for (let i = 0; i < numImages; i++) {
            // Build config object
            const config: any = {
                responseModalities: ["IMAGE"],
            };

            // Add imageConfig ONLY for nanobanana-pro (gemini-3-pro-image-preview)
            // gemini-2.5-flash-image does NOT support imageConfig parameters
            if (request.model === "nanobanana-pro" && (request.outputResolution || request.aspectRatio)) {
                config.imageConfig = {};
                if (request.aspectRatio) {
                    config.imageConfig.aspectRatio = request.aspectRatio;
                }
                if (request.outputResolution) {
                    config.imageConfig.imageSize = request.outputResolution.toUpperCase();
                }
            }

            console.log(`[Nanobanana] Request #${i + 1} config:`, JSON.stringify(config, null, 2));

            // Use new SDK's generateContent method
            const response = await ai.models.generateContent({
                model: modelName,
                contents: contents,
                config: config,
            });

            // Extract image from response using new SDK structure
            if (response.candidates && response.candidates[0]) {
                const parts = response.candidates[0].content?.parts;
                if (parts && parts[0] && parts[0].inlineData) {
                    images.push({
                        index: i,
                        mimeType: parts[0].inlineData.mimeType || "image/png",
                        dataBase64: parts[0].inlineData.data || "",
                    });
                }
            }
        }

        return {
            images,
            rawResponse: { message: `Generated ${images.length} image(s)` },
        };
    } catch (error) {
        console.error("Nanobanana generation error:", error);
        throw error;
    }
}
