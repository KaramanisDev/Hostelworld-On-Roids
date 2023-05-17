import { waitForProperty } from '../Utils'

type VuexStoreCommit = (type: string, payload: unknown) => void
type HostelworldState = {
  property: {
    socialCuesEnabled: boolean
  }
  search: {
    travelSolo: boolean
    citySocialCues: boolean
    socialCuesEnabled: boolean
    searchNoAvailabilityCardsEnabled: boolean
  }
}
type VuexStore = {
  commit: VuexStoreCommit,
  state: HostelworldState
}

export class HostelworldFeatureEnforcer {
  private static store: VuexStore

  public static async enableSearchCitySocialCues (): Promise<typeof this> {
    const store: VuexStore = await this.nuxtJsStoreInstance()

    store.state.search.citySocialCues = true
    this.hookAtStoreCommit(store, 'search/setCitySocialCuesExperiment', true)

    return this
  }

  public static async enableSearchPropertySocialCues (): Promise<typeof this> {
    const store: VuexStore = await this.nuxtJsStoreInstance()

    store.state.search.socialCuesEnabled = true
    this.hookAtStoreCommit(store, 'search/setSocialCuesEnabled', true)

    return this
  }

  public static async enableSearchUnavailableProperties (): Promise<typeof this> {
    const store: VuexStore = await this.nuxtJsStoreInstance()

    store.state.search.searchNoAvailabilityCardsEnabled = true
    this.hookAtStoreCommit(store, 'search/setUnavailabilityExclusion', {
      searchNoAvailabilityCards: true
    })

    return this
  }

  public static async enableViewPropertySocialCues (): Promise<typeof this> {
    const store: VuexStore = await this.nuxtJsStoreInstance()

    store.state.property.socialCuesEnabled = true
    this.hookAtStoreCommit(store, 'property/setSocialCuesEnabled', true)

    return this
  }

  private static async nuxtJsStoreInstance (): Promise<VuexStore> {
    return <VuexStore>await waitForProperty(window, '$nuxt.$store', 15000)
  }

  private static hookAtStoreCommit (store: VuexStore, onType: string, newPayload: unknown): void {
    const originalCommit: VuexStoreCommit = store.commit

    store.commit = function (type: string, payload: unknown): void {
      return originalCommit(type, type === onType ? newPayload : payload)
    }
  }
}
