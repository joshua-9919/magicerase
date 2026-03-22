# ✨ MagicErase

AI-powered image eraser tool - Remove objects from photos with one click.

![MagicErase](https://img.shields.io/badge/Status-MVP-purple)
![License](https://img.shields.io/badge/License-MIT-blue)
![Powered by](https://img.shields.io/badge/Powered%20by-Cloudflare%20%2B%20Clipdrop-orange)

## 🎯 Features

- **One-Click Object Removal**: Simply paint over the object you want to remove
- **AI-Powered Inpainting**: Smart background filling using Clipdrop API
- **Privacy-First**: Images are processed in-memory, never stored
- **Fast & Free**: Powered by Cloudflare Workers edge network
- **No Installation**: Works directly in your browser

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Clipdrop API Key](https://clipdrop.co/apis)
- [Cloudflare Account](https://dash.cloudflare.com/sign-up)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joshua-9919/magicerase.git
   cd magicerase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Edit `wrangler.toml` and add your Clipdrop API key:
   ```toml
   [vars]
   CLIPDROP_API_KEY = "your_clipdrop_api_key_here"
   ```

4. **Development mode**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:8787 in your browser

5. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

## 📖 How to Use

1. **Upload Image**: Click "选择图片" or drag & drop an image
2. **Paint Mask**: Use the brush to mark areas you want to remove
3. **AI Erase**: Click "开始擦除" and wait for AI processing
4. **Download**: Save the processed image

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Backend**: Cloudflare Workers (Serverless)
- **AI Service**: Clipdrop Cleanup API
- **Deployment**: Cloudflare Pages + Workers
- **Styling**: Custom CSS (no frameworks)

## 📁 Project Structure

```
magicerase/
├── public/
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styles
│   └── app.js          # Frontend logic
├── src/
│   └── index.ts        # Cloudflare Workers backend
├── package.json
├── wrangler.toml       # Cloudflare config
└── README.md
```

## 💰 Cost

- **Cloudflare Workers**: Free tier includes 100k requests/day
- **Clipdrop API**: 
  - Free: 100 images/month
  - Pay-as-you-go: ~$0.02/image
  
**Estimated cost for 100 images/day**: ~$2/month

## 🔒 Privacy

- Images are processed in-memory only
- No images are stored on servers
- All transfers use HTTPS encryption
- API keys are stored securely in Workers environment variables

## 📝 API Reference

### POST /api/erase

Process an image for object removal.

**Request:**
```
Content-Type: multipart/form-data

Parameters:
- image: File (JPG/PNG/WebP, max 10MB)
- mask: File (PNG, white=remove, black=keep)
```

**Response:**
```
Content-Type: image/png
Body: Processed image
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clipdrop](https://clipdrop.co/) for the amazing AI API
- [Cloudflare Workers](https://workers.cloudflare.com/) for the serverless platform
- [Cleanup.pictures](https://cleanup.pictures/) for inspiration

## 📞 Contact

周建华 - [@joshua-9919](https://github.com/joshua-9919)

Project Link: [https://github.com/joshua-9919/magicerase](https://github.com/joshua-9919/magicerase)
