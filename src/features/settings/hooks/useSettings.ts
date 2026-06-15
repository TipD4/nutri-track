import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/services/profileService'
import type { ProfileUpdate } from '@/types/user'

export function useSettings() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: ProfileUpdate) => updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
