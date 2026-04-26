import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProducts, type DbProduct } from "@/hooks/useProducts";
import { Plus, Pencil, Trash2, Loader2, FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPrice, productImage } from "@/lib/format";

type FormState = {
  name: string; slug: string; price: string; original_price: string; stock: string;
  dimensions: string; weight: string; description: string; category: string; room: string;
  material: string; color: string; image_url: string; catalogue_url: string;
  tags: string; images: string;
};

const emptyForm: FormState = {
  name: "", slug: "", price: "", original_price: "", stock: "",
  dimensions: "", weight: "", description: "", category: "", room: "",
  material: "", color: "", image_url: "", catalogue_url: "",
  tags: "", images: "",
};

const fromProduct = (p: DbProduct): FormState => ({
  name: p.name, slug: p.slug, price: String(p.price ?? ""), original_price: p.original_price ? String(p.original_price) : "",
  stock: String(p.stock ?? 0), dimensions: p.dimensions ?? "", weight: p.weight ?? "",
  description: p.description ?? "", category: p.category ?? "", room: p.room ?? "",
  material: p.material ?? "", color: p.color ?? "", image_url: p.image_url ?? "",
  catalogue_url: p.catalogue_url ?? "", tags: (p.tags ?? []).join(", "),
  images: (p.images ?? []).join(", "),
});

const toPayload = (f: FormState) => ({
  name: f.name,
  slug: f.slug,
  price: Number(f.price) || 0,
  original_price: f.original_price ? Number(f.original_price) : null,
  stock: Number(f.stock) || 0,
  dimensions: f.dimensions,
  weight: f.weight,
  description: f.description,
  category: f.category,
  room: f.room,
  material: f.material,
  color: f.color,
  image_url: f.image_url,
  catalogue_url: f.catalogue_url,
  tags: f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  images: f.images ? f.images.split(",").map((t) => t.trim()).filter(Boolean) : [],
});

function ProductForm({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Name</label><Input className="mt-1 border-none input-shadow" value={form.name} onChange={set("name")} /></div>
        <div><label className="text-sm font-medium">Slug</label><Input className="mt-1 border-none input-shadow" value={form.slug} onChange={set("slug")} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-sm font-medium">Price (₹)</label><Input type="number" className="mt-1 border-none input-shadow" value={form.price} onChange={set("price")} /></div>
        <div><label className="text-sm font-medium">Original (₹)</label><Input type="number" className="mt-1 border-none input-shadow" value={form.original_price} onChange={set("original_price")} /></div>
        <div><label className="text-sm font-medium">Stock</label><Input type="number" className="mt-1 border-none input-shadow" value={form.stock} onChange={set("stock")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Category</label><Input className="mt-1 border-none input-shadow" value={form.category} onChange={set("category")} /></div>
        <div><label className="text-sm font-medium">Room</label><Input className="mt-1 border-none input-shadow" value={form.room} onChange={set("room")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Material</label><Input className="mt-1 border-none input-shadow" value={form.material} onChange={set("material")} /></div>
        <div><label className="text-sm font-medium">Color</label><Input className="mt-1 border-none input-shadow" value={form.color} onChange={set("color")} /></div>
      </div>
      <div><label className="text-sm font-medium">Primary Image URL</label><Input className="mt-1 border-none input-shadow" value={form.image_url} onChange={set("image_url")} /></div>
      <div><label className="text-sm font-medium">Gallery Images (comma-separated URLs)</label><Input className="mt-1 border-none input-shadow" value={form.images} onChange={set("images")} /></div>
      <div><label className="text-sm font-medium">Catalogue URL (PDF)</label><Input placeholder="https://example.com/catalogue.pdf" className="mt-1 border-none input-shadow" value={form.catalogue_url} onChange={set("catalogue_url")} /></div>
      <div><label className="text-sm font-medium">Tags (comma-separated)</label><Input className="mt-1 border-none input-shadow" value={form.tags} onChange={set("tags")} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Dimensions</label><Input className="mt-1 border-none input-shadow" value={form.dimensions} onChange={set("dimensions")} /></div>
        <div><label className="text-sm font-medium">Weight</label><Input className="mt-1 border-none input-shadow" value={form.weight} onChange={set("weight")} /></div>
      </div>
      <div><label className="text-sm font-medium">Description</label><Textarea className="mt-1 border-none input-shadow min-h-[80px]" value={form.description} onChange={set("description")} /></div>
    </div>
  );
}

const AdminProducts = () => {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const handleCreate = async () => {
    if (!form.name || !form.slug) { toast.error("Name and slug are required"); return; }
    const { error } = await supabase.from("products").insert(toPayload(form));
    if (error) { toast.error(error.message || "Failed to create product"); return; }
    toast.success("Product created");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setAddOpen(false); setForm(emptyForm);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const { error } = await supabase.from("products").update(toPayload(editForm)).eq("id", editId);
    if (error) { toast.error(error.message || "Failed to update"); return; }
    toast.success("Product updated");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setEditId(null);
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

  const editing = (products ?? []).find((p) => p.id === editId);

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
            <DialogContent className="max-w-lg bg-background max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-xl">Add New Product</DialogTitle></DialogHeader>
              <ProductForm form={form} setForm={setForm} />
              <Button variant="hero" className="w-full mt-4" onClick={handleCreate}>Create Product</Button>
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
                            <a href={product.catalogue_url} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              <FileDown className="h-3.5 w-3.5" /> Download
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditId(product.id); setEditForm(fromProduct(product)); }}>
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-background">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{product.name}" will be permanently removed. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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

      <Dialog open={!!editId} onOpenChange={(v) => !v && setEditId(null)}>
        <DialogContent className="max-w-lg bg-background max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-xl">Edit {editing?.name ?? "Product"}</DialogTitle></DialogHeader>
          <ProductForm form={editForm} setForm={setEditForm} />
          <Button variant="hero" className="w-full mt-4" onClick={handleUpdate}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
