import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
interface CanvasBlock {
    id: string;
    toolType: string;
    htmlCode: string;
    label: string;
}

interface ToolItem {
    id: string;
    name: string;
    cost: number;
    previewHtml: string;
}

interface ProjectData {
    id: string;
    name: string;
    currentCode: string;
    credits: number;
}

// ─── COMPONENT TEMPLATE PREVIEWS ─────────────────────────────────────────────
const COMPONENT_PREVIEWS: Record<string, { label: string; html: string }> = {
    'container-div': {
        label: 'Container Section',
        html: `<div class="max-w-7xl mx-auto p-8 my-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-white"><p class="text-gray-300">Container Section wrapper element. Drag structural components inside.</p></div>`
    },
    'flex-box': {
        label: 'Flex Row Workspace',
        html: `<div class="flex flex-col md:flex-row items-center justify-between p-6 my-4 gap-6 backdrop-blur-md bg-black/20 border border-white/10 rounded-xl text-white"><div><h4 class="font-bold text-lg">Flex Left Pillar</h4><p class="text-sm text-gray-400">Content node description</p></div><div><button class="px-5 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all">Action</button></div></div>`
    },
    'grid-layout': {
        label: 'Grid Multi-Column',
        html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-white"><div class="p-6 backdrop-blur-md bg-white/5 rounded-xl border border-white/10"><h4 class="font-semibold mb-2">Grid Cell 1</h4><p class="text-sm text-gray-400">Modular sub-element</p></div><div class="p-6 backdrop-blur-md bg-white/5 rounded-xl border border-white/10"><h4 class="font-semibold mb-2">Grid Cell 2</h4><p class="text-sm text-gray-400">Modular sub-element</p></div><div class="p-6 backdrop-blur-md bg-white/5 rounded-xl border border-white/10"><h4 class="font-semibold mb-2">Grid Cell 3</h4><p class="text-sm text-gray-400">Modular sub-element</p></div></div>`
    },
    'typography-text': {
        label: 'Display Typography',
        html: `<div class="my-4"><h1 class="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-linear-to-r from-white via-gray-200 to-gray-500">Design Future Realities</h1><p class="mt-2 text-lg text-gray-400 max-w-2xl">Refined architectural layouts driven by layout modular engines.</p></div>`
    },
    'image-holder': {
        label: 'Media Showcase',
        html: `<div class="relative w-full h-64 my-6 rounded-2xl overflow-hidden border border-white/20 bg-gray-900/60 flex items-center justify-center group"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" loading="lazy" width="1200" height="800" /><div class="relative z-10 text-center"><span class="text-xs uppercase tracking-widest text-purple-300 font-semibold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">CDN Production Asset</span></div></div>`
    },
    'action-button': {
        label: 'Interactive Button',
        html: `<div class="my-4"><button class="px-8 py-3 rounded-xl font-medium tracking-wide text-white bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 hover:border-white/40 shadow-xl shadow-black/20 transition-all duration-300 transform hover:-translate-y-0.5">Execute Application</button></div>`
    },
    'navigation-bar': {
        label: 'Header Navigation',
        html: `<nav class="w-full flex items-center justify-between p-4 my-2 backdrop-blur-xl bg-black/40 border border-white/15 rounded-2xl text-white"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span class="font-bold tracking-wider text-sm uppercase">NEXUS.AI</span></div><div class="hidden md:flex gap-6 text-xs tracking-wide text-gray-400 uppercase font-medium"><span class="hover:text-white cursor-pointer transition-colors">Workspace</span><span class="hover:text-white cursor-pointer transition-colors">Engine</span><span class="hover:text-white cursor-pointer transition-colors">Docs</span></div><button class="px-4 py-1.5 rounded-lg text-xs bg-white text-black font-semibold shadow-md">Connect</button></nav>`
    },
    'footer-block': {
        label: 'Global System Footer',
        html: `<footer class="w-full mt-12 p-8 text-center text-xs border-t border-white/15 backdrop-blur-md bg-black/30 rounded-2xl text-gray-400"><div class="flex flex-col md:flex-row items-center justify-between gap-4"><p>© 2026 Nexus System Engine. Autonomous Workspace Matrix.</p><div class="flex gap-4 text-gray-400"><span class="hover:text-white cursor-pointer">Security</span><span class="hover:text-white cursor-pointer">Protocol</span></div></div></footer>`
    },
    'multipage-layout': {
        label: 'Split Navigation Hub',
        html: `<div class="flex min-h-87.5 my-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden text-white"><aside class="w-1/4 bg-black/40 p-6 border-r border-white/10 hidden md:block"><div class="space-y-3"><div class="h-2 w-16 bg-white/20 rounded"></div><div class="h-2 w-24 bg-white/10 rounded"></div><div class="h-2 w-20 bg-white/10 rounded"></div></div></aside><main class="flex-1 p-8 bg-black/10"><h3 class="text-xl font-bold mb-2">Workspace Display Section</h3><p class="text-sm text-gray-400">Multi-page layout system initialized inside runtime environment.</p></main></div>`
    },
    'premium-gallery-grid': {
        label: 'Premium Mosaic Matrix',
        html: `<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6"><div class="aspect-square bg-cover bg-center rounded-xl border border-white/10 shadow-lg transform hover:scale-[1.02] transition-all" style="background-image: url('https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=400')"></div><div class="aspect-square bg-cover bg-center rounded-xl border border-white/10 shadow-lg transform hover:scale-[1.02] transition-all" style="background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400')"></div><div class="aspect-square bg-cover bg-center rounded-xl border border-white/10 shadow-lg transform hover:scale-[1.02] transition-all" style="background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400')"></div><div class="aspect-square bg-cover bg-center rounded-xl border border-white/10 shadow-lg transform hover:scale-[1.02] transition-all" style="background-image: url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400')"></div></div>`
    },
    'glassmorphism-hero-section': {
        label: 'Glassmorphism Premium Hero',
        html: `<section class="relative p-16 my-8 text-center rounded-3xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl overflow-hidden text-white"><div class="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]"></div><div class="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]"></div><div class="relative z-10"><span class="text-xs font-bold tracking-widest text-indigo-300 uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">System Core Engine</span><h1 class="text-5xl md:text-7xl font-black tracking-tight mt-6 mb-4 bg-linear-to-b from-white to-gray-300 bg-clip-text text-transparent">Liquid Interfaces</h1><p class="text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">Experience a workspace environment constructed using glassmorphism components and dynamic layout modules.</p></div></section>`
    },
    'interactive-contact-form': {
        label: 'Interactive User Desk',
        html: `<form class="p-8 my-6 space-y-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl text-white"><h3 class="text-xl font-bold tracking-wide">Secure Messaging Stream</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Identity Name" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-colors text-sm" /><input type="email" placeholder="Communication Node" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-colors text-sm" /></div><textarea placeholder="Transmission payload specifications..." rows="4" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-colors text-sm"></textarea><button type="button" class="w-full py-3.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold tracking-wide text-sm transition-all shadow-lg shadow-purple-900/20">Broadcast Payload</button></form>`
    },
    'iframe-youtube': {
        label: 'YouTube Embed Port',
        html: `<div class="relative w-full aspect-video my-6 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/50"><iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>`
    },
    'iframe-custom': {
        label: 'Custom Iframe Window',
        html: `<div class="relative w-full h-96 my-6 rounded-2xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl"><iframe class="w-full h-full border-none" src="https://maps.google.com/maps?output=embed"></iframe></div>`
    },
    'custom-link-button': {
        label: 'Gradient Navigation Node',
        html: `<div class="my-4"><button class="px-8 py-3.5 rounded-xl font-bold tracking-wide text-white bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-2xl shadow-purple-500/10 transition-all transform hover:-translate-y-0.5">Explore Space</button></div>`
    },
    'dynamic-form-page': {
        label: 'Dynamic Registration Card',
        html: `<div class="max-w-md mx-auto p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/15 shadow-2xl text-white"><h3 class="text-2xl font-bold text-center mb-2">Initialize Account</h3><p class="text-xs text-gray-400 text-center mb-6">Authenticate tracking metrics node connection</p><div class="space-y-4"><input type="text" placeholder="Username Handle" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white" /><input type="password" placeholder="Passphrase Matrix" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white" /><button type="button" class="w-full py-3 rounded-xl bg-white text-black font-bold text-sm tracking-wide shadow-lg hover:bg-gray-100 transition-colors">Establish Initialization</button></div></div>`
    }
};

