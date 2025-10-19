/**
 * Global Data Context - Quản lý và đồng bộ dữ liệu giữa các trang
 * Tránh duplicate queries và conflicts
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase, NLCUserFile, Course, Product } from "../lib/supabase-config";
import { useAuth } from "./UnifiedAuthContext";
import { toast } from "sonner";

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

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();

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
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
      ]) as any;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        userFiles: data || [],
        filesLoading: false,
        lastSync: { ...prev.lastSync, files: new Date() }
      }));
    } catch (error) {
      console.error("Error loading user files:", error);
      setState(prev => ({ ...prev, filesLoading: false }));
    }
  }, [userProfile?.id, state.lastSync.files, isCacheValid]);

  // Refresh courses
  const refreshCourses = useCallback(async () => {
    if (isCacheValid(state.lastSync.courses)) {
      console.log("Using cached courses");
      return;
    }

    setState(prev => ({ ...prev, coursesLoading: true }));
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
      ]) as any;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        courses: data || [],
        coursesLoading: false,
        lastSync: { ...prev.lastSync, courses: new Date() }
      }));
    } catch (error) {
      console.error("Error loading courses:", error);
      setState(prev => ({ ...prev, coursesLoading: false }));
    }
  }, [state.lastSync.courses, isCacheValid]);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    if (isCacheValid(state.lastSync.products)) {
      console.log("Using cached products");
      return;
    }

    setState(prev => ({ ...prev, productsLoading: true }));
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
      ]) as any;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        products: data || [],
        productsLoading: false,
        lastSync: { ...prev.lastSync, products: new Date() }
      }));
    } catch (error) {
      console.error("Error loading products:", error);
      setState(prev => ({ ...prev, productsLoading: false }));
    }
  }, [state.lastSync.products, isCacheValid]);

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
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
      ]) as any;

      if (error) throw error;

      setState(prev => ({
        ...prev,
        publicFiles: data || [],
        publicFilesLoading: false,
        lastSync: { ...prev.lastSync, publicFiles: new Date() }
      }));
    } catch (error) {
      console.error("Error loading public files:", error);
      setState(prev => ({ ...prev, publicFilesLoading: false }));
    }
  }, [state.lastSync.publicFiles, isCacheValid]);

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

  // Auto refresh on mount
  useEffect(() => {
    if (userProfile?.id) {
      refreshUserFiles();
    }
  }, [userProfile?.id, refreshUserFiles]);

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
