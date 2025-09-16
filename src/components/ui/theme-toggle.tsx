import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

type Theme = "light" | "dark" | "system";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function ThemeToggle({
  className,
  showLabel = false,
  size = "md",
  variant = "ghost",
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    if (theme === "system") {
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", theme === "dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const root = document.documentElement;
        root.classList.toggle("dark", mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const cycleTheme = () => {
    setTheme((prev) => {
      switch (prev) {
        case "light":
          return "dark";
        case "dark":
          return "system";
        case "system":
          return "light";
        default:
          return "light";
      }
    });
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Sáng";
      case "dark":
        return "Tối";
      case "system":
        return "Hệ thống";
      default:
        return "Sáng";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-12 w-12";
      default:
        return "h-10 w-10";
    }
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          getSizeClasses(),
          "animate-pulse bg-gray-200 rounded-lg",
          className
        )}
      />
    );
  }

  return (
    <Button
      variant={variant}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      onClick={cycleTheme}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        getSizeClasses(),
        className
      )}
      aria-label={`Chuyển sang chế độ ${getLabel()}`}
    >
      {getIcon()}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">{getLabel()}</span>
      )}
    </Button>
  );
}

// Theme provider with context
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const currentTheme = theme === "system" ? systemTheme : theme;

    root.classList.toggle("dark", currentTheme === "dark");
    localStorage.setItem(storageKey, theme);
  }, [theme, systemTheme, mounted, storageKey]);

  const value = {
    theme,
    setTheme,
    systemTheme,
  };

  if (!mounted) {
    return <div className="animate-pulse">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Theme selector dropdown
interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ThemeSelector({
  className,
  showLabel = true,
  size = "md",
}: ThemeSelectorProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: "light", label: "Sáng", icon: Sun },
    { value: "dark", label: "Tối", icon: Moon },
    { value: "system", label: "Hệ thống", icon: Monitor },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm px-3 py-2";
      case "lg":
        return "text-lg px-6 py-4";
      default:
        return "text-base px-4 py-3";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        onClick={() => setIsOpen(!isOpen)}
        className={cn("justify-between", getSizeClasses())}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="h-4 w-4" />
          {showLabel && <span>{currentTheme?.label}</span>}
        </div>
        <svg
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-strong z-50">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                  theme === themeOption.value && "bg-blue-50 text-blue-700",
                  getSizeClasses()
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{themeOption.label}</span>
                {themeOption.value === "system" && (
                  <span className="text-xs text-gray-500 ml-auto">
                    ({systemTheme === "dark" ? "Tối" : "Sáng"})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Theme-aware component wrapper
interface ThemeAwareProps {
  children: React.ReactNode;
  lightClassName?: string;
  darkClassName?: string;
  className?: string;
}

export function ThemeAware({
  children,
  lightClassName,
  darkClassName,
  className,
}: ThemeAwareProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("animate-pulse", className)}>{children}</div>;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const themeClassName =
    currentTheme === "dark" ? darkClassName : lightClassName;

  return <div className={cn(themeClassName, className)}>{children}</div>;
}
