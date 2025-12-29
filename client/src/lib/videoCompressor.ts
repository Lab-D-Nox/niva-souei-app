/**
 * Video Compressor Utility
 * Uses browser-based video compression for large files
 * Optimized for quality/size balance with user-selectable presets
 */

export interface CompressionProgress {
  stage: 'loading' | 'compressing' | 'encoding' | 'complete';
  progress: number; // 0-100
  message: string;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Quality presets for video compression
 * - high: Best quality, larger file size (recommended for portfolio/showcase)
 * - balanced: Good quality with reasonable file size (default)
 * - compact: Smaller file size, acceptable quality (for quick uploads)
 */
export type QualityPreset = 'high' | 'balanced' | 'compact';

export interface QualitySettings {
  name: string;
  description: string;
  // Resolution scale factor (1.0 = original, 0.5 = half)
  minScaleFactor: number;
  maxScaleFactor: number;
  // Target bitrate range in Mbps
  minBitrateMbps: number;
  maxBitrateMbps: number;
  // Frame rate
  frameRate: number;
  // Target compression ratio (original / compressed)
  targetRatio: number;
}

export const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
  high: {
    name: '高画質',
    description: '最高品質。ポートフォリオや作品展示に最適',
    minScaleFactor: 0.85,
    maxScaleFactor: 1.0,
    minBitrateMbps: 6,
    maxBitrateMbps: 12,
    frameRate: 30,
    targetRatio: 2,
  },
  balanced: {
    name: 'バランス',
    description: '品質とファイルサイズのバランスが良い（推奨）',
    minScaleFactor: 0.7,
    maxScaleFactor: 0.9,
    minBitrateMbps: 3,
    maxBitrateMbps: 6,
    frameRate: 30,
    targetRatio: 4,
  },
  compact: {
    name: '軽量',
    description: 'ファイルサイズ優先。素早いアップロードに最適',
    minScaleFactor: 0.5,
    maxScaleFactor: 0.7,
    minBitrateMbps: 1.5,
    maxBitrateMbps: 3,
    frameRate: 24,
    targetRatio: 6,
  },
};

// Maximum file size for direct upload (500MB)
export const MAX_DIRECT_UPLOAD_SIZE = 500 * 1024 * 1024;

/**
 * Check if a file needs compression
 */
export function needsCompression(file: File): boolean {
  return file.size > MAX_DIRECT_UPLOAD_SIZE;
}

/**
 * Calculate optimal settings based on file size and quality preset
 */
function calculateSettings(
  fileSize: number,
  originalWidth: number,
  originalHeight: number,
  duration: number,
  preset: QualityPreset
): { scaleFactor: number; bitrate: number; frameRate: number } {
  const settings = QUALITY_PRESETS[preset];
  const fileSizeMB = fileSize / (1024 * 1024);
  
  // Calculate scale factor based on file size within preset range
  // Larger files get more aggressive scaling
  let scaleFactor: number;
  if (fileSizeMB > 1000) {
    // > 1GB: use minimum scale
    scaleFactor = settings.minScaleFactor;
  } else if (fileSizeMB > 700) {
    // 700MB - 1GB: interpolate toward minimum
    const ratio = (fileSizeMB - 700) / 300;
    scaleFactor = settings.maxScaleFactor - ratio * (settings.maxScaleFactor - settings.minScaleFactor);
  } else if (fileSizeMB > 500) {
    // 500MB - 700MB: use middle of range
    scaleFactor = (settings.minScaleFactor + settings.maxScaleFactor) / 2;
  } else {
    // < 500MB: use maximum scale (best quality)
    scaleFactor = settings.maxScaleFactor;
  }
  
  // Ensure minimum resolution of 720p for high quality, 480p for others
  const targetHeight = originalHeight * scaleFactor;
  const minHeight = preset === 'high' ? 720 : preset === 'balanced' ? 540 : 480;
  if (targetHeight < minHeight && originalHeight >= minHeight) {
    scaleFactor = minHeight / originalHeight;
  }
  
  // Calculate bitrate based on target resolution and duration
  const targetWidth = Math.round(originalWidth * scaleFactor);
  const targetHeightFinal = Math.round(originalHeight * scaleFactor);
  const pixels = targetWidth * targetHeightFinal;
  
  // Base bitrate calculation: higher resolution needs more bitrate
  // Reference: 1080p (2M pixels) typically needs 4-8 Mbps for good quality
  const pixelRatio = pixels / (1920 * 1080);
  let baseBitrateMbps = settings.minBitrateMbps + 
    (settings.maxBitrateMbps - settings.minBitrateMbps) * Math.min(pixelRatio, 1);
  
  // Adjust for duration - longer videos can use slightly lower bitrate
  if (duration > 120) {
    baseBitrateMbps *= 0.9;
  } else if (duration > 60) {
    baseBitrateMbps *= 0.95;
  }
  
  // Ensure bitrate is within preset bounds
  const bitrate = Math.max(
    settings.minBitrateMbps * 1000000,
    Math.min(settings.maxBitrateMbps * 1000000, baseBitrateMbps * 1000000)
  );
  
  return {
    scaleFactor,
    bitrate: Math.round(bitrate),
    frameRate: settings.frameRate,
  };
}

