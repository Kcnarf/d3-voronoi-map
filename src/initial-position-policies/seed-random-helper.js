const SeedRandomHelper = function() {
    // Seed random from https://stackoverflow.com/a/19301306/

    // If seed is not set, we get different values every time.
    let m_w = Math.round(Math.random() * 1000000000);
    let m_z = 987654321;
    let mask = 0xffffffff;

    return {
        seed: function(i) {
            m_w = i;
            m_z = 987654321;
        },

        random: function()
        {
            m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
            m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
            let result = ((m_z << 16) + m_w) & mask;
            result /= 4294967296;
            return result + 0.5;
        }
    }
};
// Poor man's singleton. Could not get it to work any other way.
if(!global['d3VoronoiMapSeedRandomHelper']) {
    global['d3VoronoiMapSeedRandomHelper'] = new SeedRandomHelper();
}

export default global['d3VoronoiMapSeedRandomHelper'];