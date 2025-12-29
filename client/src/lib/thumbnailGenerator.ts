/**
 * Video Thumbnail Generator
 * Automatically extracts the optimal frame from a video for use as a thumbnail
 */

export interface ThumbnailCandidate {
  timestamp: number;
  dataUrl: string;
  score: number;
  brightness: number;
  contrast: number;
  sharpness: number;
}

export interface ThumbnailGenerationProgress {
  stage: 'loading' | 'analyzing' | 'selecting' | 'complete';
  progress: number;
  message: string;
}

export interface ThumbnailResult {
  dataUrl: string;
  blob: Blob;
  timestamp: number;
  score: number;
}

/**
 * Number of frames to sample for analysis
 */
const SAMPLE_COUNT = 10;

/**
 * Thumbnail dimensions
 */
const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;

/**
 * Generate optimal thumbnail from video
 */
export async function generateThumbnail(
  videoFile: File | Blob,
  onProgress?: (progress: ThumbnailGenerationProgress) => void
): Promise<ThumbnailResult> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: '動画を読み込んでいます...'
  });

  // Create video element
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  
  const videoUrl = URL.createObjectURL(videoFile);
  video.src = videoUrl;
  
  // Wait for metadata to load
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('動画の読み込みに失敗しました'));
  });

  onProgress?.({
    stage: 'loading',
    progress: 10,
    message: '動画情報を取得しました'
  });

  const duration = video.duration;
  const candidates: ThumbnailCandidate[] = [];
  
  // Create canvas for frame extraction
  const canvas = document.createElement('canvas');
  const aspectRatio = video.videoWidth / video.videoHeight;
  
  // Set canvas size maintaining aspect ratio
  if (aspectRatio > THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT) {
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = Math.round(THUMBNAIL_WIDTH / aspectRatio);
  } else {
    canvas.height = THUMBNAIL_HEIGHT;
    canvas.width = Math.round(THUMBNAIL_HEIGHT * aspectRatio);
  }
  
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  onProgress?.({
    stage: 'analyzing',
    progress: 15,
    message: 'フレームを分析中...'
  });

  // Sample frames at different timestamps
  // Skip first and last 5% of video to avoid intro/outro
  const startTime = duration * 0.05;
  const endTime = duration * 0.95;
  const interval = (endTime - startTime) / (SAMPLE_COUNT - 1);
  
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const timestamp = startTime + (interval * i);
    
    // Seek to timestamp
    video.currentTime = timestamp;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    
    // Draw frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const analysis = analyzeFrame(imageData);
    
    candidates.push({
      timestamp,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      score: analysis.score,
      brightness: analysis.brightness,
      contrast: analysis.contrast,
      sharpness: analysis.sharpness,
    });
    
    const progress = 15 + ((i + 1) / SAMPLE_COUNT) * 70;
    onProgress?.({
      stage: 'analyzing',
      progress: Math.round(progress),
      message: `フレーム ${i + 1}/${SAMPLE_COUNT} を分析中...`
    });
  }

  onProgress?.({
    stage: 'selecting',
    progress: 90,
    message: '最適なフレームを選択中...'
  });

  // Select the best candidate
  const bestCandidate = selectBestCandidate(candidates);
  
  // Convert data URL to blob
  const blob = await dataUrlToBlob(bestCandidate.dataUrl);
  
  // Clean up
  URL.revokeObjectURL(videoUrl);

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'サムネイルを生成しました'
  });

  return {
    dataUrl: bestCandidate.dataUrl,
    blob,
    timestamp: bestCandidate.timestamp,
    score: bestCandidate.score,
  };
}

/**
 * Analyze a frame for quality metrics
 */
