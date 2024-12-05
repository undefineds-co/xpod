import { QuadstoreSparqlDataAccessor } from './QuadstoreSparqlDataAccessor';
import type { DataAccessor, IdentifierStrategy } from '@solid/community-server';
import type { Representation } from '@solid/community-server/dist/http/representation/Representation';
import type { ResourceIdentifier } from '@solid/community-server/dist/http/representation/ResourceIdentifier';
import { INTERNAL_QUADS } from '@solid/community-server/dist/util/ContentTypes';
import type { RepresentationMetadata } from '@solid/community-server/dist/http/representation/RepresentationMetadata';
import type { Guarded } from '@solid/community-server/dist/util/GuardedStream';
import type { Readable } from 'stream';


export class MixDataAccessor extends QuadstoreSparqlDataAccessor {
  private readonly unstructuredDataAccessor: DataAccessor;

  constructor(
    endpoint: string,
    identifierStrategy: IdentifierStrategy,
    unstructuredDataAccessor: DataAccessor,
  ) {
    super(endpoint, identifierStrategy);
    this.unstructuredDataAccessor = unstructuredDataAccessor;
  }

  /**
   * This accessor does support all types of data.
   */
  public override async canHandle(identifier: Representation): Promise<void> {
    return void 0;
  }

  /**
   * Checks if the given representation is unstructured.
   */
  private async isUnstructured(metadata: RepresentationMetadata): Promise<boolean> {
    this.logger.debug(`isUnstructured: ${metadata.contentType}`)
    return metadata.contentType !== INTERNAL_QUADS;
  }

  public override async getData(identifier: ResourceIdentifier): Promise<Guarded<Readable>> {
    const metadata = await this.getMetadata(identifier);
    if (await this.isUnstructured(metadata)) {
      return this.unstructuredDataAccessor.getData(identifier);
    }
    return super.getData(identifier);
  }

  public override async writeContainer(
    identifier: ResourceIdentifier,
    metadata: RepresentationMetadata,
  ): Promise<void> {
    if (await this.isUnstructured(metadata)) {
      await this.unstructuredDataAccessor.writeContainer(identifier, metadata);
    }
    await super.writeContainer(identifier, metadata);
  }

  public override async writeDocument(
    identifier: ResourceIdentifier,
    data: Guarded<Readable>,
    metadata: RepresentationMetadata,
  ): Promise<void> {
    if (await this.isUnstructured(metadata)) {
      return this.unstructuredDataAccessor.writeDocument(identifier, data, metadata);
    } else {
      return super.writeDocument(identifier, data, metadata);
    }
  }

  public override async deleteResource(identifier: ResourceIdentifier): Promise<void> {
    await this.unstructuredDataAccessor.deleteResource(identifier);
    return super.deleteResource(identifier);
  }
}
