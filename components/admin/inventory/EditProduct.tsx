"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { updateProductById } from "@/redux/features/products/productsSlice";
import { fetchCategories } from "@/redux/features/categories/categoriesSlice";
import { Checkbox } from "@/components/ui/checkbox";

interface Variant {
  servingType: string | null;
  size?: string | null;
  price: number | null;
}

interface Product {
  id: string;
  name?: string;
  description?: string;
  image?: string | null;
  categoryId?: string;
  canDiscount?: boolean;
  variants?: Variant[];
  status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED" | "INACTIVE";
}

interface ProductEditButtonProps {
  product: Product;
}

export function ProductEditButton({ product }: ProductEditButtonProps) {
  const dispatch = useAppDispatch();
  const { categories, loading: catLoading } = useAppSelector(
    (state) => state.categories
  );

  const [preview, setPreview] = useState<string | null>(product.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [categoryId, setCategoryId] = useState<string>(product.categoryId || "");
  const [canDiscount, setCanDiscount] = useState<boolean>(product.canDiscount || false);

  const [status, setStatus] = useState<
    "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED" | "INACTIVE"
  >(product.status);

  const [variants, setVariants] = useState<Variant[]>(
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({ ...v }))
      : [{ servingType: null, size: "", price: null }]
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const addVariant = () =>
    setVariants([...variants, { servingType: null, size: "", price: null }]);
  const removeVariant = (idx: number) => {
    if (idx === 0) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };
  const updateVariant = (idx: number, field: string, value: any) =>
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (categoryId) formData.append("categoryId", categoryId);
    formData.append("canDiscount", canDiscount.toString());
    formData.append("status", status);
    formData.append("variants", JSON.stringify(variants));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    dispatch(updateProductById({ id: product.id, formData }))
      .unwrap()
      .then(() => {

      })
      .finally(() => setLoading(false));
  };

  const showServingType =
    categoryId &&
    categories.find((cat) => cat.id === categoryId)?.name !== "Snacks";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800 rounded-md shadow-md">
          Edit Product
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white border shadow-lg rounded-xl p-6 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-[2] space-y-3">

              <Input name="name" defaultValue={product.name} required disabled={loading} />
              <Textarea name="description" defaultValue={product.description} required disabled={loading} />

              <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ✅ STATUS SELECT */}
              <Select value={status} onValueChange={(val) => setStatus(val as any)} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Product Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Checkbox checked={canDiscount} onCheckedChange={(c) => setCanDiscount(c === true)} />
                <span>Can have discount</span>
              </div>

              {/* VARIANTS */}
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  {showServingType && (
                    <Select
                      value={v.servingType ?? "NONE"}
                      onValueChange={(val) =>
                        updateVariant(idx, "servingType", val === "NONE" ? null : val)
                      }
                    >
                      <SelectTrigger><SelectValue placeholder="Serving" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="HOT">HOT</SelectItem>
                        <SelectItem value="COLD">COLD</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Input
                    value={v.size ?? ""}
                    onChange={(e) => updateVariant(idx, "size", e.target.value)}
                    placeholder="Size"
                  />

                  <Input
                    type="number"
                    value={v.price ?? ""}
                    onChange={(e) =>
                      updateVariant(idx, "price", e.target.value ? Number(e.target.value) : null)
                    }
                    required
                  />

                  {idx !== 0 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(idx)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                Add Variant
              </Button>

              <Button type="submit" disabled={loading} className="w-full bg-black text-white">
                {loading ? "Saving..." : "Update Product"}
              </Button>
            </div>

            <div className="flex-[1]">
              <label className="block w-full h-40 border border-dashed rounded-md flex items-center justify-center cursor-pointer overflow-hidden relative">
                {preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
