const el = {
    status: document.getElementById('status'),
    video: document.getElementById('video'),
    apiKey: document.getElementById('apiKey'),
    button: document.getElementById('uploadWidget')
};

// Icons + entrance animation
lucide.createIcons();
gsap.from('#app-card', { opacity: 0, y: 28, duration: 0.6, ease: 'power3.out' });

const config = {
    cloudName: 'dgp3dmyaa',
    uploadPreset: 'upload_clip_maker'
};

const app = {
    transcriptionURL: '',
    public_id: '',

    waitForTranscription: async () => {
        const maxAttempts = 30;
        const delay = 2000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const url = `https://res.cloudinary.com/${config.cloudName}/raw/upload/v${Date.now()}/${app.public_id}.transcript`;

            try {
                const response = await fetch(url);
                if (response.ok) {
                    app.transcriptionURL = url;
                    return true;
                }
            } catch (_) { }

            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return false;
    },


    getTranscription: async () => {
        const response = await fetch(app.transcriptionURL);
        return response.text();
    },


    getViralMoment: async () => {
        const transcription = await app.getTranscription();

        const model = 'gemini-3-flash-preview';
        const endpointGemini = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const prompt = `
        Role: You are a professional video editor specializing in viral content.
        Task: Analyze the transcription below and identify the most engaging, funny, or surprising segment.
        Constraints:
        1. Duration: Minimum 30 seconds, Maximum 60 seconds.
        2. Format: Return ONLY the start and end string for Cloudinary. Format: so_<start_seconds>,eo_<end_seconds>
        3. Examples: "so_10,eo_20" or "so_12.5,eo_45.2"
        4. CRITICAL: Do not use markdown, do not use quotes, do not explain. Return ONLY the raw string.

        Transcription:
        ${transcription}
        `;


        const headers = {
            'x-goog-api-key': el.apiKey.value,
            'Content-Type': 'application/json'
        };

        const contents = [{ parts: [{ text: prompt }] }];

        const response = await fetch(endpointGemini, {
            method: 'POST',
            headers,
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text.trim();
        return rawText.replace(/```/g, '').replace(/json/g, '').trim();
    }
};


const myWidget = cloudinary.createUploadWidget(
    config,
    async (error, result) => {
        if (!error && result && result.event === 'success') {
            app.public_id = result.info.public_id;
            el.status.textContent = 'Processing your video...';

            try {
                const isReady = await app.waitForTranscription();

                if (!isReady) {
                    throw new Error('Transcription not available.');
                }

                el.status.textContent = 'Finding the best moment...';
                const viralMoment = await app.getViralMoment();
                const viralMomentURL = `https://res.cloudinary.com/${config.cloudName}/video/upload/${viralMoment}/${app.public_id}.mp4`;

                el.status.textContent = 'Loading your clip...';
                el.video.setAttribute('src', viralMomentURL);
                el.video.load();

            } catch (_) {
                el.status.textContent = 'Something went wrong. Please try again.';
            }
        }
    }
);

el.video.addEventListener('canplaythrough', () => {
    el.status.textContent = 'Your clip is ready!';
}, { once: true });

el.button.addEventListener('click', () => {
    if (!el.apiKey.value) {
        alert('Please enter your Gemini API key first.');
        el.apiKey.focus();
        return;
    }
    myWidget.open();
});