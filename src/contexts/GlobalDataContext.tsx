/**
 * Global Data Context - Quản lý và đồng bộ dữ liệu giữa các trang
 * Tránh duplicate queries và conflicts
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { supabase, NLCUserFile, Course, Product } from "../lib/supabase-config";
import { useAuth } from "./UnifiedAuthContext";
import { toast } from "sonner";

const TIMEOUT_TOAST_COOLDOWN_MS = 5000; // Chỉ hiển thị 1 toast timeout mỗi 5s (tránh trùng)

interface GlobalDataState {
  // Files (Upload page)
  userFiles: NLCUserFile[];
  filesLoading: boolean;

  // Courses (Marketplace, KhoaHoc pages)
  courses: Course[];
  coursesLoading: boolean;

  // Products (Products page)
  products: Product[];
  productsLoading: boolean;

  // Public files (Library page)
  publicFiles: NLCUserFile[];
  publicFilesLoading: boolean;

  // Last sync times
  lastSync: {
    files: Date | null;
    courses: Date | null;
    products: Date | null;
    publicFiles: Date | null;
  };
}

interface GlobalDataContextType extends GlobalDataState {
  // Refresh functions
  refreshUserFiles: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshPublicFiles: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Add functions
  addUserFile: (file: NLCUserFile) => void;
  addCourse: (course: Course) => void;
  addProduct: (product: Product) => void;

  // Update functions
  updateUserFile: (id: string, updates: Partial<NLCUserFile>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;

  // Delete functions
  deleteUserFile: (id: string) => void;
  deleteCourse: (id: string) => void;
  deleteProduct: (id: string) => void;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT_MS = 15000; // 15s - đủ cho mạng chậm, tránh toast lỗi
const LOADING_DELAY_MS = 100; // Chỉ bật skeleton sau 100ms để first paint nhanh

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();
  const lastTimeoutToastRef = useRef<number>(0);

  const showTimeoutToast = useCallback((message: string) => {
    const now = Date.now();
    if (now - lastTimeoutToastRef.current < TIMEOUT_TOAST_COOLDOWN_MS) return;
    lastTimeoutToastRef.current = now;
    toast.error(message);
  }, []);

  const [state, setState] = useState<GlobalDataState>({
    userFiles: [],
    filesLoading: false,
    courses: [],
    coursesLoading: false,
    products: [],
    productsLoading: false,
    publicFiles: [],
    publicFilesLoading: false,
    lastSync: {
      files: null,
      courses: null,
      products: null,
      publicFiles: null,
    },
  });

  // Check if cache is still valid
  const isCacheValid = useCallback((lastSyncTime: Date | null) => {
    if (!lastSyncTime) return false;
    return Date.now() - lastSyncTime.getTime() < CACHE_DURATION;
  }, []);

  // Refresh user files
  const refreshUserFiles = useCallback(async () => {
    if (!userProfile?.id) return;

    // Use cache if valid
    if (isCacheValid(state.lastSync.files)) {
      console.log("Using cached user files");
      return;
    }

    setState(prev => ({ ...prev, filesLoading: true }));
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("nlc_user_files")
          .select("*")
          .eq("user_id", userProfile.id)
          .order("created_at", { ascending: false }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT_MS)
        )
      ]) as any;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        userFiles: data || [],
        filesLoading: false,
        lastSync: { ...prev.lastSync, files: new Date() }
      }));
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "Timeout";
      const e = err as { message?: string; code?: string; details?: string; error?: { message?: string } };
      const msg = err instanceof Error ? err.message : (e?.message ?? e?.error?.message);
      const code = e?.code;
      const msgStr = typeof msg === "string" ? msg : "";
      const isTableMissing = /schema cache|Could not find the table|relation.*does not exist|nlc_user_files/i.test(msgStr);
      const isRlsRecursion = /infinite recursion.*policy/i.test(msgStr);
      if (isTableMissing || isRlsRecursion) {
        setState(prev => ({ ...prev, userFiles: [], filesLoading: false }));
        return;
      }
      console.error("Error loading user files:", msg ?? code ?? e?.details ?? (typeof err === "object" ? JSON.stringify(err) : String(err)), code != null ? { code } : "");
      if (isTimeout) showTimeoutToast("Tải danh sách file quá lâu. Vui lòng thử lại.");
      setState(prev => ({ ...prev, filesLoading: false }));
    }
  }, [userProfile?.id, state.lastSync.files, isCacheValid, showTimeoutToast]);

  // Refresh courses (delayed loading + retry khi timeout)
  const refreshCourses = useCallback(async () => {
    if (isCacheValid(state.lastSync.courses)) {
      console.log("Using cached courses");
      return;
    }

    const loadingTimer = setTimeout(() => {
      setState(prev => ({ ...prev, coursesLoading: true }));
    }, LOADING_DELAY_MS);

    const doFetch = () =>
      Promise.race([
        supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT_MS))
      ]) as Promise<{ data: any; error: any }>;

    try {
      const result = await doFetch();
      if (result.error) throw result.error;

      clearTimeout(loadingTimer);
      setState(prev => ({
        ...prev,
        courses: result.data || [],
        coursesLoading: false,
        lastSync: { ...prev.lastSync, courses: new Date() }
      }));
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "Timeout";
      if (isTimeout) {
        try {
          const retry = await doFetch();
          if (!retry.error) {
            clearTimeout(loadingTimer);
            setState(prev => ({
              ...prev,
              courses: retry.data || [],
              coursesLoading: false,
              lastSync: { ...prev.lastSync, courses: new Date() }
            }));
            return;
          }
        } catch {
          /* retry failed */
        }
        showTimeoutToast("Tải dữ liệu quá lâu. Vui lòng thử lại.");
      } else {
        const e = err as { message?: string; code?: string; details?: string; error?: { message?: string } };
        const msg = err instanceof Error ? err.message : (e?.message ?? e?.error?.message);
        const msgStr = typeof msg === "string" ? msg : "";
        const isTableMissing = /schema cache|Could not find the table|relation.*does not exist/i.test(msgStr);
        if (isTableMissing) {
          setState(prev => ({ ...prev, courses: [], coursesLoading: false }));
          clearTimeout(loadingTimer);
          return;
        }
        console.error("Error loading courses:", msg ?? e?.code ?? e?.details ?? (typeof err === "object" ? JSON.stringify(err) : String(err)));
        showTimeoutToast("Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
      }
      clearTimeout(loadingTimer);
      setState(prev => ({ ...prev, coursesLoading: false }));
    }
  }, [state.lastSync.courses, isCacheValid, showTimeoutToast]);

  // Refresh products (delayed loading + retry khi timeout)
  const refreshProducts = useCallback(async () => {
    if (isCacheValid(state.lastSync.products)) {
      console.log("Using cached products");
      return;
    }

    const loadingTimer = setTimeout(() => {
      setState(prev => ({ ...prev, productsLoading: true }));
    }, LOADING_DELAY_MS);

    const doFetch = () =>
      Promise.race([
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT_MS))
      ]) as Promise<{ data: any; error: any }>;

    try {
      const result = await doFetch();
      if (result.error) throw result.error;

      clearTimeout(loadingTimer);
      setState(prev => ({
        ...prev,
        products: result.data || [],
        productsLoading: false,
        lastSync: { ...prev.lastSync, products: new Date() }
      }));
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "Timeout";
      if (isTimeout) {
        try {
          const retry = await doFetch();
          if (!retry.error) {
            clearTimeout(loadingTimer);
            setState(prev => ({
              ...prev,
              products: retry.data || [],
              productsLoading: false,
              lastSync: { ...prev.lastSync, products: new Date() }
            }));
            return;
          }
        } catch {
          /* retry failed */
        }
        showTimeoutToast("Tải dữ liệu quá lâu. Vui lòng thử lại.");
      } else {
        const e = err as { message?: string; code?: string; details?: string; hint?: string; error?: { message?: string } };
        const msg = err instanceof Error ? err.message : (e?.message ?? e?.error?.message);
        const msgStr = typeof msg === "string" ? msg : "";
        const isTableMissing = /schema cache|Could not find the table|relation.*does not exist/i.test(msgStr);
        if (isTableMissing) {
          setState(prev => ({ ...prev, products: [], productsLoading: false }));
          clearTimeout(loadingTimer);
          return;
        }
        console.error("Error loading products:", msg ?? (e?.code ?? e?.details ?? (typeof err === "object" ? JSON.stringify(err) : String(err))));
        showTimeoutToast("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      }
      clearTimeout(loadingTimer);
      setState(prev => ({ ...prev, productsLoading: false }));
    }
  }, [state.lastSync.products, isCacheValid, showTimeoutToast]);

  // Refresh public files
  const refreshPublicFiles = useCallback(async () => {
    if (isCacheValid(state.lastSync.publicFiles)) {
      console.log("Using cached public files");
      return;
    }

    setState(prev => ({ ...prev, publicFilesLoading: true }));
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("nlc_user_files")
          .select("*")
          .eq("is_public", true)
          .eq("status", "ready")
          .order("created_at", { ascending: false })
          .limit(50),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT_MS)
        )
      ]) as any;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        publicFiles: data || [],
        publicFilesLoading: false,
        lastSync: { ...prev.lastSync, publicFiles: new Date() }
      }));
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "Timeout";
      console.error("Error loading public files:", err);
      if (isTimeout) showTimeoutToast("Tải dữ liệu quá lâu. Vui lòng thử lại.");
      setState(prev => ({ ...prev, publicFilesLoading: false }));
    }
  }, [state.lastSync.publicFiles, isCacheValid, showTimeoutToast]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshUserFiles(),
      refreshCourses(),
      refreshProducts(),
      refreshPublicFiles(),
    ]);
  }, [refreshUserFiles, refreshCourses, refreshProducts, refreshPublicFiles]);

  // Add functions
  const addUserFile = useCallback((file: NLCUserFile) => {
    setState(prev => ({
      ...prev,
      userFiles: [file, ...prev.userFiles],
      publicFiles: file.is_public ? [file, ...prev.publicFiles] : prev.publicFiles,
    }));
    toast.success("File đã được thêm vào thư viện");
  }, []);

  const addCourse = useCallback((course: Course) => {
    setState(prev => ({
      ...prev,
      courses: [course, ...prev.courses],
    }));
    toast.success("Khóa học đã được thêm");
  }, []);

  const addProduct = useCallback((product: Product) => {
    setState(prev => ({
      ...prev,
      products: [product, ...prev.products],
    }));
    toast.success("Sản phẩm đã được thêm");
  }, []);

  // Update functions
  const updateUserFile = useCallback((id: string, updates: Partial<NLCUserFile>) => {
    setState(prev => ({
      ...prev,
      userFiles: prev.userFiles.map(f => f.id === id ? { ...f, ...updates } : f),
      publicFiles: prev.publicFiles.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  // Delete functions
  const deleteUserFile = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      userFiles: prev.userFiles.filter(f => f.id !== id),
      publicFiles: prev.publicFiles.filter(f => f.id !== id),
    }));
    toast.success("File đã được xóa");
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id),
    }));
    toast.success("Khóa học đã được xóa");
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
    toast.success("Sản phẩm đã được xóa");
  }, []);

  // Auto refresh user files when user logs in
  useEffect(() => {
    if (userProfile?.id) {
      refreshUserFiles();
    }
  }, [userProfile?.id, refreshUserFiles]);

  // Prefetch courses + products sau khi mount (defer để không block first paint)
  useEffect(() => {
    const t = setTimeout(() => {
      refreshCourses();
      refreshProducts();
    }, 100);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy 1 lần khi mount
  }, []);

  const value: GlobalDataContextType = {
    ...state,
    refreshUserFiles,
    refreshCourses,
    refreshProducts,
    refreshPublicFiles,
    refreshAll,
    addUserFile,
    addCourse,
    addProduct,
    updateUserFile,
    updateCourse,
    updateProduct,
    deleteUserFile,
    deleteCourse,
    deleteProduct,
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within GlobalDataProvider");
  }
  return context;
}

export default GlobalDataContext;
