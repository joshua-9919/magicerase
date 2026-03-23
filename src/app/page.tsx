'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const processFile = (file: File) => {
    console.log('📁 收到文件:', file.name, file.type, file.size);
    setError(null);
    
    if (file.size > 10 * 1024 * 1024) {
      setError('文件过大！');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setLoading(true);
    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        console.log('🖼️ 原始图片:', img.width, 'x', img.height);
        setOriginalImage(img);
        setShowCanvas(true);
        
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas) {
            console.error('❌ Canvas 不存在');
            setError('Canvas 初始化失败');
            setLoading(false);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('❌ 无法获取上下文');
            setError('Canvas 初始化失败');
            setLoading(false);
            return;
          }

          // 保持原始尺寸，不缩放
          canvas.width = img.width;
          canvas.height = img.height;

          console.log('📐 Canvas:', canvas.width, 'x', canvas.height);
          ctx.drawImage(img, 0, 0);
          setLoading(false);
          console.log('✅ 完成');
        }, 200);
      };
      
      img.onerror = () => {
        setError('图片加载失败');
        setLoading(false);
      };
      
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = () => {
      setError('文件读取失败');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const startDrawing = () => setIsDrawing(true);
  const stopDrawing = () => setIsDrawing(false);

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    // 考虑 Canvas 的显示尺寸和实际尺寸的比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = ('touches' in e ? e.touches[0].clientX : e.clientX);
    const clientY = ('touches' in e ? e.touches[0].clientY : e.clientY);
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.fill();
  };

  const clearMask = () => {
    if (originalImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(originalImage, 0, 0);
    }
  };

  const handleErase = async () => {
    if (!uploadedFile || !canvasRef.current) {
      setError('请先上传图片并涂抹！');
      return;
    }

    setError(null);
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      console.log('🎨 Canvas 尺寸:', canvas.width, 'x', canvas.height);
      
      // 创建与 Canvas 相同尺寸的 mask（即原始图片尺寸）
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) throw new Error('无法创建 mask');

      // 填充黑色（保留区域）
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      // 绘制当前 Canvas 内容（包含红色涂抹）
      maskCtx.drawImage(canvas, 0, 0);

      // 获取像素数据并转换红色为白色
      const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 检测红色区域
        if (r > 150 && g < 100 && b < 100) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }

      maskCtx.putImageData(imageData, 0, 0);
      
      const maskBlob = await new Promise<Blob>((resolve) => {
        maskCanvas.toBlob((blob) => {
          console.log('📄 Mask:', blob?.type, blob?.size);
          resolve(blob || new Blob());
        }, 'image/png');
      });

      // 准备 FormData - 发送原始文件和对应尺寸的 mask
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('mask', maskBlob);

      console.log('🚀 发送到 API...');
      console.log('📦 图片:', uploadedFile.name, uploadedFile.size);
      console.log('📦 Mask:', maskBlob.type, maskBlob.size);
      
      const response = await fetch('/api/erase', { 
        method: 'POST', 
        body: formData 
      });

      console.log('📡 API 响应:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '处理失败' }));
        console.error('❌ API 错误:', errorData);
        throw new Error(errorData.details || errorData.error || '处理失败');
      }

      const resultBlob = await response.blob();
      console.log('✅ 处理成功，结果大小:', resultBlob.size);
      
      const resultImg = new Image();
      resultImg.onload = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(resultImg, 0, 0, canvas.width, canvas.height);
        }
        setIsProcessing(false);
      };
      resultImg.src = URL.createObjectURL(resultBlob);
    } catch (err) {
      console.error('❌ 错误:', err);
      setError('处理失败：' + (err as Error).message);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'magicerase-result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetEditor = () => {
    setShowCanvas(false);
    setUploadedFile(null);
    setOriginalImage(null);
    setError(null);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <header className="text-center text-white mb-8">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">✨ MagicErase</h1>
        <p className="text-xl opacity-95">AI 图片擦除工具</p>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>错误：</strong>{error}
              <button onClick={() => setError(null)} className="ml-4 text-red-500">✕</button>
            </div>
          )}

          <input 
            ref={fileInputRef}
            id="fileInput"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {!showCanvas ? (
            <div
              className="w-full h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {loading ? (
                <>
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">正在加载...</p>
                </>
              ) : (
                <>
                  <svg className="w-20 h-20 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">上传图片</h3>
                  <p className="text-gray-500 mb-4">JPG/PNG/WebP，最大 10MB</p>
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg transition">
                    📤 选择图片
                  </button>
                  <p className="text-gray-400 text-sm mt-4">或拖拽到此处</p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-4 relative">
              <div className="bg-white rounded-lg shadow-sm flex items-center justify-center min-h-[400px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto cursor-crosshair"
                  style={{ touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 rounded-lg">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-600 font-semibold text-lg">AI 处理中...</p>
                  <p className="text-gray-500 text-sm mt-2">请勿关闭或刷新页面</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-semibold text-gray-700">画笔大小</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-indigo-600 font-bold w-16 text-center">{brushSize}px</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={clearMask} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition">
                    🗑️ 清除
                  </button>
                  <button onClick={handleErase} disabled={isProcessing} className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition">
                    🪄 擦除
                  </button>
                  <button onClick={handleDownload} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition">
                    📥 下载
                  </button>
                  <button onClick={resetEditor} className="ml-auto border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition">
                    🔄 新图片
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">💡 使用步骤</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: 1, title: '上传', desc: '选择图片' },
              { num: 2, title: '涂抹', desc: '标记要移除的物体' },
              { num: 3, title: '擦除', desc: 'AI 自动处理' },
              { num: 4, title: '下载', desc: '保存结果' },
            ].map((step) => (
              <div key={step.num} className="text-center p-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-3">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-white/90 py-4">
          <p>Powered by Next.js + Clipdrop API</p>
        </footer>
      </div>
    </main>
  );
}