function analyzeFrame(imageData: ImageData): {
  brightness: number;
  contrast: number;
  sharpness: number;
  score: number;
} {
  const data = imageData.data;
  const pixelCount = data.length / 4;
  
  // Calculate brightness (average luminance)
  let totalBrightness = 0;
  const brightnessValues: number[] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Perceived brightness formula
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    totalBrightness += brightness;
    brightnessValues.push(brightness);
  }
  
  const avgBrightness = totalBrightness / pixelCount;
  
  // Calculate contrast (standard deviation of brightness)
  let varianceSum = 0;
  for (const brightness of brightnessValues) {
    varianceSum += Math.pow(brightness - avgBrightness, 2);
  }
  const contrast = Math.sqrt(varianceSum / pixelCount);
  
  // Calculate sharpness using Laplacian variance
  const sharpness = calculateSharpness(imageData);
  
  // Calculate overall score
  // Prefer frames with:
  // - Moderate brightness (not too dark or too bright)
  // - High contrast (interesting content)
  // - High sharpness (in focus)
  
  // Brightness score: penalize extremes, prefer 0.3-0.7 range
  let brightnessScore: number;
  if (avgBrightness < 0.15) {
    brightnessScore = avgBrightness / 0.15 * 0.5; // Very dark
  } else if (avgBrightness > 0.85) {
    brightnessScore = (1 - avgBrightness) / 0.15 * 0.5; // Very bright
  } else if (avgBrightness >= 0.3 && avgBrightness <= 0.7) {
    brightnessScore = 1.0; // Ideal range
  } else if (avgBrightness < 0.3) {
    brightnessScore = 0.5 + (avgBrightness - 0.15) / 0.15 * 0.5;
  } else {
    brightnessScore = 0.5 + (0.85 - avgBrightness) / 0.15 * 0.5;
  }
  
  // Contrast score: higher is better, normalized
  const contrastScore = Math.min(contrast / 0.25, 1.0);
  
  // Sharpness score: higher is better, normalized
  const sharpnessScore = Math.min(sharpness / 50, 1.0);
  
  // Weighted combination
  const score = (brightnessScore * 0.3) + (contrastScore * 0.35) + (sharpnessScore * 0.35);
  
  return {
    brightness: avgBrightness,
    contrast,
    sharpness,
    score,
  };
}

/**
 * Calculate image sharpness using Laplacian variance
 */
function calculateSharpness(imageData: ImageData): number {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  // Convert to grayscale and calculate Laplacian
  let laplacianSum = 0;
  let count = 0;
  
  // Sample every 4th pixel for performance
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const idxUp = ((y - 1) * width + x) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const idxRight = (y * width + (x + 1)) * 4;
      
      // Get grayscale values
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const up = (data[idxUp] + data[idxUp + 1] + data[idxUp + 2]) / 3;
      const down = (data[idxDown] + data[idxDown + 1] + data[idxDown + 2]) / 3;
      const left = (data[idxLeft] + data[idxLeft + 1] + data[idxLeft + 2]) / 3;
      const right = (data[idxRight] + data[idxRight + 1] + data[idxRight + 2]) / 3;
      
      // Laplacian kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
      const laplacian = Math.abs(up + down + left + right - 4 * center);
      laplacianSum += laplacian;
      count++;
    }
  }
  
  return count > 0 ? laplacianSum / count : 0;
}

/**
 * Select the best candidate from analyzed frames
 */
function selectBestCandidate(candidates: ThumbnailCandidate[]): ThumbnailCandidate {
  if (candidates.length === 0) {
    throw new Error('No candidates available');
  }
  
  // Sort by score descending
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  
  // Return the best one
  return sorted[0];
}

/**
 * Convert data URL to Blob
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Generate thumbnail from video URL
 */
export async function generateThumbnailFromUrl(
  videoUrl: string,
  onProgress?: (progress: ThumbnailGenerationProgress) => void
): Promise<ThumbnailResult> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: '動画をダウンロード中...'
  });
  
  const response = await fetch(videoUrl);
  const blob = await response.blob();
  
  return generateThumbnail(blob, onProgress);
}

/**
 * Generate thumbnail at specific timestamp
 */
export async function generateThumbnailAtTimestamp(
  videoFile: File | Blob,
  timestamp: number
): Promise<ThumbnailResult> {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  
  const videoUrl = URL.createObjectURL(videoFile);
  video.src = videoUrl;
  
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('動画の読み込みに失敗しました'));
  });
  
  // Clamp timestamp to valid range
  const clampedTimestamp = Math.max(0, Math.min(timestamp, video.duration));
  
  video.currentTime = clampedTimestamp;
  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve();
  });
  
  const canvas = document.createElement('canvas');
  const aspectRatio = video.videoWidth / video.videoHeight;
  
  if (aspectRatio > THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT) {
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = Math.round(THUMBNAIL_WIDTH / aspectRatio);
  } else {
    canvas.height = THUMBNAIL_HEIGHT;
    canvas.width = Math.round(THUMBNAIL_HEIGHT * aspectRatio);
  }
  
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const blob = await dataUrlToBlob(dataUrl);
  
  URL.revokeObjectURL(videoUrl);
  
  return {
    dataUrl,
    blob,
    timestamp: clampedTimestamp,
    score: 1.0, // Manual selection, assume good
  };
}
