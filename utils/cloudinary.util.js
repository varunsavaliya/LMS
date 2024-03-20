import cloudinary from "cloudinary";

export const uploadToCloudinary = async (path, options) => {
  try {
    let cloudinaryOptions = {
      folder: "lms",
      resource_type: "auto",
    };
    if (options) {
      cloudinaryOptions = { ...cloudinaryOptions, ...options };
    }
    const result = await cloudinary.v2.uploader.upload(path, cloudinaryOptions);
    return result;
  } catch (error) {
    console.log(error.message);
  }
};

export const destroyFromCloudinary = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.log(error.message);
  }
};
