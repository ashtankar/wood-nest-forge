import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { products } from "@/data/products";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminProducts = () => {
  const [addOpen, setAddOpen] = useState(false);

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
            <p className="text-muted-foreground font-body text-sm mt-1">{products.length} products</p>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-background">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="e.g., Walnut Desk" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Price (€)</label>
                    <Input type="number" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="1890" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock</label>
                    <Input type="number" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="25" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Dimensions</label>
                  <Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="120 × 60 × 75 cm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea className="mt-1 border-none input-shadow focus:input-shadow-focus min-h-[80px]" placeholder="Product description…" />
                </div>
                <div>
                  <label className="text-sm font-medium">Complementary Items</label>
                  <Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="Select related products…" />
                </div>
                <div>
                  <label className="text-sm font-medium">Media Upload</label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/30 transition-colors">
                    Drop images here or click to upload
                  </div>
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    toast.success("Product created successfully");
                    setAddOpen(false);
                  }}
                >
                  Create Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Price</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Dimensions</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Inventory</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const tag = stockTag(product.stock);
                  return (
                    <tr key={product.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-right tabular-nums">€{product.price.toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground text-xs">{product.dimensions}</td>
                      <td className="p-4 text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${tag.cls}`}>
                          {tag.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Edit modal would open")}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Delete confirmation would show")}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
