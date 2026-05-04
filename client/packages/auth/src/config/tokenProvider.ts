let accessTokenResolver: (() => Promise<string | undefined>) | null = null

export const setAccessTokenResolver = (resolver: (() => Promise<string | undefined>) | null) => {
  accessTokenResolver = resolver
}

export const resolveAccessToken = async () => accessTokenResolver?.()
