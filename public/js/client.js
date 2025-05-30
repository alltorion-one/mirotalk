/*
 ██████ ██      ██ ███████ ███    ██ ████████ 
██     ██      ██ ██      ████   ██    ██    
██      ██      ██ █████   ██ ██  ██    ██    
██      ██      ██ ██      ██  ██ ██    ██    
 ██████ ███████ ██ ███████ ██   ████    ██   
*/

/**
 * MiroTalk P2P - Client component
 *
 * @link    GitHub: https://github.com/miroslavpejic85/mirotalk
 * @link    Official Live demo: https://p2p.mirotalk.com
 * @license For open source use: AGPLv3
 * @license For commercial use or closed source, contact us at license.mirotalk@gmail.com or purchase directly from CodeCanyon
 * @license CodeCanyon: https://codecanyon.net/item/mirotalk-p2p-webrtc-realtime-video-conferences/38376661
 * @author  Miroslav Pejic - miroslav.pejic.85@gmail.com
 * @version 1.5.12
 *
 */

'use strict';

// https://www.w3schools.com/js/js_strict.asp

// Signaling server URL
const signalingServer = getSignalingServer();

// This room
const myRoomId = getId('myRoomId');
const roomId = getRoomId();
const myRoomUrl = window.location.origin + '/join/' + roomId; // share room url

// Images
const images = {
    caption: '../images/caption.png',
    chatgpt: '../images/chatgpt.png',
    confirmation: '../images/image-placeholder.png',
    share: '../images/share.png',
    locked: '../images/locked.png',
    videoOff: '../images/cam-off.png',
    audioOff: '../images/audio-off.png',
    audioGif: '../images/audio.gif',
    delete: '../images/delete.png',
    message: '../images/message.png',
    leave: '../images/leave-room.png',
    vaShare: '../images/va-share.png',
    about: '../images/mirotalk-logo.gif',
    feedback: '../images/feedback.png',
    forbidden: '../images/forbidden.png',
    avatar: '../images/mirotalk-logo.png',
    recording: '../images/recording.png',
    poster: '../images/loader.gif',
}; // nice free icon: https://www.iconfinder.com

const className = {
    user: 'fas fa-user',
    clock: 'fas fa-clock',
    hideMeOn: 'fas fa-user-slash',
    hideMeOff: 'fas fa-user',
    audioOn: 'fas fa-microphone',
    audioOff: 'fas fa-microphone-slash',
    videoOn: 'fas fa-video',
    videoOff: 'fas fa-video-slash',
    screenOn: 'fas fa-desktop',
    screenOff: 'fas fa-stop-circle',
    handPulsate: 'fas fa-hand-paper pulsate',
    privacy: 'far fa-circle',
    snapShot: 'fas fa-camera-retro',
    pinUnpin: 'fas fa-map-pin',
    mirror: 'fas fa-arrow-right-arrow-left',
    zoomIn: 'fas fa-magnifying-glass-plus',
    zoomOut: 'fas fa-magnifying-glass-minus',
    fullScreen: 'fas fa-expand',
    fsOn: 'fas fa-compress-alt',
    fsOff: 'fas fa-expand-alt',
    msgPrivate: 'fas fa-paper-plane',
    shareFile: 'fas fa-upload',
    shareVideoAudio: 'fab fa-youtube',
    kickOut: 'fas fa-sign-out-alt',
    chatOn: 'fas fa-comment',
    chatOff: 'fas fa-comment-slash',
    ghost: 'fas fa-ghost',
    undo: 'fas fa-undo',
    captionOn: 'fas fa-closed-captioning',
    trash: 'fas fa-trash',
    copy: 'fas fa-copy',
    speech: 'fas fa-volume-high',
    heart: 'fas fa-heart',
    pip: 'fas fa-images',
    hideAll: 'fas fa-eye',
    up: 'fas fa-chevron-up',
    down: 'fas fa-chevron-down',
};
// https://fontawesome.com/search?o=r&m=free

const icons = {
    lock: '<i class="fas fa-lock"></i>',
    unlock: '<i class="fas fa-lock-open"></i>',
    pitchBar: '<i class="fas fa-microphone-lines"></i>',
    sounds: '<i class="fas fa-music"></i>',
    share: '<i class="fas fa-share-alt"></i>',
    user: '<i class="fas fa-user"></i>',
    fileSend: '<i class="fas fa-file-export"></i>',
    fileReceive: '<i class="fas fa-file-import"></i>',
    codecs: '<i class="fa-solid fa-film"></i>',
    theme: '<i class="fas fa-fill-drip"></i>',
};

// Whiteboard and fileSharing
const fileSharingInput = '*'; // allow all file extensions
const Base64Prefix = 'data:application/pdf;base64,';
const wbPdfInput = 'application/pdf';
const wbImageInput = 'image/*';
const wbWidth = 1280;
const wbHeight = 768;

// Peer infos
const extraInfo = getId('extraInfo');
const isWebRTCSupported = checkWebRTCSupported();
const userAgent = navigator.userAgent;
const parser = new UAParser(userAgent);
const parserResult = parser.getResult();
const deviceType = parserResult.device.type || 'desktop';
const isMobileDevice = deviceType === 'mobile';
const isTabletDevice = deviceType === 'tablet';
const isIPadDevice = parserResult.device.model?.toLowerCase() === 'ipad';
const isDesktopDevice = deviceType === 'desktop';
const osName = parserResult.os.name;
const osVersion = parserResult.os.version;
const browserName = parserResult.browser.name;
const browserVersion = parserResult.browser.version;
const isFirefox = browserName.toLowerCase().includes('firefox');
const peerInfo = getPeerInfo();
const thisInfo = getInfo();

// Local Storage class
const lS = new LocalStorage();
const localStorageSettings = lS.getObjectLocalStorage('P2P_SETTINGS');
const lsSettings = localStorageSettings ? localStorageSettings : lS.P2P_SETTINGS;
console.log('LOCAL_STORAGE_SETTINGS', lsSettings);

// Check if embedded inside an iFrame
const isEmbedded = window.self !== window.top;

// Check if PIP is supported by this browser
const showVideoPipBtn = document.pictureInPictureEnabled;

// Check if Document PIP is supported by this browser
const showDocumentPipBtn = !isEmbedded && 'documentPictureInPicture' in window;

// Loading div
const loadingDiv = getId('loadingDiv');

// Video/Audio media container
const videoMediaContainer = getId('videoMediaContainer');
const videoPinMediaContainer = getId('videoPinMediaContainer');
const audioMediaContainer = getId('audioMediaContainer');

// Share Room QR popup
const qrRoomPopupContainer = getId('qrRoomPopupContainer');

// Init audio-video
const initUser = getId('initUser');
const initVideoContainer = getQs('.init-video-container');
const initVideo = getId('initVideo');
const initVideoBtn = getId('initVideoBtn');
const initAudioBtn = getId('initAudioBtn');
const initScreenShareBtn = getId('initScreenShareBtn');
const initVideoMirrorBtn = getId('initVideoMirrorBtn');
const initUsernameEmojiButton = getId('initUsernameEmojiButton');
const initVideoSelect = getId('initVideoSelect');
const initMicrophoneSelect = getId('initMicrophoneSelect');
const initSpeakerSelect = getId('initSpeakerSelect');
const usernameEmoji = getId('usernameEmoji');

