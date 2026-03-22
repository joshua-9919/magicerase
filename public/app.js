/**
 * MagicErase - Frontend Application
 * Handles image upload, canvas editing, and API communication
 */

// DOM Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const controls = document.getElementById('controls');
const uploadInput = document.getElementById('upload');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const eraseBtn = document.getElementById('erase');
const downloadBtn = document.getElementById('download');
const clearMaskBtn = document.getElementById('clearMask');
const undoBtn = document.getElementById('undo');
const newImageBtn = document.getElementById('newImage');

// State
let originalImage = null;
let originalImageFile = null;
let isDrawing = false;
let brushSize = 30;
let maskHistory = []; // For undo functionality

// Initialize
function init() {
  setupEventListeners();
  setupDragAndDrop();
}

function setupEventListeners() {
  // Upload
  uploadInput.addEventListener('change', handleUpload);
  
  // Canvas drawing
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Touch support
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', stopDrawing);
  
  // Controls
  brushSizeInput.addEventListener('input', updateBrushSize);
  eraseBtn.addEventListener('click', processImage);
  downloadBtn.addEventListener('click', downloadResult);
  clearMaskBtn.addEventListener('click', clearMask);
  undoBtn.addEventListener('click', undoLastStroke);
  newImageBtn.addEventListener('click', resetEditor);
}

function setupDragAndDrop() {
  const canvasContainer = document.querySelector('.canvas-container');
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    canvasContainer.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  canvasContainer.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    handleFile(files[0]);
  }
}

function handleUpload(e) {
  const files = e.target.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
}

function handleFile(file) {
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('文件过大！请选择小于 10MB 的图片。');
    return;
  }

  originalImageFile = file;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      loadCanvas(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function loadCanvas(img) {
  // Set canvas size to match image
  const maxWidth = 800;
  const scale = Math.min(1, maxWidth / img.width);
  
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  // Draw original image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Show canvas, hide placeholder
  canvas.style.display = 'block';
  placeholder.style.display = 'none';
  controls.style.display = 'block';
  downloadBtn.style.display = 'none';
  
  // Reset history
  maskHistory = [];
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function startDrawing(e) {
  isDrawing = true;
  
  // Save state for undo
  maskHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (maskHistory.length > 10) {
    maskHistory.shift(); // Keep last 10 states
  }
  
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Draw red semi-transparent brush
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // Red with 50% opacity
  ctx.fill();
}

function stopDrawing() {
  isDrawing = false;
}

function updateBrushSize(e) {
  brushSize = parseInt(e.target.value);
  brushSizeValue.textContent = brushSize + 'px';
}

function clearMask() {
  if (originalImage) {
    ctx.putImageData(originalImage, 0, 0);
    maskHistory = [];
  }
}

function undoLastStroke() {
  if (maskHistory.length > 0 && originalImage) {
    const lastState = maskHistory.pop();
    ctx.putImageData(lastState, 0, 0);
  } else {
    // If no history, restore original
    clearMask();
  }
}

async function processImage() {
  if (!originalImageFile) {
    alert('请先上传图片！');
    return;
  }
  
  // Show loading
  loading.classList.add('active');
  eraseBtn.disabled = true;
  
  try {
    // Create mask from current canvas state
    const maskBlob = await createMask();
    
    // Prepare form data
    const formData = new FormData();
    formData.append('image', originalImageFile);
    formData.append('mask', maskBlob);
    
    // Call API
    const response = await fetch('/api/erase', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '处理失败，请重试');
    }
    
    // Display result
    const resultBlob = await response.blob();
    const resultImg = new Image();
    resultImg.onload = function() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(resultImg, 0, 0, canvas.width, canvas.height);
      loading.classList.remove('active');
      eraseBtn.disabled = false;
      downloadBtn.style.display = 'inline-flex';
    };
    resultImg.src = URL.createObjectURL(resultBlob);
    
  } catch (error) {
    console.error('Error:', error);
    alert('处理失败：' + error.message);
    loading.classList.remove('active');
    eraseBtn.disabled = false;
  }
}

async function createMask() {
  // Create a black and white mask from current canvas
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext('2d');
  
  // Fill with black (areas to keep)
  maskCtx.fillStyle = 'black';
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  
  // Draw current canvas content to detect red areas
  maskCtx.drawImage(canvas, 0, 0);
  
  // Get image data and convert red areas to white
  const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Detect red-ish pixels (our brush color)
    if (r > 150 && g < 100 && b < 100) {
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // Alpha
    } else {
      data[i] = 0;       // R
      data[i + 1] = 0;   // G
      data[i + 2] = 0;   // B
      data[i + 3] = 255; // Alpha
    }
  }
  
  maskCtx.putImageData(imageData, 0, 0);
  
  return new Promise(resolve => {
    maskCanvas.toBlob(resolve, 'image/png');
  });
}

function downloadResult() {
  const link = document.createElement('a');
  link.download = 'magicerase-result.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function resetEditor() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.display = 'none';
  placeholder.style.display = 'flex';
  controls.style.display = 'none';
  downloadBtn.style.display = 'none';
  
  // Reset state
  originalImage = null;
  originalImageFile = null;
  maskHistory = [];
  
  // Reset file input
  uploadInput.value = '';
}

// Initialize app
init();
