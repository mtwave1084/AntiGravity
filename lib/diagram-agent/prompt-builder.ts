/**
 * Prompt Builder for Diagram Generation
 * 図解生成用プロンプトビルダー
 */

import {
    DiagramConfig,
    DiagramBlock,
    DIAGRAM_STRUCTURES,
    DIAGRAM_STYLES,
} from './types';

/**
 * 構造に応じたレイアウト指示を生成
 */
function getStructurePrompt(structure: DiagramConfig['structure']): string {
    const structurePrompts: Record<typeof structure, string> = {
        comparison: 'Create a side-by-side comparison layout with two distinct sections, clearly showing the differences and similarities between two items.',
        timeline: 'Create a horizontal or vertical timeline layout showing progression of events or steps in chronological order with clear date/step markers.',
        hierarchy: 'Create a tree diagram showing hierarchical relationships, with parent nodes branching into child nodes, showing organizational structure.',
        process_flow: 'Create a flowchart showing step-by-step process with arrows connecting each step, showing clear progression from start to finish.',
        cycle: 'Create a circular diagram showing cyclical process, with elements arranged in a loop showing continuous flow.',
        pyramid: 'Create a pyramid or triangle diagram with layers, showing hierarchy from broad base to narrow top.',
        mindmap: 'Create a mind map with central concept and branches radiating outward, showing connected ideas and sub-topics.',
        guide_chart: 'Create an infographic with multiple sections or cards, organized in a grid or vertical layout, like a cheat sheet or guide.',
    };

    return structurePrompts[structure];
}

/**
 * ブロックをプロンプトテキストに変換
 */
function blocksToPromptText(blocks: DiagramBlock[]): string {
    return blocks.map((block, index) => {
        const parts: string[] = [];

        if (block.heading) {
            parts.push(`Section ${index + 1} Title: "${block.heading}"`);
        }

        parts.push(`Content: "${block.content}"`);

        if (block.visualHint) {
            parts.push(`Visual suggestion: ${block.visualHint}`);
        }

        return parts.join('\n');
    }).join('\n\n');
}

/**
 * ワイヤーフレーム用プロンプトを生成
 */
export function buildWireframePrompt(config: DiagramConfig): string {
    const structureInfo = DIAGRAM_STRUCTURES[config.structure];
    const styleInfo = DIAGRAM_STYLES[config.style];

    const hasReferenceImages = config.referenceImages && config.referenceImages.length > 0;
    const hasRevision = config.revisionInstruction && config.revisionInstruction.trim() !== '';
    const hasCurrentWireframe = config.wireframeImage !== undefined;

    let prompt = `You are a skilled infographic designer. Create a clean wireframe/sketch for an infographic.

**DIAGRAM TYPE:** ${structureInfo.label} (${structureInfo.description})
**LAYOUT INSTRUCTION:** ${getStructurePrompt(config.structure)}

**TITLE:** ${config.title || 'Untitled Infographic'}

**CONTENT BLOCKS:**
${blocksToPromptText(config.blocks)}

**STYLE HINT:** ${styleInfo.promptHint}

**REQUIREMENTS:**
- Create a BLACK AND WHITE wireframe sketch ONLY
- Use ONLY grayscale colors (black, white, and shades of gray)
- NO colors, NO gradients - pure monochrome wireframe
- All text labels MUST be in Japanese (日本語)
- Show placeholder boxes and layout structure
- Keep it simple and clean for preview purposes
- Focus on layout and structure, not final polish
${hasReferenceImages ? `
**CHARACTER INTEGRATION:**
- If the reference images contain character(s), INCLUDE THEM in the wireframe
- The character should appear as a guide/presenter explaining the infographic
- Draw the character in a simple sketch style matching the wireframe aesthetic
- Position the character naturally within the layout (e.g., pointing at sections, presenting info)
` : ''}`;

    if (hasRevision && hasCurrentWireframe) {
        prompt += `
**REVISION REQUEST:**
The first image is the current wireframe that needs to be modified.
Please apply the following changes while maintaining the overall structure:
"${config.revisionInstruction}"
`;
    }

    return prompt;
}

/**
 * 最終描画用プロンプトを生成
 */
export function buildFinalRenderPrompt(config: DiagramConfig): string {
    const structureInfo = DIAGRAM_STRUCTURES[config.structure];
    const styleInfo = DIAGRAM_STYLES[config.style];

    const hasWireframe = config.wireframeImage !== undefined;
    const hasReferenceImages = config.referenceImages && config.referenceImages.length > 0;
    const hasRevision = config.revisionInstruction && config.revisionInstruction.trim() !== '';

    let prompt = `You are a highly skilled infographic designer. Create a beautiful, polished, high-quality infographic.
${hasWireframe ? `
**WIREFRAME REFERENCE:**
The FIRST image provided is the wireframe/layout sketch.
You MUST follow this EXACT layout structure and add colors/polish to it.
Do NOT create a completely different layout - colorize and enhance the existing wireframe design.
Maintain the same positioning of all elements shown in the wireframe.
` : ''}
**DIAGRAM TYPE:** ${structureInfo.label} (${structureInfo.description})
**LAYOUT INSTRUCTION:** ${getStructurePrompt(config.structure)}

**TITLE:** ${config.title || 'Untitled Infographic'}

**CONTENT BLOCKS:**
${blocksToPromptText(config.blocks)}

**VISUAL STYLE:** ${styleInfo.label}
${styleInfo.promptHint}

**REQUIREMENTS:**
- Create a visually stunning, professional infographic
- All text labels and content MUST be written in Japanese (日本語で記述)
- Use high contrast for readability
- Apply the specified visual style consistently
- Make it suitable for social media sharing (clear, eye-catching)
- Ensure proper visual hierarchy and flow
- Use icons and visual elements to enhance understanding
${hasReferenceImages ? `
**CHARACTER INTEGRATION:**
- The reference images contain character(s) that MUST appear in the final infographic
- The character should act as a guide/presenter explaining the infographic content
- Maintain the character's EXACT appearance from the reference images
- Position the character naturally (e.g., pointing at sections, presenting information)
- The character should blend seamlessly with the infographic style
` : ''}
**QUALITY:**
- High resolution, sharp details
- Professional typography
- Balanced composition
- Vibrant but harmonious colors`;

    if (hasRevision) {
        prompt += `

**REVISION REQUEST:**
Please apply the following changes to the current design:
"${config.revisionInstruction}"
Maintain the overall layout and style while applying these modifications.`;
    }

    return prompt;
}
