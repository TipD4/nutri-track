import supabase from './supabase'
import { STORAGE_BUCKET, PAGE_SIZE } from '@/lib/constants'

export interface FoodImage {
  id: string
  user_id: string
  meal_record_id: string | null
  storage_path: string
  thumbnail_path: string | null
  created_at: string
}

export async function uploadImage(file: File): Promise<FoodImage> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file)
  if (uploadError) throw uploadError

  const { data, error: dbError } = await supabase
    .from('food_images')
    .insert({
      storage_path: filePath,
      user_id: user.id,
    })
    .select()
    .single()
  if (dbError) throw dbError

  return data as FoodImage
}

export function getImageUrl(storagePath: string): string {
  const { data } = supabase
    .storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath)
  return data.publicUrl
}

export async function getImages(page: number = 0): Promise<{ data: FoodImage[]; count: number }> {
  const { data, error, count } = await supabase
    .from('food_images')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  if (error) throw error
  return { data: data as FoodImage[], count: count || 0 }
}

export async function linkImageToMeal(imageId: string, mealRecordId: string): Promise<void> {
  const { error } = await supabase
    .from('food_images')
    .update({ meal_record_id: mealRecordId })
    .eq('id', imageId)
  if (error) throw error
}

export async function deleteImage(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
  const { error } = await supabase
    .from('food_images')
    .delete()
    .eq('id', id)
  if (error) throw error
}
