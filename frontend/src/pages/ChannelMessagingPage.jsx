import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

import ChannelList from "../components/channels/ChannelList.jsx";
import MessageList from "../components/messaging/MessageList.jsx";
import MessageInput from "../components/messaging/MessageInput.jsx";

import "../App.css";

function VideoCallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15 10.5L19.5 7.5V16.5L15 13.5V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="6"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.6 3.5L9.4 6.8L7.6 9.1C8.6 11.2 10.3 12.9 12.4 13.9L14.7 12.1L18 14.9C18.6 15.4 18.8 16.2 18.4 16.9C17.8 18 16.7 19.2 15.3 19.4C12.5 19.8 8.8 17.8 6.1 15.1C3.4 12.4 1.4 8.7 1.8 5.9C2 4.5 3.2 3.4 4.3 2.8C5 2.4 5.8 2.6 6.6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18 9C18 5.7 15.8 3.5 12 3.5C8.2 3.5 6 5.7 6 9C6 13.5 4.5 15 4.5 16.5H19.5C19.5 15 18 13.5 18 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 19C10.1 19.9 10.9 20.5 12 20.5C13.1 20.5 13.9 19.9 14.5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 19C3.5 15.7 5.7 13.5 9 13.5C12.3 13.5 14.5 15.7 14.5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 5.5C17.2 5.8 18.5 7.1 18.5 9C18.5 10.4 17.8 11.5 16.6 12.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 14C19.3 14.5 20.5 16.2 20.5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 6H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 18H20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChannelHashIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 3L7 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 3L15 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 9H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 15H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserAvatar({ letter = "Y" }) {
  return (
    <div className="user-avatar" aria-hidden="true">
      {letter}
    </div>
  );
}

function ChannelMessagingPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserName = user?.name || "You";
  const currentUserAvatar = currentUserName.charAt(0).toUpperCase();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const channelName = decodeURIComponent(channelId || "general");

  const defaultMessages = [
    {
      id: 1,
      sender: "Sarah",
      avatar: "S",
      message: "Hey everyone 👋 Welcome to the channel!",
      time: "9:41 AM",
      isCurrentUser: false,
    },
    {
      id: 2,
      sender: "David",
      avatar: "D",
      message: "Great to have you here in Huddle.",
      time: "9:43 AM",
      isCurrentUser: false,
    },
  ];

  const [currentChannel, setCurrentChannel] = useState(channelName);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`huddle_msgs_${channelName}`);
      return saved ? JSON.parse(saved) : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });

  if (currentChannel !== channelName) {
    setCurrentChannel(channelName);
    try {
      const saved = localStorage.getItem(`huddle_msgs_${channelName}`);
      setMessages(saved ? JSON.parse(saved) : defaultMessages);
    } catch {
      setMessages(defaultMessages);
    }
  }

  function handleSendMessage(messageText) {
    if (!messageText?.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: currentUserName,
      avatar: currentUserAvatar,
      message: messageText.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      isCurrentUser: true,
    };

    setMessages((currentMessages) => {
      const updated = [...currentMessages, newMessage];
      try {
        localStorage.setItem(`huddle_msgs_${channelName}`, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${
          isSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="workspace-header">
          <div className="workspace-icon">
            H
          </div>

          <div className="workspace-details">
            <h1>Huddle Team</h1>
            <span>Team workspace</span>
          </div>
        </div>

        <ChannelList activeChannel={channelName} />

        {/* Clickable profile */}
        <Link to="/profile" className="profile">
          <UserAvatar letter={currentUserAvatar} />

          <div className="profile-info">
            <strong>{currentUserName}</strong>
            <span>Online</span>
          </div>

          <span className="profile-menu" aria-hidden="true">
            ⋯
          </span>
        </Link>
      </aside>

      {/* Main chat area */}
      <main className="chat-main">
        <header className="chat-header">
          {/* Mobile menu */}
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            title="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          {/* Channel title */}
          <button
            type="button"
            className="chat-channel-title"
            onClick={() =>
              navigate(`/channel/${channelId}/info`)
            }
            title="Open channel info"
          >
            <span className="channel-title-icon">
              <ChannelHashIcon />
            </span>

            <span className="chat-channel-title-content">
              <strong>{channelName}</strong>

              <span>
                Team conversation for the {channelName} channel
              </span>
            </span>
          </button>

          {/* Channel actions */}
          <div className="chat-header-actions">
            {/* Video call */}
            <button
              type="button"
              aria-label="Start video call"
              title="Video call"
              onClick={() =>
                navigate(
                  `/call/video/channel/${channelId}`
                )
              }
            >
              <VideoCallIcon />
            </button>

            {/* Audio call */}
            <button
              type="button"
              aria-label="Start audio call"
              title="Audio call"
              onClick={() =>
                navigate(
                  `/call/audio/channel/${channelId}`
                )
              }
            >
              <CallIcon />
            </button>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              onClick={() =>
                navigate(
                  `/channel/${channelId}/notifications`
                )
              }
            >
              <BellIcon />
            </button>

            {/* Members */}
            <button
              type="button"
              aria-label="View members"
              title="Members"
              onClick={() =>
                navigate(
                  `/channel/${channelId}/members`
                )
              }
            >
              <MembersIcon />
            </button>
          </div>
        </header>

        {/* Messages */}
        <section className="chat-content">
          <MessageList messages={messages} />
        </section>

        {/* Message composer */}
        <div className="chat-composer">
          <MessageInput
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Footer */}
        <div className="chat-footer-note">
          Messages sent in this channel are visible to
          channel members.
        </div>
      </main>
    </div>
  );
}

export default ChannelMessagingPage;