import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const AdminB2B = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-b2b"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: role === "admin", // Waits for admin role confirmation
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("b2b_inquiries").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Status updated");
    queryClient.invalidateQueries({ queryKey: ["admin-b2b"] });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">B2B Inquiries</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Manage wholesale and bulk inquiries</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (inquiries ?? []).length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No inquiries yet.</p>
        ) : (
          <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Company</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Contact</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Message</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(inquiries ?? []).map((inq) => (
                    <tr key={inq.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{inq.company_name}</td>
                      <td className="p-4">
                        <p>{inq.contact_name}</p>
                        <p className="text-xs text-muted-foreground">{inq.email}</p>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs max-w-[200px] truncate">{inq.message}</td>
                      <td className="p-4 text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <Select defaultValue={inq.status} onValueChange={(v) => updateStatus(inq.id, v)}>
                          <SelectTrigger className="w-32 border-none input-shadow text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminB2B;
