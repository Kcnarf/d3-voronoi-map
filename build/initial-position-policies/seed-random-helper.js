(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.vanilla = factory());
}(this, function () { 'use strict';

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

    var seedRandomHelper = global['d3VoronoiMapSeedRandomHelper'];

    return seedRandomHelper;

}));