@echo off
echo Starting Chrome with CORS disabled for development...
echo WARNING: Only use this for development, never for browsing!
start chrome.exe --user-data-dir="C:/temp/chrome-dev" --disable-web-security --disable-features=VizDisplayCompositor --allow-running-insecure-content