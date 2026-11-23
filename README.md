# Signal & Silicon

A personal portfolio for music production and custom PC builds. React and Vite serve the site. FastAPI provides a read-only project catalog, with a bundled copy that keeps the gallery available while the API starts or if it goes offline. PostgreSQL is unnecessary for this catalog.

## Quick start on this Windows PC

Open PowerShell in this project folder. The portable Node.js and Python tools used to build the site are in `.tooling` on this PC. If you cloned the project onto another computer, use the standard setup below.

Start the API in the first PowerShell window and leave it running:

```powershell
.\.tooling\python\python.exe -m uvicorn main:app --app-dir backend --port 8000
```

Open a second PowerShell window in the same project folder and start the website:

```powershell
$env:Path = "$PWD\.tooling\node-v22.16.0-win-x64;$env:Path"
$env:VITE_API_URL = "http://127.0.0.1:8000"
npm.cmd run build -- --configLoader native
npm.cmd run preview -- --configLoader native --host 127.0.0.1
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in your browser. Press Ctrl+C in each window when you're done. After editing the site, rerun the build to update this preview.

## Standard setup on another computer

Install Node.js 22.12 or later and Python 3.12. From the repository root, run the following in PowerShell.

Frontend terminal:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Backend terminal:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements-dev.txt
Copy-Item backend/.env.example backend/.env
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --reload --reload-dir backend --port 8000
```

Open http://localhost:5173. The API docs are at http://127.0.0.1:8000/docs.

On macOS or Linux, use `python3.12 -m venv .venv`, use `.venv/bin/python` in place of the Windows virtual environment executable, and use `cp` in place of `Copy-Item`.

## Test and build

```powershell
npm test
.\.venv\Scripts\python.exe -m unittest discover -s backend
npm run build
npm run preview
```

The preview is at http://localhost:4173. These checks also run in GitHub Actions on pushes and pull requests.

## Configuration

| Variable | Where to set it | Value |
| --- | --- | --- |
| `VITE_API_URL` | Frontend `.env` or Cloudflare Pages build environment | API origin, e.g. `https://signal-and-silicon-api.onrender.com`. A production build without this setting uses the bundled gallery. |
| `CORS_ORIGINS` | `backend/.env` or Render | Comma-separated exact frontend origins. The local default allows localhost and 127.0.0.1 on ports 5173 and 4173. |
| `CLOUDFLARE_PAGES_HOST` | Optional on Render | A production hostname such as `your-project.pages.dev`, without a scheme. Enables that project's Cloudflare branch and deployment previews. |
| `PORT` | Render | Injected by Render. |

Keep secrets out of Git and out of any `VITE_*` variable because Vite exposes those values in the browser bundle.

## Deploy from GitHub

1. Review the public media in `public/media`, then create a GitHub repository. From this project root run:

   ```powershell
   git add .
   git commit -m "Build Signal and Silicon portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```

   If `origin` already exists, check `git remote -v` and use the intended existing remote.

2. In Render, choose **New > Blueprint** and connect the GitHub repository on branch `main`. The root `render.yaml` configures a free Python web service with health check `/api/health`. When prompted, enter your intended Pages origin, for example `https://your-project.pages.dev`, for `CORS_ORIGINS`. Save the Render service URL once the health route responds. [Render FastAPI setup](https://render.com/docs/deploy-fastapi)
3. In Cloudflare, create a **Pages** project using **Connect to Git** and select the same repository and branch. Use the repository root, build command `npm run build`, and output directory `dist`. Set `NODE_VERSION=22.16.0` and `VITE_API_URL` to the actual Render service URL in the production build environment. Set the same API URL in the preview environment if previews need live data. [Cloudflare Pages build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/)
4. Compare the live Pages URL with the Render `CORS_ORIGINS` value and update it if needed. Add a custom domain to the comma-separated list if you use one. Set `CLOUDFLARE_PAGES_HOST` on Render if preview builds need access. Redeploy the frontend after editing frontend build variables.
5. Open the published site and check both filters, a photo, and a video. The free Render service may need about a minute to wake after inactivity. The bundled archive is available while it wakes. [Render free services](https://render.com/docs/free)

## Update the portfolio

Edit `backend/projects.json` to change titles, descriptions, image alt text, or project order. Add web-ready files to `public/media` and record each image's actual pixel dimensions. The IDs `studio-session`, `red-build`, and `open-case` select the featured media. Chapter links, branding, and homepage copy are in `src/main.jsx`. The site title and social description are in `index.html`.

The gallery includes all 22 supplied photos and eight supplied videos as WebP images and browser-compatible MP4s. Photos and video posters retain their original framing. The originals in `assets/` are local source material. Only the web-ready copies are needed to build or deploy. The gallery test checks that each published asset fits the Cloudflare Pages per-file limit. [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
