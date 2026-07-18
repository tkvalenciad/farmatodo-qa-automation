export class ApiError extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
    readonly step: string,
    readonly body?: string,
  ) {
    const details =
      `Fallo en la petición a la PokéAPI.\n` +
      `  Paso:      ${step}\n` +
      `  URL:       ${url}\n` +
      `  Código:    ${status} (se esperaba 200)` +
      (body ? `\n  Respuesta: ${body.slice(0, 300)}` : '');
    super(details);
    this.name = 'ApiError';
  }
}
