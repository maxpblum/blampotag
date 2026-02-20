My daughter enjoys checkers, and wants us to make a computer game version of Tag that our family can play in a similar format to checkers: Grid board, one piece per player, turn-taking. Her rules: You may move straight or diagonally, one space per turn, or two spaces (in the same direction) optionally instead of one space on your first turn. One player is "it". Take turns moving. When the "it" player lands in the same square as another player, they have two seconds to press Enter to tag that player, making that player "it", or else their move gets retracted and their turn skipped.

On your turn, you make your move using the arrow keys. On your first turn, after choosing the direction, you should be asked if you want to make it two spaces instead of one, with Y/N (only if there is room available to move two spaces in that direction).

On any turn, if you press a direction where no spaces are available (i.e. you're at the edge of the board), it's rejected.

Players may occupy the same space as long as none of them is "It".

After "It" tags another player, the tagged player is "it" and we start again with a new round.

On every round, the pieces are placed randomly (though "it" must not be placed in the same space as anyone else).

The UI should make it very obvious whose turn it is.

Although moves are made via a single keystroke, it's crucial to treat a pressed-and-held keystroke as though it were only one keystroke.

The game should be in a web page served using only static assets (JS is allowed, of course)---no dynamic content serving. Use vanilla JS, no imported frameworks.

Source code should be in TypeScript, with an extremely common toolchain for emitting compiled JS, running unit tests, and running a dev server.

Code units should be moderately sized: Code files should be scoped to end up at 50-200 lines of code. Any exported class or function should be thoroughly unit tested using Jasmine. Unit tests should test **behaviors**, not methods. E.g. instead of testMethodFooWithBasicInput() { const output = foo(basicInput); expect(foo.x).toEqual(3); expect(foo.y).toEqual(4); expect(foo.z).toEqual(5); expect(someMock).toHaveBeenCalled(); }, split up the test into individual tests of the individual behaviors. Unit tests should be extremely readable and brief: Extract any repeated setup into semantically meaningful helper functions so that only the details **essential to the given test case** are actually present in the test case. At the same time, DO explicitly include every relevant detail in the test case: Instead of expect(foo(BASIC_DATA).x).toEqual(3), write expect(foo({...BASIC_DATA, specialNum: 3}).x).toEqual(3) so readers can see the connecetion.

Data structures should be effectively immutable. types, interfaces, and classes should have readonly fields. Arrays should be readonly.

Use a "functional core, imperative shell" idiom: There should be a "game state" type, a "render" function that takes a game state and updates the current UI to reflect the state, a "reducer" function that takes the previous state and some event (passing of time, or user input) and returns the new state, and a global "while" loop that maintains the current state, renders it, then calls the reducer function to get the next one.

Unit tests of the global "while" loop should be extremely basic, with most detail delegated to unit tests of the render function and the reducer function.

Code should be divided into a few folders: events, for time- and input-related logic; render, for rendering-related logic; state, for state-related code including the game state type and the reducer function and all other logic-processing code; and engine, for the global while loop that brings it all together. There should also be an "app" folder containing the HTML file that loads the script.

The UI should include a splashy title screen (the name of the game is "Blampotag"), a "celebration" screen for when the "it" person tags someone, a big 3-2-1 countdown before the next round starts. It should be made very obvious which piece goes to which player. The game should let you choose the number of players up front, letting you type in the name of each successive player or choose "Start the game with these players".

During the game, the game title should be shown consistently at the top above the game board in a fun way. There should be some colorful animations that continue throughout the game, involving hearts and rainbows and colors moving.

It should always be made EXTREMELY clear which player's turn it is, and which player is "it."
