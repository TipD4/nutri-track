import supabase from './supabase'
import type { Profile, ProfileUpdate } from '@/types/user'

export async function getProfile(): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  if (error) throw error
  return data as Profile
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}
