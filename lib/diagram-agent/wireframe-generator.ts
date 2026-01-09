/**
 * Wireframe Generator
 * ワイヤーフレーム生成モジュール
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DiagramConfig } from './types';
import { buildWireframePrompt } from './prompt-builder';

export interface WireframeResult {
    success: boolean;
    mimeType?: string;
    dataBase64?: string;
    error?: string;
}

/**
 * ワイヤーフレーム画像を生成
 */
export async function generateWireframe(
    apiKey: string,
    config: DiagramConfig
): Promise<WireframeResult> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        const prompt = buildWireframePrompt(config);
        console.log('[DiagramAgent] Generating wireframe with prompt:', prompt.substring(0, 200) + '...');

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

        // Generate with lower resolution for wireframe (quick preview)
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig: {
                // @ts-ignore
                responseModalities: ["IMAGE"],
            },
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
            error: 'No image generated from wireframe request',
        };

    } catch (error: any) {
        console.error('[DiagramAgent] Wireframe generation error:', error);
        return {
            success: false,
            error: error.message || 'Wireframe generation failed',
        };
    }
}
