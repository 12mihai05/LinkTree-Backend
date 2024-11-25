import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerOptions = {
  storage: diskStorage({
    // Using `path.join` to construct the correct file path
    destination: (req, file, cb) => {
      cb(null, './profile-images');  // Define the storage folder
    },
    filename: (req, file, cb) => {
      try {
        const timestamp = Date.now(); // Add timestamp to filename
        const fileExtension = extname(file.originalname); // Get file extension
        const uniqueFileName = `${timestamp}${fileExtension}`; // Generate unique filename

        // Construct the final file path, and it will automatically use single backslashes on Windows
        cb(null, uniqueFileName); // Save the file with the unique filename
      } catch (error) {
        cb(error, null); // Handle error gracefully
      }
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image file types
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
};
