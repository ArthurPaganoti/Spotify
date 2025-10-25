import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CollaboratorInvites from '../components/CollaboratorInvites';

const CollaboratorInvitesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <CollaboratorInvites />
      </div>
    </div>
  );
};

export default CollaboratorInvitesPage;
