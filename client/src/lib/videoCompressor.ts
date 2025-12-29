/**
 * Video Compressor Utility
 * Uses browser-based video compression for large files
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

// Maximum file size for direct upload (500MB)
export const MAX_DIRECT_UPLOAD_SIZE = 500 * 1024 * 1024;

// Target size for compression (200MB)
export const TARGET_COMPRESSED_SIZE = 200 * 1024 * 1024;

/**
 * Check if a file needs compression
 */
export function needsCompression(file: File): boolean {
  return file.size > MAX_DIRECT_UPLOAD_SIZE;
}

/**
 * Compress video using canvas and MediaRecorder
 * This is a browser-based solution that works without server-side processing
 */
export async function compressVideo(
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  const originalSize = file.size;
  
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: '動画を読み込んでいます...'
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
    progress: 20,
    message: '動画情報を取得しました'
  });

  // Calculate target dimensions (reduce resolution for large files)
  const originalWidth = video.videoWidth;
  const originalHeight = video.videoHeight;
  
  // Calculate scale factor based on file size
  // Larger files get more aggressive compression
  let scaleFactor = 1;
  if (file.size > 800 * 1024 * 1024) {
    scaleFactor = 0.5; // 50% for files > 800MB
  } else if (file.size > 500 * 1024 * 1024) {
    scaleFactor = 0.65; // 65% for files > 500MB
  } else if (file.size > 300 * 1024 * 1024) {
    scaleFactor = 0.75; // 75% for files > 300MB
  }
  
  const targetWidth = Math.round(originalWidth * scaleFactor);
  const targetHeight = Math.round(originalHeight * scaleFactor);
  
  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  
  onProgress?.({
    stage: 'compressing',
    progress: 30,
    message: `解像度を ${originalWidth}x${originalHeight} → ${targetWidth}x${targetHeight} に変更中...`
  });

  // Set up MediaRecorder with lower bitrate
  const stream = canvas.captureStream(30); // 30 fps
  
  // Try to get audio track from original video
  try {
    const audioContext = new AudioContext();
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
  
  // Calculate target bitrate based on file size
  // Aim for roughly 2-4 Mbps for web playback
  const targetBitrate = Math.min(4000000, Math.max(1500000, 
    Math.round((TARGET_COMPRESSED_SIZE * 8) / video.duration)
  ));
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: targetBitrate
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
  
  const duration = video.duration;
  let lastProgressUpdate = 0;
  
  const renderFrame = () => {
    if (video.ended || video.paused) {
      mediaRecorder.stop();
      return;
    }
    
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    
    // Update progress
    const currentProgress = 30 + (video.currentTime / duration) * 60;
    if (currentProgress - lastProgressUpdate > 5) {
      lastProgressUpdate = currentProgress;
      onProgress?.({
        stage: 'compressing',
        progress: Math.round(currentProgress),
        message: `圧縮中... ${Math.round((video.currentTime / duration) * 100)}%`
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
    progress: 90,
    message: 'エンコード中...'
  });
  
  const compressedBlob = await recordingPromise;
  
  // Clean up
  URL.revokeObjectURL(videoUrl);
  
  const compressedSize = compressedBlob.size;
  const compressionRatio = originalSize / compressedSize;
  
  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: `圧縮完了: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${Math.round((1 - compressedSize / originalSize) * 100)}% 削減)`
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
 * Simple chunked upload for large files
 * Splits file into chunks and uploads sequentially
 */
export async function uploadInChunks(
  file: File | Blob,
  uploadChunk: (chunk: string, index: number, total: number) => Promise<void>,
  onProgress?: (progress: number) => void,
  chunkSize: number = 10 * 1024 * 1024 // 10MB chunks
): Promise<void> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    // Convert chunk to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(chunk);
    });
    
    await uploadChunk(base64, i, totalChunks);
    
    onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
  }
}
