/**
 * Contact Actions Utility for Everlight Homes Bahir Dar
 * 
 * - Phone Handling:
 *   - Mobile Phones: Automatically triggers native phone dialer (tel:+251937762030).
 *   - PC / Desktop: Prevents system dialer/Phone Link popups and optionally copies number to clipboard.
 * 
 * - Email Handling:
 *   - Mobile Phones: Opens native email app (Gmail / Apple Mail) with pre-filled subject.
 *   - PC / Desktop: Opens Gmail web compose in a new tab with To & Subject pre-filled so users can immediately write and send messages.
 */

export const BROKER_PHONE = "+251937762030";
export const BROKER_PHONE_DISPLAY = "+251 937 762 030";
export const BROKER_EMAIL = "mimisha1513@gmail.com";

/**
 * Detects whether the user is on a mobile phone / handheld device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent =
    navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isNarrowScreen = window.innerWidth <= 820;

  return isMobileUA || (hasTouch && isNarrowScreen);
}

/**
 * Handle phone click:
 * - On Mobile: launches phone dialer via tel:
 * - On PC / Desktop: prevents dialing app from opening (no-op / copies to clipboard)
 */
export function handlePhoneClick(
  e: React.MouseEvent<HTMLElement>,
  onCopied?: (text: string) => void
) {
  if (isMobileDevice()) {
    // Mobile phone: directly open device phone dialer
    window.location.href = `tel:${BROKER_PHONE}`;
  } else {
    // PC / Desktop: prevent opening FaceTime / Skype / Phone Link
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(BROKER_PHONE_DISPLAY).catch(() => {});
    }
    if (onCopied) {
      onCopied(BROKER_PHONE_DISPLAY);
    }
  }
}

/**
 * Handle email click:
 * - On Mobile: triggers mailto: with pre-filled subject to open phone's email app (Gmail, Apple Mail, etc.)
 * - On PC / Desktop: opens web Gmail compose in a new tab so user can write and send immediately
 */
export function handleEmailClick(
  e: React.MouseEvent<HTMLElement>,
  subject = "Everlight Homes Rental Inquiry (Bahir Dar)"
) {
  const encodedSubject = encodeURIComponent(subject);
  const encodedEmail = encodeURIComponent(BROKER_EMAIL);
  const webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}`;
  const mailtoUrl = `mailto:${BROKER_EMAIL}?subject=${encodedSubject}`;

  if (isMobileDevice()) {
    // Mobile: open native email app
    window.location.href = mailtoUrl;
  } else {
    // PC / Desktop: open web Gmail compose in new tab directly
    e.preventDefault();
    window.open(webGmailUrl, "_blank", "noopener,noreferrer");
  }
}

