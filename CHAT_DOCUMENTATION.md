# Chat System Documentation

## File Structure

```
client/src/
├── components/
│   ├── ChatBox.jsx          (Chat UI Component)
│   ├── SocketManager.jsx    (Updated with message handling)
│   ├── Experience.jsx
│   └── AnimatedWoman.jsx
├── styles/
│   └── ChatBox.css          (Chat styling)
└── App.jsx                  (Updated to include ChatBox)

server/
└── index.js                 (Updated with message broadcasting)
```

## Features

- **Real-time messaging**: Messages are broadcast instantly to all connected users
- **User identification**: Each user is assigned a unique name based on their socket ID
- **Message differentiation**: Your own messages appear on the right (purple), others on the left (white)
- **Timestamps**: Each message shows when it was sent
- **Collapsible UI**: Chat box can be minimized with the +/- button
- **Auto-scroll**: Messages automatically scroll to the latest message
- **Character limit**: Messages are limited to 200 characters

## How It Works

### Client Side (ChatBox.jsx)
1. Hooks into Jotai atom for message state
2. Listens to socket events for new messages
3. Identifies own messages by comparing the sender name with socket ID
4. Sends messages on form submission
5. Auto-scrolls to latest message

### Client Side (SocketManager.jsx)
1. Exports `messagesAtom` for global state management
2. Listens for `message` events from server
3. Updates the messages atom when new messages arrive

### Server Side (index.js)
1. Maintains a `userNames` map to track user names
2. Generates a unique user name for each connection
3. Broadcasts all messages to all connected clients
4. Includes sender name, text, and timestamp
5. Cleans up user name on disconnect

## Styling

The chat box uses a modern gradient design with:
- Purple gradient header
- Smooth transitions and animations
- Responsive layout
- Custom scrollbar styling
- Mobile-friendly dimensions

## Usage

1. **Send a message**: Type in the input field and press Enter or click Send
2. **Minimize chat**: Click the − button in the header
3. **Open chat**: Click the + button to expand when minimized
4. **View timestamps**: Hover over messages to see exact send time

## Customization

You can customize:
- **Colors**: Edit the gradient colors in `ChatBox.css`
- **Message limit**: Change `maxLength` in `ChatBox.jsx`
- **Auto-refresh rate**: Modify the scroll behavior in `useEffect`
- **Chat box position**: Edit `bottom` and `right` in `.chatbox-container` CSS
- **User name format**: Change the naming logic in `server/index.js` line with `User_`
