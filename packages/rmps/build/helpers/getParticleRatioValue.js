export default function getParticleRatioValue(particle) {
    let hash = 0;
    for (let i = 0; i < particle.id.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = (hash * 31 + particle.id.charCodeAt(i)) >>> 0;
    }
    return hash / 0xffffffff;
}
