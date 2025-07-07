const fs = require('fs');
const path = require('path');
const multer = require('multer');

const TMP_DIR = path.resolve(__dirname, '../../public/tmpuploads');
const UPLOAD_DIR = path.resolve(__dirname, '../../public/productuploads');

// 配置 multer 用于分片上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TMP_DIR);
  },
  filename: function (req, file, cb) {
    // 只用query参数
    const hash = req.query.hash;
    const index = req.query.index;
    cb(null, `${hash}_${index}`);
  }
});
const upload = multer({ storage });

const UploadController = {
  // 上传单个分片
  uploadChunk: [
    upload.single('chunk'),
    async (req, res) => {
      console.log('收到分片', req.body.hash, req.body.index, req.file && req.file.path);
      // 分片已由 multer 保存
      res.json({ code: 0, message: '分片上传成功' });
    }
  ],

  // 查询已上传分片
  async getUploadedChunks(req, res) {
    const { hash } = req.query;
    if (!hash) {
      return res.status(400).json({ code: 1, message: '缺少 hash 参数' });
    }
    try {
      if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR);
      }
      const files = fs.readdirSync(TMP_DIR);
      const chunkIndexes = files
        .filter(name => name.startsWith(hash + '_'))
        .map(name => parseInt(name.split('_')[1]))
        .filter(index => !isNaN(index));
      res.json({ code: 0, uploaded: chunkIndexes });
    } catch (err) {
      res.status(500).json({ code: 1, message: '查询分片失败', error: err.message });
    }
  },

  // 合并分片
  async mergeChunks(req, res) {
    const { hash, filename, total } = req.body;
    if (!hash || !filename || !total) {
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }
    const ext = path.extname(filename);
    const finalName = `${hash}${ext}`;
    const filePath = path.join(UPLOAD_DIR, finalName);
    try {
      const writeStream = fs.createWriteStream(filePath);
      for (let i = 0; i < total; i++) {
        const chunkPath = path.join(TMP_DIR, `${hash}_${i}`);
        if (!fs.existsSync(chunkPath)) {
          return res.status(400).json({ code: 1, message: `缺少分片${i}` });
        }
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
        fs.unlinkSync(chunkPath); // 合并后删除分片
      }
      writeStream.end();
      writeStream.on('finish', () => {
        res.json({ code: 0, url: `/productuploads/${finalName}` });
      });
    } catch (err) {
      res.status(500).json({ code: 1, message: '合并分片失败', error: err.message });
    }
  }
};

module.exports = UploadController; 