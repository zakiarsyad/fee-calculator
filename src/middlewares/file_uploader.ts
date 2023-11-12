import multer from "multer";

export const fileUploader = (name: string) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  return upload.single(name);
};
