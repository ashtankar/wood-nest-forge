import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProducts, type DbProduct } from "@/hooks/useProducts";
import { Plus, Pencil, Trash2, Loader2, FileDown, UploadCloud } from "lucide-react";
import { useState, useMemo } from "react";
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

function ProductForm({ form, setForm, products }: { form: FormState; setForm: (f: FormState) => void; products: DbProduct[] }) {
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  // Auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setForm({ ...form, name: newName, slug: newSlug });
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      
      setForm({ ...form, image_url: data.publicUrl });
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Smart dropdown lists
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(), [products]);
  const rooms = useMemo(() => Array.from(new Set(products.map(p => p.room).filter(Boolean))).sort(), [products]);
  const materials = useMemo(() => Array.from(new Set(products.map(p => p.material).filter(Boolean))).sort(), [products]);
  const colors = useMemo(() => Array.from(new Set(products.map(p => p.color).filter(Boolean))).sort(), [products]);

  return (
    <div className="space-y-5 mt-4">
      
      {/* Primary Image Upload Zone */}
      <div className="border border-border/50 p-4 rounded-xl bg-muted/10">
        <label className="text-sm font-medium mb-3 block">Primary Product Image</label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="h-24 w-24 shrink-0 rounded-lg border border-border/50 bg-muted overflow-hidden flex items-center justify-center card-shadow">
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 w-full space-y-3">
            <div className="relative">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={uploading}
                className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1.5 file:mr-4 file:text-xs file:cursor-pointer border border-border/50 shadow-sm bg-background h-12 pt-2 cursor-pointer w-full" 
              />
              {uploading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-border/50"></div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">OR PASTE URL</span>
              <div className="h-[1px] flex-1 bg-border/50"></div>
            </div>
            <Input 
              className="border-border/50 input-shadow text-xs" 
              placeholder="https://example.com/image.jpg" 
              value={form.image_url} 
              onChange={set("image_url")} 
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input className="mt-1 border-border/50 input-shadow" value={form.name} onChange={handleNameChange} placeholder="E.g. Sheesham Sofa" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Slug <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">Auto-generated</span>
          </label>
          <Input className="mt-1 border-none bg-muted/50 text-muted-foreground cursor-not-allowed" value={form.slug} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-sm font-medium">Price (₹)</label><Input type="number" className="mt-1 border-border/50 input-shadow" value={form.price} onChange={set("price")} /></div>
        <div><label className="text-sm font-medium">Original (₹)</label><Input type="number" className="mt-1 border-border/50 input-shadow" value={form.original_price} onChange={set("original_price")} /></div>
        <div><label className="text-sm font-medium">Stock</label><Input type="number" className="mt-1 border-border/50 input-shadow" value={form.stock} onChange={set("stock")} /></div>
      </div>

      {/* Smart Attributes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <Input list="category-options" className="mt-1 border-border/50 input-shadow" value={form.category} onChange={set("category")} placeholder="Search or type new..." />
          <datalist id="category-options">{categories.map(c => <option key={c as string} value={c as string} />)}</datalist>
        </div>
        <div>
          <label className="text-sm font-medium">Room</label>
          <Input list="room-options" className="mt-1 border-border/50 input-shadow" value={form.room} onChange={set("room")} placeholder="Search or type new..." />
          <datalist id="room-options">{rooms.map(r => <option key={r as string} value={r as string} />)}</datalist>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Material</label>
          <Input list="material-options" className="mt-1 border-border/50 input-shadow" value={form.material} onChange={set("material")} placeholder="Search or type new..." />
          <datalist id="material-options">{materials.map(m => <option key={m as string} value={m as string} />)}</datalist>
        </div>
        <div>
          <label className="text-sm font-medium">Color</label>
          <Input list="color-options" className="mt-1 border-border/50 input-shadow" value={form.color} onChange={set("color")} placeholder="Search or type new..." />
          <datalist id="color-options">{colors.map(c => <option key={c as string} value={c as string} />)}</datalist>
        </div>
      </div>

      {/* Extra Details */}
      <div><label className="text-sm font-medium">Gallery Images (comma-separated URLs)</label><Input className="mt-1 border-border/50 input-shadow" value={form.images} onChange={set("images")} /></div>
      <div><label className="text-sm font-medium">Catalogue URL (PDF)</label><Input placeholder="https://example.com/catalogue.pdf" className="mt-1 border-border/50 input-shadow" value={form.catalogue_url} onChange={set("catalogue_url")} /></div>
      <div><label className="text-sm font-medium">Tags (comma-separated)</label><Input className="mt-1 border-border/50 input-shadow" value={form.tags} onChange={set("tags")} placeholder="E.g. bestseller, new, decor" /></div>
      
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-medium">Dimensions</label><Input className="mt-1 border-border/50 input-shadow" value={form.dimensions} onChange={set("dimensions")} placeholder="E.g. 72 W x 36 D x 30 H" /></div>
        <div><label className="text-sm font-medium">Weight</label><Input className="mt-1 border-border/50 input-shadow" value={form.weight} onChange={set("weight")} placeholder="E.g. 45 kg" /></div>
      </div>
      <div><label className="text-sm font-medium">Description</label><Textarea className="mt-1 border-border/50 input-shadow min-h-[100px]" value={form.description} onChange={set("description")} /></div>
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

  const allProducts = products ?? [];

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

  const editing = allProducts.find((p) => p.id === editId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl">Products & Inventory</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">{allProducts.length} products</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button></DialogTrigger>
            <DialogContent className="max-w-2xl bg-background max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-xl">Add New Product</DialogTitle></DialogHeader>
              <ProductForm form={form} setForm={setForm} products={allProducts} />
              <Button variant="hero" className="w-full mt-6 h-12" onClick={handleCreate}>Create Product</Button>
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
                  {allProducts.map((product) => {
                    const tag = stockTag(product.stock);
                    return (
                      <tr key={product.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={productImage(product.image_url)} alt={product.name} className="w-10 h-10 rounded-md object-cover bg-muted border border-border/50" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }} />
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
        <DialogContent className="max-w-2xl bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-xl">Edit {editing?.name ?? "Product"}</DialogTitle></DialogHeader>
          <ProductForm form={editForm} setForm={setEditForm} products={allProducts} />
          <Button variant="hero" className="w-full mt-6 h-12" onClick={handleUpdate}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
