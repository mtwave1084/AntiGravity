/**
 * Final Renderer
 * 高精細最終描画モジュール
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DiagramConfig } from './types';
import { buildFinalRenderPrompt } from './prompt-builder';

export interface FinalRenderResult {
    success: boolean;
    mimeType?: string;
    dataBase64?: string;
    error?: string;
}

/**
 * 最終的な高品質図解画像を生成
 */
export async function generateFinalRender(
    apiKey: string,
    config: DiagramConfig
): Promise<FinalRenderResult> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        const prompt = buildFinalRenderPrompt(config);
        console.log('[DiagramAgent] Generating final render with prompt:', prompt.substring(0, 200) + '...');

        // Build parts array
        const parts: any[] = [{ text: prompt }];

        // Add reference images if provided
        if (config.referenceImages && config.referenceImages.length > 0) {
            for (const img of config.referenceImages) {
                parts.push({
                    inlineData: {
                        mimeType: img.mimeType,
                        data: img.dataBase64,
                    },
                });
            }
        }

        // Generate with high resolution for final render
        const generationConfig: any = {
            responseModalities: ["IMAGE"],
            imageConfig: {
                aspectRatio: config.aspectRatio || "16:9",
                imageSize: (config.outputResolution || "4K").toUpperCase(),
            },
        };

        console.log('[DiagramAgent] Final render config:', JSON.stringify(generationConfig, null, 2));

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
        });

        const response = await result.response;

        if (response.candidates && response.candidates[0]) {
            const part = response.candidates[0].content.parts[0];
            if (part.inlineData) {
                return {
                    success: true,
                    mimeType: part.inlineData.mimeType,
                    dataBase64: part.inlineData.data,
                };
            }
        }

        return {
            success: false,
            error: 'No image generated from final render request',
        };

    } catch (error: any) {
        console.error('[DiagramAgent] Final render error:', error);
        return {
            success: false,
            error: error.message || 'Final render generation failed',
        };
    }
}
