# 🎨 Nam Long Center - Image Requirements

## 📸 Images needed for pages

### 1. HomePage Hero
- **Title**: "Nam Long Center - Education Platform"
- **Style**: Modern, tech-focused, dark theme
- **Colors**: Blue (#3B82F6), Purple (#9333EA), Pink (#EC4899)
- **Elements**: Abstract geometric shapes, gradients, BIM/CAD elements
- **Size**: 1920x1080px
- **Format**: WebP (optimized)
- **Prompt**: "Modern education technology platform hero image, dark background with blue purple pink gradient orbs, abstract geometric BIM elements, professional, 3D render style"

### 2. Khóa Học (Courses) Hero
- **Title**: "BIM & CAD Courses"
- **Style**: Professional learning environment
- **Elements**: Books, digital screens, 3D models
- **Size**: 1920x800px
- **Prompt**: "Professional BIM and CAD courses banner, modern classroom with holographic 3D building models, dark theme, blue gradient lighting"

### 3. Sản Phẩm (Products) Hero
- **Title**: "Construction Products & Tools"
- **Style**: Product showcase, modern catalog
- **Elements**: Digital tools, software interfaces
- **Size**: 1920x800px
- **Prompt**: "Modern construction software and tools showcase, dark sleek interface, product cards floating in 3D space, blue purple gradient"

### 4. Tài Nguyên (Resources) Hero
- **Title**: "Knowledge Resources Library"
- **Style**: Digital library, knowledge base
- **Elements**: Documents, files, digital archive
- **Size**: 1920x800px
- **Prompt**: "Digital knowledge library visualization, floating documents and files in dark space, organized grid pattern, blue glow effects"

### 5. Blog Hero
- **Title**: "Insights & Articles"
- **Style**: Editorial, content-focused
- **Elements**: Article cards, reading material
- **Size**: 1920x800px
- **Prompt**: "Modern blog platform hero image, floating article cards with preview text, dark background, gradient accents, clean typography"

### 6. Giới Thiệu (About) Hero
- **Title**: "About Nam Long Center"
- **Style**: Company story, professional
- **Elements**: Building silhouettes, team collaboration
- **Size**: 1920x800px
- **Prompt**: "Professional company about page hero, abstract building construction visualization, team collaboration elements, blue purple gradient, modern corporate"

### 7. Hợp Tác (Partnership) Hero
- **Title**: "Partner With Us"
- **Style**: Collaboration, networking
- **Elements**: Connected nodes, partnership symbols
- **Size**: 1920x800px
- **Prompt**: "Business partnership network visualization, connected nodes and lines, handshake symbolism, dark theme with blue gradient glow"

### 8. Pricing Hero
- **Title**: "Pricing Plans"
- **Style**: Clean, comparison-focused
- **Elements**: Plan cards, pricing tiers
- **Size**: 1920x800px
- **Prompt**: "Pricing plans showcase, three tier cards floating in 3D space, dark background, gradient borders, professional business style"

## 🎨 Design Guidelines

### Color Palette
```css
Primary Blue:    #3B82F6
Purple:          #9333EA
Pink:            #EC4899
Dark BG:         #000000
Glass Effect:    rgba(255,255,255,0.05)
Glow:            rgba(59,130,246,0.2)
```

### Style Requirements
- **Theme**: Dark mode (black background)
- **Effects**: Glass morphism, gradient orbs, subtle glow
- **Quality**: High resolution, optimized for web
- **Format**: WebP for performance, PNG fallback
- **Accessibility**: Adequate contrast ratios

## 🚀 How to Generate Images

### Using AI Tools (DALL-E, Midjourney, Stable Diffusion)
1. Use the prompts provided above
2. Add suffix: "dark theme, professional, high quality, 3D render, ultra detailed"
3. Export in highest quality
4. Optimize with tools like Squoosh or ImageOptim

### Using Human MCP (Recommended)
```bash
# Install human-mcp
npm install -g @anthropic-ai/mcp-human

# Generate images
mcp-human generate-image \
  --prompt "Modern education technology platform hero image..." \
  --output "public/images/hero/homepage.webp" \
  --width 1920 \
  --height 1080
```

### Placeholders (Current)
For now, we're using:
- Gradient backgrounds with orbs
- CSS-generated patterns
- SVG illustrations
- Lucide icons

## 📁 File Structure
```
public/
└── images/
    ├── hero/
    │   ├── homepage.webp
    │   ├── courses.webp
    │   ├── products.webp
    │   ├── resources.webp
    │   ├── blog.webp
    │   ├── about.webp
    │   ├── partnership.webp
    │   └── pricing.webp
    ├── features/
    │   └── [feature-icons]
    └── logos/
        ├── logo.svg
        ├── logo-light.svg
        └── favicon.png
```

## 🎯 Implementation Priority

1. **High Priority** (User-facing)
   - [ ] HomePage hero
   - [ ] Khóa Học hero
   - [ ] Sản Phẩm hero

2. **Medium Priority**
   - [ ] Tài Nguyên hero
   - [ ] Blog hero
   - [ ] Giới Thiệu hero

3. **Low Priority**
   - [ ] Hợp Tác hero
   - [ ] Pricing hero
   - [ ] Feature icons

## 💡 Alternative: CSS Gradients
Currently using CSS-generated visuals:
```tsx
<div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
<div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
```

This provides:
- Zero load time
- Perfect dark theme match
- Fully customizable
- No image optimization needed

---

**Note**: Images are optional. The current design with gradient orbs and glass morphism looks professional without images. Add images later for enhanced visual appeal.