// Buttons bar
const buttonsBar = getId('buttonsBar');
const shareRoomBtn = getId('shareRoomBtn');
const recordStreamBtn = getId('recordStreamBtn');
const fullScreenBtn = getId('fullScreenBtn');
const chatRoomBtn = getId('chatRoomBtn');
const captionBtn = getId('captionBtn');
const roomEmojiPickerBtn = getId('roomEmojiPickerBtn');
const whiteboardBtn = getId('whiteboardBtn');
const snapshotRoomBtn = getId('snapshotRoomBtn');
const fileShareBtn = getId('fileShareBtn');
const documentPiPBtn = getId('documentPiPBtn');
const mySettingsBtn = getId('mySettingsBtn');
const aboutBtn = getId('aboutBtn');

// Buttons bottom
const bottomButtons = getId('bottomButtons');
const toggleExtraBtn = getId('toggleExtraBtn');
const audioBtn = getId('audioBtn');
const videoBtn = getId('videoBtn');
const swapCameraBtn = getId('swapCameraBtn');
const hideMeBtn = getId('hideMeBtn');
const screenShareBtn = getId('screenShareBtn');
const myHandBtn = getId('myHandBtn');
const leaveRoomBtn = getId('leaveRoomBtn');

// Room Emoji Picker
const closeEmojiPickerContainer = getId('closeEmojiPickerContainer');
const emojiPickerContainer = getId('emojiPickerContainer');
const emojiPickerHeader = getId('emojiPickerHeader');
const userEmoji = getId(`userEmoji`);

// Chat room
const msgerDraggable = getId('msgerDraggable');
const msgerHeader = getId('msgerHeader');
const msgerTogglePin = getId('msgerTogglePin');
const msgerTheme = getId('msgerTheme');
const msgerCPBtn = getId('msgerCPBtn');
const msgerDropDownMenuBtn = getId('msgerDropDownMenuBtn');
const msgerDropDownContent = getId('msgerDropDownContent');
const msgerClean = getId('msgerClean');
const msgerSaveBtn = getId('msgerSaveBtn');
const msgerClose = getId('msgerClose');
const msgerMaxBtn = getId('msgerMaxBtn');
const msgerMinBtn = getId('msgerMinBtn');
const msgerChat = getId('msgerChat');
const msgerEmojiBtn = getId('msgerEmojiBtn');
const msgerMarkdownBtn = getId('msgerMarkdownBtn');
const msgerGPTBtn = getId('msgerGPTBtn');
const msgerShareFileBtn = getId('msgerShareFileBtn');
const msgerVideoUrlBtn = getId('msgerVideoUrlBtn');
const msgerInput = getId('msgerInput');
const msgerCleanTextBtn = getId('msgerCleanTextBtn');
const msgerPasteBtn = getId('msgerPasteBtn');
const msgerShowChatOnMsgDiv = getId('msgerShowChatOnMsgDiv');
const msgerShowChatOnMsg = getId('msgerShowChatOnMsg');
const msgerSpeechMsgDiv = getId('msgerSpeechMsgDiv');
const msgerSpeechMsg = getId('msgerSpeechMsg');
const msgerSendBtn = getId('msgerSendBtn');

const chatInputEmoji = {
    '<3': '❤️',
    '</3': '💔',
    ':D': '😀',
    ':)': '😃',
    ';)': '😉',
    ':(': '😒',
    ':p': '😛',
    ';p': '😜',
    ":'(": '😢',
    ':+1:': '👍',
    ':*': '😘',
    ':O': '😲',
    ':|': '😐',
    ':*(': '😭',
    XD: '😆',
    ':B': '😎',
    ':P': '😜',
    '<(': '👎',
    '>:(': '😡',
    ':S': '😟',
    ':X': '🤐',
    ';(': '😥',
    ':T': '😖',
    ':@': '😠',
    ':$': '🤑',
    ':&': '🤗',
    ':#': '🤔',
    ':!': '😵',
    ':W': '😷',
    ':%': '🤒',
    ':*!': '🤩',
    ':G': '😬',
    ':R': '😋',
    ':M': '🤮',
    ':L': '🥴',
    ':C': '🥺',
    ':F': '🥳',
    ':Z': '🤢',
    ':^': '🤓',
    ':K': '🤫',
    ':D!': '🤯',
    ':H': '🧐',
    ':U': '🤥',
    ':V': '🤪',
    ':N': '🥶',
    ':J': '🥴',
}; // https://github.com/wooorm/gemoji/blob/main/support.md

// Chat room emoji picker
const msgerEmojiPicker = getId('msgerEmojiPicker');

// Chat room connected peers
const msgerCP = getId('msgerCP');
const msgerCPHeader = getId('msgerCPHeader');
const msgerCPCloseBtn = getId('msgerCPCloseBtn');
const msgerCPList = getId('msgerCPList');
const searchPeerBarName = getId('searchPeerBarName');

// Caption section
const captionDraggable = getId('captionDraggable');
const captionHeader = getId('captionHeader');
const captionTogglePin = getId('captionTogglePin');
const captionTheme = getId('captionTheme');
const captionMaxBtn = getId('captionMaxBtn');
const captionMinBtn = getId('captionMinBtn');
const captionClean = getId('captionClean');
const captionSaveBtn = getId('captionSaveBtn');
const captionClose = getId('captionClose');
const captionChat = getId('captionChat');
const captionFooter = getId('captionFooter');

// My settings
const mySettings = getId('mySettings');
const mySettingsHeader = getId('mySettingsHeader');
const tabVideoBtn = getId('tabVideoBtn');
const tabAudioBtn = getId('tabAudioBtn');
const tabVideoShareBtn = getId('tabVideoShareBtn');
const tabRecordingBtn = getId('tabRecordingBtn');
const tabParticipantsBtn = getId('tabParticipantsBtn');
const tabProfileBtn = getId('tabProfileBtn');
const tabShortcutsBtn = getId('tabShortcutsBtn');
const tabNetworkBtn = getId('tabNetworkBtn');
const networkIP = getId('networkIP');
const networkHost = getId('networkHost');
const networkStun = getId('networkStun');
const networkTurn = getId('networkTurn');
const tabRoomBtn = getId('tabRoomBtn');
const roomSendEmailBtn = getId('roomSendEmailBtn');
const tabStylingBtn = getId('tabStylingBtn');
const tabLanguagesBtn = getId('tabLanguagesBtn');
const mySettingsCloseBtn = getId('mySettingsCloseBtn');
const myPeerNameSet = getId('myPeerNameSet');
const myPeerNameSetBtn = getId('myPeerNameSetBtn');
const switchSounds = getId('switchSounds');
const switchShare = getId('switchShare');
const switchKeepButtonsVisible = getId('switchKeepButtonsVisible');
const switchPushToTalk = getId('switchPushToTalk');
const switchAudioPitchBar = getId('switchAudioPitchBar');
const audioInputSelect = getId('audioSource');
const audioOutputSelect = getId('audioOutput');
const audioOutputDiv = getId('audioOutputDiv');
const speakerTestBtn = getId('speakerTestBtn');
const videoSelect = getId('videoSource');
const videoQualitySelect = getId('videoQuality');
const videoFpsSelect = getId('videoFps');
const videoFpsDiv = getId('videoFpsDiv');
const screenFpsSelect = getId('screenFps');
const pushToTalkDiv = getId('pushToTalkDiv');
const recImage = getId('recImage');
const switchH264Recording = getId('switchH264Recording');
const pauseRecBtn = getId('pauseRecBtn');
const resumeRecBtn = getId('resumeRecBtn');
const recordingTime = getId('recordingTime');
const lastRecordingInfo = getId('lastRecordingInfo');
const themeSelect = getId('mirotalkTheme');
const videoObjFitSelect = getId('videoObjFitSelect');
const mainButtonsBar = getQsA('#buttonsBar button');
const mainButtonsIcon = getQsA('#buttonsBar button i');
const btnsBarSelect = getId('mainButtonsBarPosition');
const pinUnpinGridDiv = getId('pinUnpinGridDiv');
const pinVideoPositionSelect = getId('pinVideoPositionSelect');
const tabRoomPeerName = getId('tabRoomPeerName');
const tabRoomParticipants = getId('tabRoomParticipants');
const tabRoomSecurity = getId('tabRoomSecurity');
const tabEmailInvitation = getId('tabEmailInvitation');
const isPeerPresenter = getId('isPeerPresenter');
const peersCount = getId('peersCount');
const screenFpsDiv = getId('screenFpsDiv');
const switchShortcuts = getId('switchShortcuts');

