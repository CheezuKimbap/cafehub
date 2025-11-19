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
import { submitProduct } from "@/redux/features/products/productsSlice";
import { fetchCategories } from "@/redux/features/categories/categoriesSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
export function AddProductButton() {
  const dispatch = useAppDispatch();
  const { categories, loading: catLoading } = useAppSelector(
    (state) => state.categories,
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("");

  const [variants, setVariants] = useState<
    { servingType: string | null; size?: string; price: number | null }[]
  >([{ servingType: null, size: "", price: null }]); // start with one variant

  // Fetch categories on mount
  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories()).then((res: any) => {
        const firstCategory = res.payload?.[0];
        if (firstCategory) setCategoryId(firstCategory.id);
      });
    } else {
      // categories already in store, use first one
      setCategoryId(categories[0]?.id || "");
    }
  }, [categories, dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // Variant handlers
  const addVariant = () =>
    setVariants([...variants, { servingType: null, size: "", price: null }]);
  const removeVariant = (idx: number) => {
    if (idx === 0) return; // first variant cannot be removed
    setVariants(variants.filter((_, i) => i !== idx));
  };
  const updateVariant = (idx: number, field: string, value: any) =>
    setVariants(
      variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (categoryId) formData.append("categoryId", categoryId);

    // Validate variant prices
    const invalidVariant = variants.find(
      (v) => v.price === null || v.price === undefined || isNaN(v.price),
    );
    if (invalidVariant) {
       toast.error(`Please enter a price for all variants.`);

      return;
    }

    formData.append("variants", JSON.stringify(variants));

    setLoading(true);

    dispatch(submitProduct(formData))
      .unwrap()
      .then(() => {
        form.reset();
        setPreview(null);
        // Reset variants to one empty variant
        setVariants([{ servingType: null, size: "", price: null }])
        toast.success("Product added successfully!");
      })
      .catch((err: string) => {

        toast.error(`Failed to add product: ${err}`);
      })
      .finally(() => setLoading(false));
  };

  // Determine if Serving Type should be shown
  const showServingType =
    categoryId !== "" &&
    categories.find((cat) => cat.id === categoryId)?.name !== "Snacks";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800 rounded-md shadow-md">
          Add Product
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 w-full max-w-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
            Add a New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Top Row: Form inputs + Image */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Form inputs */}
            <div className="flex-1 space-y-3">
              <Input
                type="text"
                name="name"
                placeholder="Product Name"
                required
                disabled={loading}
              />
              <Textarea
                name="description"
                placeholder="Description"
                required
                disabled={loading}
              />

              {/* Category Select */}
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={catLoading || loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Can Discount Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canDiscount"
                  name="canDiscount"
                  disabled={loading}
                  onCheckedChange={(checked) => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[name="canDiscount"]',
                    );
                    if (input) input.value = checked ? "true" : "false";
                  }}
                />
                <label
                  htmlFor="canDiscount"
                  className="text-sm font-medium leading-none text-gray-700"
                >
                  Can have discount
                </label>
                <input type="hidden" name="canDiscount" value="false" />
              </div>
            </div>

            {/* Right: Image preview */}
            <div className="flex-[1] flex flex-col items-start justify-start">
              <label className="w-full max-w-[150px] h-[150px] cursor-pointer border border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* Variants Section: full width below top row */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Variants
            </label>

            {variants.map((v, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-2 items-center"
              >
                {showServingType && (
                  <Select
                    value={v.servingType ?? "NONE"}
                    onValueChange={(val) =>
                      updateVariant(
                        idx,
                        "servingType",
                        val === "NONE" ? null : val,
                      )
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Serving Type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="HOT">HOT</SelectItem>
                      <SelectItem value="COLD">COLD</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Input
                  type="text"
                  placeholder="Size (optional)"
                  className="flex-1"
                  value={v.size}
                  onChange={(e) => updateVariant(idx, "size", e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Price"
                  className="flex-1"
                  value={v.price ?? ""}
                  onChange={(e) =>
                    updateVariant(
                      idx,
                      "price",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  required
                />

                {idx !== 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeVariant(idx)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              Add Variant
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-md shadow"
          >
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
