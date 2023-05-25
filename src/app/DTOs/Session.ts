import type { Search } from 'DTOs/Search'

export class Session {
  private latestSearch?: Search

  public getLatestSearch (): Search | undefined {
    return this.latestSearch
  }

  public updateLatestSearch (search: Search): void {
    this.latestSearch = search
  }
}
