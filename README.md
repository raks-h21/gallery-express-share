# Memora - 3D Art Gallery

A stunning, immersive 3D art gallery application where you can create, share, and experience your memories and artworks in a beautiful virtual space.

## ✨ Features

### 🎨 **Gallery Management**
- Create unlimited galleries with custom names
- Upload images with titles and descriptions
- Attach audio narrations to artworks
- Edit and delete galleries easily
- Multi-gallery dashboard

### 🌐 **Advanced Sharing**
- **QR Code Generation**: Generate scannable QR codes for instant sharing
- **Shareable Links**: Create compressed URLs that encode your entire gallery
- **Social Sharing**: Share directly to Twitter and Facebook
- **No Backend Required**: All data is compressed and embedded in the URL

### 🎭 **Immersive 3D Experience**
- Interactive 3D gallery with smooth animations
- Dynamic lighting with spotlights on each artwork
- Mouse parallax camera movement
- Horizontal scrolling navigation
- Floating and rotating artwork animations
- Vignette post-processing effects

### 🎵 **Audio Features**
- Attach audio files to artworks
- Play/pause controls in 3D space
- Single audio playback (auto-pause others)
- Audio narration for guided tours

### 🎯 **User Experience**
- Modern dark theme with gold accents
- Glass morphism UI design
- Smooth animations and transitions
- Responsive design
- Intuitive navigation
- Beautiful typography (Playfair Display + Inter)

### 🔐 **Authentication**
- Simple user registration and login
- Local storage-based authentication
- Per-user gallery management

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Register/Login**: Create an account or login
2. **Create Gallery**: Click "Create Gallery" from dashboard
3. **Add Artworks**: Upload images, add titles and descriptions
4. **Optional Audio**: Attach audio narrations to artworks
5. **Save**: Click "Save Gallery" when ready
6. **View in 3D**: Switch to "View 3D" mode to experience your gallery
7. **Share**: Use the share button to generate QR codes and links

## 🎨 Technology Stack

- **React** + **TypeScript**: Core framework
- **React Three Fiber**: 3D rendering
- **@react-three/drei**: 3D helpers and utilities
- **@react-three/postprocessing**: Visual effects
- **Three.js**: 3D engine
- **Tailwind CSS**: Styling system
- **shadcn/ui**: UI components
- **qrcode.react**: QR code generation
- **LZ-String**: Data compression for sharing
- **Vite**: Build tool

## 📱 Features in Detail

### Gallery Sharing

The sharing system uses advanced compression to embed entire galleries (including images and audio) into shareable URLs:

1. Images and audio are converted to base64
2. Data is compressed using LZ-String
3. Compressed data is URL-encoded
4. QR codes point to the generated URLs
5. Recipients can view galleries without authentication

### 3D Gallery

The 3D viewer features:
- Dynamic spotlight illumination
- Smooth camera movements with mouse tracking
- Floating artwork animations
- Text rendering for titles and descriptions
- HTML overlays for interactive audio controls
- Post-processing vignette effect

## 🎯 Design Philosophy

**Elegant Simplicity**: Clean, sophisticated interface inspired by high-end art galleries

**Performance**: Optimized 3D rendering with smooth 60fps animations

**Accessibility**: Intuitive controls and clear visual hierarchy

**Shareability**: Frictionless sharing with QR codes and compressed links

## 📝 License

This project is open source and available under the MIT License.

## 🌟 Credits

Built with ❤️ using Lovable.dev

Fonts: Playfair Display (serif) + Inter (sans-serif)
