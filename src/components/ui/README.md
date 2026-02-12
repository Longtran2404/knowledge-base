# UI Components Library

Thư viện component UI hiện đại cho dự án Knowledge Base, được xây dựng với React, TypeScript và Tailwind CSS.

## 🚀 Tính năng chính

- **Responsive Design**: Tất cả component đều responsive và tối ưu cho mobile
- **Accessibility**: Hỗ trợ đầy đủ ARIA attributes và keyboard navigation
- **Dark Mode**: Hỗ trợ chế độ tối với theme switching
- **Animations**: Các animation mượt mà và hiện đại
- **TypeScript**: Type safety hoàn toàn
- **Customizable**: Dễ dàng tùy chỉnh với className props

## 📦 Components

### Core Components

#### Button

```tsx
import { Button } from "./ui/button";

<Button variant="primary" size="lg">
  Click me
</Button>;
```

#### Input

```tsx
import { Input } from "./ui/input";

<Input placeholder="Enter text..." />;
```

#### Card

```tsx
import { Card, CardContent, CardHeader } from "./ui/card";

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>;
```

### Advanced Components

#### Loading

```tsx
import { Loading, FullPageLoading, Skeleton } from './ui/loading';

<Loading size="lg" variant="spinner" text="Loading..." />
<FullPageLoading text="Please wait..." />
<Skeleton className="h-4 w-full" />
```

#### Modal

```tsx
import { Modal, ConfirmModal, AlertModal } from './ui/modal';

<Modal isOpen={isOpen} onClose={onClose} title="Modal Title">
  Content here
</Modal>

<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirm Action"
  description="Are you sure?"
/>
```

#### Toast & Notifications

```tsx
import { useNotifications, useNotificationHelpers } from "./ui/notification";

const { addNotification } = useNotifications();
const { success, error, warning, info } = useNotificationHelpers();

// Add notification
addNotification({
  title: "Success!",
  message: "Operation completed",
  type: "success",
});

// Or use helpers
success("Success!", "Operation completed");
error("Error!", "Something went wrong");
```

#### Search

```tsx
import { Search } from "./ui/search";

<Search
  placeholder="Search..."
  onSearch={handleSearch}
  results={searchResults}
  onResultClick={handleResultClick}
  suggestions={suggestions}
  recentSearches={recentSearches}
/>;
```

#### Carousel

```tsx
import { Carousel, ImageCarousel, CardCarousel } from './ui/carousel';

<Carousel autoPlay={true} showDots={true}>
  {items.map(item => <div key={item.id}>{item.content}</div>)}
</Carousel>

<ImageCarousel
  images={images}
  autoPlay={true}
  onImageClick={handleImageClick}
/>
```

#### Tabs

```tsx
import { Tabs, AnimatedTabs, VerticalTabs } from "./ui/tabs-enhanced";

<Tabs items={tabItems} variant="pills" onTabChange={handleTabChange} />;
```

#### Accordion

```tsx
import { Accordion, AccordionItem, FAQAccordion } from "./ui/accordion";

<Accordion>
  <AccordionItem title="Section 1">Content 1</AccordionItem>
  <AccordionItem title="Section 2">Content 2</AccordionItem>
</Accordion>;
```

#### Progress

```tsx
import { Progress, CircularProgress, StepProgress } from './ui/progress';

<Progress value={75} max={100} variant="success" />
<CircularProgress value={60} size={120} showLabel={true} />
<StepProgress steps={steps} currentStep={2} />
```

#### Tooltip

```tsx
import { Tooltip, SimpleTooltip, RichTooltip } from './ui/tooltip';

<Tooltip content="Tooltip content" placement="top">
  <button>Hover me</button>
</Tooltip>

<SimpleTooltip text="Simple tooltip">
  <span>Hover me</span>
</SimpleTooltip>
```

### Utility Components

#### ScrollToTop