/**
 * Compress video using canvas and MediaRecorder
 * This is a browser-based solution that works without server-side processing
 */
export async function compressVideo(
  file: File,
  onProgress?: (progress: CompressionProgress) => void,
  quality: QualityPreset = 'balanced'
): Promise<CompressionResult> {
  const originalSize = file.size;
  const qualitySettings = QUALITY_PRESETS[quality];
  
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: `動画を読み込んでいます...（${qualitySettings.name}モード）`
  });

  // Create video element to load the file
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  
  const videoUrl = URL.createObjectURL(file);
  video.src = videoUrl;
  
  // Wait for video metadata to load
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('動画の読み込みに失敗しました'));
  });

  onProgress?.({
    stage: 'loading',
    progress: 15,
    message: '動画情報を取得しました'
  });

  const originalWidth = video.videoWidth;
  const originalHeight = video.videoHeight;
  const duration = video.duration;
  
  // Calculate optimal settings
  const { scaleFactor, bitrate, frameRate } = calculateSettings(
    file.size,
    originalWidth,
    originalHeight,
    duration,
    quality
  );
  
  const targetWidth = Math.round(originalWidth * scaleFactor);
  const targetHeight = Math.round(originalHeight * scaleFactor);
  
  onProgress?.({
    stage: 'loading',
    progress: 20,
    message: `設定: ${originalWidth}x${originalHeight} → ${targetWidth}x${targetHeight}, ${(bitrate / 1000000).toFixed(1)}Mbps`
  });
  
  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  
  // Enable image smoothing for better quality when downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  onProgress?.({
    stage: 'compressing',
    progress: 25,
    message: `${qualitySettings.name}モードで圧縮を開始...`
  });

  // Set up MediaRecorder
  const stream = canvas.captureStream(frameRate);
  
  // Try to get audio track from original video
  let audioContext: AudioContext | null = null;
  try {
    audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    source.connect(audioContext.destination);
    
    // Add audio track to stream
    destination.stream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
    });
  } catch (e) {
    console.warn('Could not extract audio:', e);
  }
  
  // Try VP9 first (better quality), fall back to VP8
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: bitrate,
  });
  
  const chunks: Blob[] = [];
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  // Start recording and play video
  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };
    mediaRecorder.onerror = (e) => reject(e);
  });
  
  mediaRecorder.start(100); // Collect data every 100ms
  
  // Play video and render to canvas
  video.currentTime = 0;
  await video.play();
  
  let lastProgressUpdate = 0;
  
  const renderFrame = () => {
    if (video.ended || video.paused) {
      mediaRecorder.stop();
      return;
    }
    
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    
    // Update progress
    const currentProgress = 25 + (video.currentTime / duration) * 65;
    if (currentProgress - lastProgressUpdate > 3) {
      lastProgressUpdate = currentProgress;
      const percent = Math.round((video.currentTime / duration) * 100);
      onProgress?.({
        stage: 'compressing',
        progress: Math.round(currentProgress),
        message: `圧縮中... ${percent}%`
      });
    }
    
    requestAnimationFrame(renderFrame);
  };
  
  renderFrame();
  
  // Wait for video to end
  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });
  
  onProgress?.({
    stage: 'encoding',
    progress: 92,
    message: 'エンコード完了処理中...'
  });
  
  const compressedBlob = await recordingPromise;
  
  // Clean up
  URL.revokeObjectURL(videoUrl);
  if (audioContext) {
    audioContext.close();
  }
  
  const compressedSize = compressedBlob.size;
  const compressionRatio = originalSize / compressedSize;
  const reductionPercent = Math.round((1 - compressedSize / originalSize) * 100);
  
  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: `圧縮完了: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${reductionPercent}% 削減)`
  });
  
  return {
    blob: compressedBlob,
    originalSize,
    compressedSize,
    compressionRatio
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

/**
 * Estimate compressed file size based on quality preset
 */
export function estimateCompressedSize(
  originalSize: number,
  quality: QualityPreset
): number {
  const settings = QUALITY_PRESETS[quality];
  return Math.round(originalSize / settings.targetRatio);
}

/**
 * Get recommended quality preset based on file size
 */
export function getRecommendedQuality(fileSize: number): QualityPreset {
  const sizeMB = fileSize / (1024 * 1024);
  if (sizeMB > 800) {
    return 'compact'; // Very large files benefit from compact mode
  } else if (sizeMB > 600) {
    return 'balanced';
  } else {
    return 'high'; // Smaller files can afford high quality
  }
}
