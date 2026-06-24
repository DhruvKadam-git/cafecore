import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PosLogger extends Logger {
  debug(message: string, context?: string) {
    super.debug(message, context || 'POS');
  }

  log(message: string, context?: string) {
    super.log(message, context || 'POS');
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || 'POS');
  }

  warn(message: string, context?: string) {
    super.warn(message, context || 'POS');
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context || 'POS');
  }
}
