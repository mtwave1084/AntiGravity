/**
 * Final Renderer
 * 高精細最終描画モジュール
 */

import { GoogleGenAI } from "@google/genai";
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
        const ai = new GoogleGenAI({ apiKey });

        const prompt = buildFinalRenderPrompt(config);
        console.log('[DiagramAgent] Generating final render with prompt:', prompt.substring(0, 200) + '...');

        // Build contents array
        const contents: any[] = [{ text: prompt }];

        // Add wireframe as primary reference (FIRST, so the model follows its layout)
        if (config.wireframeImage) {
            contents.push({
                inlineData: {
                    mimeType: config.wireframeImage.mimeType,
                    data: config.wireframeImage.dataBase64,
                },
            });
        }

        // Add reference images if provided
        if (config.referenceImages && config.referenceImages.length > 0) {
            for (const img of config.referenceImages) {
                contents.push({
                    inlineData: {
                        mimeType: img.mimeType,
                        data: img.dataBase64,
                    },
                });
            }
        }

        // Generate with high resolution for final render
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: contents,
            config: {
                responseModalities: ["IMAGE"],
                imageConfig: {
                    aspectRatio: config.aspectRatio || "16:9",
                    imageSize: (config.outputResolution || "4K").toUpperCase(),
                },
            },
        });

        console.log('[DiagramAgent] Final render response received');

        if (response.candidates && response.candidates[0]) {
            const parts = response.candidates[0].content?.parts;
            if (parts && parts[0] && parts[0].inlineData) {
                return {
                    success: true,
                    mimeType: parts[0].inlineData.mimeType,
                    dataBase64: parts[0].inlineData.data,
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
