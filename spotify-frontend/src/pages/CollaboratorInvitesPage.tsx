import React from 'react';
import CollaboratorInvites from '../components/CollaboratorInvites';

const CollaboratorInvitesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto">
        <CollaboratorInvites />
      </div>
    </div>
  );
};

export default CollaboratorInvitesPage;

