window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}

async function init() {
    const peer = createPeer();
    peer.addTransceiver("video", { direction: "recvonly" })
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.stunprotocol.org" },
        ]
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const { data } = await axios.post('/consumer', { sdp: peer.localDescription });
    console.log(data.sdp.sdp?.split("\n")[8]);
    console.log(data.sdp.sdp?.split("\n")[9]);
    console.log(data.sdp.sdp?.split("\n")[1]);
    // total 66 elements in the list after \n split
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function handleTrackEvent(e) {
    document.getElementById("video").srcObject = e.streams[0];
};

