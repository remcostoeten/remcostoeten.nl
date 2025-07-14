import nprogress from 'nprogress';

type TProgressListener = (isActive: boolean) => void;

class ProgressIndicator {
  private static instance: ProgressIndicator;
  private listeners: Set<TProgressListener> = new Set();
  private isActive = false;

  private constructor() {
    nprogress.configure({
      showSpinner: false,
      minimum: 0.1,
      easing: 'ease',
      speed: 500,
      trickleSpeed: 200,
    });
  }

  static getInstance(): ProgressIndicator {
    if (!ProgressIndicator.instance) {
      ProgressIndicator.instance = new ProgressIndicator();
    }
    return ProgressIndicator.instance;
  }

  addListener(listener: TProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isActive));
  }

  start(): void {
    if (!this.isActive) {
      this.isActive = true;
      nprogress.start();
      this.notifyListeners();
    }
  }

  stop(): void {
    if (this.isActive) {
      this.isActive = false;
      nprogress.done();
      this.notifyListeners();
    }
  }

  increment(amount?: number): void {
    if (this.isActive) {
      nprogress.inc(amount);
    }
  }

  set(progress: number): void {
    if (this.isActive) {
      nprogress.set(progress);
    }
  }

  getStatus(): boolean {
    return this.isActive;
  }
}

export function createProgressIndicator(): ProgressIndicator {
  return ProgressIndicator.getInstance();
}

export function startProgress(): void {
  createProgressIndicator().start();
}

export function stopProgress(): void {
  createProgressIndicator().stop();
}

export function incrementProgress(amount?: number): void {
  createProgressIndicator().increment(amount);
}

export function setProgress(progress: number): void {
  createProgressIndicator().set(progress);
}
