module.exports = (api) => {
    api.cache(false);

    const presets = [
        [
            '@babel/preset-env',
            {
                modules: 'cjs',
                targets: {
                    node: 'current',
                },
            },
        ],
        '@babel/preset-typescript',
    ];

    const plugins = ['@babel/plugin-transform-runtime'];

    return {
        presets,
        plugins,
    };
};
