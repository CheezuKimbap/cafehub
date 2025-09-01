"use client";
import { useState } from "react";

export default function AddProductForm() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;

    // Upload image
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const { result } = await uploadRes.json();
    const imageUrl = result.secure_url;

    // // Save product with image URL in MongoDB
    // await fetch("/api/products", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     name: "Sample Product",
    //     description: "Product description",
    //     price: 1200,
    //     image: imageUrl, // store cloudinary URL in MongoDB
    //   }),
    // });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit">Add Product</button>
    </form>
  );
}
