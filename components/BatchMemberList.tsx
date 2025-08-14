// components/BatchMemberList.tsx
// This component displays a list of members in a batch.
// Server-side checks ensure that only authorized users can view the member list content.
import React from 'react';
import Image from 'next/image';

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  lastActive: Date | string;
}

interface BatchMemberListProps {
  members: Member[];
}

const BatchMemberList: React.FC<BatchMemberListProps> = ({ members }) => {
  // Server-side checks for viewing content are handled on the API route.
  // This component assumes the `members` array only contains members
  // the current user is authorized to see.

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Members</h2>
      <ul>
        {members.map((member) => {
          const lastActiveMs = new Date(member.lastActive).getTime();
          const deltaMs = Date.now() - lastActiveMs;
          const isOnline = deltaMs < 5 * 60 * 1000; // 5 minutes
          const minutesAgo = Math.max(0, Math.round(deltaMs / 60000));

          return (
            <li key={member.id} className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <Image
                src={member.avatarUrl || '/placeholder-avatar.png'}
                alt={`${member.name}'s avatar`}
                width={32}
                height={32}
                className="rounded-full mr-3"
                unoptimized
              />
              <span className="flex-grow text-gray-800 dark:text-gray-200">{member.name}</span>
              {/* Basic last active indicator - can be more sophisticated */}
              <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : `Active ${minutesAgo} min ago`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BatchMemberList;