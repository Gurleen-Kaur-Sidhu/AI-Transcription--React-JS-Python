# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# audio_file.py

This file have route 'upload_audio', which uses post method to take audio file extension of 'mp3', 'wav', 'flac', 'ogg', 'aac' and store that file in local system and also in database(mongodb) with different attributes like audio_name,local_filename,upload_time and transcribed_text. While local_filename is renamed filename with uploaded timestamp and audio_name is a real file name.
