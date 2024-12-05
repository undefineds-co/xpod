import { AbstractLevel } from 'abstract-level';
import { SQLUp } from './sqlup';
import { ClassicLevel } from 'classic-level';


interface BackendOptions {
  tableName?: string;
}

export function getBackend(endpoint: string, options: BackendOptions): AbstractLevel<any, any, any> {
    const url = new URL(endpoint);
    const protocol = url.protocol;
    if (protocol === 'file:') {
      return new ClassicLevel(endpoint.replace('file:', ''));
    } else if (protocol === 'sqlite:' || protocol === 'postgresql:' || protocol === 'mysql:') {
      return new SQLUp<Uint8Array>({
        url: endpoint,
        tableName: options.tableName || 'quadstore',
      });
    }
    throw new Error(`Unsupported protocol: ${protocol}`);
  }