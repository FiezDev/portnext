import { ApiResponse } from '@/src/types/common';
import { WorkProjectObj } from '@/src/types/object';
import { QueryClient } from '@tanstack/react-query';
import { apiClient } from './baseApi';

export const useGetProject = async (collection: string, ref: string) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['get-project', collection, ref],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<WorkProjectObj[]>>(
          'v1/project',
          {
            params: {
              collection,
              ref,
            },
          }
        );
        return response.data.data;
      } catch (error) {
        console.error('Error fetching projects:', error);
        return null;
      }
    },
  });

  return queryClient.getQueryData<WorkProjectObj[]>([
    'get-project',
    collection,
    ref,
  ]);
};
