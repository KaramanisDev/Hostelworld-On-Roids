export type Data = {
  id: string;
  countryCode: string;
  nationality: string;
  profilePictureURL: string;
}

export type HostelworldPropertyGuests = {
  data: Data[];
  total: number;
}
