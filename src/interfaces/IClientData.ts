interface IClientDomain {
  id: number;
  host: string | any;
}

export default interface IClientData {
  id: number;
  clientDomains: IClientDomain[];
  logoUrl: string;
  name: string;
}
