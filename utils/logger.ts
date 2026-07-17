/**
 * Logger mínimo y consistente para la salida de los tests.
 *
 * Centraliza el formato de los mensajes (prefijo + timestamp) para que la
 * salida en consola y en los logs del pipeline sea uniforme y legible.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function emit(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} [${level}] ${message}`;
  if (level === 'ERROR') {
    console.error(line);
  } else if (level === 'WARN') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string): void => emit('INFO', message),
  warn: (message: string): void => emit('WARN', message),
  error: (message: string): void => emit('ERROR', message),
};
