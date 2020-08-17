declare module '@sapper/app'
declare module '@sapper/server'
declare module '@sapper/service-worker'

declare module '@sapper/app' {
	// from sapper/runtime/src/app/types.ts
	// sapper doesn't export its types yet
	interface Redirect {
		statusCode: number
		location: string
	}
	// end

	function goto(href: string, opts: { replaceState: Boolean }): Promise<unknown>
	function prefetch(
		href: string
	): Promise<{ redirect?: Redirect; data?: unknown }>
	function prefetchRoutes(pathnames: string[]): Promise<unknown>
	function start(opts: { target: Node }): Promise<unknown>
	const stores: () => unknown

	export { goto, prefetch, prefetchRoutes, start, stores }
}

declare module '@sapper/server' {
	import { RequestHandler } from 'express'

	interface MiddlewareOptions {
		session?: (req: Express.Request, res: Express.Response) => unknown
		ignore?: unknown
	}

	function middleware(opts: MiddlewareOptions): RequestHandler

	export { middleware }
}

declare module '@sapper/service-worker' {
	const timestamp: number
	const files: string[]
	const shell: string[]
	const routes: { pattern: RegExp }[]

	export { timestamp, files, files as assets, shell, routes }
}
