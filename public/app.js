const socket = io();
const localVideo = document.getElementById('localVideo');
const startSharingBtn = document.getElementById('startSharing');
const stopSharingBtn = document.getElementById('stopSharing');
const statusDiv = document.getElementById('status');
const videoContainer = document.getElementById('videoContainer');

let localStream = null;
let peerConnections = {};

// Generate a random user ID
const userId = 'user-' + Math.random().toString(36).substr(2, 9);
socket.emit('join', userId);

// Handle start sharing button click
startSharingBtn.addEventListener('click', async () => {
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always"
            },
            audio: false
        });
        
        localVideo.srcObject = localStream;
        startSharingBtn.disabled = true;
        stopSharingBtn.disabled = false;
        statusDiv.textContent = 'Sharing screen...';
        
        socket.emit('start-sharing');
        
        // Create peer connections for existing users
        Object.keys(peerConnections).forEach(userId => {
            createPeerConnection(userId);
        });
    } catch (error) {
        console.error('Error accessing screen:', error);
        statusDiv.textContent = 'Error: ' + error.message;
    }
});

// Handle stop sharing button click
stopSharingBtn.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
        localVideo.srcObject = null;
        startSharingBtn.disabled = false;
        stopSharingBtn.disabled = true;
        statusDiv.textContent = 'Not sharing';
        
        socket.emit('stop-sharing');
        
        // Close all peer connections
        Object.values(peerConnections).forEach(pc => pc.close());
        peerConnections = {};
    }
});

// Create a new peer connection
function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });

    // Add local stream to peer connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                target: userId,
                candidate: event.candidate
            });
        }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.srcObject = event.streams[0];
        videoContainer.appendChild(remoteVideo);
    };

    peerConnections[userId] = peerConnection;
    return peerConnection;
}

// Socket event handlers
socket.on('user-joined', (userId) => {
    if (localStream) {
        createPeerConnection(userId);
    }
});

socket.on('user-left', (userId) => {
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
    }
});

socket.on('offer', async (data) => {
    const peerConnection = createPeerConnection(data.sender);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', {
        target: data.sender,
        answer: answer
    });
});

socket.on('answer', async (data) => {
    const peerConnection = peerConnections[data.sender];
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
});

socket.on('ice-candidate', async (data) => {
    const peerConnection = peerConnections[data.sender];
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}); 