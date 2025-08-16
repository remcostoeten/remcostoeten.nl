export async function getCookie(name: string): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  const mod = await import("vinxi/http");
  return mod.getCookie(name);
}

export async function setCookie(name: string, value: string, options?: any): Promise<void> {
  if (typeof window !== "undefined") return;
  const mod = await import("vinxi/http");
  return mod.setCookie(name, value, options);
}

export async function deleteCookie(name: string, options?: any): Promise<void> {
  if (typeof window !== "undefined") return;
  const mod = await import("vinxi/http");
  return mod.deleteCookie(name, options);
}

