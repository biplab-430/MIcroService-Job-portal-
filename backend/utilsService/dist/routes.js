import express from "express";
import { v2 as cloudinary } from "cloudinary";
const router = express.Router();
router.post("/upload", async (req, res) => {
    try {
        const { buffer, public_id } = req.body;
        // ✅ Validate input
        if (!buffer) {
            return res.status(400).json({
                message: "Buffer is required",
            });
        }
        // ✅ Delete old file if exists
        if (public_id) {
            try {
                const result = await cloudinary.uploader.destroy(public_id, {
                    resource_type: "auto",
                });
                console.log("DELETE RESULT:", result);
            }
            catch (err) {
                console.log("DELETE ERROR:", err.message);
            }
        }
        // ✅ Upload file (important for PDF)
        const cloud = await cloudinary.uploader.upload(buffer, {
            resource_type: "auto",
        });
        return res.status(200).json({
            url: cloud.secure_url,
            public_id: cloud.public_id,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Upload failed",
        });
    }
});
export default router;
