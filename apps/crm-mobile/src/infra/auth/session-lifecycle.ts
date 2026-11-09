type SessionWrite = {
  write: () => Promise<void>;
  apply: () => void;
  clear: () => Promise<void>;
};

/** Coordinate requests and SecureStore so logout wins over an older async result. */
export class SessionLifecycle {
  private generation = 0;
  private storageQueue: Promise<void> = Promise.resolve();

  begin(): number {
    this.generation += 1;
    return this.generation;
  }

  isCurrent(operation: number): boolean {
    return this.generation === operation;
  }

  invalidate(): void {
    this.generation += 1;
  }

  private queueStorage<T>(work: () => Promise<T>): Promise<T> {
    const result = this.storageQueue.then(work);
    this.storageQueue = result.then(() => undefined, () => undefined);
    return result;
  }

  read<T>(work: () => Promise<T>): Promise<T> {
    return this.queueStorage(work);
  }

  commit(operation: number, effects: SessionWrite): Promise<boolean> {
    return this.queueStorage(async () => {
      if (!this.isCurrent(operation)) return false;

      try {
        await effects.write();
      } catch (error) {
        await effects.clear().catch(() => undefined);
        throw error;
      }

      if (!this.isCurrent(operation)) {
        // A write already in flight cannot be cancelled; remove it before a newer write.
        await effects.clear();
        return false;
      }

      effects.apply();
      return true;
    });
  }

  clearSession(clear: () => Promise<void>, reset: () => void): Promise<void> {
    this.invalidate();
    reset();
    // Any older in-flight write finishes before this clear, never after it.
    return this.queueStorage(clear);
  }
}
