import FingerprintJS from '@fingerprintjs/fingerprintjs'

let fingerprintPromise: Promise<string> | null = null

export async function getBrowserFingerprint() {
    if (fingerprintPromise) {
        return fingerprintPromise
    }

    fingerprintPromise = FingerprintJS.load()
        .then((fp) => fp.get())
        .then((result) => result.visitorId)

    return fingerprintPromise
}
