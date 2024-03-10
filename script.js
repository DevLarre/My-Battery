let timeouts = [];
let originalVolumes = [];
let isRecording = false;
let recordedSounds = [];
let startRecordingClicks = 0;

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('touchstart', function(event) {
        event.preventDefault();
        const sound = this.getAttribute('data-key');
        playSound(sound);

        if (isRecording) {
            recordedSounds.push({ key: sound, time: performance.now() - startTime });
        }
    });
});

document.body.addEventListener('keyup', (event) => {
    const sound = event.code.toLowerCase();
    playSound(sound);

    if (isRecording) {
        recordedSounds.push({ key: sound.replace('key', ''), time: performance.now() - startTime });
    }
});

document.querySelector('.play button').addEventListener('click', () => {
    if (recordedSounds.length > 0) {
        playComposition(recordedSounds);
    } else {
        alert("Nenhuma música gravada. Grave uma música primeiro.");
    }
});

document.querySelector('.composer .stop button').addEventListener('click', () => {
    stopComposition();
});

document.querySelector('.composer .start-recording button').addEventListener('click', () => {
    startRecordingClicks++;

    if (startRecordingClicks === 2) {
        location.reload();
    } else {
        isRecording = true;
        recordedSounds = [];
        startTime = performance.now(); 

        const recordingIndicator = document.querySelector('.recording-indicator');
        if (recordingIndicator) {
            recordingIndicator.parentNode.removeChild(recordingIndicator);
        }

        const newRecordingIndicator = document.createElement('div');
        newRecordingIndicator.classList.add('recording-indicator');
        document.body.appendChild(newRecordingIndicator);

        localStorage.removeItem('recordedSounds');
    }
});

document.querySelector('.composer .stop-recording button').addEventListener('click', () => {
    isRecording = false;
    const recordingIndicator = document.querySelector('.recording-indicator');
    if (recordingIndicator) {
        recordingIndicator.parentNode.removeChild(recordingIndicator);
    }
});


document.querySelector('#exportsound').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'block';
});

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
});


function playSound(sound) {
    let audioElement = document.querySelector(`#s_${sound}`);
    let keyElement = document.querySelector(`div[data-key="${sound}"]`);

    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
    }

    if (keyElement) {
        keyElement.classList.add('active');

        const imgElement = document.createElement('img');
        imgElement.src = 'assets/img/baqueta.png';
        imgElement.classList.add('sua-classe-de-imagem');
        keyElement.appendChild(imgElement);

        imgElement.style.width = '55px';
        imgElement.style.height = '55px';
        imgElement.style.position = 'absolute';

        imgElement.classList.add('batendo');

        if (window.matchMedia("(min-width: 1024px)").matches) {
            imgElement.style.width = '180px';
            imgElement.style.height = '180px';
        }

        setTimeout(() => {
            keyElement.classList.remove('active');
            setTimeout(() => {
                keyElement.removeChild(imgElement);
            }, 100);
        }, 300);
    }
}

function playComposition(songArray) {
    for (let i = 0; i < songArray.length; i++) {
        const sound = `key${songArray[i].key}`;
        const audioElement = document.querySelector(`#s_${sound}`);

        const scheduledTime = startTime + songArray[i].time;

        timeouts.push(setTimeout(() => {
            playSound(sound);
        }, scheduledTime));
    }
}

function stopComposition() {
    let fadeOutInterval = setInterval(() => {
        let isAnyAudioPlaying = false;
        document.querySelectorAll('audio').forEach(audio => {
            if (!audio.paused) {
                isAnyAudioPlaying = true;
                if (!originalVolumes[audio.id]) {
                    originalVolumes[audio.id] = audio.volume;
                }
                if (audio.volume > 0.01) {
                    audio.volume -= 0.01;
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                }
            }
        });
        if (!isAnyAudioPlaying) {
            clearInterval(fadeOutInterval);
            timeouts.forEach(timeout => {
                clearTimeout(timeout);
            });
            timeouts = [];
            document.querySelectorAll('audio').forEach(audio => {
                if (originalVolumes[audio.id]) {
                    audio.volume = originalVolumes[audio.id];
                    delete originalVolumes[audio.id];
                }
            });
        }
    }, 3);
}
