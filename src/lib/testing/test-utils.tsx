import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { UnifiedAuthProvider } from "../../contexts/UnifiedAuthContext";
import { ToastProvider } from "../../components/ui/toast";
import { NotificationProvider } from "../../components/ui/notification";
import { ErrorBoundary } from "../../components/ui/error-boundary";

/**
 * Comprehensive testing utilities for React components
 */

// Mock implementations
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock auth context
const mockAuthContext = {
  user: null,
  loading: false,
  isAuthenticated: false,
  subscriptionStatus: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshSession: jest.fn(),
  checkSubscription: jest.fn(),
};


// Mock theme context
const mockThemeContext = {
  theme: "light",
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

// Custom render function with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <UnifiedAuthProvider>
              <ToastProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </ToastProvider>
            </UnifiedAuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock API responses
export const mockApiResponses = {
  user: {
    id: "1",
    email: "test@example.com",
    fullName: "Test User",
    role: "sinh_vien",
    plan: "free",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  course: {
    id: "1",
    slug: "test-course",
    title: "Test Course",
    description: "A test course",
    level: "Beginner",
    domain: "Test Domain",
    year: 2024,
    tags: ["test"],
    ratingAvg: 4.5,
    ratingCount: 10,
    thumbnail: "/test-image.jpg",
    price: 100000,
    isHot: false,
    isPublished: true,
    instructorId: "1",
    duration: 120,
    lessons: 10,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  product: {
    id: "1",
    name: "Test Product",
    description: "A test product",
    price: 100000,
    category: "Test Category",
    tags: ["test"],
    images: ["/test-image.jpg"],
    stock: 10,
    isActive: true,
    sellerId: "1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  resource: {
    id: "1",
    title: "Test Resource",
    description: "A test resource",
    type: "document",
    category: "Test Category",
    tags: ["test"],
    fileUrl: "/test-file.pdf",
    fileSize: 1024000,
    mimeType: "application/pdf",
    isPublic: true,
    downloadCount: 0,
    uploaderId: "1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  post: {
    id: "1",
    title: "Test Post",
    content: "A test post content",
    excerpt: "A test post excerpt",
    slug: "test-post",
    tags: ["test"],
    category: "Test Category",
    featuredImage: "/test-image.jpg",
    isPublished: true,
    publishedAt: "2024-01-01T00:00:00.000Z",
    authorId: "1",
    viewCount: 0,
    likeCount: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
};

// Mock API functions
export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  upload: jest.fn(),
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window.location
export const mockLocation = {
  href: "http://localhost:3000",
  pathname: "/",
  search: "",
  hash: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock window.navigator
export const mockNavigator = {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  onLine: true,
  language: "en-US",
  languages: ["en-US", "en"],
  cookieEnabled: true,
  doNotTrack: "1",
  maxTouchPoints: 0,
};

// Mock performance API
export const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};

// Mock IntersectionObserver
export const mockIntersectionObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
};

// Mock ResizeObserver
export const mockResizeObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
};

// Mock fetch
export const mockFetch = jest.fn();

// Setup mocks
export const setupMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
  });

  // Mock location
  Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
  });

  // Mock navigator
  Object.defineProperty(window, "navigator", {
    value: mockNavigator,
    writable: true,
  });

  // Mock performance
  Object.defineProperty(window, "performance", {
    value: mockPerformance,
    writable: true,
  });

  // Mock IntersectionObserver
  Object.defineProperty(window, "IntersectionObserver", {
    value: jest.fn(() => mockIntersectionObserver),
    writable: true,
  });

  // Mock ResizeObserver
  Object.defineProperty(window, "ResizeObserver", {
    value: jest.fn(() => mockResizeObserver),
    writable: true,
  });

  // Mock fetch
  Object.defineProperty(window, "fetch", {
    value: mockFetch,
    writable: true,
  });

  // Mock console methods in test environment
  if (process.env.NODE_ENV === "test") {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  }
};

// Cleanup mocks
export const cleanupMocks = () => {
  jest.clearAllMocks();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
  mockSessionStorage.getItem.mockClear();
  mockSessionStorage.setItem.mockClear();
  mockSessionStorage.removeItem.mockClear();
  mockSessionStorage.clear.mockClear();
  mockApi.get.mockClear();
  mockApi.post.mockClear();
  mockApi.put.mockClear();
  mockApi.delete.mockClear();
  mockApi.upload.mockClear();
  mockFetch.mockClear();
};

// Test data factories
export const createMockUser = (overrides = {}) => ({
  ...mockApiResponses.user,
  ...overrides,
});

export const createMockCourse = (overrides = {}) => ({
  ...mockApiResponses.course,
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  ...mockApiResponses.product,
  ...overrides,
});

export const createMockResource = (overrides = {}) => ({
  ...mockApiResponses.resource,
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  ...mockApiResponses.post,
  ...overrides,
});

// Test utilities
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: "OK",
  headers: {},
  config: {},
});

export const mockApiError = (message = "API Error", status = 500) => {
  const error = new Error(message);
  (error as any).response = {
    data: { message },
    status,
    statusText: "Internal Server Error",
    headers: {},
  };
  return error;
};

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (received: any) => {
    const pass =
      received &&
      received.ownerDocument &&
      received.ownerDocument.body.contains(received);
    return {
      pass,
      message: () =>
        `Expected element ${pass ? "not " : ""}to be in the document`,
    };
  },
  toHaveClass: (received: any, className: string) => {
    const pass =
      received && received.classList && received.classList.contains(className);
    return {
      pass,
      message: () =>
        `Expected element ${pass ? "not " : ""}to have class "${className}"`,
    };
  },
  toHaveTextContent: (received: any, text: string) => {
    const pass =
      received && received.textContent && received.textContent.includes(text);
    return {
      pass,
      message: () =>
        `Expected element ${pass ? "not " : ""}to have text content "${text}"`,
    };
  },
};

// Export everything
export * from "@testing-library/react";
export { customRender as render };
export { AllTheProviders };
