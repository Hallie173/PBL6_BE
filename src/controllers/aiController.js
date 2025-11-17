import axios from "axios";

// URL của AI Service (Server Flask).
// Khi deploy, bạn cần thay thế 'http://localhost:5000' bằng địa chỉ IP/Domain công khai của AI Service.
const AI_SERVICE_URL = "http://localhost:5000/api/detect_frame";

/**
 * Hàm trung gian gọi API phát hiện frame từ AI Service (Flask)
 */
export const detectFrame = async (req, res) => {
  // Frontend gửi { image: 'base64_data' } đến endpoint này (Node.js)
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ message: "Missing image data." });
  }

  try {
    // Gửi dữ liệu frame (Base64) đến AI Service
    const aiResponse = await axios.post(AI_SERVICE_URL, {
      image: image,
    });

    // Trả kết quả JSON từ AI Service về Frontend
    // Kết quả sẽ chứa: { frame_width, frame_height, detections: [...] }
    res.status(200).json(aiResponse.data);
  } catch (error) {
    // Xử lý lỗi nếu AI Service không phản hồi hoặc trả về lỗi
    console.error(
      "Error communicating with AI Service:",
      error.message || error
    );

    // Kiểm tra lỗi phản hồi từ AI Service
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({
        message:
          "AI Service Error: " +
          (error.response.data.error || "Detection failed."),
      });
    }

    // Lỗi kết nối
    res.status(503).json({
      message:
        "Failed to connect to AI Detection Server (Service Unavailable).",
    });
  }
};
