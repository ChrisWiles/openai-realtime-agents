/**
 * Determines the appropriate audio format string based on the given codec.
 * This function is intended for use in a browser environment.
 *
 * @param codec The codec string (e.g., 'PCMU', 'PCMA'). Case-insensitive.
 * @returns The corresponding audio format ('pcm16', 'g711_ulaw', or 'g711_alaw'). Defaults to 'pcm16'.
 */
export function audioFormatForCodec(
  codec: string
): 'pcm16' | 'g711_ulaw' | 'g711_alaw' {
  let audioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw' = 'pcm16';
  if (typeof window !== 'undefined') {
    const c = codec.toLowerCase();
    if (c === 'pcmu') audioFormat = 'g711_ulaw';
    else if (c === 'pcma') audioFormat = 'g711_alaw';
  }
  return audioFormat;
}

/**
 * Applies preferred audio codec settings to a WebRTC Peer Connection's audio transceivers.
 * This function can be called multiple times safely.
 *
 * @param pc The RTCPeerConnection object to configure.
 * @param codec The preferred codec string (e.g., 'opus', 'pcmu', 'pcma'). Case-insensitive.
 */
export function applyCodecPreferences(
  pc: RTCPeerConnection,
  codec: string
): void {
  try {
    const caps = (RTCRtpSender as any).getCapabilities?.('audio');
    if (!caps) return;

    const pref = caps.codecs.find(
      (c: any) => c.mimeType.toLowerCase() === `audio/${codec.toLowerCase()}`
    );
    if (!pref) return;

    pc.getTransceivers()
      .filter((t) => t.sender && t.sender.track?.kind === 'audio')
      .forEach((t) => t.setCodecPreferences([pref]));
  } catch (err) {
    console.error('[codecUtils] applyCodecPreferences error', err);
  }
}
