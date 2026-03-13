<h1 align=center> AI Clip Maker 🎞</h1>



## How It Works

This system allows users to upload a video through the frontend.  
The video is processed using Cloudinary, transcribed using AI, and analyzed to automatically select the best clips.  
Finally, the system generates a shortened video ready for download.

```mermaid
flowchart TD
    User[User]
    Frontend[Frontend<br/>index.html + CSS + JavaScript]
    Cloudinary[Cloudinary<br/>Upload and storage]
    Transcription[Video Transcription]
    AI[Google AI<br/>Content analysis]
    ClipSelection[Clip Selection]
    FinalVideo[Final Edited Video]
    Download[Download]

    User --> Frontend
    Frontend -->|Upload video| Cloudinary
    Cloudinary --> Transcription
    Transcription --> AI
    AI --> ClipSelection
    ClipSelection --> FinalVideo
    FinalVideo --> Download