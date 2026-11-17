import { waitForProperty } from 'Utils'
import type {
  NuxtAppInstance,
  NuxtDevice,
  NuxtReadyHook,
  VueRoute,
  VueRouter,
  VuexStore
} from './HostelworldVueTypes'

type RouteTask = () => Promise<void>

export class NuxtApp {
  private static readonly timeoutInMs: number = 60 * 1000
  private static readonly propertyRouteName: string = 'hosteldetails.php-name-city-id'
  private static readonly routeTasks: RouteTask[] = []
  private static isSubscribedToRouter: boolean = false

  public static app (): Promise<NuxtAppInstance> {
    return waitForProperty(window, '$nuxt', this.timeoutInMs)
  }

  public static store (): Promise<VuexStore> {
    return waitForProperty(window, '$nuxt.$store', this.timeoutInMs)
  }

  public static device (): Promise<NuxtDevice> {
    return waitForProperty(window, '$nuxt.$device', this.timeoutInMs)
  }

  public static async onRouteChanged (task: RouteTask): Promise<void> {
    const router: VueRouter = await this.router()

    this.routeTasks.push(task)
    router.onReady(task)
  }

  public static isPropertyRoute (route: VueRoute): boolean {
    return route.name === this.propertyRouteName
  }

  public static async hasMounted (): Promise<void> {
    const app: NuxtAppInstance = await this.app()
    if (app._isMounted) return

    const onNuxtReady: NuxtReadyHook = await waitForProperty(window, 'onNuxtReady', this.timeoutInMs)

    return new Promise(resolve => onNuxtReady(resolve))
  }

  private static async router (): Promise<VueRouter> {
    const router: VueRouter = await waitForProperty(window, '$nuxt.$router', this.timeoutInMs)
    this.subscribeToRouter(router)

    return router
  }

  private static subscribeToRouter (router: VueRouter): void {
    if (this.isSubscribedToRouter) return
    this.isSubscribedToRouter = true

    router.afterEach(() => this.runRouteTasks())
  }

  private static runRouteTasks (): void {
    for (const task of this.routeTasks) {
      void task()
    }
  }
}
