import { useQuery } from '@tanstack/react-query';
import { collaboratorService } from '../services/collaboratorService';

export const useCollaboratorInvites = () => {
  return useQuery({
    queryKey: ['collaboratorInvites'],
    queryFn: async () => {
      const response = await collaboratorService.getMyInvites();
      return response.content;
    },
    refetchInterval: 30000,
  });
};
