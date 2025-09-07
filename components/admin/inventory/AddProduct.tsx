"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";
import { useAppDispatch } from "@/redux/hook";
import { submitProduct } from "@/redux/features/products/productsSlice";

export function AddProductButton() {
  const dispatch = useAppDispatch();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // capture form reference
    const formData = new FormData(form);
    setLoading(true);

    dispatch(submitProduct(formData))
      .unwrap()
      .then(() => {
        // ✅ Only reset after successful save
        form.reset();
        setPreview(null);
      })
      .catch((err: string) => {
        console.error("❌ Failed to add product:", err);
      })
      .finally(() => setLoading(false)); // keep dialog open
  };

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
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Form inputs */}
            <div className="flex-[2] space-y-3 w-full">
              <Input
                type="text"
                name="name"
                placeholder="Product Name"
                required
                disabled={loading} // ✅ disable while saving
              />
              <Textarea
                name="description"
                placeholder="Description"
                required
                disabled={loading} // ✅ disable while saving
              />
              <Input
                type="number"
                name="price"
                placeholder="Price"
                required
                disabled={loading} // ✅ disable while saving
              />
              <Input
                type="number"
                name="stock"
                placeholder="Stock"
                required
                disabled={loading} // ✅ disable while saving
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white hover:bg-gray-800 rounded-md shadow"
              >
                {loading ? "Saving..." : "Save Product"}
              </Button>
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
                  disabled={loading} // ✅ disable while saving
                />
              </label>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
