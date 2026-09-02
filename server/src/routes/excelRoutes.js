import express from 'express';
import multer from 'multer';
import {
  downloadTemplate,
  uploadExcel,
  exportStudents,
} from '../controllers/excelController.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.get('/template', downloadTemplate);
router.post('/upload', upload.single('file'), uploadExcel);
router.get('/export', exportStudents);

export default router;
