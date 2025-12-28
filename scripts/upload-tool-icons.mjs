import { storagePut } from '../server/storage.js';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

// Tool icon mappings - tool name to image file path
const toolIconMappings = {
  // Text tools
  'ChatGPT': '/home/ubuntu/upload/search_images/uf3W7jseBTEW.png', // ChatGPT logo
  'Claude': '/home/ubuntu/upload/search_images/nPuDsYtxTiKH.jpg', // Claude logo
  'Gemini': '/home/ubuntu/upload/search_images/62JrMYD6fPbg.png', // Gemini logo
  'Grok': '/home/ubuntu/upload/search_images/y0OajTwn6GOG.png', // Grok logo
  'Qwen': '/home/ubuntu/upload/search_images/CBV7hQY7chR6.jpg', // Qwen logo
  'Manus': '/home/ubuntu/upload/search_images/LQi7HXKDSMaE.jpeg', // Manus logo
  
  // Image tools
  'Midjourney': '/home/ubuntu/upload/search_images/rbLHfJRIJIaX.png', // Midjourney logo
  'Stable Diffusion': '/home/ubuntu/upload/search_images/roMzj2UUlqTq.png', // Stable Diffusion logo
  'DALL-E 3': '/home/ubuntu/upload/search_images/BCP4upszgOMw.png', // DALL-E logo
  'Flux': '/home/ubuntu/upload/search_images/zBwtoWb2J0Bk.jpeg', // Flux logo
  'Ideogram': '/home/ubuntu/upload/search_images/mHRySMH70zWw.jpg', // Ideogram logo
  
  // Video tools
  'Runway': '/home/ubuntu/upload/search_images/uRc5gXjHZ8xQ.png', // Runway logo
  'Pika Labs': '/home/ubuntu/upload/search_images/RKZJ4yQP7xTa.jpg', // Pika Labs logo
  'Krea': '/home/ubuntu/upload/search_images/bsYZfiwKrXS7.png', // Krea logo
  'Kling': '/home/ubuntu/upload/search_images/EfteTkBkorOX.png', // Kling AI logo
  'Luma': '/home/ubuntu/upload/search_images/7YelTPeOMgMb.jpg', // Luma AI logo
  'Hailuo': '/home/ubuntu/upload/search_images/6qEUD0K0jLOK.jpg', // Hailuo logo
  'Sora': '/home/ubuntu/upload/search_images/PsXz5uwgosct.jpg', // Sora logo
  'HeyGen': '/home/ubuntu/upload/search_images/ODVUmFFOpSHg.png', // HeyGen logo
  'PixVerse': '/home/ubuntu/upload/search_images/E7kdslHpWN7x.png', // PixVerse logo
  'Veo': '/home/ubuntu/upload/search_images/mt2sMucHmPZ7.webp', // Veo logo
  
  // Audio tools
  'Suno AI': '/home/ubuntu/upload/search_images/8Lp6VVwTz6Kd.jpg', // Suno logo
  'Udio': '/home/ubuntu/upload/search_images/1Zh1QbH8jOV9.jpg', // Udio logo
  'ElevenLabs': '/home/ubuntu/upload/search_images/e6stqLzs1zkj.png', // ElevenLabs logo
  
  // Editing tools
  'Magnific': '/home/ubuntu/upload/search_images/wmiVV1MHHF6d.jpg', // Magnific logo
  'Topaz': '/home/ubuntu/upload/search_images/XgUVMW6iGtcS.png', // Topaz logo
  
  // Coding tools
  'Cursor': '/home/ubuntu/upload/search_images/CsemnqpRyAHx.jpg', // Cursor logo
  'Manus Code': '/home/ubuntu/upload/search_images/LQi7HXKDSMaE.jpeg', // Manus logo
  'Claude Code': '/home/ubuntu/upload/search_images/nPuDsYtxTiKH.jpg', // Claude logo
};

async function uploadAndUpdateIcons() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  for (const [toolName, imagePath] of Object.entries(toolIconMappings)) {
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`File not found: ${imagePath} for ${toolName}`);
        continue;
      }
      
      // Read file
      const fileBuffer = fs.readFileSync(imagePath);
      const ext = path.extname(imagePath);
      const contentType = ext === '.png' ? 'image/png' : 
                          ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                          ext === '.webp' ? 'image/webp' : 'image/png';
      
      // Generate unique key
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `tool-icons/${toolName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomSuffix}${ext}`;
      
      // Upload to S3
      const { url } = await storagePut(fileKey, fileBuffer, contentType);
      console.log(`Uploaded ${toolName}: ${url}`);
      
      // Update database
      await connection.execute(
        'UPDATE tools SET iconUrl = ? WHERE name = ?',
        [url, toolName]
      );
      console.log(`Updated database for ${toolName}`);
      
    } catch (error) {
      console.error(`Error processing ${toolName}:`, error.message);
    }
  }
  
  await connection.end();
  console.log('Done!');
}

uploadAndUpdateIcons().catch(console.error);
