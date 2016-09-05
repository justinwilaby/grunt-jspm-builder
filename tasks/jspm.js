"use strict";

module.exports = function (grunt) {
    const config = require("jspm/lib/config");
    const format = require("jspm/lib/ui").format;

    // jspm for simple builds
    const jspm = require("jspm");
    jspm.setPackagePath(".");

    jspm.on('log', (type, msg) => grunt.log.writeln(format[type](msg)));

    // SystemJS Builder
    const builder = new jspm.Builder();

    const booleanUnbundle = function () {
        return (this.unbundle && jspm.unbundle()) || Promise.resolve()
    };

    const traceModulesFromFiles = function () {
        const files = this.files;
        grunt.log.writeln(grunt.log.wordlist(['Tracing expressions:'], {color: 'blue'}));
        const thenables = [];
        files.forEach(function (file) {
            const expression = file.orig.src[0].replace(/\.js/, "");
            thenables.push(builder.trace(expression).then(tree => {
                grunt.log.write(expression + '...');
                grunt.log.ok();
                return tree;

            }, grunt.fail.warn));
        });
        return Promise.all(thenables);
    };

    const bundleCommonFromTraces = function (traces) {
        grunt.log.writeln(grunt.log.wordlist(['Bundling:'], {color: 'blue'}));
        const self = this;
        const files = self.files;
        const commonBundle = self.data.commonBundle;
        const warn = traces.length < 2;
        const bundleFunc = bundle;
        let commonTree;
        try {
            commonTree = warn ? traces[0] : builder.intersectTrees(...traces);
        }
        catch (error) {
            grunt.log.write(error);
        }
        const options = self.options({
            sfx: true,
            mangle: true,
            minify: true
        });

        const bundles = [];
        if (warn) {
            const msg = grunt.log.wordlist(['Notice: ' + commonBundle.dest + ' will not be written since only 1 bundle was provided'], {color: 'yellow'});
            grunt.log.writeln(msg);
            bundles[0] = bundleFunc(commonTree, files[0].dest, options);
        }
        else {
            // Common bundle
            bundles[0] = bundleFunc(commonTree, commonBundle.dest, commonBundle.options);
            // all others
            traces.forEach((trace, index) => {
                const subtractedTree = builder.subtractTrees(trace, commonTree);
                const file = files[index];
                const bundle = bundleFunc(subtractedTree, file.dest, options);
                bundles.push(bundle);
            });
        }
        return Promise.all(bundles);
    };

    const bundle = (expressionOrTree, dest, options) => {
        return builder.bundle(expressionOrTree, dest, options).then(bundle => {
            grunt.log.write(dest + '...');
            grunt.log.ok();

            if (options.inject) {
                if (!config.loader.bundles) {
                    config.loader.bundles = {};
                }
                config.loader.bundles[dest] = bundle.modules;
            }
            return bundle;
        }, grunt.fail.warn);
    };

    grunt.registerMultiTask("jspm", "Bundle JSPM", function () {
        const self = this;
        const options = self.options({
            sfx: true,
            mangle: true,
            minify: true
        });

        if (options.inject) {
            options.injectConfig = true;
        }
        const data = self.data;

        const bundle = options.sfx ? "bundleSFX" : "bundle";
        const buildCommon = Boolean(data.commonBundle);

        if (buildCommon) {
            const done = self.async();
            if (bundle === 'bundleSFX') {
                grunt.fail.warn('bundleSFX is not supported when creating a common bundle.');
            }
            grunt.log.writeln(grunt.log.wordlist(['Building common bundle...'], {color: 'green'}));

            config.load()
                .then(booleanUnbundle.bind(options))
                .then(traceModulesFromFiles.bind(self))
                .then(bundleCommonFromTraces.bind(self))
                .then(config.save)
                .then(done);
        }
        // Simple build - Use jspm
        else {
            const thenables = [];
            const done = self.async();
            self.files.forEach(file => {
                const moduleExpression = file.orig.src[0].replace(/\.js/, "");
                thenables.push(jspm[bundle](moduleExpression, file.dest, options));
            });
            Promise.all(thenables).then(done, grunt.fail.warn);
        }
    });
};
