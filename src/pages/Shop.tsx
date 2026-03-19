import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ProductCard } from "@/components/storefront/ProductCard";
import { products, rooms, materials, colors } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from "react-router-dom";

function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-body font-semibold text-sm">{title}</h4>
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={selected.includes(opt)}
            onCheckedChange={() => onToggle(opt)}
          />
          <span className="text-foreground/80">{opt}</span>
        </label>
      ))}
    </div>
  );
}

const Shop = () => {
  const [searchParams] = useSearchParams();

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);

  // Sync room filter from URL search params
  useEffect(() => {
    const room = searchParams.get("room");
    if (room) {
      setSelectedRooms([room]);
    } else {
      setSelectedRooms([]);
    }
  }, [searchParams]);

  const toggle = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedRooms.length && !selectedRooms.includes(p.room)) return false;
      if (selectedMaterials.length && !selectedMaterials.includes(p.material)) return false;
      if (selectedColors.length && !selectedColors.includes(p.color)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [selectedRooms, selectedMaterials, selectedColors, priceRange]);

  const activeFilterCount = selectedRooms.length + selectedMaterials.length + selectedColors.length + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  const clearAll = () => {
    setSelectedRooms([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setPriceRange([0, 5000]);
  };

  const filterContent = (
    <div className="space-y-6">
      <FilterSection title="Room" options={rooms} selected={selectedRooms} onToggle={(v) => toggle(selectedRooms, setSelectedRooms, v)} />
      <FilterSection title="Material" options={materials} selected={selectedMaterials} onToggle={(v) => toggle(selectedMaterials, setSelectedMaterials, v)} />
      <FilterSection title="Color" options={colors} selected={selectedColors} onToggle={(v) => toggle(selectedColors, setSelectedColors, v)} />
      <div className="space-y-3">
        <h4 className="font-body font-semibold text-sm">Price Range</h4>
        <Slider min={0} max={5000} step={100} value={priceRange} onValueChange={setPriceRange} />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>
      {activeFilterCount > 0 && (
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearAll}>
          <X className="h-4 w-4 mr-1" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl">Shop</h1>
            <p className="text-muted-foreground font-body mt-1">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{filterContent}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-10">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-6">
            <h3 className="font-body font-semibold text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
            {filterContent}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body">No products match your filters.</p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default Shop;
