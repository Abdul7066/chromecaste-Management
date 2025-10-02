// utils/qrGenerator.js
import QRCode from "qrcode";

/**
 * Generate QR code for Chromecast room mapping
 * @param {String} data - Data to encode in QR
 * @returns {Promise<String>} - Base64 QR Code Image
 */
export const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data, { width: 300, margin: 2 });
  } catch (err) {
    throw new Error("QR code generation failed");
  }
};
