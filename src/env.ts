import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_SOCKET_URL: z.url({ message: 'Invalid socket URL' }),
    VITE_RTC_SOCKET_URL: z.url({ message: 'Invalid RTC socket URL' }),
    VITE_SPOTTING_MODE: z
      .enum(['onset-apex', 'onset-apex-offset'])
      .default('onset-apex-offset'),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
})
