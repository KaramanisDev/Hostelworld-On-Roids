import type { Property } from 'Types/HostelworldSearch'

type DisplayedRating = {
  total: number
}

export type HostelworldDisplayedProperty = Omit<Property, 'overallRating'> & {
  rating: DisplayedRating | null
}

type VueConstructor = {
  util: {
    defineReactive: (object: object, key: string, value: unknown) => void
  }
}

export type VueDependency = {
  notify: () => void
}

type VueComputedWatcher = {
  dirty: boolean
  deps: VueDependency[]
}

type HostelworldSearchServiceResult = {
  properties: Property[]
  location: unknown
}

export type HostelworldSearchService = {
  search: (
    cityId: string,
    fromDate: string | null,
    toDate: string | null,
    guests: number,
    options: Record<string, unknown>
  ) => Promise<HostelworldSearchServiceResult>
}

export type HostelworldPropertyDetails = {
  id: string
  name: string
  rating: DisplayedRating | null
}

type HostelworldState = {
  search: {
    properties: Property[]
  }
  property: {
    property: HostelworldPropertyDetails | null
  }
}

export type VueSearchPageComponent = {
  isCityEnabled3PI?: boolean
  reset3PIState?: () => void
}

export type VuePropertyListComponent = {
  displayFeaturedProperties: boolean
  displayedProperties: HostelworldDisplayedProperty[]
  _computedWatchers?: Record<string, VueComputedWatcher>
  isDisplayedPropertiesWatched?: boolean
  $watch: <T>(property: string, callback: (value: T) => void) => void
  $nextTick: (callback: () => void) => void
  $forceUpdate: () => void
  $parent: VueSearchPageComponent
}

export type VuexStoreViewModel = {
  isPropertiesFilterInstalled?: boolean
  _computedWatchers?: Record<string, VueComputedWatcher>
  $options: {
    _base: VueConstructor
  }
}

export type VuexStore = {
  state: HostelworldState
  commit: (type: string, payload: unknown) => Promise<void>
  $services: {
    search: () => Promise<HostelworldSearchService>
  }
  _vm: VuexStoreViewModel
}

export type VueRoute = {
  name: string | null
  params: Record<string, string | number>
  query: Record<string, string>
}

export type VueRouter = {
  currentRoute: VueRoute
  onReady: (callback: () => void) => void
  afterEach: (callback: () => void) => void
}

export type NuxtAppInstance = {
  _isMounted: boolean
  $router: VueRouter
}

export type NuxtReadyHook = (callback: () => void) => void

export type NuxtDevice = {
  isMobile: boolean
  isMobileOrTablet: boolean
}

export type Avatar = {
  flag: string
  name: string
  picture: string
}

export type StayingAvatars = {
  avatarLimit: number
  avatarList: Avatar[]
}

export type VuePropertyCardComponent = {
  stayingAvatars: StayingAvatars
  _computedWatchers?: Record<string, VueComputedWatcher>
  $forceUpdate: () => void
}
