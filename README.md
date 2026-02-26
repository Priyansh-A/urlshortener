# Url Shortener - Full stack fastapi + react webapp

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![SQLModel](https://img.shields.io/badge/SQLModel-blue?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

**A Fullstack URL shortener with click analytics, rate limiting and a beautiful dashboard. Built with FastAPI, React, and PostgreSQL.**

**Features:**

- URL Shortening - Create short 6 character alias for long URLs

- Click Analytics - Track every click with timestamps

- Rate Limiting - 5 requests per minute per IP with countdown timer

- Analytics Dashboard - Visual activity history of urls  

- RESTful API - Well-documented API for programmatic access

- Docker Support - Easy deployment with docker-compose

## Rate Limiting

With the scale of a program, the user traffic also increases. When userbases increase to millions and millions of requests start flooding your program, various system design concepts come into play. In case of unusual request traffic, rate limiting algorithms are implemented. It is mostly used in case of potential bots or external attacks.

The algorithm used in this project is Fixed Window. It is the concept where limited resources can be accessed in a limited amount of time. When the time interval is complete, the resources can be accessed again.
It may not be very functional in small projects but in case of million userbase programs, limiting requests to hundreds, thousands per minute can prevent unwanted traffic.

In this project, the fixed window algorithm is used to limit user requests making short urls to 5 requests per minute per user.
This is implemented in the rate_limiter.py file in the app directory. The core functionality here is that it tracks the user IP address and stores timestamps of their requests. Once 5 requests are made under the 60 second window, the system rejects any further requests and returns time remaining until any new requests can be made. Once the time passes, new requests are allowed again.



## Tech Stack

**Backend**

  - FastAPI - Modern web framework

  - SQLModel - SQL databases with Python typing

  - PostgreSQL - Primary database


**Frontend**

  - React 19 - UI library

  - Vite - Build tool

  - Tailwind CSS 4 - Styling

  - Chart.js - Data visualization

  - Axios - HTTP client

  - React Hot Toast - Notifications

**Infrastructure**

- Docker and Docker Compose
- Nginx - serving static files

**Prerequisites**

- Docker
- Node 22+
- Python 3.12+

## Configuration

1. **Clone the repository**
```bash
   git clone https://github.com/Priyansh-A/urlshortener.git
    cd urlshortener
```
2. **Build the images and the container**
 ```bash
   docker-compose up --build
   ```
3. **Application urls**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - api endpoints (Swagger UI) : http://localhost:8000/docs

## All available api endpoints
(POST)
- http://localhost:8000/api/shortener 

(GET)
- http://localhost:8000/api/{alias}
- http://localhost:8000/api/urls
- http://localhost:8000/api/analytics/{url_id}
- http://localhost:8000/api/test/count/{alias}

## Screenshots of thus api endpoints using postman
![alt text](<assets/screenshots/Screenshot 2026-02-26 175829.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 205843.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 170914.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 175853.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 171001.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 175653.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 175707.png>)


## Screenshots of Frontend
![alt text](<assets/screenshots/Screenshot 2026-02-26 180014.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 180100.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 180131.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 180153.png>)
![alt text](<assets/screenshots/Screenshot 2026-02-26 180235.png>)



<p align="center">
  Thank you for stopping by 
</p>

