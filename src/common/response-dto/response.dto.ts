export class ResponseDTO<T = any> {
  constructor(
    public code: number,
    public status: boolean,
    public message: string,
    public data: T,
  ) {}
}
