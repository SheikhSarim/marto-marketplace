export abstract class HashProvider {
  abstract hashPassword(data: string | Buffer): Promise<string>;
  abstract comparePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean>;
}