// Audio options
const dropDownMicOptions = getId('dropDownMicOptions');
const switchAutoGainControl = getId('switchAutoGainControl');
const switchNoiseSuppression = getId('switchNoiseSuppression');
const switchEchoCancellation = getId('switchEchoCancellation');
const sampleRateSelect = getId('sampleRateSelect');
const sampleSizeSelect = getId('sampleSizeSelect');
const channelCountSelect = getId('channelCountSelect');
const micLatencyRange = getId('micLatencyRange');
const micVolumeRange = getId('micVolumeRange');
const applyAudioOptionsBtn = getId('applyAudioOptionsBtn');
const micOptionsBtn = getId('micOptionsBtn');
const micDropDownMenu = getId('micDropDownMenu');
const micLatencyValue = getId('micLatencyValue');
const micVolumeValue = getId('micVolumeValue');

// Tab Media
const shareMediaAudioVideoBtn = getId('shareMediaAudioVideoBtn');

// My whiteboard
const whiteboard = getId('whiteboard');
const whiteboardHeader = getId('whiteboardHeader');
const whiteboardTitle = getId('whiteboardTitle');
const whiteboardOptions = getId('whiteboardOptions');
const wbDrawingColorEl = getId('wbDrawingColorEl');
const whiteboardGhostButton = getId('whiteboardGhostButton');
const wbBackgroundColorEl = getId('wbBackgroundColorEl');
const whiteboardPencilBtn = getId('whiteboardPencilBtn');
const whiteboardObjectBtn = getId('whiteboardObjectBtn');
const whiteboardUndoBtn = getId('whiteboardUndoBtn');
const whiteboardRedoBtn = getId('whiteboardRedoBtn');
const whiteboardDropDownMenuBtn = getId('whiteboardDropDownMenuBtn');
const whiteboardDropdownMenu = getId('whiteboardDropdownMenu');
const whiteboardImgFileBtn = getId('whiteboardImgFileBtn');
const whiteboardPdfFileBtn = getId('whiteboardPdfFileBtn');
const whiteboardImgUrlBtn = getId('whiteboardImgUrlBtn');
const whiteboardTextBtn = getId('whiteboardTextBtn');
const whiteboardLineBtn = getId('whiteboardLineBtn');
const whiteboardRectBtn = getId('whiteboardRectBtn');
const whiteboardTriangleBtn = getId('whiteboardTriangleBtn');
const whiteboardCircleBtn = getId('whiteboardCircleBtn');
const whiteboardSaveBtn = getId('whiteboardSaveBtn');
const whiteboardEraserBtn = getId('whiteboardEraserBtn');
const whiteboardCleanBtn = getId('whiteboardCleanBtn');
const whiteboardLockBtn = getId('whiteboardLockBtn');
const whiteboardUnlockBtn = getId('whiteboardUnlockBtn');
const whiteboardCloseBtn = getId('whiteboardCloseBtn');

// Room actions buttons
const captionEveryoneBtn = getId('captionEveryoneBtn');
const muteEveryoneBtn = getId('muteEveryoneBtn');
const hideEveryoneBtn = getId('hideEveryoneBtn');
const ejectEveryoneBtn = getId('ejectEveryoneBtn');
const lockRoomBtn = getId('lockRoomBtn');
const unlockRoomBtn = getId('unlockRoomBtn');

// File send progress
const sendFileDiv = getId('sendFileDiv');
const imgShareSend = getId('imgShareSend');
const sendFilePercentage = getId('sendFilePercentage');
const sendFileInfo = getId('sendFileInfo');
const sendProgress = getId('sendProgress');
const sendAbortBtn = getId('sendAbortBtn');

// File receive progress
const receiveFileDiv = getId('receiveFileDiv');
const imgShareReceive = getId('imgShareReceive');
const receiveFilePercentage = getId('receiveFilePercentage');
const receiveFileInfo = getId('receiveFileInfo');
const receiveProgress = getId('receiveProgress');
const receiveHideBtn = getId('receiveHideBtn');
const receiveAbortBtn = getId('receiveAbortBtn');

// Video/audio url player
const videoUrlCont = getId('videoUrlCont');
const videoAudioUrlCont = getId('videoAudioUrlCont');
const videoUrlHeader = getId('videoUrlHeader');
const videoAudioUrlHeader = getId('videoAudioUrlHeader');
const videoUrlCloseBtn = getId('videoUrlCloseBtn');
const videoAudioCloseBtn = getId('videoAudioCloseBtn');
const videoUrlIframe = getId('videoUrlIframe');
const videoAudioUrlElement = getId('videoAudioUrlElement');

// Speech recognition
const speechRecognitionIcon = getId('speechRecognitionIcon');
const speechRecognitionStart = getId('speechRecognitionStart');
const speechRecognitionStop = getId('speechRecognitionStop');

// Media
const sinkId = 'sinkId' in HTMLMediaElement.prototype;

//....

const userLimits = {
    active: false, // Limit users per room
    count: 2, // Limit 2 users per room if userLimits.active true
};

const isRulesActive = true; // Presenter can do anything, guest is slightly moderate, if false no Rules for the room.
const forceCamMaxResolutionAndFps = false; // This force the webCam to max resolution as default, up to 8k and 60fps (very high bandwidth are required) if false, you can set it from settings
const useAvatarSvg = true; // if false the cam-Off avatar = images.avatar

/**
 * Determines the video zoom mode.
 * If set to true, the video zooms at the center of the frame.
 * If set to false, the video zooms at the cursor position.
 */
const ZOOM_CENTER_MODE = false;
const ZOOM_IN_OUT_ENABLED = true; // Video Zoom in/out default (true)

// Color Picker:

const themeCustom = {
    input: getId('themeColorPicker'),
    check: getId('keepCustomTheme'),
    color: lsSettings.theme_color ? lsSettings.theme_color : '#000000',
    keep: lsSettings.theme_custom ? lsSettings.theme_custom : false,
};

const pickr = Pickr.create({
    el: themeCustom.input,
    theme: 'classic', // or 'monolith', or 'nano'
    default: themeCustom.color,
    useAsButton: true,
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)',
    ],
    components: {
        preview: true,
        opacity: true,
        hue: true,
    },
})
    .on('init', (pickr) => {
        themeCustom.input.value = pickr.getSelectedColor().toHEXA().toString(0);
    })
    .on('change', (color) => {
        themeCustom.color = color.toHEXA().toString();
        themeCustom.input.value = themeCustom.color;
        setCustomTheme();
    })
    .on('changestop', () => {
        lsSettings.theme_color = themeCustom.color;
        lS.setSettings(lsSettings);
    });

