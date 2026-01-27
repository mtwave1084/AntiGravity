/**
 * Wireframe Generator
 * ワイヤーフレーム生成モジュール
 */

import { GoogleGenAI } from "@google/genai";
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
        const ai = new GoogleGenAI({ apiKey });

        const prompt = buildWireframePrompt(config);
        console.log('[DiagramAgent] Generating wireframe with prompt:', prompt.substring(0, 200) + '...');

        // Build contents array
        const contents: any[] = [{ text: prompt }];

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

        // Generate with lower resolution for wireframe (quick preview)
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: contents,
            config: {
                responseModalities: ["IMAGE"],
            },
        });

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
