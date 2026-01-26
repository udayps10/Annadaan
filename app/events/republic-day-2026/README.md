# Republic Day 2026 - Post-Event Impact Report

## Overview
This page serves as a **post-event transparency and impact showcase** for the Republic Day 2026 donation drive. It is NOT a donation campaign page, but rather a documentary-style accountability report.

## Design Philosophy

### Visual Direction
- **Premium, calm aesthetic** - No loud colors or aggressive CTAs
- **Documentary tone** - Factual, transparent, trustworthy
- **Generous whitespace** - Content breathes, easy scanning
- **Subtle motion** - Fade + translateY reveals, respects reduced-motion
- **Portrait-first media** - Mobile camera formats preserved

### Typography Hierarchy
- Large, light headings (font-weight: 300)
- Plenty of line-height for readability
- Neutral color palette (neutral-50 to neutral-900)
- No emojis or playful language

## Page Structure

### 1. Hero Section
- Full-height viewport
- Minimal gradient background with low opacity image
- Large, light typography
- Subtle scroll indicator
- Parallax effect on scroll (hero fades/scales out)

### 2. Event Recap
- Narrative description of what occurred
- Timeline highlights in grid layout
- Border-left accent for data points
- Staggered fade-in animations

### 3. Portrait Media Showcase
- Swiper.js carousel optimized for portrait (3:4 aspect ratio)
- Responsive breakpoints (1 → 2 → 3 → 4 columns)
- Click to open full-screen lightbox
- Subtle hover scale effect
- Custom minimal navigation buttons

### 4. Impact Statistics
- Four key metrics with animated counters
- Light typography (font-weight: 300)
- Counter animates once when scrolling into view
- Clean, undecorated presentation

### 5. Fund Utilization Breakdown
- Card-based layout with category/amount/purpose
- Total expenditure highlighted in dark card
- No charts - prioritizes readability
- Clean borders, minimal shadows

### 6. Transaction Transparency
- List of verified transactions with IDs
- "View Receipt" modal functionality
- Disclaimer about redacted personal details
- Monospace font for transaction IDs

### 7. Closing Statement
- Dark background (neutral-900)
- Large, light typography
- Minimal footer link back to main site
- No donation CTA

## Technical Implementation

### Dependencies
```json
{
  "framer-motion": "^12.23.12",
  "react-intersection-observer": "^9.16.0",
  "swiper": "^11.x",
  "yet-another-react-lightbox": "^3.x"
}
```

### Key Components
- **Counter**: Animated number counter using requestAnimationFrame
- **RevealSection**: Scroll-triggered visibility wrapper using useInView
- **Lightbox**: Full-screen media viewer with keyboard navigation
- **Receipt Modal**: Transaction receipt preview with backdrop blur

### Animation Approach
- All animations respect `prefers-reduced-motion`
- Fade + translateY (40px) for reveals
- Cubic bezier easing: `[0.22, 1, 0.36, 1]` (slow, intentional)
- Counter duration: 2 seconds
- Stagger children: 0.1-0.2s delay
- Intersection observer: `-100px` margin for early trigger

### Responsive Behavior
- Mobile-first approach
- Portrait media preserved (no cropping)
- Breakpoints: 640px, 1024px, 1280px
- Touch-friendly tap targets (min 44px)
- Swiper navigation hidden on mobile

## Data Structure

### Mock Data Location
All event data is defined in the component file under `eventData` object:
- `hero`: Title, subtitle, description, date, location
- `recap`: Event narrative and highlights
- `impact`: Key statistics (funds, meals, volunteers, families)
- `fundUtilization`: Array of expenditure categories
- `media`: Array of photo/video objects
- `transactions`: Array of verified transactions

### Integration Points
To connect to real data:
1. Replace `eventData` with API fetch in `useEffect`
2. Update media paths to actual CDN URLs
3. Connect receipt modal to document viewer
4. Add actual transaction receipts (PDF/image)

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support (lightbox, modals)
- Focus management in modals
- Reduced motion support
- High contrast text (WCAG AA compliant)
- Touch target sizes (min 44x44px)

## Performance Considerations

- Images should be optimized (WebP format)
- Lazy loading for media (Swiper built-in)
- Intersection observer for animation triggers
- No layout shift (aspect ratios defined)
- Minimal bundle size (tree-shaking)

## Content Guidelines

### Writing Style
- Factual, documentary tone
- Third-person narrative
- Precise numbers, no rounding
- Dates in consistent format
- No marketing language
- Transparent about limitations

### Image Requirements
- Portrait orientation preferred (9:16 or 3:4)
- Minimum 1080px height
- Show faces, human impact
- Document the process
- Include receipts/invoices
- Respect privacy (blur if needed)

## Future Enhancements

- [ ] Add video testimonials section
- [ ] Interactive fund allocation chart
- [ ] Download PDF impact report button
- [ ] Share to social media functionality
- [ ] Compare to previous events
- [ ] Add volunteer testimonials
- [ ] Timeline visualization
- [ ] Before/after photo comparisons

## Maintenance Notes

- Update `eventData` with actual figures post-event
- Replace placeholder images with real media
- Upload transaction receipts to CDN
- Test on various devices (especially portrait phones)
- Validate accessibility with screen reader
- Check performance score (Lighthouse)
- Monitor bundle size after adding real images

---

**Last Updated**: January 26, 2026  
**Designer**: Annadaan Team  
**Status**: Post-Event Documentation
