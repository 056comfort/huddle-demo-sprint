import MessageItem from "./MessageItem";

function MessageList({ messages }) {
  const displayedMessages = messages?.length
    ? messages.map((item) => ({
        id: item.id,
        user: item.sender || item.user,
        avatar: item.avatar,
        message: item.message,
        time: item.time,
      }))
    : [];

  return (
    <div className="message-list">
      {displayedMessages.map((message) => (
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