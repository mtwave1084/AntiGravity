import { GoogleGenAI } from "@google/genai";

/**
 * Veo Video Generation API Wrapper
 * Supports Veo 3.1, 3.1 Fast, 3.0, 3.0 Fast, and Veo 2.0 models
 */

export type VeoModel =
    | "veo-3.1-generate-preview"      // Veo 3.1 (default) - 8秒, 720p/1080p/4K, 音声付き
    | "veo-3.1-fast-generate-preview" // Veo 3.1 Fast - 高速版
    | "veo-3.0-generate-001"          // Veo 3.0 - 音声付き
    | "veo-3.0-fast-generate-001"     // Veo 3.0 Fast
    | "veo-2.0-generate-001";         // Veo 2.0 - 音声なし

export type AspectRatio = "16:9" | "9:16";
export type Resolution = "720p" | "1080p" | "4k";
export type PersonGeneration = "allow_all" | "allow_adult" | "dont_allow";

export interface VeoJobRequest {
    apiKey: string;
    model: VeoModel;
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: AspectRatio;
    resolution?: Resolution;
    durationSeconds?: 4 | 5 | 6 | 8; // Veo 3.1: 4/6/8, Veo 2: 5/6/8
    personGeneration?: PersonGeneration;
    seed?: number;

    // Image inputs for image-to-video
    startFrame?: {
        mimeType: string;
        dataBase64: string;
    };
    endFrame?: {
        mimeType: string;
        dataBase64: string;
    };

    // Reference images (max 3) for style/content guidance
    referenceImages?: Array<{
        mimeType: string;
        dataBase64: string;
        referenceType?: "asset" | "style";
    }>;

    // Video extension - extend existing Veo-generated video
    videoToExtend?: {
        videoId: string; // Reference to previously generated video
    };
}

export interface VeoGeneratedVideo {
    mimeType: string;
    dataBase64: string;
    durationSeconds?: number;
}

export interface VeoJobResult {
    video?: VeoGeneratedVideo;
    operationName: string;
    success: boolean;
    error?: string;
}

/**
 * Generate video using Veo API
 * This is an async operation that requires polling
 */
