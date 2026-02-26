from fastapi import Request
from ..rate_limiter import rate_limiter
from fastapi.responses import JSONResponse

async def rate_limit_middleware(request: Request, call_next):
    
    # Handle preflight OPTIONS requests
    if request.method == "OPTIONS":
        response = JSONResponse(content={}, status_code=200)
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response
    
    if request.url.path == '/api/shortener' and request.method == "POST":
        client_id = rate_limiter.get_client_id(request)
        is_allowed, retry_after = rate_limiter.is_allowed(client_id)
        
        if not is_allowed:
            # Create response with CORS headers
            response = JSONResponse(
                status_code=429,
                content={
                    "error": "Rate Limit Exceeded",
                    "message": f"Too many requests. Please wait {retry_after} seconds.",
                    "retry_after_seconds": retry_after
                },
                headers={
                    "X-RateLimit-Limit": "5",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(retry_after)
                }
            )
            # Add CORS headers
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response
    
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response