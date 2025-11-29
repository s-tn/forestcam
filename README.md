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

### Pushing to GitHub

The repository is hosted at: `https://github.com/s-tn/forestcam`

```bash
# Check status of changes
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

### Deploying to Replit

This project is configured for Replit deployment (see `.replit` file):

1. The app runs automatically on Replit using `npm start`
2. Access the admin panel at: `/admin?password=j2405`
3. The production URL is referenced in the code as: `https://forestcam--enderkingj.repl.co`

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
- `GET /admin?password=j2405` - Admin panel (password protected)

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

Access the admin panel to manage gallery images and progress bars:
- URL: `/admin?password=j2405`
- Password: `j2405`

## Technologies Used

- **Backend**: Node.js, Express
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, jQuery
- **Framework**: Custom NebulaJS framework
- **Deployment**: Replit

## License

ISC
