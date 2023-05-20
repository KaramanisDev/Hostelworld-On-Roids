import { waitForProperty } from 'Utils'

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

  public static async enableSearchCitySocialCues (): Promise<void> {
    const store: VuexStore = await this.hostelworldStore()

    store.state.search.citySocialCues = true
    this.onStoreCommitOverwriteWith(store, 'search/setCitySocialCuesExperiment', true)
  }

  public static async enableSearchPropertySocialCues (): Promise<void> {
    const store: VuexStore = await this.hostelworldStore()

    store.state.search.socialCuesEnabled = true
    this.onStoreCommitOverwriteWith(store, 'search/setSocialCuesEnabled', true)
  }

  public static async enableSearchUnavailableProperties (): Promise<void> {
    const store: VuexStore = await this.hostelworldStore()

    store.state.search.searchNoAvailabilityCardsEnabled = true
    this.onStoreCommitOverwriteWith(store, 'search/setUnavailabilityExclusion', { searchNoAvailabilityCards: true })
  }

  public static async enableViewPropertySocialCues (): Promise<void> {
    const store: VuexStore = await this.hostelworldStore()

    store.state.property.socialCuesEnabled = true
    this.onStoreCommitOverwriteWith(store, 'property/setSocialCuesEnabled', true)
  }

  private static async hostelworldStore (): Promise<VuexStore> {
    return <VuexStore>await waitForProperty(window, '$nuxt.$store', 15000)
  }

  private static onStoreCommitOverwriteWith (store: VuexStore, onType: string, newPayload: unknown): void {
    const originalCommit: VuexStoreCommit = store.commit

    store.commit = function (type: string, payload: unknown): void {
      return originalCommit(type, type === onType ? newPayload : payload)
    }
  }
}
