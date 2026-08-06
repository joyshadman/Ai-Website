import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Monitor, Tablet, Smartphone, Undo2, Redo2, Save,
  Eye, EyeOff, Layers, Box, Type, Image, Video, Grid3X3,
  Columns, Square, Minus, Disc, Layout, Menu, X, Copy, Trash2,
  Plus, ChevronRight, ChevronDown, GripVertical, Palette,
  Settings, Globe, Check, Loader2, Sparkles,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Upload, Link2, Search, PanelRight, FileText, Edit3, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/configs/axios";
import type { EditorComponent, ComponentType, Device, StyleProperties, PageData, HistoryEntry, ComponentDefinition, Page, Website } from "@/types/editor";
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

let idCounter = 0;
const uid = () => `e${++idCounter}_${Math.random().toString(36).slice(2, 7)}`;

const DEVICE_ICONS: Record<Device, React.ReactNode> = {
  desktop: <Monitor className="w-3.5 h-3.5" />,
  tablet: <Tablet className="w-3.5 h-3.5" />,
  mobile: <Smartphone className="w-3.5 h-3.5" />,
};

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

const CONTAINER_TYPES = new Set(["container","section","row","column","card","feature-grid"]);

const defaultProps: Record<ComponentType, { props: Record<string, any>; styles: StyleProperties }> = {
  container: { props: { label: "Container" }, styles: { padding: "24px", display: "block" } },
  section: { props: { label: "Section" }, styles: { padding: "48px 24px", display: "block" } },
  row: { props: { label: "Row" }, styles: { display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "stretch" } },
  column: { props: { label: "Column", width: "1fr" }, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", minWidth: "250px" } },
  heading: { props: { text: "Heading", level: "h2" }, styles: { fontSize: "28px", fontWeight: "700", lineHeight: "1.2", color: "#ffffff" } },
  text: { props: { text: "Lorem ipsum dolor sit amet consectetur adipiscing elit." }, styles: { fontSize: "16px", lineHeight: "1.6", color: "#cbd5e1" } },
  button: { props: { text: "Click Me", link: "#", variant: "primary" }, styles: { padding: "12px 24px", borderRadius: "8px", backgroundColor: "#7c3aed", color: "#ffffff", fontSize: "14px", fontWeight: "600", border: "none", display: "inline-block", cursor: "pointer" } },
  image: { props: { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800", alt: "Image", aspectRatio: "16/9" }, styles: { width: "100%", borderRadius: "8px", objectFit: "cover" } },
  video: { props: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ", aspectRatio: "16/9" }, styles: { width: "100%", borderRadius: "8px", border: "none" } },
  icon: { props: { name: "star", size: "24", color: "#7c3aed" }, styles: { display: "inline-flex", alignItems: "center", justifyContent: "center" } },
  divider: { props: {}, styles: { width: "100%", height: "1px", backgroundColor: "rgba(255,255,255,0.1)", margin: "24px 0" } },
  spacer: { props: { height: "48px" }, styles: { height: "48px", display: "block" } },
  card: { props: { title: "Card Title", text: "Card description goes here." }, styles: { padding: "24px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "12px" } },
  testimonial: { props: { quote: "Amazing product!", author: "John Doe", role: "CEO, Company" }, styles: { padding: "32px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "16px", fontStyle: "italic" } },
  faq: { props: { question: "Frequently Asked Question?", answer: "This is the answer to the question above." }, styles: { padding: "16px", borderRadius: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)" } },
  pricing: { props: { plan: "Pro", price: "$29", period: "/month", features: "Feature 1,Feature 2,Feature 3", cta: "Get Started" }, styles: { padding: "32px", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" as const } },
  "feature-grid": { props: { columns: "3" }, styles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" } },
  hero: { props: { title: "Build Better", subtitle: "Create stunning websites with our powerful builder.", cta: "Get Started" }, styles: { padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center" as const, minHeight: "60vh" } },
  navbar: { props: { brand: "Logo", links: "Home,About,Contact" }, styles: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.1)" } },
  footer: { props: { text: "© 2026 All rights reserved." }, styles: { padding: "48px 24px", textAlign: "center" as const, backgroundColor: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "14px" } },
  "contact-form": { props: { email: "test@example.com" }, styles: { padding: "32px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "16px" } },
  "newsletter-form": { props: { placeholder: "Enter your email", cta: "Subscribe" }, styles: { padding: "32px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" as const } },
  gallery: { props: { images: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400,https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400" }, styles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" } },
  slider: { props: { slides: "Slide 1 content here.,Slide 2 content here.,Slide 3 content here." }, styles: { padding: "24px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", position: "relative" as const } },
  carousel: { props: { images: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800,https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" }, styles: { borderRadius: "12px", overflow: "hidden" } },
  map: { props: { address: "New York, NY", zoom: "12" }, styles: { width: "100%", height: "400px", borderRadius: "8px", border: "none" } },
  "code-block": { props: { code: "<div>Hello World</div>", language: "html" }, styles: { padding: "16px", borderRadius: "8px", backgroundColor: "#1e1e2e", color: "#cdd6f4", fontFamily: "monospace", fontSize: "14px", overflowX: "auto" as const } },
  "html-embed": { props: { html: "<div style='padding:20px;background:rgba(255,255,255,0.05);border-radius:8px'>Custom HTML content</div>" }, styles: { width: "100%" } },
};

const renderComponentHtml = (comp: EditorComponent): string => {
  const s = comp.styles.desktop;
  const styleStr = Object.entries(s).filter(([, v]) => v).map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${v}`).join("; ");
  const childrenHtml = comp.children.map(c => renderComponentHtml(c)).join("\n");
  const propsStr = Object.entries(comp.props).filter(([, v]) => v && typeof v !== "object").map(([k, v]) => `${k}="${v}"`).join(" ");
  switch (comp.type) {
    case "container": return `<div style="${styleStr}" ${propsStr}>${childrenHtml}</div>`;
    case "section": return `<section style="${styleStr}" ${propsStr}>${childrenHtml}</section>`;
    case "row": return `<div style="${styleStr}" ${propsStr}>${childrenHtml}</div>`;
    case "column": return `<div style="${styleStr}" ${propsStr}>${childrenHtml}</div>`;
    case "heading": { const lvl = comp.props.level || "h2"; return `<${lvl} style="${styleStr}">${comp.props.text || ""}</${lvl}>`; }
    case "text": return `<p style="${styleStr}">${comp.props.text || ""}</p>`;
    case "button": return `<a href="${comp.props.link || "#"}" style="${styleStr}">${comp.props.text || "Button"}</a>`;
    case "image": return `<img src="${comp.props.src || ""}" alt="${comp.props.alt || ""}" style="${styleStr}" loading="lazy" />`;
    case "video": return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px"><iframe src="${comp.props.src || ""}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
    case "icon": return `<span style="${styleStr}">${comp.props.name || "star"}</span>`;
    case "divider": return `<hr style="${styleStr}" />`;
    case "spacer": return `<div style="${styleStr}"></div>`;
    case "card": return `<div style="${styleStr}"><h3>${comp.props.title || ""}</h3><p>${comp.props.text || ""}</p>${childrenHtml}</div>`;
    case "testimonial": return `<blockquote style="${styleStr}"><p>"${comp.props.quote || ""}"</p><footer><strong>${comp.props.author || ""}</strong> ${comp.props.role || ""}</footer></blockquote>`;
    case "faq": return `<details style="${styleStr}"><summary>${comp.props.question || ""}</summary><p>${comp.props.answer || ""}</p>${childrenHtml}</details>`;
    case "pricing": return `<div style="${styleStr}"><h3>${comp.props.plan || ""}</h3><div style="font-size:36px;font-weight:700">${comp.props.price || ""}<span style="font-size:14px;opacity:0.6">${comp.props.period || ""}</span></div><ul>${(comp.props.features || "").split(",").map((f: string) => `<li>${f.trim()}</li>`).join("")}</ul><a href="#" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">${comp.props.cta || "Get Started"}</a>${childrenHtml}</div>`;
    case "feature-grid": return `<div style="${styleStr}">${childrenHtml}</div>`;
    case "hero": return `<section style="${styleStr}"><h1>${comp.props.title || ""}</h1><p>${comp.props.subtitle || ""}</p><a href="#" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">${comp.props.cta || "Get Started"}</a>${childrenHtml}</section>`;
    case "navbar": return `<nav style="${styleStr}"><div style="font-weight:700;font-size:18px">${comp.props.brand || ""}</div><div style="display:flex;gap:16px">${(comp.props.links || "").split(",").map((l: string) => `<span>${l.trim()}</span>`).join("")}</div>${childrenHtml}</nav>`;
    case "footer": return `<footer style="${styleStr}"><p>${comp.props.text || ""}</p>${childrenHtml}</footer>`;
    case "contact-form": return `<form style="${styleStr}"><input placeholder="Name" style="padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff" /><input type="email" placeholder="Email" style="padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff" /><textarea placeholder="Message" rows={4} style="padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff"></textarea><button type="submit" style="padding:12px 24px;background:#7c3aed;color:#fff;border:none;border-radius:8px;cursor:pointer">Send</button></form>`;
    case "newsletter-form": return `<div style="${styleStr}"><h3>Subscribe</h3><div style="display:flex;gap:8px"><input placeholder="${comp.props.placeholder || "Email"}" style="flex:1;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff" /><button style="padding:12px 24px;background:#7c3aed;color:#fff;border:none;border-radius:8px;cursor:pointer">${comp.props.cta || "Subscribe"}</button></div></div>`;
    case "gallery": return `<div style="${styleStr}">${(comp.props.images || "").split(",").map((url: string) => `<img src="${url.trim()}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px" loading="lazy" />`).join("")}</div>`;
    case "slider": return `<div style="${styleStr}"><div style="display:flex;transition:transform 0.3s">${(comp.props.slides || "").split(",").map((s: string) => `<div style="min-width:100%;padding:20px">${s.trim()}</div>`).join("")}</div>${childrenHtml}</div>`;
    case "carousel": return `<div style="${styleStr};display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px">${(comp.props.images || "").split(",").map((url: string) => `<img src="${url.trim()}" style="scroll-snap-align:start;width:80%;flex-shrink:0;aspect-ratio:16/10;object-fit:cover;border-radius:8px" loading="lazy" />`).join("")}</div>`;
    case "map": return `<iframe style="${styleStr}" src="https://maps.google.com/maps?q=${encodeURIComponent(comp.props.address || "New York")}&z=${comp.props.zoom || "12"}&output=embed" loading="lazy"></iframe>`;
    case "code-block": return `<pre style="${styleStr}"><code>${comp.props.code || ""}</code></pre>`;
    case "html-embed": return comp.props.html || "";
    default: return `<div style="${styleStr}">${childrenHtml}</div>`;
  }
};

const COMPONENT_LABELS: Record<string, string> = {
  container: "Container", section: "Section", row: "Row", column: "Column",
  heading: "Heading", text: "Text", button: "Button", image: "Image", video: "Video", icon: "Icon",
  divider: "Divider", spacer: "Spacer",
  card: "Card", testimonial: "Testimonial", faq: "FAQ", pricing: "Pricing", "feature-grid": "Feature Grid",
  hero: "Hero", navbar: "Navbar", footer: "Footer",
  "contact-form": "Contact Form", "newsletter-form": "Newsletter",
  gallery: "Gallery", slider: "Slider", carousel: "Carousel",
  map: "Map", "code-block": "Code Block", "html-embed": "HTML Embed",
};

function findComponent(root: EditorComponent[], id: string): EditorComponent | null {
  for (const c of root) { if (c.id === id) return c; const f = findComponent(c.children, id); if (f) return f; }
  return null;
}

function findParent(root: EditorComponent[], id: string): { parent: EditorComponent[]; index: number } | null {
  for (let i = 0; i < root.length; i++) { if (root[i].id === id) return { parent: root, index: i }; const f = findParent(root[i].children, id); if (f) return f; }
  return null;
}

function cloneComponents(comps: EditorComponent[]): EditorComponent[] {
  return JSON.parse(JSON.stringify(comps));
}

function replaceComponent(root: EditorComponent[], id: string, updater: (comp: EditorComponent) => EditorComponent): EditorComponent[] {
  return root.map(c => {
    if (c.id === id) return updater(c);
    return { ...c, children: replaceComponent(c.children, id, updater) };
  });
}

function removeComponent(root: EditorComponent[], id: string): EditorComponent[] {
  return root.filter(c => c.id !== id).map(c => ({ ...c, children: removeComponent(c.children, id) }));
}

function moveComponentInList(comps: EditorComponent[], activeId: string, overId: string): EditorComponent[] {
  const oldParent = findParent(comps, activeId);
  const newParent = findParent(comps, overId);
  if (!oldParent || !newParent) return comps;
  const oldIdx = oldParent.index;
  const newIdx = newParent.index;
  // Same parent: reorder
  if (oldParent.parent === newParent.parent) {
    const arr = [...oldParent.parent];
    const [moved] = arr.splice(oldIdx, 1);
    arr.splice(newIdx, 0, moved);
    return arr === comps ? arr : replaceComponent(comps, oldParent.parent[0]?.id || "__root__", () => ({ ...oldParent.parent[0], children: arr }));
  }
  // Different parent: move
  const moving = findComponent(comps, activeId);
  if (!moving) return comps;
  let without = removeComponent(comps, activeId);
  without = replaceComponent(without, newParent.parent[newIdx]?.id || overId, p => {
    const children = [...p.children];
    children.splice(newIdx, 0, moving);
    return { ...p, children };
  });
  return without;
}

function generateHtml(comps: EditorComponent[]): string {
  const body = comps.filter(c => !c.hidden).map(c => renderComponentHtml(c)).join("\n");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script></head><body style="margin:0;background:#030712;color:#f1f5f9;font-family:system-ui,-apple-system,sans-serif">${body}</body></html>`;
}

/* ===================================================================
   COMPONENTS PANEL (Left Sidebar)
   =================================================================== */
const ComponentsPanel: React.FC<{ onAddComponent: (type: ComponentType) => void }> = ({ onAddComponent }) => {
  const [search, setSearch] = useState("");
  const CATEGORIES: { key: string; label: string; icon: React.ReactNode; types: ComponentType[] }[] = [
    { key: "structure", label: "Structure", icon: <Layout className="w-3.5 h-3.5" />, types: ["container", "section", "row", "column"] },
    { key: "content", label: "Content", icon: <Type className="w-3.5 h-3.5" />, types: ["heading", "text", "button", "icon", "divider", "spacer"] },
    { key: "media", label: "Media", icon: <Image className="w-3.5 h-3.5" />, types: ["image", "video", "gallery"] },
    { key: "widgets", label: "Widgets", icon: <Grid3X3 className="w-3.5 h-3.5" />, types: ["card", "testimonial", "faq", "pricing", "feature-grid", "map", "code-block", "html-embed", "slider", "carousel"] },
    { key: "sections", label: "Sections", icon: <Layout className="w-3.5 h-3.5" />, types: ["hero", "navbar", "footer", "contact-form", "newsletter-form"] },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search components..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/40" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
        {CATEGORIES.map(cat => {
          const types = cat.types.filter(t => !search || COMPONENT_LABELS[t]?.toLowerCase().includes(search.toLowerCase()));
          if (types.length === 0) return null;
          return (
            <div key={cat.key}>
              <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {cat.icon}{cat.label}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {types.map(type => (
                  <button key={type} onClick={() => onAddComponent(type)}
                    draggable onDragStart={e => e.dataTransfer.setData("text/plain", type)}
                    className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 text-gray-400 hover:text-white transition-all truncate">
                    {COMPONENT_LABELS[type] || type}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===================================================================
   STYLES PANEL (Right Sidebar)
   =================================================================== */
const StyleRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2 min-h-0">
    <span className="text-[10px] text-gray-500 uppercase tracking-wider shrink-0 w-16">{label}</span>
    <div className="flex-1 flex items-center gap-1">{children}</div>
  </div>
);

const StyleInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({ value, onChange, placeholder, type }) => (
  <input type={type || "text"} value={value || ""} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors" />
);

const ColorInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
      className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent p-0.5" />
    <StyleInput value={value} onChange={onChange} placeholder="#000000" />
  </div>
);

const NumberInput: React.FC<{ value: string; onChange: (v: string) => void; suffix?: string }> = ({ value, onChange, suffix }) => (
  <div className="flex items-center gap-0.5">
    <StyleInput value={value} onChange={onChange} />
    {suffix && <span className="text-[10px] text-gray-600">{suffix}</span>}
  </div>
);

const SelectInput: React.FC<{ value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }> = ({ value, onChange, options }) => (
  <select value={value || ""} onChange={e => onChange(e.target.value)}
    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500/40 transition-colors">
    <option value="">Default</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const StylesPanel: React.FC<{ component: EditorComponent; device: Device; onUpdate: (comp: EditorComponent) => void }> = ({ component, device, onUpdate }) => {
  const [tab, setTab] = useState<"layout" | "typography" | "background" | "effects">("layout");
  const s = component.styles[device];
  const updateStyle = (key: keyof StyleProperties, value: any) => { onUpdate({ ...component, styles: { ...component.styles, [device]: { ...s, [key]: value || undefined } } }); };
  const updateProp = (key: string, value: any) => { onUpdate({ ...component, props: { ...component.props, [key]: value } }); };
  const tabs = [
    { key: "layout" as const, label: "Layout", icon: <Grid3X3 className="w-3 h-3" /> },
    { key: "typography" as const, label: "Text", icon: <Type className="w-3 h-3" /> },
    { key: "background" as const, label: "Bg", icon: <Palette className="w-3 h-3" /> },
    { key: "effects" as const, label: "FX", icon: <Sparkles className="w-3 h-3" /> },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-white truncate">{COMPONENT_LABELS[component.type] || component.type}</h3>
        <p className="text-[10px] text-gray-600 font-mono">{component.id.slice(0, 10)}</p>
      </div>
      <div className="flex border-b border-white/5 shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${tab === t.key ? "text-purple-400 border-b-2 border-purple-500" : "text-gray-600 hover:text-gray-400"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {tab === "layout" && <>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Spacing</div>
          <StyleRow label="Margin"><StyleInput value={s.margin || ""} onChange={v => updateStyle("margin", v)} placeholder="0" /></StyleRow>
          <StyleRow label="Padding"><StyleInput value={s.padding || ""} onChange={v => updateStyle("padding", v)} placeholder="0" /></StyleRow>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 mt-2">Size</div>
          <StyleRow label="Width"><StyleInput value={s.width || ""} onChange={v => updateStyle("width", v)} placeholder="auto" /></StyleRow>
          <StyleRow label="Height"><StyleInput value={s.height || ""} onChange={v => updateStyle("height", v)} placeholder="auto" /></StyleRow>
          <StyleRow label="Max W"><StyleInput value={s.maxWidth || ""} onChange={v => updateStyle("maxWidth", v)} placeholder="none" /></StyleRow>
          <StyleRow label="Min H"><StyleInput value={s.minHeight || ""} onChange={v => updateStyle("minHeight", v)} placeholder="auto" /></StyleRow>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 mt-2">Layout</div>
          <StyleRow label="Display">
            <SelectInput value={s.display || ""} onChange={v => updateStyle("display", v)} options={[{ label: "Block", value: "block" }, { label: "Flex", value: "flex" }, { label: "Grid", value: "grid" }, { label: "Inline", value: "inline" }, { label: "None", value: "none" }]} />
          </StyleRow>
          {s.display === "flex" && <>
            <StyleRow label="Direction"><SelectInput value={s.flexDirection || ""} onChange={v => updateStyle("flexDirection", v)} options={[{ label: "Row", value: "row" }, { label: "Column", value: "column" }]} /></StyleRow>
            <StyleRow label="Align"><SelectInput value={s.alignItems || ""} onChange={v => updateStyle("alignItems", v)} options={[{ label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Stretch", value: "stretch" }]} /></StyleRow>
            <StyleRow label="Justify"><SelectInput value={s.justifyContent || ""} onChange={v => updateStyle("justifyContent", v)} options={[{ label: "Start", value: "flex-start" }, { label: "Center", value: "center" }, { label: "End", value: "flex-end" }, { label: "Between", value: "space-between" }, { label: "Around", value: "space-around" }]} /></StyleRow>
            <StyleRow label="Gap"><NumberInput value={s.gap || ""} onChange={v => updateStyle("gap", v)} suffix="px" /></StyleRow>
          </>}
          {s.display === "grid" && <>
            <StyleRow label="Columns"><StyleInput value={s.gridTemplateColumns || ""} onChange={v => updateStyle("gridTemplateColumns", v)} placeholder="repeat(3,1fr)" /></StyleRow>
            <StyleRow label="Gap"><NumberInput value={s.gridGap || s.gap || ""} onChange={v => { updateStyle("gridGap", v); updateStyle("gap", v); }} suffix="px" /></StyleRow>
          </>}
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 mt-2">Position</div>
          <StyleRow label="Position"><SelectInput value={s.position || ""} onChange={v => updateStyle("position", v)} options={[{ label: "Static", value: "static" }, { label: "Relative", value: "relative" }, { label: "Absolute", value: "absolute" }, { label: "Fixed", value: "fixed" }, { label: "Sticky", value: "sticky" }]} /></StyleRow>
          <StyleRow label="Z Index"><NumberInput value={s.zIndex?.toString() || ""} onChange={v => updateStyle("zIndex", v ? parseInt(v) : undefined)} /></StyleRow>
          <StyleRow label="Overflow"><SelectInput value={s.overflow || ""} onChange={v => updateStyle("overflow", v)} options={[{ label: "Visible", value: "visible" }, { label: "Hidden", value: "hidden" }, { label: "Scroll", value: "scroll" }, { label: "Auto", value: "auto" }]} /></StyleRow>
        </>}
        {tab === "typography" && <>
          <StyleRow label="Font"><StyleInput value={s.fontFamily || ""} onChange={v => updateStyle("fontFamily", v)} placeholder="system-ui" /></StyleRow>
          <StyleRow label="Size"><NumberInput value={s.fontSize || ""} onChange={v => updateStyle("fontSize", v)} suffix="px" /></StyleRow>
          <StyleRow label="Weight"><SelectInput value={s.fontWeight?.toString() || ""} onChange={v => updateStyle("fontWeight", v)} options={[{ label: "Light 300", value: "300" }, { label: "Regular 400", value: "400" }, { label: "Medium 500", value: "500" }, { label: "Semibold 600", value: "600" }, { label: "Bold 700", value: "700" }, { label: "Black 800", value: "800" }]} /></StyleRow>
          <StyleRow label="Line H"><NumberInput value={s.lineHeight || ""} onChange={v => updateStyle("lineHeight", v)} /></StyleRow>
          <StyleRow label="Spacing"><NumberInput value={s.letterSpacing || ""} onChange={v => updateStyle("letterSpacing", v)} suffix="px" /></StyleRow>
          <StyleRow label="Align">
            <div className="flex gap-0.5">
              {[{ v: "left", i: <AlignLeft className="w-3 h-3" /> }, { v: "center", i: <AlignCenter className="w-3 h-3" /> }, { v: "right", i: <AlignRight className="w-3 h-3" /> }].map(({ v, i }) => (
                <button key={v} onClick={() => updateStyle("textAlign", v)} className={`p-1 rounded ${s.textAlign === v ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"}`}>{i}</button>
              ))}
            </div>
          </StyleRow>
          <StyleRow label="Color"><ColorInput value={s.color || ""} onChange={v => updateStyle("color", v)} /></StyleRow>
          <StyleRow label="Decor"><SelectInput value={s.textDecoration || ""} onChange={v => updateStyle("textDecoration", v)} options={[{ label: "None", value: "none" }, { label: "Underline", value: "underline" }, { label: "Line Through", value: "line-through" }]} /></StyleRow>
          <StyleRow label="Transform"><SelectInput value={s.textTransform || ""} onChange={v => updateStyle("textTransform", v)} options={[{ label: "None", value: "none" }, { label: "Uppercase", value: "uppercase" }, { label: "Lowercase", value: "lowercase" }, { label: "Capitalize", value: "capitalize" }]} /></StyleRow>
          {["heading", "button"].includes(component.type) && (
            <StyleRow label="Text"><input type="text" value={component.props.text || ""} onChange={e => updateProp("text", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500/40" /></StyleRow>
          )}
          {component.type === "heading" && (
            <StyleRow label="Level"><select value={component.props.level || "h2"} onChange={e => updateProp("level", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500/40">{["h1", "h2", "h3", "h4", "h5", "h6"].map(l => <option key={l} value={l}>{l}</option>)}</select></StyleRow>
          )}
          {component.type === "button" && <StyleRow label="Link"><StyleInput value={component.props.link || ""} onChange={v => updateProp("link", v)} placeholder="#" /></StyleRow>}
        </>}
        {tab === "background" && <>
          <StyleRow label="Color"><ColorInput value={s.backgroundColor || ""} onChange={v => updateStyle("backgroundColor", v)} /></StyleRow>
          <StyleRow label="Gradient"><StyleInput value={s.backgroundGradient || ""} onChange={v => updateStyle("backgroundGradient", v)} placeholder="linear-gradient(...)" /></StyleRow>
          <StyleRow label="Image"><StyleInput value={s.backgroundImage || ""} onChange={v => updateStyle("backgroundImage", v)} placeholder="url(...)" /></StyleRow>
          <StyleRow label="Size"><SelectInput value={s.backgroundSize || ""} onChange={v => updateStyle("backgroundSize", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Auto", value: "auto" }]} /></StyleRow>
          <StyleRow label="Position"><StyleInput value={s.backgroundPosition || ""} onChange={v => updateStyle("backgroundPosition", v)} placeholder="center" /></StyleRow>
        </>}
        {tab === "effects" && <>
          <StyleRow label="Opacity"><input type="range" min="0" max="1" step="0.05" value={s.opacity ?? 1} onChange={e => updateStyle("opacity", parseFloat(e.target.value))} className="w-full accent-purple-500" /></StyleRow>
          <StyleRow label="Radius"><NumberInput value={s.borderRadius || ""} onChange={v => updateStyle("borderRadius", v)} suffix="px" /></StyleRow>
          <StyleRow label="Border"><StyleInput value={s.border || ""} onChange={v => updateStyle("border", v)} placeholder="1px solid rgba(...)" /></StyleRow>
          <StyleRow label="Shadow"><StyleInput value={s.boxShadow || ""} onChange={v => updateStyle("boxShadow", v)} placeholder="0 4px 6px rgba(...)" /></StyleRow>
          <StyleRow label="Backdrop"><StyleInput value={s.backdropFilter || ""} onChange={v => updateStyle("backdropFilter", v)} placeholder="blur(12px)" /></StyleRow>
        </>}
        <div className="text-[10px] text-gray-600 text-center pt-2 pb-4">
          Editing {COMPONENT_LABELS[component.type]} on <span className="uppercase">{device}</span>
        </div>
      </div>
    </div>
  );
};

/* ===================================================================
   LAYERS PANEL
   =================================================================== */
const LayerTreeItem: React.FC<{ component: EditorComponent; depth: number; selectedId: string | null; onSelect: (id: string) => void; onDelete: (id: string) => void }> = ({ component, depth, selectedId, onSelect, onDelete }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = component.children.length > 0;
  return (
    <div>
      <div onClick={() => onSelect(component.id)}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition-colors group ${selectedId === component.id ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}>
        {hasChildren ? (
          <button onClick={e => { e.stopPropagation(); setOpen(!open); }} className="p-0.5">{open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</button>
        ) : <span className="w-4" />}
        <span className="text-[9px] opacity-50">{COMPONENT_LABELS[component.type] || component.type}</span>
        <button onClick={e => { e.stopPropagation(); onDelete(component.id); }} className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-3 h-3" /></button>
      </div>
      {open && hasChildren && component.children.map(child => (
        <LayerTreeItem key={child.id} component={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
};

const LayersPanel: React.FC<{ components: EditorComponent[]; selectedId: string | null; onSelect: (id: string) => void; onDelete: (id: string) => void }> = ({ components, selectedId, onSelect, onDelete }) => (
  <div className="flex flex-col h-full">
    <div className="p-3 border-b border-white/5"><h3 className="text-xs font-semibold text-white">Navigator</h3></div>
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: "thin" }}>
      {components.length === 0 ? <p className="text-xs text-gray-600 text-center py-8">No components</p> : components.map(c => (
        <LayerTreeItem key={c.id} component={c} depth={0} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  </div>
);

/* ===================================================================
   SORTABLE CANVAS ITEM (using @dnd-kit)
   =================================================================== */
const SortableItem: React.FC<{
  component: EditorComponent; depth: number; selectedId: string | null;
  device: Device; parentId: string;
  onSelect: (id: string) => void; onUpdate: (comp: EditorComponent) => void;
}> = ({ component, depth, selectedId, device, parentId, onSelect, onUpdate }) => {
  const isSelected = selectedId === component.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: component.id, data: { type: component.type, parentId } });
  const isContainer = CONTAINER_TYPES.has(component.type);
  const [editing, setEditing] = useState<string | null>(null);
  const [imgInput, setImgInput] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const style: React.CSSProperties = {
    ...component.styles[device] as React.CSSProperties,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    position: "relative" as const,
  };

  const handleInlineEdit = (field: string, value: string) => {
    onUpdate({ ...component, props: { ...component.props, [field]: value } });
    setEditing(null);
  };

  const inlineText = (field: string, text: string, tag?: string, extraStyle?: React.CSSProperties) => {
    if (editing === field) {
      return React.createElement(tag || "div", {
        style: { margin: 0, outline: "none", borderBottom: "1px solid #7c3aed", minWidth: 30, ...extraStyle },
        contentEditable: true,
        suppressContentEditableWarning: true,
        ref: (el: HTMLElement | null) => el && el.focus && setTimeout(() => el.focus(), 0),
        onBlur: (e: React.FocusEvent<HTMLElement>) => handleInlineEdit(field, e.currentTarget.textContent || ""),
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); } },
      }, text);
    }
    return React.createElement(tag || "div", {
      style: { margin: 0, cursor: "pointer", ...extraStyle },
      onDoubleClick: () => setEditing(field),
    }, text);
  };

  const childrenIds = component.children.map(c => c.id);

  return (
    <div ref={setNodeRef} style={style}
      className={`relative transition-colors ${isSelected ? "outline outline-2 outline-purple-500 outline-offset-2" : ""} ${isDragging ? "z-50" : ""}`}
      onClick={e => { e.stopPropagation(); onSelect(component.id); }}
      {...attributes}
      {...listeners}
    >
      {isSelected && (
        <div className="absolute -top-5 left-0 z-20 flex items-center gap-0.5 bg-purple-600 rounded-t-md px-1.5 py-0.5">
          <span className="text-[9px] text-white font-medium">{COMPONENT_LABELS[component.type]}</span>
        </div>
      )}
      {/* Render based on type */}
      {component.type === "heading" && (
        editing === "text"
          ? inlineText("text", component.props.text || "", component.props.level || "h2")
          : React.createElement(component.props.level || "h2", { style: { margin: 0, cursor: "pointer" }, onDoubleClick: () => setEditing("text") }, component.props.text || "")
      )}
      {component.type === "text" && (
        editing === "text"
          ? inlineText("text", component.props.text || "", "p")
          : <p style={{ margin: 0, cursor: "pointer" }} onDoubleClick={() => setEditing("text")}>{component.props.text}</p>
      )}
      {component.type === "button" && (
        <a href={component.props.link || "#"} style={{ textDecoration: "none", cursor: "pointer" }}
          onDoubleClick={e => { e.preventDefault(); setEditing("text"); }}>
          {editing === "text" ? inlineText("text", component.props.text || "Button", "span") : (component.props.text || "Button")}
        </a>
      )}
      {component.type === "image" && (
        <div style={{ position: "relative" }} onDoubleClick={() => setImgInput(true)}>
          <img src={component.props.src || "https://placehold.co/600x400"} alt={component.props.alt || ""} style={{ width: "100%", objectFit: "cover" }} loading="lazy" />
          {isSelected && imgInput && (
            <div className="absolute bottom-2 left-2 right-2 z-20 flex gap-1" onClick={e => e.stopPropagation()}>
              <input ref={imgRef} type="text" placeholder="Image URL..." defaultValue={component.props.src || ""}
                className="flex-1 bg-gray-900 border border-purple-500/50 rounded px-2 py-1 text-xs text-white outline-none"
                onKeyDown={e => { if (e.key === "Enter") { onUpdate({ ...component, props: { ...component.props, src: (e.target as HTMLInputElement).value } }); setImgInput(false); } if (e.key === "Escape") setImgInput(false); }}
                onBlur={e => { const v = e.target.value; if (v) onUpdate({ ...component, props: { ...component.props, src: v } }); setImgInput(false); }} />
            </div>
          )}
        </div>
      )}
      {component.type === "video" && (
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px" }}>
          <iframe src={component.props.src} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
        </div>
      )}
      {component.type === "divider" && <hr style={{ border: "none" }} />}
      {component.type === "spacer" && <div style={{ minHeight: parseInt(component.props.height) || 48 }} />}
      {component.type === "icon" && <span>{component.props.name}</span>}
      {component.type === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {inlineText("title", component.props.title || "Hero Title", "h1", { margin: 0, fontSize: 48, fontWeight: 800 })}
          {inlineText("subtitle", component.props.subtitle || "", "p", { margin: 0, fontSize: 18, opacity: 0.7 })}
          {inlineText("cta", component.props.cta || "Get Started", "span", { padding: "12px 24px", background: "#7c3aed", color: "#fff", borderRadius: 8 })}
        </div>
      )}
      {component.type === "navbar" && (
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {inlineText("brand", component.props.brand || "Logo", "div", { fontWeight: 700, fontSize: 18 })}
          <div style={{ display: "flex", gap: 16 }}>
            {(component.props.links || "").split(",").map((l: string, i: number) => <span key={i} style={{ fontSize: 13, opacity: 0.7 }}>{l.trim()}</span>)}
          </div>
        </nav>
      )}
      {component.type === "footer" && <footer>{inlineText("text", component.props.text || "© 2026", "p", { margin: 0 })}</footer>}
      {component.type === "gallery" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {(component.props.images || "").split(",").map((url: string, i: number) => <img key={i} src={url.trim()} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 6 }} loading="lazy" />)}
        </div>
      )}
      {component.type === "pricing" && (
        <div style={{ textAlign: "center" }}>
          {inlineText("plan", component.props.plan || "Plan", "h3", { margin: 0 })}
          <div style={{ fontSize: 36, fontWeight: 700 }}>{component.props.price}<span style={{ fontSize: 14, opacity: 0.6 }}>{component.props.period}</span></div>
          {(component.props.features || "").split(",").map((f: string, i: number) => <p key={i} style={{ margin: "4px 0", fontSize: 13 }}>{f.trim()}</p>)}
          <a href="#" style={{ display: "inline-block", padding: "12px 24px", background: "#7c3aed", color: "#fff", borderRadius: 8, textDecoration: "none", marginTop: 12 }}>{component.props.cta}</a>
        </div>
      )}
      {component.type === "testimonial" && (
        <blockquote style={{ fontStyle: "italic" }}><p>"{component.props.quote}"</p><footer style={{ marginTop: 8, fontStyle: "normal", fontSize: 13 }}><strong>{component.props.author}</strong> {component.props.role}</footer></blockquote>
      )}
      {component.type === "faq" && (
        <div><p style={{ fontWeight: 600, marginBottom: 4 }}>{component.props.question}</p><p style={{ opacity: 0.7, fontSize: 13 }}>{component.props.answer}</p></div>
      )}
      {component.type === "contact-form" && (
        <form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Name" style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
          <input placeholder="Email" style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
          <textarea placeholder="Message" rows={3} style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
          <button type="submit" style={{ padding: "12px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Send</button>
        </form>
      )}
      {component.type === "newsletter-form" && (
        <div style={{ textAlign: "center" }}>
          <h3>Subscribe</h3>
          <div style={{ display: "flex", gap: 8, maxWidth: 400, margin: "12px auto 0" }}>
            <input placeholder={component.props.placeholder || "Email"} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
            <button style={{ padding: "12px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>{component.props.cta}</button>
          </div>
        </div>
      )}
      {component.type === "code-block" && <pre style={{ overflowX: "auto" }}><code>{component.props.code}</code></pre>}
      {component.type === "html-embed" && <div dangerouslySetInnerHTML={{ __html: component.props.html || "" }} />}
      {component.type === "map" && <iframe style={{ border: "none", width: "100%", height: 400 }} src={`https://maps.google.com/maps?q=${encodeURIComponent(component.props.address || "New York")}&z=${component.props.zoom || "12"}&output=embed`} loading="lazy" />}
      {component.type === "slider" && (
        <div style={{ overflow: "hidden", position: "relative" }}>
          <div style={{ display: "flex", transition: "transform 0.3s" }}>
            {(component.props.slides || "").split(",").map((s: string, i: number) => <div key={i} style={{ minWidth: "100%", padding: 20 }}>{s.trim()}</div>)}
          </div>
        </div>
      )}
      {component.type === "carousel" && (
        <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", gap: 8 }}>
          {(component.props.images || "").split(",").map((url: string, i: number) => <img key={i} src={url.trim()} style={{ scrollSnapAlign: "start", width: "80%", flexShrink: 0, aspectRatio: "16/10", objectFit: "cover", borderRadius: 8 }} />)}
        </div>
      )}
      {/* Container types render children inside a SortableContext */}
      {isContainer && (
        <div style={{ minHeight: 24 }}>
          {component.children.length === 0 && (
            <div className="text-[10px] text-gray-600 text-center py-3">Drop components here</div>
          )}
          <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
            {component.children.map(child => (
              <SortableItem key={child.id} component={child} depth={depth + 1}
                selectedId={selectedId} device={device} parentId={component.id}
                onSelect={onSelect} onUpdate={onUpdate} />
            ))}
          </SortableContext>
        </div>
      )}
      {component.type === "feature-grid" && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${component.props.columns || 3}, 1fr)`, gap: 24 }}>
          <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
            {component.children.map(child => (
              <SortableItem key={child.id} component={child} depth={depth + 1}
                selectedId={selectedId} device={device} parentId={component.id}
                onSelect={onSelect} onUpdate={onUpdate} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

/* ===================================================================
   PAGES PANEL
   =================================================================== */
const PagesPanel: React.FC<{
  pages: Page[]; activePageId: string; websiteName: string;
  onSwitchPage: (id: string) => void;
  onAddPage: () => void;
  onRenamePage: (id: string, name: string) => void;
  onDeletePage: (id: string) => void;
  onRenameWebsite: (name: string) => void;
}> = ({ pages, activePageId, websiteName, onSwitchPage, onAddPage, onRenamePage, onDeletePage, onRenameWebsite }) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [websiteNameInput, setWebsiteNameInput] = useState(websiteName);
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5 space-y-2">
        {editingWebsite ? (
          <input value={websiteNameInput} onChange={e => setWebsiteNameInput(e.target.value)}
            onBlur={() => { onRenameWebsite(websiteNameInput); setEditingWebsite(false); }}
            onKeyDown={e => { if (e.key === "Enter") { onRenameWebsite(websiteNameInput); setEditingWebsite(false); } if (e.key === "Escape") setEditingWebsite(false); }}
            className="w-full bg-white/5 border border-purple-500/40 rounded px-2 py-1 text-xs text-white outline-none" autoFocus />
        ) : (
          <h3 className="text-xs font-semibold text-white truncate flex items-center gap-1 cursor-pointer hover:text-purple-400" onClick={() => { setWebsiteNameInput(websiteName); setEditingWebsite(true); }}>
            <FileText className="w-3 h-3 shrink-0" /> {websiteName || "Untitled"}
          </h3>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: "thin" }}>
        {pages.map(p => (
          <div key={p.id} className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition-colors ${p.id === activePageId ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
            onClick={() => onSwitchPage(p.id)}>
            <FileText className="w-3 h-3 shrink-0 opacity-50" />
            {editingPageId === p.id ? (
              <input value={editingName} onChange={e => setEditingName(e.target.value)}
                onBlur={() => { onRenamePage(p.id, editingName); setEditingPageId(null); }}
                onKeyDown={e => { if (e.key === "Enter") { onRenamePage(p.id, editingName); setEditingPageId(null); } if (e.key === "Escape") setEditingPageId(null); }}
                className="flex-1 bg-white/5 border border-purple-500/40 rounded px-1 py-0.5 text-[11px] text-white outline-none" autoFocus
                onClick={e => e.stopPropagation()} />
            ) : (
              <span className="flex-1 truncate">{p.name}</span>
            )}
            {p.id !== "page-1" && (
              <button onClick={e => { e.stopPropagation(); onDeletePage(p.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-red-400">
                <X className="w-3 h-3" />
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); setEditingPageId(p.id); setEditingName(p.name); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded text-gray-500">
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-white/5">
        <button onClick={onAddPage} className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Plus className="w-3 h-3" /> Add Page
        </button>
      </div>
    </div>
  );
};

/* ===================================================================
   TOOLBAR
   =================================================================== */
const EditorToolbar: React.FC<{
  device: Device; onDeviceChange: (d: Device) => void;
  onUndo: () => void; onRedo: () => void; canUndo: boolean; canRedo: boolean;
  onSave: () => void; saving: boolean; saved: boolean; preview: boolean;
  onPreviewToggle: () => void; showLayers: boolean; onLayersToggle: () => void;
  showPages: boolean; onPagesToggle: () => void;
  projectName: string; onBack: () => void;
}> = ({ device, onDeviceChange, onUndo, onRedo, canUndo, canRedo, onSave, saving, saved, preview, onPreviewToggle, showLayers, onLayersToggle, showPages, onPagesToggle, projectName, onBack }) => (
  <header className="h-12 border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-30">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
      <h1 className="text-sm font-semibold text-white truncate max-w-[160px]">{projectName || "Untitled"}</h1>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 p-0.5 bg-white/5 border border-white/10 rounded-lg">
        {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
          <button key={d} onClick={() => onDeviceChange(d)} className={`p-1.5 rounded-md transition-colors ${device === d ? "bg-purple-500/20 text-purple-400" : "text-gray-500 hover:text-gray-300"}`}>{DEVICE_ICONS[d]}</button>
        ))}
      </div>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"><Undo2 className="w-3.5 h-3.5" /></button>
      <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"><Redo2 className="w-3.5 h-3.5" /></button>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}{saving ? "Saving" : saved ? "Saved" : "Save"}
      </button>
      <button onClick={onPreviewToggle} className={`p-1.5 rounded-lg transition-colors ${preview ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/10 text-gray-500 hover:text-white"}`}>{preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
      <button onClick={onPagesToggle} className={`p-1.5 rounded-lg transition-colors ${showPages ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/10 text-gray-500 hover:text-white"}`}><FileText className="w-3.5 h-3.5" /></button>
      <button onClick={onLayersToggle} className={`p-1.5 rounded-lg transition-colors ${showLayers ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/10 text-gray-500 hover:text-white"}`}><Layers className="w-3.5 h-3.5" /></button>
    </div>
  </header>
);

/* ===================================================================
   PREVIEW MODE
   =================================================================== */
const PreviewMode: React.FC<{ html: string; device: Device }> = ({ html, device }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
  }, [html]);
  return (
    <div className="flex-1 flex items-start justify-center p-4 overflow-auto bg-gray-950">
      <div style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", transition: "width 0.3s" }}>
        <iframe ref={iframeRef} title="Preview" className="w-full border border-white/10 rounded-lg bg-white" style={{ height: "calc(100vh - 100px)" }} />
      </div>
    </div>
  );
};

/* ===================================================================
   MAIN EDITOR COMPONENT
   =================================================================== */
const EditorPage: React.FC = () => {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string>("page-1");
  const [websiteName, setWebsiteName] = useState("Untitled");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([{ components: [], timestamp: Date.now(), description: "Initial" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const [preview, setPreview] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showPages, setShowPages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const activePage = pages.find(p => p.id === activePageId);
  const components = activePage?.components || [];
  const selected = selectedId ? findComponent(components, selectedId) : null;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Debug logging
  console.log("[DEBUG] Current Page:", activePage?.id, activePage?.name);
  console.log("[DEBUG] Components count:", components.length);
  console.log("[DEBUG] Pages:", pages.length);
  console.log("[DEBUG] Loading:", loading);
  console.log("[DEBUG] Error:", error);

  const dbgStatus = {
    fetchSuccess: !loading && !error,
    databaseSuccess: pages.length > 0,
    schemaSuccess: components.length > 0,
    renderSuccess: components.length > 0,
    pagesCount: pages.length,
    componentsCount: components.length,
    hasSelected: !!selected,
    projectId,
  };
  console.log("[DEBUG] Status:", dbgStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const pushHistory = useCallback((comps: EditorComponent[], desc: string) => {
    setHistory(h => {
      const trimmed = h.slice(0, historyIndex + 1);
      return [...trimmed, { components: cloneComponents(comps), timestamp: Date.now(), description: desc }];
    });
    setHistoryIndex(i => i + 1);
  }, [historyIndex]);

  const getActivePageComponents = useCallback((): EditorComponent[] => {
    const page = pages.find(p => p.id === activePageId);
    return page?.components || [];
  }, [pages, activePageId]);

  const setActivePageComponents = useCallback((compsOrUpdater: EditorComponent[] | ((prev: EditorComponent[]) => EditorComponent[])) => {
    setPages(prev => prev.map(p => {
      if (p.id !== activePageId) return p;
      const newComps = typeof compsOrUpdater === 'function' ? compsOrUpdater(p.components) : compsOrUpdater;
      return { ...p, components: newComps };
    }));
  }, [activePageId]);

  const handleUpdateComponent = useCallback((updated: EditorComponent) => {
    setActivePageComponents(replaceComponent(getActivePageComponents(), updated.id, () => updated));
    setSaved(false);
  }, [getActivePageComponents, setActivePageComponents]);

  const handleSelect = useCallback((id: string | null) => setSelectedId(id), []);

  const handleAddComponent = useCallback((type: ComponentType) => {
    const id = uid();
    const def = defaultProps[type];
    const newComp: EditorComponent = {
      id, type, name: COMPONENT_LABELS[type] || type,
      props: { ...def.props },
      styles: { desktop: { ...def.styles }, tablet: {}, mobile: {} },
      children: [],
      editable: true, draggable: true, deletable: true, droppable: CONTAINER_TYPES.has(type),
    };
    setActivePageComponents(prev => {
      const updated = [...prev, newComp];
      setTimeout(() => pushHistory(updated, `Added ${type}`), 0);
      return updated;
    });
    setSelectedId(id);
    setSaved(false);
  }, [setActivePageComponents, pushHistory]);

  const handleDelete = useCallback((id: string) => {
    setActivePageComponents(prev => {
      const updated = removeComponent(prev, id);
      setTimeout(() => pushHistory(updated, `Deleted`), 0);
      return updated;
    });
    setSelectedId(null);
    setSaved(false);
  }, [setActivePageComponents, pushHistory]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current as any;
    const comps = getActivePageComponents();
    const oldParent = findParent(comps, activeId);
    const overParent = findParent(comps, overId);
    if (!oldParent || !overParent) return;
    // If same parent: just reorder
    if (oldParent.parent === overParent.parent) {
      const arr = [...oldParent.parent];
      const idx = arr.findIndex(c => c.id === activeId);
      const overIdx = arr.findIndex(c => c.id === overId);
      if (idx === -1 || overIdx === -1) return;
      const [moved] = arr.splice(idx, 1);
      arr.splice(overIdx, 0, moved);
      // Determine if we're modifying root or children
      if (oldParent.parent === comps) {
        setActivePageComponents(arr);
      } else {
        const parentId = oldParent.parent[0]?.id;
        if (parentId) {
          setActivePageComponents(replaceComponent(comps, parentId, p => ({ ...p, children: arr })));
        }
      }
      setSaved(false);
      return;
    }
    // Different parent: move
    const moving = findComponent(comps, activeId);
    if (!moving) return;
    let without = removeComponent(comps, activeId);
    const overTarget = findParent(without, overId);
    if (!overTarget) return;
    if (overTarget.parent === without) {
      const idx = without.findIndex(c => c.id === overId);
      without.splice(idx, 0, moving);
      setActivePageComponents(without);
    } else {
      const parentId = overTarget.parent[0]?.id || overTarget.parent[0]?.id;
      if (parentId) {
        const arr = [...overTarget.parent];
        const idx = arr.findIndex(c => c.id === overId);
        arr.splice(idx, 0, moving);
        setActivePageComponents(replaceComponent(without, parentId, p => ({ ...p, children: arr })));
      }
    }
    setSaved(false);
  }, [getActivePageComponents, setActivePageComponents]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setActivePageComponents(cloneComponents(history[newIndex].components));
  }, [canUndo, historyIndex, history, setActivePageComponents]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setActivePageComponents(cloneComponents(history[newIndex].components));
  }, [canRedo, historyIndex, history, setActivePageComponents]);

  const handleSave = useCallback(async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const pageData = { pages, globalStyles: {} };
      await api.put(`/api/websites/${projectId}`, { pageData, name: websiteName });
      setSaved(true);
      const allComps = pages.flatMap(p => p.components);
      if (allComps.length > 0) pushHistory(allComps, "Saved");
      toast.success("Saved");
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }, [projectId, pages, websiteName, pushHistory]);

  const handlePublish = useCallback(async () => {
    try {
      const { data } = await api.post(`/api/editing/page/${projectId}/publish`);
      toast.success(data.isPublished ? "Published" : "Unpublished");
    } catch { toast.error("Publish failed"); }
  }, [projectId]);

  const handleDuplicate = useCallback(() => {
    if (!selected) return;
    const copy = cloneComponents([selected])[0];
    copy.id = uid();
    copy.name = copy.name + " (Copy)";
    setActivePageComponents(prev => [...prev, copy]);
    setSelectedId(copy.id);
    setSaved(false);
  }, [selected, setActivePageComponents]);

  const handleCopy = useCallback(() => {
    if (!selected) return;
    navigator.clipboard.writeText(JSON.stringify(selected));
    toast.success("Copied");
  }, [selected]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (parsed && parsed.type) {
        parsed.id = uid();
        setActivePageComponents(prev => [...prev, parsed]);
        setSaved(false);
      }
    } catch { toast.error("Nothing to paste"); }
  }, [setActivePageComponents]);

  const handleAddPage = useCallback(() => {
    const id = uid();
    const newPage: Page = { id, name: `Page ${pages.length + 1}`, slug: `/${pages.length === 0 ? "" : `page-${pages.length + 1}`}`, components: [] };
    setPages(prev => [...prev, newPage]);
    setActivePageId(id);
    setSelectedId(null);
    // Push empty history for new page
    setHistory(h => [...h.slice(0, historyIndex + 1), { components: [], timestamp: Date.now(), description: `Added page: ${newPage.name}` }]);
    setHistoryIndex(i => i + 1);
  }, [pages, historyIndex]);

  const handleRenamePage = useCallback((id: string, name: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    setSaved(false);
  }, []);

  const handleDeletePage = useCallback((id: string) => {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter(p => p.id !== id));
    if (activePageId === id) {
      const remaining = pages.filter(p => p.id !== id);
      setActivePageId(remaining[0]?.id || "page-1");
    }
    setSaved(false);
  }, [pages, activePageId]);

  const handleSwitchPage = useCallback((id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    setActivePageId(id);
    setSelectedId(null);
    // Push history for this page's components
    setHistory(h => [...h.slice(0, historyIndex + 1), { components: cloneComponents(page.components), timestamp: Date.now(), description: `Switched to: ${page.name}` }]);
    setHistoryIndex(i => i + 1);
  }, [pages, historyIndex]);

  const handleRenameWebsite = useCallback((name: string) => {
    setWebsiteName(name);
    setSaved(false);
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (saved) return;
    const timer = setTimeout(() => handleSave(), 10000);
    return () => clearTimeout(timer);
  }, [saved, handleSave]);

  // Load website data from API
  useEffect(() => {
    (async () => {
      try {
        console.log("[DEBUG] Project ID:", projectId);
        console.log("[DEBUG] Fetching Project from /api/editor/${projectId}");
        const { data } = await api.get(`/api/editor/${projectId}`);
        console.log("[DEBUG] Project Response:", JSON.stringify(data, null, 2));

        setWebsiteName(data.name || "Untitled");
        console.log("[DEBUG] Website name:", data.name);

        const loadedPages = data.pages && data.pages.length > 0 ? data.pages : [{ id: "page-1", name: "Home", slug: "/", components: [] }];
        console.log("[DEBUG] Loaded pages count:", loadedPages.length);
        loadedPages.forEach((p: any, i: number) => {
          console.log(`[DEBUG] Page ${i}:`, p.id, p.name, "components:", p.components?.length || 0);
        });

        setPages(loadedPages);
        setActivePageId(loadedPages[0].id);
        const initialComps = loadedPages[0].components || [];
        console.log("[DEBUG] Initial components count:", initialComps.length);
        console.log("[DEBUG] Components:", JSON.stringify(initialComps.slice(0, 2), null, 2));

        setHistory([{ components: cloneComponents(initialComps), timestamp: Date.now(), description: "Loaded" }]);
        setHistoryIndex(0);
        console.log("[DEBUG] Fetch Success - State initialized");
      } catch (err: any) {
        const msg = err?.response?.data?.error || "Failed to load website";
        console.error("[DEBUG] Fetch Error:", err?.response?.status, err?.response?.data || err.message);
        setError(msg);
        toast.error(msg);
      }
      setLoading(false);
    })();
  }, [projectId]);

  // Generate HTML for preview
  const previewHtml = useMemo(() => generateHtml(components), [components]);

  if (loading) return (
    <div className="h-screen bg-[#030712] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
    </div>
  );

  if (error) return (
    <div className="h-screen bg-[#030712] flex items-center justify-center flex-col gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <X className="w-6 h-6" />
      </div>
      <p className="text-sm text-gray-400">{error}</p>
      <p className="text-xs text-gray-600">Project ID: {projectId}</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-colors">Go Back</button>
    </div>
  );

  // Debug panel shown when components are empty
  if (!loading && components.length === 0) {
    return (
      <div className="h-screen bg-[#030712] flex items-center justify-center flex-col gap-4 p-8">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-300">No Components Loaded</h3>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-2 font-mono text-xs">
          <div className="text-purple-400 font-bold mb-3">🔍 Debug Panel</div>
          {[
            { label: "Project ID", value: projectId },
            { label: "Fetch Success", value: String(!loading && !error) },
            { label: "API Error", value: error || "none" },
            { label: "Pages Count", value: String(pages.length) },
            { label: "Components Count", value: String(components.length) },
            { label: "Pages Data", value: JSON.stringify(pages.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, comps: p.components?.length || 0 })), null, 2) },
          ].map(d => (
            <div key={d.label} className="flex justify-between gap-4">
              <span className="text-gray-500">{d.label}:</span>
              <span className="text-gray-300 text-right max-w-[60%] truncate">{d.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold transition-colors">
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#030712] text-gray-100 overflow-hidden selection:bg-purple-500/30"
      onKeyDown={e => {
        if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? handleRedo() : handleUndo(); }
        if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
        if (e.key === "Delete" && selectedId) { handleDelete(selectedId); }
      }}
      tabIndex={0}
    >
      <EditorToolbar
        device={device} onDeviceChange={setDevice}
        onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo}
        onSave={handleSave} saving={saving} saved={saved}
        preview={preview} onPreviewToggle={() => setPreview(p => !p)}
        showLayers={showLayers} onLayersToggle={() => setShowLayers(l => !l)}
        showPages={showPages} onPagesToggle={() => setShowPages(p => !p)}
        projectName={websiteName} onBack={() => navigate(-1)}
      />

      {preview ? (
        <PreviewMode html={previewHtml} device={device} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Pages or Components Panel */}
          <div className="w-52 border-r border-white/10 bg-black/20 shrink-0 overflow-hidden flex flex-col">
            {showPages ? (
              <PagesPanel pages={pages} activePageId={activePageId} websiteName={websiteName}
                onSwitchPage={handleSwitchPage} onAddPage={handleAddPage}
                onRenamePage={handleRenamePage} onDeletePage={handleDeletePage}
                onRenameWebsite={handleRenameWebsite} />
            ) : showLayers ? (
              <LayersPanel components={components} selectedId={selectedId} onSelect={handleSelect} onDelete={handleDelete} />
            ) : (
              <ComponentsPanel onAddComponent={handleAddComponent} />
            )}
          </div>

          {/* Center: Canvas with @dnd-kit */}
          <div className="flex-1 overflow-auto bg-gray-950" style={{ scrollbarWidth: "thin" }}
            onClick={() => setSelectedId(null)}
          >
            <div className="min-h-full flex items-start justify-center p-6">
              <div style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", minHeight: "calc(100vh - 100px)", transition: "width 0.3s" }}
                className="relative bg-transparent">
                {components.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-white/10 rounded-2xl p-8">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Canvas is empty</h3>
                    <p className="text-xs text-gray-600 max-w-xs mb-4">Click a component from the left panel to add it here.</p>
                    <div className="flex gap-2">
                      {["container", "heading", "button", "image"].map(t => (
                        <button key={t} onClick={() => handleAddComponent(t as ComponentType)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-purple-500/30 transition-colors">
                          + {COMPONENT_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter}
                    onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                      {components.map(comp => (
                        <SortableItem key={comp.id} component={comp} depth={0}
                          selectedId={selectedId} device={device} parentId="__root__"
                          onSelect={handleSelect} onUpdate={handleUpdateComponent} />
                      ))}
                    </SortableContext>
                    <DragOverlay>
                      {dragId ? (
                        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300">
                          Moving...
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>
            </div>
          </div>

          {/* Right: Styles Panel */}
          <div className="w-64 border-l border-white/10 bg-black/20 shrink-0 overflow-hidden flex flex-col">
            {selected ? (
              <StylesPanel component={selected} device={device} onUpdate={handleUpdateComponent} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-600 p-6 text-center">
                <div><Settings className="w-8 h-8 mx-auto mb-2 opacity-30" />Select a component to edit its styles</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="h-8 border-t border-white/10 bg-black/30 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-600">
            {components.length} component{components.length !== 1 ? "s" : ""}
          </span>
          {activePage && <span className="text-[10px] text-purple-400">{activePage.name}</span>}
          {selected && <span className="text-[10px] text-gray-500">· {COMPONENT_LABELS[selected.type]}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePublish} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-400 transition-colors">
            <Globe className="w-3 h-3" />Publish
          </button>
          <button onClick={handleDuplicate} disabled={!selected} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white disabled:opacity-30 transition-colors">
            <Copy className="w-3 h-3" />Duplicate
          </button>
          {selected && (
            <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors">
              <Trash2 className="w-3 h-3" />Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
