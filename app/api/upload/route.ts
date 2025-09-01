import { NextRequest, NextResponse } from "next/server";
import cloudinary from "../../lib/cloudinary";
import { type UploadApiResponse } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
        .upload_stream({ folder: "products", }, (error, result) => {
        if (error || !result) reject(error);
        else resolve(result);
        })
        .end(buffer);
    });

     return NextResponse.json({
      success: true,
      url: result.secure_url,    // <-- secure URL for display
      public_id: result.public_id, // <-- keep this if you’ll delete/update later
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
