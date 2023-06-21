export interface IAppEnvironmentClientData {
  domains: string[];
  lexicon: string;
  logoUrl: string;
}

export default interface IAppEnvironment {
  installName: string;
  environment: string;
  serverTime: number;
  lexicon: string;
  logoUrl: string;
  client: IAppEnvironmentClientData;
}