// misc
let swBg = 'rgba(0, 0, 0, 0.7)'; // swAlert background color
let callElapsedTime; // count time
let mySessionTime; // conference session time
let isDocumentOnFullScreen = false;
let isToggleExtraBtnClicked = false;

// peer
let myPeerId; // This socket.id
let myPeerUUID = getUUID(); // Unique peer id
let myPeerName = getPeerName();
let myPeerAvatar = getPeerAvatar();
let myToken = getPeerToken(); // peer JWT
let isPresenter = false; // True Who init the room (aka first peer joined)
let myHandStatus = false;
let myVideoStatus = false;
let myAudioStatus = false;
let myVideoStatusBefore = false;
let myScreenStatus = false;
let isScreenEnabled = getScreenEnabled();
let notify = getNotify(); // popup room sharing on join
let notifyBySound = true; // turn on - off sound notifications
let isPeerReconnected = false;

// media
let useAudio = true; // User allow for microphone usage
let useVideo = true; // User allow for camera usage
let isEnumerateVideoDevices = false;
let isEnumerateAudioDevices = false;

// video/audio player
let isVideoUrlPlayerOpen = false;
let pinnedVideoPlayerId = null;

// connection
let signalingSocket; // socket.io connection to our webserver
let needToCreateOffer = false; // after session description answer
let peerConnections = {}; // keep track of our peer connections, indexed by peer_id == socket.io id
let chatDataChannels = {}; // keep track of our peer chat data channels
let fileDataChannels = {}; // keep track of our peer file sharing data channels
let allPeers = {}; // keep track of all peers in the room, indexed by peer_id == socket.io id

// stream
let initStream; // initial webcam stream
let localVideoMediaStream; // my webcam
let localAudioMediaStream; // my microphone
let peerVideoMediaElements = {}; // keep track of our peer <video> tags, indexed by peer_id_video
let peerAudioMediaElements = {}; // keep track of our peer <audio> tags, indexed by peer_id_audio

// main and bottom buttons
let mainButtonsBarPosition = 'vertical'; // vertical - horizontal
let placement = 'right'; // https://atomiks.github.io/tippyjs/#placements
let bottomButtonsPlacement = 'right';
let isButtonsVisible = false;
let isButtonsBarOver = false;

// video
let myVideo;
let myAudio;
let myVideoWrap;
let myVideoAvatarImage;
let myPrivacyBtn;
let myVideoPinBtn;
let myPitchBar;
let myVideoParagraph;
let myHandStatusIcon;
let myVideoStatusIcon;
let myAudioStatusIcon;
let isVideoPrivacyActive = false; // Video circle for privacy
let isVideoPinned = false;
let isVideoFullScreenSupported = true;
let isVideoOnFullScreen = false;
let isScreenSharingSupported = false;
let isScreenStreaming = false;
let isHideMeActive = getHideMeActive();
let remoteMediaControls = false; // enable - disable peers video player controls (default false)
let camera = 'user'; // user = front-facing camera on a smartphone. | environment = the back camera on a smartphone.

// chat
let leftChatAvatar;
let rightChatAvatar;
let chatMessagesId = 0;
let showChatOnMessage = true;
let isChatPinned = false;
let isCaptionPinned = false;
let isChatRoomVisible = false;
let isCaptionBoxVisible = false;
let isChatEmojiVisible = false;
let isChatMarkdownOn = false;
let isChatGPTOn = false;
let isChatPasteTxt = false;
let speechInMessages = false;
let isSpeechSynthesisSupported = 'speechSynthesis' in window;
let transcripts = []; // collect all the transcripts to save it later if you need
let chatMessages = []; // collect chat messages to save it later if want
let chatGPTcontext = []; // keep chatGPT messages context

// settings
let videoMaxFrameRate = 30;
let screenMaxFrameRate = 30;
let videoQualitySelectedIndex = 0; // default HD and 30fps
let videoFpsSelectedIndex = 1; // 30 fps
let screenFpsSelectedIndex = 1; // 30 fps
let isMySettingsVisible = false;
let thisRoomPassword = null;
let isRoomLocked = false;
let isKeepButtonsVisible = false;
let isAudioPitchBar = true;
let isPushToTalkActive = false;
let isSpaceDown = false;
let isShortcutsEnabled = false;

// recording
let mediaRecorder;
let recordedBlobs;
let audioRecorder; // helpers.js
let recScreenStream; // screen media to recording
let recTimer;
let recCodecs;
let recElapsedTime;
let recPrioritizeH264 = false;
let isStreamRecording = false;
let isStreamRecordingPaused = false;
let isRecScreenStream = false;

// whiteboard
let wbCanvas = null;
let wbIsLock = false;
let wbIsDrawing = false;
let wbIsOpen = false;
let wbIsRedoing = false;
let wbIsEraser = false;
let wbIsBgTransparent = false;
let wbPop = [];
let isWhiteboardFs = false;

// file transfer
let fileToSend;
let fileReader;
let receiveBuffer = [];
let receivedSize = 0;
let incomingFileInfo;
let incomingFileData;
let sendInProgress = false;
let receiveInProgress = false;
/**
 * MTU 1kb/s to prevent drop.
 * Note: FireFox seems not supports chunkSize > 1024?
 */
const chunkSize = 1024; // 1024 * 16; // 16kb/s

// server
let isHostProtected = false; // Username and Password required to initialize room
let isPeerAuthEnabled = false; // Username and Password required in the URL params to join room

// survey
let surveyActive = true; // when leaving the room give a feedback, if false will be redirected to newcall page
let surveyURL = 'https://www.questionpro.com/t/AUs7VZq00L';

// Redirect on leave room
let redirectActive = false;
let redirectURL = '/newcall';

// Initialize LiveSubtitles
let liveSubtitles = null;

/**
 * Load all Html elements by Id
 */
function getHtmlElementsById() {
    mySessionTime = getId('mySessionTime');
    // My video elements
    myVideo = getId('myVideo');
    myAudio = getId('myAudio');
    myVideoWrap = getId('myVideoWrap');
    myVideoAvatarImage = getId('myVideoAvatarImage');
    myPrivacyBtn = getId('myPrivacyBtn');
    myVideoPinBtn = getId('myVideoPinBtn');
    myPitchBar = getId('myPitchBar');
    // My username, hand/video/audio status
    myVideoParagraph = getId('myVideoParagraph');
    myHandStatusIcon = getId('myHandStatusIcon');
    myVideoStatusIcon = getId('myVideoStatusIcon');
    myAudioStatusIcon = getId('myAudioStatusIcon');
}

/**
 * Using tippy aka very nice tooltip!
 * https://atomiks.github.io/tippyjs/
 */
