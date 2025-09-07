"use client";

import { useState } from "react";

export default function TestUploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = e.currentTarget.file as HTMLInputElement;
    if (!fileInput?.files?.[0]) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadedUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-md shadow-md">
      <h1 className="text-xl font-bold mb-4">Test Image Upload</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-md border"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {uploadedUrl && (
        <div className="mt-4">
          <p className="font-semibold">Uploaded Image:</p>
          <img
            src={uploadedUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-md border mt-2"
          />
          <p className="text-sm mt-1 break-all">{uploadedUrl}</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-red-600 font-semibold">Error: {error}</p>
      )}
    </div>
  );
}
