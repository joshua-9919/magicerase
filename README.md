# ✨ MagicErase

AI-powered image eraser tool - Remove objects from photos with one click.

![MagicErase](https://img.shields.io/badge/Status-MVP-purple)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20Tailwind%20CSS-blueviolet)

## 🎯 Features

- **One-Click Object Removal**: Simply paint over the object you want to remove
- **AI-Powered Inpainting**: Smart background filling using Clipdrop API
- **Privacy-First**: Images are processed in-memory, never stored
- **Modern UI**: Built with Next.js 14 + Tailwind CSS
- **Responsive Design**: Works perfectly on desktop and mobile
- **Drag & Drop**: Easy image upload with drag and drop support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Clipdrop API Key](https://clipdrop.co/apis)

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
   
   Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Clipdrop API key:
   ```
   CLIPDROP_API_KEY=your_clipdrop_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 in your browser

5. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## 📖 How to Use

1. **Upload Image**: Click "选择图片" or drag & drop an image
2. **Paint Mask**: Use the brush to mark areas you want to remove
3. **AI Erase**: Click "开始擦除" and wait for AI processing
4. **Download**: Save the processed image

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS 3
- **Language**: TypeScript
- **AI Service**: Clipdrop Cleanup API
- **Deployment**: Vercel / Cloudflare Pages

## 📁 Project Structure

```
magicerase/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── erase/
│   │   │       └── route.ts      # API endpoint
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .env.local                    # Local environment (gitignored)
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json
└── README.md
```

## 💰 Cost

- **Development**: Free (localhost)
- **Vercel Hobby**: Free (100GB bandwidth/month)
- **Clipdrop API**: 
  - Free: 100 images/month
  - Pay-as-you-go: ~$0.02/image
  
**Estimated cost for 100 images/day**: ~$60/month

## 🔒 Privacy

- Images are processed in-memory only
- No images are stored on servers
- All transfers use HTTPS encryption
- API keys are stored securely in environment variables

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

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variable `CLIPDROP_API_KEY`
5. Deploy!

### Deploy to Cloudflare Pages

1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Build: `npm run build`
4. Deploy: `wrangler pages deploy .next`

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
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS

## 📞 Contact

周建华 - [@joshua-9919](https://github.com/joshua-9919)

Project Link: [https://github.com/joshua-9919/magicerase](https://github.com/joshua-9919/magicerase)