function setButtonsToolTip() {
    // Not need for mobile
    if (isMobileDevice) return;
    // Init buttons
    setTippy(initScreenShareBtn, 'Toggle screen sharing', 'top');
    setTippy(initVideoMirrorBtn, 'Toggle video mirror', 'top');
    setTippy(initUsernameEmojiButton, 'Toggle username emoji', 'top');
    // Main buttons
    refreshMainButtonsToolTipPlacement();
    // Chat room buttons
    setTippy(msgerClose, 'Close', 'bottom');
    setTippy(msgerShowChatOnMsgDiv, 'Show chat when you receive a new message', 'bottom');
    setTippy(msgerSpeechMsgDiv, 'Speech the incoming messages', 'bottom');
    setTippy(msgerTogglePin, 'Toggle chat pin', 'bottom');
    setTippy(msgerTheme, 'Ghost theme', 'bottom');
    setTippy(msgerMaxBtn, 'Maximize', 'bottom');
    setTippy(msgerMinBtn, 'Minimize', 'bottom');
    setTippy(msgerEmojiBtn, 'Emoji', 'top');
    setTippy(msgerMarkdownBtn, 'Markdown', 'top');
    setTippy(msgerGPTBtn, 'ChatGPT', 'top');
    setTippy(msgerShareFileBtn, 'Share file', 'top');
    setTippy(msgerCPBtn, 'Private messages', 'top');
    setTippy(msgerCleanTextBtn, 'Clean', 'top');
    setTippy(msgerPasteBtn, 'Paste', 'top');
    setTippy(msgerSendBtn, 'Send', 'top');
    // Chat participants buttons
    setTippy(msgerCPCloseBtn, 'Close', 'bottom');
    // Caption buttons
    setTippy(captionClose, 'Close', 'bottom');
    setTippy(captionMaxBtn, 'Maximize', 'bottom');
    setTippy(captionMinBtn, 'Minimize', 'bottom');
    setTippy(captionTogglePin, 'Toggle caption pin', 'bottom');
    setTippy(captionTheme, 'Ghost theme', 'bottom');
    setTippy(captionClean, 'Clean the messages', 'bottom');
    setTippy(captionSaveBtn, 'Save the messages', 'bottom');
    setTippy(speechRecognitionIcon, 'Status', 'bottom');
    setTippy(speechRecognitionStart, 'Start', 'top');
    setTippy(speechRecognitionStop, 'Stop', 'top');
    // Settings
    setTippy(mySettingsCloseBtn, 'Close', 'bottom');
    setTippy(myPeerNameSetBtn, 'Change name', 'top');
    setTippy(myRoomId, 'Room name (click to copy/share)', 'right');
    setTippy(
        switchPushToTalk,
        'If Active, When SpaceBar keydown the microphone will be activated, on keyup will be deactivated, like a walkie-talkie',
        'right',
    );
    setTippy(switchSounds, 'Toggle room notify sounds', 'right');
    setTippy(switchShare, "Show 'Share Room' popup on join.", 'right');
    setTippy(switchKeepButtonsVisible, 'Keep buttons always visible', 'right');
    setTippy(recImage, 'Toggle recording', 'right');
    setTippy(
        switchH264Recording,
        'Prioritize h.264 with AAC or h.264 with Opus codecs over VP8 with Opus or VP9 with Opus codecs',
        'right',
    );
    setTippy(networkIP, 'IP address associated with the ICE candidate', 'right');
    setTippy(
        networkHost,
        'This type of ICE candidate represents a candidate that corresponds to an interface on the local device. Host candidates are typically generated based on the local IP addresses of the device and can be used for direct peer-to-peer communication within the same network',
        'right',
    );
    setTippy(
        networkStun,
        'Server reflexive candidates are obtained by the ICE agent when it sends a request to a STUN (Session Traversal Utilities for NAT) server. These candidates reflect the public IP address and port of the client as observed by the STUN server. They are useful for traversing NATs (Network Address Translators) and establishing connectivity between peers across different networks',
        'right',
    );
    setTippy(
        networkTurn,
        'Relay candidates are obtained when communication between peers cannot be established directly due to symmetric NATs or firewall restrictions. In such cases, communication is relayed through a TURN (Traversal Using Relays around NAT) server. TURN servers act as intermediaries, relaying data between peers, allowing them to communicate even when direct connections are not possible. This is typically the fallback mechanism for establishing connectivity when direct peer-to-peer communication fails',
        'right',
    );
    // Whiteboard buttons
    setTippy(whiteboardLockBtn, 'Toggle Lock whiteboard', 'right');
    setTippy(whiteboardUnlockBtn, 'Toggle Lock whiteboard', 'right');
    setTippy(whiteboardCloseBtn, 'Close', 'right');
    setTippy(wbDrawingColorEl, 'Drawing color', 'bottom');
    setTippy(whiteboardGhostButton, 'Toggle transparent background', 'bottom');
    setTippy(wbBackgroundColorEl, 'Background color', 'bottom');
    setTippy(whiteboardPencilBtn, 'Drawing mode', 'bottom');
    setTippy(whiteboardObjectBtn, 'Object mode', 'bottom');
    setTippy(whiteboardUndoBtn, 'Undo', 'bottom');
    setTippy(whiteboardRedoBtn, 'Redo', 'bottom');
    // Suspend/Hide File transfer buttons
    setTippy(sendAbortBtn, 'Abort file transfer', 'bottom');
    setTippy(receiveAbortBtn, 'Abort file transfer', 'bottom');
    setTippy(receiveHideBtn, 'Hide file transfer', 'bottom');
    // Video/audio URL player
    setTippy(videoUrlCloseBtn, 'Close the video player', 'bottom');
    setTippy(videoAudioCloseBtn, 'Close the video player', 'bottom');
    setTippy(msgerVideoUrlBtn, 'Share a video or audio to all participants', 'top');
}

/**
 * Refresh main buttons tooltips based of they position (vertical/horizontal)
 * @returns void
 */
function refreshMainButtonsToolTipPlacement() {
    // not need for mobile
    if (isMobileDevice) return;

    // ButtonsBar
    placement = btnsBarSelect.options[btnsBarSelect.selectedIndex].value == 'vertical' ? 'right' : 'top';

    // BottomButtons
    bottomButtonsPlacement = btnsBarSelect.options[btnsBarSelect.selectedIndex].value == 'vertical' ? 'top' : 'right';

    setTippy(shareRoomBtn, 'Share the Room', placement);
    setTippy(hideMeBtn, 'Toggle hide myself from the room view', placement);
    setTippy(recordStreamBtn, 'Start recording', placement);
    setTippy(fullScreenBtn, 'View full screen', placement);
    setTippy(captionBtn, 'Open the caption', placement);
    setTippy(roomEmojiPickerBtn, 'Send reaction', placement);
    setTippy(whiteboardBtn, 'Open the whiteboard', placement);
    setTippy(snapshotRoomBtn, 'Snapshot screen, windows or tab', placement);
    setTippy(fileShareBtn, 'Share file', placement);
    setTippy(documentPiPBtn, 'Toggle Document picture in picture', placement);
    setTippy(aboutBtn, 'About this project', placement);

    setTippy(toggleExtraBtn, 'Toggle extra buttons', bottomButtonsPlacement);
    setTippy(audioBtn, useAudio ? 'Stop the audio' : 'My audio is disabled', bottomButtonsPlacement);
    setTippy(videoBtn, useVideo ? 'Stop the video' : 'My video is disabled', bottomButtonsPlacement);
    setTippy(screenShareBtn, 'Start screen sharing', bottomButtonsPlacement);
    setTippy(myHandBtn, 'Raise your hand', bottomButtonsPlacement);
    setTippy(chatRoomBtn, 'Open the chat', bottomButtonsPlacement);
    setTippy(mySettingsBtn, 'Open the settings', bottomButtonsPlacement);
    setTippy(leaveRoomBtn, 'Leave this room', bottomButtonsPlacement);
}

