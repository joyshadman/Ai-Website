export type ComponentType =
  | 'container' | 'section' | 'row' | 'column'
  | 'heading' | 'text' | 'button' | 'image' | 'video' | 'icon'
  | 'divider' | 'spacer'
  | 'card' | 'testimonial' | 'faq' | 'pricing' | 'feature-grid'
  | 'hero' | 'navbar' | 'footer'
  | 'contact-form' | 'newsletter-form'
  | 'gallery' | 'slider' | 'carousel'
  | 'map' | 'code-block' | 'html-embed';

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface StyleProperties {
  margin?: string; padding?: string;
  width?: string; height?: string; maxWidth?: string; minWidth?: string; minHeight?: string;
  border?: string; borderRadius?: string; boxShadow?: string;
  opacity?: number;
  backgroundColor?: string; backgroundGradient?: string; backgroundImage?: string;
  backgroundSize?: string; backgroundPosition?: string;
  color?: string;
  fontFamily?: string; fontSize?: string; fontWeight?: string; fontStyle?: string;
  lineHeight?: string; letterSpacing?: string; textAlign?: string;
  display?: string; flex?: string; flexDirection?: string; alignItems?: string;
  justifyContent?: string; flexWrap?: string; gap?: string;
  gridTemplateColumns?: string; gridGap?: string;
  position?: string; top?: string; right?: string; bottom?: string; left?: string;
  zIndex?: number;
  overflow?: string; overflowX?: string; overflowY?: string;
  textDecoration?: string; textTransform?: string;
  backdropFilter?: string;
  cursor?: string;
  objectFit?: string;
  borderTop?: string; borderBottom?: string; borderLeft?: string; borderRight?: string;
}

export interface EditorComponent {
  id: string;
  type: ComponentType;
  name: string;
  props: Record<string, any>;
  styles: Record<Device, StyleProperties>;
  children: EditorComponent[];
  editable?: boolean;
  draggable?: boolean;
  deletable?: boolean;
  droppable?: boolean;
  hidden?: boolean;
}

export interface PageData {
  components: EditorComponent[];
  globalStyles?: StyleProperties;
  globalColors?: Record<string, string>;
  globalFonts?: Record<string, string>;
}

export interface HistoryEntry {
  components: EditorComponent[];
  timestamp: number;
  description: string;
}

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  category: 'structure' | 'content' | 'media' | 'widgets' | 'sections';
  defaultProps: Record<string, any>;
  defaultStyles: StyleProperties;
  defaultChildren?: EditorComponent[];
  allowedChildren?: ComponentType[];
  render: (props: Record<string, any>, styles: StyleProperties, children: React.ReactNode) => string;
}

export interface EditorState {
  components: EditorComponent[];
  selectedId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
  device: Device;
  preview: boolean;
  showLayers: boolean;
  showStyles: boolean;
  showComponents: boolean;
  dragging: { type: ComponentType; props: Record<string, any> } | null;
  dropIndex: { parentId: string; index: number } | null;
  clipboard: EditorComponent | null;
  saved: boolean;
  loading: boolean;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  components: EditorComponent[];
}

export interface Website {
  websiteId: string;
  name: string;
  pages: Page[];
  globalStyles?: StyleProperties;
}
