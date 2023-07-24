export type Datum = {
  id: string;
  ageRange?: string;
  countryCode: string;
  nationality: string;
  profilePictureURL: string;
}

export type HostelworldPropertyGuests = {
  data: Datum[];
  total: number;
}
