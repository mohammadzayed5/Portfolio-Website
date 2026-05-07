# Mohammad Zayed — Portfolio

A modern, interactive portfolio built with React featuring space particle animations, procedural sound effects, and smooth scroll-triggered animations. Inspired by Linear's design aesthetic.

![Portfolio Screenshot](assets/headshot.jpg)

## ✨ Features

### 🚀 **Rocket-Rail Navigation**
- Unique navigation with animated rocket ship that travels along a track
- Smooth scroll progress indicator
- Active section highlighting
- Direct jump-to-section functionality

### ⭐ **Space Particle Background**
- Canvas-based particle system with 80+ animated stars
- Twinkling star effects with parallax movement
- Occasional shooting star animations
- Mouse-interactive particles that respond to cursor movement

### 🔊 **Procedural Sound Effects**
- Click sounds on buttons (procedurally generated with Web Audio API)
- Swoosh sounds on navigation
- Hover sounds on interactive elements
- Toggleable sound with floating mute button
- **Zero audio files required** - all sounds generated in real-time!

### 📦 **Interactive Project Cards**
Live, interactive demos embedded directly in project cards:
- **Mini Golf Score Tracker**: Working scorecard with +/- buttons, live leaderboard
- **Chick-fil-A Portal**: Toggleable public/team view
- **Nutrition Tracker**: Interactive macro rings and meal logging

### 📖 **Full Case Studies**
- Slide-up modal overlays with detailed project information
- Problem statement, approach, tech stack
- Metrics and key achievements
- Screenshot galleries (when available)

### 🎨 **Customizable Design**
- Built-in Tweaks Panel for real-time customization
- Adjustable accent colors
- Configurable star density and hue
- Font family switching (Display, Serif, Mono)
- Sound effect toggle

### 📱 **Fully Responsive**
- Mobile-first design approach
- Optimized for all screen sizes
- Touch-friendly interactions
- Adaptive scroll cues (mouse/finger)

## 🛠️ Tech Stack

- **React 18** - UI framework (loaded via CDN)
- **Babel Standalone** - JSX transformation in browser
- **Canvas API** - Particle effects
- **Web Audio API** - Procedural sound generation
- **Intersection Observer API** - Scroll animations
- **CSS Custom Properties** - Dynamic theming
- **Netlify** - Hosting and deployment

## 📂 File Structure

```
Portfolio-Website/
├── Portfolio.html          # Main HTML file (entry point)
├── styles.css             # Complete CSS styling
├── app.jsx                # Main React app component
├── data.jsx               # Projects, experience, skills data
├── particles.jsx          # Particle background system
├── tech-icons.jsx         # SVG technology icons
├── live-demos.jsx         # Interactive project demos
├── case-study.jsx         # Project case study modal
├── utils.jsx              # Utility functions and hooks
├── tweaks-panel.jsx       # Customization panel
├── assets/
│   └── headshot.jpg       # Profile photo
├── netlify.toml           # Netlify configuration
├── _redirects             # Netlify redirect rules
└── README.md              # This file
```

## 🚀 Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mohammadzayed5/Portfolio-Website.git
   cd Portfolio-Website
   ```

2. **Serve locally** (choose one method):

   Using Python:
   ```bash
   python3 -m http.server 8000
   ```

   Using Node.js:
   ```bash
   npx serve
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000/Portfolio.html
   ```

### Netlify Deployment

#### Option 1: Netlify UI (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy modern portfolio with React and animations"
   git push origin main
   ```

2. Go to [netlify.com](https://netlify.com) and sign in

3. Click "Add new site" → "Import an existing project"

4. Choose GitHub and select your `Portfolio-Website` repository

5. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
   - Click "Deploy site"

6. Your site will be live in ~30 seconds!

#### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Set as Homepage

To make `Portfolio.html` your default page on Netlify:

1. Rename `Portfolio.html` to `index.html`:
   ```bash
   mv Portfolio.html index.html
   ```

2. Update script references in all `.jsx` files if needed

3. Redeploy

**OR** use the `_redirects` file (already configured):
```
/    /Portfolio.html    200
```

## 📝 Customization

### Update Your Information

Edit `data.jsx` to customize:
- Projects and case studies
- Work experience
- Skills list
- Contact information

### Change Theme

The design uses CSS custom properties. Edit `styles.css`:

```css
:root {
  --accent: #3b82f6;      /* Primary blue */
  --accent-soft: rgba(59, 130, 246, 0.15);
  --accent-glow: rgba(59, 130, 246, 0.25);
}
```

Or use the built-in Tweaks Panel (visible in dev mode) to adjust:
- Accent color
- Star density
- Star hue
- Headline font
- Sound effects

### Add Project Screenshots

Place images in `assets/` folder and update `data.jsx`:

```javascript
{
  id: "myproject",
  // ... other fields
  images: ["assets/screenshot1.png", "assets/screenshot2.png"],
}
```

### Replace Headshot

Replace `assets/headshot.jpg` with your photo (recommended size: 500x500px, square)

## 🎵 Sound System

The portfolio uses the Web Audio API to generate sounds procedurally:

- **Click**: Triangle wave, 880Hz → 440Hz sweep
- **Swoosh**: Bandpass-filtered noise, 400Hz → 2000Hz
- **Hover**: Sine wave, 1200Hz tone

Toggle sounds on/off with the floating speaker button (bottom-right).

## 🎨 Design Inspiration

This portfolio draws inspiration from:
- [Linear](https://linear.app) - Clean, modern design aesthetic
- [Vercel](https://vercel.com) - Smooth animations and transitions
- [Stripe](https://stripe.com) - Professional polish and attention to detail

## 📊 Performance

- **Particle system**: 60fps on most devices
- **Reduced particle count on mobile** for better performance
- **Lazy loading** for images
- **Efficient scroll animations** with Intersection Observer
- **Minimal dependencies** (React loaded via CDN)

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

**Note**: Web Audio API requires user interaction before playing sounds (browser security feature).

## 📄 License

Portfolio template: Custom design
Original template credit: HTML5 UP (previous version)
Fonts: Google Fonts (Geist, Inter, JetBrains Mono, Instrument Serif)

## 📞 Contact

**Mohammad Zayed**
- Email: mohammadzayed521@gmail.com
- GitHub: [@mohammadzayed5](https://github.com/mohammadzayed5)
- LinkedIn: [mohammadzayedd](https://www.linkedin.com/in/mohammadzayedd/)
- Resume: [Google Docs](https://docs.google.com/document/d/1Ohw6ioUVG2cwwxDLZ_h6QjHHe-sMzBdk/edit)

---

Built with ❤️ using React, Canvas API, and Web Audio API
Deployed on Netlify
