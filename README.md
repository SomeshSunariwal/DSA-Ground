
---

# Your own DSA practice app.

### 1.  Run Application on local
```
1. /backend -> `npm run start`
2. ./ -> `npm run dev`
```

### 2. Create and Run Docker Step:
```
1. docker system prune -f
2. docker build -t dsa .
3. docker run -p 8080:8080 --name dsa_app dsa
```