# ElektroPolis Malta - Brand Identity & Marketing Guide

## 1. Brand Overview

**ElektroPolis** is Malta and Gozo's premier home appliance retailer, offering premium European brands at massively discounted prices. The brand positions itself as the bridge between luxury and accessibility — delivering showroom-quality products without the showroom-quality price tag.

**Tagline**: _Premium Appliances, Unbeatable Prices_

**Mission**: To make top European home appliances accessible to every household in Malta and Gozo, backed by expert support and free delivery.

---

## 2. Brand Values

| Value | Expression |
|-------|-----------|
| **Accessibility** | Free delivery across all of Malta & Gozo, no minimum spend |
| **Quality** | Only established European brands (Deante, Grundig, Edesa, Blomberg, Midea) |
| **Expertise** | Dedicated support team, installation guidance, after-sales care |
| **Mediterranean Heritage** | Rooted in Gozo, designed for Maltese homes and climate |
| **Transparency** | Clear pricing, honest stock levels, straightforward shopping |

---

## 3. Visual Identity

### 3.1 Color Palette

#### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **ElektroPolis Orange** | `#FF580D` | 255, 88, 13 | Primary brand color, CTAs, accents, links |
| **Orange Hover** | `#E54D0B` | 229, 77, 11 | Button hover states |
| **Orange Light** | `#FFF0E8` | 255, 240, 232 | Subtle backgrounds, hover highlights |

#### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Charcoal** | `#2A2B2A` | 42, 43, 42 | Primary text, headings, dark surfaces |
| **Muted** | `#8A8A86` | 138, 138, 134 | Secondary text, descriptions, captions |
| **Surface** | `#F7F7F5` | 247, 247, 245 | Card backgrounds, section backgrounds |
| **Warm White** | `#FDFCFA` | 253, 252, 250 | Page backgrounds, subtle warmth |
| **White** | `#FFFFFF` | 255, 255, 255 | Base background |
| **Border** | `#E8E8E4` | 232, 232, 228 | Dividers, card borders, separators |

#### Feedback Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#2D8A4E` | In-stock indicators, confirmations |
| **Error** | `#C4122F` | Errors, sold out badges, validation |

#### Overlay

| Name | Value | Usage |
|------|-------|-------|
| **Overlay** | `rgba(42, 43, 42, 0.6)` | Hero overlays, modals, drawers |

### Color Usage Rules

1. **Orange is for action**: Buttons, links, price highlights, and interactive elements
2. **Charcoal is for content**: Headings, body text, navigation
3. **Surface/Warm White for depth**: Layer cards and sections with subtle warm backgrounds
4. **Never use pure black** (`#000000`): Always use Charcoal (`#2A2B2A`) for text
5. **Orange on dark surfaces**: Use `#FF580D` on charcoal backgrounds for CTAs in dark sections
6. **Maximum contrast**: Ensure all text meets WCAG AA standards (4.5:1 ratio minimum)

### 3.2 Typography

**Primary Font**: DM Sans (Google Fonts)

| Element | Weight | Size | Tracking |
|---------|--------|------|----------|
| **H1 (Hero)** | Bold (700) | 40px / 52px / 64px (mobile/tablet/desktop) | Tight (-0.02em) |
| **H2 (Section)** | Bold (700) | 28px / 34px | Tight (-0.02em) |
| **H3 (Card title)** | Semibold (600) | 16px | Normal |
| **Body** | Regular (400) | 15px | Normal |
| **Caption** | Regular (400) | 13px-14px | Normal |
| **Button** | Semibold (600) | 14px-15px | Normal |
| **Badge/Tag** | Semibold (600) | 11px | Wide (0.18em), Uppercase |

**Fallback Stack**: `"DM Sans", system-ui, sans-serif`

### Typography Rules

1. **Headings**: Always bold or semibold, charcoal color, tight tracking
2. **Body text**: Regular weight, muted color for secondary, charcoal for primary
3. **Maximum heading length**: Keep headlines under 8 words where possible
4. **Line height**: 1.05 for heroes, 1.4-1.6 for body text
5. **No italic for emphasis**: Use semibold weight or orange color instead

