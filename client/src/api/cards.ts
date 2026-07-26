function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /iP(hone|od|ad)/i.test(navigator.userAgent);
}

export async function fetchCardBlob(
  params: { token?: string; order?: string; fanId?: string },
): Promise<Blob> {
  if (params.fanId) {
    const response = await fetch('/api/cards/download-by-fan-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fanId: params.fanId }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message ?? 'Impossible de télécharger la carte.');
    }

    return response.blob();
  }

  const search = new URLSearchParams();
  if (params.token) {
    search.set('token', params.token);
  }
  if (params.order) {
    search.set('order', params.order);
  }

  const response = await fetch(`/api/cards/download?${search.toString()}`);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? 'Impossible de télécharger la carte.');
  }

  return response.blob();
}

export function saveCardBlob(blob: Blob, filename = 'carte-vita.png'): void {
  const objectUrl = URL.createObjectURL(blob);

  if (isIosDevice()) {
    const opened = window.open(objectUrl, '_blank');
    if (!opened) {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function fetchAndDownloadCard(
  params: { token?: string; order?: string; fanId?: string },
  filename = 'carte-vita.png',
): Promise<void> {
  const blob = await fetchCardBlob(params);
  saveCardBlob(blob, filename);
}

export function downloadCardFromUrl(url: string, filename = 'carte-vita.png'): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function buildCardDownloadUrl(params: { token?: string; order?: string }): string {
  const search = new URLSearchParams();
  if (params.token) {
    search.set('token', params.token);
  }
  if (params.order) {
    search.set('order', params.order);
  }

  return `/api/cards/download?${search.toString()}`;
}

export type VerifiedCard = {
  valid: true;
  memberNumber: string;
  firstname: string | null;
  lastname: string | null;
  middlename: string | null;
  section: string | null;
  memberType: 'standard' | 'premium';
};

export async function verifyCard(token: string): Promise<VerifiedCard> {
  const response = await fetch(`/api/cards/verify?token=${encodeURIComponent(token)}`);
  const payload = (await response.json().catch(() => null)) as
    | { success: true; card: VerifiedCard }
    | { success: false; message?: string }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload && 'message' in payload && payload.message
        ? payload.message
        : 'Impossible de vérifier cette carte.',
    );
  }

  return payload.card;
}
