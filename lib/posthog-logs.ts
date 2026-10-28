import { posthog } from '@/lib/posthog'

type LogAttributes = Record<string, string | number | boolean>

export const posthogLog = {
  info(message: string, attributes?: LogAttributes) {
    posthog?.logger.info(message, attributes)
  },
}
