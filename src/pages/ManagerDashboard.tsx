import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getManagerApprovals, setManagerApproval } from "@/lib/supabase";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getManagerApprovals("pending");
        setApprovals(data || []);
      } catch (e) {
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    if (!user) return;
    await setManagerApproval(id, approve, user.id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu duyệt vai trò Quản lý</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Đang tải...</div>
            ) : approvals.length === 0 ? (
              <div>Không có yêu cầu nào.</div>
            ) : (
              <div className="space-y-3">
                {approvals.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between border rounded p-3 bg-white"
                  >
                    <div>
                      <div className="font-medium">
                        {app.full_name || app.email}
                      </div>
                      <div className="text-sm text-gray-600">{app.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(app.id, true)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(app.id, false)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
