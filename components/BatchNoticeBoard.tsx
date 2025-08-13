// This component displays a notice board for a batch, showing posts from members.
import React from 'react';

interface Post {
  // Unique identifier for the post
  id: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface BatchNoticeBoardProps {
  // Array of posts to display on the notice board
  posts: Post[];
}

const BatchNoticeBoard: React.FC<BatchNoticeBoardProps> = ({ posts }) => {
  // Sort posts: pinned posts appear first, followed by posts sorted by creation date (newest first).
  // Sort posts: pinned first, then by creation date descending
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        // Render each post as a card. Pinned posts have a distinct background and border color.
        <div
          key={post.id}
          className={`p-4 rounded-lg shadow ${
            post.isPinned ? 'bg-HIGHLIGHT border-HIGHLIGHT border-2' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center mb-2">
            <img
              // Display author's avatar, with a placeholder if none is available.
              src={post.author.avatarUrl || '/placeholder-avatar.png'}
              alt={post.author.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div className="font-semibold text-gray-900 dark:text-gray-100">{post.author.name}</div>
            {post.isPinned && (
              <span className="ml-2 px-2 py-0.5 bg-HIGHLIGHT text-white text-xs font-bold rounded-full">
                {/* Highlight pinned posts visually */}
                PINNED
              </span>
            )}
          </div>
          {/* Display the post content */}
          <div className="text-gray-700 dark:text-gray-300 mb-2">{post.content}</div>
          {/* Display the post creation timestamp */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
      {/* Display a message if there are no posts */}
      {sortedPosts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">No posts yet.</div>
      )}
    </div>
  );
};

export default BatchNoticeBoard;