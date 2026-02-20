import { WebAudioPlayer } from "./game-audio";
import { AudioEngine } from "./audio-engine";

describe("WebAudioPlayer", () => {
    let audioEngine: jasmine.SpyObj<AudioEngine>;
    let player: WebAudioPlayer;

    beforeEach(() => {
        audioEngine = jasmine.createSpyObj("AudioEngine", ["init", "beep", "fanfare"]);
        player = new WebAudioPlayer(audioEngine);
    });

    it("should initialize audio engine", () => {
        player.init();
        expect(audioEngine.init).toHaveBeenCalled();
    });

    it("should play move sound", () => {
        player.playMove();
        expect(audioEngine.beep).toHaveBeenCalledWith(400, 0.1);
    });

    it("should play fanfare sound", () => {
        player.playFanfare();
        expect(audioEngine.fanfare).toHaveBeenCalled();
    });

    it("should play tag sound", () => {
        player.playTag();
        expect(audioEngine.beep).toHaveBeenCalledWith(800, 0.2);
    });

    it("should play select sound", () => {
        player.playSelect();
        expect(audioEngine.beep).toHaveBeenCalledWith(600, 0.1);
    });
});
