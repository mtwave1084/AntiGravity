import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const genAI = new GoogleGenerativeAI(request.apiKey);

    const modelName = request.model === "nanobanana-pro"
        ? "gemini-3-pro-image-preview"
        : "gemini-2.5-flash-image";

    console.log(`[Nanobanana] Using model: ${modelName} (requested: ${request.model})`);

    const model = genAI.getGenerativeModel({ model: modelName });

    // Construct prompt (without aspect ratio and resolution - now in imageConfig)
    let fullPrompt = request.prompt;
    if (request.negativePrompt) fullPrompt += ` --no ${request.negativePrompt}`;
    if (request.seed) fullPrompt += ` --seed ${request.seed}`;

    console.log(`[Nanobanana] Full prompt: ${fullPrompt}`);
    console.log(`[Nanobanana] Image config - Resolution: ${request.outputResolution}, Aspect Ratio: ${request.aspectRatio}`);

    const parts: any[] = [{ text: fullPrompt }];

    if (request.inputImages) {
        for (const img of request.inputImages) {
            parts.push({
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
            // Build config object with imageConfig
            const config: any = {
                // @ts-ignore - responseModalities might not be in type definition
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

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig: config,
            });

            const response = await result.response;

            // Extract image from response
            if (response.candidates && response.candidates[0]) {
                const part = response.candidates[0].content.parts[0];
                if (part.inlineData) {
                    images.push({
                        index: i,
                        mimeType: part.inlineData.mimeType,
                        dataBase64: part.inlineData.data,
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
