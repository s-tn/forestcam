# ForestCam - Cameron Bryzek's Portfolio Website

A personal portfolio website featuring a gallery of leather projects, music compositions, and progress tracking. Built with Node.js and NebulaJS framework with real-time updates via Socket.IO.

## Features

- **Gallery**: Image gallery for leather projects with captions
- **Music**: Music player for compositions and performances
- **Progress Bars**: Track project progress in real-time
- **Admin Panel**: Password-protected admin interface for content management
- **Real-time Updates**: Socket.IO integration for live content updates

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

```bash
# Install dependencies
npm install
```

## Local Development

### Starting the Development Server

```bash
# Start the server on port 5555
npm start
```

The website will be available at `http://localhost:5555`

### Development Server Details

The `npm start` command runs:
```bash
node lib/cli/cli.js dev --port 5555 --server 'http server.js' --plugin socket.io
```

This uses the NebulaJS development CLI which:
- Serves the application on port 5555
- Loads `server.js` with Socket.IO plugin
- Serves static files from `/public` directory
- Serves pages from `/pages` directory (`.nebula.html` files)
- Serves images from `/imgs` directory
- Provides hot-reloading during development

## Deployment

### Overview

This site is deployed on **Replit** and is configured for automatic deployment when changes are pushed to GitHub.

**Production URL**: `https://forestcam--enderkingj.repl.co` (or custom domain: `https://cameronbryzek.com`)

### Deployment Workflow

#### Step 1: Make Changes Locally

Make your changes to the codebase (HTML pages, CSS, JavaScript, etc.)

#### Step 2: Test Locally

```bash
# Start the development server
npm start

# Visit http://localhost:5555 to test your changes
```

#### Step 3: Commit and Push to GitHub

```bash
# Check status of your changes
git status

# Stage all changes
git add .

# Commit changes with a descriptive message
git commit -m "Brief description of what you changed"

# Push to GitHub
git push origin main
```

#### Step 4: Automatic Deployment

**🚀 Pushing to GitHub automatically deploys your changes to the web!**

When you push to the `main` branch:
1. Replit automatically detects the changes
2. Pulls the latest code from GitHub
3. Restarts the server with your updates
4. Your changes are live within 30-60 seconds

**Note**: If auto-deployment doesn't work, you may need to manually trigger a restart in Replit by clicking the "Run" button.

### Replit Configuration

This project is configured for Replit deployment via the `.replit` file:

```toml
language = 'nodejs'
run = 'npm start'
```

**Key Features**:
- Automatically runs `npm start` on deployment
- Serves the app on Replit's provided domain
- Supports custom domain mapping (cameronbryzek.com)
- WebSocket support for Socket.IO real-time features

### Environment Setup on Replit

If you need to set up a fresh Replit instance:

1. **Import from GitHub**:
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Enter repository URL: `https://github.com/s-tn/forestcam`

2. **Configure Secrets** (if needed):
   - In Replit, go to "Tools" → "Secrets"
   - Add any environment variables (e.g., admin password)

3. **Custom Domain** (optional):
   - In Replit settings, add custom domain: `cameronbryzek.com`
   - Update DNS records to point to Replit's servers
   - Replit will automatically provision SSL certificate

### Alternative Deployment Options

#### Deploy to a VPS (DigitalOcean, AWS, etc.)

```bash
# SSH into your server
ssh user@your-server.com

# Clone the repository
git clone https://github.com/s-tn/forestcam.git
cd forestcam

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start npm --name "forestcam" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on server reboot
pm2 startup
```

#### Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create cameronbryzek-portfolio

# Add environment variables (if needed)
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open your deployed app
heroku open
```

**Note for Heroku**: You'll need to modify `package.json` to use a dynamic port:

```json
{
  "scripts": {
    "start": "node lib/cli/cli.js dev --port $PORT --server 'http server.js' --plugin socket.io"
  }
}
```

### Production Checklist

Before deploying major changes:

- [ ] Test all pages locally (`npm start`)
- [ ] Test gallery image uploads
- [ ] Test music player functionality
- [ ] Test progress bars admin panel
- [ ] Verify mobile responsiveness
- [ ] Check browser console for errors
- [ ] Test admin panel: `/admin?password=<password>`
- [ ] Verify all navigation links work
- [ ] Clear browser cache and test fresh load
- [ ] Check SEO meta tags and JSON-LD schemas

### Monitoring Production

**View Logs in Replit**:
- Open your Repl
- Click "Console" tab
- View real-time server logs

**Common Issues**:
- **Site not updating**: Clear browser cache or do a hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- **500 errors**: Check Replit console for Node.js errors
- **Images not loading**: Verify `imgs/` directory and `gallery.json` are in sync
- **Socket.IO not working**: Ensure WebSocket connections are allowed through firewall/proxy

### Rollback Procedure

If you need to revert to a previous version:

```bash
# View git history
git log --oneline

# Revert to a specific commit
git reset --hard <commit-hash>

# Force push to GitHub (use with caution!)
git push origin main --force
```

Replit will automatically deploy the reverted version.

## Project Structure

```
forestcam/
├── lib/                  # NebulaJS framework files
│   ├── cli/             # CLI tools and plugins
│   └── core/            # Core framework functionality
├── pages/               # HTML pages (.nebula.html)
│   ├── index.nebula.html
│   ├── gallery.nebula.html
│   ├── music.nebula.html
│   └── progress.nebula.html
├── public/              # Static assets (CSS, JS, images)
├── imgs/                # Gallery images (uploaded via admin)
├── server.js            # Main server logic with Socket.IO handlers
├── index.js             # Server configuration
├── gallery.json         # Gallery data
├── music.json           # Music data
├── progress.json        # Progress bar data
└── package.json         # Node.js dependencies
```

## API Endpoints

- `GET /gallerydata` - Returns gallery.json
- `GET /progressdata` - Returns progress.json
- `GET /musicdata` - Returns music.json
- `GET /admin?password=<password>` - Admin panel (password protected)

## Socket.IO Events

**Client → Server:**
- `upload` - Upload new image to gallery
- `changeImage` - Update existing image
- `deleteImage` - Remove image from gallery
- `changeCaption` - Update image caption
- `createPBar` - Create new progress bar
- `changeProgress` - Update progress bar value
- `changeName` - Update progress bar name
- `removeBar` - Delete progress bar

## Admin Access

Access the admin panel to manage gallery images, music videos, and progress bars:
- URL: `/admin?password=<password>`
- Password: Contact site owner for access

## Technologies Used

- **Backend**: Node.js, Express
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, jQuery
- **Framework**: Custom NebulaJS framework
- **Deployment**: Replit

## License

ISC
