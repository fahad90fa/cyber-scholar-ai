import { useQueryClient } from '@tanstack/react-query';

export const invalidateUserProfile = (queryClient: any, userId?: string) => {
  if (userId) {
    queryClient.invalidateQueries({
      queryKey: ['profile', userId],
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: ['profile'],
    });
  }
};

export const useProfileCache = () => {
  const queryClient = useQueryClient();

  return {
    invalidateProfile: (userId?: string) => invalidateUserProfile(queryClient, userId),
  };
};