/**
 * Set nice tooltip to element
 * @param {object} element element
 * @param {string} content message to popup
 * @param {string} placement position
 */
function setTippy(element, content, placement) {
    if (isMobileDevice) return;
    if (element) {
        if (element._tippy) {
            element._tippy.destroy();
        }
        try {
            tippy(element, {
                content: content,
                placement: placement,
            });
        } catch (err) {
            console.error('setTippy error', err.message);
        }
    } else {
        console.warn('setTippy element not found with content', content);
    }
}

/**
 * Get peer info using D
 * @returns {object} peer info
 */
function getPeerInfo() {
    return {
        isDesktopDevice: isDesktopDevice,
        isMobileDevice: isMobileDevice,
        isTabletDevice: isTabletDevice,
        isIPadDevice: isIPadDevice,
        osName: osName,
        osVersion: osVersion,
        browserName: browserName,
        browserVersion: browserVersion,
    };
}

/**
 * Get Extra info
 * @returns object info
 */
function getInfo() {
    try {
        console.log('Info', parserResult);

        // Filter out properties with 'Unknown' values
        const filterUnknown = (obj) => {
            const filtered = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value && value !== 'Unknown') {
                    filtered[key] = value;
                }
            }
            return filtered;
        };

        const filteredResult = {
            //ua: parserResult.ua,
            browser: filterUnknown(parserResult.browser),
            cpu: filterUnknown(parserResult.cpu),
            device: filterUnknown(parserResult.device),
            engine: filterUnknown(parserResult.engine),
            os: filterUnknown(parserResult.os),
        };

        // Convert the filtered result to a readable JSON string
        const resultString = JSON.stringify(filteredResult, null, 2);

        extraInfo.innerText = resultString;

        return parserResult;
    } catch (error) {
        console.error('Error parsing user agent:', error);
    }
}

/**
 * Get Signaling server URL
 * @returns {string} Signaling server URL
 */
function getSignalingServer() {
    console.log('00 Location', window.location);
    return window.location.protocol + '//' + window.location.hostname;
}

/**
 * Generate random Room id if not set
 * @returns {string} Room Id
 */
function getRoomId() {
    // check if passed as params /join?room=id
    let qs = new URLSearchParams(window.location.search);
    let queryRoomId = filterXSS(qs.get('room'));

    // skip /join/
    let roomId = queryRoomId ? queryRoomId : window.location.pathname.split('/join/')[1];

    // if not specified room id, create one random
    if (roomId == '') {
        roomId = makeId(20);
        const newUrl = signalingServer + '/join/' + roomId;
        window.history.pushState({ url: newUrl }, roomId, newUrl);
    }
    console.log('Direct join', { room: roomId });

    // Update Room name in settings
    if (myRoomId) myRoomId.innerText = roomId;

    // Save room name in local storage
    window.localStorage.lastRoom = roomId;
    return roomId;
}

/**
 * Generate random Id
 * @param {integer} length
 * @returns {string} random id
 */
function makeId(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Get UUID4
 * @returns uuid4
 */
function getUUID() {
    const uuid4 = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
    );
    if (window.localStorage.uuid) {
        return window.localStorage.uuid;
    }
    window.localStorage.uuid = uuid4;
    return uuid4;
}

/**
 * Check if notify is set
 * @returns {boolean} true/false (default true)
 */
function getNotify() {
    let qs = new URLSearchParams(window.location.search);
    let notify = filterXSS(qs.get('notify'));
    if (notify) {
        let queryNotify = notify === '1' || notify === 'true';
        if (queryNotify != null) {
            console.log('Direct join', { notify: queryNotify });
            return queryNotify;
        }
    }
    notify = lsSettings.share_on_join;
    console.log('Direct join', { notify: notify });
    return notify;
}

/**
 * Get Peer JWT
 * @returns {mixed} boolean false or token string
 */
function getPeerToken() {
    if (window.sessionStorage.peer_token) return window.sessionStorage.peer_token;
    let qs = new URLSearchParams(window.location.search);
    let token = filterXSS(qs.get('token'));
    let queryToken = false;
    if (token) {
        queryToken = token;
    }
    console.log('Direct join', { token: queryToken });
    return queryToken;
}

/**
 * Check if peer name is set
 * @returns {string} Peer Name
 */
function getPeerName() {
    const qs = new URLSearchParams(window.location.search);
    const name = filterXSS(qs.get('name'));
    if (isHtml(name)) {
        console.log('Direct join', { name: 'Invalid name' });
        return 'Invalid name';
    }
    console.log('Direct join', { name: name });
    return name;
}

/**
 * Check if peer avatar is set
 * @returns {string} Peer Avatar
 */
function getPeerAvatar() {
    const qs = new URLSearchParams(window.location.search);
    const avatar = filterXSS(qs.get('avatar'));
    const avatarDisabled = avatar === '0' || avatar === 'false';

    console.log('Direct join', { avatar: avatar });

    if (avatarDisabled || !isImageURL(avatar)) {
        return false;
    }
    return avatar;
}

/**
 * Is screen enabled on join room
 * @returns {boolean} true/false
 */
function getScreenEnabled() {
    let qs = new URLSearchParams(window.location.search);
    let screen = filterXSS(qs.get('screen'));
    if (screen) {
        screen = screen.toLowerCase();
        let queryPeerScreen = screen === '1' || screen === 'true';
        console.log('Direct join', { screen: queryPeerScreen });
        return queryPeerScreen;
    }
    console.log('Direct join', { screen: false });
    return false;
}

/**
 * Hide myself from the meeting view
 * @returns {boolean} true/false
 */
function getHideMeActive() {
    let qs = new URLSearchParams(window.location.search);
    let hide = filterXSS(qs.get('hide'));
    let queryHideMe = false;
    if (hide) {
        hide = hide.toLowerCase();
        queryHideMe = hide === '1' || hide === 'true';
    }
    console.log('Direct join', { hide: queryHideMe });
    return queryHideMe;
}

/**
 * Check if there is peer connections
 * @returns {boolean} true/false
 */
function thereArePeerConnections() {
    if (Object.keys(peerConnections).length === 0) return false;
    return true;
}

/**
 * Count the peer connections
 * @returns peer connections count
 */
function countPeerConnections() {
    return Object.keys(peerConnections).length;
}

/**
 * Get Started...
 */
document.addEventListener('DOMContentLoaded', function () {
    initClientPeer();
});

/**
 * On body load Get started
 */
