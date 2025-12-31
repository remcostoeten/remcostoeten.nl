# AnimatedNumber Implementations

| File | Line(s) | Usage Context | Value Type | Props |
|------|---------|---------------|------------|-------|
| **src/app/Test.tsx** | 265-270 | SectionHeading right text | `rightText` (number) | `duration`, `initialProgress={0}`, `className` |
| **src/components/blog/post-view.tsx** | 92 | Blog post date day | `dateParts.day` | `duration={500}`, `initialProgress={0}` |
| | 92 | Blog post date year | `dateParts.year` | `duration={500}`, `initialProgress={0}` |
| | 96 | Reading time minutes | `readTimeMinutes` | `duration={500}`, `initialProgress={0}` |
| | 102 | Unique views count | `uniqueViews` | `duration={500}`, `initialProgress={0}` |
| **src/components/blog/posts-client.tsx** | 15 | Post count header | `count` | `duration={500}`, `initialProgress={0}` |
| | 92 | Blog card index number | `formattedIndex` | `duration={1800-2400}` (staggered) |
| | 123 | Extra tags count | `+${extraTags}` | `duration={1800-2400}`, `initialProgress={0}` |
| | 131 | Blog card date day | `dayNumber` | `duration={1400-1800}` |
| | 138-140 | Reading time minutes | `readTimeMinutes` | `duration={1400-1800}` |
| | 148-151 | Unique views count | `post.uniqueViews` | `duration={1400-1800}` |
| **src/components/home/hero.tsx** | 30 | Years of experience | `8` | `duration={1500}`, `immediate`, `initialProgress={0.6}` |
| **src/components/landing/activity/contribution-graph.tsx** | 418 | Total contributions | `totalContributions.toLocaleString()` | `duration={2000}`, `delay={0}`, `animateOnMount` |
| | 418 | Year display | `year` | `duration={1800}`, `delay={200}`, `animateOnMount` |
| **src/components/landing/activity/section.tsx** | 27 | Activity section year | `year` | `duration={600}`, `delay={200}`, `initialProgress={0}` |
| **src/components/layout/footer.tsx** | 83 | Last commit time ago | `relativeTimeInfo.value` | `duration={600}`, `initialProgress={0}`, `className` |
| **src/components/providers/providers.tsx** | 11, 25 | Provider wrapper | N/A (Provider component) | N/A |
| **src/components/ui/work-experience.tsx** | 225 | Employment period year | `year` | `initialProgress={0}` |
| | 287 | Employment period year | `year` | `initialProgress={0}` |

## Summary:
- **Total files using AnimatedNumber**: 9 files
- **Total instances**: 16 usage instances
- **Common patterns**: Dates (years, days), statistics (views, counts), time-based values
- **Most common props**: `initialProgress={0}`, `duration` (varies 500-2400ms), `className` for styling
- **Special cases**: Provider wrapper, formatted strings with locale, staggered animations in blog cards
