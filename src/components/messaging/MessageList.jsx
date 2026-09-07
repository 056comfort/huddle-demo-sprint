import MessageItem from "./MessageItem";

const initialMessages = [
  {
    id: 1,
    user: "Sarah",
    avatar: "S",
    message: "Hey everyone! Welcome to Huddle.",
    time: "10:32 AM",
  },
  {
    id: 2,
    user: "David",
    avatar: "D",
    message: "Great to be here. How is everyone doing?",
    time: "10:34 AM",
  },
  {
    id: 3,
    user: "Sarah",
    avatar: "M",
    message: "Doing well! I have been working on the new designs.",
    time: "10:36 AM",
  },
  {
    id: 4,
    user: "David",
    avatar: "J",
    message: "Nice. We should review them together later.",
    time: "Just Now",
  },
];

function MessageList() {
  return (
    <div className="message-list">
      {initialMessages.map((message) => (
        <MessageItem
          key={message.id}
          user={message.user}
          avatar={message.avatar}
          message={message.message}
          time={message.time}
        />
      ))}
    </div>
  );
}

export default MessageList;
