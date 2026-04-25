import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/useProducts";
import { Plus, Pencil, Trash2, Loader2, FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice, productImage } from "@/lib/format";

const AdminProducts = () => {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", price: "", stock: "", dimensions: "", weight: "", description: "", category: "", room: "", material: "", color: "", image_url: "", catalogue_url: "" });

  const handleCreate = async () => {
    if (!form.name || !form.slug) { toast.error("Name and slug are required"); return; }
    const { error } = await supabase.from("products").insert({
      name: form.name,
      slug: form.slug,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      dimensions: form.dimensions,
      weight: form.weight,
      description: form.description,
      category: form.category,
      room: form.room,
      material: form.material,
      color: form.color,
      image_url: form.image_url,
      catalogue_url: form.catalogue_url,
    });
    if (error) { toast.error("Failed to create product"); return; }
    toast.success("Product created");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setAddOpen(false);
    setForm({ name: "", slug: "", price: "", stock: "", dimensions: "", weight: "", description: "", category: "", room: "", material: "", color: "", image_url: "", catalogue_url: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete product"); return; }
    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const stockTag = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", cls: "bg-destructive/10 text-destructive" };
    if (stock < 5) return { label: "Low Stock", cls: "bg-orange-50 text-orange-700" };
    return { label: `${stock} in stock`, cls: "bg-muted text-muted-foreground" };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl">Products & Inventory</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">{(products ?? []).length} products</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button></DialogTrigger>
            <DialogContent className="max-w-lg bg-background max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-xl">Add New Product</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Name</label><Input className="mt-1 border-none input-shadow" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Slug</label><Input className="mt-1 border-none input-shadow" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Price (₹)</label><Input type="number" className="mt-1 border-none input-shadow" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Stock</label><Input type="number" className="mt-1 border-none input-shadow" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Category</label><Input className="mt-1 border-none input-shadow" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Room</label><Input className="mt-1 border-none input-shadow" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Material</label><Input className="mt-1 border-none input-shadow" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Color</label><Input className="mt-1 border-none input-shadow" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
                </div>
                <div><label className="text-sm font-medium">Image URL</label><Input className="mt-1 border-none input-shadow" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
                <div><label className="text-sm font-medium">Catalogue URL (PDF link)</label><Input className="mt-1 border-none input-shadow" placeholder="https://example.com/catalogue.pdf" value={form.catalogue_url} onChange={(e) => setForm({ ...form, catalogue_url: e.target.value })} /></div>
                <div><label className="text-sm font-medium">Dimensions</label><Input className="mt-1 border-none input-shadow" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} /></div>
                <div><label className="text-sm font-medium">Weight</label><Input className="mt-1 border-none input-shadow" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
                <div><label className="text-sm font-medium">Description</label><Textarea className="mt-1 border-none input-shadow min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button variant="hero" className="w-full" onClick={handleCreate}>Create Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Category</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Inventory</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Catalogue</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(products ?? []).map((product) => {
                    const tag = stockTag(product.stock);
                    return (
                      <tr key={product.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={productImage(product.image_url)} alt={product.name} className="w-10 h-10 rounded-md object-cover bg-muted" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }} />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.category}</td>
                        <td className="p-4 text-right tabular-nums">{formatPrice(product.price)}</td>
                        <td className="p-4 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${tag.cls}`}>{tag.label}</span>
                        </td>
                        <td className="p-4 text-right">
                          {product.catalogue_url ? (
                            <a
                              href={product.catalogue_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              aria-label={`Download catalogue for ${product.name}`}
                            >
                              <FileDown className="h-3.5 w-3.5" /> Download
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
