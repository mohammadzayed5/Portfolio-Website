# Quick Deployment Guide

## 🚀 Deploy to Netlify in 3 Minutes

### Step 1: View Locally (Optional)
```bash
python3 -m http.server 8000
# Open http://localhost:8000/Portfolio.html
```

### Step 2: Commit Changes
```bash
git add .
git commit -m "Add modern React portfolio with animations and sound effects

- Rocket-rail navigation with scroll progress
- Space particle background with mouse interaction
- Procedural sound effects (Web Audio API)
- Interactive project demos
- Full case study modals
- Mobile responsive design
"
git push origin main
```

### Step 3: Deploy on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** → Choose `Portfolio-Website` repo
4. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Click **"Deploy site"**

**Done!** Your site will be live in ~30 seconds 🎉

---

## 📝 Post-Deployment

### Set Custom Domain (Optional)
1. Netlify Dashboard → **Domain settings**
2. Click **Add custom domain**
3. Enter your domain
4. Follow DNS configuration instructions

### Test Your Site
✅ Rocket navigation animates on scroll
✅ Stars twinkle and respond to mouse
✅ Sound effects play on click/hover
✅ Project demos are interactive
✅ Mobile responsive
✅ All sections load smoothly

---

## 🔧 Customization Checklist

Before deploying, consider updating:

- [ ] `data.jsx` - Replace with your own projects
- [ ] `assets/headshot.jpg` - Add your photo
- [ ] `Portfolio.html` title tag
- [ ] Resume link in `app.jsx`
- [ ] Contact email in `app.jsx` and `case-study.jsx`
- [ ] Social links in `app.jsx` footer

---

## 🐛 Troubleshooting

**Problem**: Site shows blank page
- **Solution**: Open browser console (F12), check for errors
- **Common cause**: Missing JSX files or incorrect paths

**Problem**: Sounds don't play
- **Solution**: Click anywhere on the page first (browser security requirement)
- **Check**: Sound toggle button (bottom-right) is not muted

**Problem**: Navigation rocket doesn't move
- **Solution**: Scroll down to trigger section changes
- **Check**: Browser supports modern JavaScript (Chrome/Firefox/Safari latest)

**Problem**: 404 on Portfolio.html
- **Solution**: Netlify redirect is configured via `_redirects` file
- **Alternative**: Rename `Portfolio.html` to `index.html`

---

## 📊 File Size Reference

```
Portfolio.html     ~2 KB    (entry point)
styles.css         ~31 KB   (all styles)
app.jsx           ~22 KB   (main app logic)
data.jsx          ~6 KB    (your content)
particles.jsx     ~5 KB    (particle system)
tech-icons.jsx    ~6 KB    (SVG icons)
live-demos.jsx    ~9 KB    (interactive demos)
case-study.jsx    ~5 KB    (modal overlays)
utils.jsx         ~2 KB    (helpers)
tweaks-panel.jsx  ~26 KB   (customization panel)
```

**Total**: ~115 KB (before external CDN resources)

React + ReactDOM + Babel loaded from CDN (not counted in deploy size)

---

## 🌟 What Makes This Portfolio Special

1. **No Build Step** - Pure React via CDN, instant deployment
2. **Interactive Demos** - Live project previews in cards
3. **Procedural Audio** - Sounds generated on-the-fly, no audio files
4. **Canvas Animation** - Smooth 60fps particle system
5. **One File Updates** - Edit `data.jsx` to update all content

---

**Ready to go live?** Follow Step 2 and Step 3 above!
