import { createClient } from "@supabase/supabase-js";
import { config } from "../services/config";

const { url: supabaseUrl, anonKey: supabaseAnonKey } =
  config.getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AccountRole = "sinh_vien" | "doanh_nghiep" | "quan_ly" | "admin";

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: "student" | "instructor" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  instructor_id: string;
  category: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  duration: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  payment_method: string;
  created_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

// Auth helper functions
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return user;
};

// Account helpers
export const upsertAccount = async (params: {
  userId: string;
  email: string;
  fullName?: string;
  role?: AccountRole;
  plan?: "free" | "student_299" | "business";
  provider?: string;
}) => {
  const { data, error } = await supabase
    .from("account_nam_long_center")
    .upsert({
      user_id: params.userId,
      email: params.email,
      full_name: params.fullName,
      role: params.role || "sinh_vien",
      plan: params.plan || "free",
      provider: params.provider || "email",
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting account:", error);
    throw error;
  }

  return data;
};

export const getAccount = async (userId: string) => {
  const { data, error } = await supabase
    .from("account_nam_long_center")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error getting account:", error);
    throw error;
  }

  return data;
};

export const isAccountEligible = async (email: string) => {
  const { data, error } = await supabase
    .from("account_nam_long_center")
    .select("status, is_paid")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No account found, eligible for free tier
      return { eligible: true as const, reason: "ok" as const };
    }
    console.error("Error checking account eligibility:", error);
    return { eligible: false as const, reason: "error" as const };
  }

  if (data.status === "rejected") {
    return { eligible: false as const, reason: "rejected" as const };
  }

  if (data.status === "pending" && !data.is_paid) {
    return { eligible: false as const, reason: "pending_payment" as const };
  }

  return { eligible: true as const, reason: "ok" as const };
};

export const ensureActiveAccount = async (
  userId: string,
  email: string | null
) => {
  if (!email) {
    return false;
  }

  const { data, error } = await supabase
    .from("account_nam_long_center")
    .select("status")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No account found, create one
      await upsertAccount({
        userId,
        email,
        role: "sinh_vien",
        plan: "free",
        provider: "email",
      });
      return true;
    }
    console.error("Error ensuring active account:", error);
    return false;
  }

  return data.status === "active";
};

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  role: AccountRole = "sinh_vien",
  plan?: "free" | "student_299" | "business"
) => {
  if (!(role === "sinh_vien" && plan === "free")) {
    const el = await isAccountEligible(email);
    if (!el.eligible) {
      throw new Error("Bạn cần mua tài khoản trước khi đăng ký.");
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (user) {
    await upsertAccount({
      userId: user.id,
      email: user.email || email,
      fullName,
      role,
      plan: plan ?? (role === "sinh_vien" ? "free" : undefined),
      provider: "email",
    });

    if (role === "quan_ly") {
      await requestManagerApproval(user.id, user.email || email, fullName);
    } else {
      await supabase
        .from("account_nam_long_center")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
          plan: plan ?? (role === "sinh_vien" ? "free" : null),
        })
        .eq("user_id", user.id);
    }
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const el = await isAccountEligible(email);
  if (!el.eligible) {
    throw new Error("Tài khoản chưa được kích hoạt hoặc chưa thanh toán.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const user = data.user;
  if (user) {
    await upsertAccount({
      userId: user.id,
      email: user.email || email,
      fullName: user.user_metadata?.full_name || "",
      provider: user.app_metadata?.provider || "email",
    });
    await ensureActiveAccount(user.id, user.email);
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const redirectTo = `${window.location.origin}/auth`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
  return data;
};

export const requestManagerApproval = async (
  userId: string,
  email: string,
  fullName?: string
) => {
  const { data, error } = await supabase
    .from("manager_approvals")
    .insert({
      user_id: userId,
      email,
      full_name: fullName,
      requested_role: "quan_ly",
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("account_nam_long_center")
    .update({
      requested_role: "quan_ly",
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return data;
};

export const listManagers = async () => {
  const { data, error } = await supabase
    .from("managers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const addManager = async (payload: {
  email?: string;
  user_id?: string;
  full_name?: string;
}) => {
  const { data, error } = await supabase
    .from("managers")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const setManagerApproval = async (
  approvalId: string,
  approve: boolean,
  reviewerUserId: string
) => {
  const { data: approval, error } = await supabase
    .from("manager_approvals")
    .update({
      status: approve ? "approved" : "rejected",
      reviewed_by: reviewerUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", approvalId)
    .select()
    .single();
  if (error) throw error;

  const role = approve ? "quan_ly" : "sinh_vien";
  await supabase
    .from("account_nam_long_center")
    .update({
      role,
      status: approve ? "active" : "rejected",
      approved_by: reviewerUserId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", approval.user_id);

  await (supabase as any).from("manager_notifications").insert({
    approval_id: approvalId,
    type: approve ? "approved" : "rejected",
    payload: { email: approval.email, full_name: approval.full_name },
  });

  return approval;
};

export const getManagerApprovals = async (
  status: "pending" | "approved" | "rejected" = "pending"
) => {
  const { data, error } = await supabase
    .from("manager_approvals")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Course helper functions
export const getCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return data || [];
};

export const getUserCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_courses")
    .select(
      `
      *,
      course:courses (*)
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user courses:", error);
    return [];
  }

  return data || [];
};

export const purchaseCourse = async (courseId: string, amount: number) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // First create the purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      course_id: courseId,
      amount: amount,
      status: "completed", // In real app, this would be 'pending' until payment is processed
      payment_method: "demo",
    })
    .select()
    .single();

  if (purchaseError) {
    throw purchaseError;
  }

  // Then create the user_course record
  const { error: userCourseError } = await supabase
    .from("user_courses")
    .insert({
      user_id: user.id,
      course_id: courseId,
      progress: 0,
      completed: false,
    });

  if (userCourseError) {
    throw userCourseError;
  }

  return purchase;
};

// Avatar upload helper functions
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  const { error } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
};

export const deleteOldAvatar = async (avatarUrl: string) => {
  try {
    // Extract filename from URL
    const urlParts = avatarUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("user-avatars")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting old avatar:", error);
    }
  } catch (error) {
    console.error("Error processing avatar deletion:", error);
  }
};

// Get user profile data
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error getting user profile:", error);
    throw error;
  }

  return data;
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
) => {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }

  return data;
};
