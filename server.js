const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const cors = require("cors");

let senderStream;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/consumer", async ({ body }, res) => {
    if (!senderStream) return res.json({ message: "No broadcaster found" });
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.stunprotocol.org" },
        ]
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    res.json({
        sdp: peer.localDescription
    });
});

app.post('/broadcast', async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({ iceServers: [ 
        { urls: "stun:stun.stunprotocol.org" },
    ] });
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    res.json({
        sdp: peer.localDescription
    });
});

function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
};

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server started @ ${PORT}`));