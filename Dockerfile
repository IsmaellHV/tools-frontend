FROM nginx:alpine

# Astro built dist/ with base='/tools', so HTML references /tools/_astro/...
# Place files under /tools subdirectory so paths line up when served at root.
COPY dist /usr/share/nginx/html/tools
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
