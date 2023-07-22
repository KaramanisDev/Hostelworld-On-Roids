import { waitForProperty } from 'Utils'

type HostelworldState = {
  property: {
    socialCuesEnabled: boolean
  }
}

type VuexStoreCommit = (type: string, payload: unknown) => void

type VuexStore = {
  commit: VuexStoreCommit,
  state: HostelworldState
}

export class HostelworldFeatureToggler {
  public static async enableViewPropertySocialCues (): Promise<void> {
    const store: VuexStore = await this.hostelworldStore()

    store.state.property.socialCuesEnabled = true
    this.onStoreCommitOverwriteWith(store, 'property/setSocialCuesEnabled', true)
  }

  private static async hostelworldStore (): Promise<VuexStore> {
    return await waitForProperty(window, '$nuxt.$store', 60 * 1000)
  }

  private static onStoreCommitOverwriteWith (store: VuexStore, onType: string, newPayload: unknown): void {
    const originalCommit: VuexStoreCommit = store.commit

    store.commit = function (type: string, payload: unknown): void {
      return originalCommit(type, type === onType ? newPayload : payload)
    }
  }
}