### 3.3 Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| **Max content width** | 1400px | Page content container |
| **Page padding** | 20px mobile / 32px desktop | Horizontal padding |
| **Section vertical padding** | 80px mobile / 96px desktop | Between major sections |
| **Card gap** | 16px mobile / 20px desktop | Grid gaps |
| **Card padding** | 24px mobile / 32px desktop | Internal card padding |
| **Border radius (card)** | 12px (rounded-xl) | Cards, images, containers |
| **Border radius (button)** | 8px (rounded-lg) | Buttons, inputs |
| **Border radius (badge)** | 9999px (rounded-full) | Tags, badges, pills |

### 3.4 Iconography

**Library**: Lucide React (consistent stroke-based icons)

| Setting | Value |
|---------|-------|
| **Default stroke width** | 1.5 |
| **Button icon stroke** | 2 |
| **Icon size (small)** | 16px (w-4 h-4) |
| **Icon size (default)** | 20px (w-5 h-5) |
| **Icon size (large)** | 24px (w-6 h-6) |
| **Color** | Inherits text color, transitions on hover |

### 3.5 Photography Style

All product and marketing photography should follow these guidelines:

**Setting**: Modern Mediterranean homes — warm natural light, limestone/sandstone accents, clean interiors

**Lighting**: Warm, natural, golden-hour feel. Never cold/blue-toned. Soft shadows, never harsh.

**Composition**: Product as hero, generous whitespace, shallow depth of field for lifestyle shots.

**Background**: Clean and minimal. Use warm white, natural stone, or subtle wood textures.

**Props**: Minimal — a plant, fresh fruit, clean towels. Never cluttered.

**Mood**: Aspirational but achievable. The viewer should think "I want this in my home."

**Do Not**: Include text overlays, watermarks, busy backgrounds, or people.

---

## 4. UI Component Patterns

### 4.1 Buttons

**Primary (CTA):**
- Background: `#FF580D`, hover: `#E54D0B`
- Text: White, 15px semibold
- Height: 52px (h-13), Padding: 32px horizontal
- Border radius: 8px
- With arrow icon on "shop" actions

**Secondary (Outline):**
- Border: `#E8E8E4` or `white/20` on dark
- Text: Charcoal or white
- Same dimensions as primary

**Text Link:**
- Color: `#FF580D`
- No underline by default, underline on hover
- 14px font weight medium

### 4.2 Cards

**Product Card:**
- White background with `#E8E8E4` border
- 12px border radius
- Image fills top, 4:3 aspect ratio
- Hover: subtle shadow lift, image scale 1.05
- Price in charcoal, compare-at-price in muted with strikethrough

**Category Card:**
- Full-bleed image with gradient overlay
- Text overlaid at bottom: white title + description
- Hover: slight scale, orange accent appears
- 12px border radius

### 4.3 Badges & Tags

| Type | Background | Text | Example |
|------|-----------|------|---------|
| In Stock | `#2D8A4E/10%` | `#2D8A4E` | "In Stock" |
| Low Stock | `#FF580D/10%` | `#FF580D` | "Low Stock" |
| Sold Out | `#C4122F/10%` | `#C4122F` | "Sold Out" |
| Sale | `#FF580D` | White | "-20%" |
| Category tag | `#F7F7F5` | `#8A8A86` | "Kitchen" |

---

## 5. Voice & Tone

### Brand Voice

| Attribute | Description | Example |
|-----------|------------|---------|
| **Direct** | No filler words, get to the point | "Free delivery. Every order." not "We are pleased to offer complimentary delivery on all orders" |
| **Warm** | Friendly without being casual | "Need help choosing?" not "Hey there!" |
| **Confident** | State facts, don't hedge | "Unbeatable prices" not "We try to offer competitive pricing" |
| **Expert** | Knowledgeable but not jargon-heavy | "Energy-efficient A+++ rated" not "Leveraging cutting-edge thermodynamic efficiency" |

### Headline Patterns

- **Category pages**: Simple noun phrase — "Kitchen Sinks", "Cooker Hoods"
- **Value props**: Benefit-first — "Free Delivery", "Expert Support"
- **CTAs**: Action verb — "Shop All Products", "Contact Us", "Visit Our Showroom"
- **Product titles**: Brand + Model + Key Feature — "Deante ZEL_3113 Legato Sink, 1-Bowl with Drainer"

### Copy Rules

