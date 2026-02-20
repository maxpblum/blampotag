import { KeyboardManager } from "./keyboard";

describe("KeyboardManager", () => {
    let target: jasmine.SpyObj<EventTarget>;
    let callback: jasmine.Spy;
    let manager: KeyboardManager;

    beforeEach(() => {
        target = jasmine.createSpyObj("EventTarget", ["addEventListener", "removeEventListener"]);
        callback = jasmine.createSpy("callback");
        manager = new KeyboardManager(callback, target);
    });

    it("should register event listeners on target", () => {
        expect(target.addEventListener).toHaveBeenCalledWith("keydown", jasmine.any(Function));
        expect(target.addEventListener).toHaveBeenCalledWith("keyup", jasmine.any(Function));
    });

    it("should call callback on keydown", () => {
        const handleKeyDown = target.addEventListener.calls.allArgs().find(args => args[0] === "keydown")![1] as Function;
        
        handleKeyDown({ key: "ArrowUp" });
        expect(callback).toHaveBeenCalledWith("ArrowUp");
    });

    it("should not call callback twice for same pressed key", () => {
        const handleKeyDown = target.addEventListener.calls.allArgs().find(args => args[0] === "keydown")![1] as Function;
        
        handleKeyDown({ key: "ArrowUp" });
        handleKeyDown({ key: "ArrowUp" });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should call callback again after keyup", () => {
        const handleKeyDown = target.addEventListener.calls.allArgs().find(args => args[0] === "keydown")![1] as Function;
        const handleKeyUp = target.addEventListener.calls.allArgs().find(args => args[0] === "keyup")![1] as Function;
        
        handleKeyDown({ key: "ArrowUp" });
        handleKeyUp({ key: "ArrowUp" });
        handleKeyDown({ key: "ArrowUp" });
        
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should remove event listeners on dispose", () => {
        manager.dispose();
        expect(target.removeEventListener).toHaveBeenCalledWith("keydown", jasmine.any(Function));
        expect(target.removeEventListener).toHaveBeenCalledWith("keyup", jasmine.any(Function));
    });
});
