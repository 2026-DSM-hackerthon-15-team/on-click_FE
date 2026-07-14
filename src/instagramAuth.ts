const STORAGE_KEY = 'instagram_connection'

export type InstagramConnection = {
  username: string
  connectedAt: string
}

export function getInstagramConnection(): InstagramConnection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveInstagramConnection(connection: InstagramConnection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connection))
}

export function clearInstagramConnection() {
  localStorage.removeItem(STORAGE_KEY)
}

const META_APP_ID = import.meta.env.VITE_META_APP_ID as string | undefined

export function isMetaAppConfigured(): boolean {
  return Boolean(META_APP_ID)
}

export function buildInstagramOAuthUrl(): string {
  const redirectUri = `${window.location.origin}/instagram/callback`
  const params = new URLSearchParams({
    client_id: META_APP_ID ?? '',
    redirect_uri: redirectUri,
    scope: 'instagram_basic,instagram_content_publish,pages_show_list',
    response_type: 'code',
  })
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
}