function initClientPeer() {
    setTheme();
    
    // Initialize LiveSubtitles
    liveSubtitles = new LiveSubtitles();

    if (!isWebRTCSupported) {
        return userLog('error', 'This browser seems not supported WebRTC!');
    }

    // check if video Full screen supported on default true
    if (peerInfo.isMobileDevice && peerInfo.osName === 'iOS') {
        isVideoFullScreenSupported = false;
    }

    console.log('01. Connecting to signaling server');

    // Disable the HTTP long-polling transport
    signalingSocket = io({ transports: ['websocket'] });

    const transport = signalingSocket.io.engine.transport.name; // in most cases, "polling"
    console.log('02. Connection transport', transport);

    // Check upgrade transport
    signalingSocket.io.engine.on('upgrade', () => {
        const upgradedTransport = signalingSocket.io.engine.transport.name; // in most cases, "websocket"
        console.log('Connection upgraded transport', upgradedTransport);
    });

    // async - await requests
    signalingSocket.request = function request(type, data = {}) {
        return new Promise((resolve, reject) => {
            signalingSocket.emit(type, data, (data) => {
                if (data.error) {
                    console.error('signalingSocket.request error', data.error);
                    reject(data.error);
                } else {
                    console.log('signalingSocket.request data', data);
                    resolve(data);
                }
            });
        });
    };

    // on receiving data from signaling server...
    signalingSocket.on('connect', handleConnect);
    signalingSocket.on('unauthorized', handleUnauthorized);
    signalingSocket.on('roomIsLocked', handleUnlockTheRoom);
    signalingSocket.on('roomAction', handleRoomAction);
    signalingSocket.on('addPeer', handleAddPeer);
    signalingSocket.on('serverInfo', handleServerInfo);
    signalingSocket.on('sessionDescription', handleSessionDescription);
    signalingSocket.on('iceCandidate', handleIceCandidate);
    signalingSocket.on('peerName', handlePeerName);
    signalingSocket.on('peerStatus', handlePeerStatus);
    signalingSocket.on('peerAction', handlePeerAction);
    signalingSocket.on('message', handleMessage);
    signalingSocket.on('wbCanvasToJson', handleJsonToWbCanvas);
    signalingSocket.on('whiteboardAction', handleWhiteboardAction);
    signalingSocket.on('caption', handleCaptionActions);
    signalingSocket.on('translated_message', handleTranslatedMessage);
    signalingSocket.on('kickOut', handleKickedOut);
    signalingSocket.on('fileInfo', handleFileInfo);
    signalingSocket.on('fileAbort', handleFileAbort);
    signalingSocket.on('fileReceiveAbort', handleAbortFileTransfer);
    signalingSocket.on('videoPlayer', handleVideoPlayer);
    signalingSocket.on('disconnect', handleDisconnect);
    signalingSocket.on('removePeer', handleRemovePeer);
} // end [initClientPeer]

/**
 * Send async data to signaling server (server.js)
 * @param {string} msg msg to send to signaling server
 * @param {object} config data to send to signaling server
 */
async function sendToServer(msg, config = {}) {
    await signalingSocket.emit(msg, config);
}

/**
 * Send async data through RTC Data Channels
 * @param {object} config data
 */
async function sendToDataChannel(config) {
    if (thereArePeerConnections() && typeof config === 'object' && config !== null) {
        for (let peer_id in chatDataChannels) {
            if (chatDataChannels[peer_id].readyState === 'open')
                await chatDataChannels[peer_id].send(JSON.stringify(config));
        }
    }
}

/**
 * Connected to Signaling Server. Once the user has given us access to their
 * microphone/cam, join the channel and start peering up
 */
async function handleConnect() {
    console.log('03. Connected to signaling server');

    myPeerId = signalingSocket.id;
    console.log('04. My peer id [ ' + myPeerId + ' ]');

    await getButtons();

    if (localVideoMediaStream && localAudioMediaStream) {
        await joinToChannel();
    } else {
        await initEnumerateDevices();
        await setupLocalVideoMedia();
        await setupLocalAudioMedia();
        if (!useVideo || (!useVideo && !useAudio)) {
            await loadLocalMedia(new MediaStream(), 'video');
        }
        getHtmlElementsById();
        setButtonsToolTip();
        handleUsernameEmojiPicker();
        manageButtons();
        handleButtonsRule();
        setupMySettings();
        loadSettingsFromLocalStorage();
        setupVideoUrlPlayer();
        startSessionTime();
        await whoAreYou();
    }
}

/**
 * Handle some signaling server info
 * @param {object} config data
 */
function handleServerInfo(config) {
    console.log('13. Server info', config);

    const { peers_count, host_protected, user_auth, is_presenter, survey, redirect, room_config } = config;

    isHostProtected = host_protected;
    isPeerAuthEnabled = user_auth;

    // Get survey settings from server
    surveyActive = survey.active;
    surveyURL = survey.url;

    // Get redirect settings from server
    (redirectActive = redirect.active), (redirectURL = redirect.url);

    // Get room configuration
    if (room_config) {
        // Store room config globally
        window.roomConfig = room_config;
        
        // Update language dropdowns if they exist
        const nativeLanguageSelect = document.getElementById('nativeLanguage');
        const targetLanguageSelect = document.getElementById('targetLanguage');
        if (nativeLanguageSelect) nativeLanguageSelect.value = room_config.native_language;
        if (targetLanguageSelect) targetLanguageSelect.value = room_config.target_language;
        
        // Update join dialog target language if it exists
        const joinTargetLanguageSelect = document.getElementById('joinTargetLanguage');
        if (joinTargetLanguageSelect) {
            joinTargetLanguageSelect.value = room_config.native_language;
        }
    }

    // Limit room to n peers
    if (userLimits.active && peers_count > userLimits.count) {
        return roomIsBusy();
    }

    // Let start with some basic rules
    isPresenter = isPeerReconnected ? isPresenter : is_presenter;
    isPeerPresenter.innerText = isPresenter;

    // Peer identified if presenter or not then....
    handleShortcuts();

    if (isRulesActive) {
        handleRules(isPresenter);
    }

    if (notify && peers_count == 1) {
        shareRoomMeetingURL(true);
    } else {
        checkShareScreen();
    }
}

/**
 * HOST_USER_AUTH enabled and peer not match valid username and password
 */
function handleUnauthorized() {
    playSound('alert');
    Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: swBg,
        imageUrl: images.forbidden,
        title: 'Ops, Unauthorized',
        text: 'The host has user authentication enabled',
        confirmButtonText: `Login`,
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    }).then(() => {
        // Login required to join room
        openURL(`/login/?room=${roomId}`);
    });
}

/**
 * Room is busy, disconnect me and alert the user that
 * will be redirected to home page
 */
function roomIsBusy() {
    signalingSocket.disconnect();
    playSound('alert');
    Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: swBg,
        imageUrl: images.forbidden,
        position: 'center',
        title: 'Room is busy',
        html: `The room is limited to ${userLimits.count} users. <br/> Please try again later`,
        showDenyButton: false,
        confirmButtonText: `OK`,
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
    }).then((result) => {
        if (result.isConfirmed) {
            openURL('/');
        }
    });
}

/**
 * Presenter can do anything, for others you can limit
 * some functions by hidden the buttons etc.
 *
 * @param {boolean} isPresenter true/false
 */
function handleRules(isPresenter) {
    console.log('14. Peer isPresenter: ' + isPresenter + ' Reconnected to signaling server: ' + isPeerReconnected);
    if (!isPresenter) {
        //buttons.main.showShareRoomBtn = false;
        buttons.settings.showMicOptionsBtn = false;
        buttons.settings.showTabRoomParticipants = false;
        buttons.settings.showTabRoomSecurity = false;
        buttons.settings.showTabEmailInvitation = false;
        // buttons.remote.audioBtnClickAllowed = false;
        // buttons.remote.videoBtnClickAllowed = false;
        buttons.remote.showKickOutBtn = false;
        buttons.whiteboard.whiteboardLockBtn = false;
        //...
    } else {
        buttons.main.showShareRoomBtn = true;
        buttons.settings.showMicOptionsBtn = true;
        buttons.settings.showTabRoomParticipants = true;
        buttons.settings.showTabRoomSecurity = true;
        buttons.settings.showTabEmailInvitation = true;
        buttons.settings.showLockRoomBtn = !isRoomLocked;
        buttons.settings.showUnlockRoomBtn = isRoomLocked;
        buttons.remote.audioBtnClickAllowed = true;
        buttons.remote.videoBtnClickAllowed = true;
        buttons.remote.showKickOutBtn = true;
        buttons.whiteboard.whiteboardLockBtn = true;
    }

    handleButtonsRule();
}

