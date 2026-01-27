/**
 * Diagram Agent Type Definitions
 * 図解生成エージェントの型定義
 */

// ============================================
// 8つの図解構造
// ============================================
export type DiagramStructure =
    | 'comparison'      // 比較: A vs B
    | 'timeline'        // タイムライン: 時系列フロー
    | 'hierarchy'       // 階層: ツリー構造
    | 'process_flow'    // プロセス: ステップバイステップ
    | 'cycle'           // サイクル: 循環プロセス
    | 'pyramid'         // ピラミッド: レベル階層
    | 'mindmap'         // マインドマップ: 中心から放射
    | 'guide_chart';    // ガイドチャート: セクション分割

export const DIAGRAM_STRUCTURES: Record<DiagramStructure, {
    label: string;
    description: string;
    recommendedBlocks: number;
    icon: string;
}> = {
    comparison: {
        label: '比較図',
        description: 'A vs B の並列比較',
        recommendedBlocks: 2,
        icon: '⚖️',
    },
    timeline: {
        label: 'タイムライン',
        description: '時系列フロー',
        recommendedBlocks: 4,
        icon: '📅',
    },
    hierarchy: {
        label: '階層図',
        description: 'ツリー構造',
        recommendedBlocks: 4,
        icon: '🌳',
    },
    process_flow: {
        label: 'プロセス図',
        description: 'ステップバイステップ',
        recommendedBlocks: 5,
        icon: '➡️',
    },
    cycle: {
        label: 'サイクル図',
        description: '循環プロセス',
        recommendedBlocks: 4,
        icon: '🔄',
    },
    pyramid: {
        label: 'ピラミッド',
        description: 'レベル階層',
        recommendedBlocks: 3,
        icon: '🔺',
    },
    mindmap: {
        label: 'マインドマップ',
        description: '中心から放射',
        recommendedBlocks: 5,
        icon: '🧠',
    },
    guide_chart: {
        label: 'ガイドチャート',
        description: 'セクション分割',
        recommendedBlocks: 6,
        icon: '📊',
    },
};

// ============================================
// 13種類のデザインスタイル
// ============================================
export type DiagramStyle =
    | 'corporate'       // ビジネス向けクリーン
    | 'playful'         // ポップ＆カラフル
    | 'minimal'         // ミニマリスト
    | 'sketch'          // 手書き風
    | 'neon'            // サイバーパンク
    | 'retro'           // レトロ・ヴィンテージ
    | 'gradient'        // グラデーション
    | 'isometric'       // アイソメトリック3D
    | 'flat'            // フラットデザイン
    | 'glassmorphism'   // ガラス効果
    | 'neumorphism'     // ニューモーフィズム
    | 'watercolor'      // 水彩風
    | 'anime';          // アニメ調

export const DIAGRAM_STYLES: Record<DiagramStyle, {
    label: string;
    description: string;
    promptHint: string;
}> = {
    corporate: {
        label: 'コーポレート',
        description: 'ビジネス向けクリーンデザイン',
        promptHint: 'clean corporate business style, professional, blue and white color scheme, modern minimalist',
    },
    playful: {
        label: 'ポップ',
        description: 'カラフルで楽しいデザイン',
        promptHint: 'playful colorful pop art style, bright vibrant colors, fun cartoon-like, rounded shapes',
    },
    minimal: {
        label: 'ミニマル',
        description: 'シンプルで洗練されたデザイン',
        promptHint: 'minimal clean design, lots of white space, simple lines, monochrome or limited colors',
    },
    sketch: {
        label: '手書き風',
        description: 'ラフスケッチ調',
        promptHint: 'hand-drawn sketch style, rough pencil lines, notebook paper texture, casual doodle',
    },
    neon: {
        label: 'ネオン',
        description: 'サイバーパンク調',
        promptHint: 'neon cyberpunk style, glowing lines, dark background, pink and cyan colors, futuristic',
    },
    retro: {
        label: 'レトロ',
        description: 'ヴィンテージ調',
        promptHint: 'retro vintage style, muted earthy colors, 1970s aesthetic, grainy texture',
    },
    gradient: {
        label: 'グラデーション',
        description: '美しいグラデーション',
        promptHint: 'beautiful gradient colors, smooth color transitions, modern trendy, soft pastel gradients',
    },
    isometric: {
        label: 'アイソメトリック',
        description: '立体的3D表現',
        promptHint: 'isometric 3D style, geometric shapes, depth and perspective, modern infographic',
    },
    flat: {
        label: 'フラット',
        description: 'フラットデザイン',
        promptHint: 'flat design style, solid colors, no shadows, geometric shapes, modern UI style',
    },
    glassmorphism: {
        label: 'グラスモーフィズム',
        description: 'ガラス効果',
        promptHint: 'glassmorphism style, frosted glass effect, transparent elements, blur background, modern',
    },
    neumorphism: {
        label: 'ニューモーフィズム',
        description: '柔らかい立体感',
        promptHint: 'neumorphism soft UI style, subtle shadows, extruded shapes, light background, soft 3D',
    },
    watercolor: {
        label: '水彩風',
        description: '水彩画調',
        promptHint: 'watercolor painting style, soft edges, artistic brushstrokes, gentle pastel colors',
    },
    anime: {
        label: 'アニメ調',
        description: 'アニメ・イラスト調',
        promptHint: 'anime illustration style, bold outlines, vibrant colors, Japanese manga aesthetic',
    },
};

// ============================================
// コンテンツブロック
// ============================================
export type BlockType = 'header' | 'content' | 'footer';

export interface DiagramBlock {
    id: string;
    type: BlockType;
    heading?: string;       // ブロック見出し
    content: string;        // 本文テキスト
    visualHint?: string;    // 視覚イメージの指示
}

// ============================================
// 図解生成設定
// ============================================
export interface DiagramConfig {
    title?: string;
    structure: DiagramStructure;
    style: DiagramStyle;
    blocks: DiagramBlock[];
    aspectRatio?: string;
    outputResolution?: string;
    referenceImages?: Array<{
        mimeType: string;
        dataBase64: string;
    }>;
    wireframeImage?: {
        mimeType: string;
        dataBase64: string;
    };
    revisionInstruction?: string;
}

// ============================================
// 生成結果
// ============================================
export interface DiagramGenerationResult {
    success: boolean;
    diagramJobId?: string;
    imageId?: string;
    error?: string;
}

export interface DiagramJob {
    id: string;
    userId: string;
    structureType: DiagramStructure;
    styleType: DiagramStyle;
    title?: string;
    blocks: string; // JSON stringified DiagramBlock[]
    wireframeImageId?: string;
    finalImageId?: string;
    status: 'pending' | 'wireframe' | 'completed' | 'error';
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}