export async function runVeoJob(
    request: VeoJobRequest,
): Promise<VeoJobResult> {
    // Mock mode for testing
    if (request.apiKey.startsWith("mock-")) {
        console.log("[Veo] Running in MOCK mode");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate longer delay for video

        return {
            video: {
                mimeType: "video/mp4",
                // Placeholder - in real mock would be actual video data
                dataBase64: "",
                durationSeconds: 8,
            },
            operationName: "mock-operation-id",
            success: true,
        };
    }

    const ai = new GoogleGenAI({ apiKey: request.apiKey });

    console.log(`[Veo] Using model: ${request.model}`);
    console.log(`[Veo] Prompt: ${request.prompt}`);
    console.log(`[Veo] Config - Aspect: ${request.aspectRatio}, Resolution: ${request.resolution}`);

    try {
        // Build the configuration
        const config: any = {};

        if (request.aspectRatio) {
            config.aspectRatio = request.aspectRatio;
        }
        if (request.resolution) {
            config.resolution = request.resolution;
        }
        if (request.durationSeconds) {
            config.durationSeconds = request.durationSeconds; // Send as number, not string
        }
        if (request.negativePrompt) {
            config.negativePrompt = request.negativePrompt;
        }
        if (request.personGeneration) {
            config.personGeneration = request.personGeneration;
        }
        if (request.seed !== undefined) {
            config.seed = request.seed;
        }

        // Build reference images if provided
        if (request.referenceImages && request.referenceImages.length > 0) {
            config.referenceImages = request.referenceImages.map(img => ({
                image: {
                    imageBytes: img.dataBase64,
                    mimeType: img.mimeType,
                },
                referenceType: img.referenceType || "asset",
            }));
        }

        // Prepare image input (start frame)
        let imageInput: any = undefined;
        if (request.startFrame) {
            imageInput = {
                imageBytes: request.startFrame.dataBase64,
                mimeType: request.startFrame.mimeType,
            };
        }

        // Prepare last frame if provided
        if (request.endFrame) {
            config.lastFrame = {
                image: {
                    imageBytes: request.endFrame.dataBase64,
                    mimeType: request.endFrame.mimeType,
                },
            };
        }

        console.log(`[Veo] Starting video generation...`);

        // Start the video generation operation
        let operation = await ai.models.generateVideos({
            model: request.model,
            prompt: request.prompt,
            image: imageInput,
            config: Object.keys(config).length > 0 ? config : undefined,
        });

        console.log(`[Veo] Operation started: ${operation.name}`);

        // Poll for completion
        const maxWaitMs = 6 * 60 * 1000; // 6 minutes max
        const pollIntervalMs = 10000; // 10 seconds
        const startTime = Date.now();

        while (!operation.done) {
            if (Date.now() - startTime > maxWaitMs) {
                throw new Error("Video generation timed out after 6 minutes");
            }

            console.log(`[Veo] Waiting for video generation... (${Math.round((Date.now() - startTime) / 1000)}s)`);
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        console.log(`[Veo] Video generation completed!`);

        // Debug: Log full operation structure
        console.log(`[Veo] Operation keys:`, Object.keys(operation));
        console.log(`[Veo] Operation.done:`, operation.done);
        console.log(`[Veo] Operation.response exists:`, !!operation.response);
        if (operation.response) {
            console.log(`[Veo] Response keys:`, Object.keys(operation.response));
        }

        // Check for API error
        if ((operation as any).error) {
            const error = (operation as any).error;
            console.error(`[Veo] Operation returned error:`, JSON.stringify(error, null, 2));
            const errorMessage = error.message || error.status || 'Unknown API error';
            return {
                operationName: operation.name || "",
                success: false,
                error: `動画生成エラー: ${errorMessage}`,
            };
        }

        // Check for RAI (safety) filter
        if (operation.response?.raiMediaFilteredReasons && operation.response.raiMediaFilteredReasons.length > 0) {
            const reasons = operation.response.raiMediaFilteredReasons;
            console.error(`[Veo] Content filtered by safety policy:`, reasons);
            return {
                operationName: operation.name || "",
                success: false,
                error: `安全フィルターによりブロックされました。プロンプトを変更してください。\n理由: ${reasons[0]}`,
            };
        }

        // Check if video is directly on operation (some models may differ)
        if ((operation as any).result) {
            console.log(`[Veo] Operation.result exists:`, Object.keys((operation as any).result));
        }

        // Extract the generated video
        // Check multiple possible locations for the video data
        let generatedVideos = operation.response?.generatedVideos;

        // Fallback: check if it's in operation.result (different SDK versions)
        if (!generatedVideos && (operation as any).result?.generatedVideos) {
            generatedVideos = (operation as any).result.generatedVideos;
        }

        if (generatedVideos && generatedVideos.length > 0) {
            const generatedVideo = generatedVideos[0];
            console.log(`[Veo] Generated video object keys:`, Object.keys(generatedVideo));

            // Get the video data
            const videoFile = generatedVideo.video;
            console.log(`[Veo] Video file object:`, videoFile ? Object.keys(videoFile) : 'null');

            if (videoFile) {
                console.log(`[Veo] Video mimeType:`, videoFile.mimeType);
                console.log(`[Veo] Video has videoBytes:`, !!(videoFile as any).videoBytes);
                console.log(`[Veo] Video has uri:`, !!(videoFile as any).uri);
                console.log(`[Veo] Video has name:`, !!(videoFile as any).name);

                // Try to get video bytes
                let videoData = (videoFile as any).videoBytes;

                // If videoBytes not available, download from URI with API key auth
                if (!videoData && (videoFile as any).uri) {
                    console.log(`[Veo] Downloading video from URI with auth...`);
                    const videoUri = (videoFile as any).uri as string;

                    try {
                        // Gemini API uses URL parameter for API key
                        const uriWithKey = videoUri.includes('?')
                            ? `${videoUri}&key=${request.apiKey}`
                            : `${videoUri}?key=${request.apiKey}`;

                        console.log(`[Veo] Fetching video...`);
                        const response = await fetch(uriWithKey);

                        if (response.ok) {
                            const arrayBuffer = await response.arrayBuffer();
                            videoData = Buffer.from(arrayBuffer).toString('base64');
                            console.log(`[Veo] Downloaded video successfully, size: ${videoData.length} chars`);
                        } else {
                            console.error(`[Veo] Download failed: ${response.status} ${response.statusText}`);

                            // Try alternative: header-based auth
                            console.log(`[Veo] Trying header-based auth...`);
                            const altResponse = await fetch(videoUri, {
                                headers: {
                                    'x-goog-api-key': request.apiKey,
                                    'Authorization': `Bearer ${request.apiKey}`
                                }
                            });

                            if (altResponse.ok) {
                                const arrayBuffer = await altResponse.arrayBuffer();
                                videoData = Buffer.from(arrayBuffer).toString('base64');
                                console.log(`[Veo] Header auth download success, size: ${videoData.length} chars`);
                            } else {
                                console.error(`[Veo] Header auth failed: ${altResponse.status}`);
                            }
                        }
                    } catch (downloadError) {
                        console.error(`[Veo] Download error:`, downloadError);
                    }
                }

                if (videoData) {
                    console.log(`[Veo] Returning video data, size: ${videoData.length}`);
                    return {
                        video: {
                            mimeType: videoFile.mimeType || "video/mp4",
                            dataBase64: videoData,
                            durationSeconds: 8,
                        },
                        operationName: operation.name || "",
                        success: true,
                    };
                } else {
                    console.error(`[Veo] No video data available after download attempts`);
                    console.error(`[Veo] VideoFile structure:`, JSON.stringify(videoFile, null, 2));
                }
            }
        } else {
            const responseStr = operation.response ? JSON.stringify(operation.response, null, 2) : 'undefined';
            console.error(`[Veo] No generatedVideos in response:`, responseStr.substring(0, 500));
        }

        return {
            operationName: operation.name || "",
            success: false,
            error: "No video generated in response",
        };

    } catch (error: any) {
        console.error("[Veo] Video generation error:", error);
        return {
            operationName: "",
            success: false,
            error: error.message || "Unknown error",
        };
    }
}

/**
 * Extend an existing Veo-generated video
 * The video must be from a previous Veo generation (within 2 days)
 */
export async function extendVeoVideo(
    request: VeoJobRequest & {
        existingVideoRef: any; // Reference from previous operation.response.generatedVideos[0].video
        extensionPrompt?: string;
    }
): Promise<VeoJobResult> {
    if (request.apiKey.startsWith("mock-")) {
        console.log("[Veo] Running extension in MOCK mode");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        return {
            video: {
                mimeType: "video/mp4",
                dataBase64: "",
                durationSeconds: 15, // Extended duration
            },
            operationName: "mock-extension-operation",
            success: true,
        };
    }

    const ai = new GoogleGenAI({ apiKey: request.apiKey });

    console.log(`[Veo] Extending video with prompt: ${request.extensionPrompt || request.prompt}`);

    try {
        // Start extension operation
        let operation = await ai.models.generateVideos({
            model: request.model,
            prompt: request.extensionPrompt || request.prompt,
            video: request.existingVideoRef, // Reference to existing video
        });

        console.log(`[Veo] Extension operation started: ${operation.name}`);

        // Poll for completion
        const maxWaitMs = 6 * 60 * 1000;
        const pollIntervalMs = 10000;
        const startTime = Date.now();

        while (!operation.done) {
            if (Date.now() - startTime > maxWaitMs) {
                throw new Error("Video extension timed out");
            }

            console.log(`[Veo] Waiting for video extension... (${Math.round((Date.now() - startTime) / 1000)}s)`);
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        if (operation.response?.generatedVideos && operation.response.generatedVideos.length > 0) {
            const generatedVideo = operation.response.generatedVideos[0];
            const videoFile = generatedVideo.video;

            if (videoFile) {
                return {
                    video: {
                        mimeType: videoFile.mimeType || "video/mp4",
                        dataBase64: (videoFile as any).videoBytes || "",
                    },
                    operationName: operation.name || "",
                    success: true,
                };
            }
        }

        return {
            operationName: operation.name || "",
            success: false,
            error: "No extended video in response",
        };

    } catch (error: any) {
        console.error("[Veo] Video extension error:", error);
        return {
            operationName: "",
            success: false,
            error: error.message || "Unknown error",
        };
    }
}
