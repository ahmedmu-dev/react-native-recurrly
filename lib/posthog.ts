import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

const extra = Constants.expoConfig?.extra
const projectToken = extra?.posthogProjectToken
const host = extra?.posthogHost
const isPostHogConfigured =
  typeof projectToken === 'string' &&
  projectToken.length > 0 &&
  typeof host === 'string' &&
  host.length > 0

if (!isPostHogConfigured && __DEV__) {
  const missingVariable =
    typeof projectToken !== 'string' || projectToken.length === 0
      ? 'POSTHOG_PROJECT_TOKEN'
      : 'POSTHOG_HOST'

  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  )
}

export const posthog = isPostHogConfigured
  ? new PostHog(projectToken, {
      host,
      captureAppLifecycleEvents: true,
      logs: {
        serviceName: 'react-app',
        environment: __DEV__ ? 'development' : 'production',
        serviceVersion: Constants.expoConfig?.version,
      },
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
          console: [],
        },
      },
    })
  : undefined
