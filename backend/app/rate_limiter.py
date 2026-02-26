import time
from collections import defaultdict
import threading
from typing import Dict, List, Tuple


# using fixed window algorithm for limiting requests and adding timestamps
class FixedWindow:
    
    def __init__(self, max_requests: int = 5, window_time: int= 60):
        
        self.max_requests = max_requests
        self.window_time = window_time
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.lock = threading.Lock()
        
    # time remaining until new request in case of reaching limit 
    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        
        with self.lock:
            current_time = time.time()
            window_start = current_time - self.window_time
            self.requests[client_id] = [
                timestamp for timestamp in self.requests[client_id]
                if timestamp > window_start
            ]
            
            if len(self.requests[client_id]) < self.max_requests:
                self.requests[client_id].append(current_time)
                return True, 0
            
            if self.requests[client_id]:
                oldest_request = min(self.requests[client_id])
                seconds_until_reset = int((oldest_request + self.window_time) - current_time)
                return False, max(1, seconds_until_reset)
            return False, self.window_time
        
    # user ip address
    def get_client_id(self, request) -> str:
        forwarded = request.headers.get("X-forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host
    
rate_limiter = FixedWindow(max_requests=5, window_time=60)