// ─── UTILITY HELPERS ─────────────────────────────────────────────────────────
const compileBlocksToHtmlString = (canvasBlocks: CanvasBlock[]): string => {
    const structuralBody = canvasBlocks.map(block => `
        ${block.htmlCode}
        `).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Matrix Workspace</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #030712;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
    </style>
</head>
<body class="bg-gray-950 text-gray-100 antialiased p-4 md:p-12 space-y-4">
    ${structuralBody}
</body>
</html>`;
};

const parseHtmlStringToBlocks = (html: string): CanvasBlock[] => {
    if (!html || html.trim() === "") return [];
    
    const blockList: CanvasBlock[] = [];
    const blockRegex = /([\s\S]*?)/g;
    let match;

    while ((match = blockRegex.exec(html)) !== null) {
        const id = match[1];
        const toolType = match[2];
        const htmlCode = match[3].trim();
        const config = COMPONENT_PREVIEWS[toolType];
        
        blockList.push({
            id,
            toolType,
            htmlCode,
            label: config ? config.label : 'Layout Element'
        });
    }

    if (blockList.length === 0 && html.includes('<body')) {
        const bodyContentMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
        const codeExtract = bodyContentMatch ? bodyContentMatch[1].trim() : html.trim();
        if (codeExtract) {
            blockList.push({
                id: 'legacy-root',
                toolType: 'container-div',
                htmlCode: codeExtract,
                label: 'Imported Base Code Layout'
            });
        }
    }

    return blockList;
};

// ─── MAIN EDITOR COMPONENT ───────────────────────────────────────────────────
export const EditorPage: React.FC = () => {
    const { projectId = "" } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [freeTools, setFreeTools] = useState<string[]>([]);
    const [paidTools, setPaidTools] = useState<Record<string, number>>({});
    const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
    const [project, setProject] = useState<ProjectData | null>(null);
    const [activeTab, setActiveTab] = useState<'canvas' | 'preview'>('canvas');
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [syncing, setSyncing] = useState<boolean>(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Initial Loading Loop
    useEffect(() => {
        const fetchConfigurationData = async () => {
            try {
                // Fetch editing components matrix catalog config
                const toolsRes = await fetch("/api/editing/tools");
                const toolsData = await toolsRes.json();
                setFreeTools(toolsData.freeTools || []);
                setPaidTools(toolsData.paidTools || {});

                // Fetch Project Code and Data using preview router configuration path
                const projectRes = await fetch(`/api/project/preview/${projectId}`);
                const projectData = await projectRes.json();

                if (projectRes.ok && projectData.project) {
                    setProject({
                        id: projectData.project.id,
                        name: projectData.project.name,
                        currentCode: projectData.project.current_code || "",
                        credits: projectData.project.user?.credits ?? 0
                    });

                    const structuredBlocks = parseHtmlStringToBlocks(projectData.project.current_code || "");
                    setBlocks(structuredBlocks);
                }
            } catch (err) {
                console.error("System structural initialization failed: ", err);
            }
        };

        fetchConfigurationData();
    }, [projectId]);

    // Live update loop inside iframe node window
    useEffect(() => {
        if (activeTab === 'preview' && iframeRef.current) {
            const documentString = compileBlocksToHtmlString(blocks);
            const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(documentString);
                iframeDoc.close();
            }
        }
    }, [blocks, activeTab]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tool: ToolItem) => {
        e.dataTransfer.setData("application/json", JSON.stringify(tool));
    };

    const handleBlockDrop = async (index: number, toolType: string, htmlCode: string) => {
        const config = COMPONENT_PREVIEWS[toolType];
        const newBlock: CanvasBlock = {
            id: Math.random().toString(36).substring(2, 9),
            toolType,
            htmlCode,
            label: config ? config.label : 'Layout Element'
        };

        const reordered = [...blocks];
        reordered.splice(index, 0, newBlock);

        const absoluteHtmlString = compileBlocksToHtmlString(reordered);
        setSyncing(true);

        try {
            const response = await fetch(`/api/editing/apply/${projectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toolName: toolType,
                    updatedCode: absoluteHtmlString,
                    pageId: "index"
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                setBlocks(reordered);
                if (project) {
                    setProject({ ...project, credits: responseData.remainingCredits });
                }
            } else {
                alert(responseData.error || "Execution server rejected configuration adjustment asset node allocation.");
            }
        } catch (err) {
            console.error("Transaction deployment execution failed: ", err);
        } finally {
            setSyncing(false);
            setDragOverIndex(null);
        }
    };

    const handleBlockDelete = async (blockId: string) => {
        const adjustedBlocks = blocks.filter(b => b.id !== blockId);
        const absoluteHtmlString = compileBlocksToHtmlString(adjustedBlocks);
        setSyncing(true);

        try {
            const response = await fetch(`/api/editing/delete-element/${projectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    updatedCode: absoluteHtmlString,
                    elementId: blockId,
                    pageId: "index"
                })
            });

            if (response.ok) {
                setBlocks(adjustedBlocks);
            } else {
                const responseData = await response.json();
                alert(responseData.error || "Server workspace registry failed structural removal validation logic flow.");
            }
        } catch (err) {
            console.error("Deletion update routine failed to compile: ", err);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col bg-[#030712] font-sans text-gray-100 overflow-hidden selection:bg-purple-500/30">
            
            {/* ─── SYSTEM HEADER PANEL ──────────────────────────────────────── */}
            <header className="w-full h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/builder/${projectId}`)}
                        className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        title="Back to Builder"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${syncing ? 'bg-amber-400 animate-spin border border-dashed border-amber-600' : 'bg-emerald-400 animate-pulse'}`} />
                        <h1 className="font-bold text-xs tracking-widest text-gray-300 uppercase max-w-xs truncate">
                            {project?.name || "Workspace Engine Layer"}
                        </h1>
                    </div>
                </div>

                {/* Canvas Viewport Toggle Switch Tabs */}
                <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex gap-1">
                    <button
                        onClick={() => setActiveTab('canvas')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${activeTab === 'canvas' ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Layout Canvas
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${activeTab === 'preview' ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        Live Preview
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 rounded-full backdrop-blur-md shadow-inner">
                        <span className="text-[10px] text-purple-300 font-bold tracking-widest uppercase">Balance Matrix:</span>
                        <span className="text-sm font-black text-white">{project?.credits ?? 0}</span>
                        <span className="text-[10px] text-purple-400 font-semibold uppercase">cr</span>
                    </div>
                </div>
            </header>

            {/* ─── MAIN CONTAINER MATRIX ────────────────────────────────────── */}
            <div className="flex flex-1 w-full h-[calc(100vh-64px)] overflow-hidden relative">
                
                {/* ─── LEFT PANEL SIDEBAR CONTROLLER ─────────────────────────── */}
                <aside className="w-72 h-full overflow-y-auto backdrop-blur-xl bg-black/30 border-r border-white/10 p-5 flex flex-col gap-6 z-10 shrink-0">
                    <div>
                        <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Free Structural Assets</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {freeTools.map((name) => (
                                <motion.div
                                    key={name}
                                    draggable
                                    onDragStartCapture={(e) => handleDragStart(e, {
                                        id: name,
                                        name: name.replace('-', ' '),
                                        cost: 0,
                                        previewHtml: COMPONENT_PREVIEWS[name]?.html || '<div></div>'
                                    })}
                                    whileHover={{ scale: 1.02, x: 4, backgroundColor: "rgba(255,255,255,0.08)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-3 rounded-xl border border-white/5 bg-white/5 cursor-grab active:cursor-grabbing text-xs font-medium text-gray-300 capitalize transition-colors duration-150 flex items-center justify-between"
                                >
                                    <span>{name.replace('-', ' ')}</span>
                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-3">Premium System Nodes</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(paidTools).map(([name, cost]) => (
                                <motion.div
                                    key={name}
                                    draggable
                                    onDragStartCapture={(e) => handleDragStart(e, {
                                        id: name,
                                        name: name.replace('-', ' '),
                                        cost,
                                        previewHtml: COMPONENT_PREVIEWS[name]?.html || '<div></div>'
                                    })}
                                    whileHover={{ scale: 1.02, x: 4, borderColor: "rgba(168,85,247,0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-3 rounded-xl border border-purple-500/10 bg-linear-to-r from-purple-500/5 to-transparent cursor-grab active:cursor-grabbing text-xs font-medium text-gray-200 flex items-center justify-between transition-colors duration-150"
                                >
                                    <span className="capitalize">{name.replace('-', ' ')}</span>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm">
                                        {cost} CR
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ─── WORKSPACE DYNAMIC PANEL LAYER ─────────────────────────── */}
                <main className="flex-1 h-full overflow-hidden bg-gray-950 relative">
                    <AnimatePresence mode="wait">
                        
                        {/* VIEW STATE A: STRUCTURAL DRILL DECK */}
                        {activeTab === 'canvas' && (
                            <motion.div
                                key="canvas-deck"
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.99 }}
                                transition={{ duration: 0.15 }}
                                className="w-full h-full overflow-y-auto p-6 md:p-10 flex flex-col items-center"
                            >
                                <div className="w-full max-w-3xl min-h-full rounded-2xl border border-white/5 bg-black/10 p-6 space-y-2 relative">
                                    
                                    {/* Drop insertion boundary index 0 */}
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(0); }}
                                        onDragLeave={() => setDragOverIndex(null)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const toolData = JSON.parse(e.dataTransfer.getData("application/json"));
                                            handleBlockDrop(0, toolData.id, toolData.previewHtml);
                                        }}
                                        className={`rounded-xl transition-all duration-200 ${dragOverIndex === 0 ? "bg-purple-500/10 border-2 border-dashed border-purple-500/30 h-16" : "h-2 opacity-0"}`}
                                    />

                                    {blocks.map((block, index) => (
                                        <React.Fragment key={block.id}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className="group relative rounded-xl border border-white/5 bg-white/5 hover:border-purple-500/30 p-4 flex items-center justify-between backdrop-blur-md transition-all duration-150"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-200">{block.label}</h4>
                                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{block.toolType}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleBlockDelete(block.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </motion.div>

                                            {/* Subsequent Dynamic Drop Blocks Insertions */}
                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index + 1); }}
                                                onDragLeave={() => setDragOverIndex(null)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const toolData = JSON.parse(e.dataTransfer.getData("application/json"));
                                                    handleBlockDrop(index + 1, toolData.id, toolData.previewHtml);
                                                }}
                                                className={`rounded-xl transition-all duration-200 ${dragOverIndex === index + 1 ? "bg-purple-500/10 border-2 border-dashed border-purple-500/30 h-16" : "h-2 opacity-0"}`}
                                            />
                                        </React.Fragment>
                                    ))}

                                    {blocks.length === 0 && (
                                        <div className="py-24 text-center flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl bg-white/1">
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                            <h5 className="font-bold text-sm text-gray-300">Workspace Canvas Frame is Empty</h5>
                                            <p className="text-xs text-gray-500 max-w-xs mt-1">Drag layout elements from the side node registry and release them here to structure the website code matrix.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'preview' && (
                            <motion.div
                                key="preview-viewport"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full bg-[#090d16]"
                            >
                                <iframe
                                    ref={iframeRef}
                                    title="Deployment Component Live Sandbox Run"
                                    className="w-full h-full border-none bg-transparent"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};