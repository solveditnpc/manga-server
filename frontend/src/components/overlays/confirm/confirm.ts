interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "primary" | "danger";
}

let isOpen: boolean = false;
let options: ConfirmOptions | null = null;
let resolver: ((value: boolean) => void) | null = null;

let listeners: Set<() => void> = new Set();
const notifyListeners = () => listeners.forEach((listener) => listener());

const finish = (res: boolean) => {
  if (!isOpen || !resolver) return;
  resolver(res);
  isOpen = false;
  options = null;
  resolver = null;
  notifyListeners();
};

export function ask(op: ConfirmOptions) {
  if (isOpen) return Promise.resolve(false);
  isOpen = true;
  options = op;
  notifyListeners();
  return new Promise((resolve) => {
    resolver = resolve;
  });
}

export function accept() {
  finish(true);
}
export function cancel() {
  finish(false);
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return {
    open: isOpen,
    options,
  };
}
