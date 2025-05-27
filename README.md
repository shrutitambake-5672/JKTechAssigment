## How to Run Backend 
1. **Clone the repository**
git clone https://github.com/shrutitambake-5672/JKTechAssigment.git
cd JKTechAssigment/Backend

 2. **Create and activate a virtual environment (recommended)**
python -m venv venv
venv\Scripts\activate   # On Windows

3. **source venv/bin/activate   # On Linux/macOS**

pip install -r requirements.txt

4. **Set up the database**

If using SQLite, it will be created automatically.
For PostgreSQL/MySQL, create the database and update your config.
Run migrations (if using Flask-Migrate):

flask db upgrade

# 5. Start Redis (required for Celery)

Note : download and install if redis is not installed on your macnhine 

On Windows: Use Memurai or Redis for Windows.
On Linux/macOS
redis-server

# 6. Start the Flask backend

python run.py

or (if using Flask CLI):
flask run

7. **Start the Celery worker In a new terminal, from your project root:**

celery -A app.ingestion_worker.celery worker --loglevel=info

or (if celery is not recognized):

python -m celery -A app.ingestion_worker.celery worker --loglevel=info

8. **(Optional) Set environment variables**

set FLASK_APP=run.py
set FLASK_ENV=development





## Running the Frontend

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Start the development server**

   ```sh
   npm start
   ```
   or
   ```sh
   ng serve
   ```

3. **Open the app in your browser**

   Visit [http://localhost:4200](http://localhost:4200) in your web browser.

---

**Note:**  
- Make sure you have [Node.js](https://nodejs.org/) and [Angular CLI](https://angular.io/cli) installed.
- If your backend runs on a different port or host, update the API URLs or use a proxy configuration as needed.


