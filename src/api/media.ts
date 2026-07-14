import { apiClient } from './client'

export type UploadedMedia = {
  mediaId: number
  originalName: string
  contentType: string
  sizeBytes: number
  publicUrl: string
  createdAt: string
}

export function uploadMedia(storeId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .post<UploadedMedia>(`/stores/${storeId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}

export function deleteMedia(storeId: number, mediaId: number) {
  return apiClient.delete<void>(`/stores/${storeId}/media/${mediaId}`).then((res) => res.data)
}
