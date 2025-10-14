function getCloudinaryUrl(publicId: string, width: number, height: number) {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill/${publicId}.jpg`;
}
