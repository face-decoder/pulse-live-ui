import axios from 'axios'
import { env } from '#/env'

export const api = axios.create({
  baseURL: env.VITE_SOCKET_URL.replace('ws://', 'http://')
    .replace('wss://', 'https://')
    .split('/ws')[0],
})

export async function apiGet<T>(path: string): Promise<T> {
  const { data } = await api.get<T>(path)
  return data
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.message
  }
  return error instanceof Error ? error.message : 'Request failed'
}