/**
 * Hide not desired buttons
 */
function handleButtonsRule() {
    // Main
    elemDisplay(shareRoomBtn, buttons.main.showShareRoomBtn);
    elemDisplay(hideMeBtn, buttons.main.showHideMeBtn);
    elemDisplay(audioBtn, buttons.main.showAudioBtn);
    elemDisplay(videoBtn, buttons.main.showVideoBtn);
    //elemDisplay(screenShareBtn, buttons.main.showScreenBtn, ); // auto-detected
    elemDisplay(recordStreamBtn, buttons.main.showRecordStreamBtn);
    elemDisplay(recImage, buttons.main.showRecordStreamBtn);
    elemDisplay(chatRoomBtn, buttons.main.showChatRoomBtn);
    elemDisplay(captionBtn, buttons.main.showCaptionRoomBtn && speechRecognition); // auto-detected
    elemDisplay(roomEmojiPickerBtn, buttons.main.showRoomEmojiPickerBtn);
    elemDisplay(myHandBtn, buttons.main.showMyHandBtn);
    elemDisplay(whiteboardBtn, buttons.main.showWhiteboardBtn);
    elemDisplay(snapshotRoomBtn, buttons.main.showSnapshotRoomBtn && !isMobileDevice);
    elemDisplay(fileShareBtn, buttons.main.showFileShareBtn);
    elemDisplay(documentPiPBtn, showDocumentPipBtn && buttons.main.showDocumentPipBtn);
    elemDisplay(mySettingsBtn, buttons.main.showMySettingsBtn);
    elemDisplay(aboutBtn, buttons.main.showAboutBtn);
    // chat
    elemDisplay(msgerTogglePin, !isMobileDevice && buttons.chat.showTogglePinBtn);
    elemDisplay(msgerMaxBtn, !isMobileDevice && buttons.chat.showMaxBtn);
    elemDisplay(msgerSaveBtn, buttons.chat.showSaveMessageBtn);
    elemDisplay(msgerMarkdownBtn, buttons.chat.showMarkDownBtn);
    elemDisplay(msgerGPTBtn, buttons.chat.showChatGPTBtn);
    elemDisplay(msgerShareFileBtn, buttons.chat.showFileShareBtn);
    elemDisplay(msgerVideoUrlBtn, buttons.chat.showShareVideoAudioBtn);
    elemDisplay(msgerCPBtn, buttons.chat.showParticipantsBtn);
    // caption
    elemDisplay(captionTogglePin, !isMobileDevice && buttons.caption.showTogglePinBtn);
    elemDisplay(captionMaxBtn, !isMobileDevice && buttons.caption.showMaxBtn);
    // Settings
    elemDisplay(dropDownMicOptions, buttons.settings.showMicOptionsBtn && isPresenter); // auto-detected
    elemDisplay(captionEveryoneBtn, buttons.settings.showCaptionEveryoneBtn);
    elemDisplay(muteEveryoneBtn, buttons.settings.showMuteEveryoneBtn);
    elemDisplay(hideEveryoneBtn, buttons.settings.showHideEveryoneBtn);
    elemDisplay(ejectEveryoneBtn, buttons.settings.showEjectEveryoneBtn);
    elemDisplay(lockRoomBtn, buttons.settings.showLockRoomBtn);
    elemDisplay(unlockRoomBtn, buttons.settings.showUnlockRoomBtn);
    elemDisplay(tabRoomPeerName, buttons.settings.showTabRoomPeerName);
    elemDisplay(tabRoomParticipants, buttons.settings.showTabRoomParticipants);
    elemDisplay(tabRoomSecurity, buttons.settings.showTabRoomSecurity);
    elemDisplay(tabEmailInvitation, buttons.settings.showTabEmailInvitation);
    // Whiteboard
    buttons.whiteboard.whiteboardLockBtn
        ? elemDisplay(whiteboardLockBtn, true, 'flex')
        : elemDisplay(whiteboardLockBtn, false);
}

/**
 * Get Buttons config from server side and apply to current client
 */
async function getButtons() {
    try {
        const response = await axios.get('/buttons', {
            timeout: 5000,
        });
        const serverButtons = response.data.message;
        if (serverButtons) {
            // Merge serverButtons into BUTTONS, keeping the existing keys in BUTTONS if they are not present in serverButtons
            buttons = {
                ...buttons, // Spread current BUTTONS first to keep existing keys
                ...serverButtons, // Overwrite or add new keys from serverButtons
            };
            console.log('AXIOS ROOM BUTTONS SETTINGS', {
                serverButtons: serverButtons,
                clientButtons: buttons,
            });
        }
    } catch (error) {
        console.error('AXIOS GET CONFIG ERROR', error.message);
    }
}

/**
 * Format and display a chat message with both original and translated text
 * @param {object} message - The message object containing original and translated text
 */
function formatAndDisplayChatMessage(message) {
    const { peer_name, text_data, translated_text, native_language, target_language, time_stamp } = message;
    
    // Create message container
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg';
    
    // Create message header with username and timestamp
    const msgHeader = document.createElement('div');
    msgHeader.className = 'msg-header';
    msgHeader.innerHTML = `
        <span class="msg-name">${peer_name}</span>
        <span class="msg-time">${new Date(time_stamp).toLocaleTimeString()}</span>
    `;
    
    // Create message content container
    const msgContent = document.createElement('div');
    msgContent.className = 'msg-content';
    
    // Add original text
    const originalText = document.createElement('div');
    originalText.className = 'msg-text original';
    originalText.innerHTML = `
        <span class="msg-label">Original (${native_language}):</span>
        <span class="msg-text-content">${text_data}</span>
    `;
    
    // Add translated text if it exists and is different from original
    if (translated_text && translated_text !== text_data) {
        const translatedText = document.createElement('div');
        translatedText.className = 'msg-text translated';
        translatedText.innerHTML = `
            <span class="msg-label">Translation (${target_language}):</span>
            <span class="msg-text-content">${translated_text}</span>
        `;
        msgContent.appendChild(translatedText);
    }
    
    msgContent.appendChild(originalText);
    msgDiv.appendChild(msgHeader);
    msgDiv.appendChild(msgContent);
    
    // Add message to chat
    msgerChat.appendChild(msgDiv);
    msgerChat.scrollTop = msgerChat.scrollHeight;
}

/**
 * Handle translated messages from peers
 * @param {object} message - The translated message object
 */
function handleTranslatedMessage(message) {
    const { peer_name, text_data, translated_text, native_language, target_language } = message;
    
    // Only show translated text if it exists and is different from the original
    if (translated_text && translated_text !== text_data) {
        // Format the message to show both original and translated text
        const formattedMessage = `${peer_name}: ${translated_text}`;
        liveSubtitles.showMessage(formattedMessage, true);
    }
    
    // Store the message in transcripts array for chat history
    if (!transcripts) transcripts = [];
    const messageObj = {
        peer_name,
        text_data,
        translated_text,
        native_language,
        target_language,
        time_stamp: new Date()
    };
    transcripts.push(messageObj);
    
    // Display the message in chat
    formatAndDisplayChatMessage(messageObj);
}
