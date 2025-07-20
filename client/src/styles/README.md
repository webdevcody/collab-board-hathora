# Styles Directory

This directory contains all CSS styles for the application, organized into modular files for better maintainability.

## File Structure

### `index.css`

Main entry point that imports all other CSS files. This is the only file imported in `main.tsx`.

### `global.css`

- Global resets and base styles
- Animations and keyframes
- Common reusable components (buttons, inputs, cards, etc.)
- Global footer and links

### `auth.css`

Authentication and login page styles:

- Login form
- Auth container and header
- Authentication-specific components

### `lobby.css`

Lobby page styles:

- Room creation and joining
- Lobby layout and actions
- Room selection components

### `session.css`

Session/room layout and header styles:

- Session container and header
- Connected users display
- Share button and actions

### `board.css`

Collaborative board functionality:

- Board container and layout
- Toolbar and tool buttons
- Canvas and drawing area
- Shapes (rectangles, ovals, text)
- Remote cursors
- Preview shapes

### `chat.css`

Chat functionality (if used):

- Messages container and list
- Message bubbles and styling
- Message input and send button

### `responsive.css`

Mobile and tablet responsive styles:

- Media queries for different screen sizes
- Mobile-specific overrides
- Touch-friendly interface adjustments

## Maintenance Guidelines

1. **Keep styles modular**: Add styles to the appropriate file based on functionality
2. **Use consistent naming**: Follow BEM methodology or existing naming conventions
3. **Mobile-first**: Consider responsive design when adding new styles
4. **Avoid specificity wars**: Use appropriate CSS specificity and avoid `!important`
5. **Document complex styles**: Add comments for complex or non-obvious CSS

## Adding New Styles

1. Determine which file the styles belong to based on functionality
2. Add to the appropriate file using existing patterns
3. If creating a new major feature, consider creating a new CSS file
4. Update `index.css` to import any new CSS files
5. Add responsive styles to `responsive.css` if needed
