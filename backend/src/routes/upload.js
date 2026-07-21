const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Use memory storage for Vercel/Serverless
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('ginraide-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: 'Error uploading image to storage' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('ginraide-uploads')
      .getPublicUrl(filePath);

    res.json({ imageUrl: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Upload catch error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;