1. Use "Malta & Gozo" not "the Maltese Islands"
2. Prices always in EUR with euro sign: "€140.00"
3. Phone format: "(+356) 9921 3791"
4. Address format: "Street, Town, Postcode, Gozo, Malta"
5. Avoid superlatives without justification ("the best" needs proof)
6. Use "premium" and "quality" sparingly — let product specs speak

---

## 6. Category Marketing

### Category Card Imagery

Each category has a bespoke AI-generated hero image stored in Supabase Storage at:
`/storage/v1/object/public/site-assets/category-banners/{slug}.{ext}`

| Category | Image Style | Key Elements |
|----------|------------|--------------|
| Kitchen Sinks | Overhead or 3/4 angle of installed sink | Limestone counter, natural light, olive branch |
| Sink Mixers | Close-up hero shot of tap | Chrome/matte finish, running water detail |
| Cooker Hoods | Kitchen scene with illuminated hood | LED strip glow, professional range below |
| Washing Machines | Laundry room lifestyle | White machine, fresh towels, bright daylight |
| Air Treatment | Living room with wall-mounted AC | Mediterranean interior, arched doorway, blue sky |
| Refrigeration | Kitchen with statement fridge | Stainless steel, warm wood, fresh produce |

### Generation Guidelines (NanoBanana Pro)

When regenerating category images:
- **Model**: Gemini Flash or Pro via Vertex AI
- **Aspect Ratio**: 4:3 for category cards
- **Style**: Mediterranean lifestyle photography, warm tones
- **Always include**: "No people, no text overlays, 4K photorealistic"
- **Upload to**: `site-assets/category-banners/` in Supabase Storage

---

## 7. Email & Communication Templates

### Order Confirmation Email
- Subject: "Your ElektroPolis Order #{order_number}"
- From: orders@elektropolis.mt
- Tone: Warm, confirmatory, includes order summary
- CTA: "Track your order" (link to order status page)

### Shipping Notification
- Subject: "Your order is on its way!"
- Include: Delivery timeframe ("1-3 working days for Malta, 2-4 for Gozo")

### Contact Form Auto-Reply
- Subject: "We received your message"
- Tone: Appreciative, sets expectation ("We'll get back to you within 24 hours")

---

## 8. Social Media Guidelines

### Platform Focus
- **Facebook**: Primary channel (Malta market is Facebook-heavy)
- **Instagram**: Product photography, lifestyle shots, kitchen inspiration
- **TikTok**: Appliance tips, unboxing, before/after installations

### Content Pillars

1. **Product Spotlights** (40%): Hero product images, new arrivals, price drops
2. **Home Inspiration** (25%): Room setups, kitchen makeovers, design tips
3. **Deals & Promotions** (20%): Flash sales, seasonal offers, bundle deals
4. **Community** (15%): Customer stories, Gozo lifestyle, behind the scenes

### Image Specs

| Platform | Size | Format |
|----------|------|--------|
| Facebook post | 1200 x 630px | 1.91:1 |
| Instagram feed | 1080 x 1080px | 1:1 |
| Instagram Stories | 1080 x 1920px | 9:16 |
| Website banner | 1400 x 400px | 21:9 |
| Category card | 800 x 600px | 4:3 |
| Product card | 800 x 800px | 1:1 |

---

## 9. Print & Physical Materials

### Showroom Signage
- Primary color: Charcoal background with orange accents
- Font: DM Sans Bold for headers
- Include: Phone number, website URL, "Free Delivery" badge

### Business Cards
- Front: ElektroPolis logo, name, title
- Back: Contact details, "Visit our Victoria showroom"
- Colors: White card, charcoal text, orange accent line

### Delivery Packaging
- Branded tape or sticker with ElektroPolis orange
- "Thank you" card inside with care instructions
- QR code linking to product support page

---

## 10. Quick Reference

```
Brand:     ElektroPolis Malta
Font:      DM Sans (400, 600, 700)
Primary:   #FF580D (orange)
Text:      #2A2B2A (charcoal)
Secondary: #8A8A86 (muted)
Surface:   #F7F7F5
Border:    #E8E8E4
Success:   #2D8A4E
Error:     #C4122F
Radius:    12px cards, 8px buttons
Max Width: 1400px
Phone:     (+356) 9921 3791
Email:     info@elektropolis.mt
Address:   Triq Kercem, Victoria, VCT9055, Gozo
Website:   elektropolis.mt
```
