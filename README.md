# JSON to CSV Pipeline

A simple NestJS app with two routes for storing and retrieving JSON items.

## Routes

- **GET /item/:id** – Get a single item by ID
- **POST /item** – Create a new item. Request body should be a JSON object; it is persisted in its entirety to the `json_item` column.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start a local PostgreSQL (e.g. Docker):
   ```bash
   docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=items_db -p 5432:5432 postgres:16
   ```

3. Run the app:
   ```bash
   npm run start:dev
   ```

4. Examples:
   ```bash
   # Create an item
   curl -X POST http://localhost:3000/item \
     -H "Content-Type: application/json" \
     -d '{"name":"test","score":42,"nested":{"key":"value"}}'

   # Get the item (use the returned id)
   curl http://localhost:3000/item/<id>
   ```

---

## Deploying to Render

### 1. Prepare the repo

- Ensure the project is in a Git repo and pushed to GitHub or GitLab.

### 2. Create a PostgreSQL database

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **PostgreSQL**
2. Choose a name and region, then create the database
3. After it’s ready, copy the **Internal Database URL** (for services on Render in the same region)

### 3. Create a Web Service

1. **New** → **Web Service**
2. Connect the GitHub/GitLab repo
3. Configure:
   - **Name:** e.g. `json-to-csv-pipeline`
   - **Region:** Same as the PostgreSQL database
   - **Branch:** `main` (or your deploy branch)
   - **Root Directory:** leave empty (or set if the app is in a subfolder)
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free (or paid if needed)

### 4. Environment variables

1. In the Web Service → **Environment**, add:
   - **Key:** `DATABASE_URL`  
   - **Value:** the Internal Database URL from step 2  
   - **From Database:** if the Postgres instance is in the same Render account, you can link it instead of pasting the URL

### 5. Deploy

- Click **Create Web Service**. Render will build and deploy.
- The app will be available at `https://<service-name>.onrender.com`

### 6. Health / usage checks

- `GET https://<service-name>.onrender.com/item` with an invalid ID will return 404 (expected).
- To test correctly:
  - `POST /item` with a JSON body to create an item
  - Use the returned `id` in `GET /item/:id`

### Notes

- **Free tier:** Services on the free tier spin down after inactivity; the first request can be slow (30–60 seconds).
- **Database URL:** Use the **Internal** URL when the app runs on Render, so connections stay internal.
- **SSL:** The app enables SSL for the database when `DATABASE_URL` is set (for Render Postgres).
- **Schema sync:** TypeORM `synchronize` is enabled to auto-create tables on first deploy. For production at scale, consider switching to TypeORM migrations.
