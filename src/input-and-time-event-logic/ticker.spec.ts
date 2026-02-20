import { Ticker } from "./ticker";
import type { TimeSource } from "./ticker";

describe("Ticker", () => {
    let mockTimeSource: jasmine.SpyObj<TimeSource>;
    let callback: jasmine.Spy;
    let ticker: Ticker;

    beforeEach(() => {
        mockTimeSource = jasmine.createSpyObj("TimeSource", ["requestAnimationFrame"]);
        callback = jasmine.createSpy("callback");
        ticker = new Ticker(callback, mockTimeSource);
    });

    it("should start and request animation frame", () => {
        ticker.start();
        expect(mockTimeSource.requestAnimationFrame).toHaveBeenCalled();
    });

    it("should call callback when ticked", () => {
        ticker.start();
        const tickFn = mockTimeSource.requestAnimationFrame.calls.mostRecent().args[0];
        
        tickFn(100);
        expect(callback).toHaveBeenCalledWith(100);
    });

    it("should request next frame after tick", () => {
        ticker.start();
        const tickFn = mockTimeSource.requestAnimationFrame.calls.mostRecent().args[0];
        
        tickFn(100);
        expect(mockTimeSource.requestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it("should stop ticking", () => {
        ticker.start();
        const tickFn = mockTimeSource.requestAnimationFrame.calls.mostRecent().args[0];
        
        ticker.stop();
        tickFn(100);
        
        expect(callback).not.toHaveBeenCalled();
        expect(mockTimeSource.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });
});
