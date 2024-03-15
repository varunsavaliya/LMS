import cloudinary from "cloudinary";

export const uploadToCloudinary = async (path, options) => {
  let cloudinaryOptions = {
    folder: "lms",
    resource_type: "auto",
  };
  if (options) {
    cloudinaryOptions = { ...cloudinaryOptions, ...options };
  }
  const result = await cloudinary.v2.uploader.upload(path, cloudinaryOptions);
  return result;
};

export const destroyFromCloudinary = async (publicId) => {
  await cloudinary.v2.uploader.destroy(publicId);
};
