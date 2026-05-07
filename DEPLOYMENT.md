# Deployment Guide

## Quick Deploy to Netlify

### Option 1: Via Netlify UI (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add enhanced portfolio with animations and sound effects"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your `Portfolio-Website` repository

3. **Configure Build Settings**:
   - **Branch to deploy**: `main`
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (just a dot)
   - Click "Deploy site"

4. **Done!** Your site will be live in ~30 seconds

### Option 2: Via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**:
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Custom Domain Setup

1. In Netlify dashboard, go to: **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `mohammadzayed.com`)
4. Follow instructions to update DNS records with your registrar
5. Netlify will automatically provision SSL certificate

## Environment Variables (Optional)

If you add any API keys or secrets in the future:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add variables as key-value pairs
3. Reference them in your code with `process.env.VARIABLE_NAME`

## Testing Before Deployment

Run the validation script:
```bash
python3 validate.py
```

Serve locally to test:
```bash
# Python
python3 -m http.server 8000

# Or use npx
npx serve

# Then visit http://localhost:8000
```

## Post-Deployment Checklist

- [ ] Test on multiple devices (desktop, tablet, mobile)
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify all links work (especially resume link)
- [ ] Test contact form submission
- [ ] Check sound effects toggle button
- [ ] Verify particle animation performs well
- [ ] Test all scroll animations
- [ ] Check mobile responsiveness
- [ ] Verify images load correctly
- [ ] Test navigation and anchor links

## Performance Optimization

The site is already optimized with:
- Netlify CDN for global distribution
- Asset caching (images, CSS, JS)
- Security headers
- Gzip compression
- Image optimization

For additional optimization:
- Consider converting images to WebP format
- Add lazy loading to images (already supported in modern browsers)
- Monitor with Lighthouse (integrated in Netlify)

## Troubleshooting

**Issue**: Particle animation is slow on mobile
- **Solution**: Already optimized! Particle count is reduced on mobile devices

**Issue**: Sound effects not working
- **Solution**: User interaction required first (browser security). Click anywhere to enable audio context

**Issue**: Form not submitting
- **Solution**: Check that Formspree endpoint is correct in index.html:171

**Issue**: 404 errors
- **Solution**: Check `_redirects` file and ensure all paths are correct

## Monitoring

Netlify provides:
- **Analytics**: Traffic, page views, bandwidth
- **Logs**: Deploy logs and function logs (if you add serverless functions)
- **Forms**: Submissions from your contact form

## Updates

To update your site:
```bash
# Make changes to files
git add .
git commit -m "Describe your changes"
git push origin main

# Netlify will auto-deploy (usually takes 30-60 seconds)
```

## Rollback

If something goes wrong:
1. Go to **Deploys** in Netlify dashboard
2. Find a previous successful deploy
3. Click "Publish deploy" to rollback

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://community.netlify.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/netlify)