```tsx
import { ScrollToTop, ScrollToTopWithProgress, FloatingScrollToTop } from './ui/scroll-to-top';

<ScrollToTop threshold={300} />
<ScrollToTopWithProgress threshold={300} />
<FloatingScrollToTop threshold={300} />
```

#### Theme Toggle

```tsx
import { ThemeToggle, ThemeSelector, ThemeProvider } from './ui/theme-toggle';

<ThemeToggle showLabel={true} size="md" />
<ThemeSelector showLabel={true} />
```

#### Accessibility

```tsx
import {
  FocusTrap,
  SkipToContent,
  ScreenReaderOnly,
  useHighContrast,
  useReducedMotion,
  useAnnouncer
} from './ui/accessibility';

<FocusTrap active={isModalOpen}>
  <div>Modal content</div>
</FocusTrap>

<SkipToContent targetId="main-content" />
<ScreenReaderOnly>Hidden text for screen readers</ScreenReaderOnly>
```

#### Lazy Loading

```tsx
import {
  LazyLoad,
  LazyImage,
  LazyComponent,
  VirtualList,
  useInfiniteScroll
} from './ui/lazy-loading';

<LazyLoad fallback={<Loading />}>
  <ExpensiveComponent />
</LazyLoad>

<LazyImage
  src="/image.jpg"
  alt="Description"
  placeholder="data:image/svg+xml;base64,..."
/>
```

## 🎨 Styling

### CSS Variables

Các component sử dụng CSS variables để dễ dàng tùy chỉnh:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

### Custom Classes

Sử dụng các utility classes đã được định nghĩa:

```tsx
<div className="shadow-soft hover:shadow-medium transition-all duration-300">
  <h1 className="gradient-text text-shadow-lg">Title</h1>
  <p className="animate-fade-in-up animation-delay-200">Content</p>
</div>
```

## 🔧 Customization

### Theme Customization

```tsx
// Custom theme colors
const customTheme = {
  colors: {
    primary: "your-primary-color",
    secondary: "your-secondary-color",
  },
};
```

### Component Customization

```tsx
<Button
  className="custom-button-class"
  style={{ "--button-color": "red" } as React.CSSProperties}
>
  Custom Button
</Button>
```

## 📱 Responsive Design

Tất cả component đều responsive với breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## ♿ Accessibility

### ARIA Support

- Tất cả interactive elements đều có proper ARIA attributes
- Keyboard navigation được hỗ trợ đầy đủ
- Screen reader friendly

### Focus Management

```tsx
import { FocusTrap } from "./ui/accessibility";

<FocusTrap active={isOpen}>
  <ModalContent />
</FocusTrap>;
```

### High Contrast Support

```tsx
import { useHighContrast } from "./ui/accessibility";

const isHighContrast = useHighContrast();
```

## 🚀 Performance

### Lazy Loading

```tsx
import { LazyLoad } from "./ui/lazy-loading";

<LazyLoad threshold={0.1}>
  <ExpensiveComponent />
</LazyLoad>;
```

### Virtual Scrolling

```tsx
import { VirtualList } from "./ui/lazy-loading";

<VirtualList
  items={largeList}
  itemHeight={50}
  containerHeight={400}
  renderItem={(item, index) => <ItemComponent item={item} />}
/>;
```

## 🎯 Best Practices

1. **Always use TypeScript**: Tất cả props đều có type definitions
2. **Accessibility first**: Luôn test với screen readers
3. **Mobile first**: Design cho mobile trước, desktop sau
4. **Performance**: Sử dụng lazy loading cho heavy components
5. **Consistency**: Sử dụng design system đã định nghĩa

## 📚 Examples

Xem thêm examples trong thư mục `examples/` để hiểu cách sử dụng các component.

## 🤝 Contributing

Khi thêm component mới:

1. Tạo file trong thư mục `ui/`
2. Export component và types
3. Thêm vào file `index.ts`
4. Cập nhật README này
5. Viết tests nếu cần

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
