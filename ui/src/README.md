## File Structure

```
src/
    # Components
    atoms/          # UI components of the thinnest kind, know nothing about the game
    components/     # larger UI components that are specific to the game
    icons/          # a collection of game icons
    scenes/         # components that are three.js scenes and have to be put inside SceneRenderer
    three/          # three.js specific components that are not scenes
    views/          # thick UI components that know of the game AND can access the global state

    # Platform-specific
    desktop/        # desktop-specific components and logic
    touch/          # mobile-specific components and logic
    editor/         # editor-specific components and logic

    # Application
    entries/        # entrypoints for different apps – mobile version, desktop version, editor
    routes/         # game routing
    store/          # game data store, including all the datafront instances

    # Other
    domain/         # data structures and functions specific to the game
    lib/            # generic and somewhat game-specific auxiliary code
    typings/        # global typings
```
